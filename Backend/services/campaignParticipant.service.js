const CampaignParticipant = require("../models/campaignParticipant.model");
const InternalCampaign = require("../models/internalCampaign.model");
const crypto = require("crypto");

/**
 * Add a new participant to a campaign
 */
exports.addParticipant = async (participantData) => {
  try {
    // Verify campaign exists
    const campaign = await InternalCampaign.findById(participantData.campaign);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const participant = new CampaignParticipant({
      ...participantData,
      status: "NOT_STARTED",
    });

    await participant.save();
    return participant.populate("campaign employee");
  } catch (error) {
    throw new Error(`Error adding participant: ${error.message}`);
  }
};

/**
 * Get participant by ID
 */
exports.getParticipantById = async (participantId) => {
  try {
    return await CampaignParticipant.findById(participantId)
      .populate("campaign", "title type status")
      .populate("employee", "firstName lastName email");
  } catch (error) {
    throw new Error(`Error fetching participant: ${error.message}`);
  }
};

/**
 * Get participant by anonymous token
 */
exports.getParticipantByAnonymousToken = async (token) => {
  try {
    return await CampaignParticipant.findOne({ anonymousToken: token })
      .populate("campaign")
      .populate("employee");
  } catch (error) {
    throw new Error(`Error fetching participant by token: ${error.message}`);
  }
};

/**
 * Get all participants for a campaign
 */
exports.getParticipantsByCampaign = async (campaignId, filters = {}, search = {}) => {
  try {
    const baseMatch = { campaign: campaignId };
    if (filters && Object.keys(filters).length > 0) Object.assign(baseMatch, filters);

    // If no advanced search requested, use simple find + populate for performance
    const needsAdvancedSearch = search && search.q;
    if (!needsAdvancedSearch) {
      return await CampaignParticipant.find(baseMatch)
        .populate("employee", "firstName lastName email")
        .sort({ createdAt: -1 });
    }

    // Build aggregation pipeline to lookup employee and profile and filter by name/email
    const pipeline = [
      { $match: baseMatch },
      // lookup employee document
      {
        $lookup: {
          from: "users",
          localField: "employee",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
      // lookup profile for employee to check department fields
      {
        $lookup: {
          from: "profiles",
          localField: "employee.profile",
          foreignField: "_id",
          as: "profile",
        },
      },
      { $unwind: { path: "$profile", preserveNullAndEmptyArrays: true } },
    ];

    const andMatch = [];

    if (search.q && typeof search.q === "string" && search.q.trim().length > 0) {
      const regex = { $regex: search.q.trim(), $options: "i" };
      andMatch.push({
        $or: [
          { "employee.firstName": regex },
          { "employee.lastName": regex },
          { "employee.email": regex },
          { "profile.firstName": regex },
          { "profile.lastName": regex },
        ],
      });
    }

    // department filtering removed — search scope limited to employee name/email

    if (andMatch.length > 0) pipeline.push({ $match: { $and: andMatch } });

    // sort and project
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({
      $project: {
        campaign: 1,
        email: 1,
        anonymousToken: 1,
        status: 1,
        accessedAt: 1,
        completedAt: 1,
        createdAt: 1,
        updatedAt: 1,
        employee: {
          _id: "$employee._id",
          firstName: "$employee.firstName",
          lastName: "$employee.lastName",
          email: "$employee.email",
        },
      },
    });

    const results = await CampaignParticipant.aggregate(pipeline);
    return results;
  } catch (error) {
    throw new Error(`Error fetching campaign participants: ${error.message}`);
  }
};

/**
 * Update participant
 */
exports.updateParticipant = async (participantId, updateData) => {
  try {
    // Prevent updating campaign and anonymousToken through this method
    delete updateData.campaign;
    delete updateData.anonymousToken;

    const participant = await CampaignParticipant.findByIdAndUpdate(
      participantId,
      updateData,
      { new: true, runValidators: true }
    ).populate("campaign employee");

    return participant;
  } catch (error) {
    throw new Error(`Error updating participant: ${error.message}`);
  }
};

/**
 * Delete participant
 */
exports.deleteParticipant = async (participantId) => {
  try {
    const result = await CampaignParticipant.findByIdAndDelete(participantId);
    return result;
  } catch (error) {
    throw new Error(`Error deleting participant: ${error.message}`);
  }
};

/**
 * Get participants with specific status
 */
exports.getParticipantsByStatus = async (campaignId, status) => {
  try {
    const validStatuses = ["INVITED", "IN_PROGRESS", "COMPLETED", "DROPPED"];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    return await CampaignParticipant.find({
      campaign: campaignId,
      status,
    })
      .populate("employee", "firstName lastName email")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching participants by status: ${error.message}`);
  }
};

/**
 * Mark participant as dropped
 */
exports.markParticipantAsDropped = async (participantId, reason = "") => {
  try {
    return await CampaignParticipant.findByIdAndUpdate(
      participantId,
      {
        status: "DROPPED",
        completedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("campaign employee");
  } catch (error) {
    throw new Error(`Error marking participant as dropped: ${error.message}`);
  }
};

/**
 * Generate anonymous token for anonymous campaigns
 */
exports.generateAnonymousToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Bulk add participants
 */
exports.bulkAddParticipants = async (campaignId, participants) => {
  try {
    const campaign = await InternalCampaign.findById(campaignId);
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    const participantsToAdd = participants.map((p) => ({
      campaign: campaignId,
      employee: p.employeeId || null,
      email: p.email || null,
      anonymousToken: p.anonymousToken || null,
      status: "NOT_STARTED",
    }));

    const result = await CampaignParticipant.insertMany(participantsToAdd);
    return result;
  } catch (error) {
    throw new Error(`Error bulk adding participants: ${error.message}`);
  }
};
