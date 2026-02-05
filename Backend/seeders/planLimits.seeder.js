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
    description: "Trial plan for new users",
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

    // Check if plans already exist
    const existingPlansCount = await PlanLimits.countDocuments();
    
    if (existingPlansCount > 0) {
      console.log(`ℹ️  PlanLimits table already contains ${existingPlansCount} plan(s). Skipping seeding...`);
      return true;
    }

    console.log("📝 Table is empty. Creating default plans...");

    for (const plan of defaultPlans) {
      const newPlan = new PlanLimits(plan);
      await newPlan.save();
      console.log(`✅ Plan "${plan.name}" created successfully`);
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
