/**
 * Migration: Remove duplicate job applications
 * Keeps the most recent doc per (profile, post) pair and deletes the rest.
 * Usage: node Backend/migrations/removeDuplicateJobApplications.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const JobApplication = require('../models/jobApplication.model');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const db = mongoose.connection.db;

  // Step 1: deduplicate by exact profile+post (same profile applied twice)
  const exactDups = await JobApplication.aggregate([
    { $group: { _id: { profile: '$profile', post: '$post' }, ids: { $push: '$_id' }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);
  console.log(`Found ${exactDups.length} exact duplicate group(s) (same profile+post)`);
  let deleted = 0;
  for (const group of exactDups) {
    const sorted = group.ids.sort((a, b) => (a.toString() > b.toString() ? -1 : 1));
    const [keep, ...remove] = sorted;
    console.log(`  Keeping ${keep}, removing ${remove.join(', ')}`);
    await JobApplication.deleteMany({ _id: { $in: remove } });
    deleted += remove.length;
  }

  // Step 2: deduplicate by (firstName+lastName, post) — same person, different profile docs
  const apps = await db.collection('job_applications').aggregate([
    { $lookup: { from: 'profiles', localField: 'profile', foreignField: '_id', as: 'prof' } },
    { $unwind: '$prof' },
    { $project: { _id: 1, post: 1, createdAt: 1, fullName: { $concat: [{ $toLower: '$prof.firstName' }, ' ', { $toLower: '$prof.lastName' }] } } },
  ]).toArray();

  // Group by fullName+post
  const namePostMap = {};
  for (const app of apps) {
    const key = `${app.fullName}||${app.post?.toString()}`;
    if (!namePostMap[key]) namePostMap[key] = [];
    namePostMap[key].push({ id: app._id, created: app.createdAt });
  }

  for (const [key, entries] of Object.entries(namePostMap)) {
    if (entries.length <= 1) continue;
    entries.sort((a, b) => new Date(b.created) - new Date(a.created));
    const [keep, ...remove] = entries;
    console.log(`  [name+post] key="${key}" keeping ${keep.id}, removing ${remove.map(r => r.id).join(', ')}`);
    await JobApplication.deleteMany({ _id: { $in: remove.map(r => r.id) } });
    deleted += remove.length;
  }

  console.log(`Deleted ${deleted} duplicate document(s) total`);
  await mongoose.disconnect();
}

run().catch((err) => { console.error(err); process.exit(1); });
