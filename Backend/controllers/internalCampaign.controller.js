require("dotenv").config();
const mongoose = require("mongoose");
const InternalCampaign = require("../models/internalCampaign.model");
const CampaignParticipant = require("../models/campaignParticipant.model");
const CampaignResponse = require("../models/campaignResponse.model");
const CompanyMembership = require("../models/CompanyMembership.model");
const Profile = require("../models/Profile.model");
const User = require("../models/User.model");
const bedrock = require("../helpers/bedrock.helpers");
const {
  createCampaign,
  getCampaignById,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign,
  getCampaignsByCompany,
  getCampaignsByCompanyPaginated,
  getCampaignStats,
  getCampaignMetrics,
  updateCampaignStatus,
  updateModuleConfig,
} = require("../services/internalCampaign.service");

// ========== UTILITY FUNCTIONS ==========
const verifyOwnership = async (campaignId, companyId) => {
  const campaign = await getCampaignById(campaignId);
  if (!campaign) {
    const error = new Error("Campaign not found");
    error.status = 404;
    throw error;
  }
  if (campaign.company._id.toString() !== companyId.toString()) {
    const error = new Error(
      "Unauthorized: You can only manage your own campaigns",
    );
    error.status = 403;
    throw error;
  }
  return campaign;
};

// ========== CONTROLLER METHODS ==========

/**
 * Create a new internal campaign
 */
exports.createInternalCampaign = async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      anonymityMode,
      module,
      accessMethod,
      targetDepartment,
      targetEmployeeCount,
      deadline,
      skill,
      participants, // Array of user IDs
    } = req.body;
    const companyId = req.user._id; // Use authenticated user's ID as company ID
    console.log(
      `📢 Creating campaign for company ${companyId} with title "${title}" and module type "${module?.type}"`,
    );
    console.log(
      `📋 Received participant IDs: ${Array.isArray(participants) ? participants.join(", ") : "None"}`,
    );
    // `module` should be a single object describing the assessment module
    if (
      !title ||
      !type ||
      !anonymityMode ||
      !module ||
      typeof module !== "object" ||
      !module.type ||
      !accessMethod
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: title, type, anonymityMode, module, accessMethod",
      });
    }

    const campaign = await createCampaign({
      company: companyId,
      title,
      type,
      description,
      anonymityMode,
      module,
      accessMethod,
      targetDepartment,
      targetEmployeeCount,
      deadline,
      skill: skill || "",
      createdBy: req.user._id,
    });

    // Create campaign participants if provided
    if (Array.isArray(participants) && participants.length > 0) {
      try {
        // Fetch all users to get their emails
        const users = await User.find({ _id: { $in: participants } }).select(
          "_id email",
        );
        const userEmailMap = users.reduce((acc, user) => {
          acc[user._id.toString()] = user.email;
          return acc;
        }, {});

        // Create campaign participant data with emails
        const campaignParticipantData = participants.map((employeeId) => ({
          campaign: campaign._id,
          employee: employeeId,
          email: userEmailMap[employeeId.toString()] || null, // Add email from user
          status: "NOT_STARTED",
        }));

        const createdParticipants = await CampaignParticipant.insertMany(
          campaignParticipantData,
        );
        console.log(
          `✅ Created ${participants.length} campaign participants with emails`,
        );

        // Add participant IDs to campaign
        const participantIds = createdParticipants.map((p) => p._id);
        campaign.participants = participantIds;
        await campaign.save();
        console.log(
          `✅ Updated campaign with ${participantIds.length} participant IDs`,
        );
      } catch (participantError) {
        console.warn(
          `⚠️ Warning: Failed to create some participants: ${participantError.message}`,
        );
        // Don't throw - campaign was created successfully, continue
      }
    }

    res.status(201).json({
      success: true,
      message: "Campaign created successfully",
      data: campaign,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all campaigns for the authenticated company with pagination
 */
exports.getCompanyCampaigns = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { status, type, targetDepartment, title, search, period, page = 1, limit = 10 } = req.query;

    const pageNum  = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const filters = {};
    if (status)           filters.status           = status;
    if (type)             filters.type             = type;
    if (targetDepartment) filters.targetDepartment = targetDepartment;

    // title search (support both ?title= and ?search=)
    const searchTerm = (search || title || "").trim();
    if (searchTerm) filters.title = { $regex: searchTerm, $options: "i" };

    // period filter on createdAt
    const periodMap = { "7d": 7, "30d": 30, "3m": 90, "6m": 180, "1y": 365 };
    if (period && periodMap[period]) {
      const from = new Date(Date.now() - periodMap[period] * 86_400_000);
      filters.createdAt = { $gte: from };
    }

    const result = await getCampaignsByCompanyPaginated(
      companyId,
      pageNum,
      limitNum,
      filters,
    );

    // Add participant count for each campaign
    const campaignsWithCount = await Promise.all(
      result.data.map(async (campaign) => {
        const participantCount = await CampaignParticipant.countDocuments({
          campaign: campaign._id,
        });
        return {
          ...campaign.toObject(),
          targetEmployeeCount: participantCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: campaignsWithCount,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get a specific campaign by ID
 */
exports.getCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { userId }     = req.query;

    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      });
    }

    let data = campaign.toObject ? campaign.toObject() : { ...campaign };

    if (userId) {
      const participant = await CampaignParticipant.findOne(
        { campaign: campaignId, employee: userId },
        { status: 1, completedAt: 1 }
      ).lean();
      data.participantStatus = participant?.status ?? null;
      data.completedAt       = participant?.completedAt ?? null;

      if (participant?.status === 'COMPLETED') {
        const response = await CampaignResponse.findOne(
          { campaign: campaignId, participant: participant._id },
          { aiScore: 1 }
        ).lean();
        data.score = response?.aiScore ?? null;
      }
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get participants for a specific campaign (filtered and paginated)
 */
exports.getCampaignParticipants = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status, search, page = 1, limit = 10 } = req.query;

    // Verify campaign exists
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      });
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Convert campaignId to ObjectId
    const campaignObjectId = new mongoose.Types.ObjectId(campaignId);

    // Build aggregation pipeline
    const pipeline = [
      // Stage 1: Match campaign and status
      {
        $match: {
          campaign: campaignObjectId,
          ...(status && { status })
        }
      },
      // Stage 2: Populate employee data
      {
        $lookup: {
          from: "users",
          localField: "employee",
          foreignField: "_id",
          as: "employee"
        }
      },
      {
        $unwind: { path: "$employee", preserveNullAndEmptyArrays: true }
      },
      // Stage 3: Populate employee profile
      {
        $lookup: {
          from: "profiles",
          localField: "employee._id",
          foreignField: "userId",
          as: "employee.profile"
        }
      },
      {
        $unwind: { path: "$employee.profile", preserveNullAndEmptyArrays: true }
      },
      // Stage 4: Populate company membership
      {
        $lookup: {
          from: "companymemberships",
          localField: "employee._id",
          foreignField: "user",
          as: "employee.companyMembership"
        }
      },
      {
        $unwind: { path: "$employee.companyMembership", preserveNullAndEmptyArrays: true }
      },
      // Stage 5: Populate department
      {
        $lookup: {
          from: "departments",
          localField: "employee.companyMembership.department",
          foreignField: "_id",
          as: "employee.companyMembership.department"
        }
      },
      {
        $unwind: { path: "$employee.companyMembership.department", preserveNullAndEmptyArrays: true }
      },
      // Stage 6: Apply search filter on firstName, lastName, email
      ...(search ? [
        {
          $match: {
            $or: [
              { "employee.profile.firstName": { $regex: search, $options: "i" } },
              { "employee.profile.lastName": { $regex: search, $options: "i" } },
              { email: { $regex: search, $options: "i" } },
              { "employee.email": { $regex: search, $options: "i" } }
            ]
          }
        }
      ] : []),
      // Stage 7: Sort by creation date
      { $sort: { createdAt: -1 } },
      // Stage 8: Get total count before pagination
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limitNum },
            // Project only required fields
            {
              $project: {
                _id: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                email: 1,
                "employee._id": 1,
                "employee.email": 1,
                "employee.username": 1,
                "employee.profile.firstName": 1,
                "employee.profile.lastName": 1,
                "employee.companyMembership.role": 1,
                "employee.companyMembership.department._id": 1,
                "employee.companyMembership.department.name": 1
              }
            }
          ]
        }
      }
    ];

    // Execute aggregation pipeline
    const result = await CampaignParticipant.aggregate(pipeline);
    
    const totalParticipants = result[0]?.metadata[0]?.total || 0;
    const participants = result[0]?.data || [];

    // Transform participants data to include all required fields
    const formattedParticipants = participants.map(participant => {
      const firstName = participant.employee?.profile?.firstName || participant.employee?.username || "Unknown";
      const lastName = participant.employee?.profile?.lastName || "";
      const department = participant.employee?.companyMembership?.department ? {
        id: participant.employee.companyMembership.department._id,
        name: participant.employee.companyMembership.department.name
      } : null;

      return {
        _id: participant._id,
        employeeId: participant.employee?._id || null,
        firstName: firstName,
        lastName: lastName,
        email: participant.email || participant.employee?.email || null,
        role: participant.employee?.companyMembership?.role || null,
        department: department,
        status: participant.status,
        createdAt: participant.createdAt,
        updatedAt: participant.updatedAt
      };
    });

    // Fetch aiScore for COMPLETED participants
    const completedIds = formattedParticipants
      .filter(p => p.status === "COMPLETED")
      .map(p => p._id);

    const scoreMap = {};
    if (completedIds.length > 0) {
      const responses = await CampaignResponse.find(
        { campaign: campaignObjectId, participant: { $in: completedIds } },
        { participant: 1, aiScore: 1 }
      ).lean();
      responses.forEach(r => { scoreMap[r.participant.toString()] = r.aiScore ?? null; });
    }

    const formattedWithScores = formattedParticipants.map(p => ({
      ...p,
      score: p.status === "COMPLETED" ? (scoreMap[p._id.toString()] ?? null) : undefined,
    }));

    res.status(200).json({
      success: true,
      data: {
        total: totalParticipants,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalParticipants / limitNum),
        data: formattedWithScores,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update a campaign
 */
exports.updateInternalCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    await verifyOwnership(campaignId, req.user._id);
    const updatedCampaign = await updateCampaign(campaignId, req.body);
    res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      data: updatedCampaign,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete a campaign
 */
exports.deleteInternalCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    await verifyOwnership(campaignId, req.user._id);
    await deleteCampaign(campaignId);
    res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get campaign statistics
 */
exports.getCampaignStats = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const stats = await getCampaignStats(campaignId);
    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all campaigns (admin only)
 */
exports.getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await getAllCampaigns();
    res.status(200).json({
      success: true,
      data: campaigns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get campaign metrics (count by status)
 */
exports.getCampaignMetrics = async (req, res) => {
  try {
    const companyId = req.user._id;
    const metrics = await getCampaignMetrics(companyId);
    res.status(200).json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update campaign status
 */
exports.updateCampaignStatus = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status } = req.body;
    await verifyOwnership(campaignId, req.user._id);
    const campaign = await updateCampaignStatus(campaignId, status);
    res.status(200).json({
      success: true,
      message: "Campaign status updated successfully",
      data: campaign,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all campaigns for a specific user (as a participant)
 * userId can be passed as a URL parameter
 * Supports pagination and filtering by status, type
 */
exports.getUserCampaigns = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { status, type, participantStatus, search, period, page = 1, limit = 10 } = req.query;

    const pageNum  = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip     = (pageNum - 1) * limitNum;

    const ObjectId    = require("mongoose").Types.ObjectId;
    const userObjectId = new ObjectId(userId);

    // Resolve period → date threshold
    let periodFrom = null;
    if (period) {
      const now = new Date();
      const map = { "7d": 7, "30d": 30, "3m": 90, "6m": 180, "1y": 365 };
      const days = map[period];
      if (days) {
        periodFrom = new Date(now.getTime() - days * 86_400_000);
      }
    }

    const participations = await CampaignParticipant.find({ employee: userObjectId })
      .populate({
        path: "campaign",
        populate: { path: "company createdBy", select: "name _id email" },
      })
      .sort({ createdAt: -1 });

    let filtered = participations.filter(
      (p) => p.campaign !== null && p.campaign.status !== "DRAFT",
    );

    // campaign status filter
    if (status)           filtered = filtered.filter((p) => p.campaign.status === status);
    // campaign type filter
    if (type)             filtered = filtered.filter((p) => p.campaign.type === type);
    // participant status filter
    if (participantStatus) filtered = filtered.filter((p) => p.status === participantStatus);
    // search filter (campaign title)
    if (search) {
      const re = new RegExp(search.trim(), "i");
      filtered = filtered.filter((p) => re.test(p.campaign.title));
    }
    // period filter (participation created within range)
    if (periodFrom) {
      filtered = filtered.filter((p) => new Date(p.createdAt) >= periodFrom);
    }

    const total    = filtered.length;
    const paginated = filtered.slice(skip, skip + limitNum);

    // Bulk-fetch scores for paginated participants
    const participantIds = paginated.map((p) => p._id);
    const responses = await CampaignResponse.find(
      { participant: { $in: participantIds } },
      { participant: 1, aiScore: 1 }
    ).lean();
    const scoreMap = {};
    responses.forEach((r) => { scoreMap[r.participant.toString()] = r.aiScore ?? null; });

    const campaigns = await Promise.all(
      paginated.map(async (p) => {
        const targetEmployeeCount = await CampaignParticipant.countDocuments({ campaign: p.campaign._id });
        const score = p.status === 'COMPLETED' ? (scoreMap[p._id.toString()] ?? null) : null;
        return { ...p.campaign.toObject(), targetEmployeeCount, participantStatus: p.status, score };
      })
    );

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error(`❌ Error in getUserCampaigns: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /internal-campaigns/employee/:userId/metrics
 * Returns campaign participation metrics for a specific employee:
 * total, invited, inProgress, completed
 */
exports.getEmployeeCampaignMetrics = async (req, res) => {
  try {
    const { userId } = req.params;
    const ObjectId = require("mongoose").Types.ObjectId;

    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, error: "Invalid userId" });
    }

    const counts = await CampaignParticipant.aggregate([
      { $match: { employee: new ObjectId(userId) } },
      {
        $lookup: {
          from: "internalcampaigns",
          localField: "campaign",
          foreignField: "_id",
          as: "campaign",
        },
      },
      { $unwind: "$campaign" },
      { $match: { "campaign.status": { $ne: "DRAFT" } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const metrics = { total: 0, invited: 0, inProgress: 0, completed: 0 };
    for (const { _id, count } of counts) {
      metrics.total += count;
      if (_id === "INVITED")     metrics.invited    = count;
      if (_id === "IN_PROGRESS") metrics.inProgress = count;
      if (_id === "COMPLETED")   metrics.completed  = count;
    }

    res.status(200).json({ success: true, data: metrics });
  } catch (error) {
    console.error(`❌ Error in getEmployeeCampaignMetrics: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /internal-campaigns/:campaignId/questionnaire/submit
 * Submit all answers for a QUESTIONNAIRE module in one call.
 * Body: { participantId, answers: [{ questionId, answer }] }
 * - Saves a CampaignResponse document
 * - Marks the CampaignParticipant status as COMPLETED
 */
/**
 * Async AI scoring — fires after the HTTP response is sent.
 * Scores each answer individually, computes aiScore (0-100), generates aiSummary.
 */
async function scoreQuestionnaireAsync(responseId, campaign, answers) {
  try {
    const questions = campaign.module?.config?.questions ?? [];

    // Build Q&A pairs — include all available options for choice questions
    const qaPairs = questions.map((q, i) => {
      const raw        = answers[i]?.answer;
      const selected   = Array.isArray(raw) ? raw : (raw !== undefined && raw !== "" ? [String(raw)] : []);
      const answerText = selected.join(", ") || "(no answer)";

      if ((q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && Array.isArray(q.options) && q.options.length > 0) {
        const optionLines = q.options.map(opt => {
          const picked = selected.includes(opt);
          return `  ${picked ? "✓" : "✗"} ${opt}`;
        }).join("\n");
        return `Q${i + 1} [${q.type}]: ${q.question}\nAvailable options (✓ = selected by respondent):\n${optionLines}`;
      }

      if (q.type === "RATING") {
        return `Q${i + 1} [RATING]: ${q.question}\nRating given: ${raw ?? 0}/5`;
      }

      return `Q${i + 1} [TEXT]: ${q.question}\nAnswer: ${answerText}`;
    }).join("\n\n");

    const systemPrompt = `You are an objective assessor evaluating questionnaire responses for a campaign titled "${campaign.title}".

Scoring rules:
- RATING: score = (stars / 5) * 100. E.g. 4/5 = 80.
- SINGLE_CHOICE: 100 if the selected option is correct/relevant, 0 if clearly wrong, 50 if partially relevant.
- MULTIPLE_CHOICE: use this formula — score = max(0, (correct_selected - wrong_selected) / total_correct_options) * 100.
  "correct_selected" = options chosen that are actually correct.
  "wrong_selected"   = options chosen that are incorrect (penalise these).
  If the respondent selects a wrong option, the score MUST be reduced accordingly.
- TEXT: judge depth, clarity, and relevance to the campaign context (0–100).

Be strict with MULTIPLE_CHOICE: selecting even one wrong option significantly reduces the score.
Respond ONLY with valid JSON — no markdown, no extra text.`;

    const userMessage = `Campaign context: ${campaign.description ?? campaign.title}

Questionnaire responses:
${qaPairs}

Return JSON exactly:
{
  "scores": [<score_q1>, <score_q2>, ...],
  "aiScore": <overall_0_to_100>,
  "aiSummary": "<2-3 sentence summary of the respondent's overall performance>"
}`;

    const result = await bedrock.callLLM({
      systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      temperature: 0.3,
      maxTokens: 512,
      timeout: 20000,
    });

    // Parse JSON — strip possible markdown fences
    const raw = result.content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(raw);

    const scoredAnswers = answers.map((a, i) => ({
      ...a,
      score: typeof parsed.scores?.[i] === "number" ? Math.round(parsed.scores[i]) : null,
    }));

    await CampaignResponse.findByIdAndUpdate(responseId, {
      answers:    scoredAnswers,
      aiScore:    typeof parsed.aiScore === "number" ? Math.round(parsed.aiScore) : null,
      aiSummary:  parsed.aiSummary ?? null,
    });
  } catch (err) {
    console.error(`❌ scoreQuestionnaireAsync failed for response ${responseId}: ${err.message}`);
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

    // participantId is the User _id — look up the CampaignParticipant by employee + campaign
    const participant = await CampaignParticipant.findOne({ campaign: campaignId, employee: participantId });
    if (!participant) return res.status(404).json({ success: false, error: "Participant not found" });

    // Upsert response (allow re-submission)
    const response = await CampaignResponse.findOneAndUpdate(
      { campaign: campaignId, participant: participant._id, moduleType: "QUESTIONNAIRE" },
      { answers, moduleType: "QUESTIONNAIRE", campaign: campaignId, participant: participant._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Mark participant as completed
    participant.status = "COMPLETED";
    participant.completedAt = new Date();
    await participant.save();

    // Trigger AI scoring asynchronously — does not block the response
    scoreQuestionnaireAsync(response._id, campaign, answers);

    res.status(200).json({ success: true, data: { responseId: response._id } });
  } catch (error) {
    console.error(`❌ Error in submitQuestionnaire: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PATCH /internal-campaigns/:campaignId/start/:userId
 * Mark participant as IN_PROGRESS when they open the assessment.
 */
exports.startAssessment = async (req, res) => {
  try {
    const { campaignId, userId } = req.params;

    const participant = await CampaignParticipant.findOne({ campaign: campaignId, employee: userId });
    if (!participant) return res.status(404).json({ success: false, error: "Participant not found" });

    // Only move forward — don't overwrite COMPLETED
    if (participant.status === "INVITED") {
      participant.status = "IN_PROGRESS";
      participant.accessedAt = new Date();
      await participant.save();
    }

    res.status(200).json({ success: true, data: { status: participant.status } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /internal-campaigns/:campaignId/results/:participantId
 * Returns the campaign, participant record, and response for a single participant.
 */
exports.getParticipantResults = async (req, res) => {
  try {
    const { campaignId, participantId } = req.params;

    // participantId is the User _id — resolve the CampaignParticipant first
    const [campaign, participant] = await Promise.all([
      InternalCampaign.findById(campaignId).lean(),
      CampaignParticipant.findOne({ campaign: campaignId, employee: participantId }).lean(),
    ]);

    if (!campaign)    return res.status(404).json({ success: false, error: "Campaign not found" });
    if (!participant) return res.status(404).json({ success: false, error: "Participant not found" });

    const response = await CampaignResponse.findOne({ campaign: campaignId, participant: participant._id }).lean();

    res.status(200).json({
      success: true,
      data: {
        campaign: {
          _id:    campaign._id,
          title:  campaign.title,
          type:   campaign.type,
          module: campaign.module,
        },
        participant: {
          _id:         participant._id,
          status:      participant.status,
          completedAt: participant.completedAt,
          score:       participant.score ?? null,
        },
        response: response ?? null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Participate in a campaign - Employee joins a campaign
 * Can be called with userId as parameter to add another user to the campaign
 */
exports.participateInCampaign = async (req, res) => {
  try {
    const { campaignId, userId } = req.params;

    console.log("\n" + "=".repeat(80));
    console.log("🚀 [CAMPAIGN PARTICIPANT] - STARTING PARTICIPATION PROCESS");
    console.log("=".repeat(80));

    // Verify campaign exists
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      console.error(`❌ Campaign not found: ${campaignId}`);
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      });
    }

    console.log(`✅ Campaign found: ${campaign.title}`);
    console.log(`   - Campaign ID: ${campaign._id}`);
    console.log(`   - Status: ${campaign.status}`);

    // Get user email
    const user = await User.findById(userId).select("email username");
    if (!user) {
      console.error(`❌ User not found: ${userId}`);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    console.log(`✅ User found: ${user.username}`);
    console.log(`   - Email: ${user.email}`);

    // Check if user is already a participant
    let participant = await CampaignParticipant.findOne({
      campaign: campaignId,
      employee: userId,
    });

    if (participant) {
      console.log(`ℹ️ Participant already exists`);
    } else {
      console.log(`📝 Creating new campaign participant`);
      participant = new CampaignParticipant({
        campaign: campaignId,
        employee: userId,
        email: user.email,
        status: "INVITED",
      });
      await participant.save();
      console.log(`✅ New participant created with status INVITED`);
    }

    console.log("=".repeat(80) + "\n");

    res.status(200).json({
      success: true,
      message: "Successfully joined the campaign",
      data: {
        participantId: participant._id,
        campaignId: campaign._id,
        campaignTitle: campaign.title,
        email: user.email,
        status: participant.status,
        accessedAt: participant.accessedAt,
      },
    });
  } catch (error) {
    console.error(`\n❌ [ERROR] Error in participateInCampaign: ${error.message}`);
    console.error("Stack trace:", error.stack);
    console.log("=".repeat(80) + "\n");
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Remove an employee from a campaign
 * Deletes the CampaignParticipant record
 */
exports.removeEmployeeFromCampaign = async (req, res) => {
  try {
    const { campaignId, participantId } = req.params;

    // Find and delete the participant record by its own _id
    const participant = await CampaignParticipant.findOneAndDelete({
      _id: participantId,
      campaign: campaignId,
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        error: "Participant not found in this campaign",
      });
    }

    res.status(200).json({
      success: true,
      message: "Participant successfully removed from campaign",
      data: {
        participantId: participant._id,
        campaignId,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get employees of the company who are NOT yet participants in a campaign.
 * Supports the same filters as the employee list:
 *   search, department, role, sortBy, order, page, limit
 *
 * GET /internal-campaigns/:campaignId/non-participants
 */
exports.getNonParticipants = async (req, res) => {
  try {
    const { campaignId } = req.params;
    // userId is used to verify campaign ownership (InternalCampaign.company = User._id)
    // userId is also used to query CompanyMembership (CompanyMembership.company = User._id)
    const userId    = req.user._id;
    const {
      search,
      department,
      role,
      sortBy,
      order,
      page = 1,
      limit = 10,
    } = req.query;

    // ── Verify campaign exists and belongs to this company ──────────────────
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json({ success: false, error: "Campaign not found" });
    }
    if (campaign.company._id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, error: "Unauthorized: You can only manage your own campaigns" });
    }

    // ── Pagination ───────────────────────────────────────────────────────────
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip     = (pageNum - 1) * limitNum;

    // ── Get IDs of employees already in this campaign ────────────────────────
    const participantEmployeeIds = await CampaignParticipant.distinct("employee", {
      campaign: new mongoose.Types.ObjectId(campaignId),
      employee: { $ne: null },
    });

    // ── Build membership query ───────────────────────────────────────────────
    // CompanyMembership.company stores the company User._id (not the profile ID)
    const membershipQuery = {
      company: userId,
      user: { $nin: participantEmployeeIds },
    };

    if (department) {
      const depts = Array.isArray(department) ? department : [department];
      membershipQuery.department = { $in: depts };
    }

    if (role) {
      membershipQuery.role = role;
    }

    // ── Search: find matching user IDs then intersect ────────────────────────
    if (search && search.trim().length > 0) {
      const term = search.trim();

      // Users matching on username / email
      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: term, $options: "i" } },
          { email:    { $regex: term, $options: "i" } },
        ],
      }).select("_id");

      // Profiles matching on firstName / lastName
      const matchingProfiles = await Profile.find({
        $or: [
          { firstName: { $regex: term, $options: "i" } },
          { lastName:  { $regex: term, $options: "i" } },
        ],
      }).select("userId");

      const searchUserIds = [
        ...matchingUsers.map((u) => u._id),
        ...matchingProfiles.map((p) => p.userId),
      ];

      // Intersect: user must be in search results AND not a participant
      membershipQuery.user = {
        $in:  searchUserIds,
        $nin: participantEmployeeIds,
      };
    }

    // ── Sort setup ───────────────────────────────────────────────────────────
    const sortOrder = order === "asc" ? 1 : -1;
    const sortByName = sortBy === "name";
    const sortQuery  = sortByName ? null : { createdAt: sortOrder };

    // ── Total count ──────────────────────────────────────────────────────────
    const total = await CompanyMembership.countDocuments(membershipQuery);

    // ── Fetch memberships with populated references ──────────────────────────
    const queryBuilder = CompanyMembership.find(membershipQuery)
      .populate({
        path: "user",
        select: "username email",
        populate: { path: "profile", select: "firstName lastName" },
      })
      .populate("department", "name");

    let memberships;
    if (sortByName) {
      // Sort by firstName post-population (nested field)
      const all = await queryBuilder;
      all.sort((a, b) => {
        const aName = a.user?.profile?.firstName || a.user?.username || "";
        const bName = b.user?.profile?.firstName || b.user?.username || "";
        return sortOrder * aName.localeCompare(bName);
      });
      memberships = all.slice(skip, skip + limitNum);
    } else {
      memberships = await queryBuilder.sort(sortQuery).skip(skip).limit(limitNum);
    }

    // ── Format response ──────────────────────────────────────────────────────
    const data = memberships.map((m) => ({
      _id:          m.user?._id     ?? null,
      membershipId: m._id,
      firstName:    m.user?.profile?.firstName || m.user?.username || "Unknown",
      lastName:     m.user?.profile?.lastName  || "",
      email:        m.user?.email   ?? null,
      username:     m.user?.username ?? null,
      role:         m.role          ?? null,
      department:   m.department
        ? { id: m.department._id, name: m.department.name }
        : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        total,
        page:  pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        data,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
