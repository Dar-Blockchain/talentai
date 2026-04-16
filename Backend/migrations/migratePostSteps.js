/**
 * Migration script: Rename post_Steps to PostSteps in MongoDB
 *
 * Usage: node Backend/migrations/migratePostSteps.js
 * Or with custom URL: DB_URL=mongodb+srv://user:pass@cluster.mongodb.net/dbname node Backend/migrations/migratePostSteps.js
 *
 * This script will:
 * 1. Find all Post documents with post_Steps field
 * 2. Copy post_Steps data to PostSteps
 * 3. Remove the old post_Steps field
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import the Post model
const Post = require('../models/Post.model');

async function migratePostSteps() {
  try {
    // Connect to MongoDB with options for compatibility
    const mongoURL = process.env.DB_URL || 'mongodb://localhost:27017/talentai';
    console.log('🔗 Connecting to MongoDB:', mongoURL);

    // Connection options to support older MongoDB versions
    const connectOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURL, connectOptions);
    console.log('✅ Connected to MongoDB');

    // Find all documents that have post_Steps field
    const postsWithOldField = await Post.find({ post_Steps: { $exists: true } });
    console.log(`📊 Found ${postsWithOldField.length} posts with old post_Steps field`);

    if (postsWithOldField.length === 0) {
      console.log('✅ No posts to migrate - all records are up to date!');
      await mongoose.connection.close();
      return;
    }

    // Migrate each document
    let successCount = 0;
    let errorCount = 0;

    for (const post of postsWithOldField) {
      try {
        // Update: copy post_Steps to PostSteps and remove post_Steps
        await Post.updateOne(
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
    const remainingOldField = await Post.countDocuments({ post_Steps: { $exists: true } });
    if (remainingOldField === 0) {
      console.log('\n✅ Migration completed successfully! All post_Steps have been renamed to PostSteps.');
    } else {
      console.log(`\n⚠️ Warning: ${remainingOldField} documents still have the old post_Steps field.`);
    }

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
migratePostSteps();
