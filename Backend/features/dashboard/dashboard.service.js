const mongoose = require('mongoose');
const User = require("../users/user.model");
const Post = require('../posts/post.model');
const Feedback = require('../feedbacks/feedback.model');
const Profile = require('../users/profile.model');
const PostInterviewAssessment = require("../interviews/post-interview/post-interview.model");
const SkillInterviewAssessment = require("../interviews/skill-interview/skill-interview.model");
const JobApplication = require("../job-applications/job-application.model");
const { POST_STATUS } = require("../posts/posts.constants");
const InternalCampaign = require("../campaigns/campaign.model");
const CompanyMembership = require("../company-members/company-membership.model");
const Subscription = require("../billing/subscriptions/subscription.model");
const subscriptionService = require("../billing/subscriptions/subscription.service");
const planLimitsService = require("../billing/plans/plan-limits.service");
const ttlCache = require("../../utils/ttl-cache");

// Platform-wide counters/rollups don't need to be second-fresh — a short
// cache window absorbs repeated dashboard loads/tab-switches without
// re-running full-collection aggregations every time.
const COUNTS_CACHE_TTL_MS = 60 * 1000;

const ADMIN_USER_LIST_FIELDS = "username email role isVerified createdAt lastLogin Localisation ip profile";
const ADMIN_USER_LIST_PROFILE_FIELDS = "firstName lastName phone location company position";

module.exports.getAllUsers = async (searchQuery, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const query = {};
    if (searchQuery.username) query.username = { $regex: searchQuery.username, $options: 'i' };
    if (searchQuery.email) query.email = { $regex: searchQuery.email, $options: 'i' };
    if (searchQuery.role) query.role = searchQuery.role;

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select(ADMIN_USER_LIST_FIELDS)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('profile', ADMIN_USER_LIST_PROFILE_FIELDS)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users,
      pagination: { currentPage: parseInt(page), totalPages, totalUsers },
    };
  } catch (error) {
    throw new Error("Error retrieving users: " + error.message);
  }
};

module.exports.getCounts = () => ttlCache.getOrSet("dashboard:getCounts", COUNTS_CACHE_TTL_MS, _computeCounts);

async function _computeCounts() {
  try {
    const [userCount, postCount, jobAssessmentCount, feedbackCount] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      PostInterviewAssessment.countDocuments(),
      Feedback.countDocuments()
    ]);

    const totalSkillsPromise = Profile.aggregate([
      { $project: { totalHardSkills: { $size: { $ifNull: ["$skills", []] } }, totalSoftSkills: { $size: { $ifNull: ["$softSkills", []] } } } },
      { $group: { _id: null, totalHardSkillsCount: { $sum: "$totalHardSkills" }, totalSoftSkillsCount: { $sum: "$totalSoftSkills" }, totalSkillsCount: { $sum: { $add: ["$totalHardSkills", "$totalSoftSkills"] } } } }
    ]);

    const avgOverallScorePromise = PostInterviewAssessment.aggregate([
      { $match: { "interviewData.finalReport.coverage.overall": { $ne: null, $gt: 0 } } },
      { $group: { _id: null, avgOverallScore: { $avg: "$interviewData.finalReport.coverage.overall" } } }
    ]);

    const topSkillsPromise = Profile.aggregate([
      { $project: { skills: 1 } },
      { $unwind: { path: "$skills", preserveNullAndEmptyArrays: false } },
      { $group: { _id: "$skills.name", count: { $sum: 1 }, avgLevel: { $avg: "$skills.proficiencyLevel" } } },
      { $sort: { count: -1, avgLevel: -1 } },
      { $limit: 10 }
    ]);

    const jobAssessmentWithScoreCountPromise = PostInterviewAssessment.countDocuments({ "interviewData.finalReport.coverage.overall": { $gt: 0 } });

    const [totalSkillsResult, avgOverallScoreResult, topSkillsResult, jobAssessmentWithScoreCount] = await Promise.all([
      totalSkillsPromise,
      avgOverallScorePromise,
      topSkillsPromise,
      jobAssessmentWithScoreCountPromise
    ]);

    const totalHardSkillsCount = totalSkillsResult.length > 0 ? totalSkillsResult[0].totalHardSkillsCount : 0;
    const totalSoftSkillsCount = totalSkillsResult.length > 0 ? totalSkillsResult[0].totalSoftSkillsCount : 0;
    const totalSkillsCount = totalSkillsResult.length > 0 ? totalSkillsResult[0].totalSkillsCount : 0;

    const hardSkillsPercentage = totalSkillsCount > 0 ? (totalHardSkillsCount / totalSkillsCount) * 100 : 0;
    const softSkillsPercentage = totalSkillsCount > 0 ? (totalSoftSkillsCount / totalSkillsCount) * 100 : 0;
    const avgOverallScore = avgOverallScoreResult.length > 0 ? avgOverallScoreResult[0].avgOverallScore : 0;
    const jobAssessmentWithScorePercentage = jobAssessmentCount > 0 ? (jobAssessmentWithScoreCount / jobAssessmentCount) * 100 : 0;

    return {
      users: userCount,
      posts: postCount,
      jobAssessments: jobAssessmentCount,
      jobAssessmentsWithScore: jobAssessmentWithScoreCount,
      jobAssessmentsWithScorePercentage: jobAssessmentWithScorePercentage,
      feedback: feedbackCount,
      avgOverallScore,
      totalSkills: totalSkillsCount,
      totalHardSkills: totalHardSkillsCount,
      totalSoftSkills: totalSoftSkillsCount,
      hardSkillsPercentage,
      softSkillsPercentage,
      topSkills: topSkillsResult
    };
  } catch (error) {
    throw new Error('Error fetching counts: ' + error.message);
  }
}

module.exports.getCountsByDay = () => ttlCache.getOrSet("dashboard:getCountsByDay", COUNTS_CACHE_TTL_MS, _computeCountsByDay);

async function _computeCountsByDay() {
  try {
    const usersByDayAgg = User.aggregate([
      { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } },
      { $group: { _id: "$day", userCount: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const postsByDayAgg = Post.aggregate([
      { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } } } },
      { $group: { _id: "$day", postCount: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const jobAssessmentsByDayAgg = PostInterviewAssessment.aggregate([
      { $project: { day: { $dateToString: { format: "%Y-%m-%d", date: { $ifNull: ["$timestamp", "$createdAt"] } } } } },
      { $group: { _id: "$day", jobAssessmentCount: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const [usersCreatedByDay, postsCreatedByDay, jobAssessmentsCreatedByDay, totalUsers, totalPosts, totalJobAssessments] = await Promise.all([
      usersByDayAgg,
      postsByDayAgg,
      jobAssessmentsByDayAgg,
      User.countDocuments(),
      Post.countDocuments(),
      PostInterviewAssessment.countDocuments()
    ]);

    const usersWithPercentage = usersCreatedByDay
      .filter(d => d._id)
      .map(d => ({ day: d._id, userCount: d.userCount, percentage: (totalUsers > 0 ? ((d.userCount / totalUsers) * 100) : 0).toFixed(2) }));

    const postsWithPercentage = postsCreatedByDay
      .filter(d => d._id)
      .map(d => ({ day: d._id, postCount: d.postCount, percentage: (totalPosts > 0 ? ((d.postCount / totalPosts) * 100) : 0).toFixed(2) }));

    const jobAssessmentsWithPercentage = jobAssessmentsCreatedByDay
      .filter(d => d._id)
      .map(d => ({ day: d._id, jobAssessmentCount: d.jobAssessmentCount, percentage: (totalJobAssessments > 0 ? ((d.jobAssessmentCount / totalJobAssessments) * 100) : 0).toFixed(2) }));

    return {
      usersCreatedByDay: usersWithPercentage,
      postsCreatedByDay: postsWithPercentage,
      jobAssessmentsCreatedByDay: jobAssessmentsWithPercentage
    };
  } catch (error) {
    throw new Error('Error fetching counts by day: ' + error.message);
  }
}

module.exports.getStatsCards = async (userId) => {
  try {
    const [totalUsers, avgOverallScoreAgg, openPostsCount, activeCampaignsCount] = await Promise.all([
      CompanyMembership.countDocuments({ company: userId, status: "active" }),
      PostInterviewAssessment.aggregate([
        { $match: { company: new mongoose.Types.ObjectId(userId), archived: { $ne: true }, "interviewData.finalReport.coverage.overall": { $ne: null } } },
        { $group: { _id: null, avgOverallScore: { $avg: "$interviewData.finalReport.coverage.overall" } } }
      ]),
      Post.countDocuments({ user: userId, status: POST_STATUS.OPEN, archived: { $ne: true } }),
      InternalCampaign.countDocuments({ company: userId, status: "ACTIVE" })
    ]);

    const avgOverall = (avgOverallScoreAgg && avgOverallScoreAgg.length > 0) ? Math.round(avgOverallScoreAgg[0].avgOverallScore) : 0;

    return {
      totalEmployees: totalUsers,
      avgInterviewScore: avgOverall,
      activeJobPosts: openPostsCount,
      activeCampaigns: activeCampaignsCount
    };
  } catch (error) {
    throw new Error('Error fetching statsCards: ' + error.message);
  }
};

module.exports.getRichStats = async (userId) => {
  try {
    const oid = new mongoose.Types.ObjectId(userId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [scoreDistAgg, trendAgg, topJobsAgg, passRateAgg] = await Promise.all([
      PostInterviewAssessment.aggregate([
        { $match: { company: oid, archived: { $ne: true }, "interviewData.finalReport.scores.overall": { $exists: true } } },
        { $bucket: {
          groupBy: "$interviewData.finalReport.scores.overall",
          boundaries: [0, 20, 40, 60, 80, 101],
          default: "other",
          output: { count: { $sum: 1 } }
        }}
      ]),
      PostInterviewAssessment.aggregate([
        { $match: { company: oid, archived: { $ne: true }, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          avgScore: { $avg: "$interviewData.finalReport.scores.overall" }
        }},
        { $sort: { _id: 1 } }
      ]),
      PostInterviewAssessment.aggregate([
        { $match: { company: oid, archived: { $ne: true } } },
        { $group: { _id: "$post", count: { $sum: 1 }, avgScore: { $avg: "$interviewData.finalReport.scores.overall" } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $lookup: { from: "posts", localField: "_id", foreignField: "_id", as: "postDoc" } },
        { $unwind: { path: "$postDoc", preserveNullAndEmptyArrays: true } },
        { $project: { title: { $ifNull: ["$postDoc.jobDetails.title", "Unknown"] }, count: 1, avgScore: { $round: ["$avgScore", 0] } } }
      ]),
      PostInterviewAssessment.aggregate([
        { $match: { company: oid, archived: { $ne: true }, "interviewData.finalReport.scores.overall": { $exists: true } } },
        { $group: {
          _id: null,
          total: { $sum: 1 },
          passed: { $sum: { $cond: [{ $gte: ["$interviewData.finalReport.scores.overall", 60] }, 1, 0] } }
        }}
      ])
    ]);

    const bucketMap = { 0: "0-20", 20: "20-40", 40: "40-60", 60: "60-80", 80: "80-100" };
    const allBuckets = [0, 20, 40, 60, 80];
    const scoreDistribution = allBuckets.map(id => ({
      range: bucketMap[id],
      count: scoreDistAgg.find(b => b._id === id)?.count || 0
    }));

    const passRateData = passRateAgg[0] || { total: 0, passed: 0 };
    const passRate = passRateData.total > 0 ? Math.round((passRateData.passed / passRateData.total) * 100) : 0;
    const totalInterviews = await PostInterviewAssessment.countDocuments({ company: oid, archived: { $ne: true } });

    return { scoreDistribution, trend: trendAgg, topJobs: topJobsAgg, passRate, totalInterviews };
  } catch (error) {
    throw new Error('Error fetching rich stats: ' + error.message);
  }
};

// Platform-wide revenue/plan-distribution summary, derived from active
// subscriptions joined to their plan price — admin-only, so a short cache
// window is fine (no per-user variance to worry about).
module.exports.getAdminRevenueSummary = () => ttlCache.getOrSet("dashboard:getAdminRevenueSummary", COUNTS_CACHE_TTL_MS, _computeAdminRevenueSummary);

async function _computeAdminRevenueSummary() {
  try {
    const now = new Date();

    const byPlan = await Subscription.aggregate([
      { $match: { status: "active", endDate: { $gt: now } } },
      { $lookup: { from: "planlimits", localField: "planId", foreignField: "_id", as: "plan" } },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: false } },
      {
        $group: {
          _id: "$plan._id",
          planName: { $first: "$plan.name" },
          priceUsd: { $first: "$plan.priceUsd" },
          activeSubscriptions: { $sum: 1 },
        },
      },
      { $project: { _id: 0, planId: "$_id", planName: 1, priceUsd: 1, activeSubscriptions: 1, mrr: { $multiply: ["$priceUsd", "$activeSubscriptions"] } } },
      { $sort: { mrr: -1 } },
    ]);

    const totalActiveSubscriptions = byPlan.reduce((sum, p) => sum + p.activeSubscriptions, 0);
    const mrr = byPlan.reduce((sum, p) => sum + p.mrr, 0);

    return { mrr, totalActiveSubscriptions, byPlan };
  } catch (error) {
    throw new Error('Error fetching admin revenue summary: ' + error.message);
  }
}

// Most recently created users, for an admin "recent signups" feed.
module.exports.getRecentSignups = (limit = 8) =>
  ttlCache.getOrSet(`dashboard:getRecentSignups:${limit}`, COUNTS_CACHE_TTL_MS, () => _computeRecentSignups(limit));

async function _computeRecentSignups(limit) {
  try {
    return await User.find({})
      .select(ADMIN_USER_LIST_FIELDS)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('profile', ADMIN_USER_LIST_PROFILE_FIELDS)
      .lean();
  } catch (error) {
    throw new Error('Error fetching recent signups: ' + error.message);
  }
}

// ========== ADMIN MODERATION — Posts ==========
// Cross-tenant equivalents of post.service.js's company-scoped functions — no
// `user: userId` ownership check, since an admin must be able to act on any
// company's post.

module.exports.getAllPostsForAdmin = async (filters = {}, page = 1, limit = 10) => {
  try {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (filters.status) query.status = filters.status;
    if (filters.archived === true || filters.archived === 'true') query.archived = true;
    else if (filters.archived === false || filters.archived === 'false') query.archived = { $ne: true };
    if (filters.search && filters.search.trim() !== '') {
      query['jobDetails.title'] = { $regex: filters.search.trim(), $options: 'i' };
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .select('-MatchingConfig')
        .populate('user', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);
    return {
      data: posts,
      currentPage: pageNum,
      totalPages,
      totalCount: total,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    };
  } catch (error) {
    throw new Error(`Error fetching posts for admin: ${error.message}`);
  }
};

module.exports.archivePostAdmin = async (postId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const err = new Error('Post not found');
      err.status = 404;
      throw err;
    }

    await Promise.all([
      PostInterviewAssessment.updateMany({ post: postId }, { archived: true, archivedAt: new Date() }),
      JobApplication.updateMany({ post: postId }, { isArchived: true }),
    ]);

    return await Post.findByIdAndUpdate(postId, { archived: true, archivedAt: new Date() }, { new: true });
  } catch (error) {
    throw new Error(`Error archiving post: ${error.message}`);
  }
};

module.exports.unarchivePostAdmin = async (postId) => {
  try {
    const post = await Post.findByIdAndUpdate(postId, { archived: false, archivedAt: null }, { new: true });
    if (!post) {
      const err = new Error('Post not found');
      err.status = 404;
      throw err;
    }

    await Promise.all([
      PostInterviewAssessment.updateMany({ post: postId }, { archived: false, archivedAt: null }),
      JobApplication.updateMany({ post: postId }, { isArchived: false }),
    ]);

    return post;
  } catch (error) {
    throw new Error(`Error unarchiving post: ${error.message}`);
  }
};

module.exports.hardDeletePostAdmin = async (postId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const err = new Error('Post not found');
      err.status = 404;
      throw err;
    }

    await Promise.all([
      PostInterviewAssessment.deleteMany({ post: postId }),
      JobApplication.deleteMany({ post: postId }),
    ]);

    await Post.findByIdAndDelete(postId);
    return { deletedPostId: postId };
  } catch (error) {
    throw new Error(`Error deleting post: ${error.message}`);
  }
};

// ========== ADMIN MODERATION — Post Interview Assessments ==========

module.exports.getAllPostInterviewAssessmentsForAdmin = async (filters = {}, page = 1, limit = 10) => {
  try {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (filters.post) query.post = filters.post;
    if (filters.candidate) query.candidate = filters.candidate;
    if (filters.company) query.company = filters.company;
    if (filters.archived === true || filters.archived === 'true') query.archived = true;
    else if (filters.archived === false || filters.archived === 'false') query.archived = { $ne: true };

    const [assessments, totalCount] = await Promise.all([
      PostInterviewAssessment.find(query)
        .populate('post', 'jobDetails.title jobDetails.location jobDetails.employmentType')
        .populate('candidate', 'username email')
        .populate('company', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      PostInterviewAssessment.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    return {
      data: assessments,
      currentPage: pageNum,
      totalPages,
      totalCount,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    };
  } catch (error) {
    throw new Error(`Error fetching post-interview assessments for admin: ${error.message}`);
  }
};

module.exports.archivePostInterviewAssessmentAdmin = async (assessmentId) => {
  const assessment = await PostInterviewAssessment.findByIdAndUpdate(
    assessmentId,
    { archived: true, archivedAt: new Date() },
    { new: true }
  );
  if (!assessment) {
    const err = new Error('Assessment not found');
    err.status = 404;
    throw err;
  }
  return assessment;
};

module.exports.unarchivePostInterviewAssessmentAdmin = async (assessmentId) => {
  const assessment = await PostInterviewAssessment.findByIdAndUpdate(
    assessmentId,
    { archived: false, archivedAt: null },
    { new: true }
  );
  if (!assessment) {
    const err = new Error('Assessment not found');
    err.status = 404;
    throw err;
  }
  return assessment;
};

module.exports.hardDeletePostInterviewAssessmentAdmin = async (assessmentId) => {
  const assessment = await PostInterviewAssessment.findByIdAndDelete(assessmentId);
  if (!assessment) {
    const err = new Error('Assessment not found');
    err.status = 404;
    throw err;
  }
  // Clear the dangling back-reference so a deleted assessment doesn't leave
  // a JobApplication pointing at (and showing a stale score for) nothing.
  await JobApplication.updateMany(
    { interviewAssessment: assessmentId },
    { interviewAssessment: null, assessmentScore: null },
  );
  return { deletedAssessmentId: assessmentId };
};

// ========== ADMIN MODERATION — Skill Interview Assessments ==========

module.exports.getAllSkillInterviewAssessmentsForAdmin = async (filters = {}, page = 1, limit = 10) => {
  try {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (filters.interviewType) query['interviewData.interviewType'] = filters.interviewType;
    if (filters.skillType) query.skillType = filters.skillType;
    if (filters.candidateId) query.candidateId = filters.candidateId;
    if (filters.archived === true || filters.archived === 'true') query.archived = true;
    else if (filters.archived === false || filters.archived === 'false') query.archived = { $ne: true };

    const [assessments, totalCount] = await Promise.all([
      SkillInterviewAssessment.find(query)
        .populate('candidateId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      SkillInterviewAssessment.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);
    return {
      data: assessments,
      currentPage: pageNum,
      totalPages,
      totalCount,
      limit: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    };
  } catch (error) {
    throw new Error(`Error fetching skill-interview assessments for admin: ${error.message}`);
  }
};

module.exports.archiveSkillInterviewAssessmentAdmin = async (assessmentId) => {
  const assessment = await SkillInterviewAssessment.findByIdAndUpdate(
    assessmentId,
    { archived: true, archivedAt: new Date() },
    { new: true }
  );
  if (!assessment) {
    const err = new Error('Assessment not found');
    err.status = 404;
    throw err;
  }
  return assessment;
};

module.exports.unarchiveSkillInterviewAssessmentAdmin = async (assessmentId) => {
  const assessment = await SkillInterviewAssessment.findByIdAndUpdate(
    assessmentId,
    { archived: false, archivedAt: null },
    { new: true }
  );
  if (!assessment) {
    const err = new Error('Assessment not found');
    err.status = 404;
    throw err;
  }
  return assessment;
};

module.exports.hardDeleteSkillInterviewAssessmentAdmin = async (assessmentId) => {
  const assessment = await SkillInterviewAssessment.findByIdAndDelete(assessmentId);
  if (!assessment) {
    const err = new Error('Assessment not found');
    err.status = 404;
    throw err;
  }
  // Pull the dangling id out of the candidate's Profile.interviewDetails so
  // their own assessment history list doesn't reference a deleted document.
  await Profile.updateMany(
    { interviewDetails: assessmentId },
    { $pull: { interviewDetails: assessmentId } },
  );
  return { deletedAssessmentId: assessmentId };
};

// ========== ADMIN MODERATION — Subscriptions ==========
// Thin delegation to subscription.service.js — its aggregation pipelines and
// validation already live there and are shared with non-admin subscription
// routes, so the logic stays put; only the admin-only route surface moves here.

module.exports.searchCompaniesForAdmin = (search) => subscriptionService.searchCompanies(search);

module.exports.getAllCompaniesWithSubscriptionsForAdmin = (params) => subscriptionService.getAllCompaniesWithSubscriptions(params);

module.exports.adminCreateSubscription = (payload) => subscriptionService.adminCreateSubscription(payload);

// ========== ADMIN MODERATION — Plans ==========
// Same delegation pattern — plan-limits.service.js also serves the public
// getAllPlans/getPlanById reads, so only the admin-only mutations move here.

module.exports.createPlanForAdmin = (planData) => planLimitsService.createPlan(planData);

module.exports.updatePlanForAdmin = (planName, updateData) => planLimitsService.updatePlanByName(planName, updateData);
