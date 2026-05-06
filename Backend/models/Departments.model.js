const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // departments belong to a user/company
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// unique constraint per company
departmentSchema.index({ companyId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Department", departmentSchema);
