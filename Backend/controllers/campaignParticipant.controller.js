require("dotenv").config();
const CampaignParticipant = require("../models/CampaignParticipant.model");
const InternalCampaign = require("../models/InternalCampaign.model");
const campaignParticipantService = require("../services/campaignParticipant.service");
/*
  addParticipant,
  getParticipantById,
  getParticipantsByCampaign,
  updateParticipant,
  deleteParticipant,
  getParticipantByAnonymousToken,*/
/**
 * Add a new participant to a campaign
 */
exports.addCampaignParticipant = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { email, employeeId, anonymousToken } = req.body;

    // Verify campaign exists
    const campaign = await InternalCampaign.findById(campaignId);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: "Campaign not found",
      });
    }

    if (!email && !employeeId && !anonymousToken) {
      return res.status(400).json({
        success: false,
        error: "At least one of: email, employeeId, or anonymousToken required",
      });
    }

    const participant = await campaignParticipantService.addParticipant({
      campaign: campaignId,
      employee: employeeId || null,
      email: email || null,
      anonymousToken: anonymousToken || null,
    });

    res.status(201).json({
      success: true,
      message: "Participant added successfully",
      data: participant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all participants for a campaign
 */
exports.getCampaignParticipants = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status, search: searchParam } = req.query;

    const filters = {};
    if (status) filters.status = status;

    const search = {};
    if (searchParam) search.q = searchParam;

    const participants = await campaignParticipantService.getParticipantsByCampaign(
      campaignId,
      filters,
      search,
    );

    res.status(200).json({
      success: true,
      data: participants,
      count: Array.isArray(participants) ? participants.length : 0,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get a specific participant by ID
 */
exports.getParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;

    const participant = await campaignParticipantService.getParticipantById(participantId);

    if (!participant) {
      return res.status(404).json({
        success: false,
        error: "Participant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: participant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get participant by anonymous token
 */
exports.getParticipantByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const participant = await campaignParticipantService.getParticipantByAnonymousToken(token);

    if (!participant) {
      return res.status(404).json({
        success: false,
        error: "Participant not found",
      });
    }

    res.status(200).json({
      success: true,
      data: participant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update participant status
 */
exports.updateCampaignParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { status, accessedAt, completedAt } = req.body;

    // Validate status enum
    const validStatuses = ["NOT_STARTED", "INVITED", "IN_PROGRESS", "COMPLETED", "DROPPED"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const participant = await campaignParticipantService.updateParticipant(participantId, {
      status,
      accessedAt,
      completedAt,
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        error: "Participant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Participant updated successfully",
      data: participant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete a participant
 */
exports.deleteCampaignParticipant = async (req, res) => {
  try {
    const { participantId } = req.params;

    await campaignParticipantService.deleteParticipant(participantId);

    res.status(200).json({
      success: true,
      message: "Participant deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
