// One-off backfill: postGenerationsLimit is a new PlanLimits field. The
// seeder only inserts missing plan names, so it never wrote this field onto
// the 5 plans that already existed — Mongoose's schema default (20) was
// filling the gap identically for every plan instead of the tiered values.
// This script sets the intended per-tier value directly.
require("dotenv").config();
const mongoose = require("mongoose");
const PlanLimits = require("../features/billing/plans/plan-limits.model");

const VALUES = {
  Trial: 5,
  Starter: 15,
  Pro: 50,
  Business: 125,
  Unlimited: -1,
};

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const [name, postGenerationsLimit] of Object.entries(VALUES)) {
    const result = await PlanLimits.updateOne({ name }, { $set: { postGenerationsLimit } });
    console.log(`${name}: matched ${result.matchedCount}, modified ${result.modifiedCount} -> ${postGenerationsLimit}`);
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
