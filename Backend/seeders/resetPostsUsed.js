/**
 * Reset postsUsed on all subscriptions to match actual post counts.
 * Run this once to fix incorrect postsUsed values.
 *
 * Usage: node seeders/resetPostsUsed.js
 */

const mongoose = require("mongoose");
const Subscription = require("../models/Subscription.model");
const Post = require("../models/Post.model");
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

const resetPostsUsed = async () => {
  await connectDB();

  const subs = await Subscription.find({ status: "active" }).populate("planId");
  console.log(`Found ${subs.length} active subscriptions`);

  for (const sub of subs) {
    const postCount = await Post.countDocuments({
      user: sub.companyProfileId,
    });

    await Subscription.findByIdAndUpdate(sub._id, { postsUsed: postCount });
    console.log(`Sub ${sub._id} (${sub.planId?.name}): postsUsed set to ${postCount}`);
  }
  console.log("✅ Done");
};

(async () => {
  try {
    await resetPostsUsed();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
})();
