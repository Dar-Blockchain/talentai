const interviewDetailsService = require("../services/interviewDetailsService");
const convertNewToOld = require("../utils/convertNewInterviewToOld");
const tokenRewardController = require("./tokenRewardController");

// Export the claim reward method from tokenRewardController
exports.claimInterviewReward = tokenRewardController.claimInterviewReward;

exports.addInterviewDetails = async (req, res) => {
  try {
    const { metadata, interviewData, candidate, profileId } = req.body;
    const userId = req.user._id;
    
    // Valider les données entrantes
    if (!metadata || !interviewData) {
      return res.status(400).json({
        success: false,
        error: "metadata and interviewData are required",
      });
    }

    // Le candidate (ProfileId MongoDB) peut venir du body ou être récupéré du user authentifié
    let candidateId = candidate || profileId;
    
    if (!candidateId) {
      // Si pas fourni, chercher le profil de l'utilisateur authentifié
      const Profile = require("../models/ProfileModel");
      const userProfile = await Profile.findOne({ userId });
      if (!userProfile) {
        return res.status(400).json({
          success: false,
          error: "No profile found for this user",
        });
      }
      candidateId = userProfile._id;
    }

    // Construire newInterviewData au format attendu par convertNewToOld
    const newInterviewData = {
      metadata,
      interviewData,
    };

    // Convertir le nouveau format au format ancien
    const convertedData = convertNewToOld(newInterviewData);

    // Mapper le type d'entretien from metadata.type (URL param) or interviewData.interviewType
    const typeFromMetadata = metadata?.type; // "technical", "soft", "onboarding", "hr"

    const urlTypeMap = {
      "technical": "skill",
      "soft": "soft",
      "onboarding": "onboarding",
      "hr": "hr",
    };

    const interviewDataTypeMap = {
      "HR_INTERVIEW": "hr",
      "TECHNICAL_INTERVIEW": "skill",
      "TECHNICAL_SKILL": "skill",
      "POST_INTERVIEW": "post",
      "ONBOARDING": "onboarding",
    };

    // Priority: metadata.type (from URL) > interviewData.interviewType
    let interviewType = "hr";
    if (typeFromMetadata && urlTypeMap[typeFromMetadata]) {
      interviewType = urlTypeMap[typeFromMetadata];
    } else if (interviewData?.interviewType) {
      interviewType = interviewDataTypeMap[interviewData.interviewType] || "hr";
    }

    // Construire l'objet interview conforme au schéma MongoDB
    const interviewDetails = {
      candidate: candidateId,
      type: interviewType,
      overallScore: convertedData.overallScore,
      skillDetails: convertedData.skillDetails || [],
      recommendations: convertedData.recommendations || [],
      questions: [],
      interviewContext: {
        targetRole: metadata?.role || "N/A",
        experienceLevel: metadata?.proficiency || "N/A",
      },
    };

    // Sauvegarder en base de données
    const result = await interviewDetailsService.createInterviewDetails(
      interviewDetails,
      metadata,
      interviewData
    );

    // ========================================
    // TRY TO DISTRIBUTE TAI TOKEN REWARD
    // ========================================
    console.log('🎁 Attempting to distribute interview reward...');
    console.log(`   User ID: ${userId}`);
    console.log(`   Candidate ID: ${candidateId}`);
    console.log(`   Score: ${convertedData.overallScore}`);
    console.log(`   Interview ID: ${result._id}`);

    let rewardResult = null;
    try {
      rewardResult = await tokenRewardController.distributeInterviewReward(
        userId, // Use authenticated user ID for reward
        convertedData.overallScore || 0,
        result._id.toString()
      );

      if (rewardResult.success) {
        console.log(`✅ Reward distributed successfully: ${rewardResult.amount} TAI`);
      } else if (rewardResult.skipped) {
        console.log(`⚠️  Reward skipped: ${rewardResult.reason}`);
      } else {
        console.log(`❌ Reward distribution failed: ${rewardResult.error}`);
      }
    } catch (rewardError) {
      console.error('❌ Failed to distribute interview reward:', rewardError.message);
      // Don't fail the interview save, just log the error
      rewardResult = {
        success: false,
        error: rewardError.message,
        canRetry: true
      };
    }

    res.status(201).json({
      success: true,
      message: "Interview details added successfully",
      data: result,
      reward: rewardResult, // NEW: Include reward information in response
      metadata: {
        sessionId: interviewData?.sessionId,
        timestamp: interviewData?.timestamp,
        analytics: interviewData?.analytics,
      },
    });
  } catch (error) {
    console.error("Error in addInterviewDetails:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { page, limit, sort, type, profileId } = req.query;

    const result = await interviewDetailsService.getAllInterviewDetails({
      page,
      limit,
      sort,
      type,
      profileId,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getInterviewDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const details = await interviewDetailsService.getInterviewDetailsById(id);
    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};
