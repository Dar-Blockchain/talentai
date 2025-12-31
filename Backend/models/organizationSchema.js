const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ["Company"], required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrganizationMember",
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", organizationSchema);
