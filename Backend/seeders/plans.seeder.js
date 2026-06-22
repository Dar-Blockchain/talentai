const mongoose = require("mongoose");
const PlanLimits = require("../features/billing/plans/plan-limits.model");
require("dotenv").config();

const DEFAULT_PLANS = [
  { name: "Trial",     postsLimit: 1,  monthlyInterviewLimit: 5,   durationDays: 30, priceUsd: 0,    description: "Get started for free with basic hiring features",       isActive: true },
  { name: "Starter",   postsLimit: 3,  monthlyInterviewLimit: 15,  durationDays: 30, priceUsd: 99,   description: "Perfect for small teams getting started with AI hiring", isActive: true },
  { name: "Pro",       postsLimit: 10, monthlyInterviewLimit: 50,  durationDays: 30, priceUsd: 299,  description: "For growing teams with structured hiring needs",          isActive: true },
  { name: "Business",  postsLimit: 25, monthlyInterviewLimit: 150, durationDays: 30, priceUsd: 749,  description: "For scaling companies with high-volume recruitment",      isActive: true },
  { name: "Unlimited", postsLimit: -1, monthlyInterviewLimit: 700, durationDays: 30, priceUsd: 1499, description: "Unlimited posts and pipelines for enterprise teams",      isActive: true },
];

const seedPlans = async () => {
  try {
    const validNames = DEFAULT_PLANS.map((p) => p.name);

    const [existingCount, staleCount] = await Promise.all([
      PlanLimits.countDocuments({ name: { $in: validNames } }),
      PlanLimits.countDocuments({ name: { $nin: validNames } }),
    ]);

    if (existingCount === DEFAULT_PLANS.length && staleCount === 0) return;

    if (staleCount > 0) await PlanLimits.deleteMany({ name: { $nin: validNames } });

    const existingNames = await PlanLimits.distinct("name", { name: { $in: validNames } });
    const missing = DEFAULT_PLANS.filter((p) => !existingNames.includes(p.name));

    if (missing.length > 0) {
      await PlanLimits.bulkWrite(
        missing.map((plan) => ({
          updateOne: { filter: { name: plan.name }, update: { $set: plan }, upsert: true },
        }))
      );
    }
  } catch (error) {
    console.warn("⚠️ Plans seed failed: " + error.message);
  }
};

module.exports = { seedPlans };
