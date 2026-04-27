/**
 * Fix orphaned subscriptions whose planId references a deleted plan document.
 *
 * This happens when plans are deleted and recreated (new _id) but existing
 * subscriptions still point to the old _id. After populate(), planId is null.
 *
 * Strategy: for each subscription where planId is null after populate,
 * look at the subscription's metadata (or just try to match by plan name
 * stored on the subscription, if any). If no name is stored, we assign
 * the best matching plan based on subscription amount/price, or fall back
 * to the Unlimited plan if the company has paid.
 *
 * Usage: node seeders/fixOrphanedSubscriptions.js
 */

const mongoose = require("mongoose");
const Subscription = require("../models/Subscription.model");
const PlanLimits = require("../models/PlanLimits.model");
require("dotenv").config();

const connectDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/talentai", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");
  }
};

const fixOrphanedSubscriptions = async () => {
  await connectDB();

  // Load all current valid plans
  const plans = await PlanLimits.find({ isActive: true });
  console.log(`📋 Found ${plans.length} active plans:`, plans.map((p) => `${p.name} (${p._id})`));

  const planMap = {};
  plans.forEach((p) => { planMap[p.name.toLowerCase()] = p; });

  // Find all active subscriptions
  const allSubs = await Subscription.find({ status: "active" }).populate("planId");

  const orphaned = allSubs.filter((s) => s.planId == null);
  console.log(`\n🔍 Total active subscriptions: ${allSubs.length}`);
  console.log(`⚠️  Orphaned (planId null): ${orphaned.length}`);

  if (orphaned.length === 0) {
    console.log("✅ No orphaned subscriptions found. Nothing to fix.");
    return;
  }

  // Pick best plan to assign. Priority:
  // 1. If planName is stored on subscription, use that
  // 2. Else use "Unlimited" if available, otherwise "Pro"
  const fallbackPlan = planMap["unlimited"] || planMap["pro"] || plans[plans.length - 1];

  let fixed = 0;
  for (const sub of orphaned) {
    // Try to find plan by stored name (some schemas store planName as a field)
    const storedName = sub.planName || sub.plan || sub.planLabel;
    let targetPlan = storedName ? planMap[storedName.toLowerCase()] : null;

    if (!targetPlan) {
      targetPlan = fallbackPlan;
      console.log(`  ↳ Sub ${sub._id} (company: ${sub.companyProfileId}) — no plan name found, assigning "${targetPlan.name}"`);
    } else {
      console.log(`  ↳ Sub ${sub._id} (company: ${sub.companyProfileId}) — matched plan "${targetPlan.name}" by stored name "${storedName}"`);
    }

    await Subscription.findByIdAndUpdate(sub._id, { planId: targetPlan._id });
    fixed++;
  }

  console.log(`\n🎉 Fixed ${fixed} orphaned subscription(s).`);

  // Verify
  const afterFix = await Subscription.find({ status: "active" }).populate("planId");
  const stillOrphaned = afterFix.filter((s) => s.planId == null);
  console.log(`✅ Orphaned remaining after fix: ${stillOrphaned.length}`);
};

(async () => {
  try {
    await fixOrphanedSubscriptions();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
