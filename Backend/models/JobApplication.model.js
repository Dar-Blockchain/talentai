const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    // ========== REFERENCES ==========
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      index: true,
      description: "Reference to candidate profile"
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      index: true,
      description: "Reference to job post"
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
      description: "Reference to company user who posted the job"
    },
    cvAnalysis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CVAnalysis",
      required: false,
      description: "Reference to CV analysis of the candidate"
    },

    // ========== APPLICATION DETAILS ==========
    status: {
      type: String,
      enum: ["applied", "viewed", "shortlisted", "rejected", "accepted", "interview_scheduled", "interview_completed"],
      default: "applied",
      index: true,
      description: "Current status of the application"
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
      description: "Calculated match score between candidate and job"
    },
    appliedAt: {
      type: Date,
      default: Date.now,
      index: true,
      description: "Timestamp when application was submitted"
    },
    updatedAt: {
      type: Date,
      default: Date.now,
      description: "Last time application was updated"
    },
    viewedAt: {
      type: Date,
      default: null,
      description: "Timestamp when company viewed the application"
    },
    shortlistedAt: {
      type: Date,
      default: null,
      description: "Timestamp when candidate was shortlisted"
    },

    // ========== ASSESSMENT & INTERVIEW INFO ==========
    interviewAssessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostInterviewAssessment",
      required: false,
      description: "Reference to interview assessment if completed"
    },
    assessmentScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
      description: "Score from interview assessment"
    },

    // ========== AUTO INTERVIEW INVITATION ==========
    autoInvitationSent: {
      type: Boolean,
      default: false,
      description: "Whether automatic interview invitation was sent"
    },
    lastAutoInvitationSentAt: {
      type: Date,
      default: null,
      description: "Timestamp of last automatic interview invitation sent"
    },
    autoInvitationCount: {
      type: Number,
      default: 0,
      description: "Number of times automatic interview invitation was sent"
    },

    // ========== NOTES & FEEDBACK ==========
    companyNotes: {
      type: String,
      required: false,
      description: "Internal notes from company about the candidate"
    },
    rejectionReason: {
      type: String,
      required: false,
      description: "Reason for rejection if application was rejected"
    },

    // ========== WITHDRAWAL & ARCHIVAL ==========
    isWithdrawn: {
      type: Boolean,
      default: false,
      description: "Whether candidate withdrew the application"
    },
    withdrawnAt: {
      type: Date,
      default: null,
      description: "Timestamp when application was withdrawn"
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
      description: "Whether application is archived"
    },
  },
  {
    timestamps: true,
    collection: "job_applications"
  }
);

// Indexes for better query performance
jobApplicationSchema.index({ profile: 1, post: 1 }, { unique: true, sparse: true, description: "Ensure one application per candidate per post" });
jobApplicationSchema.index({ company: 1, post: 1 });
jobApplicationSchema.index({ company: 1, status: 1 });
jobApplicationSchema.index({ profile: 1, status: 1 });
jobApplicationSchema.index({ appliedAt: -1 });
jobApplicationSchema.index({ matchScore: -1 });
jobApplicationSchema.index({ post: 1, status: 1 });

module.exports = mongoose.model("JobApplication", jobApplicationSchema);
