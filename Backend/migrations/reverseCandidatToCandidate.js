/**
 * Database Migration Script
 * Migrates Profile.type from "Candidat" (French) to "Candidate" (English)
 *
 * Purpose: Fix type mismatch - normalize all candidate types to English
 *
 * IMPORTANT: Run this migration to fix validation errors for existing database records
 *
 * Usage:
 *   node Backend/migrations/reverseCandidatToCandidate.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Profile = require('../models/ProfileModel');
const User = require('../models/UserModel');

/**
 * Migrate Profile documents from type "Candidat" to "Candidate"
 * Also migrate User.role from "Candidat" to "Candidate"
 */
async function migrateCandidatToCandidate() {
  try {
    console.log('========================================');
    console.log('🔄 Starting Migration: Candidat → Candidate');
    console.log('========================================\n');

    // Check current state before migration
    console.log('📊 Checking current database state...');

    // Profile collection
    const beforeCandidatProfileCount = await Profile.countDocuments({ type: 'Candidat' });
    const beforeCandidateProfileCount = await Profile.countDocuments({ type: 'Candidate' });
    const totalProfiles = await Profile.countDocuments();

    // User collection
    const beforeCandidatUserCount = await User.countDocuments({ role: 'Candidat' });
    const beforeCandidateUserCount = await User.countDocuments({ role: 'Candidate' });
    const totalUsers = await User.countDocuments();

    console.log('📋 PROFILE Collection:');
    console.log(`   Total Profiles: ${totalProfiles}`);
    console.log(`   ❌ type="Candidat" (to migrate): ${beforeCandidatProfileCount}`);
    console.log(`   ✅ type="Candidate" (already correct): ${beforeCandidateProfileCount}\n`);

    console.log('📋 USER Collection:');
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   ❌ role="Candidat" (to migrate): ${beforeCandidatUserCount}`);
    console.log(`   ✅ role="Candidate" (already correct): ${beforeCandidateUserCount}\n`);

    if (beforeCandidatProfileCount === 0 && beforeCandidatUserCount === 0) {
      console.log('✅ No records to migrate. All records already use "Candidate".');
      console.log('========================================\n');
      return {
        success: true,
        alreadyMigrated: true,
        message: 'No migration needed'
      };
    }

    // Confirm migration
    console.log(`⚠️  About to migrate:`);
    console.log(`   - ${beforeCandidatProfileCount} Profile document(s)`);
    console.log(`   - ${beforeCandidatUserCount} User document(s)`);
    console.log('   This will update the type/role fields from "Candidat" to "Candidate".\n');

    // Perform Profile migration
    console.log('🚀 Executing Profile migration...');
    const profileResult = await Profile.updateMany(
      { type: 'Candidat' },
      { $set: { type: 'Candidate' } }
    );

    console.log(`✅ Profile migration executed!`);
    console.log(`   - Matched: ${profileResult.matchedCount} document(s)`);
    console.log(`   - Modified: ${profileResult.modifiedCount} document(s)\n`);

    // Perform User migration
    console.log('🚀 Executing User migration...');
    const userResult = await User.updateMany(
      { role: 'Candidat' },
      { $set: { role: 'Candidate' } }
    );

    console.log(`✅ User migration executed!`);
    console.log(`   - Matched: ${userResult.matchedCount} document(s)`);
    console.log(`   - Modified: ${userResult.modifiedCount} document(s)\n`);

    // Verify migration result
    console.log('🔍 Verifying migration result...');

    const afterCandidatProfileCount = await Profile.countDocuments({ type: 'Candidat' });
    const afterCandidateProfileCount = await Profile.countDocuments({ type: 'Candidate' });

    const afterCandidatUserCount = await User.countDocuments({ role: 'Candidat' });
    const afterCandidateUserCount = await User.countDocuments({ role: 'Candidate' });

    console.log('📋 PROFILE Collection (after):');
    console.log(`   ❌ type="Candidat" (remaining): ${afterCandidatProfileCount}`);
    console.log(`   ✅ type="Candidate" (after migration): ${afterCandidateProfileCount}\n`);

    console.log('📋 USER Collection (after):');
    console.log(`   ❌ role="Candidat" (remaining): ${afterCandidatUserCount}`);
    console.log(`   ✅ role="Candidate" (after migration): ${afterCandidateUserCount}\n`);

    const profileSuccess = afterCandidatProfileCount === 0 &&
                          afterCandidateProfileCount === beforeCandidatProfileCount + beforeCandidateProfileCount;
    const userSuccess = afterCandidatUserCount === 0 &&
                       afterCandidateUserCount === beforeCandidatUserCount + beforeCandidateUserCount;

    if (profileSuccess && userSuccess) {
      console.log('✅ Migration verified successfully!');
      console.log('   All "Candidat" records have been migrated to "Candidate".');
    } else {
      if (!profileSuccess) {
        console.warn('⚠️  Profile migration verification warning:');
        console.warn(`   Expected ${beforeCandidatProfileCount + beforeCandidateProfileCount} "Candidate" profiles`);
        console.warn(`   Found ${afterCandidateProfileCount} "Candidate" profiles`);
        console.warn(`   Remaining "Candidat" profiles: ${afterCandidatProfileCount}`);
      }
      if (!userSuccess) {
        console.warn('⚠️  User migration verification warning:');
        console.warn(`   Expected ${beforeCandidatUserCount + beforeCandidateUserCount} "Candidate" users`);
        console.warn(`   Found ${afterCandidateUserCount} "Candidate" users`);
        console.warn(`   Remaining "Candidat" users: ${afterCandidatUserCount}`);
      }
    }

    console.log('\n========================================');
    console.log('✅ Migration Complete');
    console.log('========================================\n');

    return {
      success: true,
      profiles: {
        beforeCandidatCount: beforeCandidatProfileCount,
        beforeCandidateCount: beforeCandidateProfileCount,
        afterCandidatCount: afterCandidatProfileCount,
        afterCandidateCount: afterCandidateProfileCount,
        matchedCount: profileResult.matchedCount,
        modifiedCount: profileResult.modifiedCount
      },
      users: {
        beforeCandidatCount: beforeCandidatUserCount,
        beforeCandidateCount: beforeCandidateUserCount,
        afterCandidatCount: afterCandidatUserCount,
        afterCandidateCount: afterCandidateUserCount,
        matchedCount: userResult.matchedCount,
        modifiedCount: userResult.modifiedCount
      }
    };

  } catch (error) {
    console.error('\n========================================');
    console.error('❌ Migration Failed');
    console.error('========================================');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('========================================\n');
    throw error;
  }
}

/**
 * Rollback migration (for emergency use only)
 * Reverts "Candidate" back to "Candidat"
 */
async function rollbackMigration() {
  try {
    console.log('========================================');
    console.log('⚠️  ROLLBACK: Candidate → Candidat');
    console.log('========================================\n');

    const profileResult = await Profile.updateMany(
      { type: 'Candidate' },
      { $set: { type: 'Candidat' } }
    );

    const userResult = await User.updateMany(
      { role: 'Candidate' },
      { $set: { role: 'Candidat' } }
    );

    console.log(`✅ Rollback complete:`);
    console.log(`   - Profiles: ${profileResult.modifiedCount} reverted`);
    console.log(`   - Users: ${userResult.modifiedCount} reverted\n`);

    return { profileResult, userResult };

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/talentai';

  console.log('\n📦 Connecting to MongoDB...');
  console.log(`   URI: ${dbUri.replace(/\/\/.*:.*@/, '//<credentials>@')}\n`);

  mongoose.connect(dbUri)
    .then(() => {
      console.log('✅ Connected to MongoDB successfully\n');
      return migrateCandidatToCandidate();
    })
    .then((result) => {
      console.log('📊 Migration Summary:');
      console.log(JSON.stringify(result, null, 2));
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Fatal Error:', err.message);
      console.error('   Please check database connection and try again.\n');
      process.exit(1);
    });
}

module.exports = {
  migrateCandidatToCandidate,
  rollbackMigration
};
