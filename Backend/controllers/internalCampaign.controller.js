require("dotenv").config();
const InternalCampaign = require("../models/internalCampaign.model");
const CampaignParticipant = require("../models/campaignParticipant.model");
const User = require("../models/User.model");
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
    const error = new Error("Unauthorized: You can only manage your own campaigns");
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
    const companyId = req.user.profile; // Assuming company ID comes from authenticated user's profile
console.log(`📢 Creating campaign for company ${companyId} with title "${title}" and module type "${module?.type}"`);
console.log(`📋 Received participant IDs: ${Array.isArray(participants) ? participants.join(", ") : "None"}`);
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
        const users = await User.find({ _id: { $in: participants } }).select("_id email");
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

        const createdParticipants = await CampaignParticipant.insertMany(campaignParticipantData);
        console.log(`✅ Created ${participants.length} campaign participants with emails`);

        // Add participant IDs to campaign
        const participantIds = createdParticipants.map(p => p._id);
        campaign.participants = participantIds;
        await campaign.save();
        console.log(`✅ Updated campaign with ${participantIds.length} participant IDs`);

      } catch (participantError) {
        console.warn(`⚠️ Warning: Failed to create some participants: ${participantError.message}`);
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
    const companyId = req.user.profile;
    const { status, type, targetDepartment, title, page = 1, limit = 10 } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    // Build filters supporting search on title (partial, case-insensitive),
    // and exact filters for type, status and targetDepartment.
    const filters = {};
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (targetDepartment) filters.targetDepartment = targetDepartment;
    if (title && typeof title === "string" && title.trim().length > 0) {
      const search = title.trim();
      filters.title = { $regex: search, $options: "i" };
    }

    const result = await getCampaignsByCompanyPaginated(
      companyId,
      pageNum,
      limitNum,
      filters
    );

    res.status(200).json({
      success: true,
      data: result.data,
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

    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      });
    }

    res.status(200).json({
      success: true,
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
 * Get participants for a specific campaign (filtered and paginated)
 */
exports.getCampaignParticipants = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status, email, page = 1, limit = 10 } = req.query;

    // Verify campaign exists
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      });
    }

    // Build filter for participants
    const participantFilter = { campaign: campaignId };

    if (status) {
      participantFilter.status = status;
    }

    if (email) {
      participantFilter.email = { $regex: email, $options: "i" }; // Case-insensitive regex search
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Get total count of matching participants
    const totalParticipants = await CampaignParticipant.countDocuments(participantFilter);

    // Get paginated participants
    const participants = await CampaignParticipant.find(participantFilter)
      .populate("employee", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: {
        campaign: {
          id: campaign._id,
          title: campaign.title,
        },
        participants: {
          total: totalParticipants,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalParticipants / limitNum),
          data: participants,
        },
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
    await verifyOwnership(campaignId, req.user.profile);
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
    await verifyOwnership(campaignId, req.user.profile);
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
    const companyId = req.user.profile;
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
    await verifyOwnership(campaignId, req.user.profile);
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
    // Get userId from URL parameter
    const userId = req.params.userId;
    const { status, type, page = 1, limit = 10 } = req.query;

    console.log(`🔍 Fetching campaigns for user ${userId}`);

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build filter for campaign participations
    const participationFilter = { employee: userId };

    // Build filter for campaigns (to apply after populate)
    const campaignFilter = {};
    if (status) campaignFilter.status = status;
    if (type) campaignFilter.type = type;

    // Find all campaign participations for this user
    const participations = await CampaignParticipant.find(participationFilter)
      .populate({
        path: "campaign",
        select: "title description type status anonymityMode module deadline company",
        populate: {
          path: "company",
          select: "name",
        },
      })
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${participations.length} total participations before filtering`);

    // Filter out participations where campaign is null (deleted campaign)
    // and apply campaign filters if specified
    let filteredParticipations = participations
      .filter((participation) => participation.campaign !== null);

    // Apply campaign filters
    if (Object.keys(campaignFilter).length > 0) {
      filteredParticipations = filteredParticipations.filter((participation) => {
        for (const [key, value] of Object.entries(campaignFilter)) {
          if (participation.campaign[key] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    console.log(`📋 After filtering: ${filteredParticipations.length} participations`);

    // Get total count after filtering
    const totalParticipations = filteredParticipations.length;

    // Apply pagination
    const paginatedParticipations = filteredParticipations.slice(skip, skip + limitNum);

    // Extract campaigns and add participant status
    const campaigns = paginatedParticipations.map((participation) => ({
      campaignId: participation.campaign._id,
      title: participation.campaign.title,
      description: participation.campaign.description,
      type: participation.campaign.type,
      status: participation.campaign.status,
      anonymityMode: participation.campaign.anonymityMode,
      module: participation.campaign.module,
      deadline: participation.campaign.deadline,
      company: participation.campaign.company,
      participantStatus: participation.status,
      accessedAt: participation.accessedAt,
      completedAt: participation.completedAt,
      joinedAt: participation.createdAt,
    }));

    console.log(`✅ Returning ${campaigns.length} valid campaigns (page ${pageNum})`);

    res.status(200).json({
      success: true,
      data: campaigns,
      pagination: {
        total: totalParticipations,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalParticipations / limitNum),
      },
    });
  } catch (error) {
    console.error(`❌ Error in getUserCampaigns: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

