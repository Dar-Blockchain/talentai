/**
 * Seeder for default PlanLimits
 *
 * Usage: node seeders/planLimits.seeder.js
 * This script creates default plans if they don't already exist
 *
 * Can also be imported and used programmatically:
 * const { seedDefaultPlans } = require('./planLimits.seeder');
 * await seedDefaultPlans();
 */

const mongoose = require("mongoose");
const PlanLimits = require("../models/PlanLimits.model");
require("dotenv").config();

// Default plans
const defaultPlans = [
  {
    name: "Free",
    postsLimit: 1,
    monthlyInterviewLimit: 5,
    durationDays: 30,
    priceUsd: 0,
    description: "Get started for free with basic hiring features",
    isActive: true,
  },
  {
    name: "Starter",
    postsLimit: 3,
    monthlyInterviewLimit: 15,
    durationDays: 30,
    priceUsd: 99,
    description: "Perfect for small teams getting started with AI hiring",
    isActive: true,
  },
  {
    name: "Pro",
    postsLimit: 10,
    monthlyInterviewLimit: 50,
    durationDays: 30,
    priceUsd: 299,
    description: "For growing teams with structured hiring needs",
    isActive: true,
  },
  {
    name: "Business",
    postsLimit: 25,
    monthlyInterviewLimit: 150,
    durationDays: 30,
    priceUsd: 749,
    description: "For scaling companies with high-volume recruitment",
    isActive: true,
  },
  {
    name: "Unlimited",
    postsLimit: -1,
    monthlyInterviewLimit: 700,
    durationDays: 30,
    priceUsd: 1499,
    description: "Unlimited posts and pipelines for enterprise teams",
    isActive: true,
  },
];

// Connect to MongoDB (only if needed)
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/talentai", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("✅ MongoDB connected");
    }
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    throw error;
  }
};

/**
 * Seed default plans to database
 * @returns {Promise<boolean>} - Returns true if seeding was successful
 */
const seedDefaultPlans = async () => {
  try {
    // Check if already connected, if not connect
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    console.log("🌱 Starting PlanLimits seeding...");

    // Remove plans that are no longer in defaultPlans (stale plans like Diamond, Gold, etc.)
    const validNames = defaultPlans.map((p) => p.name);
    await PlanLimits.deleteMany({ name: { $nin: validNames } });
    console.log("🗑️  Removed stale plans");

    // Upsert each plan by name — preserves existing _id so subscriptions stay valid
    for (const plan of defaultPlans) {
      await PlanLimits.findOneAndUpdate(
        { name: plan.name },
        { $set: plan },
        { upsert: true, new: true }
      );
      console.log(`✅ Plan "${plan.name}" upserted`);
    }

    console.log("🎉 PlanLimits seeding completed successfully!");

    // Display all plans
    const allPlans = await PlanLimits.find().select(
      "name postsLimit monthlyInterviewLimit"
    );
    console.log("\n📋 Current Plans:");
    console.table(allPlans);

    return true;
  } catch (error) {
    console.error("❌ Error seeding plans:", error.message);
    throw error;
  }
};

// Check if running directly as a script
if (require.main === module) {
  // Running as standalone script
  (async () => {
    try {
      await seedDefaultPlans();
      process.exit(0);
    } catch (error) {
      console.error("Fatal error:", error.message);
      process.exit(1);
    }
  })();
} else {
  // Being imported as a module
  module.exports = { seedDefaultPlans };
}
