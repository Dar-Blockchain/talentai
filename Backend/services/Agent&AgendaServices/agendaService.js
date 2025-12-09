const Agenda = require("agenda");
const Agent = require("../../models/AgentModel");
const JobPost = require("../../models/PostModel");
const Profile = require("../../models/ProfileModel");
const AgentConfig = require("../../models/AgentConfigModel");
const {
  calculateMatchScore,
} = require("../MatchingService/matchingForBidService");
const axios = require("axios");
const profileService = require("../../services/profileService/profileService");
const {
  submitEvaluationMessage,
} = require("../../controllers/hrAgentController");

let agendaInstance;
let isInitialized = false;
let lastHeartbeatAt = null;
let countdownInterval = null;
let hasWarnedForCurrentCycle = false;

// Utility to normalize skill names
function normalizeSkillName(name) {
  if (!name) return "";
  const part = name.split(".")[0].trim();
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

async function computeMatches(jobPostId, idCompany) {
  console.log(`\n=== MATCHING STARTED ===`);
  console.log(`Job: ${jobPostId} | Company: ${idCompany}`);
  const candidates = await Profile.find({ type: "Candidate" })
    .populate("userId", "username email")
    .populate("companyBid.company", "username email")
    .select(
      "userId skills companyDetails.name companyBid expectedSalary workModePreference preferredContractType softSkills"
    )
    .lean();

  const jobPost = await JobPost.findById(jobPostId)
    .select("skillAnalysis jobDetails")
    .lean();

  if (!jobPost || !jobPost.skillAnalysis) return [];

  const requiredSkills = (jobPost.skillAnalysis.requiredSkills || [])
    .filter((s) => s && s.name)
    .map((s) => ({ ...s, name: normalizeSkillName(s.name) }));

  console.log(
    `JobTitle: ${jobPost.jobDetails?.title || "Unknown"} | Required: ${
      requiredSkills.map((s) => s.name).join(", ") || "None"
    } | Salary: ${jobPost.jobDetails?.salary?.min || "-"}-${
      jobPost.jobDetails?.salary?.max || "-"
    } ${jobPost.jobDetails?.salary?.currency || ""} | Loc: ${
      jobPost.jobDetails?.location || "N/A"
    } | Type: ${jobPost.jobDetails?.employmentType || "N/A"}`
  );

  const matchesPromises = candidates.map(async (candidate) => {
    if (!candidate.userId) return null;

    const candidateSkills = (candidate.skills || [])
      .filter((s) => s && s.name)
      .map((s) => ({ ...s, name: normalizeSkillName(s.name) }));

    const score = await calculateMatchScore(
      requiredSkills,
      candidateSkills,
      { ...jobPost.jobDetails, skillAnalysis: jobPost.skillAnalysis },
      candidate,
      idCompany,
      jobPostId
    );

    if (score && score > 0)
      console.log(` - ${candidate.userId.username}: ${score}`);

    if (!score || score === 0) return null;

    return {
      candidateId: candidate.userId._id,
      name: candidate.userId.username || "Anonymous",
      score,
      finalBid: candidate.companyBid?.finalBid || null,
      biddingCompany: candidate.companyBid?.company?.username || null,
      matchedSkills: candidateSkills.filter((cs) =>
        requiredSkills.some((rs) => rs.name === cs.name)
      ),
      requiredSkills,
    };
  });

  const matches = (await Promise.all(matchesPromises))
    .filter((m) => m)
    .sort((a, b) => b.score - a.score);

  console.log(`=== RESULT: ${matches.length} match(es) found ===\n`);

  return { jobTitle: jobPost.jobDetails?.title || "Unknown", matches };
}

async function initializeAgenda() {
  if (isInitialized) return agendaInstance;

  agendaInstance = new Agenda({
    db: { address: process.env.MONGODB_URI, collection: "agendaJobs" },
    processEvery: "1 second", // Check every second for precision
  });

  // Logs for observability of Agenda jobs
  agendaInstance.on("start", (job) => {
    console.log(
      `▶️  [Agenda] Job started: ${job.attrs.name} (id=${job.attrs._id})`
    );
  });
  agendaInstance.on("success", (job) => {
    console.log(`✅ [Agenda] Job succeeded: ${job.attrs.name}`);
  });
  agendaInstance.on("fail", (err, job) => {
    console.error(
      `❌ [Agenda] Job failed: ${job?.attrs?.name} → ${err?.message}`
    );
  });

  agendaInstance.define(
    "agent:heartbeat",
    { concurrency: 1, lockLifetime: 30000 },
    async () => {
      try {
        console.log("🔄 [Agenda] Heartbeat started");
        lastHeartbeatAt = new Date();
        hasWarnedForCurrentCycle = false;

        const agents = await Agent.find({}, { _id: 1, name: 1, postId: 1 })
          .populate({ path: "postId", select: "jobDetails user" })
          .lean();

        if (!agents || agents.length === 0) {
          console.log("🔄 [Agenda] No agents found");
          return;
        }

        let totalMatches = 0;
        for (const agent of agents) {
          const agentLabel = agent.name || agent._id?.toString();

          if (!agent.postId?._id) {
            console.log(`⚠️  [Agenda] Agent ${agentLabel} without postId`);
            continue;
          }

          // Load agent manual configuration
          const agentConfig = await AgentConfig.findOne({
            agentId: agent._id,
          }).lean();
          if (!agentConfig) {
            console.warn(
              `⚠️  [Agenda] No configuration found for agent ${agentLabel}. Skipping this agent (no default values).`
            );
            continue; // If no config exists, skip this agent entirely as requested
          }

          // Configuration values (require explicit values in agentConfig — no defaults)
          const thresholdPercent = agentConfig.thresholdPercent;
          const bidBudgetMin = agentConfig.bidBudgetMin;
          const bidBudgetMax = agentConfig.bidBudgetMax;
          const bidStep = agentConfig.bidStep;
          const maxCandidatesToBid = agentConfig.maxCandidatesToBid;
          const autoSubmitTopMatch = agentConfig.autoSubmitTopMatch;
          const maxDailySpending = agentConfig.maxDailySpending;

          const { jobTitle, matches } = await computeMatches(
            agent.postId._id,
            agent.postId.user
          );
          totalMatches += matches.length;

          // Log only if there are matches or errors
          if (matches.length > 0) {
            console.log(
              `✅ [Agenda] Agent ${agentLabel} | Job: ${jobTitle} | ${matches.length} candidate(s) matched | Config: threshold=${thresholdPercent}%, maxBid=${maxCandidatesToBid}`
            );
            console.log(
              `   #1 Name: ${matches[0].name} | Score: ${matches[0].score} | FinalBid: ${matches[0].finalBid} | ID: ${matches[0].candidateId}`
            );

            // --- Send POST and bid for top matches respecting threshold ---
            const topMatches = matches
              .filter((m) => m.score >= thresholdPercent)
              .slice(0, maxCandidatesToBid);

            if (topMatches.length === 0) {
              console.log(
                `⚠️ [Agenda] No candidate with score >= ${thresholdPercent}% for agent ${agentLabel}`
              );
            } else {
              for (let idx = 0; idx < topMatches.length; idx++) {
                const topMatch = topMatches[idx];

                // 🔧 Calculate bid with bidStep increment if necessary
                const currentFinalBid = topMatch.finalBid
                  ? Number(topMatch.finalBid)
                  : 0;
                // If bid exists, add bidStep; otherwise, start with bidBudgetMin
                const nextBid =
                  currentFinalBid > 0
                    ? currentFinalBid + bidStep
                    : bidBudgetMin;
                // Respect [min, max] limits
                const bidAmount = Math.max(
                  bidBudgetMin,
                  Math.min(bidBudgetMax, nextBid)
                );

                // 💰 Check if spending ceiling is reached
                if (bidAmount >= bidBudgetMax && nextBid > bidBudgetMax) {
                  console.warn(
                    `⚠️  [Agenda] Spending ceiling reached for agent ${agentLabel} (calculated bid: ${nextBid}, ceiling: ${bidBudgetMax}). Candidate ${topMatch.name} cannot be bid on.`
                  );
                  continue; // Move to next candidate
                }

                try {
                  // Submit evaluation message if autoSubmitTopMatch is enabled
                  if (autoSubmitTopMatch) {
                    try {
                      await submitEvaluationMessage({
                        body: {
                          agentAId: agent._id,
                          agentBId: "68c2e127bf5357b2404443c2",
                          candidateId: topMatch.candidateId,
                          postId: agent.postId._id,
                          message: `Candidate review request (Score: ${topMatch.score}%, Bid: $${bidAmount})`,
                          bidAmount: bidAmount,
                        },
                      });
                      console.log(
                        `📤 [Agenda] Message sent for candidate ${topMatch.name} (score ${topMatch.score}%, bid $${bidAmount})`
                      );
                    } catch (err) {
                      console.error(
                        `ℹ️ [Agenda] Failed to send message for candidate ${topMatch.name}:`,
                        err.message
                      );
                    }
                  }

                  // Update final bid
                  try {
                    const updatedProfile = await profileService.updateFinalBid(
                      topMatch.candidateId?.toString(),
                      bidAmount,
                      agent._id?.toString(),
                      agent.postId._id?.toString()
                    );

                    console.log(
                      `📈 [Agenda] Bid updated ✔ Candidate: ${topMatch.name} | Score: ${topMatch.score}% | New Bid: $${bidAmount} → FinalBid saved: $${updatedProfile.companyBid.finalBid}`
                    );
                  } catch (err) {
                    const errorMsg = err.response?.data?.message || err.message;

                    // If it's an error of "bid already made by this company", it's normal and we continue
                    if (
                      errorMsg &&
                      errorMsg.includes(
                        "cannot bid again if your company made the last bid"
                      )
                    ) {
                      console.info(
                        `ℹ️ [Agenda] Agent ${agentLabel} has already bid for candidate ${topMatch.name}. Moving to next candidate.`
                      );
                    } else {
                      console.error(
                        `ℹ️ [Agenda] Failed updateFinalBid for candidate ${topMatch.name}:`,
                        errorMsg
                      );
                    }
                  }
                } catch (err) {
                  console.error(
                    `❌ [Agenda] Error processing candidate ${topMatch.name}:`,
                    err.message
                  );
                }
              }
            }
          }
        }

        // Summary log only
        console.log(
          `🔄 [Agenda] Heartbeat completed - ${agents.length} agent(s) processed, ${totalMatches} total match(es)`
        );
      } catch (err) {
        console.error("❌ [Agenda] Heartbeat error:", err.message);
      }
    }
  );

  agendaInstance.on("ready", async () => {
    await agendaInstance.start();
    // Clean up old schedules to avoid duplicates
    try {
      const removed = await agendaInstance.cancel({ name: "agent:heartbeat" });
      if (removed > 0) {
        console.log(
          `🧹 [Agenda] ${removed} old schedule(s) removed for agent:heartbeat`
        );
      }
    } catch (e) {
      console.warn(
        "⚠️  [Agenda] Failed to clean up old schedules:",
        e?.message
      );
    }

    // Schedule job: every day at 00:00 (midnight) in configured timezone
    await agendaInstance.every(
      "0 0 * * *",
      "agent:heartbeat",
      {},
      {
        timezone: process.env.TZ || "Europe/Paris",
        skipImmediate: false,
        unique: { name: "agent:heartbeat" },
        insertOnly: true,
      }
    );
    await agendaInstance.now("agent:heartbeat");
    console.log("⏱️ Agenda started with agent:heartbeat scheduled daily at 00:00 (timezone: " + (process.env.TZ || "Europe/Paris") + ")");

    // Verification: list scheduled jobs
    try {
      const jobs = await agendaInstance.jobs({ name: "agent:heartbeat" });
      if (jobs?.length) {
        const nexts = jobs
          .map((j) => ({
            id: j.attrs._id?.toString(),
            nextRunAt: j.attrs.nextRunAt,
            lastRunAt: j.attrs.lastRunAt,
            lockedAt: j.attrs.lockedAt,
            repeatInterval: j.attrs.repeatInterval,
            timezone: j.attrs.timezone,
          }))
          .sort((a, b) => (a.nextRunAt || 0) - (b.nextRunAt || 0));
        console.log(
          `🗓️  [Agenda] ${jobs.length} schedule(s) planned for agent:heartbeat`
        );
        nexts.slice(0, 3).forEach((n, idx) => {
          console.log(
            `   • [${idx + 1}] id=${n.id} nextRunAt=${n.nextRunAt} lastRunAt=${
              n.lastRunAt
            } lockedAt=${n.lockedAt} repeatInterval=${n.repeatInterval} tz=${
              n.timezone
            }`
          );
        });
        // If there are duplicates, keep only the first one and remove others
        if (jobs.length > 1) {
          try {
            const toRemoveIds = jobs.slice(1).map((j) => j.attrs._id);
            const removedDup = await agendaInstance.cancel({
              _id: { $in: toRemoveIds },
            });
            console.log(
              `🧽 [Agenda] Duplicates cleaned: ${removedDup} job(s) removed`
            );
          } catch (e) {
            console.warn(
              "⚠️  [Agenda] Failed to clean up duplicates:",
              e?.message
            );
          }
        }
      } else {
        console.warn(
          "⚠️  [Agenda] No agent:heartbeat job found scheduled right after startup"
        );
      }
    } catch (e) {
      console.warn("⚠️  [Agenda] Unable to list scheduled jobs:", e?.message);
    }

    // Countdown timer (for daily schedule)
    if (!countdownInterval) {
      countdownInterval = setInterval(() => {
        if (!lastHeartbeatAt) return;
        // Next expected at lastHeartbeat + 24 hours
        const nextExpectedAt = lastHeartbeatAt.getTime() + 24 * 60 * 60 * 1000; // +24 hours
        const remainingMs = nextExpectedAt - Date.now();
        const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

        // Display every minute, more frequently in the last minute
        if (remainingSeconds % 60 === 0 || remainingSeconds <= 60) {
          const hours = Math.floor(remainingSeconds / 3600);
          const minutes = Math.floor((remainingSeconds % 3600) / 60);
          const seconds = remainingSeconds % 60;
          process.stdout.write(`\r🕒 Next heartbeat in: ${hours}h ${minutes}m ${seconds}s `);
        }

        // Watchdog: restart if not executed after 24h + 2s
        if (remainingMs < -2000 && !hasWarnedForCurrentCycle) {
          console.warn("\n⚠️  [Agenda] No heartbeat detected (>24h2s). Restarting...");
          hasWarnedForCurrentCycle = true;
          agendaInstance.now("agent:heartbeat").catch((e) => {
            console.error("❌ [Agenda] Restart failed:", e?.message);
          });
        }
      }, 60000); // tick every minute
    }
  });

  agendaInstance.on("error", (err) => {
    console.error("❌ Agenda error:", err);
  });

  isInitialized = true;
  return agendaInstance;
}

module.exports = { initializeAgenda };
