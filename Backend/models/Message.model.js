const mongoose = require('mongoose');

/**
 * Message Schema
 * Represents individual messages within a conversation
 */
const messageSchema = new mongoose.Schema(
  {
    // Reference to conversation
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },

    // Message sender
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Message receiver
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Message content
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    // Message type
    type: {
      type: String,
      enum: ['text', 'file', 'image', 'system'],
      default: 'text',
    },

    // File attachment (if type is file or image)
    attachment: {
      url: String,
      fileName: String,
      fileSize: Number,
      mimeType: String,
    },

    // Read status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Read timestamp
    readAt: {
      type: Date,
    },

    // Delivered status
    isDelivered: {
      type: Boolean,
      default: false,
    },

    // Delivered timestamp
    deliveredAt: {
      type: Date,
    },

    // Message status
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent',
      index: true,
    },

    // Deleted status (soft delete; both participants removed for themselves)
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Who deleted (per-user soft delete; "delete for me")
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Whatsapp-style "delete for everyone": message is kept but body is
    // replaced by a tombstone and UI shows "This message was deleted".
    isDeletedForEveryone: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
    deletedForEveryoneBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Reply to another message (thread support)
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },

    // Reactions to message
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        emoji: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // System message metadata (for system type messages)
    systemData: {
      action: String, // e.g., 'conversation_created', 'user_joined', etc.
      data: mongoose.Schema.Types.Mixed,
    },

    deliveryBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },
    blockedReason: {
      type: String,
      enum: ["email", "phone"],
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for conversation messages with pagination
messageSchema.index({ conversation: 1, createdAt: -1 });

// Index for unread messages
messageSchema.index({ conversation: 1, receiver: 1, isRead: 1 });

// Index for deleted messages
messageSchema.index({ conversation: 1, isDeleted: 1 });

// Static Methods

/**
 * Get messages for a conversation with pagination
 */
messageSchema.statics.getConversationMessages = async function (
  conversationId,
  userId,
  options = {}
) {
  const { page: rawPage = 1, limit: rawLimit = 50, before = null } = options;
  const page =
    Number.isFinite(Number(rawPage)) && Number(rawPage) > 0
      ? Math.floor(Number(rawPage))
      : 1;
  const limit =
    Number.isFinite(Number(rawLimit)) && Number(rawLimit) > 0
      ? Math.min(Math.floor(Number(rawLimit)), 100)
      : 50;

  const toObjectId = (value) => {
    const str = String(value);
    return mongoose.Types.ObjectId.isValid(str)
      ? new mongoose.Types.ObjectId(str)
      : value;
  };

  const convOid = toObjectId(conversationId);
  const viewerOid = toObjectId(userId);

  // deletedBy is an array: $nin matches when no element equals viewer (and matches missing/empty).
  // Note: "delete for everyone" rows (isDeletedForEveryone:true) MUST stay visible —
  // the UI renders them as a placeholder ("This message was deleted") just like
  // team-chat does. Only "fully deleted" rows (isDeleted:true) and per-user
  // hides (deletedBy contains viewer) are filtered out.
  const query = {
    conversation: convOid,
    isDeleted: { $ne: true },
    deletedBy: { $nin: [viewerOid] },
  };

  query.$and = [
    {
      $or: [
        { deliveryBlocked: { $ne: true } },
        { deliveryBlocked: true, sender: viewerOid },
      ],
    },
  ];

  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await this.find(query)
    .populate({
      path: 'sender',
      select: 'email profile',
      populate: {
        path: 'profile',
        select: 'firstName lastName type companyDetails.name',
      },
    })
    .populate({
      path: 'receiver',
      select: 'email profile',
      populate: {
        path: 'profile',
        select: 'firstName lastName type companyDetails.name',
      },
    })
    .populate({
      path: 'replyTo',
      select: 'text sender createdAt',
      populate: {
        path: 'sender',
        select: 'email profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName type companyDetails.name',
        },
      },
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    messages: messages.reverse(), // Reverse to chronological order
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: total > page * limit,
    },
  };
};

/**
 * Get unread messages for user in conversation
 */
messageSchema.statics.getUnreadMessages = async function (
  conversationId,
  userId
) {
  return await this.find({
    conversation: conversationId,
    receiver: userId,
    isRead: false,
    isDeleted: { $ne: true },
  })
    .populate({
      path: 'sender',
      select: 'email profile',
      populate: {
        path: 'profile',
        select: 'firstName lastName type companyDetails.name',
      },
    })
    .sort({ createdAt: 1 })
    .lean();
};

/**
 * Mark messages as read
 */
messageSchema.statics.markAsRead = async function (conversationId, userId) {
  const result = await this.updateMany(
    {
      conversation: conversationId,
      receiver: userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
        status: 'read',
      },
    }
  );

  return result;
};

/**
 * Mark message as delivered
 */
messageSchema.statics.markAsDelivered = async function (messageId) {
  return await this.findByIdAndUpdate(
    messageId,
    {
      $set: {
        isDelivered: true,
        deliveredAt: new Date(),
        status: 'delivered',
      },
    },
    { new: true }
  );
};

/**
 * Search messages in conversation
 */
messageSchema.statics.searchMessages = async function (
  conversationId,
  searchTerm,
  userId
) {
  return await this.find({
    conversation: conversationId,
    text: { $regex: searchTerm, $options: 'i' },
    isDeleted: { $ne: true },
    deletedBy: { $ne: userId },
  })
    .populate({
      path: 'sender',
      select: 'email profile',
      populate: {
        path: 'profile',
        select: 'firstName lastName type companyDetails.name',
      },
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
};

// Instance Methods

/**
 * Mark as read
 */
messageSchema.methods.markRead = async function () {
  this.isRead = true;
  this.readAt = new Date();
  this.status = 'read';
  await this.save();
};

/**
 * Mark as delivered
 */
messageSchema.methods.markDelivered = async function () {
  this.isDelivered = true;
  this.deliveredAt = new Date();
  if (this.status === 'sent') {
    this.status = 'delivered';
  }
  await this.save();
};

/**
 * Soft delete for user
 */
messageSchema.methods.deleteForUser = async function (userId) {
  if (!this.deletedBy.includes(userId)) {
    this.deletedBy.push(userId);

    // If both users deleted, mark as fully deleted
    if (this.deletedBy.length >= 2) {
      this.isDeleted = true;
    }

    await this.save();
  }
};

/**
 * Add reaction to message
 */
messageSchema.methods.addReaction = async function (userId, emoji) {
  // Remove existing reaction from user
  this.reactions = this.reactions.filter(
    (r) => r.user.toString() !== userId.toString()
  );

  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji,
    createdAt: new Date(),
  });

  await this.save();
};

/**
 * Remove reaction from message
 */
messageSchema.methods.removeReaction = async function (userId) {
  this.reactions = this.reactions.filter(
    (r) => r.user.toString() !== userId.toString()
  );
  await this.save();
};

/**
 * Check if message belongs to user (sender or receiver).
 * Works when sender/receiver are ObjectIds or populated User docs.
 */
messageSchema.methods.belongsToUser = function (userId) {
  const uid = userId?.toString?.() ?? String(userId);
  const senderId = this.sender?._id ?? this.sender;
  const receiverId = this.receiver?._id ?? this.receiver;
  return (
    senderId?.toString() === uid ||
    receiverId?.toString() === uid
  );
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
