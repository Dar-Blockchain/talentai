const Post = require("../../models/Post.model");
const User = require("../../models/User.model");
const Profile = require("../../models/Profile.model");
const PostInterviewAssessmentModel = require("../../models/PostInterviewAssessment.model");
const nodemailer = require('nodemailer');

// Validate post data
const validatePostData = (postData) => {
  const { jobDetails, skillAnalysis, linkedinPost } = postData;

  // Validate jobDetails
  if (!jobDetails?.title || !jobDetails?.description) {
    throw new Error("Job title and description are required");
  }

  // Validate salary
  if (jobDetails.salary) {
    if (jobDetails.salary.min > jobDetails.salary.max) {
      throw new Error("Minimum salary cannot be greater than maximum salary");
    }
  }

  // Validate required skills
  if (!skillAnalysis?.requiredSkills?.length) {
    throw new Error("At least one required skill must be specified");
  }

  // Validate LinkedIn post
  if (!linkedinPost?.formattedContent?.headline || !linkedinPost?.finalPost) {
    throw new Error("LinkedIn post content is required");
  }

  return true;
};

// Create a new post
module.exports.createPost = async (postData, token) => {
  try {
    // Validate data
    validatePostData(postData);

    const post = new Post(postData);
    const user = await User.findById(postData.user);
    user.post.push(post._id);
    await user.save();
    await post.save();
    console.log(post);
    
    //await schedulePostMatchingAgenda(post._id.toString(), {
    //  requiredSkills: post.skillAnalysis.requiredSkills
    //});
    return post;
  } catch (error) {
    throw new Error(`Error creating post: ${error.message}`);
  }
};

/**
 * Create post with all side effects (matching config, notifications, usage increment)
 * @param {Object} postData - Post data to create
 * @param {String} token - Auth token for technical test
 * @param {Object} userProfile - User profile with plan limits
 * @returns {Promise<Object>}
 */
module.exports.createPostWithSideEffects = async (postData, token, userProfile) => {
  try {
    // ========== 1. MAP workMode FROM employmentType ==========
    if (postData.jobDetails && !postData.jobDetails.workMode) {
      if (postData.companyDetails?.employmentType) {
        postData.jobDetails.workMode = postData.companyDetails.employmentType;
      } else if (postData.employmentType) {
        postData.jobDetails.workMode = postData.employmentType;
      }
    }

    // ========== 2. CREATE POST ==========
    const post = await module.exports.createPost(postData, token);

    // ========== 3. INCREMENT USAGE (for companies only) ==========
    if (userProfile.type === 'Company' && userProfile.activeSubscription) {
      try {
        const subscriptionService = require('../subscription.service');
        await subscriptionService.incrementUsage(
          userProfile.activeSubscription._id,
          'postsUsed',
          1
        );
        console.log(`✅ [createPostWithSideEffects] Posts usage incremented`);
      } catch (usageError) {
        console.error('⚠️ [createPostWithSideEffects] Warning: Could not update posts usage:', usageError.message);
        // Don't fail post creation if usage update fails
      }
    }

    return post;
  } catch (error) {
    console.error('Error in createPostWithSideEffects:', error.message);
    throw error;
  }
};

// Get all posts with advanced filters
module.exports.getAllPosts = async (filters = {}) => {
  try {
    let query = {};

    // Filters for status
    if (filters.status) {
      query.status = filters.status;
    }

    // Filters for employment type
    if (filters.employmentType) {
      query["jobDetails.employmentType"] = filters.employmentType;
    }

    // Filters for experience level
    if (filters.experienceLevel) {
      query["jobDetails.experienceLevel"] = filters.experienceLevel;
    }

    // Filters for skills
    if (filters.skills) {
      query["skillAnalysis.requiredSkills.name"] = { $in: filters.skills };
    }

    // Filters for salary range
    if (filters.salary) {
      if (filters.salary.min) {
        query["jobDetails.salary.min"] = { $gte: filters.salary.min };
      }
      if (filters.salary.max) {
        query["jobDetails.salary.max"] = { $lte: filters.salary.max };
      }
    }

    return await Post.find(query)
      .select('-MatchingConfig')
      .populate("user", "username email companyDetails")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching posts: ${error.message}`);
  }
};

// Get all posts with search, filters and pagination
module.exports.getAllPostsWithSearch = async (filters = {}, page = 1, limit = 6) => {
  try {
    const {
      search,
      location,
      type,
      employmentType,
      status, // Removed default "active" to show all posts
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    // Build query
    const query = {};

    // Always filter by status "open"
    query.status = 'open';

    console.log('🔍 getAllPostsWithSearch called with filters:', filters);

    // Filter by status - DEPRECATED: status is now always "open"
    if (status && status !== 'open') {
      console.warn('⚠️ [getAllPostsWithSearch] Status filter ignored: only "open" posts are returned. Requested: ' + status);
    }

    // Search filter - search in title, description, requirements, and skills
    // Split search terms to match partial words (e.g., "full stack" matches "Full-Stack Developer")
    if (search) {
      const searchTerms = search.trim().split(/\s+/);
      const searchConditions = [];

      // For each search term, search across multiple fields
      searchTerms.forEach(term => {
        searchConditions.push(
          { "jobDetails.title": { $regex: term, $options: "i" } },
          { "jobDetails.description": { $regex: term, $options: "i" } },
          { "jobDetails.requirements": { $regex: term, $options: "i" } },
          { "skillAnalysis.requiredSkills.name": { $regex: term, $options: "i" } }
        );
      });

      // Use $or to match any of the search conditions
      query.$or = searchConditions;

      console.log('  - Search terms:', searchTerms);
      console.log('  - Number of search conditions:', searchConditions.length);
    }

    // Location filter
    if (location && location !== "All Locations") {
      query["jobDetails.location"] = { $regex: location, $options: "i" };
    }

    // Job type filter (Remote, On-Site, Hybrid)
    if (type && type !== "All Types") {
      const typeConditions = [
        { "jobDetails.workType": { $regex: type, $options: "i" } },
        { "jobDetails.type": { $regex: type, $options: "i" } },
      ];

      // If there's already an $or from search, combine using $and
      if (query.$or) {
        query.$and = [
          { $or: query.$or },
          { $or: typeConditions }
        ];
        delete query.$or;
      } else {
        query.$or = typeConditions;
      }
    }

    // Employment type filter (Full-Time, Part-Time, Contract)
    if (employmentType && employmentType !== "All Employment Types") {
      query["jobDetails.employmentType"] = { $regex: employmentType, $options: "i" };
    }

    // Category filter
    if (category && category !== "All Categories") {
      query.category = { $regex: category, $options: "i" };
    }

    // Build sort object
    const sort = {};
    if (sortBy === "salary") {
      sort["jobDetails.salary.min"] = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "title") {
      sort["jobDetails.title"] = sortOrder === "asc" ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    console.log('📊 Final MongoDB query:', JSON.stringify(query, null, 2));
    console.log('📄 Pagination: page', page, 'limit', limit, 'skip', skip);

    // Execute query with pagination
    const posts = await Post.find(query)
      .select('-MatchingConfig')
      .populate({
        path: "user",
        select: "companyDetails email username",
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    console.log('✅ Query results: Found', posts.length, 'posts on this page');
    console.log('📊 Total matching posts in database:', total);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    };
  } catch (error) {
    console.error("Error in getAllPostsWithSearch:", error);
    throw new Error(`Failed to fetch posts: ${error.message}`);
  }
};

// Get a post by its ID
module.exports.getPostById = async (postId) => {
  try {
    const post = await Post.findById(postId).select('-MatchingConfig').populate("PostSteps").populate("user", "_id username email");
    if (!post) {
      throw new Error("Post not found");
    }

    // Ensure interviewLanguages is present for posts created before the field was added
    if (!post.interviewLanguages || post.interviewLanguages.length === 0) {
      post.interviewLanguages = ['en'];
    }

    return post;
  } catch (error) {
    throw new Error(`Error fetching post: ${error.message}`);
  }
};

// Get pipeline job details with all step configurations
module.exports.getPipelineJobDetails = async (postId) => {
  try {
    const post = await Post.findById(postId)
      .select('-MatchingConfig')
      .populate("user", "username email")
      .populate("PostSteps")
      .populate()
      .populate();

    if (!post) {
      throw new Error("Post not found");
    }

    // If not a pipeline job, return standard response
    if (post.creationType !== 'pipeline') {
      return {
        isPipeline: false,
        post: post,
        steps: []
      };
    }

    // For pipeline jobs, extract and organize step configurations
    const steps = post.PostSteps.map(step => ({
      stepId: step._id,
      nodeId: step.id,
      type: step.data.type,
      label: step.data.label,
      position: step.position,
      status: step.status,
      config: {
        nodeNumber: step.data.config.nodeNumber,
        title: step.data.config.title,
        configured: step.data.config.configured,

        // Technical step fields
        categories: step.data.config.categories || [],
        skills: step.data.config.skills || [],
        assessmentLevel: step.data.config.assessmentLevel,
        passThreshold: step.data.config.passThreshold,

        // Soft skills step fields
        softSkills: step.data.config.softSkills || [],

        // HR interview fields
        questions: step.data.config.questions || [],

        // Task fields
        taskType: step.data.config.taskType,
        taskDescription: step.data.config.taskDescription,

        // Email fields
        emailType: step.data.config.emailType,
        emailSubject: step.data.config.emailSubject,
        emailBody: step.data.config.emailBody
      }
    })).sort((a, b) => a.config.nodeNumber - b.config.nodeNumber);

    return {
      isPipeline: true,
      post: {
        _id: post._id,
        jobDetails: post.jobDetails,
        skillAnalysis: post.skillAnalysis,
        linkedinPost: post.linkedinPost,
        companyName: post.companyName,
        status: post.status,
        creationType: post.creationType,
        user: post.user,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt
      },
      steps: steps,
      totalSteps: steps.length,
      interviewSteps: steps.filter(s => ['technical', 'soft', 'interview'].includes(s.type))
    };

  } catch (error) {
    throw new Error(`Error fetching pipeline job details: ${error.message}`);
  }
};

// Get required skills of a post by its ID
module.exports.getRequiredSkillsByPostId = async (postId) => {
  try {
    if (!postId) {
      throw new Error("Post ID is required");
    }
    // Fetch post but only select `requiredSkills`
    const post = await Post.findById(postId).select(
      "skillAnalysis.requiredSkills"
    );
    if (!post) {
      throw new Error("Post not found");
    }
    // Extract required skills with levels
    const requiredSkills =
      post.skillAnalysis?.requiredSkills?.map((skill) => ({
        name: skill.name,
        level: skill.level,
      })) || [];

    return { postId, requiredSkills };
  } catch (error) {
    throw new Error(`Error fetching required skills: ${error.message}`);
  }
};

// Get posts for a user
module.exports.getPostsByUserId = async (userId) => {
  try {
    return await Post.find({ user: userId })
      .select('-MatchingConfig')
      .populate("user", "username email")
      .populate("PostSteps") // Populate the PostSteps reference
      .populate()
      .populate()
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching user posts: ${error.message}`);
  }
};

// Get user's posts with pagination, search and sorting
module.exports.getPostsByUserIdWithPagination = async (userId, page = 1, limit = 6, search = '', sort = 'newest', status = '', showArchived = false, creationType = '') => {
  try {
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Cap limit at 100
    const skip = (pageNum - 1) * limitNum;

    // Build query with search filter and archive filter
    let query = { user: userId };
    if (showArchived) {
      query.archived = true; // Show only archived posts
    } else {
      query.archived = { $ne: true }; // Show posts where archived is false or not set
    }
    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$and = [
        ...(query.$and || []),
        {
          $or: [
            { 'jobDetails.title': searchRegex },
            { 'jobDetails.description': searchRegex },
          ],
        },
      ];
    }

    // Add creationType filter if provided
    const validCreationTypes = ['ai', 'pipeline', 'manual'];
    if (creationType && validCreationTypes.includes(creationType.toLowerCase())) {
      query.creationType = creationType.toLowerCase();
    }

    // Add status filter if provided
    if (status && status.trim() !== '') {
      const s = status.toLowerCase();
      if (s === 'closed') {
        // Treat as closed: explicitly closed OR expiration date passed
        query.$or = [
          { status: 'closed' },
          { status: 'open', expirationDate: { $lt: new Date() } },
        ];
      } else if (s === 'open') {
        // Active open posts: status open AND (no expiration OR not yet expired)
        query.status = 'open';
        query.$or = [
          { expirationDate: { $exists: false } },
          { expirationDate: null },
          { expirationDate: { $gte: new Date() } },
        ];
      } else {
        query.status = s;
      }
    }

    // Build sort object based on sort parameter
    let sortObj = { createdAt: -1 }; // Default: newest
    switch (sort) {
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'title_asc':
        sortObj = { 'jobDetails.title': 1 };
        break;
      case 'title_desc':
        sortObj = { 'jobDetails.title': -1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
    }

    // Get total count with search filter and posts
    const [posts, total] = await Promise.all([
      Post.find(query)
        .select('-MatchingConfig')
        .populate("user", "username email")
        .populate("PostSteps")
        .populate()
        .populate()
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return {
      posts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };
  } catch (error) {
    throw new Error(`Error fetching user posts with pagination: ${error.message}`);
  }
};

// Update a post
module.exports.updatePost = async (postId, userId, updateData) => {
  try {
    // Validate data if a full update is provided
    if (
      updateData.jobDetails ||
      updateData.skillAnalysis ||
      updateData.linkedinPost
    ) {
      validatePostData(updateData);
    }

    const post = await Post.findOne({ _id: postId, user: userId });
    if (!post) {
      throw new Error("Post not found or unauthorized");
    }

    // Prevent modification of createdBy
    if (updateData.createdBy) delete updateData.createdBy;

    // Prevent clearing interviewLanguages — must always have at least one language
    if (updateData.interviewLanguages !== undefined && (!Array.isArray(updateData.interviewLanguages) || updateData.interviewLanguages.length === 0)) {
      delete updateData.interviewLanguages;
    }

    Object.assign(post, updateData);
    return await post.save();
  } catch (error) {
    throw new Error(`Error updating post: ${error.message}`);
  }
};

// Delete a post
module.exports.deletePost = async (postId, userId) => {
  try {
    const post = await Post.findOne({ _id: postId, user: userId });
    if (!post) {
      throw new Error("Post not found or unauthorized");
    }

    // ========== ARCHIVE ASSOCIATED RECORDS IN CASCADE ==========
    
    // 1. Archive PostSteps
    if (post.PostSteps && post.PostSteps.length > 0) {
      const PostSteps = require('../../models/PostSteps.model');
      await PostSteps.updateMany(
        { _id: { $in: post.PostSteps } },
        { archived: true, archivedAt: new Date() }
      );
      console.log(`📦 Archived ${post.PostSteps.length} post step(s)`);
    }

    // 2. Archive agentConfig if exists
    if (post.agentConfig) {
      const AgentConfig = require('../../models/AgentConfig.model');
      await AgentConfig.findByIdAndUpdate(
        post.agentConfig,
        { archived: true, archivedAt: new Date() }
      );
      console.log(`📦 Archived agentConfig: ${post.agentConfig}`);
    }

    // 3. Archive agent if exists
    if (post.agentId) {
      const Agent = require('../../models/Agent.model');
      await Agent.findByIdAndUpdate(
        post.agentId,
        { archived: true, archivedAt: new Date() }
      );
      console.log(`📦 Archived agent: ${post.agentId}`);
    }

    // 4. Archive associated job assessments
    const PostInterviewAssessment = require('../../models/PostInterviewAssessment.model');
    await PostInterviewAssessment.updateMany(
      { post: postId },
      { archived: true, archivedAt: new Date() }
    );
    console.log(`📦 Archived job assessment results for post`);

    // 6. Archive the post itself
    const archivedPost = await Post.findByIdAndUpdate(
      postId,
      { archived: true, archivedAt: new Date() },
      { new: true }
    );

    // 7. Remove the post reference from user (optional - keep reference for archive history)
    // Keep post in user.post array to maintain history
    // await User.updateOne(
    //   { _id: userId },
    //   { $pull: { post: postId } }
    // );

    console.log(`✅ Post ${postId} and all associated records archived successfully`);
    return archivedPost;
  } catch (error) {
    throw new Error(`Error deleting post: ${error.message}`);
  }
};

// Change post status
module.exports.updatePostStatus = async (postId, userId, status, updatedBy = null) => {
  try {
    const post = await Post.findOne({ _id: postId, user: userId });
    if (!post) {
      throw new Error("Post not found or unauthorized");
    }

    post.status = status;
    if (updatedBy) {
      post.updatedBy = updatedBy;
    }
    return await post.save();
  } catch (error) {
    throw new Error(`Error updating post status: ${error.message}`);
  }
};

// Recommend posts for a user based on ALL their skills (not only the first)
module.exports.getPostsByUserTopSkill = async (userId, page = 1, limit = 10) => {
  // 🔄 [getPostsByUserTopSkill] Pagination initiation - page: ${page}, limit: ${limit}
  console.log(`🔄 [getPostsByUserTopSkill] Pagination initiation - page: ${page}, limit: ${limit}`);

  // Validate pagination parameters
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Cap limit at 100
  const skip = (pageNum - 1) * limitNum;

  const user = await User.findById(userId).populate({
    path: "profile",
    // include expectedSalary so we can filter posts by user's salary expectations
    select: "skills expectedSalary",
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.profile || !Array.isArray(user.profile.skills) || user.profile.skills.length === 0) {
    return {
      success: false,
      message: "No skills found. Add at least one skill to your profile to get recommendations.",
    };
  }

  // Extract skill names
  const skillNames = user.profile.skills
    .map((s) => (typeof s === "string" ? s : s?.name))
    .filter(Boolean);

  if (skillNames.length === 0) {
    return {
      success: false,
      message: "No valid skills found in profile. Add at least one skill to receive recommendations.",
    };
  }

  // Already tested post IDs
  const testedPosts = await PostInterviewAssessmentModel.find({
    candidate: user._id,
  }).distinct("jobId");

  // All posts matching skills, excluding already tested ones and with status "open"
  let candidatePosts = await Post.find({
    "skillAnalysis.requiredSkills.name": { $in: skillNames },
    _id: { $nin: testedPosts },
    status: 'open' // Only return posts with status "open"
  })
    .populate('PostSteps')
    .sort({ createdAt: -1 })
    .lean();

  // 🔍 [getPostsByUserTopSkill] Posts found with skills and status "open": ${candidatePosts.length}
  console.log(`🔍 [getPostsByUserTopSkill] Posts found with skills and status "open": ${candidatePosts.length}`);

  // DEBUG: Log first post with PostSteps to verify population
  if (candidatePosts.length > 0) {
    console.log('🔍 DEBUG - First post structure:', {
      _id: candidatePosts[0]._id,
      creationType: candidatePosts[0].creationType,
      hasPostSteps: !!candidatePosts[0].PostSteps,
      postStepsCount: candidatePosts[0].PostSteps?.length || 0,
      postStepsType: Array.isArray(candidatePosts[0].PostSteps) ? 'array' : typeof candidatePosts[0].PostSteps,
      firstStepSample: candidatePosts[0].PostSteps?.[0] ? {
        id: candidatePosts[0].PostSteps[0]._id || candidatePosts[0].PostSteps[0],
        type: candidatePosts[0].PostSteps[0].type,
        hasData: !!candidatePosts[0].PostSteps[0].data,
        dataType: candidatePosts[0].PostSteps[0].data?.type,
        hasConfig: !!candidatePosts[0].PostSteps[0].data?.config,
        configKeys: candidatePosts[0].PostSteps[0].data?.config ? Object.keys(candidatePosts[0].PostSteps[0].data.config) : []
      } : 'no steps'
    });
  }

  // If the user has salary expectations, filter posts to keep
  // only those whose salary range overlaps with the user's expectations.
  try {
    const userExpected = user?.profile?.expectedSalary;
    if (userExpected && (userExpected.min || userExpected.max)) {
      const userMin = typeof userExpected.min === "number" ? userExpected.min : 0;
      const userMax = typeof userExpected.max === "number" ? userExpected.max : Number.MAX_SAFE_INTEGER;

      candidatePosts = candidatePosts.filter((post) => {
        const postMin = post?.jobDetails?.salary?.min ?? 0;
        const postMax = post?.jobDetails?.salary?.max ?? Number.MAX_SAFE_INTEGER;
        // Overlap between [postMin, postMax] and [userMin, userMax]
        return postMin <= userMax && postMax >= userMin;
      });
    }
  } catch (err) {
    console.warn("Error while filtering by expectedSalary:", err.message);
  }

  if (!candidatePosts || candidatePosts.length === 0) {
    return {
      success: false,
      message:
        "No recommendations at the moment. We did not find any posts matching your skills or all have already been tested.",
    };
  }

  // Calculate match score for each post
  const scored = candidatePosts.map((post) => {
    const required = (post.skillAnalysis?.requiredSkills || []).map((rs) => rs.name);
    const matchCount = required.reduce(
      (acc, name) => acc + (skillNames.includes(name) ? 1 : 0),
      0
    );
    return { post, matchCount };
  });

  // Sort by descending match count then by date
  scored.sort(
    (a, b) =>
      b.matchCount - a.matchCount ||
      new Date(b.post.createdAt) - new Date(a.post.createdAt)
  );

  // All posts sorted by relevance
  const allPosts = scored.map((s) => s.post);

  // 📊 [getPostsByUserTopSkill] Total posts available: ${allPosts.length}
  console.log(`📊 [getPostsByUserTopSkill] Total posts available: ${allPosts.length}`);

  // Apply pagination to sorted posts
  const paginatedPosts = allPosts.slice(skip, skip + limitNum);
  const total = allPosts.length;
  const totalPages = Math.ceil(total / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

  // 📄 [getPostsByUserTopSkill] Pagination result - returned: ${paginatedPosts.length}, page: ${pageNum}/${totalPages}
  console.log(`📄 [getPostsByUserTopSkill] Pagination result - returned: ${paginatedPosts.length}, page: ${pageNum}/${totalPages}`);

  return {
    success: true,
    data: paginatedPosts,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage,
      hasPrevPage
    },
    message: `${paginatedPosts.length} recommendation(s) found on page ${pageNum} out of ${totalPages}`
  };
};

/**
 * Get post metrics (count by status) for a user
 */
module.exports.getPostMetrics = async (userId) => {
  try {
    const now = new Date();

    // Get all posts for the user including archived flag
    const allPosts = await Post.find({ user: userId }).select(
      'status expirationDate archived'
    );

    // Initialize counters
    const metrics = {
      total: 0,
      active: 0,
      draft: 0,
      closed: 0,
      archived: 0,
    };

    // Count posts by status — archived posts excluded from total
    allPosts.forEach((post) => {
      if (post.archived) {
        metrics.archived++;
        return;
      }
      metrics.total++;
      const isExpired = post.expirationDate && new Date(post.expirationDate) < now;
      const s = post.status?.toLowerCase();

      if (s === 'draft') {
        metrics.draft++;
      } else if (s === 'closed' || isExpired) {
        metrics.closed++;
      } else if (s === 'open') {
        metrics.active++;
      }
    });

    return metrics;
  } catch (error) {
    throw new Error(`Error getting post metrics: ${error.message}`);
  }
};

/**
 * Get post metrics (count by status) for a user
 */
module.exports.getPostMetrics = async (userId) => {
  try {
    const now = new Date();

    // Get all posts for the user including archived flag
    const allPosts = await Post.find({ user: userId }).select(
      'status expirationDate archived'
    );

    // Initialize counters
    const metrics = {
      total: 0,
      active: 0,
      draft: 0,
      closed: 0,
      archived: 0,
    };

    // Count posts by status — archived posts excluded from total
    allPosts.forEach((post) => {
      if (post.archived) {
        metrics.archived++;
        return;
      }
      metrics.total++;
      const isExpired = post.expirationDate && new Date(post.expirationDate) < now;
      const s = post.status?.toLowerCase();

      if (s === 'draft') {
        metrics.draft++;
      } else if (s === 'closed' || isExpired) {
        metrics.closed++;
      } else if (s === 'open') {
        metrics.active++;
      }
    });

    return metrics;
  } catch (error) {
    throw new Error(`Error getting post metrics: ${error.message}`);
  }
};

