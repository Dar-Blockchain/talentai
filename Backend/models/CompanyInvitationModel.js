const mongoose = require("mongoose");

const CompanyInvitationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true , unique: true },
  Company: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: {
    type: String,
    enum: ["Owner", "RH", "TechLead", "Supervisor", "Manager"],
    default: "Manager",
  },
  status: { type: String, enum: ["active", "pending", "revoked"], default: "pending" },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Un user ne peut avoir qu’un rôle unique par account
CompanyInvitationSchema.index({ user: 1, Company: 1 }, { unique: true });
// TTL index: les invitations expirent automatiquement après 2 jours
CompanyInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model("CompanyInvitation", CompanyInvitationSchema);
