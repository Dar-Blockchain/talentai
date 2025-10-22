/**
 * Debug script to check posts in database
 * Run: node debug-posts.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './Backend/.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const debugPosts = async () => {
  await connectDB();

  const Post = require('./Backend/models/PostModel');

  console.log('\n📊 Checking posts in database...\n');

  // Count all posts
  const totalPosts = await Post.countDocuments();
  console.log(`Total posts in database: ${totalPosts}`);

  if (totalPosts === 0) {
    console.log('\n❌ No posts found in database!');
    console.log('Create some posts first using your application.');
    process.exit(0);
  }

  // Count by status
  const statuses = await Post.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  console.log('\n📈 Posts by status:');
  statuses.forEach(s => {
    console.log(`  - ${s._id || 'undefined'}: ${s.count} posts`);
  });

  // Get sample posts
  console.log('\n📝 Sample posts (first 3):');
  const samplePosts = await Post.find()
    .limit(3)
    .populate('user', 'companyDetails email username');

  samplePosts.forEach((post, index) => {
    console.log(`\n${index + 1}. Post ID: ${post._id}`);
    console.log(`   Title: ${post.jobDetails?.title || 'No title'}`);
    console.log(`   Status: ${post.status || 'undefined'}`);
    console.log(`   Company: ${post.user?.companyDetails?.companyName || post.user?.username || 'N/A'}`);
    console.log(`   Location: ${post.jobDetails?.location || 'N/A'}`);
    console.log(`   Created: ${post.createdAt}`);
  });

  // Check what statuses exist
  const uniqueStatuses = await Post.distinct('status');
  console.log('\n🔍 All unique status values in database:');
  console.log(uniqueStatuses);

  // Test the search query
  console.log('\n🧪 Testing search query with status="active"...');
  const activeCount = await Post.countDocuments({ status: 'active' });
  console.log(`Posts with status="active": ${activeCount}`);

  if (activeCount === 0) {
    console.log('\n⚠️  FOUND THE ISSUE!');
    console.log('Your posts do not have status="active".');
    console.log('Possible statuses:', uniqueStatuses.join(', '));
    
    console.log('\n💡 SOLUTIONS:');
    console.log('1. Update existing posts to have status="active"');
    console.log('2. Or remove the status filter from the frontend');
    console.log('3. Or use the actual status value in the frontend filter');
  } else {
    console.log('\n✅ Found active posts! The API should work.');
    
    // Test with actual query
    console.log('\n🧪 Testing actual API query...');
    const testResults = await Post.find({ status: 'active' })
      .populate({
        path: 'user',
        select: 'companyDetails email username',
      })
      .limit(3)
      .lean();
    
    console.log(`\nAPI would return ${testResults.length} posts`);
    testResults.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.jobDetails?.title || 'No title'}`);
      console.log(`   Company: ${post.user?.companyDetails?.companyName || 'N/A'}`);
      console.log(`   Location: ${post.jobDetails?.location || 'N/A'}`);
    });
  }

  mongoose.connection.close();
  process.exit(0);
};

debugPosts().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

