const mongoose = require('mongoose');

/**
 * Conversation Schema
 * Represents a chat conversation between a Candidate and a Company
 */
const conversationSchema = new mongoose.Schema(
  {
    // Participants (always 2: candidate and company)
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    // Participant types for easier querying
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Last message details for preview
    lastMessage: {
      text: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      timestamp: Date,
    },

    // Unread message counts per participant
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },

    // Conversation status
    status: {
      type: String,
      enum: ['active', 'archived', 'blocked'],
      default: 'active',
      index: true,
    },

    // Who archived the conversation (can be null, one user, or both)
    archivedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // Who blocked the conversation (if blocked)
    blockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Optional: Related job post
    relatedPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },

    // Total message count for pagination optimization
    messageCount: {
      type: Number,
      default: 0,
    },

    // Typing status (temporary, cleared on message send)
    typing: {
      type: Map,
      of: Boolean,
      default: new Map(),
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for finding conversations between two users
conversationSchema.index({ candidateId: 1, companyId: 1 }, { unique: true });

// Index for finding user's conversations
conversationSchema.index({ participants: 1, status: 1, updatedAt: -1 });

// Static Methods

/**
 * Find or create conversation between candidate and company
 */
conversationSchema.statics.findOrCreateConversation = async function (
  candidateId,
  companyId,
  relatedPost = null
) {
  try {
    // Check if conversation exists
    let conversation = await this.findOne({
      candidateId,
      companyId,
    }).populate('participants', 'firstName lastName email profile');

    if (!conversation) {
      console.log('Creating new conversation with:', { candidateId, companyId });

      // Create new conversation
      conversation = await this.create({
        participants: [candidateId, companyId],
        candidateId,
        companyId,
        relatedPost,
        unreadCount: new Map([
          [candidateId.toString(), 0],
          [companyId.toString(), 0],
        ]),
      });

      console.log('Conversation created, now populating participants...');

      // Populate after creation
      conversation = await this.findById(conversation._id).populate(
        'participants',
        'firstName lastName email profile'
      );

      console.log('After population:', {
        conversationId: conversation._id,
        participantCount: conversation.participants?.length,
        participants: conversation.participants
      });

      // Verify both participants were populated
      if (!conversation.participants || conversation.participants.length !== 2) {
        const errorMsg = `Failed to populate all participants. Expected 2, got ${conversation.participants?.length}. One or both users (candidate: ${candidateId}, company: ${companyId}) may not exist in the database.`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    }

    return conversation;
  } catch (error) {
    console.error('Error finding or creating conversation:', error);
    throw error;
  }
};

/**
 * Get user's conversations with pagination
 */
conversationSchema.statics.getUserConversations = async function (
  userId,
  options = {}
) {
  const {
    page = 1,
    limit = 20,
    status = 'active',
    includeArchived = false,
  } = options;

  const query = {
    participants: userId,
  };

  if (!includeArchived) {
    query.$or = [
      { archivedBy: { $ne: userId } },
      { archivedBy: { $exists: false } },
      { archivedBy: [] },
    ];
  }

  if (status) {
    query.status = status;
  }

  const conversations = await this.find(query)
    .populate('participants', 'firstName lastName email profile')
    .populate('lastMessage.sender', 'firstName lastName')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await this.countDocuments(query);

  return {
    conversations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get unread count for user across all conversations
 */
conversationSchema.statics.getTotalUnreadCount = async function (userId) {
  const conversations = await this.find({
    participants: userId,
    status: 'active',
  }).lean();

  let totalUnread = 0;
  conversations.forEach((conv) => {
    const unreadCountMap = conv.unreadCount || {};
    const unread = unreadCountMap[userId.toString()];
    totalUnread += unread || 0;
  });

  return totalUnread;
};

// Instance Methods

/**
 * Update last message
 */
conversationSchema.methods.updateLastMessage = async function (messageData) {
  this.lastMessage = {
    text: messageData.text,
    sender: messageData.sender,
    timestamp: messageData.createdAt || new Date(),
  };
  this.messageCount += 1;
  await this.save();
};

/**
 * Increment unread count for a user
 */
conversationSchema.methods.incrementUnreadCount = async function (userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  await this.save();
};

/**
 * Reset unread count for a user
 */
conversationSchema.methods.resetUnreadCount = async function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  await this.save();
};

/**
 * Archive conversation for a user
 */
conversationSchema.methods.archiveForUser = async function (userId) {
  if (!this.archivedBy.includes(userId)) {
    this.archivedBy.push(userId);
    await this.save();
  }
};

/**
 * Unarchive conversation for a user
 */
conversationSchema.methods.unarchiveForUser = async function (userId) {
  this.archivedBy = this.archivedBy.filter(
    (id) => id.toString() !== userId.toString()
  );
  await this.save();
};

/**
 * Block conversation
 */
conversationSchema.methods.blockConversation = async function (userId) {
  this.status = 'blocked';
  this.blockedBy = userId;
  await this.save();
};

/**
 * Unblock conversation
 */
conversationSchema.methods.unblockConversation = async function () {
  this.status = 'active';
  this.blockedBy = null;
  await this.save();
};

/**
 * Get other participant in conversation
 */
conversationSchema.methods.getOtherParticipant = function (userId) {
  return this.participants.find(
    (participant) => participant._id.toString() !== userId.toString()
  );
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
