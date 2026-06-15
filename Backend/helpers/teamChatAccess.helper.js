const mongoose = require("mongoose");
const CompanyMembership = require("../models/CompanyMembership.model");
const User = require("../features/users/user.model");

const createHttpError = (message, status) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const toObjectIdString = (value) => {
  if (!value) return null;
  return value._id ? value._id.toString() : value.toString();
};

const buildParticipantKey = (userIdA, userIdB) => {
  return [userIdA.toString(), userIdB.toString()].sort().join(":");
};

const resolveCompanyId = (user, auth = null) => {
  if (auth?.companyId) {
    return auth.companyId.toString();
  }

  if (user?.role === "Company") {
    return user._id.toString();
  }

  const membership = user?.companyMembership;
  if (!membership) {
    return null;
  }

  return toObjectIdString(membership.company);
};

const assertUserBelongsToCompany = async (userId, companyId) => {
  if (!userId || !companyId) {
    throw createHttpError("Unauthorized: company context is required", 403);
  }

  const user = await User.findById(userId).select("role").lean();
  if (!user) {
    throw createHttpError("User not found", 404);
  }

  if (user.role === "Company") {
    if (user._id.toString() !== companyId.toString()) {
      throw createHttpError("Unauthorized: users must belong to the same company", 403);
    }
    return user;
  }

  const membership = await CompanyMembership.findOne({
    user: userId,
    company: companyId,
    status: "active",
  }).lean();

  if (!membership) {
    throw createHttpError("Unauthorized: active company membership is required", 403);
  }

  return user;
};

const resolveAndAssertCompanyContext = async (user, auth = null) => {
  const companyId = resolveCompanyId(user, auth);
  if (!companyId) {
    throw createHttpError("Unauthorized: company context is required", 403);
  }

  await assertUserBelongsToCompany(user._id, companyId);
  return companyId;
};

const assertSameCompanyPair = async (currentUser, targetUserId, auth = null) => {
  const companyId = resolveCompanyId(currentUser, auth);
  if (!companyId) {
    throw createHttpError("Unauthorized: company context is required", 403);
  }

  const currentUserId = currentUser._id.toString();
  const normalizedTargetUserId = targetUserId.toString();

  if (currentUserId === normalizedTargetUserId) {
    throw createHttpError("You cannot start a chat with yourself", 400);
  }

  await assertUserBelongsToCompany(currentUserId, companyId);
  await assertUserBelongsToCompany(normalizedTargetUserId, companyId);

  return companyId;
};

const formatParticipantSummary = (user) => {
  if (!user) {
    return null;
  }

  const profile = user.profile || {};
  const companyDetails = profile.companyDetails || {};

  return {
    _id: user._id.toString(),
    role: user.role,
    firstName: profile.firstName || null,
    lastName: profile.lastName || null,
    email: user.email || null,
    avatar: profile.user_image || null,
    companyName:
      user.role === "Company" ? companyDetails.name || null : null,
  };
};

const populateParticipantSummary = async (userId) => {
  const user = await User.findById(userId)
    .select("email role profile")
    .populate({
      path: "profile",
      select: "firstName lastName user_image companyDetails.name type",
    })
    .lean();

  return formatParticipantSummary(user);
};

const assertValidObjectId = (value, label) => {
  if (!value || !mongoose.Types.ObjectId.isValid(value)) {
    throw createHttpError(`Invalid ${label}`, 400);
  }
};

/** After "delete chat for me", the conversation must not be re-opened by passive GET polling. */
const assertConversationNotHiddenForUser = (conversation, currentUser) => {
  const uid = currentUser._id.toString();
  const hidden = (conversation.hiddenForParticipants || []).some(
    (id) => id.toString() === uid,
  );
  if (hidden) {
    throw createHttpError("Conversation not found", 404);
  }
};

/** Timestamp after which messages are visible to this user (set on "delete conversation for me"). */
const getClearedAtForUser = (conversation, userId) => {
  const uid = userId?._id ? userId._id.toString() : String(userId);
  const readMap = (mapLike) => {
    if (!mapLike) return null;
    if (typeof mapLike.get === "function") {
      let d = mapLike.get(uid);
      if (d) return new Date(d);
      if (typeof mapLike.entries === "function") {
        for (const [k, v] of mapLike.entries()) {
          if (String(k) === uid && v != null) return new Date(v);
        }
      }
      return null;
    }
    if (typeof mapLike === "object") {
      const d = mapLike[uid];
      if (d) return new Date(d);
      for (const k of Object.keys(mapLike)) {
        if (String(k) === uid && mapLike[k] != null) return new Date(mapLike[k]);
      }
    }
    return null;
  };
  const fromNew = readMap(conversation?.clearedAtForUsers);
  if (fromNew) return fromNew;
  return readMap(conversation?.messageVisibilityCutoffByParticipant);
};

module.exports = {
  buildParticipantKey,
  resolveCompanyId,
  resolveAndAssertCompanyContext,
  assertUserBelongsToCompany,
  assertSameCompanyPair,
  formatParticipantSummary,
  populateParticipantSummary,
  assertValidObjectId,
  assertConversationNotHiddenForUser,
  getClearedAtForUser,
  createHttpError,
};
