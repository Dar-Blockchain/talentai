const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username:   { type: String, required: true, unique: true },
    email:      { type: String, required: true, unique: true, set: (v) => v.toLowerCase() },

    otp: {
      code:      String,
      expiresAt: Date,
      attempts:  { type: Number, default: 0 },
    },

    isVerified:  { type: Boolean, default: false },
    isBanned:    { type: Boolean, default: false },
    warnings:    { type: Number,  default: 0 },

    lastLogin:    { type: Date,   default: null },
    ip:           String,
    Localisation: String,

    role:     { type: String, enum: ["Company", "Candidate", "Admin", "Employee"] },
    language: { type: String, enum: ["fr", "en"], default: "fr" },

    profile:           { type: mongoose.Schema.Types.ObjectId, ref: "Profile" },
    companyMembership: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyMembership" },
    notifications:     [{ type: mongoose.Schema.Types.ObjectId, ref: "Notification" }],

  },
  { timestamps: true }
);

// Clean up related documents when user is deleted
userSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
  try {
    await Promise.all([
      this.model("Profile").findOneAndDelete({ userId: this._id }),
      this.model("Notification").deleteMany({ recipient: this._id }),
      this.companyMembership
        ? this.model("CompanyMembership").findByIdAndDelete(this.companyMembership)
        : null,
    ]);
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("User", userSchema);
