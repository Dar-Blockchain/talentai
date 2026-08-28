const InternalCampaign = require("./campaign.model");
const CampaignParticipant = require("./campaign-participant.model");
const CampaignResponse = require("./campaign-response.model");
const mongoose = require("mongoose");

exports.createCampaign = async (campaignData) => {
  try {
    if (!campaignData.module || typeof campaignData.module !== "object") {
      const err = new Error("Invalid module format; expected object");
      err.status = 400;
      throw err;
    }
    const campaign = new InternalCampaign(campaignData);
    await campaign.save();
    await campaign.populate("company", "username email role");
    await campaign.populate("createdBy", "username email");
    return campaign;
  } catch (error) {
    const err = new Error(`Error creating campaign: ${error.message}`);
    err.status = 400;
    throw err;
  }
};

exports.getCampaignById = async (campaignId) => {
  try {
    const campaign = await InternalCampaign.findById(campaignId)
      .populate("company", "username email role")
      .populate("createdBy", "username email");
    return campaign;
  } catch (error) {
    const err = new Error(`Error fetching campaign: ${error.message}`);
    err.status = 404;
    throw err;
  }
};


exports.getCampaignsByCompanyPaginated = async (companyId, page = 1, limit = 10, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const query = { company: companyId, ...filters };
    const data = await InternalCampaign.find(query)
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const total = await InternalCampaign.countDocuments(query);
    return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
  } catch (error) {
    throw new Error(`Error fetching company campaigns: ${error.message}`);
  }
};

exports.updateCampaign = async (campaignId, updateData) => {
  try {
    delete updateData.company;
    delete updateData.createdBy;
    delete updateData.linkToken;
    if (updateData.module && typeof updateData.module !== "object") {
      throw new Error("Invalid module format during update; expected object");
    }
    const campaign = await InternalCampaign.findByIdAndUpdate(
      campaignId,
      updateData,
      { new: true, runValidators: true },
    ).populate([
      { path: "company", select: "username email role" },
      { path: "createdBy", select: "username email" },
    ]);
    return campaign;
  } catch (error) {
    throw new Error(`Error updating campaign: ${error.message}`);
  }
};

exports.deleteCampaign = async (campaignId) => {
  try {
    await CampaignParticipant.deleteMany({ campaign: campaignId });
    const result = await InternalCampaign.findByIdAndDelete(campaignId);
    return result;
  } catch (error) {
    throw new Error(`Error deleting campaign: ${error.message}`);
  }
};

exports.updateCampaignStatus = async (campaignId, status) => {
  try {
    const validStatuses = ["DRAFT", "ACTIVE", "PAUSED", "CLOSED", "EXPIRED"];
    if (!validStatuses.includes(status)) {
      const err = new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      err.status = 400;
      throw err;
    }
    return await InternalCampaign.findByIdAndUpdate(
      campaignId,
      { status },
      { new: true, runValidators: true },
    ).populate([
      { path: "company", select: "username email role" },
      { path: "createdBy", select: "username email" },
    ]);
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

exports.getCampaignMetrics = async (companyId) => {
  try {
    const now = new Date();
    const metrics = await InternalCampaign.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: {
            $cond: {
              if: { $and: [{ $eq: ["$status", "ACTIVE"] }, { $gt: ["$deadline", null] }, { $lt: ["$deadline", now] }] },
              then: "expired",
              else: { $toLower: "$status" },
            },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = { total: 0, draft: 0, active: 0, paused: 0, closed: 0, expired: 0 };
    metrics.forEach(({ _id, count }) => {
      if (_id && Object.prototype.hasOwnProperty.call(result, _id)) result[_id] = count;
    });
    result.total = Object.keys(result).filter((k) => k !== "total").reduce((s, k) => s + result[k], 0);

    const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
    since.setHours(0, 0, 0, 0);
    const trendRaw = await InternalCampaign.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(companyId), createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
    ]);
    const trendMap = {};
    trendRaw.forEach(({ _id, count }) => { trendMap[_id] = count; });
    result.trend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      result.trend.push({ date: d, count: trendMap[d] || 0 });
    }
    return result;
  } catch (error) {
    throw new Error(`Error getting campaign metrics: ${error.message}`);
  }
};

// Cross-campaign analytics for the Campaigns Dashboard: participation and
// completion rollups, module-type mix, average AI score, a 30-day completion
// trend, and a short recent-activity feed — all scoped to this company's
// campaigns. Unlike getCampaignMetrics (campaign counts by status), this
// aggregates the participant/response side of things.
exports.getCampaignAnalytics = async (companyId) => {
  try {
    const companyObjId = new mongoose.Types.ObjectId(companyId);

    const campaigns = await InternalCampaign.find({ company: companyObjId })
      .select("_id module.type")
      .lean();
    const campaignIds = campaigns.map((c) => c._id);

    const moduleTypeCounts = { QUESTIONNAIRE: 0, AI_INTERVIEW: 0, SKILL_TEST: 0, TRAINING_PATH: 0 };
    campaigns.forEach((c) => {
      const type = c.module?.type;
      if (type && Object.prototype.hasOwnProperty.call(moduleTypeCounts, type)) moduleTypeCounts[type] += 1;
    });

    if (campaignIds.length === 0) {
      return {
        totalCampaigns: 0,
        moduleTypes: moduleTypeCounts,
        participants: { total: 0, notStarted: 0, completed: 0, inProgress: 0, invited: 0, dropped: 0, completionRate: 0 },
        avgScore: null,
        trend: buildEmptyTrend(),
        recentActivity: [],
      };
    }

    const [participantAgg, scoreAgg, trendRaw, recentCompleted] = await Promise.all([
      CampaignParticipant.aggregate([
        { $match: { campaign: { $in: campaignIds } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      CampaignResponse.aggregate([
        { $match: { campaign: { $in: campaignIds }, aiScore: { $ne: null } } },
        { $group: { _id: null, avgScore: { $avg: "$aiScore" } } },
      ]),
      (() => {
        const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
        since.setHours(0, 0, 0, 0);
        return CampaignParticipant.aggregate([
          { $match: { campaign: { $in: campaignIds }, status: "COMPLETED", completedAt: { $gte: since } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } }, count: { $sum: 1 } } },
        ]);
      })(),
      CampaignParticipant.find({ campaign: { $in: campaignIds }, status: "COMPLETED" })
        .sort({ completedAt: -1 })
        .limit(8)
        .populate({ path: "campaign", select: "title module" })
        .populate({ path: "employee", select: "firstName lastName email" })
        .populate({ path: "moduleProgress.responseRef", select: "aiScore testResults moduleType" })
        .lean(),
    ]);

    const participantStatus = { NOT_STARTED: 0, INVITED: 0, IN_PROGRESS: 0, COMPLETED: 0, DROPPED: 0 };
    participantAgg.forEach(({ _id, count }) => {
      if (_id && Object.prototype.hasOwnProperty.call(participantStatus, _id)) participantStatus[_id] = count;
    });
    const totalParticipants = Object.values(participantStatus).reduce((s, v) => s + v, 0);
    const completionRate = totalParticipants > 0
      ? Math.round((participantStatus.COMPLETED / totalParticipants) * 100)
      : 0;

    const avgScore = scoreAgg[0]?.avgScore != null ? Math.round(scoreAgg[0].avgScore) : null;

    const trendMap = {};
    trendRaw.forEach(({ _id, count }) => { trendMap[_id] = count; });
    const trend = buildEmptyTrend().map((p) => ({ ...p, count: trendMap[p.date] || 0 }));

    const recentActivity = recentCompleted.map((p) => {
      const response = p.moduleProgress?.responseRef;
      const score = response?.aiScore ?? response?.testResults?.score ?? null;
      const participantName = p.employee
        ? [p.employee.firstName, p.employee.lastName].filter(Boolean).join(" ") || p.employee.email
        : (p.providerName || p.email || "Anonymous participant");
      return {
        id: p._id.toString(),
        campaignId: p.campaign?._id?.toString() ?? null,
        campaignTitle: p.campaign?.title ?? "—",
        moduleType: p.campaign?.module?.type ?? p.moduleProgress?.moduleType ?? null,
        participantName,
        participantUserId: p.employee?._id ? p.employee._id.toString() : null,
        completedAt: p.completedAt,
        score,
      };
    });

    return {
      totalCampaigns: campaigns.length,
      moduleTypes: moduleTypeCounts,
      participants: {
        total: totalParticipants,
        notStarted: participantStatus.NOT_STARTED,
        completed: participantStatus.COMPLETED,
        inProgress: participantStatus.IN_PROGRESS,
        invited: participantStatus.INVITED,
        dropped: participantStatus.DROPPED,
        completionRate,
      },
      avgScore,
      trend,
      recentActivity,
    };
  } catch (error) {
    throw new Error(`Error getting campaign analytics: ${error.message}`);
  }
};

// Paginated version of getCampaignAnalytics's recentActivity slice — that one
// caps at 8 as part of a larger analytics bundle; this is the "Show all"
// destination for a company with more completions than fit there.
exports.getRecentCompletions = async (companyId, page = 1, limit = 20) => {
  try {
    const companyObjId = new mongoose.Types.ObjectId(companyId);
    const campaigns = await InternalCampaign.find({ company: companyObjId }).select("_id").lean();
    const campaignIds = campaigns.map((c) => c._id);

    if (campaignIds.length === 0) {
      return { activity: [], pagination: { total: 0, page, limit, pages: 0 } };
    }

    const query = { campaign: { $in: campaignIds }, status: "COMPLETED" };
    const skip = (page - 1) * limit;
    const [total, recentCompleted] = await Promise.all([
      CampaignParticipant.countDocuments(query),
      CampaignParticipant.find(query)
        .sort({ completedAt: -1 }).skip(skip).limit(limit)
        .populate({ path: "campaign", select: "title module" })
        .populate({ path: "employee", select: "firstName lastName email" })
        .populate({ path: "moduleProgress.responseRef", select: "aiScore testResults moduleType" })
        .lean(),
    ]);

    const activity = recentCompleted.map((p) => {
      const response = p.moduleProgress?.responseRef;
      const score = response?.aiScore ?? response?.testResults?.score ?? null;
      const participantName = p.employee
        ? [p.employee.firstName, p.employee.lastName].filter(Boolean).join(" ") || p.employee.email
        : (p.providerName || p.email || "Anonymous participant");
      return {
        id: p._id.toString(),
        campaignId: p.campaign?._id?.toString() ?? null,
        campaignTitle: p.campaign?.title ?? "—",
        moduleType: p.campaign?.module?.type ?? p.moduleProgress?.moduleType ?? null,
        participantName,
        participantUserId: p.employee?._id ? p.employee._id.toString() : null,
        completedAt: p.completedAt,
        score,
      };
    });

    return { activity, pagination: { total, page, limit, pages: Math.ceil(total / limit) } };
  } catch (error) {
    throw new Error(`Error getting recent completions: ${error.message}`);
  }
};

const COMPLETIONS_ALLOWED_DAY_VALUES = [7, 14, 30];
const COMPLETIONS_ALLOWED_MONTH_VALUES = [3, 6, 9, 12, 24, 36]; // 24/36 = "Year" tab at 2/3 years (12 * N)

function normalizeCompletionsRange(unit, value) {
  if (unit === "day" && COMPLETIONS_ALLOWED_DAY_VALUES.includes(value)) return { unit: "day", value };
  if (unit === "month" && COMPLETIONS_ALLOWED_MONTH_VALUES.includes(value)) return { unit: "month", value };
  return { unit: "day", value: 30 };
}

// Simple bar-chart-friendly completions count, bucketed by day or month with
// a selectable range (mirrors the day/month range-filter pattern already
// used elsewhere in this app, e.g. the hours/cost comparison KPIs) — the
// "Years" UI tab just asks for a bigger month count (see toApiRange on the
// frontend), there's no separate year bucketing here.
exports.getCompletionsTrend = async (companyId, unit = "day", value = 30) => {
  ({ unit, value } = normalizeCompletionsRange(unit, value));
  const companyObjId = new mongoose.Types.ObjectId(companyId);
  const campaigns = await InternalCampaign.find({ company: companyObjId }).select("_id").lean();
  const campaignIds = campaigns.map((c) => c._id);

  const now = new Date();
  const buckets = [];
  if (unit === "day") {
    for (let i = value - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, label: d.toLocaleString("en", { month: "short", day: "numeric" }), count: 0 });
    }
  } else {
    for (let i = value - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = value > 12
        ? `${d.toLocaleString("en", { month: "short" })} '${String(d.getFullYear()).slice(-2)}`
        : d.toLocaleString("en", { month: "short" });
      buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label, count: 0 });
    }
  }

  if (campaignIds.length === 0) {
    return { trend: buckets.map(({ label, count }) => ({ period: label, count })), unit, value };
  }

  const rangeStart = unit === "day"
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate() - (value - 1))
    : new Date(now.getFullYear(), now.getMonth() - (value - 1), 1);
  const keyOf = unit === "day"
    ? (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    : (d) => `${d.getFullYear()}-${d.getMonth()}`;

  const byKey = {};
  buckets.forEach((b) => { byKey[b.key] = b; });

  const completed = await CampaignParticipant.find({
    campaign: { $in: campaignIds }, status: "COMPLETED", completedAt: { $gte: rangeStart },
  }).select("completedAt").lean();

  completed.forEach((p) => {
    const bucket = byKey[keyOf(new Date(p.completedAt))];
    if (bucket) bucket.count += 1;
  });

  return { trend: buckets.map(({ label, count }) => ({ period: label, count })), unit, value };
};

function buildEmptyTrend() {
  const trend = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    trend.push({ date: d, count: 0 });
  }
  return trend;
}

// Row-level data for the Campaigns Dashboard's "Campaigns Overview" table.
// Sorting is on values computed after joining participants/responses, so it
// can't be a plain InternalCampaign.find().sort() — pull the full set,
// compute derived fields, sort in JS, then paginate (mirrors
// post.service.js's getPostsStatusKPI).
exports.getCampaignsOverviewTable = async (companyId, page = 1, limit = 6, sortBy = null, sortDir = null) => {
  try {
    const companyObjId = new mongoose.Types.ObjectId(companyId);
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.max(1, parseInt(limit) || 6);
    const skip     = (pageNum - 1) * limitNum;

    const totalCount = await InternalCampaign.countDocuments({ company: companyObjId });
    if (totalCount === 0) {
      return { data: [], pagination: { currentPage: pageNum, totalPages: 0, totalCount: 0 } };
    }

    const campaigns = await InternalCampaign.find({ company: companyObjId })
      .select("_id title status module.type deadline createdAt")
      .sort({ createdAt: -1 })
      .lean();
    const campaignIds = campaigns.map((c) => c._id);

    const [participantAgg, scoreAgg] = await Promise.all([
      CampaignParticipant.aggregate([
        { $match: { campaign: { $in: campaignIds } } },
        {
          $group: {
            _id: "$campaign",
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
          },
        },
      ]),
      CampaignResponse.aggregate([
        { $match: { campaign: { $in: campaignIds }, aiScore: { $ne: null } } },
        { $group: { _id: "$campaign", avgScore: { $avg: "$aiScore" } } },
      ]),
    ]);

    const participantMap = {};
    participantAgg.forEach((p) => { participantMap[String(p._id)] = p; });
    const scoreMap = {};
    scoreAgg.forEach((s) => { scoreMap[String(s._id)] = s.avgScore; });

    const now = new Date();
    let data = campaigns.map((c) => {
      const p = participantMap[String(c._id)] || { total: 0, completed: 0 };
      const avgScore = scoreMap[String(c._id)];
      // Mirror getCampaignMetrics's reclassification: an ACTIVE campaign past
      // its deadline reads as EXPIRED, so this table's badges agree with the
      // stat cards / status breakdown widgets fed by that function.
      const isPastDeadline = c.status === "ACTIVE" && c.deadline && new Date(c.deadline) < now;
      return {
        id: c._id.toString(),
        title: c.title,
        status: isPastDeadline ? "EXPIRED" : c.status,
        moduleType: c.module?.type ?? null,
        participants: p.total,
        completed: p.completed,
        completionRate: p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0,
        avgScore: avgScore != null ? Math.round(avgScore) : null,
        deadline: c.deadline ? Math.round((new Date(c.deadline) - now) / 86400000) : null,
      };
    });

    if (sortBy && (sortDir === "asc" || sortDir === "desc")) {
      const dir = sortDir === "asc" ? 1 : -1;
      const keyOf = {
        status: (r) => r.status,
        participants: (r) => r.participants,
        completion: (r) => r.completionRate,
        score: (r) => r.avgScore,
        deadline: (r) => r.deadline,
      }[sortBy];

      if (keyOf) {
        data = data.slice().sort((a, b) => {
          const av = keyOf(a);
          const bv = keyOf(b);
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (av < bv) return -1 * dir;
          if (av > bv) return 1 * dir;
          return 0;
        });
      }
    } else {
      // Default order (no column picked by the user): surface the most
      // important campaigns first instead of pure recency, so a single ACTIVE
      // campaign isn't pushed off the widget's first page by newer but less
      // relevant DRAFT/CLOSED ones. Array.prototype.sort is stable, so within
      // a tier campaigns keep the createdAt-desc order they already had.
      const STATUS_PRIORITY = { ACTIVE: 0, PAUSED: 1, DRAFT: 2, CLOSED: 3, EXPIRED: 4 };
      data = data.slice().sort((a, b) => (STATUS_PRIORITY[a.status] ?? 5) - (STATUS_PRIORITY[b.status] ?? 5));
    }

    const paged = data.slice(skip, skip + limitNum);
    return { data: paged, pagination: { currentPage: pageNum, totalPages: Math.ceil(totalCount / limitNum), totalCount } };
  } catch (error) {
    throw new Error(`Error getting campaigns overview table: ${error.message}`);
  }
};
