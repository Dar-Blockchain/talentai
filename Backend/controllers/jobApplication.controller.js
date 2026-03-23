const jobApplicationService = require("../services/jobApplication.service");

// Centralized error handler
const handleError = (res, error, defaultStatus = 500) => {
  console.error("JobApplication error:", error?.message || error);
  const status = error?.status || defaultStatus;
  res.status(status).json({
    success: false,
    error: error?.message || "Internal server error",
  });
};

// ========== CREATE ==========
module.exports.createJobApplication = async (req, res) => {
  try {
    // Only accept: profile, post, company, applicationMessage, cvAnalysis
    // matchScore is NOT accepted and will be calculated automatically
    const { profile, post, company, applicationMessage, cvAnalysis } = req.body;

    // Validation
    if (!profile || !post || !company) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: profile, post, company",
      });
    }

    const applicationData = {
      profile,
      post,
      company,
      applicationMessage: applicationMessage || "",
      cvAnalysis: cvAnalysis || null,
      // matchScore will be calculated automatically - DO NOT SET IT HERE
    };

    const application = await jobApplicationService.createJobApplication(
      applicationData
    );

    res.status(201).json({
      success: true,
      message: "Job application created successfully (match score calculated by AI)",
      data: application,
    });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// ========== READ - Get all applications ==========
module.exports.getAllJobApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, profile, post, company, status } = req.query;

    const filters = {};
    if (profile) filters.profile = profile;
    if (post) filters.post = post;
    if (company) filters.company = company;
    if (status) filters.status = status;

    const result = await jobApplicationService.getAllJobApplications(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Job applications retrieved successfully",
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== READ - Get by ID ==========
module.exports.getJobApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }

    const application = await jobApplicationService.getJobApplicationById(
      applicationId
    );

    res.status(200).json({
      success: true,
      message: "Job application retrieved successfully",
      data: application,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== READ - Get applications by candidate ==========
module.exports.getApplicationsByCandidate = async (req, res) => {
  try {
    const candidateId = req.user._id;
    const { page = 1, limit = 10, status, isArchived } = req.query;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        error: "Candidate ID is required",
      });
    }

    const filters = {};
    if (status) filters.status = status;
    if (isArchived !== undefined) filters.isArchived = isArchived === "true";

    // Find profile for this user
    const Profile = require("../../models/Profile.model");
    const profile = await Profile.findOne({ userId: candidateId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Candidate profile not found",
      });
    }

    const result = await jobApplicationService.getApplicationsByCandidate(
      profile._id,
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Job applications retrieved successfully",
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== READ - Get applications by post ==========
module.exports.getApplicationsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        error: "Post ID is required",
      });
    }

    const filters = {};
    if (status) filters.status = status;
    if (search) filters.search = search;

    const result = await jobApplicationService.getApplicationsByPost(
      postId,
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Job applications retrieved successfully",
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== READ - Get applications by company ==========
module.exports.getApplicationsByCompany = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { page = 1, limit = 10, post, status, search } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      });
    }

    const filters = {};
    if (post) filters.post = post;
    if (status) filters.status = status;
    if (search) filters.search = search;

    const result = await jobApplicationService.getApplicationsByCompany(
      companyId,
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Job applications retrieved successfully",
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== UPDATE ==========
module.exports.updateJobApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const updateData = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }

    const application = await jobApplicationService.updateJobApplication(
      applicationId,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Job application updated successfully",
      data: application,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== WITHDRAW APPLICATION ==========
module.exports.withdrawJobApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }

    const application = await jobApplicationService.withdrawJobApplication(
      applicationId
    );

    res.status(200).json({
      success: true,
      message: "Job application withdrawn successfully",
      data: application,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== ARCHIVE APPLICATION ==========
module.exports.archiveJobApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }

    const application = await jobApplicationService.archiveJobApplication(
      applicationId
    );

    res.status(200).json({
      success: true,
      message: "Job application archived successfully",
      data: application,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== DELETE ==========
module.exports.deleteJobApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }

    const application = await jobApplicationService.deleteJobApplication(
      applicationId
    );

    res.status(200).json({
      success: true,
      message: "Job application deleted successfully",
      data: application,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== GET STATISTICS ==========
module.exports.getApplicationStats = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      });
    }

    const stats = await jobApplicationService.getApplicationStats(
      companyId,
      postId || null
    );

    res.status(200).json({
      success: true,
      message: "Application statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    handleError(res, error);
  }
};
