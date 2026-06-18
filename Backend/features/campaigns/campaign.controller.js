require("dotenv").config();
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const InternalCampaign = require("./campaign.model");
const CampaignParticipant = require("./campaign-participant.model");
const CampaignResponse = require("./campaign-response.model");
const CompanyMembership = require("../../models/CompanyMembership.model");
const Profile = require("../users/profile.model");
const User = require("../users/user.model");
const bedrock = require("../../helpers/bedrock.helpers");
const { sendCampaignInvitation } = require("../../utils/email-service");

const {
  createCampaign,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  getCampaignsByCompanyPaginated,
  getCampaignMetrics,
  updateCampaignStatus,
} = require("./campaign.service");

const MODULE_LABELS = {
  QUESTIONNAIRE: "Questionnaire",
  AI_INTERVIEW: "AI Interview",
  SKILL_TEST: "Skill Test",
  TRAINING_PATH: "Training Path",
};

const verifyOwnership = async (campaignId, companyId, userId) => {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) {
    const error = new Error("Campaign not found");
    error.status = 404;
    throw error;
  }
  const campaignCompanyId = campaign.company?._id ?? campaign.company;
  const campaignCreatedBy  = campaign.createdBy?._id  ?? campaign.createdBy;
  const isCompanyMatch = campaignCompanyId && campaignCompanyId.toString() === companyId.toString();
  const isCreator      = userId && campaignCreatedBy && campaignCreatedBy.toString() === userId.toString();
  if (!isCompanyMatch && !isCreator) {
    const error = new Error("Unauthorized: You can only manage your own campaigns");
    error.status = 403;
    throw error;
  }
  return campaign;
};

exports.createInternalCampaign = async (req, res) => {
  try {
    const {
      title, type, description, anonymityMode, module,
      accessMethod, targetDepartment, targetEmployeeCount, deadline, skill, participants,
    } = req.body;
    const companyId = req.auth?.companyId || req.user._id;

    if (!title || !anonymityMode || !module || typeof module !== "object" || !module.type || !accessMethod) {
      return res.status(400).json({ success: false, error: "Missing required fields: title, anonymityMode, module, accessMethod" });
    }

    const linkToken = (accessMethod === "LINK" || accessMethod === "BOTH") ? randomUUID() : null;
    const campaign = await createCampaign({
      company: companyId, title, type, description, anonymityMode, module,
      accessMethod, targetDepartment, targetEmployeeCount, deadline,
      skill: skill || "", linkToken, createdBy: req.actualUser?._id || req.user._id,
    });

    if (Array.isArray(participants) && participants.length > 0) {
      try {
        const isAnonymous = campaign.anonymityMode === "ANONYMOUS";
        const users = await User.find({ _id: { $in: participants } }).select("_id email");
        const userEmailMap = users.reduce((acc, u) => { acc[u._id.toString()] = u.email; return acc; }, {});

        const participantData = participants.map((employeeId) => ({
          campaign: campaign._id,
          employee: employeeId,
          email: userEmailMap[employeeId.toString()] || null,
          ...(isAnonymous ? { anonymousToken: randomUUID() } : {}),
          status: "INVITED",
        }));
        const created = await CampaignParticipant.insertMany(participantData);

        const emailable = campaign.status === "ACTIVE" ? created.filter((p) => p.email) : [];
        if (emailable.length > 0) {
          (async () => {
            try {
              const userIds = emailable.map((p) => p.employee).filter(Boolean);
              const [profiles, companyProfile] = await Promise.all([
                Profile.find({ userId: { $in: userIds } }).select("userId firstName lastName").lean(),
                Profile.findOne({ userId: companyId }).select("companyDetails.name").lean(),
              ]);
              const profileMap = profiles.reduce((acc, p) => {
                acc[p.userId.toString()] = [p.firstName, p.lastName].filter(Boolean).join(" ") || "Participant";
                return acc;
              }, {});
              const companyName = companyProfile?.companyDetails?.name || "Your company";
              const assessmentLink = `${process.env.BASE_URL}/employee/campaigns/${campaign._id}/assessment`;
              const deadlineStr = deadline
                ? new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                : null;
              const results = await Promise.allSettled(
                emailable.map((p) =>
                  sendCampaignInvitation(p.email, {
                    participantName: profileMap[p.employee?.toString()] || "Participant",
                    companyName, campaignTitle: title,
                    moduleLabel: MODULE_LABELS[module?.type] || module?.type || "Assessment",
                    deadline: deadlineStr, campaignDescription: description || null, assessmentLink,
                  }).then((sent) => sent && CampaignParticipant.findByIdAndUpdate(p._id, { invitationSentAt: new Date() }))
                )
              );
              console.log(`📧 Campaign invitation emails sent: ${results.filter((r) => r.status === "fulfilled").length}/${emailable.length}`);
            } catch (err) {
              console.warn("⚠️ Campaign bulk invitation emails failed:", err.message);
            }
          })();
        }

        campaign.participants = created.map((p) => p._id);
        await campaign.save();
      } catch (err) {
        console.warn(`⚠️ Warning: Failed to create some participants: ${err.message}`);
      }
    }

    res.status(201).json({ success: true, message: "Campaign created successfully", data: campaign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCompanyCampaigns = async (req, res) => {
  try {
    const companyId = req.auth?.companyId || req.user._id;
    const { status, type, targetDepartment, title, search, period, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (targetDepartment) filters.targetDepartment = targetDepartment;
    const searchTerm = (search || title || "").trim();
    if (searchTerm) filters.title = { $regex: searchTerm, $options: "i" };
    const periodMap = { "7d": 7, "30d": 30, "3m": 90, "6m": 180, "1y": 365 };
    if (period && periodMap[period]) {
      filters.createdAt = { $gte: new Date(Date.now() - periodMap[period] * 86_400_000) };
    }

    const result = await getCampaignsByCompanyPaginated(companyId, pageNum, limitNum, filters);
    const campaignsWithCount = await Promise.all(
      result.data.map(async (campaign) => ({
        ...campaign.toObject(),
        targetEmployeeCount: await CampaignParticipant.countDocuments({ campaign: campaign._id }),
      }))
    );

    res.status(200).json({ success: true, data: campaignsWithCount, pagination: result.pagination });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { userId } = req.query;
    const campaign = await getCampaignById(campaignId);
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });

    let data = campaign.toObject ? campaign.toObject() : { ...campaign };
    const [participantCount, sessionCount] = await Promise.all([
      CampaignParticipant.countDocuments({ campaign: campaignId }),
      CampaignParticipant.countDocuments({ campaign: campaignId, status: "COMPLETED" }),
    ]);
    data.participantCount = participantCount;
    data.sessionCount = sessionCount;

    if (userId) {
      const participant = await CampaignParticipant.findOne(
        { campaign: campaignId, employee: userId },
        { status: 1, completedAt: 1 },
      ).lean();
      data.participantStatus = participant?.status ?? null;
      data.completedAt = participant?.completedAt ?? null;
      if (participant?.status === "COMPLETED") {
        const response = await CampaignResponse.findOne({ campaign: campaignId, participant: participant._id }, { aiScore: 1 }).lean();
        data.score = response?.aiScore ?? null;
      }
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCampaignParticipants = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status, search, page = 1, limit = 10 } = req.query;
    const campaign = await getCampaignById(campaignId);
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    const campaignObjectId = new mongoose.Types.ObjectId(campaignId);

    const pipeline = [
      { $match: { campaign: campaignObjectId, ...(status && { status }) } },
      { $lookup: { from: "users", localField: "employee", foreignField: "_id", as: "employee" } },
      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "profiles", localField: "employee._id", foreignField: "userId", as: "employee.profile" } },
      { $unwind: { path: "$employee.profile", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "companymemberships", localField: "employee._id", foreignField: "user", as: "employee.companyMembership" } },
      { $unwind: { path: "$employee.companyMembership", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "departments", localField: "employee.companyMembership.department", foreignField: "_id", as: "employee.companyMembership.department" } },
      { $unwind: { path: "$employee.companyMembership.department", preserveNullAndEmptyArrays: true } },
      ...(search ? [{ $match: { $or: [
        { "employee.profile.firstName": { $regex: search, $options: "i" } },
        { "employee.profile.lastName": { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { "employee.email": { $regex: search, $options: "i" } },
        { providerName: { $regex: search, $options: "i" } },
      ]}}] : []),
      { $sort: { createdAt: -1 } },
      { $lookup: { from: "campaignresponses", let: { participantId: "$_id" }, pipeline: [
        { $match: { $expr: { $eq: ["$participant", "$$participantId"] } } },
        { $project: { _id: 0, aiScore: 1 } },
      ], as: "response" } },
      { $addFields: { score: { $cond: { if: { $eq: ["$status", "COMPLETED"] }, then: { $ifNull: [{ $arrayElemAt: ["$response.aiScore", 0] }, null] }, else: null } } } },
      { $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limitNum }, { $project: {
          _id: 1, status: 1, score: 1, createdAt: 1, updatedAt: 1, email: 1, providerName: 1, linkAccessToken: 1,
          "employee._id": 1, "employee.email": 1, "employee.username": 1,
          "employee.profile.firstName": 1, "employee.profile.lastName": 1,
          "employee.companyMembership.role": 1,
          "employee.companyMembership.department._id": 1,
          "employee.companyMembership.department.name": 1,
        }}],
      }},
    ];

    const result = await CampaignParticipant.aggregate(pipeline);
    const totalParticipants = result[0]?.metadata[0]?.total || 0;
    const formatted = (result[0]?.data || []).map((p) => {
      const hasEmployee = !!p.employee?._id;
      const firstName = hasEmployee ? p.employee?.profile?.firstName || p.employee?.username || "Unknown" : p.providerName || "Unknown";
      const lastName = hasEmployee ? p.employee?.profile?.lastName || "" : "";
      const department = p.employee?.companyMembership?.department
        ? { id: p.employee.companyMembership.department._id, name: p.employee.companyMembership.department.name }
        : null;
      return {
        _id: p._id, employeeId: p.employee?._id || null, firstName, lastName,
        email: p.email || p.employee?.email || null, role: p.employee?.companyMembership?.role || null,
        department, status: p.status, score: p.score ?? null, createdAt: p.createdAt, updatedAt: p.updatedAt,
      };
    });

    res.status(200).json({ success: true, data: { total: totalParticipants, page: pageNum, limit: limitNum, pages: Math.ceil(totalParticipants / limitNum), data: formatted } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateInternalCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const actorId = req.auth?.companyId || req.user._id;
    await verifyOwnership(campaignId, actorId, req.user._id);
    const updatedCampaign = await updateCampaign(campaignId, req.body);
    res.status(200).json({ success: true, message: "Campaign updated successfully", data: updatedCampaign });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

exports.deleteInternalCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const actorId = req.auth?.companyId || req.user._id;
    await verifyOwnership(campaignId, actorId, req.user._id);
    await deleteCampaign(campaignId);
    res.status(200).json({ success: true, message: "Campaign deleted successfully" });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

exports.getCampaignMetrics = async (req, res) => {
  try {
    const companyId = req.auth?.companyId || req.user._id;
    const metrics = await getCampaignMetrics(companyId);
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateCampaignStatus = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status } = req.body;
    const actorId = req.auth?.companyId || req.user._id;
    await verifyOwnership(campaignId, actorId, req.user._id);
    const campaign = await updateCampaignStatus(campaignId, status);

    if (status === "ACTIVE") {
      (async () => {
        try {
          const participants = await CampaignParticipant.find({ campaign: campaignId, email: { $ne: null }, invitationSentAt: null }).lean();
          if (participants.length === 0) return;
          const employeeIds = participants.map((p) => p.employee).filter(Boolean);
          const [profiles, companyProfile] = await Promise.all([
            Profile.find({ userId: { $in: employeeIds } }).select("userId firstName lastName").lean(),
            Profile.findOne({ userId: campaign.company?._id ?? campaign.company }).select("companyDetails.name").lean(),
          ]);
          const profileMap = profiles.reduce((acc, p) => {
            acc[p.userId.toString()] = [p.firstName, p.lastName].filter(Boolean).join(" ") || "Participant";
            return acc;
          }, {});
          const companyName = companyProfile?.companyDetails?.name || "Your company";
          const assessmentLink = `${process.env.BASE_URL}/employee/campaigns/${campaignId}/assessment`;
          const deadlineStr = campaign.deadline
            ? new Date(campaign.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
            : null;
          const results = await Promise.allSettled(
            participants.map((p) =>
              sendCampaignInvitation(p.email, {
                participantName: profileMap[p.employee?.toString()] || p.providerName || "Participant",
                companyName, campaignTitle: campaign.title,
                moduleLabel: MODULE_LABELS[campaign.module?.type] || campaign.module?.type || "Assessment",
                deadline: deadlineStr, campaignDescription: campaign.description || null, assessmentLink,
              }).then((sent) => sent && CampaignParticipant.findByIdAndUpdate(p._id, { invitationSentAt: new Date() }))
            )
          );
          console.log(`📧 Campaign activation: emails sent to ${results.filter((r) => r.status === "fulfilled").length}/${participants.length}`);
        } catch (err) {
          console.warn("⚠️ Campaign activation emails failed:", err.message);
        }
      })();
    }

    res.status(200).json({ success: true, message: "Campaign status updated successfully", data: campaign });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, error: error.message });
  }
};

exports.getUserCampaigns = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, type, participantStatus, search, period, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    let periodFrom = null;
    if (period) {
      const map = { "7d": 7, "30d": 30, "3m": 90, "6m": 180, "1y": 365 };
      const days = map[period];
      if (days) periodFrom = new Date(Date.now() - days * 86_400_000);
    }

    const participations = await CampaignParticipant.find({ employee: userObjectId })
      .populate({ path: "campaign", populate: { path: "company createdBy", select: "name _id email" } })
      .sort({ createdAt: -1 });

    let filtered = participations.filter((p) => p.campaign !== null && p.campaign.status !== "DRAFT");
    if (status)          filtered = filtered.filter((p) => p.campaign.status === status);
    if (type)            filtered = filtered.filter((p) => p.campaign.type === type);
    if (participantStatus) filtered = filtered.filter((p) => p.status === participantStatus);
    if (search) { const re = new RegExp(search.trim(), "i"); filtered = filtered.filter((p) => re.test(p.campaign.title)); }
    if (periodFrom)      filtered = filtered.filter((p) => new Date(p.createdAt) >= periodFrom);

    const total = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);
    const participantIds = paginated.map((p) => p._id);
    const responses = await CampaignResponse.find({ participant: { $in: participantIds } }, { participant: 1, aiScore: 1 }).lean();
    const scoreMap = {};
    responses.forEach((r) => { scoreMap[r.participant.toString()] = r.aiScore ?? null; });

    const campaigns = await Promise.all(
      paginated.map(async (p) => ({
        ...p.campaign.toObject(),
        targetEmployeeCount: await CampaignParticipant.countDocuments({ campaign: p.campaign._id }),
        participantStatus: p.status,
        score: p.status === "COMPLETED" ? (scoreMap[p._id.toString()] ?? null) : null,
      }))
    );

    res.status(200).json({ success: true, data: campaigns, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
  } catch (error) {
    console.error(`❌ Error in getUserCampaigns: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getEmployeeCampaignMetrics = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "Invalid userId" });
    }
    const counts = await CampaignParticipant.aggregate([
      { $match: { employee: new mongoose.Types.ObjectId(userId) } },
      { $lookup: { from: "internalcampaigns", localField: "campaign", foreignField: "_id", as: "campaign" } },
      { $unwind: "$campaign" },
      { $match: { "campaign.status": { $ne: "DRAFT" } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const metrics = { total: 0, invited: 0, inProgress: 0, completed: 0 };
    for (const { _id, count } of counts) {
      metrics.total += count;
      if (_id === "INVITED")     metrics.invited   = count;
      if (_id === "IN_PROGRESS") metrics.inProgress = count;
      if (_id === "COMPLETED")   metrics.completed  = count;
    }
    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    console.error(`❌ Error in getEmployeeCampaignMetrics: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.saveQuestionnaireProgress = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { participantId, answers } = req.body;
    if (!participantId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: "participantId and answers[] are required" });
    }

    let participant = null;
    if (mongoose.Types.ObjectId.isValid(participantId)) {
      participant = await CampaignParticipant.findOne({ campaign: campaignId, employee: participantId });
    }
    if (!participant) participant = await CampaignParticipant.findOne({ campaign: campaignId, anonymousToken: participantId });
    if (!participant) participant = await CampaignParticipant.findOne({ campaign: campaignId, linkAccessToken: participantId });
    if (!participant) return res.status(404).json({ success: false, error: "Participant not found" });
    if (participant.status === "COMPLETED") return res.status(200).json({ success: true, message: "Already completed — draft ignored" });

    await CampaignResponse.findOneAndUpdate(
      { campaign: campaignId, participant: participant._id, moduleType: "QUESTIONNAIRE" },
      { $set: { answers, campaign: campaignId, participant: participant._id, moduleType: "QUESTIONNAIRE" } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

async function scoreQuestionnaireAsync(responseId, campaign, answers) {
  try {
    const questions = campaign.module?.config?.questions ?? [];
    const qaPairs = questions.map((q, i) => {
      const raw = answers[i]?.answer;
      const selected = Array.isArray(raw) ? raw : raw !== undefined && raw !== "" ? [String(raw)] : [];
      const answerText = selected.join(", ") || "(no answer)";
      if ((q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && Array.isArray(q.options) && q.options.length > 0) {
        const optionLines = q.options.map((opt) => `  ${selected.includes(opt) ? "✓" : "✗"} ${opt}`).join("\n");
        return `Q${i + 1} [${q.type}]: ${q.question}\nAvailable options (✓ = selected by respondent):\n${optionLines}`;
      }
      if (q.type === "RATING") return `Q${i + 1} [RATING]: ${q.question}\nRating given: ${raw ?? 0}/5`;
      return `Q${i + 1} [TEXT]: ${q.question}\nAnswer: ${answerText}`;
    }).join("\n\n");

    const systemPrompt = `You are an objective assessor evaluating questionnaire responses for a campaign titled "${campaign.title}".

Scoring rules:
- RATING: score = (stars / 5) * 100.
- SINGLE_CHOICE: 100 if correct/relevant, 0 if clearly wrong, 50 if partially relevant.
- MULTIPLE_CHOICE: score = max(0, (correct_selected - wrong_selected) / total_correct_options) * 100.
- TEXT: judge depth, clarity, and relevance (0–100).
Respond ONLY with valid JSON — no markdown, no extra text.`;

    const userMessage = `Campaign context: ${campaign.description ?? campaign.title}\n\nQuestionnaire responses:\n${qaPairs}\n\nReturn JSON exactly:\n{\n  "scores": [<score_q1>, ...],\n  "aiScore": <overall_0_to_100>,\n  "aiSummary": "<2-3 sentence summary>"\n}`;

    const { content: rawContent } = await bedrock.callLLM({
      systemPrompt, messages: [{ role: "user", content: userMessage }], temperature: 0.3, maxTokens: 512, useFastModel: true,
    });

    const jsonMatch = rawContent.replace(/```json|```/g, "").trim().match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`No JSON in LLM response: ${rawContent.substring(0, 100)}`);
    const parsed = JSON.parse(jsonMatch[0]);

    const scoredAnswers = answers.map((a, i) => ({
      ...a, score: typeof parsed.scores?.[i] === "number" ? Math.round(parsed.scores[i]) : null,
    }));

    await CampaignResponse.findByIdAndUpdate(responseId, { $set: {
      answers: scoredAnswers,
      aiScore: typeof parsed.aiScore === "number" ? Math.round(parsed.aiScore) : null,
      aiSummary: parsed.aiSummary ?? null,
    }});
  } catch (err) {
    console.error(`❌ scoreQuestionnaireAsync failed for response ${responseId}:`, err.message);
  }
}

exports.submitQuestionnaire = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { participantId, answers } = req.body;
    if (!participantId || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, error: "participantId and answers[] are required" });
    }

    const campaign = await InternalCampaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });
    if (campaign.module?.type !== "QUESTIONNAIRE") {
      return res.status(400).json({ success: false, error: "Campaign module is not QUESTIONNAIRE" });
    }

    let participant = null;
    if (mongoose.Types.ObjectId.isValid(participantId)) {
      participant = await CampaignParticipant.findOne({ campaign: campaignId, employee: participantId });
    }
    if (!participant) participant = await CampaignParticipant.findOne({ campaign: campaignId, anonymousToken: participantId });
    if (!participant) participant = await CampaignParticipant.findOne({ campaign: campaignId, linkAccessToken: participantId });
    if (!participant) return res.status(404).json({ success: false, error: "Participant not found" });

    const response = await CampaignResponse.findOneAndUpdate(
      { campaign: campaignId, participant: participant._id, moduleType: "QUESTIONNAIRE" },
      { $set: { answers, moduleType: "QUESTIONNAIRE", campaign: campaignId, participant: participant._id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    participant.status = "COMPLETED";
    participant.completedAt = new Date();
    participant.moduleProgress = { moduleType: "QUESTIONNAIRE", status: "COMPLETED", completedAt: new Date(), responseRef: response._id };
    await participant.save();

    scoreQuestionnaireAsync(response._id, campaign, answers);
    res.status(200).json({ success: true, data: { responseId: response._id } });
  } catch (error) {
    console.error(`❌ Error in submitQuestionnaire: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.startAssessment = async (req, res) => {
  try {
    const { campaignId, userId } = req.params;
    let participant = null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      participant = await CampaignParticipant.findOne({ campaign: campaignId, employee: userId });
    }
    if (!participant) participant = await CampaignParticipant.findOne({ campaign: campaignId, anonymousToken: userId });
    if (!participant) participant = await CampaignParticipant.findOne({ campaign: campaignId, linkAccessToken: userId });
    if (!participant) return res.status(404).json({ success: false, error: "Participant not found" });

    if (participant.status === "INVITED") {
      const campaign = await InternalCampaign.findById(campaignId).select("module").lean();
      const moduleType = campaign?.module?.type;
      participant.status = "IN_PROGRESS";
      participant.accessedAt = new Date();
      if (moduleType && participant.moduleProgress?.status !== "COMPLETED") {
        participant.moduleProgress = { moduleType, status: "IN_PROGRESS", completedAt: null, responseRef: participant.moduleProgress?.responseRef ?? null };
      }
      await participant.save();
    }

    res.status(200).json({ success: true, data: {
      status: participant.status,
      ...(participant.anonymousToken ? { anonymousToken: participant.anonymousToken } : {}),
    }});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getParticipantResults = async (req, res) => {
  try {
    const { campaignId, participantId } = req.params;
    const campaign = await InternalCampaign.findById(campaignId).lean();
    let participant = null;
    if (mongoose.Types.ObjectId.isValid(participantId)) {
      participant = await CampaignParticipant.findOne({ _id: participantId, campaign: campaignId }).lean();
      if (!participant) participant = await CampaignParticipant.findOne({ campaign: campaignId, employee: participantId }).lean();
    }
    if (!participant) participant = await CampaignParticipant.findOne({ campaign: campaignId, anonymousToken: participantId }).lean();
    if (!participant) participant = await CampaignParticipant.findOne({ campaign: campaignId, linkAccessToken: participantId }).lean();

    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });
    if (!participant) return res.status(404).json({ success: false, error: "Participant not found" });

    const response = await CampaignResponse.findOne({ campaign: campaignId, participant: participant._id }).lean();
    res.status(200).json({ success: true, data: {
      campaign: { _id: campaign._id, title: campaign.title, type: campaign.type, module: campaign.module },
      participant: { _id: participant._id, status: participant.status, completedAt: participant.completedAt, score: participant.score ?? null },
      response: response ?? null,
    }});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.participateInCampaign = async (req, res) => {
  try {
    const { campaignId, userId } = req.params;
    const campaign = await getCampaignById(campaignId);
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });

    const isAnonymous = campaign.anonymityMode === "ANONYMOUS";
    const user = await User.findById(userId).select("email username");
    if (!user) return res.status(404).json({ success: false, error: "User not found" });

    let participant;
    let anonymousToken;
    const isLinkBased = campaign.accessMethod === "LINK";

    if (isAnonymous && isLinkBased) {
      anonymousToken = randomUUID();
      participant = new CampaignParticipant({ campaign: campaignId, anonymousToken, status: "INVITED" });
      await participant.save();
    } else if (isAnonymous && !isLinkBased) {
      participant = await CampaignParticipant.findOne({ campaign: campaignId, employee: userId });
      if (participant) {
        anonymousToken = participant.anonymousToken;
      } else {
        anonymousToken = randomUUID();
        participant = new CampaignParticipant({ campaign: campaignId, employee: userId, email: user.email, anonymousToken, status: "INVITED" });
        await participant.save();
      }
    } else {
      participant = await CampaignParticipant.findOne({ campaign: campaignId, employee: userId });
      if (!participant) {
        participant = new CampaignParticipant({ campaign: campaignId, employee: userId, email: user.email, status: "INVITED" });
        await participant.save();
      }
    }

    res.status(200).json({ success: true, message: "Successfully joined the campaign", data: {
      participantId: participant._id, campaignId: campaign._id, campaignTitle: campaign.title,
      ...(isAnonymous ? { anonymousToken } : { email: user.email }),
      status: participant.status, accessedAt: participant.accessedAt,
    }});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.removeEmployeeFromCampaign = async (req, res) => {
  try {
    const { campaignId, participantId } = req.params;
    const participant = await CampaignParticipant.findOneAndDelete({ _id: participantId, campaign: campaignId });
    if (!participant) return res.status(404).json({ success: false, error: "Participant not found in this campaign" });
    res.status(200).json({ success: true, message: "Participant successfully removed from campaign", data: { participantId: participant._id, campaignId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getNonParticipants = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user._id;
    const { search, department, role, sortBy, order, page = 1, limit = 10 } = req.query;

    const campaign = await getCampaignById(campaignId);
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });
    if (campaign.company._id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized: You can only manage your own campaigns" });
    }

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const participantEmployeeIds = await CampaignParticipant.distinct("employee", {
      campaign: new mongoose.Types.ObjectId(campaignId), employee: { $ne: null },
    });

    const membershipQuery = { company: userId, user: { $nin: participantEmployeeIds } };
    if (department) {
      const depts = Array.isArray(department) ? department : [department];
      membershipQuery.department = { $in: depts };
    }
    if (role) membershipQuery.role = role;

    if (search?.trim().length > 0) {
      const term = search.trim();
      const [matchingUsers, matchingProfiles] = await Promise.all([
        User.find({ $or: [{ username: { $regex: term, $options: "i" } }, { email: { $regex: term, $options: "i" } }] }).select("_id"),
        Profile.find({ $or: [{ firstName: { $regex: term, $options: "i" } }, { lastName: { $regex: term, $options: "i" } }] }).select("userId"),
      ]);
      membershipQuery.user = { $in: [...matchingUsers.map((u) => u._id), ...matchingProfiles.map((p) => p.userId)], $nin: participantEmployeeIds };
    }

    const sortOrder = order === "asc" ? 1 : -1;
    const sortByName = sortBy === "name";
    const total = await CompanyMembership.countDocuments(membershipQuery);
    const queryBuilder = CompanyMembership.find(membershipQuery)
      .populate({ path: "user", select: "username email", populate: { path: "profile", select: "firstName lastName" } })
      .populate("department", "name");

    let memberships;
    if (sortByName) {
      const all = await queryBuilder;
      all.sort((a, b) => {
        const aName = a.user?.profile?.firstName || a.user?.username || "";
        const bName = b.user?.profile?.firstName || b.user?.username || "";
        return sortOrder * aName.localeCompare(bName);
      });
      memberships = all.slice(skip, skip + limitNum);
    } else {
      memberships = await queryBuilder.sort({ createdAt: sortOrder }).skip(skip).limit(limitNum);
    }

    const data = memberships.map((m) => ({
      _id: m.user?._id ?? null, membershipId: m._id,
      firstName: m.user?.profile?.firstName || m.user?.username || "Unknown",
      lastName: m.user?.profile?.lastName || "",
      email: m.user?.email ?? null, username: m.user?.username ?? null,
      role: m.role ?? null,
      department: m.department ? { id: m.department._id, name: m.department.name } : null,
    }));

    res.status(200).json({ success: true, data: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum), data } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { search, page = 1, limit = 10 } = req.query;
    const campaign = await InternalCampaign.findById(campaignId).lean();
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found" });

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;
    const campaignObjectId = new mongoose.Types.ObjectId(campaignId);
    const statusMap = { INVITED: "PENDING", IN_PROGRESS: "IN_PROGRESS", COMPLETED: "COMPLETED", DROPPED: "EXPIRED" };

    let anonIndexMap = {};
    if (campaign.anonymityMode === "ANONYMOUS") {
      const anonAll = await CampaignParticipant.find({ campaign: campaignObjectId, anonymousToken: { $exists: true, $ne: null }, status: "COMPLETED" }, { _id: 1 }).sort({ createdAt: 1 }).lean();
      anonAll.forEach((p, i) => { anonIndexMap[p._id.toString()] = i + 1; });
    }

    const pipeline = [
      { $match: { campaign: campaignObjectId, status: "COMPLETED" } },
      { $lookup: { from: "users", localField: "employee", foreignField: "_id", as: "employeeUser" } },
      { $unwind: { path: "$employeeUser", preserveNullAndEmptyArrays: true } },
      { $lookup: { from: "profiles", localField: "employeeUser._id", foreignField: "userId", as: "employeeProfile" } },
      { $unwind: { path: "$employeeProfile", preserveNullAndEmptyArrays: true } },
      ...(search ? [{ $match: { $or: [
        { "employeeProfile.firstName": { $regex: search, $options: "i" } },
        { "employeeProfile.lastName": { $regex: search, $options: "i" } },
        { "employeeUser.email": { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { providerName: { $regex: search, $options: "i" } },
      ]}}] : []),
      { $sort: { createdAt: -1 } },
      { $lookup: { from: "campaignresponses", let: { pid: "$_id" }, pipeline: [
        { $match: { $expr: { $eq: ["$participant", "$$pid"] } } }, { $project: { _id: 0, aiScore: 1 } },
      ], as: "response" } },
      { $addFields: { score: { $cond: { if: { $eq: ["$status", "COMPLETED"] }, then: { $ifNull: [{ $arrayElemAt: ["$response.aiScore", 0] }, null] }, else: null } } } },
      { $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limitNum }, { $project: {
          _id: 1, status: 1, score: 1, accessedAt: 1, completedAt: 1, providerName: 1, email: 1, anonymousToken: 1,
          "employeeUser._id": 1, "employeeUser.email": 1, "employeeUser.username": 1,
          "employeeProfile.firstName": 1, "employeeProfile.lastName": 1,
        }}],
      }},
    ];

    const result = await CampaignParticipant.aggregate(pipeline);
    const total = result[0]?.metadata[0]?.total || 0;
    const sessions = (result[0]?.data || []).map((p) => {
      const isAnonymous = !!p.anonymousToken;
      const anonIndex = isAnonymous ? (anonIndexMap[p._id.toString()] ?? "?") : null;
      const hasEmployee = !!p.employeeUser?._id;
      const firstName = isAnonymous ? `Anonymous #${anonIndex}` : hasEmployee ? p.employeeProfile?.firstName || p.employeeUser?.username || "Unknown" : p.providerName || "Unknown";
      const lastName = isAnonymous || !hasEmployee ? "" : p.employeeProfile?.lastName || "";
      const email = isAnonymous ? null : p.email || p.employeeUser?.email || null;
      return {
        _id: p._id, status: statusMap[p.status] || "PENDING", startedAt: p.accessedAt ?? null, completedAt: p.completedAt ?? null,
        score: p.score ?? undefined, isAnonymous,
        participant: { _id: p._id, firstName, lastName, email, username: p.employeeUser?.username ?? null },
      };
    });

    res.status(200).json({ success: true, data: sessions, total });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getCampaignByLinkToken = async (req, res) => {
  try {
    const { token } = req.params;
    const campaign = await InternalCampaign.findOne({ linkToken: token }).populate("company", "name").lean();
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found or link is invalid" });
    if (campaign.status !== "ACTIVE") return res.status(403).json({ success: false, error: "This campaign is not currently active" });
    res.status(200).json({ success: true, data: {
      _id: campaign._id, title: campaign.title, description: campaign.description, type: campaign.type,
      status: campaign.status, anonymityMode: campaign.anonymityMode, accessMethod: campaign.accessMethod,
      module: campaign.module, deadline: campaign.deadline, company: campaign.company,
    }});
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.joinCampaignByLink = async (req, res) => {
  try {
    const { token } = req.params;
    const campaign = await InternalCampaign.findOne({ linkToken: token });
    if (!campaign) return res.status(404).json({ success: false, error: "Campaign not found or link is invalid" });
    if (campaign.status !== "ACTIVE") return res.status(403).json({ success: false, error: "This campaign is not currently active" });
    if (campaign.deadline) {
      const dl = new Date(campaign.deadline);
      const deadlineEnd = new Date(Date.UTC(dl.getUTCFullYear(), dl.getUTCMonth(), dl.getUTCDate(), 23, 59, 59, 999));
      if (deadlineEnd.getTime() < Date.now()) return res.status(403).json({ success: false, error: "This campaign has expired" });
    }
    if (campaign.accessMethod === "ACCOUNTS") return res.status(403).json({ success: false, error: "This campaign requires an account login" });

    const isAnonymous = campaign.anonymityMode === "ANONYMOUS";
    if (isAnonymous) {
      const anonymousToken = randomUUID();
      const participant = await CampaignParticipant.create({ campaign: campaign._id, anonymousToken, status: "INVITED" });
      return res.status(200).json({ success: true, data: { campaignId: campaign._id, anonymousToken, participantId: participant._id } });
    }

    const userId = req.user?._id;
    if (userId) {
      let participant = await CampaignParticipant.findOne({ campaign: campaign._id, employee: userId });
      if (!participant) {
        const user = await User.findById(userId).select("email").lean();
        participant = await CampaignParticipant.create({ campaign: campaign._id, employee: userId, email: user?.email ?? null, status: "INVITED" });
      }
      return res.status(200).json({ success: true, data: { campaignId: campaign._id, participantId: participant._id } });
    }

    const { name, email } = req.body;
    if (!name?.trim()) return res.status(400).json({ success: false, error: "name is required to join this campaign" });
    const linkAccessToken = randomUUID();
    const participant = await CampaignParticipant.create({ campaign: campaign._id, providerName: name.trim(), email: email?.trim() || null, linkAccessToken, status: "INVITED" });
    return res.status(200).json({ success: true, data: { campaignId: campaign._id, linkAccessToken, participantId: participant._id } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
