const mongoose = require("mongoose");
const { SKILL_TYPES, SKILL_LEVELS } = require("../constants/profileConstants");
const {
  ANSWER_STATUS,
  INTERVIEW_TYPES,
} = require("../constants/interviewDetailsConstants");

const questionAnswerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(ANSWER_STATUS),
    },
    exampleCorrectAnswer: { type: String, required: false },
  },
  { _id: false }
);

const skillDetailsSchema = new mongoose.Schema(
  {
    name: { type: String },

    type: {
      type: String,
      enum: Object.values(SKILL_TYPES),
      required: true,
    },

    // requiredLevel only for post/job interview
    requiredLevel: {
      type: Number,
      enum: Object.values(SKILL_LEVELS).map((lvl) => lvl.proficiencyLevel),
      required: false,
    },
    proficiencyLevel: {
      type: Number,
      enum: Object.values(SKILL_LEVELS).map((lvl) => lvl.proficiencyLevel),
      required: true,
    },
    experienceLevel: {
      type: Number,
      enum: Object.values(SKILL_LEVELS).map((lvl) => lvl.experienceLevel),
      required: false,
    },

    confidenceScore: { type: Number },
    questionAnswerList: [questionAnswerSchema],
  },
  { _id: false }
);

const interviewDetailsSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: false,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
    type: {
      type: String,
      enum: Object.values(INTERVIEW_TYPES),
      required: true,
    },
    overallScore: { type: Number },
    skillDetails: {
      type: [skillDetailsSchema],
    },
  },
  { timestamps: true }
);

// interviewDetailsSchema.post("save", async function (doc) {
//   try {
//     await mongoose.model("Profile").findByIdAndUpdate(
//       doc.candidate,
//       {
//         $setOnInsert: { interviewDetails: [doc._id] }, 
//         $push: { interviewDetails: doc._id },
//       },
//       { upsert: true }
//     );
//   } catch (error) {
//     console.error("Error creating:", error);
//   }
// });

module.exports = mongoose.model("InterviewDetails", interviewDetailsSchema);
