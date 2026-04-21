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

// Post-save hook to automatically link payment to profile and update planLimits
paymentSchema.post("save", async function (doc) {
  try {
    if (doc.companyProfileId) {
      const Profile = require("./Profile.model");
      const profile = await Profile.findById(doc.companyProfileId);
      
      if (profile) {
        let updated = false;

        // ✅ Add payment to profile if not already there
        if (!profile.payments.includes(doc._id)) {
          profile.payments.push(doc._id);
          updated = true;
          console.log(`✅ Payment ${doc._id} linked to profile ${doc.companyProfileId}`);
        }

        // ✅ Update planLimits when payment is completed
        if (doc.status === "completed" && doc.planId) {
          profile.planLimits = doc.planId;
          updated = true;
          console.log(`✅ Profile planLimits updated with plan ${doc.planId} for payment ${doc._id}`);
        }

        // Save profile only if something changed
        if (updated) {
          await profile.save();
          console.log(`✅ Profile ${doc.companyProfileId} updated successfully`);
        }
      }
    }
  } catch (error) {
    console.error("Warning: Error in Payment post-save hook:", error.message);
    // Don't throw - payment is already saved
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
