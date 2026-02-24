require("dotenv").config();
const CampaignResponse = require("../models/campaignResponse.model");
const campaignResponseService = require("../services/campaignResponse.service");

/**
 * Create a new campaign response
 */
exports.createCampaignResponse = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { participantId, moduleType, answers } = req.body;

    // Validate required fields
    if (!moduleType) {
      return res.status(400).json({
        success: false,
        error: "Module type is required",
      });
    }

    if (!["QUESTIONNAIRE", "AI_INTERVIEW", "SKILL_TEST"].includes(moduleType)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid module type. Must be QUESTIONNAIRE, AI_INTERVIEW, or SKILL_TEST",
      });
    }

    const responseData = {
      campaign: campaignId,
      participant: participantId || null,
      moduleType,
      answers: answers || [],
    };

    const response = await campaignResponseService.createResponse(responseData);

    res.status(201).json({
      success: true,
      message: "Campaign response created successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get campaign response by ID
 */
exports.getCampaignResponse = async (req, res) => {
  try {
    const { responseId } = req.params;

    const response = await campaignResponseService.getResponseById(responseId);

    if (!response) {
      return res.status(404).json({
        success: false,
        error: "Response not found",
      });
    }

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get all responses for a campaign
 */
exports.getCampaignResponses = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { moduleType } = req.query;

    const filters = moduleType ? { moduleType } : {};
    const responses = await campaignResponseService.getResponsesByCampaign(
      campaignId,
      filters
    );

    res.status(200).json({
      success: true,
      data: responses,
      count: responses.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get responses by participant
 */
exports.getParticipantResponses = async (req, res) => {
  try {
    const { participantId } = req.params;
    const { moduleType } = req.query;

    const filters = moduleType ? { moduleType } : {};
    const responses = await campaignResponseService.getResponsesByParticipant(
      participantId,
      filters
    );

    res.status(200).json({
      success: true,
      data: responses,
      count: responses.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get responses by module type
 */
exports.getResponsesByModuleType = async (req, res) => {
  try {
    const { campaignId, moduleType } = req.params;

    if (!["QUESTIONNAIRE", "AI_INTERVIEW", "SKILL_TEST"].includes(moduleType)) {
      return res.status(400).json({
        success: false,
        error:
          "Invalid module type. Must be QUESTIONNAIRE, AI_INTERVIEW, or SKILL_TEST",
      });
    }

    const responses = await campaignResponseService.getResponsesByModuleType(
      campaignId,
      moduleType
    );

    res.status(200).json({
      success: true,
      data: responses,
      count: responses.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update campaign response
 */
exports.updateCampaignResponse = async (req, res) => {
  try {
    const { responseId } = req.params;
    const updateData = req.body;

    const response = await campaignResponseService.updateResponse(
      responseId,
      updateData
    );

    if (!response) {
      return res.status(404).json({
        success: false,
        error: "Response not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Campaign response updated successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Add answer to response
 */
exports.addAnswer = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { questionId, answer, score } = req.body;

    if (!questionId) {
      return res.status(400).json({
        success: false,
        error: "Question ID is required",
      });
    }

    const answerData = {
      questionId,
      answer,
      score: score || null,
    };

    const response = await campaignResponseService.addAnswer(
      responseId,
      answerData
    );

    res.status(200).json({
      success: true,
      message: "Answer added successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update answer in response
 */
exports.updateAnswer = async (req, res) => {
  try {
    const { responseId, questionId } = req.params;
    const { answer, score } = req.body;

    const answerData = {
      questionId,
      answer,
      score: score || null,
    };

    const response = await campaignResponseService.updateAnswer(
      responseId,
      questionId,
      answerData
    );

    res.status(200).json({
      success: true,
      message: "Answer updated successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Add interview transcript message
 */
exports.addTranscriptMessage = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { role, message } = req.body;

    if (!role || !message) {
      return res.status(400).json({
        success: false,
        error: "Role and message are required",
      });
    }

    const messageData = {
      role,
      message,
    };

    const response = await campaignResponseService.addTranscriptMessage(
      responseId,
      messageData
    );

    res.status(200).json({
      success: true,
      message: "Transcript message added successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update AI score and summary
 */
exports.updateAIScore = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { score, summary } = req.body;

    if (score === undefined || score === null) {
      return res.status(400).json({
        success: false,
        error: "Score is required",
      });
    }

    if (score < 0 || score > 100) {
      return res.status(400).json({
        success: false,
        error: "Score must be between 0 and 100",
      });
    }

    const aiData = {
      score,
      summary: summary || null,
    };

    const response = await campaignResponseService.updateAIScore(
      responseId,
      aiData
    );

    res.status(200).json({
      success: true,
      message: "AI score updated successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Update test results
 */
exports.updateTestResults = async (req, res) => {
  try {
    const { responseId } = req.params;
    const { score, maxScore, breakdown } = req.body;

    if (score === undefined || maxScore === undefined) {
      return res.status(400).json({
        success: false,
        error: "Score and maxScore are required",
      });
    }

    const testResults = {
      score,
      maxScore,
      breakdown: breakdown || null,
    };

    const response = await campaignResponseService.updateTestResults(
      responseId,
      testResults
    );

    res.status(200).json({
      success: true,
      message: "Test results updated successfully",
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete campaign response
 */
exports.deleteCampaignResponse = async (req, res) => {
  try {
    const { responseId } = req.params;

    const response = await campaignResponseService.deleteResponse(responseId);

    if (!response) {
      return res.status(404).json({
        success: false,
        error: "Response not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Campaign response deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Delete all responses for a campaign
 */
exports.deleteAllCampaignResponses = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const result = await campaignResponseService.deleteResponsesByCampaign(
      campaignId
    );

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} responses deleted successfully`,
      deletedCount: result.deletedCount,
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
exports.getCampaignStatistics = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const stats = await campaignResponseService.getCampaignStatistics(
      campaignId
    );

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
