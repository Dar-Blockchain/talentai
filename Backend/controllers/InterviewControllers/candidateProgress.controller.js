/**
 * Candidate Progress Controller
 * Manages candidate progression through pipeline steps
 */

const CandidatePostStepProgress = require("../../models/candidatePostStepsProgress.model");
const PostSteps = require("../../models/postSteps.model");

/**
 * Initialize or get candidate progress for a job
 * POST /api/candidate-progress/initialize
 * Body: { candidateId, jobId }
 */
exports.initializeProgress = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;

    console.log(
      `📋 Initializing progress for candidate ${candidateId}, job ${jobId}`,
    );

    // Check if progress already exists
    let progress = await CandidatePostStepProgress.findOne({
      idCandidate: candidateId,
      idPost: jobId,
    });

    if (progress) {
      console.log(`✅ Progress already exists, returning current state`);
      return res.status(200).json({
        success: true,
        data: progress,
        isNew: false,
      });
    }

    // Get all steps for this job
    const steps = await PostSteps.find({ postId: jobId }).sort({
      "data.config.nodeNumber": 1,
    });
    if (!steps || steps.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No pipeline steps found for this job",
      });
    }

    // Find first interview step
    const firstInterviewStep = steps.find((step) =>
      ["technical", "soft", "interview"].includes(step.data.type),
    );

    if (!firstInterviewStep) {
      return res.status(404).json({
        success: false,
        message: "No interview steps found in pipeline",
      });
    }

    // Create progress record
    progress = new CandidatePostStepProgress({
      idCandidate: candidateId,
      idPost: jobId,
      currentStep: firstInterviewStep._id,
      steps: steps.map((step) => ({
        stepId: step._id,
        status: step._id.equals(firstInterviewStep._id)
          ? "inProgress"
          : "pending",
        interviewDetails: null,
        completedAt: null,
      })),
    });

    await progress.save();

    console.log(
      `✅ Progress initialized, starting at step ${firstInterviewStep.data.config.nodeNumber}`,
    );
    return res.status(201).json({
      success: true,
      data: progress,
      isNew: true,
      currentStepNumber: firstInterviewStep.data.config.nodeNumber,
    });
  } catch (error) {
    console.error("❌ Error initializing progress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initialize progress",
      error: error.message,
    });
  }
};

/**
 * Update step status after interview completion
 * PUT /api/candidate-progress/update-step
 * Body: { candidateId, jobId, stepId, interviewDetailsId, status, passed, finalScore }
 */
exports.updateStepStatus = async (req, res) => {
  try {
    const {
      candidateId,
      jobId,
      stepId,
      interviewDetailsId,
      status,
      passed,
      finalScore,
    } = req.body;

    console.log(`📋 Updating step ${stepId} for candidate ${candidateId}`);

    const progress = await CandidatePostStepProgress.findOne({
      idCandidate: candidateId,
      idPost: jobId,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found",
      });
    }

    // Find and update the specific step
    const stepIndex = progress.steps.findIndex((s) => s.stepId.equals(stepId));
    if (stepIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Step not found in progress record",
      });
    }

    progress.steps[stepIndex].status = status || "done";
    progress.steps[stepIndex].interviewDetails = interviewDetailsId;
    progress.steps[stepIndex].completedAt = new Date();

    // 🔥 NEW: Track pass/fail and score
    if (passed !== undefined) {
      progress.steps[stepIndex].passed = passed;
    }
    if (finalScore !== undefined) {
      progress.steps[stepIndex].finalScore = finalScore;
    }
    // Increment attempts counter
    progress.steps[stepIndex].attempts =
      (progress.steps[stepIndex].attempts || 0) + 1;

    await progress.save();

    console.log(
      `✅ Step ${stepId} updated: ${passed ? "PASSED ✅" : "FAILED ❌"} (score: ${finalScore}%, attempts: ${progress.steps[stepIndex].attempts})`,
    );

    return res.status(200).json({
      success: true,
      data: progress,
      passed: passed,
      finalScore: finalScore,
    });
  } catch (error) {
    console.error("❌ Error updating step status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update step status",
      error: error.message,
    });
  }
};

/**
 * Move to next interview step in pipeline
 * POST /api/candidate-progress/next-step
 * Body: { candidateId, jobId }
 */
exports.moveToNextStep = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;

    console.log(
      `📋 Moving to next step for candidate ${candidateId}, job ${jobId}`,
    );

    const progress = await CandidatePostStepProgress.findOne({
      idCandidate: candidateId,
      idPost: jobId,
    }).populate("currentStep");

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found",
      });
    }

    // 🔥 NEW: Check if current step was passed before moving to next
    const currentStepProgress = progress.steps.find((s) =>
      s.stepId.equals(progress.currentStep._id),
    );

    if (currentStepProgress && currentStepProgress.passed === false) {
      console.log(
        `🚫 Cannot move to next step - current step failed with score: ${currentStepProgress.finalScore}%`,
      );
      return res.status(400).json({
        success: false,
        message: "Cannot move to next step - current step was not passed",
        failed: true,
        finalScore: currentStepProgress.finalScore,
        canRetry: false, // Future feature: could allow retries
      });
    }

    // Get all steps for this job
    const allSteps = await PostSteps.find({ postId: jobId }).sort({
      "data.config.nodeNumber": 1,
    });

    // Find current step index
    const currentStepNumber = progress.currentStep.data.config.nodeNumber;

    // Find next interview step after current
    const nextInterviewStep = allSteps.find(
      (step) =>
        step.data.config.nodeNumber > currentStepNumber &&
        ["technical", "soft", "interview"].includes(step.data.type),
    );

    if (!nextInterviewStep) {
      console.log(`✅ No more interview steps, pipeline complete`);
      return res.status(200).json({
        success: true,
        hasNextStep: false,
        pipelineComplete: true,
        data: progress,
      });
    }

    // Update current step and mark next step as inProgress
    progress.currentStep = nextInterviewStep._id;

    const nextStepIndex = progress.steps.findIndex((s) =>
      s.stepId.equals(nextInterviewStep._id),
    );
    if (nextStepIndex !== -1) {
      progress.steps[nextStepIndex].status = "inProgress";
    }

    await progress.save();

    console.log(
      `✅ Moved to next step: ${nextInterviewStep.data.config.nodeNumber}`,
    );
    return res.status(200).json({
      success: true,
      hasNextStep: true,
      pipelineComplete: false,
      data: progress,
      nextStepNumber: nextInterviewStep.data.config.nodeNumber,
      nextStepId: nextInterviewStep._id,
    });
  } catch (error) {
    console.error("❌ Error moving to next step:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to move to next step",
      error: error.message,
    });
  }
};

/**
 * Get current progress for a candidate on a job
 * GET /api/pipeline-interview/progress/:candidateId/:jobId
 */
exports.getProgress = async (req, res) => {
  try {
    const { candidateId, jobId } = req.params;

    const progress = await CandidatePostStepProgress.findOne({
      idCandidate: candidateId,
      idPost: jobId,
    })
      .populate("currentStep")
      .populate("steps.interviewDetails");

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "Progress record not found",
        needsInitialization: true,
      });
    }

    // 🔥 NEW: Get current step details and build interview params
    const currentStep = progress.currentStep;
    const Post = require("../../models/posts.model");
    const post = await Post.findById(jobId).select("title companyName");

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    // Build interview parameters from current step
    const pipelineConfigBuilder = require("../../services/InterviewServices/pipeline-interview-config");
    const interviewParams = pipelineConfigBuilder.buildParamsFromNode(
      currentStep,
      {
        companyName: post.companyName,
        title: post.title,
      },
    );

    // Calculate completion stats
    const completedSteps = progress.steps.filter(
      (s) => s.status === "done",
    ).length;
    const totalSteps = progress.steps.length;
    const completionPercentage = Math.round(
      (completedSteps / totalSteps) * 100,
    );

    return res.status(200).json({
      success: true,
      currentStep: {
        stepId: currentStep._id,
        stepNumber: currentStep.data.config.nodeNumber,
        stepType: currentStep.data.type,
        stepTitle: currentStep.data.label,
        interviewParams: interviewParams,
        passThreshold: currentStep.data.config.passThreshold || 70,
      },
      progress: progress,
      stats: {
        completedSteps,
        totalSteps,
        completionPercentage,
        currentStepNumber: currentStep.data.config.nodeNumber,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching progress:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch progress",
      error: error.message,
    });
  }
};
