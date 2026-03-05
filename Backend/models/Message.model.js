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

    // Deleted status (soft delete)
    isDeleted: {
      type: Boolean,
      default: false,
    },

    // Who deleted (for one-sided deletion)
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

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
  const { page = 1, limit = 50, before = null } = options;

  const query = {
    conversation: conversationId,
    isDeleted: false,
    deletedBy: { $ne: userId },
  };

  // If "before" timestamp provided, get messages before that time
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
    isDeleted: false,
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
    isDeleted: false,
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
 * Check if message belongs to user
 */
messageSchema.methods.belongsToUser = function (userId) {
  return (
    this.sender.toString() === userId.toString() ||
    this.receiver.toString() === userId.toString()
  );
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
