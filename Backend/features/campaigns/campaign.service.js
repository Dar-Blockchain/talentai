const InternalCampaign = require("./campaign.model");
const CampaignParticipant = require("./campaign-participant.model");
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
