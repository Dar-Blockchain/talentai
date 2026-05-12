const mongoose = require("mongoose");

const teamConversationSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    participantKey: {
      type: String,
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TeamChatRequest",
      default: null,
    },
    lastMessage: {
      text: String,
      senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

teamConversationSchema.index({ companyId: 1, participantKey: 1 }, { unique: true });
teamConversationSchema.index({ participants: 1, status: 1, updatedAt: -1 });

teamConversationSchema.methods.updateLastMessage = async function (messageData) {
  this.lastMessage = {
    text: messageData.text,
    senderId: messageData.senderId,
    timestamp: messageData.createdAt || new Date(),
  };
  await this.save();
};

teamConversationSchema.methods.incrementUnreadCount = async function (userId) {
  const currentCount = this.unreadCount.get(userId.toString()) || 0;
  this.unreadCount.set(userId.toString(), currentCount + 1);
  await this.save();
};

teamConversationSchema.methods.resetUnreadCount = async function (userId) {
  this.unreadCount.set(userId.toString(), 0);
  await this.save();
};

module.exports = mongoose.model("TeamConversation", teamConversationSchema);
