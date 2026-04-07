/**
 * Migration script: Rename post_Steps to PostSteps in MongoDB
 * This version uses the app's existing database connection
 *
 * Usage:
 * 1. Start your app normally to establish DB connection
 * 2. In another terminal, run: node Backend/migrations/migratePostStepsViaApp.js
 */

const mongoose = require('mongoose');

async function migratePostSteps() {
  try {
    // Ensure mongoose is connected
    if (mongoose.connection.readyState === 0) {
      console.error('❌ Database not connected. Please start your app first!');
      console.log('📝 Steps:');
      console.log('   1. Start your app (npm start or node Backend/app.js)');
      console.log('   2. In another terminal, run this script again');
      process.exit(1);
    }

    console.log('🔗 Using existing MongoDB connection');

    // Import the Post model after connection
    const Post = require('../models/Post.model');

    // Find all documents that have post_Steps field using raw MongoDB
    console.log('🔍 Searching for posts with old post_Steps field...');

    const postsWithOldField = await Post.collection.find({ post_Steps: { $exists: true } }).toArray();
    console.log(`📊 Found ${postsWithOldField.length} posts with old post_Steps field`);

    if (postsWithOldField.length === 0) {
      console.log('✅ No posts to migrate - all records are up to date!');
      process.exit(0);
    }

    // Migrate each document using updateOne
    let successCount = 0;
    let errorCount = 0;

    for (const post of postsWithOldField) {
      try {
        await Post.collection.updateOne(
          { _id: post._id },
          {
            $set: { PostSteps: post.post_Steps },
            $unset: { post_Steps: 1 }
          }
        );
        successCount++;
        console.log(`✅ Migrated post ${post._id}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating post ${post._id}:`, error.message);
      }
    }

    // Summary
    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total: ${postsWithOldField.length}`);

    // Verify migration
    const remainingOldField = await Post.collection.countDocuments({ post_Steps: { $exists: true } });
    if (remainingOldField === 0) {
      console.log('\n✅ Migration completed successfully! All post_Steps have been renamed to PostSteps.');
    } else {
      console.log(`\n⚠️ Warning: ${remainingOldField} documents still have the old post_Steps field.`);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
migratePostSteps();
