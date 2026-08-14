const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
    planName: { type: String, required: true },
    planPrice: { type: Number, required: true },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    stripeSessionId: { type: String, required: true, unique: true },
    stripePaymentIntentId: { type: String },
    stripePriceData: { type: Object },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },
    paymentMethod: { type: String },
    amountCents: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    completedAt: { type: Date },
    expiresAt: { type: Date },
    metadata: { type: Object },
    notes: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ companyProfileId: 1 });
paymentSchema.index({ planId: 1 });
paymentSchema.index({ createdAt: -1 });

paymentSchema.post("save", async function (doc) {
  try {
    const payment = this;

    if (payment.companyProfileId) {
      const Profile = require("../../users/profile.model");
      const profile = await Profile.findById(payment.companyProfileId);

      if (profile) {
        let updated = false;

        if (!profile.payments) profile.payments = [];
        if (!profile.payments.includes(payment._id)) {
          profile.payments.push(payment._id);
          updated = true;
        }

        if (payment.status === "completed" && payment.planId && !payment.subscriptionId) {
          try {
            const Subscription = require("../subscriptions/subscription.model");
            const PlanLimits   = require("../plans/plan-limits.model");

            const plan = await PlanLimits.findById(payment.planId);
            if (!plan) throw new Error("Plan not found");

            const startDate = new Date();
            const endDate   = new Date();
            endDate.setDate(endDate.getDate() + (plan.durationDays || 30));

            const subscription = await Subscription.create({
              companyProfileId: payment.companyProfileId,
              planId: payment.planId,
              paymentId: payment._id,
              startDate,
              endDate,
              status: "active",
              autoRenew: true,
            });

            // Single-active-plan invariant: this purchase was only allowed
            // through as an upgrade (see subscriptionService.assertUpgradeEligible),
            // so retire whatever was active before instead of stacking it.
            await Subscription.updateMany(
              {
                companyProfileId: payment.companyProfileId,
                status: "active",
                _id: { $ne: subscription._id },
              },
              {
                status: "cancelled",
                autoRenew: false,
                cancelledAt: new Date(),
                cancellationReason: `Replaced by upgrade to ${plan.name}`,
              }
            );

            payment.subscriptionId = subscription._id;
            await payment.save({ validateBeforeSave: false });

            if (!profile.subscriptions) profile.subscriptions = [];
            profile.subscriptions.push(subscription._id);
            profile.activeSubscription = subscription._id;
            profile.planLimits = payment.planId;
            updated = true;
          } catch (subscriptionError) {
            console.error("⚠️ Error creating subscription from payment:", subscriptionError.message);
          }
        }

        if (updated) await profile.save();
      }
    }
  } catch (error) {
    console.error("⚠️ Error in Payment post-save hook:", error.message);
  }
});

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
