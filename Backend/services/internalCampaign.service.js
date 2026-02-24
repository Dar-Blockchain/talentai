const InternalCampaign = require("../models/internalCampaign.model");
const CampaignParticipant = require("../models/campaignParticipant.model");

/**
 * Create a new campaign
 */
exports.createCampaign = async (campaignData) => {
  try {
    const campaign = new InternalCampaign(campaignData);
    await campaign.save();
    return campaign.populate(["company", "createdBy"]);
  } catch (error) {
    throw new Error(`Error creating campaign: ${error.message}`);
  }
};

/**
 * Get campaign by ID
 */
exports.getCampaignById = async (campaignId) => {
  try {
    return await InternalCampaign.findById(campaignId)
      .populate("company", "name email")
      .populate("createdBy", "firstName lastName email");
  } catch (error) {
    throw new Error(`Error fetching campaign: ${error.message}`);
  }
};

/**
 * Get all campaigns with optional filters
 */
exports.getAllCampaigns = async (filters = {}) => {
  try {
    return await InternalCampaign.find(filters)
      .populate("company", "name email")
      .populate("createdBy", "firstName lastName email")
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
      .populate("createdBy", "firstName lastName email")
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
  filters = {}
) => {
  try {
    const skip = (page - 1) * limit;
    const query = {
      company: companyId,
      ...filters,
    };

    const data = await InternalCampaign.find(query)
      .populate("createdBy", "firstName lastName email")
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

    const campaign = await InternalCampaign.findByIdAndUpdate(
      campaignId,
      updateData,
      { new: true, runValidators: true }
    ).populate(["company", "createdBy"]);

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
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }

    return await InternalCampaign.findByIdAndUpdate(
      campaignId,
      { status },
      { new: true, runValidators: true }
    ).populate(["company", "createdBy"]);
  } catch (error) {
    throw new Error(`Error updating campaign status: ${error.message}`);
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

    const moduleStats = await CampaignParticipant.aggregate([
      { $match: { campaign: campaign._id } },
      { $unwind: "$moduleProgress" },
      {
        $group: {
          _id: {
            moduleType: "$moduleProgress.moduleType",
            status: "$moduleProgress.status",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      campaignId,
      title: campaign.title,
      participantStats: participants,
      moduleStats: moduleStats,
      totalParticipants: participants.reduce((sum, p) => sum + p.count, 0),
    };
  } catch (error) {
    throw new Error(`Error getting campaign stats: ${error.message}`);
  }
};
