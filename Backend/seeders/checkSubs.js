const mongoose = require("mongoose");
require("dotenv").config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/talentai");

  const Subscription = require("../models/Subscription.model");
  const Profile = require("../models/Profile.model");

  const profileId = "69f0c65c7533f9db655b83ee";

  // Find profile
  const profile = await Profile.findById(profileId).select("type activeSubscription subscriptions planLimits");
  console.log("Profile:", JSON.stringify(profile, null, 2));

  // Find all subs for this profile
  const subs = await Subscription.find({ companyProfileId: profileId }).populate("planId", "name");
  console.log(`\nSubscriptions for profileId ${profileId}: ${subs.length}`);
  subs.forEach(s => console.log(" -", s._id, s.status, s.planId?.name, "ends:", s.endDate));

  // Find ALL subs to see what companyProfileIds exist
  const allSubs = await Subscription.find({}).populate("planId", "name").sort({ createdAt: -1 }).limit(10);
  console.log("\nAll recent subscriptions:");
  allSubs.forEach(s => console.log(" -", s._id, "| companyProfileId:", s.companyProfileId, "| plan:", s.planId?.name, "| status:", s.status, "| ends:", s.endDate));

  await mongoose.disconnect();
}
run().catch(console.error);
