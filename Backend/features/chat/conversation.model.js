const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lastMessage: {
      text: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: Date,
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'blocked'],
      default: 'active',
      index: true,
    },
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    typing: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
  },
  { timestamps: true }
);

conversationSchema.index({ candidateId: 1, companyId: 1 }, { unique: true });
conversationSchema.index({ participants: 1, status: 1, updatedAt: -1 });

conversationSchema.statics.buildInboxQuery = function (userId, options = {}) {
  const { includeArchived = false, status = 'active' } = options;
  const idStr = String(userId);
  const participantOid = mongoose.Types.ObjectId.isValid(idStr)
    ? new mongoose.Types.ObjectId(idStr)
    : userId;
  const query = { participants: participantOid };
  if (!includeArchived) {
    query.archivedBy = { $nin: [participantOid] };
  }
  if (status) {
    query.$or = [
      { status: status },
      { status: { $exists: false } },
      { status: null },
    ];
  }
  return query;
};

conversationSchema.statics.findOrCreateConversation = async function (candidateId, companyId, relatedPost = null) {
  try {
    let conversation = await this.findOne({ candidateId, companyId }).populate({
      path: 'participants',
      select: 'email profile',
      populate: { path: 'profile', select: 'firstName lastName type companyDetails.name' },
    });

    if (!conversation) {
      conversation = await this.create({
        participants: [candidateId, companyId],
        candidateId,
        companyId,
        relatedPost,
        unreadCount: new Map([[candidateId.toString(), 0], [companyId.toString(), 0]]),
      });
      conversation = await this.findById(conversation._id).populate({
        path: 'participants',
        select: 'email profile',
        populate: { path: 'profile', select: 'firstName lastName type companyDetails.name' },
      });
      if (!conversation.participants || conversation.participants.length !== 2) {
        throw new Error(`Failed to populate all participants. Expected 2, got ${conversation.participants?.length}.`);
      }
    }
    return conversation;
  } catch (error) {
    throw error;
  }
};

conversationSchema.statics.getUserConversations = async function (userId, options = {}) {
  const { page = 1, limit = 20, status = 'active', includeArchived = false } = options;
  const query = this.buildInboxQuery(userId, { includeArchived, status });
  const conversations = await this.find(query)
    .populate({ path: 'participants', select: 'email profile', populate: { path: 'profile', select: 'firstName lastName type companyDetails.name' } })
    .populate({ path: 'lastMessage.sender', select: 'email profile', populate: { path: 'profile', select: 'firstName lastName type companyDetails.name' } })
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  const total = await this.countDocuments(query);
  return {
    conversations,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

conversationSchema.statics.getTotalUnreadCount = async function (userId) {
  const query = this.buildInboxQuery(userId, { includeArchived: false, status: 'active' });
  const conversations = await this.find(query).lean();
  let totalUnread = 0;
  conversations.forEach((conv) => {
    const unreadCountMap = conv.unreadCount || {};
    totalUnread += unreadCountMap[userId.toString()] || 0;
  });
  return totalUnread;
};

conversationSchema.statics.unarchiveAllForUser = async function (userId) {
  const idStr = String(userId);
  const oid = mongoose.Types.ObjectId.isValid(idStr) ? new mongoose.Types.ObjectId(idStr) : userId;
  const result = await this.updateMany({ participants: oid, archivedBy: oid }, { $pull: { archivedBy: oid } });
  return result.modifiedCount;
};

conversationSchema.methods.updateLastMessage = async function (messageData) {
  this.lastMessage = { text: messageData.text, sender: messageData.sender, timestamp: messageData.createdAt || new Date() };
  this.messageCount += 1;
  await this.save();
};

conversationSchema.methods.incrementUnreadCount = async function (userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  await this.save();
};

conversationSchema.methods.resetUnreadCount = async function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  await this.save();
};

conversationSchema.methods.archiveForUser = async function (userId) {
  if (!this.archivedBy.includes(userId)) this.archivedBy.push(userId);
  this.unreadCount.set(userId.toString(), 0);
  await this.save();
};

conversationSchema.methods.unarchiveForUser = async function (userId) {
  this.archivedBy = this.archivedBy.filter((id) => id.toString() !== userId.toString());
  await this.save();
};

conversationSchema.methods.blockConversation = async function (userId) {
  this.status = 'blocked';
  this.blockedBy = userId;
  await this.save();
};

conversationSchema.methods.unblockConversation = async function () {
  this.status = 'active';
  this.blockedBy = null;
  await this.save();
};

conversationSchema.methods.getOtherParticipant = function (userId) {
  return this.participants.find((p) => p._id.toString() !== userId.toString());
};

module.exports = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
