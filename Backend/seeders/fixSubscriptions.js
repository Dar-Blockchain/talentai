/**
 * One-shot fix:
 * 1. Remove duplicate Free subscriptions (keep only the oldest one)
 * 2. Re-link any orphaned subscriptions to the correct plan by matching postsLimit
 * 3. Reset postsUsed to actual post count
 *
 * Usage: node seeders/fixSubscriptions.js
 */

const mongoose = require("mongoose");
const Subscription = require("../models/Subscription.model");
const PlanLimits = require("../models/PlanLimits.model");
const Post = require("../models/Post.model");
require("dotenv").config();

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/talentai");
    console.log("✅ MongoDB connected");
  }
};

const fix = async () => {
  await connectDB();

  const plans = await PlanLimits.find({ isActive: true });
  const planMap = {};
  plans.forEach((p) => { planMap[p.name.toLowerCase()] = p; });
  console.log("📋 Current plans:", plans.map((p) => `${p.name}(${p._id})`).join(", "));

  // Get all companies that have subscriptions
  const allSubs = await Subscription.find({ status: "active" }).populate("planId");
  const byCompany = {};
  allSubs.forEach((s) => {
    const cid = s.companyProfileId.toString();
    if (!byCompany[cid]) byCompany[cid] = [];
    byCompany[cid].push(s);
  });

  for (const [companyId, subs] of Object.entries(byCompany)) {
    console.log(`\n🏢 Company ${companyId}: ${subs.length} subscription(s)`);

    // 1. Fix orphaned subs (planId is null after populate)
    for (const sub of subs) {
      if (!sub.planId) {
        const freePlan = planMap["free"];
        if (freePlan) {
          await Subscription.findByIdAndUpdate(sub._id, { planId: freePlan._id });
          sub.planId = freePlan;
          console.log(`  🔧 Orphaned sub ${sub._id} → linked to Free`);
        }
      }
    }

    // 2. Remove duplicate Free subscriptions — keep only the oldest
    const freeSubs = subs.filter((s) => s.planId?.name === "Free");
    if (freeSubs.length > 1) {
      freeSubs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      const [keep, ...extras] = freeSubs;
      for (const dup of extras) {
        await Subscription.findByIdAndDelete(dup._id);
        console.log(`  🗑️  Removed duplicate Free sub ${dup._id} (kept ${keep._id})`);
      }
    }

    // 3. Reset postsUsed to actual post count
    const postCount = await Post.countDocuments({ user: new mongoose.Types.ObjectId(companyId) });
    const remaining = subs.filter((s) => s.planId?.name !== "Free" || freeSubs.length === 1 || s._id.toString() === (freeSubs[0]?._id?.toString()));

    // Spread postsUsed: assign to subscriptions in order
    let toAssign = postCount;
    const validSubs = await Subscription.find({ companyProfileId: companyId, status: "active" }).populate("planId");
    for (const sub of validSubs) {
      if (!sub.planId) continue;
      const cap = sub.planId.postsLimit === -1 ? Infinity : sub.planId.postsLimit;
      const assigned = Math.min(toAssign, cap);
      await Subscription.findByIdAndUpdate(sub._id, { postsUsed: assigned });
      toAssign = Math.max(0, toAssign - assigned);
      console.log(`  📊 Sub ${sub._id} (${sub.planId.name}): postsUsed = ${assigned}`);
    }
  }

  console.log("\n✅ Fix complete!");
};

(async () => {
  try {
    await fix();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
