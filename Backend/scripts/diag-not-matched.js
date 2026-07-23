require("dotenv").config();
const mongoose = require("mongoose");
const JobApplication = require("../features/job-applications/job-application.model");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const apps = await JobApplication.find({ post: "6a58aad12b8b1d57cac75e37" })
    .select("matchScore recruiterDecision rejectionReason appliedAt createdAt")
    .lean();

  console.log(JSON.stringify(apps, null, 2));
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});