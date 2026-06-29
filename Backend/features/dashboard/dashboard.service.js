const mongoose = require('mongoose');
const User = require("../users/user.model");
const Post = require('../posts/post.model');
const Feedback = require('../feedbacks/feedback.model');
const Profile      = require('../users/profile.model');
const ProfileSkill = require('../skills/profile-skill.model');
const PostInterviewAssessment = require("../interviews/post-interview/post-interview.model");
const { POST_STATUS } = require("../posts/posts.constants");
const InternalCampaign = require("../campaigns/campaign.model");
const CompanyMembership = require("../company-members/company-membership.model");
const Subscription = require("../billing/subscriptions/subscription.model");
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

    const totalSkillsPromise = Promise.all([
      ProfileSkill.countDocuments({ kind: "technical" }),
      ProfileSkill.countDocuments({ kind: "soft" }),
    ]);

    const avgOverallScorePromise = PostInterviewAssessment.aggregate([
      { $match: { "interviewData.finalReport.coverage.overall": { $ne: null, $gt: 0 } } },
      { $group: { _id: null, avgOverallScore: { $avg: "$interviewData.finalReport.coverage.overall" } } }
    ]);

    const topSkillsPromise = ProfileSkill.aggregate([
      { $match: { kind: "technical" } },
      { $group: { _id: "$name", count: { $sum: 1 }, avgLevel: { $avg: "$proficiencyLevel" } } },
      { $sort: { count: -1, avgLevel: -1 } },
      { $limit: 10 },
    ]);

    const jobAssessmentWithScoreCountPromise = PostInterviewAssessment.countDocuments({ "interviewData.finalReport.coverage.overall": { $gt: 0 } });

    const [[totalSkillsResult, avgOverallScoreResult, topSkillsResult, jobAssessmentWithScoreCount]] = await Promise.all([
      Promise.all([totalSkillsPromise, avgOverallScorePromise, topSkillsPromise, jobAssessmentWithScoreCountPromise]),
    ]);

    const [totalHardSkillsCount, totalSoftSkillsCount] = totalSkillsResult;
    const totalSkillsCount = totalHardSkillsCount + totalSoftSkillsCount;

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
module.exports.getRecentSignups = async (limit = 8) => {
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
};
