const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    id: String,
    source: String,
    target: String,
    type: String,
    sourceHandle: String, // "yes" | "no" | undefined
  },
  { _id: false }
);

const configSchema = new mongoose.Schema(
  {
    nodeNumber: Number,
    title: String,
    configured: Boolean,
    lastPrompt: String,
    generatedContent: String,

    // Technical Skills Configuration
    categories: [String],
    skills: [{
      name: String,
      requiredLevel: Number,
      _id: false
    }],
    assessmentLevel: String,
    passThreshold: Number,

    // Soft Skills Configuration
    softSkills: [String],

    // HR Interview Configuration
    questions: [String],

    // Task Configuration
    taskType: String,
    taskDescription: String,
    taskDuration: Number,

    // Email Configuration
    emailType: String,
    emailSubject: String,
    emailBody: String,
    emailTrigger: String,

    // Condition Configuration
    field: String,
    operator: String,
    value: mongoose.Schema.Types.Mixed,
  },
  { _id: false, strict: false }  // strict: false allows additional fields
);

const dataSchema = new mongoose.Schema(
  {
    label: { type: String, required: true },
    type: { type: String, required: true },
    subtitle: String,
    config: configSchema,
  },
  { _id: false }
);

const positionSchema = new mongoose.Schema(
  {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  },
  { _id: false }
);

const postStepSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    order: { type: Number, required: true },
    type: { type: String, required: true }, // 'custom', 'technical', etc.
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    position: positionSchema,
    positionAbsolute: positionSchema,
    width: Number,
    height: Number,
    selected: Boolean,
    dragging: Boolean,
    condition: String,
    status: {
      type: String,
      enum: ["pending", "inProgress", "done"],
      default: "pending",
      required: true,
    },
    data: dataSchema,
    connections: [connectionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Post_Steps || mongoose.model("Post_Steps", postStepSchema);
