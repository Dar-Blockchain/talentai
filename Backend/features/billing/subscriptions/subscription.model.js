const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    companyProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlanLimits",
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    renewalDate: {
      type: Date,
    },
    postsUsed: {
      type: Number,
      default: 0,
    },
    monthlyInterviewsUsed: {
      type: Number,
      default: 0,
    },
    lastMonthlyResetDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "suspended"],
      default: "active",
    },
    cancellationReason: { type: String },
    cancelledAt: { type: Date },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

subscriptionSchema.index({ companyProfileId: 1, status: 1 });
subscriptionSchema.index({ companyProfileId: 1, startDate: -1 });
// Covers admin revenue/active-subscription aggregations that match on
// { status: "active", endDate: { $gt: now } } — {status:1} alone is a
// prefix of this, so the standalone index was dropped as redundant.
subscriptionSchema.index({ status: 1, endDate: 1 });
// Covers plan-distribution lookups (admin revenue-by-plan, plan usage reports).
subscriptionSchema.index({ planId: 1, status: 1 });
subscriptionSchema.index({ endDate: 1 });

subscriptionSchema.virtual("isActive").get(function () {
  return this.status === "active" && this.endDate > new Date();
});

subscriptionSchema.virtual("daysRemaining").get(function () {
  return Math.ceil((this.endDate - new Date()) / (24 * 60 * 60 * 1000));
});

subscriptionSchema.virtual("percentageUsed").get(function () {
  if (!this.planId || !this.planId.postsLimit) return 0;
  return Math.round((this.postsUsed / this.planId.postsLimit) * 100);
});

subscriptionSchema.methods.markExpired = async function () {
  this.status = "expired";
  return this.save();
};

subscriptionSchema.methods.cancel = async function (reason = "") {
  this.autoRenew = false;
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

subscriptionSchema.methods.isSubscriptionValid = function () {
  return this.status === "active" && this.endDate > new Date();
};

subscriptionSchema.methods.canCreatePost = function (planLimit) {
  return this.postsUsed < planLimit;
};

subscriptionSchema.methods.canCreateInterview = function (planLimit) {
  return this.monthlyInterviewsUsed < planLimit;
};

subscriptionSchema.statics.getActiveSubscriptionForCompany = async function (companyProfileId) {
  return this.findOne({
    companyProfileId,
    status: "active",
    endDate: { $gt: new Date() },
  }).populate("planId");
};

subscriptionSchema.statics.createSubscriptionFromPayment = async function (paymentDoc) {
  const plan = await mongoose.model("PlanLimits").findById(paymentDoc.planId);
  if (!plan) throw new Error("Plan not found");

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.durationDays);

  return this.create({
    companyProfileId: paymentDoc.companyProfileId,
    planId: paymentDoc.planId,
    paymentId: paymentDoc._id,
    startDate,
    endDate,
    status: "active",
    autoRenew: true,
  });
};

module.exports = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
