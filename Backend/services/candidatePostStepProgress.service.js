const CandidatePostStepProgress = require("../models/candidatePostStepProgress.model");

class CandidatePostStepProgressService {
  // Create new candidate progress
  async createProgress(progressData) {
    try {
      const progress = new CandidatePostStepProgress(progressData);
      const savedProgress = await progress.save();
      return { success: true, data: savedProgress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get all progress
  async getAllProgress() {
    try {
      const progress = await CandidatePostStepProgress.find()
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("currentStep", "data.label data.type data.subtitle")
        .populate("steps.stepId", "data.label data.type data.subtitle order id")
        .populate("steps.interviewDetails", "type overallScore createdAt")
        .sort({ createdAt: -1 });
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get progress by ID
  async getProgressById(id) {
    try {
      const progress = await CandidatePostStepProgress.findById(id)
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("currentStep", "data.label data.type data.subtitle")
        .populate("steps.stepId", "data.label data.type data.subtitle order id")
        .populate("steps.interviewDetails", "type overallScore createdAt");

      if (!progress) {
        return { success: false, error: "Progress not found" };
      }
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Get progress by idCandidate (first found record)
  async findByIdCandidate(candidateId) {
    try {
      console.log(candidateId);
      const progress = await CandidatePostStepProgress.findOne({
        idCandidate: candidateId,
      })
        .populate("idCandidate")
        .populate("idPost")
        .populate("currentStep", "data.label data.type data.subtitle")
        .populate("steps.stepId", "data.label data.type data.subtitle order id")
        .populate("steps.interviewDetails", "type overallScore createdAt");

      if (!progress) {
        return { success: false, error: "Progress not found for this candidate" };
      }
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Retrieve candidate progress for a specific post
  async getProgressByCandidateAndPost(candidateId, postId) {
    try {
      const progress = await CandidatePostStepProgress.findOne({
        idCandidate: candidateId,
        idPost: postId,
      })
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("currentStep", "data.label data.type data.subtitle")
        .populate("steps.stepId", "data.label data.type data.subtitle order id")
        .populate("steps.interviewDetails", "type overallScore createdAt");

      if (!progress) {
        return { success: false, error: "Progress not found" };
      }
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Retrieve all candidate progress
  async getProgressByCandidate(candidateId) {
    try {
      const progress = await CandidatePostStepProgress.find({
        idCandidate: candidateId,
      })
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("currentStep", "data.label data.type data.subtitle")
        .populate("steps.stepId", "data.label data.type data.subtitle order id")
        .populate("steps.interviewDetails", "type overallScore createdAt")
        .sort({ updatedAt: -1 });

      // Return empty array if no progress found (this is not an error)
      return { success: true, data: progress || [] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Retrieve all progress for a specific post
  async getProgressByPost(postId) {
    try {
      const progress = await CandidatePostStepProgress.find({ idPost: postId })
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("currentStep", "data.label data.type")
        .populate("steps.stepId", "data.label data.type order")
        .populate("steps.interviewDetails", "type overallScore createdAt")
        .sort({ updatedAt: -1 });
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Retrieve progress by status
  async getProgressByStatus(status) {
    try {
      const progress = await CandidatePostStepProgress.find({ status })
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("currentStep", "data.label data.type")
        .populate("steps.stepId", "data.label data.type order")
        .populate("steps.interviewDetails", "type overallScore createdAt")
        .sort({ updatedAt: -1 });
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update a progress
  async updateProgress(id, updateData) {
    try {
      const updatedProgress = await CandidatePostStepProgress.findByIdAndUpdate(
        id,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("currentStep", "data.label data.type data.subtitle")
        .populate("steps.stepId", "data.label data.type data.subtitle order id")
        .populate("steps.interviewDetails", "type overallScore createdAt");

      if (!updatedProgress) {
        return { success: false, error: "Progress not found" };
      }
      return { success: true, data: updatedProgress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update progress for a specific candidate and post
  async updateProgressByCandidateAndPost(candidateId, postId, updateData) {
    try {
      const updatedProgress = await CandidatePostStepProgress.findOneAndUpdate(
        { idCandidate: candidateId, idPost: postId },
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      )
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("currentStep", "data.label data.type data.subtitle")
        .populate("steps.stepId", "data.label data.type data.subtitle order id")
        .populate("steps.interviewDetails", "type overallScore createdAt");

      if (!updatedProgress) {
        return { success: false, error: "Progress not found" };
      }
      return { success: true, data: updatedProgress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete progress
  async deleteProgress(id) {
    try {
      const deletedProgress = await CandidatePostStepProgress.findByIdAndDelete(
        id
      );
      if (!deletedProgress) {
        return { success: false, error: "Progress not found" };
      }
      return { success: true, data: deletedProgress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Delete candidate progress for a specific post
  async deleteProgressByCandidateAndPost(candidateId, postId) {
    try {
      const deletedProgress = await CandidatePostStepProgress.findOneAndDelete({
        idCandidate: candidateId,
        idPost: postId,
      });
      if (!deletedProgress) {
        return { success: false, error: "Progress not found" };
      }
      return { success: true, data: deletedProgress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Create or update progress (upsert)
  async upsertProgress(candidateId, postId, progressData) {
    try {
      const progress = await CandidatePostStepProgress.findOneAndUpdate(
        { idCandidate: candidateId, idPost: postId },
        {
          ...progressData,
          idCandidate: candidateId,
          idPost: postId,
          updatedAt: new Date(),
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      )
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("currentStep", "data.label data.type data.subtitle")
        .populate("steps.stepId", "data.label data.type data.subtitle order id")
        .populate("steps.interviewDetails", "type overallScore createdAt");

      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Retrieve progress statistics for a post
  async getProgressStatsByPost(postId) {
    try {
      const stats = await CandidatePostStepProgress.aggregate([
        { $match: { idPost: new mongoose.Types.ObjectId(postId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avgProgress: { $avg: { $toDouble: "$progress" } },
          },
        },
      ]);

      const totalCandidates = await CandidatePostStepProgress.countDocuments({
        idPost: postId,
      });

      return {
        success: true,
        data: {
          stats,
          totalCandidates,
          postId,
        },
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Retrieve candidates who completed a post
  async getCompletedCandidatesByPost(postId) {
    try {
      const completedCandidates = await CandidatePostStepProgress.find({
        idPost: postId,
        status: "completed",
      })
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("steps.stepId", "data.label data.type order")
        .populate("steps.interviewDetails", "type overallScore createdAt")
        .sort({ updatedAt: -1 });

      return { success: true, data: completedCandidates };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Retrieve candidates in progress for a post
  async getInProgressCandidatesByPost(postId) {
    try {
      const inProgressCandidates = await CandidatePostStepProgress.find({
        idPost: postId,
        status: { $in: ["in_progress", "started"] },
      })
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("steps.stepId", "data.label data.type order")
        .populate("steps.interviewDetails", "type overallScore createdAt")
        .sort({ updatedAt: -1 });

      return { success: true, data: inProgressCandidates };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Update status of a specific step
  async updateStepStatus(progressId, stepId, newStatus) {
    try {
      const progress = await CandidatePostStepProgress.findById(progressId);
      if (!progress) {
        return { success: false, error: "Progress not found" };
      }

      // Find the step in the steps array
      const stepIndex = progress.steps.findIndex(
        (step) => step.stepId.toString() === stepId.toString()
      );

      if (stepIndex === -1) {
        return { success: false, error: "Step not found in this progress" };
      }

      // Update step status
      progress.steps[stepIndex].status = newStatus;

      // If step is done, add completion date
      if (newStatus === "done") {
        progress.steps[stepIndex].completedAt = new Date();
      } else {
        progress.steps[stepIndex].completedAt = null;
      }

      // Update global status if necessary
      const allStepsDone = progress.steps.every(
        (step) => step.status === "done"
      );
      if (allStepsDone) {
        progress.status = "done";
      } else if (progress.steps.some((step) => step.status === "inProgress")) {
        progress.status = "inProgress";
      }

      progress.updatedAt = new Date();
      await progress.save();

      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Retrieve candidate progress with step details
  async getProgressWithStepDetails(candidateId, postId) {
    try {
      const progress = await CandidatePostStepProgress.findOne({
        idCandidate: candidateId,
        idPost: postId,
      })
        .populate("idCandidate", "name email")
        .populate("idPost", "jobDetails.title")
        .populate("currentStep", "data.label data.type")
        .populate("steps.stepId", "data.label data.type order")
        .populate("steps.interviewDetails", "type overallScore createdAt");

      if (!progress) {
        return { success: false, error: "Progress not found" };
      }
      return { success: true, data: progress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Mark step as in progress
  async startStep(progressId, stepId) {
    return this.updateStepStatus(progressId, stepId, "inProgress");
  }

  // Mark step as completed
  async completeStep(progressId, stepId) {
    return this.updateStepStatus(progressId, stepId, "done");
  }

  // Reset step
  async resetStep(progressId, stepId) {
    return this.updateStepStatus(progressId, stepId, "pending");
  }
}

module.exports = new CandidatePostStepProgressService();
