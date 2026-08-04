const dashboardService = require("./dashboard.service");

module.exports.getAllUsers = async (req, res) => {
  try {
    const {
      username = "",
      email = "",
      role = "",
      page = 1,
      limit = 10,
    } = req.query;

    const searchQuery = { username, email, role };
    const result = await dashboardService.getAllUsers(searchQuery, page, limit);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error retrieving users" });
  }
};

module.exports.getCounts = async (req, res) => {
  try {
    const counts = await dashboardService.getCounts();
    res.status(200).json({ success: true, data: counts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getStatsCards = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID missing in request' });
    }
    const { postId, dateFrom } = req.query;
    const stats = await dashboardService.getStatsCards(userId, postId || null, dateFrom || null);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getCountsByDay = async (req, res) => {
  try {
    const countsByDay = await dashboardService.getCountsByDay();
    res.status(200).json({ success: true, data: countsByDay });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getRichStats = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(400).json({ success: false, message: 'User ID missing' });
    const data = await dashboardService.getRichStats(userId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getAdminRevenueSummary = async (req, res) => {
  try {
    const data = await dashboardService.getAdminRevenueSummary();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports.getRecentSignups = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 25);
    const data = await dashboardService.getRecentSignups(limit);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const handleError = (res, error, defaultStatus = 500) => {
  console.error("Dashboard admin moderation error:", error?.message || error);
  const status = error?.status || defaultStatus;
  res.status(status).json({ success: false, message: error?.message || "Internal error" });
};

// ========== ADMIN MODERATION — Posts ==========
module.exports.getAllPostsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, archived, search } = req.query;
    const result = await dashboardService.getAllPostsForAdmin({ status, archived, search }, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports.archivePostAdmin = async (req, res) => {
  try {
    const post = await dashboardService.archivePostAdmin(req.params.id);
    res.status(200).json({ success: true, data: post, message: "Post archived successfully" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.unarchivePostAdmin = async (req, res) => {
  try {
    const post = await dashboardService.unarchivePostAdmin(req.params.id);
    res.status(200).json({ success: true, data: post, message: "Post unarchived successfully" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.hardDeletePostAdmin = async (req, res) => {
  try {
    const result = await dashboardService.hardDeletePostAdmin(req.params.id);
    res.status(200).json({ success: true, data: result, message: "Post permanently deleted" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.updatePostThresholdAdmin = async (req, res) => {
  try {
    const post = await dashboardService.updatePostThresholdAdmin(req.params.id, req.body.thresholdScore);
    res.status(200).json({ success: true, data: post, message: "Threshold score updated successfully" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// ========== ADMIN MODERATION — Post Interview Assessments ==========
module.exports.getAllPostInterviewAssessmentsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, post, candidate, company, archived } = req.query;
    const filters = {};
    if (post) filters.post = post;
    if (candidate) filters.candidate = candidate;
    if (company) filters.company = company;
    if (archived !== undefined) filters.archived = archived;

    const result = await dashboardService.getAllPostInterviewAssessmentsForAdmin(filters, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports.archivePostInterviewAssessmentAdmin = async (req, res) => {
  try {
    const assessment = await dashboardService.archivePostInterviewAssessmentAdmin(req.params.assessmentId);
    res.status(200).json({ success: true, data: assessment, message: "Assessment archived successfully" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.unarchivePostInterviewAssessmentAdmin = async (req, res) => {
  try {
    const assessment = await dashboardService.unarchivePostInterviewAssessmentAdmin(req.params.assessmentId);
    res.status(200).json({ success: true, data: assessment, message: "Assessment unarchived successfully" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.hardDeletePostInterviewAssessmentAdmin = async (req, res) => {
  try {
    const result = await dashboardService.hardDeletePostInterviewAssessmentAdmin(req.params.assessmentId);
    res.status(200).json({ success: true, data: result, message: "Assessment permanently deleted" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// ========== ADMIN MODERATION — Skill Interview Assessments ==========
module.exports.getAllSkillInterviewAssessmentsForAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 10, interviewType, skillType, candidateId, archived } = req.query;
    const filters = {};
    if (interviewType) filters.interviewType = interviewType;
    if (skillType) filters.skillType = skillType;
    if (candidateId) filters.candidateId = candidateId;
    if (archived !== undefined) filters.archived = archived;

    const result = await dashboardService.getAllSkillInterviewAssessmentsForAdmin(filters, page, limit);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports.archiveSkillInterviewAssessmentAdmin = async (req, res) => {
  try {
    const assessment = await dashboardService.archiveSkillInterviewAssessmentAdmin(req.params.id);
    res.status(200).json({ success: true, data: assessment, message: "Assessment archived successfully" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.unarchiveSkillInterviewAssessmentAdmin = async (req, res) => {
  try {
    const assessment = await dashboardService.unarchiveSkillInterviewAssessmentAdmin(req.params.id);
    res.status(200).json({ success: true, data: assessment, message: "Assessment unarchived successfully" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.hardDeleteSkillInterviewAssessmentAdmin = async (req, res) => {
  try {
    const result = await dashboardService.hardDeleteSkillInterviewAssessmentAdmin(req.params.id);
    res.status(200).json({ success: true, data: result, message: "Assessment permanently deleted" });
  } catch (error) {
    handleError(res, error, 400);
  }
};

// ========== ADMIN MODERATION — Subscriptions ==========
module.exports.searchCompaniesForAdmin = async (req, res) => {
  try {
    const result = await dashboardService.searchCompaniesForAdmin(req.query.search);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports.getAllCompaniesWithSubscriptionsForAdmin = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const result = await dashboardService.getAllCompaniesWithSubscriptionsForAdmin({ search, page: Number(page), limit: Number(limit) });
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error);
  }
};

module.exports.adminCreateSubscription = async (req, res) => {
  try {
    const { companyProfileId, planId, startDate, notes } = req.body;
    const result = await dashboardService.adminCreateSubscription({ companyProfileId, planId, startDate, notes });
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error, 400);
  }
};

// ========== ADMIN MODERATION — Plans ==========
module.exports.createPlanForAdmin = async (req, res) => {
  try {
    const { name, postsLimit, monthlyInterviewLimit, durationDays, priceUsd, description, isActive } = req.body;
    const result = await dashboardService.createPlanForAdmin({ name, postsLimit, monthlyInterviewLimit, durationDays, priceUsd, description, isActive });
    res.status(201).json(result);
  } catch (error) {
    handleError(res, error, 400);
  }
};

module.exports.updatePlanForAdmin = async (req, res) => {
  try {
    const { name, ...updateData } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "Plan name is required in request body" });
    const result = await dashboardService.updatePlanForAdmin(name, updateData);
    res.status(200).json(result);
  } catch (error) {
    handleError(res, error, 400);
  }
};
