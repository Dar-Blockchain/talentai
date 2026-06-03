const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username:   { type: String, required: true, unique: true },
    email:      { type: String, required: true, unique: true, set: (v) => v.toLowerCase() },

    otp: {
      code:      String,
      expiresAt: Date,
    },
    otpAttempts: { type: Number, default: 0 },

    isVerified:  { type: Boolean, default: false },
    isBanned:    { type: Boolean, default: false },
    isHaker:     { type: Boolean, default: false },
    warnings:    { type: Number,  default: 0 },

    lastLogin:    { type: Date,   default: null },
    ip:           String,
    Localisation: String,

    role:     { type: String, enum: ["Company", "Candidate", "Admin", "Employee"] },
    language: { type: String, enum: ["fr", "en"], default: "fr" },

    profile:           { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    companyMembership: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyMembership" },
    notifications:     [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],
    post:              [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],

    trafficCounter: { type: Number, default: 0 },

    // Capped at 50 entries — prevents unbounded document growth
    authHistory: {
      type: [{
        date:         { type: Date,   default: Date.now },
        ip:           String,
        localisation: String,
        method:       { type: String, enum: ["OTP", "Password", "OAuth"], default: "OTP" },
        status:       { type: String, enum: ["Success", "Failed"],        default: "Success" },
      }],
      default: [],
    },
  },
  { timestamps: true }
);

// Keep authHistory to the 50 most recent entries on every save
userSchema.pre("save", function (next) {
  if (this.authHistory && this.authHistory.length > 50) {
    this.authHistory = this.authHistory.slice(-50);
  }
  next();
});

// Clean up profile when user is deleted
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    await this.model("Profile").findOneAndDelete({ userId: this._id });
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
