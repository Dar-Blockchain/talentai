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
    name: "Trial",
    postsLimit: 5,
    candidateUnlockLimit: 5,
    monthlyInterviewLimit: 15,
    priceUsd: 0,
    description: "Trial plan for new users",
    isActive: true,
  },
  {
    name: "Standard",
    postsLimit: 20,
    candidateUnlockLimit: 20,
    monthlyInterviewLimit: 50,
    priceUsd: 99,
    description: "Standard plan for growing teams",
    isActive: true,
  },
  {
    name: "Gold",
    postsLimit: 50,
    candidateUnlockLimit: 50,
    monthlyInterviewLimit: 120,
    priceUsd: 499,
    description: "Gold plan for larger teams",
    isActive: true,
  },
  {
    name: "Platinum",
    postsLimit: 100,
    candidateUnlockLimit: 100,
    monthlyInterviewLimit: 250,
    priceUsd: 999,
    description: "Platinum plan for enterprise customers",
    isActive: true,
  },
  {
    name: "Diamond",
    postsLimit: 200,
    candidateUnlockLimit: 200,
    monthlyInterviewLimit: 500,
    priceUsd: 1499,
    description: "Diamond plan for large enterprises",
    isActive: true,
  }  
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

    console.log("📝 Upserting default plans...");

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
      "name postsLimit candidateUnlockLimit monthlyInterviewLimit"
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
