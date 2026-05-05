const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    // ========== REFERENCES ==========
    companyProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      description: "Reference to the company profile",
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlanLimits",
      required: true,
      description: "Reference to the plan",
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      description: "Reference to the payment that created this subscription",
    },

    // ========== SUBSCRIPTION DATES ==========
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
      description: "Date when subscription starts",
    },
    endDate: {
      type: Date,
      required: true,
      description: "Date when subscription expires",
    },
    renewalDate: {
      type: Date,
      description: "Date when subscription will auto-renew",
    },

    // ========== USAGE TRACKING ==========
    postsUsed: {
      type: Number,
      default: 0,
      description: "Current number of posts created under this subscription",
    },
    monthlyInterviewsUsed: {
      type: Number,
      default: 0,
      description: "Current number of interviews used this month",
    },
    lastMonthlyResetDate: {
      type: Date,
      default: Date.now,
      description: "Last date when monthly interview count was reset",
    },

    // ========== SUBSCRIPTION STATUS ==========
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "suspended"],
      default: "active",
      description: "Current status of the subscription",
    },
    cancellationReason: {
      type: String,
      description: "Reason for cancellation if applicable",
    },
    cancelledAt: {
      type: Date,
      description: "Date when subscription was cancelled",
    },

    // ========== AUTO-RENEWAL SETTINGS ==========
    autoRenew: {
      type: Boolean,
      default: true,
      description: "Whether subscription auto-renews on expiry",
    },

    // ========== METADATA ==========
    notes: {
      type: String,
      description: "Internal notes about the subscription",
    },
  },
  { timestamps: true }
);

// ========== INDEXES ==========
subscriptionSchema.index({ companyProfileId: 1, status: 1 });
subscriptionSchema.index({ companyProfileId: 1, startDate: -1 });
subscriptionSchema.index({ planId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ endDate: 1 });

// ========== VIRTUAL FIELDS ==========
subscriptionSchema.virtual("isActive").get(function () {
  const now = new Date();
  return this.status === "active" && this.endDate > now;
});

subscriptionSchema.virtual("daysRemaining").get(function () {
  const now = new Date();
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((this.endDate - now) / millisecondsPerDay);
});

subscriptionSchema.virtual("percentageUsed").get(function () {
  if (!this.planId || !this.planId.postsLimit) return 0;
  return Math.round((this.postsUsed / this.planId.postsLimit) * 100);
});

// ========== METHODS ==========
subscriptionSchema.methods.markExpired = async function () {
  this.status = "expired";
  return this.save();
};

subscriptionSchema.methods.cancel = async function (reason = "") {
  // Disable auto-renewal — subscription stays active until endDate, then won't renew.
  this.autoRenew = false;
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  return this.save();
};

subscriptionSchema.methods.isSubscriptionValid = function () {
  const now = new Date();
  return this.status === "active" && this.endDate > now;
};

subscriptionSchema.methods.canCreatePost = function (planLimit) {
  return this.postsUsed < planLimit;
};

subscriptionSchema.methods.canCreateInterview = function (planLimit) {
  return this.monthlyInterviewsUsed < planLimit;
};

// ========== STATIC METHODS ==========
subscriptionSchema.statics.getActiveSubscriptionForCompany = async function (
  companyProfileId
) {
  const now = new Date();
  return this.findOne({
    companyProfileId,
    status: "active",
    endDate: { $gt: now },
  }).populate("planId");
};

subscriptionSchema.statics.createSubscriptionFromPayment = async function (
  paymentDoc
) {
  const plan = await mongoose.model("PlanLimits").findById(paymentDoc.planId);

  if (!plan) {
    throw new Error("Plan not found");
  }

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + plan.durationDays);

  const subscription = new this({
    companyProfileId: paymentDoc.companyProfileId,
    planId: paymentDoc.planId,
    paymentId: paymentDoc._id,
    startDate,
    endDate,
    status: "active",
    autoRenew: true,
  });

  return subscription.save();
};

module.exports = mongoose.model("Subscription", subscriptionSchema);
