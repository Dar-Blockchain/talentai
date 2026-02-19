require("dotenv").config();
const InternalCampaign = require("../models/internalCampaign.model");
const CampaignParticipant = require("../models/campaignParticipant.model");
const {
  createCampaign,
  getCampaignById,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign,
  getCampaignsByCompany,
} = require("../services/internalCampaign.service");

/**
 * Create a new internal campaign
 */
exports.createInternalCampaign = async (req, res) => {
  try {
    const { title, type, description, anonymityMode, modules, accessMethod, targetDepartment, targetEmployeeCount, deadline } = req.body;
    const companyId = req.user.profile; // Assuming company ID comes from authenticated user's profile

    if (!title || !type || !anonymityMode || !modules || modules.length === 0 || !accessMethod) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, type, anonymityMode, modules, accessMethod",
      });
    }

    const campaign = await createCampaign({
      company: companyId,
      title,
      type,
      description,
      anonymityMode,
      modules,
      accessMethod,
      targetDepartment,
      targetEmployeeCount,
      deadline,
      createdBy: req.user._id,
    });

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
 * Get all campaigns for the authenticated company
 */
exports.getCompanyCampaigns = async (req, res) => {
  try {
    const companyId = req.user.profile;
    const { status } = req.query;

    const campaigns = await getCampaignsByCompany(companyId, status ? { status } : {});

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
 * Update a campaign
 */
exports.updateInternalCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const updateData = req.body;

    // Verify ownership
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      });
    }

    if (campaign.company.toString() !== req.user.profile.toString()) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: You can only update your own campaigns",
      });
    }

    const updatedCampaign = await updateCampaign(campaignId, updateData);

    res.status(200).json({
      success: true,
      message: "Campaign updated successfully",
      data: updatedCampaign,
    });
  } catch (error) {
    res.status(500).json({
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

    // Verify ownership
    const campaign = await getCampaignById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      });
    }

    if (campaign.company.toString() !== req.user.profile.toString()) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: You can only delete your own campaigns",
      });
    }

    await deleteCampaign(campaignId);

    res.status(200).json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
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

    const {
      getCampaignStats: getCampaignStatsService,
    } = require("../services/internalCampaign.service");

    const stats = await getCampaignStatsService(campaignId);

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
