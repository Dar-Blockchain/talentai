// One-off backfill: existing applications that were auto-rejected for being
// below the job's match threshold were stored with recruiterDecision =
// "rejected". As of this change, auto-rejections use "not_matched" instead so
// they stop being counted alongside real recruiter rejections. This script
// migrates the historical rows so the UI/dashboard reflect that split
// immediately instead of only for new applications.
require("dotenv").config();
const mongoose = require("mongoose");
const JobApplication = require("../features/job-applications/job-application.model");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const result = await JobApplication.updateMany(
    {
      recruiterDecision: "rejected",
      rejectionReason: { $regex: /below the required threshold/i },
    },
    { $set: { recruiterDecision: "not_matched" } },
  );

  console.log(`Matched ${result.matchedCount}, modified ${result.modifiedCount}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});