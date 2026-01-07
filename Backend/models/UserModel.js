const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    isHaker: {
      type: Boolean,
      default: false,
    },
    warnings: { type: Number, default: 0 }, // au lieu de warning
    lastLogin: {
      type: Date,
      default: null,
    },
    ip: String,
    Localisation: String,
    role: { type: String, enum: ["Company", "Candidate", "Admin"] },
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
    },
    // project reference removed (Project domain deprecated)
    post: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    trafficCounter: { type: Number, default: 0 },
    authHistory: [
      {
        date: { type: Date, default: Date.now },
        ip: String,
        localisation: String,
        method: {
          type: String,
          enum: ["OTP", "Password", "OAuth"],
          default: "OTP",
        },
        status: {
          type: String,
          enum: ["Success", "Failed"],
          default: "Success",
        },
      },
    ],
    // Hedera account information
    hederaAccountId: { type: String, default: null },
    hederaPrivateKey: { type: String, default: null },
    hederaPublicKey: { type: String, default: null },
    // Gas fee balance for transaction fees (in HBAR)
    gasFeeBalance: { type: Number, default: 0, min: 0 },
    // Notifications relationship
    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
    Organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
    },
  },
  { timestamps: true }
);

// Middleware pour supprimer le profil associé lors de la suppression d'un utilisateur
userSchema.pre("remove", async function (next) {
  try {
    await this.model("Profile").findOneAndDelete({ userId: this._id });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
