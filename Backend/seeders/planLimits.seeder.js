/**
 * Seeder for default PlanLimits
 *
 * Usage: node seeders/planLimits.seeder.js
 * This script creates default plans if they don't already exist
 */

const mongoose = require("mongoose");
const PlanLimits = require("../models/PlanLimits.model");
require("dotenv").config();

// Connect to MongoDB
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
    process.exit(1);
  }
};

// Default plans
const defaultPlans = [
  {
    name: "Basic",
    postsLimit: 5,
    candidateUnlockLimit: 10,
    monthlyInterviewLimit: 15,
    description: "Basic plan for startups and small companies",
    isActive: true,
  },
  {
    name: "Professional",
    postsLimit: 20,
    candidateUnlockLimit: 50,
    monthlyInterviewLimit: 50,
    description: "Professional plan for growing companies",
    isActive: true,
  },
  {
    name: "Enterprise",
    postsLimit: 100,
    candidateUnlockLimit: 500,
    monthlyInterviewLimit: 200,
    description: "Enterprise plan for large companies",
    isActive: true,
  },
  {
    name: "Trial",
    postsLimit: 2,
    candidateUnlockLimit: 5,
    monthlyInterviewLimit: 5,
    description: "Trial plan for new users",
    isActive: true,
  },
];

// Seed function
const seedPlans = async () => {
  try {
    console.log("🌱 Starting PlanLimits seeding...");

    for (const plan of defaultPlans) {
      const existingPlan = await PlanLimits.findOne({ name: plan.name });

      if (existingPlan) {
        console.log(`⏭️  Plan "${plan.name}" already exists. Skipping...`);
      } else {
        const newPlan = new PlanLimits(plan);
        await newPlan.save();
        console.log(`✅ Plan "${plan.name}" created successfully`);
      }
    }

    console.log("🎉 PlanLimits seeding completed successfully!");

    // Display all plans
    const allPlans = await PlanLimits.find().select("name postsLimit candidateUnlockLimit monthlyInterviewLimit");
    console.log("\n📋 Current Plans:");
    console.table(allPlans);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding plans:", error.message);
    process.exit(1);
  }
};

// Run seeder
connectDB().then(() => seedPlans());
