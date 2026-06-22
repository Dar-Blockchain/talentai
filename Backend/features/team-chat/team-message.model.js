const mongoose = require('mongoose');

const teamMessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TeamConversation',
      required: true,
      index: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
    type: {
      type: String,
      enum: ['text'],
      default: 'text',
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeletedForEveryone: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedForEveryoneBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    deliveryBlocked: { type: Boolean, default: false, index: true },
    blockedReason: { type: String, enum: ['email', 'phone'], default: null },
  },
  { timestamps: true }
);

teamMessageSchema.index({ conversationId: 1, createdAt: 1 });
teamMessageSchema.index({ conversationId: 1, isDeleted: 1 });
teamMessageSchema.index({ conversationId: 1, isDeletedForEveryone: 1 });

teamMessageSchema.methods.belongsToUser = function (userId) {
  const uid = userId.toString();
  return this.senderId.toString() === uid || this.receiverId.toString() === uid;
};

teamMessageSchema.methods.deleteForUser = async function (userId) {
  const id = userId._id ? userId._id : userId;
  if (!this.deletedBy.some((d) => d.toString() === id.toString())) {
    this.deletedBy.push(id);
    if (this.deletedBy.length >= 2) this.isDeleted = true;
    await this.save();
  }
};

teamMessageSchema.statics.getConversationMessages = async function (conversationId, viewerUserId, options = {}) {
  const { page = 1, limit = 50, since } = options;
  const query = {
    conversationId,
    deletedBy: { $nin: [viewerUserId] },
    $or: [{ isDeletedForEveryone: true }, { isDeleted: { $ne: true } }],
  };
  if (since) query.createdAt = { $gt: since };
  const viewerOid = new mongoose.Types.ObjectId(String(viewerUserId));
  query.$and = (query.$and || []).concat([{ $or: [{ deliveryBlocked: { $ne: true } }, { deliveryBlocked: true, senderId: viewerOid }] }]);

  const messages = await this.find(query).sort({ createdAt: 1 }).skip((page - 1) * limit).limit(limit).lean();
  const total = await this.countDocuments(query);
  return {
    messages,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

teamMessageSchema.statics.markConversationAsRead = async function (conversationId, userId) {
  await this.updateMany(
    { conversationId, receiverId: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );
};

module.exports = mongoose.models.TeamMessage || mongoose.model('TeamMessage', teamMessageSchema);
