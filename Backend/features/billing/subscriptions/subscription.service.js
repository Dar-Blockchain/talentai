const mongoose = require("mongoose");
const Subscription = require("./subscription.model");
const PlanLimits = require("../plans/plan-limits.model");

module.exports.getActiveSubscription = async (companyProfileId) => {
  try {
    if (!companyProfileId) {
      const err = new Error("Company profile ID is required");
      err.status = 400;
      throw err;
    }

    const allActive = await Subscription.find({
      companyProfileId,
      status: "active",
      endDate: { $gt: new Date() },
    })
      .populate("planId")
      .populate("paymentId")
      .sort({ createdAt: -1 });

    const paid = allActive.filter((s) => s.planId?.name !== "Trial");
    const subscriptions = paid.length ? paid : allActive;

    if (!subscriptions.length) {
      const err = new Error("No active subscription found for this company");
      err.status = 404;
      throw err;
    }

    const combined = {
      totalPostsLimit:     subscriptions.reduce((sum, s) => sum + (s.planId?.postsLimit || 0), 0),
      totalInterviewLimit: subscriptions.reduce((sum, s) => sum + (s.planId?.monthlyInterviewLimit || 0), 0),
      totalPostsUsed:      subscriptions.reduce((sum, s) => sum + (s.postsUsed || 0), 0),
      totalInterviewsUsed: subscriptions.reduce((sum, s) => sum + (s.monthlyInterviewsUsed || 0), 0),
    };

    return { success: true, data: subscriptions[0], subscriptions, combined };
  } catch (error) {
    console.error("Error getting active subscription:", error);
    throw error;
  }
};

module.exports.getCompanySubscriptions = async (companyProfileId) => {
  try {
    if (!companyProfileId) {
      const err = new Error("Company profile ID is required");
      err.status = 400;
      throw err;
    }

    const subscriptions = await Subscription.find({ companyProfileId })
      .populate("planId")
      .sort({ createdAt: -1 });

    return { success: true, data: subscriptions, count: subscriptions.length };
  } catch (error) {
    console.error("Error fetching company subscriptions:", error);
    throw error;
  }
};

// Enforces "single active plan, upgrade-only" purchasing: a company may not
// buy a second plan while one is active unless the new plan is a genuine
// upgrade (strictly higher price) over their highest active paid plan.
module.exports.assertUpgradeEligible = async (companyProfileId, targetPlan) => {
  if (!companyProfileId || !targetPlan) {
    const err = new Error("Company profile and target plan are required");
    err.status = 400;
    throw err;
  }

  const activeSubs = await Subscription.find({
    companyProfileId,
    status: "active",
    endDate: { $gt: new Date() },
  }).populate("planId");

  const paidSubs = activeSubs.filter((s) => s.planId && s.planId.name !== "Trial");

  if (!paidSubs.length) {
    return { previousSubscriptionIds: [] };
  }

  const highestActivePrice = Math.max(...paidSubs.map((s) => s.planId.priceUsd || 0));

  if ((targetPlan.priceUsd || 0) <= highestActivePrice) {
    const err = new Error(
      "You already have an active plan. You can only upgrade to a higher-tier plan — wait for your current plan to expire, or choose a higher plan to upgrade now."
    );
    err.status = 409;
    throw err;
  }

  return { previousSubscriptionIds: paidSubs.map((s) => s._id) };
};

module.exports.checkSubscriptionLimit = async (companyProfileId, limitType) => {
  try {
    const allActive = await Subscription.find({
      companyProfileId,
      status: "active",
      endDate: { $gt: new Date() },
    }).populate("planId");

    const valid = allActive.filter((s) => s.planId != null);

    if (!allActive.length) {
      return { canUse: false, message: "No active subscription found", limitData: null };
    }

    if (!valid.length && allActive.length) {
      try {
        const freePlan = await PlanLimits.findOne({ name: "Trial", isActive: true });
        if (freePlan) {
          await Subscription.updateMany(
            { _id: { $in: allActive.map((s) => s._id) } },
            { planId: freePlan._id }
          );
          const repaired = await Subscription.find({
            companyProfileId,
            status: "active",
            endDate: { $gt: new Date() },
          }).populate("planId");
          valid.push(...repaired.filter((s) => s.planId != null));
        }
      } catch (repairErr) {
        console.error("Auto-repair orphaned subscriptions failed:", repairErr.message);
      }
    }

    let active = valid.length ? valid : allActive;

    // Same "prefer paid over a leftover Trial" rule as getCombinedActiveDetails
    // — otherwise a stale still-active Trial (100-year endDate) combines its
    // tiny limits into a real paid plan's, silently over-granting quota.
    const paidActive = active.filter((s) => s.planId?.name !== "Trial");
    if (paidActive.length) active = paidActive;

    let used = 0;
    let limit = 0;

    if (limitType === "posts") {
      used  = active.reduce((sum, s) => sum + (s.postsUsed || 0), 0);
      limit = active.some((s) => s.planId?.postsLimit === -1)
        ? -1
        : active.reduce((sum, s) => sum + (s.planId?.postsLimit || 0), 0);
    } else if (limitType === "postGenerations") {
      used  = active.reduce((sum, s) => sum + (s.postGenerationsUsed || 0), 0);
      limit = active.some((s) => s.planId?.postGenerationsLimit === -1)
        ? -1
        : active.reduce((sum, s) => sum + (s.planId?.postGenerationsLimit || 0), 0);
    } else if (limitType === "monthlyInterviews") {
      await Promise.all(active.map((s) => module.exports.resetMonthlyInterviewIfNeeded(s._id)));
      const refreshed = await Subscription.find({ _id: { $in: active.map((s) => s._id) } });
      used  = refreshed.reduce((sum, s) => sum + (s.monthlyInterviewsUsed || 0), 0);
      limit = active.some((s) => s.planId?.monthlyInterviewLimit === -1)
        ? -1
        : active.reduce((sum, s) => sum + (s.planId?.monthlyInterviewLimit || 0), 0);
    } else {
      throw new Error("Invalid limit type");
    }

    const canUse = limit === -1 || used < limit;
    const remaining = limit === -1 ? -1 : Math.max(0, limit - used);
    const planNames = [...new Set(active.map((s) => s.planId?.name).filter(Boolean))].join(" + ");

    return {
      canUse,
      message: canUse
        ? `You can use ${remaining} more ${limitType} (combined across ${active.length} plan${active.length > 1 ? "s" : ""})`
        : `You have reached the combined ${limitType} limit (${limit}) across all your plans`,
      limitData: {
        used,
        limit,
        remaining,
        planName: planNames,
        subscriptionIds: active.map((s) => s._id),
        expiresAt: active.map((s) => s.endDate),
      },
    };
  } catch (error) {
    console.error("Error checking subscription limit:", error);
    throw error;
  }
};

module.exports.incrementUsage = async (subscriptionId, usageType, amount = 1) => {
  try {
    if (!subscriptionId || !usageType) {
      const err = new Error("Subscription ID and usage type are required");
      err.status = 400;
      throw err;
    }

    if (!["postsUsed", "monthlyInterviewsUsed", "postGenerationsUsed"].includes(usageType)) {
      const err = new Error("Invalid usage type");
      err.status = 400;
      throw err;
    }

    const updateObj = { [usageType]: amount };

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      { $inc: updateObj },
      { new: true }
    ).populate("planId");

    if (!subscription) {
      const err = new Error("Subscription not found");
      err.status = 404;
      throw err;
    }


    return { success: true, data: subscription };
  } catch (error) {
    console.error("Error incrementing usage:", error);
    throw error;
  }
};

module.exports.resetMonthlyInterviewIfNeeded = async (subscriptionId) => {
  try {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      const err = new Error("Subscription not found");
      err.status = 404;
      throw err;
    }

    const now = new Date();
    const lastReset = subscription.lastMonthlyResetDate || subscription.createdAt;
    const daysDifference = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));

    if (daysDifference / 30 >= 1) {
      subscription.monthlyInterviewsUsed = 0;
      subscription.lastMonthlyResetDate = now;
      await subscription.save();
      return { success: true, data: subscription, wasReset: true };
    }

    return { success: true, data: subscription, wasReset: false };
  } catch (error) {
    console.error("Error resetting monthly interview:", error);
    throw error;
  }
};

module.exports.cancelSubscription = async (subscriptionId, reason = "") => {
  try {
    const subscription = await Subscription.findById(subscriptionId).populate("planId");

    if (!subscription) {
      const err = new Error("Subscription not found");
      err.status = 404;
      throw err;
    }

    if (!subscription.autoRenew) {
      const err = new Error("Auto-renewal is already disabled for this subscription");
      err.status = 400;
      throw err;
    }

    subscription.autoRenew = false;
    subscription.cancellationReason = reason;
    subscription.cancelledAt = new Date();
    await subscription.save();


    return {
      success: true,
      data: subscription,
      message: `Your plan remains active until ${subscription.endDate.toDateString()} and will not renew after that.`,
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
};

module.exports.enableAutoRenew = async (subscriptionId) => {
  try {
    const subscription = await Subscription.findById(subscriptionId);

    if (!subscription) {
      const err = new Error("Subscription not found");
      err.status = 404;
      throw err;
    }

    if (subscription.autoRenew) {
      const err = new Error("Auto-renewal is already enabled");
      err.status = 400;
      throw err;
    }

    subscription.autoRenew = true;
    subscription.cancellationReason = undefined;
    subscription.cancelledAt = undefined;
    await subscription.save();

    return { success: true, data: subscription, message: "Auto-renewal has been re-enabled." };
  } catch (error) {
    console.error("Error enabling auto-renewal:", error);
    throw error;
  }
};

module.exports.getSubscriptionDetails = async (subscriptionId) => {
  try {
    const subscription = await Subscription.findById(subscriptionId)
      .populate("planId")
      .populate("paymentId");

    if (!subscription) {
      const err = new Error("Subscription not found");
      err.status = 404;
      throw err;
    }

    const planLimits = subscription.planId;

    return {
      success: true,
      data: {
        id: subscription._id,
        status: subscription.status,
        planName: planLimits.name,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        daysRemaining: subscription.daysRemaining,
        isActive: subscription.isActive,
        usage: {
          posts: {
            used: subscription.postsUsed,
            limit: planLimits.postsLimit,
            remaining: Math.max(0, planLimits.postsLimit - subscription.postsUsed),
            percentageUsed: subscription.percentageUsed,
          },
          monthlyInterviews: {
            used: subscription.monthlyInterviewsUsed,
            limit: planLimits.monthlyInterviewLimit,
            remaining: Math.max(0, planLimits.monthlyInterviewLimit - subscription.monthlyInterviewsUsed),
          },
        },
        autoRenew: subscription.autoRenew,
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error getting subscription details:", error);
    throw error;
  }
};

module.exports.getCombinedActiveDetails = async (companyProfileId) => {
  try {
    if (!companyProfileId) {
      const err = new Error("Company profile ID is required");
      err.status = 400;
      throw err;
    }

    const allActive = await Subscription.find({
      companyProfileId,
      status: "active",
      endDate: { $gt: new Date() },
    }).populate("planId").sort({ createdAt: -1 });

    let valid = allActive.filter((s) => s.planId != null);

    if (!valid.length && allActive.length) {
      const Payment = mongoose.model("Payment");
      const PlanLimits = mongoose.model("PlanLimits");

      // Batch-fetch payments + candidate plans for every subscription that
      // needs repair in one round trip each, instead of awaiting per-sub
      // inside the loop (this path only runs on data-integrity gaps, but
      // there's no reason to serialize N independent lookups).
      const subIds = allActive.map((s) => s._id);
      const payments = await Payment.find({ subscriptionId: { $in: subIds } }).select("subscriptionId planName planId");
      const paymentBySub = new Map(payments.map((p) => [String(p.subscriptionId), p]));

      const planNames = [...new Set(payments.map((p) => p.planName).filter(Boolean))];
      const planIds = [...new Set(payments.map((p) => p.planId).filter(Boolean).map(String))];
      const [plansByName, plansById] = await Promise.all([
        planNames.length ? PlanLimits.find({ name: { $in: planNames }, isActive: true }) : [],
        planIds.length ? PlanLimits.find({ _id: { $in: planIds } }) : [],
      ]);
      const planByName = new Map(plansByName.map((p) => [p.name, p]));
      const planById = new Map(plansById.map((p) => [String(p._id), p]));

      const updates = [];
      for (const sub of allActive) {
        const payment = paymentBySub.get(String(sub._id));
        const planDoc = (payment?.planName && planByName.get(payment.planName))
          || (payment?.planId && planById.get(String(payment.planId)))
          || null;
        if (planDoc) {
          sub.planId = planDoc;
          updates.push({ updateOne: { filter: { _id: sub._id }, update: { planId: planDoc._id } } });
        }
      }
      if (updates.length) {
        try {
          await Subscription.bulkWrite(updates);
        } catch (repairErr) {
          console.error("⚠️  Could not persist subscription plan repairs:", repairErr.message);
        }
      }
      valid = allActive.filter((s) => s.planId != null);

      if (!valid.length) {
        const freePlan = await mongoose.model("PlanLimits").findOne({ name: "Trial", isActive: true });
        if (freePlan) {
          await Subscription.updateMany({ _id: { $in: allActive.map((s) => s._id) } }, { planId: freePlan._id });
          const repaired = await Subscription.find({ companyProfileId, status: "active", endDate: { $gt: new Date() } }).populate("planId");
          valid.push(...repaired.filter((s) => s.planId != null));
        }
      }
    }

    let subscriptions = valid.length ? valid : allActive;

    // A leftover Trial subscription can still be "active" (its endDate is
    // set 100 years out) even after a real plan is purchased — legacy data
    // from before purchases started retiring other active subscriptions on
    // upgrade (see payment.model.js). Prefer the paid plan(s) so the UI
    // shows exactly one current plan instead of Trial + the paid plan both,
    // matching getActiveSubscription's existing same-shaped filter.
    const paidSubscriptions = subscriptions.filter((s) => s.planId?.name !== "Trial");
    if (paidSubscriptions.length) subscriptions = paidSubscriptions;

    if (!subscriptions.length || subscriptions.every((s) => !s.planId)) {
      const err = new Error("No active subscription found");
      err.status = 404;
      throw err;
    }

    const now = new Date();
    const hasUnlimitedPosts       = subscriptions.some((s) => s.planId?.postsLimit === -1);
    const hasUnlimitedInterviews  = subscriptions.some((s) => s.planId?.monthlyInterviewLimit === -1);
    const hasUnlimitedGenerations = subscriptions.some((s) => s.planId?.postGenerationsLimit === -1);
    const totalPostsLimit       = hasUnlimitedPosts ? -1 : subscriptions.reduce((sum, s) => sum + (s.planId?.postsLimit || 0), 0);
    const totalInterviewLimit   = hasUnlimitedInterviews ? -1 : subscriptions.reduce((sum, s) => sum + (s.planId?.monthlyInterviewLimit || 0), 0);
    const totalGenerationsLimit = hasUnlimitedGenerations ? -1 : subscriptions.reduce((sum, s) => sum + (s.planId?.postGenerationsLimit || 0), 0);
    const totalPostsUsed       = subscriptions.reduce((sum, s) => sum + (s.postsUsed || 0), 0);
    const totalInterviewsUsed  = subscriptions.reduce((sum, s) => sum + (s.monthlyInterviewsUsed || 0), 0);
    const totalGenerationsUsed = subscriptions.reduce((sum, s) => sum + (s.postGenerationsUsed || 0), 0);
    const soonestExpiry = subscriptions.reduce((min, s) => s.endDate < min ? s.endDate : min, subscriptions[0].endDate);
    const daysRemaining = Math.max(0, Math.ceil((new Date(soonestExpiry) - now) / 86400000));

    return {
      success: true,
      data: {
        subscriptions: subscriptions.map((s) => ({
          id: s._id,
          planName: s.planId?.name,
          status: s.status,
          startDate: s.startDate,
          endDate: s.endDate,
          postsUsed: s.postsUsed,
          postsLimit: s.planId?.postsLimit,
          postGenerationsUsed: s.postGenerationsUsed,
          postGenerationsLimit: s.planId?.postGenerationsLimit,
          monthlyInterviewsUsed: s.monthlyInterviewsUsed,
          monthlyInterviewLimit: s.planId?.monthlyInterviewLimit,
          autoRenew: s.autoRenew,
        })),
        combined: {
          planNames: subscriptions.map((s) => s.planId?.name).filter(Boolean),
          daysRemaining,
          soonestExpiry,
          usage: {
            posts: {
              used: totalPostsUsed,
              limit: totalPostsLimit,
              remaining: totalPostsLimit === -1 ? -1 : Math.max(0, totalPostsLimit - totalPostsUsed),
            },
            postGenerations: {
              used: totalGenerationsUsed,
              limit: totalGenerationsLimit,
              remaining: totalGenerationsLimit === -1 ? -1 : Math.max(0, totalGenerationsLimit - totalGenerationsUsed),
            },
            monthlyInterviews: {
              used: totalInterviewsUsed,
              limit: totalInterviewLimit,
              remaining: totalInterviewLimit === -1 ? -1 : Math.max(0, totalInterviewLimit - totalInterviewsUsed),
            },
          },
        },
      },
    };
  } catch (error) {
    console.error("Error getting combined active details:", error);
    throw error;
  }
};

module.exports.markExpiredSubscriptions = async () => {
  try {
    const result = await Subscription.updateMany(
      { status: { $ne: "expired" }, endDate: { $lte: new Date() } },
      { status: "expired" }
    );
    return { success: true, count: result.modifiedCount };
  } catch (error) {
    console.error("Error marking expired subscriptions:", error);
    throw error;
  }
};

module.exports.adminCreateSubscription = async ({ companyProfileId, planId, startDate, notes }) => {
  try {
    if (!companyProfileId || !planId) {
      const err = new Error("Company and plan are required");
      err.status = 400;
      throw err;
    }

    const Profile = mongoose.model("Profile");
    const profile = await Profile.findById(companyProfileId);
    if (!profile || profile.type !== "Company") {
      const err = new Error("Company profile not found");
      err.status = 404;
      throw err;
    }

    const plan = await PlanLimits.findById(planId);
    if (!plan) {
      const err = new Error("Plan not found");
      err.status = 404;
      throw err;
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.durationDays);

    const subscription = await Subscription.create({
      companyProfileId,
      planId,
      startDate: start,
      endDate: end,
      status: "active",
      autoRenew: false,
      notes: notes || "Granted manually by admin",
    });

    return { success: true, data: await subscription.populate("planId") };
  } catch (error) {
    console.error("Error creating admin subscription:", error);
    throw error;
  }
};

module.exports.getAllCompaniesWithSubscriptions = async ({ search = "", page = 1, limit = 20 } = {}) => {
  try {
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    const now = new Date();

    // Pick each company's most relevant subscription in the DB: active
    // subscriptions sort first, ties broken by most recent — all done via
    // an index-backed sort + $group, so we never pull more than one
    // subscription per company into memory (no full-collection scan/load).
    const pipeline = [
      {
        $addFields: {
          _isActive: { $and: [{ $eq: ["$status", "active"] }, { $gt: ["$endDate", now] }] },
        },
      },
      { $sort: { _isActive: -1, createdAt: -1 } },
      {
        $group: {
          _id: "$companyProfileId",
          subscription: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "_id",
          foreignField: "_id",
          as: "profile",
        },
      },
      { $unwind: "$profile" },
      { $match: { "profile.type": "Company" } },
      ...(search
        ? [{
            $match: {
              $or: [
                { "profile.companyDetails.name": { $regex: search, $options: "i" } },
                { "profile.companyDetails.email": { $regex: search, $options: "i" } },
              ],
            },
          }]
        : []),
      {
        $lookup: {
          from: "planlimits",
          localField: "subscription.planId",
          foreignField: "_id",
          as: "plan",
        },
      },
      { $unwind: { path: "$plan", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "profile.userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          profileId: "$_id",
          name: { $ifNull: ["$profile.companyDetails.name", "$user.username", "Unnamed company"] },
          email: { $ifNull: ["$profile.companyDetails.email", "$user.email", ""] },
          companyNameSort: { $toLower: { $ifNull: ["$profile.companyDetails.name", ""] } },
          subscription: {
            id: "$subscription._id",
            planName: { $ifNull: ["$plan.name", "Unknown"] },
            status: "$subscription.status",
            isActive: "$subscription._isActive",
            startDate: "$subscription.startDate",
            endDate: "$subscription.endDate",
            postsUsed: "$subscription.postsUsed",
            postsLimit: { $ifNull: ["$plan.postsLimit", null] },
            monthlyInterviewsUsed: "$subscription.monthlyInterviewsUsed",
            monthlyInterviewLimit: { $ifNull: ["$plan.monthlyInterviewLimit", null] },
            autoRenew: "$subscription.autoRenew",
          },
        },
      },
      { $sort: { companyNameSort: 1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }, { $project: { companyNameSort: 0 } }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const [result] = await Subscription.aggregate(pipeline);
    const data = result?.data ?? [];
    const total = result?.totalCount?.[0]?.count ?? 0;

    return { success: true, data, total, page: pageNum, limit: limitNum };
  } catch (error) {
    console.error("Error listing companies with subscriptions:", error);
    throw error;
  }
};

module.exports.searchCompanies = async (search = "") => {
  try {
    const Profile = mongoose.model("Profile");
    const query = { type: "Company" };
    if (search) {
      query.$or = [
        { "companyDetails.name": { $regex: search, $options: "i" } },
        { "companyDetails.email": { $regex: search, $options: "i" } },
      ];
    }

    const companies = await Profile.find(query)
      .select("companyDetails.name companyDetails.email userId")
      .populate("userId", "username email")
      .limit(20)
      .lean();

    return {
      success: true,
      data: companies.map((c) => ({
        profileId: c._id,
        name: c.companyDetails?.name || c.userId?.username || "Unnamed company",
        email: c.companyDetails?.email || c.userId?.email || "",
      })),
    };
  } catch (error) {
    console.error("Error searching companies:", error);
    throw error;
  }
};
