// Notification Model - Mongoose Schema
// Manages notifications sent to users.

const mongoose = require("mongoose");

// List of possible notification types
const NOTIFICATION_TYPES = ["info", "success", "warning", "error", "custom", "system"];

// Schéma Mongoose pour les notifications
const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Notification content is required."],
      trim: true,
      maxlength: [512, "Notification content is too long."],
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: "Invalid notification type.",
      },
      default: "info",
    },
    read: {
      type: Boolean,
      default: false,
      index: true, // Index for quick filtering of unread notifications
    },
      archived: {
        type: Boolean,
        default: false,
        index: true, // Index for quick filtering of archived notifications
      },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recipient is required."],
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
      index: true,
    },
  },
  {
    collection: "notifications",
    versionKey: false,
  }
);

// Compound index to optimize frequent queries
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

// Method to mark notification as read
NotificationSchema.methods.markAsRead = function () {
  this.read = true;
  return this.save();
};

// Static method to retrieve unread notifications for a user
NotificationSchema.statics.findUnreadByUser = function (userId) {
  return this.find({ recipient: userId, read: false }).sort({ createdAt: -1 });
};

// Static method to create a system notification
NotificationSchema.statics.createSystem = function (recipient, content, url) {
  const notif = new this({
    recipient,
    content,
    type: "system",
    read: false,
  });
  return notif.save();
};

// Notification Model
const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
