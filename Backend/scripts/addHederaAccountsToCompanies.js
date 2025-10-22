require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/UserModel");
const Profile = require("../models/ProfileModel");
const hederaService = require("../services/hederaService");

/**
 * Script to add Hedera accounts to all company users who don't have one
 */
async function addHederaAccountsToCompanies() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Find all company users
    const companyProfiles = await Profile.find({ type: "Company" }).populate("userId");
    console.log(`📊 Found ${companyProfiles.length} company profiles`);

    let created = 0;
    let skipped = 0;
    let failed = 0;

    for (const profile of companyProfiles) {
      const user = profile.userId;

      if (!user) {
        console.log(`⚠️  Profile ${profile._id} has no associated user`);
        failed++;
        continue;
      }

      // Check if user already has Hedera account
      if (user.hederaAccountId) {
        console.log(`⏭️  User ${user.email} already has Hedera account: ${user.hederaAccountId}`);
        skipped++;
        continue;
      }

      // Create Hedera account
      console.log(`🔧 Creating Hedera account for company: ${profile.companyDetails?.name || user.email}`);

      try {
        const hederaAccount = await hederaService.createHederaAccount();

        // Update user with Hedera account info
        await User.findByIdAndUpdate(user._id, {
          hederaAccountId: hederaAccount.hederaAccountId,
          hederaPrivateKey: hederaAccount.hederaPrivateKey,
          hederaPublicKey: hederaAccount.hederaPublicKey
        });

        console.log(`✅ Created Hedera account for ${user.email}: ${hederaAccount.hederaAccountId}`);
        created++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Failed to create Hedera account for ${user.email}:`, error.message);
        failed++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);

  } catch (error) {
    console.error("❌ Script failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n✅ MongoDB connection closed");
  }
}

// Run the script
addHederaAccountsToCompanies();
