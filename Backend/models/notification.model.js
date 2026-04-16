// Notification Model - Mongoose Schema
// Manages notifications sent to users.

const mongoose = require("mongoose");

// List of possible notification types
const NOTIFICATION_TYPES = ["info", "success", "warning", "error", "custom", "system"];

// Derive a human-readable title from content + type
function deriveTitleFromContent(content, type) {
  if (content) {
    const c = content.toLowerCase();
    if (c.includes('interview'))               return 'Interview Update';
    if (c.includes('application'))             return 'Application Update';
    if (c.includes('unlocked') || c.includes('interested in your')) return 'Profile Unlocked';
    if (c.includes('match') || c.includes('matches your')) return 'New Job Match';
    if (c.includes('new offer') || c.includes('job') || c.includes('position') || c.includes('offer')) return 'New Job Offer';
    if (c.includes('score') || c.includes('test') || c.includes('passed') || c.includes('level up')) return 'Test Result';
    if (c.includes('profile'))                 return 'Profile Update';
    if (c.includes('plan') || c.includes('limit') || c.includes('subscription')) return 'Plan Update';
    if (c.includes('company'))                 return 'Company Update';
    if (c.includes('welcome') || c.includes('registered')) return 'Welcome!';
    if (c.includes('password') || c.includes('login') || c.includes('sign')) return 'Account Security';
  }
  switch (type) {
    case 'success': return 'Success';
    case 'warning': return 'Warning';
    case 'error':   return 'Error';
    default:        return 'Notification';
  }
}

// Mongoose schema for notifications
const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [100, "Notification title is too long."],
    },
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

// Auto-generate title before saving if not provided
NotificationSchema.pre('save', function (next) {
  if (!this.title) {
    this.title = deriveTitleFromContent(this.content, this.type);
  }
  next();
});

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
