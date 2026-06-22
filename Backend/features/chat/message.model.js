const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    receiver: {
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
      enum: ['text', 'file', 'image', 'system'],
      default: 'text',
    },
    attachment: {
      url: String,
      fileName: String,
      fileSize: Number,
      mimeType: String,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent',
      index: true,
    },
    isDeleted: { type: Boolean, default: false },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isDeletedForEveryone: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
    deletedForEveryoneBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        emoji: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    systemData: {
      action: String,
      data: mongoose.Schema.Types.Mixed,
    },
    deliveryBlocked: { type: Boolean, default: false, index: true },
    blockedReason: { type: String, enum: ['email', 'phone'], default: undefined },
  },
  { timestamps: true }
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ conversation: 1, receiver: 1, isRead: 1 });
messageSchema.index({ conversation: 1, isDeleted: 1 });

messageSchema.statics.getConversationMessages = async function (conversationId, userId, options = {}) {
  const { page: rawPage = 1, limit: rawLimit = 50, before = null } = options;
  const page = Number.isFinite(Number(rawPage)) && Number(rawPage) > 0 ? Math.floor(Number(rawPage)) : 1;
  const limit = Number.isFinite(Number(rawLimit)) && Number(rawLimit) > 0 ? Math.min(Math.floor(Number(rawLimit)), 100) : 50;

  const toObjectId = (v) => {
    const s = String(v);
    return mongoose.Types.ObjectId.isValid(s) ? new mongoose.Types.ObjectId(s) : v;
  };
  const convOid = toObjectId(conversationId);
  const viewerOid = toObjectId(userId);

  const query = {
    conversation: convOid,
    isDeleted: { $ne: true },
    deletedBy: { $nin: [viewerOid] },
    $and: [{ $or: [{ deliveryBlocked: { $ne: true } }, { deliveryBlocked: true, sender: viewerOid }] }],
  };
  if (before) query.createdAt = { $lt: new Date(before) };

  const populate = (path, select) => ({
    path, select,
    populate: { path: 'profile', select: 'firstName lastName type companyDetails.name' },
  });

  const messages = await this.find(query)
    .populate(populate('sender', 'email profile'))
    .populate(populate('receiver', 'email profile'))
    .populate({ path: 'replyTo', select: 'text sender createdAt', populate: populate('sender', 'email profile') })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(query);
  return {
    messages: messages.reverse(),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: total > page * limit },
  };
};

messageSchema.statics.getUnreadMessages = async function (conversationId, userId) {
  return await this.find({ conversation: conversationId, receiver: userId, isRead: false, isDeleted: { $ne: true } })
    .populate({ path: 'sender', select: 'email profile', populate: { path: 'profile', select: 'firstName lastName type companyDetails.name' } })
    .sort({ createdAt: 1 })
    .lean();
};

messageSchema.statics.markAsRead = async function (conversationId, userId) {
  return await this.updateMany(
    { conversation: conversationId, receiver: userId, isRead: false },
    { $set: { isRead: true, readAt: new Date(), status: 'read' } }
  );
};

messageSchema.statics.markAsDelivered = async function (messageId) {
  return await this.findByIdAndUpdate(messageId, { $set: { isDelivered: true, deliveredAt: new Date(), status: 'delivered' } }, { new: true });
};

messageSchema.statics.searchMessages = async function (conversationId, searchTerm, userId) {
  return await this.find({ conversation: conversationId, text: { $regex: searchTerm, $options: 'i' }, isDeleted: { $ne: true }, deletedBy: { $ne: userId } })
    .populate({ path: 'sender', select: 'email profile', populate: { path: 'profile', select: 'firstName lastName type companyDetails.name' } })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
};

messageSchema.methods.markRead = async function () {
  this.isRead = true; this.readAt = new Date(); this.status = 'read';
  await this.save();
};

messageSchema.methods.markDelivered = async function () {
  this.isDelivered = true; this.deliveredAt = new Date();
  if (this.status === 'sent') this.status = 'delivered';
  await this.save();
};

messageSchema.methods.deleteForUser = async function (userId) {
  if (!this.deletedBy.includes(userId)) {
    this.deletedBy.push(userId);
    if (this.deletedBy.length >= 2) this.isDeleted = true;
    await this.save();
  }
};

messageSchema.methods.addReaction = async function (userId, emoji) {
  this.reactions = this.reactions.filter((r) => r.user.toString() !== userId.toString());
  this.reactions.push({ user: userId, emoji, createdAt: new Date() });
  await this.save();
};

messageSchema.methods.removeReaction = async function (userId) {
  this.reactions = this.reactions.filter((r) => r.user.toString() !== userId.toString());
  await this.save();
};

messageSchema.methods.belongsToUser = function (userId) {
  const uid = userId?.toString?.() ?? String(userId);
  const senderId = this.sender?._id ?? this.sender;
  const receiverId = this.receiver?._id ?? this.receiver;
  return senderId?.toString() === uid || receiverId?.toString() === uid;
};

module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
