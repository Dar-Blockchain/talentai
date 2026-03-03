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
      ref: "Profile",   // assuming departments belong to a company profile
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// unique constraint per company
departmentSchema.index({ companyId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Department", departmentSchema);
