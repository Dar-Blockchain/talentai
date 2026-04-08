const mongoose = require("mongoose");

const CompanyInvitationSchema = new mongoose.Schema({
  email: { type: String, required: true, set: (value) => value.toLowerCase() },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  role: { type: String, default: "Manager" },
  department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  status: { type: String, enum: ["active", "pending", "revoked"], default: "pending" },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Un email ne peut avoir qu'une invitation pending par company
CompanyInvitationSchema.index({ email: 1, company: 1 }, { unique: true, sparse: true, partialFilterExpression: { status: "pending" } });
// TTL index: les invitations expirent automatiquement après 2 jours
CompanyInvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model("CompanyInvitation", CompanyInvitationSchema);
