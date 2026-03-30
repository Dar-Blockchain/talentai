const candidatePostStepProgressService = require("../services/candidatePostStepProgress.service");

class CandidatePostStepProgressController {
  // Create new candidate progress
  async createProgress(req, res) {
    try {
      const result = await candidatePostStepProgressService.createProgress(
        req.body,
      );

      if (result.success) {
        return res.status(201).json({
          success: true,
          message: "Candidate progress created successfully",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Error creating progress",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Retrieve all progress
  async getAllProgress(req, res) {
    try {
      const result = await candidatePostStepProgressService.getAllProgress();

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progress retrieved successfully",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Error retrieving progress",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Retrieve progress by candidate ID
  async getProgressById(req, res) {
    try {
      const { id } = req.params;
      const result = await candidatePostStepProgressService.getProgressById(id);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progress retrieved successfully",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progress not found",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Retrieve progress by candidate ID
  async findByIdCandidate(req, res) {
    try {
      const candidateId = req.user._id;
      console.log("candidateId", candidateId);

      const result =
        await candidatePostStepProgressService.getProgressByCandidate(
          candidateId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progress retrieved successfully",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progress not found",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Retrieve candidate progress for a specific post
  async getProgressByCandidateAndPost(req, res) {
    try {
      const { candidateId, postId } = req.params;
      const result =
        await candidatePostStepProgressService.getProgressByCandidateAndPost(
          candidateId,
          postId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progress retrieved successfully",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progress not found",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Retrieve all progress for a candidate
  async getProgressByCandidate(req, res) {
    try {
      const { candidateId } = req.params;
      const result =
        await candidatePostStepProgressService.getProgressByCandidate(
          candidateId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Candidate progress retrieved successfully",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Error retrieving progress",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Retrieve all progress for a specific post
  async getProgressByPost(req, res) {
    try {
      const { postId } = req.params;
      const result =
        await candidatePostStepProgressService.getProgressByPost(postId);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Post progress retrieved successfully",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Error retrieving progress",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Retrieve progress by status
  async getProgressByStatus(req, res) {
    try {
      const { status } = req.params;
      const result =
        await candidatePostStepProgressService.getProgressByStatus(status);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progress retrieved successfully",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Error retrieving progress",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Update progress
  async updateProgress(req, res) {
    try {
      const { id } = req.params;
      const result = await candidatePostStepProgressService.updateProgress(
        id,
        req.body,
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progress updated successfully",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progress not found",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Update candidate progress for a specific post
  async updateProgressByCandidateAndPost(req, res) {
    try {
      const { candidateId, postId } = req.params;
      const result =
        await candidatePostStepProgressService.updateProgressByCandidateAndPost(
          candidateId,
          postId,
          req.body,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progress updated successfully",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progress not found",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Delete progress
  async deleteProgress(req, res) {
    try {
      const { id } = req.params;
      const result = await candidatePostStepProgressService.deleteProgress(id);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progress deleted successfully",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progress not found",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Delete candidate progress for a specific post
  async deleteProgressByCandidateAndPost(req, res) {
    try {
      const { candidateId, postId } = req.params;
      const result =
        await candidatePostStepProgressService.deleteProgressByCandidateAndPost(
          candidateId,
          postId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progress deleted successfully",
          data: result.data,
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Progress not found",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Create or update progress (upsert)
  async upsertProgress(req, res) {
    try {
      const { candidateId, postId } = req.params;
      const result = await candidatePostStepProgressService.upsertProgress(
        candidateId,
        postId,
        req.body,
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Progress created or updated successfully",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Error creating/updating progress",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Retrieve progress statistics for a post
  async getProgressStatsByPost(req, res) {
    try {
      const { postId } = req.params;
      const result =
        await candidatePostStepProgressService.getProgressStatsByPost(postId);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Statistics retrieved successfully",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Error retrieving statistics",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Retrieve candidates who completed a post
  async getCompletedCandidatesByPost(req, res) {
    try {
      const { postId } = req.params;
      const result =
        await candidatePostStepProgressService.getCompletedCandidatesByPost(
          postId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "Completed candidates retrieved successfully",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Error retrieving completed candidates",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }

  // Retrieve in-progress candidates for a post
  async getInProgressCandidatesByPost(req, res) {
    try {
      const { postId } = req.params;
      const result =
        await candidatePostStepProgressService.getInProgressCandidatesByPost(
          postId,
        );

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: "In-progress candidates retrieved successfully",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Error retrieving in-progress candidates",
          error: result.error,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  }
}

module.exports = new CandidatePostStepProgressController();
