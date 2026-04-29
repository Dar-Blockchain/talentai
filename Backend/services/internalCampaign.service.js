const InternalCampaign = require("../models/Internal.Campaign.model");
const CampaignParticipant = require("../models/campaignParticipant.model");
const mongoose = require("mongoose");

/**
 * Create a new campaign
 */
exports.createCampaign = async (campaignData) => {
  try {
    // `module` should be a plain object now, validate expectations
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

/**
 * Get campaign by ID
 */
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

/**
 * Get all campaigns with optional filters
 */
exports.getAllCampaigns = async (filters = {}) => {
  try {
    return await InternalCampaign.find(filters)
      .populate("company", "username email role")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching campaigns: ${error.message}`);
  }
};

/**
 * Get campaigns by company
 */
exports.getCampaignsByCompany = async (companyId, filters = {}) => {
  try {
    const query = {
      company: companyId,
      ...filters,
    };
    return await InternalCampaign.find(query)
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching company campaigns: ${error.message}`);
  }
};

/**
 * Get campaigns by company with pagination
 */
exports.getCampaignsByCompanyPaginated = async (
  companyId,
  page = 1,
  limit = 10,
  filters = {},
) => {
  try {
    const skip = (page - 1) * limit;
    const query = {
      company: companyId,
      ...filters,
    };

    const data = await InternalCampaign.find(query)
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InternalCampaign.countDocuments(query);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new Error(`Error fetching company campaigns: ${error.message}`);
  }
};

/**
 * Update campaign
 */
exports.updateCampaign = async (campaignId, updateData) => {
  try {
    // Prevent updating company, createdBy, and linkToken through this method
    delete updateData.company;
    delete updateData.createdBy;
    delete updateData.linkToken;

    // `module` should already be a plain object; ensure format is correct
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

/**
 * Delete campaign and associated participants
 */
exports.deleteCampaign = async (campaignId) => {
  try {
    // Delete all participants associated with this campaign
    await CampaignParticipant.deleteMany({ campaign: campaignId });

    // Delete the campaign
    const result = await InternalCampaign.findByIdAndDelete(campaignId);
    return result;
  } catch (error) {
    throw new Error(`Error deleting campaign: ${error.message}`);
  }
};

/**
 * Change campaign status
 */
exports.updateCampaignStatus = async (campaignId, status) => {
  try {
    const validStatuses = ["DRAFT", "ACTIVE", "PAUSED", "CLOSED", "EXPIRED"];
    if (!validStatuses.includes(status)) {
      const err = new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      );
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

/**
 * Get campaign statistics
 */
exports.getCampaignStats = async (campaignId) => {
  try {
    const campaign = await InternalCampaign.findById(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const participants = await CampaignParticipant.aggregate([
      { $match: { campaign: campaign._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      campaignId,
      title: campaign.title,
      participantStats: participants,
      totalParticipants: participants.reduce((sum, p) => sum + p.count, 0),
    };
  } catch (error) {
    throw new Error(`Error getting campaign stats: ${error.message}`);
  }
};

/**
 * Get campaign metrics (count by status)
 */
exports.getCampaignMetrics = async (companyId) => {
  try {
    const metrics = await InternalCampaign.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: { $toLower: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Initialize structure with all possible statuses
    const result = {
      total: 0,
      draft: 0,
      active: 0,
      paused: 0,
      closed: 0,
      expired: 0,
    };

    // Populate from aggregation results
    metrics.forEach(({ _id, count }) => {
      if (_id && result.hasOwnProperty(_id)) {
        result[_id] = count;
      }
    });

    // Calculate total
    result.total = Object.keys(result)
      .filter((key) => key !== "total")
      .reduce((sum, key) => sum + result[key], 0);

    // 30-day creation trend
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
