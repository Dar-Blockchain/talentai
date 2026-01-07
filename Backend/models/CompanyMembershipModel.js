const mongoose = require("mongoose");

const CompanyMembershipSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  Company: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: {
    type: String,
    enum: ["Owner", "RH", "TechLead", "Supervisor", "Manager"],
    default: "Manager",
  },
  status: { type: String, enum: ["active", "pending", "revoked"], default: "active" },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

// Un user ne peut avoir qu’un rôle unique par account
CompanyMembershipSchema.index({ user: 1, Company: 1 }, { unique: true });

module.exports = mongoose.model("CompanyMembership", CompanyMembershipSchema);
