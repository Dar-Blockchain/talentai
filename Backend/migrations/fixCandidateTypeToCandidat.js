/**
 * Database Migration Script
 * Migrates Profile.type from "Candidate" to "Candidat"
 *
 * Purpose: Fix inconsistency between UserModel.role and ProfileModel.type enums
 *
 * IMPORTANT: Run this migration BEFORE deploying code changes to avoid validation errors
 *
 * Usage:
 *   node Backend/migrations/fixCandidateTypeToCandidat.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Profile = require('../models/ProfileModel');

/**
 * Migrate Profile documents from type "Candidate" to "Candidat"
 */
async function migrateCandidateToCandidat() {
  try {
    console.log('========================================');
    console.log('🔄 Starting Migration: Candidate → Candidat');
    console.log('========================================\n');

    // Check current state before migration
    console.log('📊 Checking current database state...');
    const beforeCandidateCount = await Profile.countDocuments({ type: 'Candidate' });
    const beforeCandidatCount = await Profile.countDocuments({ type: 'Candidat' });
    const totalProfiles = await Profile.countDocuments();

    console.log(`   Total Profiles: ${totalProfiles}`);
    console.log(`   ❌ type="Candidate" (to migrate): ${beforeCandidateCount}`);
    console.log(`   ✅ type="Candidat" (already correct): ${beforeCandidatCount}\n`);

    if (beforeCandidateCount === 0) {
      console.log('✅ No profiles to migrate. All profiles already use "Candidat".');
      console.log('========================================\n');
      return {
        success: true,
        alreadyMigrated: true,
        message: 'No migration needed'
      };
    }

    // Confirm migration
    console.log(`⚠️  About to migrate ${beforeCandidateCount} profile(s) from "Candidate" to "Candidat"`);
    console.log('   This will update the type field in the Profile collection.\n');

    // Perform migration
    console.log('🚀 Executing migration...');
    const result = await Profile.updateMany(
      { type: 'Candidate' },
      { $set: { type: 'Candidat' } }
    );

    console.log(`✅ Migration executed successfully!`);
    console.log(`   - Matched: ${result.matchedCount} document(s)`);
    console.log(`   - Modified: ${result.modifiedCount} document(s)`);
    console.log(`   - Acknowledged: ${result.acknowledged}\n`);

    // Verify migration result
    console.log('🔍 Verifying migration result...');
    const afterCandidateCount = await Profile.countDocuments({ type: 'Candidate' });
    const afterCandidatCount = await Profile.countDocuments({ type: 'Candidat' });

    console.log(`   ❌ type="Candidate" (remaining): ${afterCandidateCount}`);
    console.log(`   ✅ type="Candidat" (after migration): ${afterCandidatCount}\n`);

    if (afterCandidateCount === 0 && afterCandidatCount === beforeCandidateCount + beforeCandidatCount) {
      console.log('✅ Migration verified successfully!');
      console.log('   All "Candidate" profiles have been migrated to "Candidat".');
    } else {
      console.warn('⚠️  Migration verification warning:');
      console.warn(`   Expected ${beforeCandidateCount + beforeCandidatCount} "Candidat" profiles`);
      console.warn(`   Found ${afterCandidatCount} "Candidat" profiles`);
      console.warn(`   Remaining "Candidate" profiles: ${afterCandidateCount}`);
    }

    console.log('\n========================================');
    console.log('✅ Migration Complete');
    console.log('========================================\n');

    return {
      success: true,
      beforeCandidateCount,
      beforeCandidatCount,
      afterCandidateCount,
      afterCandidatCount,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount
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
 * Reverts "Candidat" back to "Candidate"
 */
async function rollbackMigration() {
  try {
    console.log('========================================');
    console.log('⚠️  ROLLBACK: Candidat → Candidate');
    console.log('========================================\n');

    const result = await Profile.updateMany(
      { type: 'Candidat' },
      { $set: { type: 'Candidate' } }
    );

    console.log(`✅ Rollback complete: ${result.modifiedCount} profile(s) reverted\n`);
    return result;

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

  mongoose.connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => {
      console.log('✅ Connected to MongoDB successfully\n');
      return migrateCandidateToCandidat();
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
  migrateCandidateToCandidat,
  rollbackMigration
};
