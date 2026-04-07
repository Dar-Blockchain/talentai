const CampaignResponse = require("../models/campaignResponse.model");
const CampaignParticipant = require("../models/campaignParticipant.model");
const InternalCampaign = require("../models/internalCampaign.model");

/**
 * Create a new campaign response
 */
exports.createResponse = async (responseData) => {
  try {
    // Verify campaign exists
    const campaign = await InternalCampaign.findById(responseData.campaign);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // Verify participant exists if provided
    if (responseData.participant) {
      const participant = await CampaignParticipant.findById(
        responseData.participant
      );
      if (!participant) {
        throw new Error("Participant not found");
      }
    }

    const response = new CampaignResponse(responseData);
    await response.save();
    return response.populate("campaign participant");
  } catch (error) {
    throw new Error(`Error creating response: ${error.message}`);
  }
};

/**
 * Get response by ID
 */
exports.getResponseById = async (responseId) => {
  try {
    return await CampaignResponse.findById(responseId)
      .populate("campaign", "title type status")
      .populate("participant", "email firstName lastName");
  } catch (error) {
    throw new Error(`Error fetching response: ${error.message}`);
  }
};

/**
 * Get all responses for a campaign
 */
exports.getResponsesByCampaign = async (campaignId, filters = {}) => {
  try {
    const query = {
      campaign: campaignId,
      ...filters,
    };
    return await CampaignResponse.find(query)
      .populate("campaign", "title type")
      .populate("participant", "email firstName lastName")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching campaign responses: ${error.message}`);
  }
};

/**
 * Get all responses for a participant
 */
exports.getResponsesByParticipant = async (participantId, filters = {}) => {
  try {
    const query = {
      participant: participantId,
      ...filters,
    };
    return await CampaignResponse.find(query)
      .populate("campaign", "title type")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(
      `Error fetching participant responses: ${error.message}`
    );
  }
};

/**
 * Get responses filtered by module type
 */
exports.getResponsesByModuleType = async (campaignId, moduleType, filters = {}) => {
  try {
    const query = {
      campaign: campaignId,
      moduleType,
      ...filters,
    };
    return await CampaignResponse.find(query)
      .populate("participant", "email firstName lastName")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(
      `Error fetching responses by module type: ${error.message}`
    );
  }
};

/**
 * Update response
 */
exports.updateResponse = async (responseId, updateData) => {
  try {
    // Prevent updating campaign through this method
    delete updateData.campaign;

    const response = await CampaignResponse.findByIdAndUpdate(
      responseId,
      updateData,
      { new: true, runValidators: true }
    ).populate("campaign participant");

    return response;
  } catch (error) {
    throw new Error(`Error updating response: ${error.message}`);
  }
};

/**
 * Add answer to response
 */
exports.addAnswer = async (responseId, answerData) => {
  try {
    const response = await CampaignResponse.findByIdAndUpdate(
      responseId,
      { $push: { answers: answerData } },
      { new: true, runValidators: true }
    );

    if (!response) {
      throw new Error("Response not found");
    }

    return response;
  } catch (error) {
    throw new Error(`Error adding answer: ${error.message}`);
  }
};

/**
 * Update answer in response
 */
exports.updateAnswer = async (responseId, questionId, answerData) => {
  try {
    const response = await CampaignResponse.findByIdAndUpdate(
      responseId,
      {
        $set: { "answers.$[elem]": answerData },
      },
      {
        arrayFilters: [{ "elem.questionId": questionId }],
        new: true,
        runValidators: true,
      }
    );

    if (!response) {
      throw new Error("Response not found");
    }

    return response;
  } catch (error) {
    throw new Error(`Error updating answer: ${error.message}`);
  }
};

/**
 * Add interview transcript message
 */
exports.addTranscriptMessage = async (responseId, message) => {
  try {
    const response = await CampaignResponse.findByIdAndUpdate(
      responseId,
      {
        $push: {
          interviewTranscript: {
            ...message,
            timestamp: new Date(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!response) {
      throw new Error("Response not found");
    }

    return response;
  } catch (error) {
    throw new Error(`Error adding transcript message: ${error.message}`);
  }
};

/**
 * Update AI score and summary
 */
exports.updateAIScore = async (responseId, aiData) => {
  try {
    const response = await CampaignResponse.findByIdAndUpdate(
      responseId,
      {
        aiScore: aiData.score,
        aiSummary: aiData.summary,
      },
      { new: true, runValidators: true }
    );

    if (!response) {
      throw new Error("Response not found");
    }

    return response;
  } catch (error) {
    throw new Error(`Error updating AI score: ${error.message}`);
  }
};

/**
 * Update test results
 */
exports.updateTestResults = async (responseId, testResults) => {
  try {
    const response = await CampaignResponse.findByIdAndUpdate(
      responseId,
      { testResults },
      { new: true, runValidators: true }
    );

    if (!response) {
      throw new Error("Response not found");
    }

    return response;
  } catch (error) {
    throw new Error(`Error updating test results: ${error.message}`);
  }
};

/**
 * Delete response
 */
exports.deleteResponse = async (responseId) => {
  try {
    const response = await CampaignResponse.findByIdAndDelete(responseId);

    if (!response) {
      throw new Error("Response not found");
    }

    return response;
  } catch (error) {
    throw new Error(`Error deleting response: ${error.message}`);
  }
};

/**
 * Delete all responses for a campaign
 */
exports.deleteResponsesByCampaign = async (campaignId) => {
  try {
    const result = await CampaignResponse.deleteMany({ campaign: campaignId });
    return result;
  } catch (error) {
    throw new Error(
      `Error deleting campaign responses: ${error.message}`
    );
  }
};

/**
 * Get campaign response statistics
 */
exports.getCampaignStatistics = async (campaignId) => {
  try {
    const stats = {
      totalResponses: 0,
      byModuleType: {},
      avgAIScore: 0,
      completionRate: 0,
    };

    const responses = await CampaignResponse.find({ campaign: campaignId });
    stats.totalResponses = responses.length;

    // Group by module type
    responses.forEach((response) => {
      if (!stats.byModuleType[response.moduleType]) {
        stats.byModuleType[response.moduleType] = 0;
      }
      stats.byModuleType[response.moduleType]++;
    });

    // Calculate average AI score
    const responsesWithAIScore = responses.filter((r) => r.aiScore !== null);
    if (responsesWithAIScore.length > 0) {
      stats.avgAIScore =
        responsesWithAIScore.reduce((acc, r) => acc + r.aiScore, 0) /
        responsesWithAIScore.length;
    }

    return stats;
  } catch (error) {
    throw new Error(`Error calculating statistics: ${error.message}`);
  }
};
