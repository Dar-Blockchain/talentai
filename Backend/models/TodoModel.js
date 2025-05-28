const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "Course",
        "Certification",
        "Project",
        "Article",
        "Video",
        "Exercise",
        "Book",
        "Other",
      ],
      required: true,
    },
    description: { type: String, required: false },
    url: { type: String }, // Optional: for online resources
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    isCompleted: { type: Boolean, default: false },
    dueDate: Date,
  },
  { _id: false }
);

// Skill Task schema
const skillTaskSchema = new mongoose.Schema(
  {
    skillTitle: { type: String, required: true },
    type: {
      type: String,
      enum: ["Hard Skill", "Soft Skill", "Other"],
      required: true,
    },

    isCompleted: { type: Boolean, default: false },
    dueDate: Date,

    tasks: [taskSchema],
  },
  { _id: false }
);

// ToDo list schema linked to a profile
const todoSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      unique: true, // Only one ToDo list per profile
    },
    completeProfile: { type: Boolean, default: false },
    uploadCV: { type: Boolean, default: false },
    skillTasks: [skillTaskSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ToDo", todoSchema);
