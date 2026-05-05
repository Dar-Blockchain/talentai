const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // ========== USER & COMPANY INFO ==========
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      description: "Reference to the user who made the payment",
    },
    companyProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
      description: "Reference to the company profile",
    },

    // ========== PLAN INFO ==========
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PlanLimits",
      required: true,
      description: "Reference to the plan being purchased",
    },
    planName: {
      type: String,
      required: true,
      description: "Snapshot of plan name at time of payment",
    },
    planPrice: {
      type: Number,
      required: true,
      description: "Amount paid in USD",
    },

    // ========== SUBSCRIPTION REFERENCE ==========
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      description: "Reference to the subscription created from this payment",
    },

    // ========== STRIPE INFO ==========
    stripeSessionId: {
      type: String,
      required: true,
      unique: true,
      description: "Stripe checkout session ID",
    },
    stripePaymentIntentId: {
      type: String,
      description: "Stripe payment intent ID (populated after successful payment)",
    },
    stripePriceData: {
      type: Object,
      description: "Complete price data from Stripe session",
    },

    // ========== PAYMENT STATUS ==========
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
      description: "Current payment status",
    },
    paymentMethod: {
      type: String,
      description: "Payment method used (card, etc.)",
    },

    // ========== TRANSACTION DETAILS ==========
    amountCents: {
      type: Number,
      required: true,
      description: "Amount in cents (for precision)",
    },
    currency: {
      type: String,
      default: "usd",
      description: "Currency of the transaction",
    },

    // ========== DATES ==========
    completedAt: {
      type: Date,
      description: "Date when payment was completed",
    },
    expiresAt: {
      type: Date,
      description: "Date when the plan subscription expires",
    },

    // ========== ADDITIONAL INFO ==========
    metadata: {
      type: Object,
      description: "Additional metadata for tracking and debugging",
    },
    notes: {
      type: String,
      description: "Internal notes about the payment",
    },
  },
  { timestamps: true }
);

// Index for quick lookups
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ companyProfileId: 1 });
paymentSchema.index({ profileId: 1 });
paymentSchema.index({ planId: 1 });
paymentSchema.index({ stripeSessionId: 1 });
paymentSchema.index({ createdAt: -1 });

// Post-save hook to automatically create subscription and link payment to profile
paymentSchema.post("save", async function (doc) {
  try {
    const payment = this;

    console.log(`📌 [Payment Post-Save Hook] Payment ${payment._id} saved with status: ${payment.status}`);
    console.log(
      `📌 [Payment Post-Save Hook] companyProfileId: ${payment.companyProfileId}, planId: ${payment.planId}`
    );

    if (payment.companyProfileId) {
      const Profile = require("./Profile.model");
      const profile = await Profile.findById(payment.companyProfileId);

      console.log(`📌 [Payment Post-Save Hook] Profile found: ${profile ? "Yes" : "No"}`);

      if (profile) {
        let updated = false;

        // ✅ Add payment to profile if not already there
        if (!profile.payments) {
          profile.payments = [];
        }

        if (!profile.payments.includes(payment._id)) {
          profile.payments.push(payment._id);
          updated = true;
          console.log(`✅ Payment ${payment._id} linked to profile ${payment.companyProfileId}`);
        }

        // ✅ CREATE SUBSCRIPTION when payment is completed
        if (payment.status === "completed" && payment.planId && !payment.subscriptionId) {
          try {
            const Subscription = require("./Subscription.model");
            const PlanLimits = require("./PlanLimits.model");

            const plan = await PlanLimits.findById(payment.planId);
            if (!plan) {
              throw new Error("Plan not found");
            }

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + (plan.durationDays || 30));

            // Create subscription
            const subscription = await Subscription.create({
              companyProfileId: payment.companyProfileId,
              planId: payment.planId,
              paymentId: payment._id,
              startDate,
              endDate,
              status: "active",
              autoRenew: true,
            });

            // Update payment with subscription reference
            payment.subscriptionId = subscription._id;
            await payment.save({ validateBeforeSave: false });

            console.log(
              `✅ Subscription ${subscription._id} created from payment ${payment._id}`
            );

            // Update profile with new subscription
            if (!profile.subscriptions) {
              profile.subscriptions = [];
            }
            profile.subscriptions.push(subscription._id);
            profile.activeSubscription = subscription._id;
            profile.planLimits = payment.planId; // Keep for backward compatibility
            updated = true;

            console.log(`✅ Profile updated with new subscription ${subscription._id}`);
          } catch (subscriptionError) {
            console.error(
              `⚠️ Warning: Error creating subscription from payment: ${subscriptionError.message}`
            );
            // Continue - payment is already saved
          }
        }

        // Save profile only if something changed
        if (updated) {
          await profile.save();
          console.log(`✅ Profile ${payment.companyProfileId} updated and saved successfully`);
        }
      }
    }
  } catch (error) {
    console.error("⚠️ Warning: Error in Payment post-save hook:", error.message, error.stack);
    // Don't throw - payment is already saved
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
