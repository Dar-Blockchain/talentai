/**
 * Persists a completed campaign interview session to MongoDB: resolves the
 * CampaignParticipant (authenticated employee, anonymous token, or link
 * token), upserts the CampaignResponse with score/summary/transcript/report,
 * and marks the participant COMPLETED.
 */

const mongoose = require("mongoose");
const CampaignResponse = require("../../campaigns/campaign-response.model");
const CampaignParticipant = require("../../campaigns/campaign-participant.model");

async function persistResults(session, finalReport) {
    const { campaignId, candidateId, moduleType, conversation = [], coverage } = session;

    if (!campaignId || !candidateId) {
      console.warn("âš ï¸ [CampaignInterview] Missing campaignId or candidateId â€” skipping persist");
      return;
    }

    // Resolve the CampaignParticipant. candidateId may be a real User _id (authenticated
    // employee) OR an anonymous/link token (ANONYMOUS-mode or unauthenticated LINK access)
    // — mirrors the resolution order already proven in campaign.controller.js's
    // exports.getParticipantResults.
    const candidateIsObjectId = mongoose.Types.ObjectId.isValid(candidateId);

    let participant = null;
    if (candidateIsObjectId) {
      participant = await CampaignParticipant.findOne({ campaign: campaignId, employee: candidateId });
    }
    if (!participant) {
      participant = await CampaignParticipant.findOne({ campaign: campaignId, anonymousToken: candidateId });
    }
    if (!participant) {
      participant = await CampaignParticipant.findOne({ campaign: campaignId, linkAccessToken: candidateId });
    }

    if (!participant) {
      if (!candidateIsObjectId) {
        console.warn(`⚠️ [CampaignInterview] No participant found for anonymous/link candidateId=${candidateId}, campaign=${campaignId} — skipping persist`);
        return;
      }
      console.warn(`⚠️ [CampaignInterview] No participant found for campaign=${campaignId} employee=${candidateId} — upserting`);
      participant = await CampaignParticipant.findOneAndUpdate(
        { campaign: campaignId, employee: candidateId },
        { $setOnInsert: { campaign: campaignId, employee: candidateId, status: 'IN_PROGRESS' } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }


    const aiScore   = typeof finalReport.overallScore === "number" ? Math.round(finalReport.overallScore) : null;
    const aiSummary = finalReport.summary ?? null;

    const interviewTranscript = conversation
      .filter(e => e.type === "interviewer" || e.type === "candidate")
      .map(e => ({
        role:      e.type === "interviewer" ? "agent" : "candidate",
        message:   e.content || "",
        timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
      }));

    const $setData = {
      campaign:            campaignId,
      participant:         participant._id,
      moduleType,
      aiScore,
      aiSummary,
      interviewTranscript,
      aiReport: {
        strengths:            Array.isArray(finalReport.strengths) ? finalReport.strengths : [],
        areasForImprovement:  Array.isArray(finalReport.areasForImprovement) ? finalReport.areasForImprovement : [],
        recommendation:       finalReport.recommendation ?? null,
      },
    };

    if (moduleType === "SKILL_TEST") {
      const coverageAreas = coverage?.areas ?? {};
      const breakdown = Object.entries(finalReport.coverageSummary ?? {}).map(([area, score]) => ({
        area,
        label: coverageAreas[area]?.label ?? area,
        score: Math.round(Number(score) || 0),
      }));

      $setData.testResults = {
        score:    aiScore,
        maxScore: 100,
        breakdown,
      };
    } else {
      const breakdown = [
        { area: "communication", label: "Communication", score: finalReport.communicationScore ?? null },
        { area: "confidence",    label: "Confidence",    score: finalReport.confidenceScore    ?? null },
        { area: "clarity",       label: "Clarity",       score: finalReport.clarityScore       ?? null },
        { area: "engagement",    label: "Engagement",    score: finalReport.engagementScore    ?? null },
      ].filter(b => b.score !== null);

      $setData.testResults = {
        score:    aiScore,
        maxScore: 100,
        breakdown,
      };
    }


    const savedResponse = await CampaignResponse.findOneAndUpdate(
      { campaign: campaignId, participant: participant._id, moduleType },
      { $set: $setData },
      { upsert: true, new: true, runValidators: false },
    );


    participant.status         = "COMPLETED";
    participant.completedAt    = new Date();
    participant.moduleProgress = {
      moduleType,
      status:      "COMPLETED",
      completedAt: new Date(),
      responseRef: savedResponse._id,
    };

    await participant.save();

}

module.exports = { persistResults };
