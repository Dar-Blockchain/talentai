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
    // Use 'this' to ensure we have the most recent data
    const payment = this;
    
    console.log(`📌 [Payment Post-Save Hook] Payment ${payment._id} saved with status: ${payment.status}`);
    console.log(`📌 [Payment Post-Save Hook] companyProfileId: ${payment.companyProfileId}, planId: ${payment.planId}`);

    if (payment.companyProfileId) {
      const Profile = require("./Profile.model");
      const profile = await Profile.findById(payment.companyProfileId);
      
      console.log(`📌 [Payment Post-Save Hook] Profile found: ${profile ? 'Yes' : 'No'}`);
      
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

        // ✅ Update planLimits when payment is completed
        if (payment.status === "completed" && payment.planId) {
          profile.planLimits = payment.planId;
          updated = true;
          console.log(`✅ Profile planLimits updated with plan ${payment.planId} for payment ${payment._id}`);
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
