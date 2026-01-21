const Post = require("../../models/PostModel");
const User = require("../../models/UserModel");
const JobAssessmentResult = require("../../models/JobAssessmentResultModel");
const AgentService = require("../AgentService");
const aiService = require("../aiService");
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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
    
    // Create and send technical test automatically
    try {
      if (token && post.skillAnalysis?.requiredSkills?.length > 0) {
        const testResult = await module.exports.createAndSendTechnicalTest(
          post._id, 
          token, 
          user.email, 
          user.username
        );
        console.log('Technical test created and sent:', testResult.message);
      }
    } catch (testError) {
      console.error('Error creating technical test:', testError.message);
      // Don't fail the post creation if test creation fails
    }
    
    //await schedulePostMatchingAgenda(post._id.toString(), {
    //  requiredSkills: post.skillAnalysis.requiredSkills
    //});
    return post;
  } catch (error) {
    throw new Error(`Error creating post: ${error.message}`);
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
    const post = await Post.findById(postId).populate("user", "username email").populate("post_Steps").populate('agentConfig').populate('agentId');
    if (!post) {
      throw new Error("Post not found");
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
      .populate("user", "username email")
      .populate("post_Steps")
      .populate('agentConfig')
      .populate('agentId');

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
    const steps = post.post_Steps.map(step => ({
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
      .populate("user", "username email")
      .populate("post_Steps") // Populate the post_Steps reference
      .populate('agentConfig')
      .populate('agentId')
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching user posts: ${error.message}`);
  }
};

// Get user's posts with pagination, search and sorting
module.exports.getPostsByUserIdWithPagination = async (userId, page = 1, limit = 6, search = '', sort = 'newest') => {
  try {
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Cap limit at 100
    const skip = (pageNum - 1) * limitNum;

    // Build query with search filter
    let query = { user: userId };
    if (search && search.trim() !== '') {
      query['jobDetails.title'] = { $regex: search.trim(), $options: 'i' }; // Case-insensitive search
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
        .populate("user", "username email")
        .populate("post_Steps")
        .populate('agentConfig')
        .populate('agentId')
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

    // ========== DELETE ASSOCIATED RECORDS IN CASCADE ==========
    
    // 1. Delete post_Steps
    if (post.post_Steps && post.post_Steps.length > 0) {
      const Post_Steps = require('../../models/postStepsModel');
      await Post_Steps.deleteMany({ _id: { $in: post.post_Steps } });
      console.log(`🗑️ Deleted ${post.post_Steps.length} post step(s)`);
    }

    // 2. Delete agentConfig if exists
    if (post.agentConfig) {
      const AgentConfig = require('../../models/AgentConfigModel');
      await AgentConfig.findByIdAndDelete(post.agentConfig);
      console.log(`🗑️ Deleted agentConfig: ${post.agentConfig}`);
    }

    // 3. Delete agent if exists
    if (post.agentId) {
      const Agent = require('../../models/AgentModel');
      await Agent.findByIdAndDelete(post.agentId);
      console.log(`🗑️ Deleted agent: ${post.agentId}`);
    }

    // 4. Delete MatchingConfig if exists
    if (post.MatchingConfig) {
      const MatchingConfig = require('../../models/MatchingConfigModel');
      await MatchingConfig.findByIdAndDelete(post.MatchingConfig);
      console.log(`🗑️ Deleted MatchingConfig: ${post.MatchingConfig}`);
    }

    // 5. Delete associated job assessments
    const JobAssessmentResult = require('../../models/JobAssessmentResultModel');
    await JobAssessmentResult.deleteMany({ jobId: postId });
    console.log(`🗑️ Deleted job assessment results for post`);

    // 6. Delete the post itself
    const deletedPost = await Post.findByIdAndDelete(postId);

    // 7. Update the user by removing the post reference
    await User.updateOne(
      { _id: userId },
      { $pull: { post: postId } }
    );

    console.log(`✅ Post ${postId} and all associated records deleted successfully`);
    return deletedPost;
  } catch (error) {
    throw new Error(`Error deleting post: ${error.message}`);
  }
};

// Change post status
module.exports.updatePostStatus = async (postId, userId, status) => {
  try {
    const post = await Post.findOne({ _id: postId, user: userId });
    if (!post) {
      throw new Error("Post not found or unauthorized");
    }

    post.status = status;
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

  // Extraire les noms des compétences
  const skillNames = user.profile.skills
    .map((s) => (typeof s === "string" ? s : s?.name))
    .filter(Boolean);

  if (skillNames.length === 0) {
    return {
      success: false,
      message: "No valid skills found in profile. Add at least one skill to receive recommendations.",
    };
  }

  // IDs de postes déjà testés
  const testedPosts = await JobAssessmentResult.find({
    condidateId: user.profile._id,
  }).distinct("jobId");

  // Tous les postes correspondants aux skills, en excluant ceux déjà testés et avec status "open"
  let candidatePosts = await Post.find({
    "skillAnalysis.requiredSkills.name": { $in: skillNames },
    _id: { $nin: testedPosts },
    status: 'open' // Only return posts with status "open"
  })
    .populate('post_Steps')
    .sort({ createdAt: -1 })
    .lean();
  
  // 🔍 [getPostsByUserTopSkill] Posts found with skills and status "open": ${candidatePosts.length}
  console.log(`🔍 [getPostsByUserTopSkill] Posts found with skills and status "open": ${candidatePosts.length}`);

  // DEBUG: Log first post with post_Steps to verify population
  if (candidatePosts.length > 0) {
    console.log('🔍 DEBUG - First post structure:', {
      _id: candidatePosts[0]._id,
      creationType: candidatePosts[0].creationType,
      hasPostSteps: !!candidatePosts[0].post_Steps,
      postStepsCount: candidatePosts[0].post_Steps?.length || 0,
      postStepsType: Array.isArray(candidatePosts[0].post_Steps) ? 'array' : typeof candidatePosts[0].post_Steps,
      firstStepSample: candidatePosts[0].post_Steps?.[0] ? {
        id: candidatePosts[0].post_Steps[0]._id || candidatePosts[0].post_Steps[0],
        type: candidatePosts[0].post_Steps[0].type,
        hasData: !!candidatePosts[0].post_Steps[0].data,
        dataType: candidatePosts[0].post_Steps[0].data?.type,
        hasConfig: !!candidatePosts[0].post_Steps[0].data?.config,
        configKeys: candidatePosts[0].post_Steps[0].data?.config ? Object.keys(candidatePosts[0].post_Steps[0].data.config) : []
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




// Create technical test using AI prompts based on post technologies
// Generate coding project content based on experience level
module.exports.generateCodingProject = async (technologies, jobTitle, experienceLevel, jobDescription = "", companyName = "Our Company", industry = "Technology") => {

  // Create technology-specific projects based on the actual technologies from the post
  const createTechnologySpecificProject = (technologies, level, jobTitle, companyName, industry) => {
    const primaryTech = technologies[0]?.toLowerCase() || 'javascript';
    const secondaryTechs = technologies.slice(1);
    
    // Base project structure that can be customized per technology
    const baseProject = {
      title: `${jobTitle} Technical Challenge`,
      description: `Build a comprehensive application that demonstrates your skills in ${technologies.join(', ')}. This project will evaluate your practical development abilities and how you approach real-world challenges in the ${industry} industry.`,
      timeLimit: level === 'Entry' ? '3-4 hours' : level === 'Intermediate' ? '5-7 hours' : '8-12 hours',
      evaluation: [
        'Code Quality & Architecture (30%): Clean, maintainable code with proper structure',
        'Functionality & Completeness (25%): All requirements implemented and working',
        'Testing & Documentation (20%): Comprehensive tests and clear documentation',
        'Performance & Optimization (15%): Efficient algorithms and optimized code',
        'Best Practices & Standards (10%): Following industry conventions and patterns'
      ]
    };

    // Technology-specific requirements and deliverables
    if (primaryTech.includes('react') || primaryTech.includes('vue') || primaryTech.includes('angular')) {
      return {
        ...baseProject,
        title: `Modern Frontend Application - ${jobTitle}`,
        requirements: [
          'Create a responsive single-page application with modern UI/UX',
          'Implement component-based architecture with reusable components',
          'Add state management for complex data handling',
          'Integrate with external APIs and handle loading/error states',
          'Implement routing and navigation between different views',
          'Add form validation and user input handling',
          'Create responsive design that works on all device sizes',
          'Implement data visualization or interactive features',
          'Add unit tests for components and utilities',
          'Optimize performance with lazy loading and code splitting'
        ],
        deliverables: [
          'Complete frontend application with modern framework',
          'Responsive UI with excellent user experience',
          'Component library with reusable elements',
          'Comprehensive testing suite with good coverage',
          'Performance optimization and accessibility compliance',
          'GitHub repository with detailed README',
          'Live demo deployed on cloud platform',
          'Code documentation and setup instructions'
        ]
      };
    } else if (primaryTech.includes('node') || primaryTech.includes('express') || primaryTech.includes('javascript')) {
      return {
        ...baseProject,
        title: `Backend API Development - ${jobTitle}`,
        requirements: [
          'Design and implement RESTful API with proper endpoints',
          'Set up database integration (MongoDB, PostgreSQL, or MySQL)',
          'Implement user authentication and authorization (JWT)',
          'Add input validation and error handling middleware',
          'Create CRUD operations for main entities',
          'Implement data filtering, sorting, and pagination',
          'Add API documentation with Swagger/OpenAPI',
          'Write comprehensive unit and integration tests',
          'Implement logging and monitoring capabilities',
          'Add security measures and rate limiting'
        ],
        deliverables: [
          'Complete working API with all endpoints',
          'Database schema and migration scripts',
          'Comprehensive API documentation',
          'Postman collection or API testing suite',
          'Unit and integration tests with good coverage',
          'Docker containerization and deployment scripts',
          'Security audit and performance testing results',
          'GitHub repository with detailed setup guide'
        ]
      };
    } else if (primaryTech.includes('python') || primaryTech.includes('django') || primaryTech.includes('flask')) {
      return {
        ...baseProject,
        title: `Python Web Application - ${jobTitle}`,
        requirements: [
          'Build a web application using Python framework (Django/Flask)',
          'Implement database models and migrations',
          'Create API endpoints with proper serialization',
          'Add user authentication and permissions system',
          'Implement data validation and form handling',
          'Add background tasks and job queues',
          'Create admin interface for data management',
          'Write comprehensive tests using pytest',
          'Add API documentation and versioning',
          'Implement caching and performance optimization'
        ],
        deliverables: [
          'Complete Python web application',
          'Database models and migration scripts',
          'API documentation with examples',
          'Comprehensive test suite with pytest',
          'Docker configuration and deployment setup',
          'Performance testing and optimization report',
          'GitHub repository with detailed README',
          'Live demo with admin access'
        ]
      };
    } else if (primaryTech.includes('java') || primaryTech.includes('spring')) {
      return {
        ...baseProject,
        title: `Java Enterprise Application - ${jobTitle}`,
        requirements: [
          'Build enterprise application using Spring Boot',
          'Implement microservices architecture with proper communication',
          'Add database integration with JPA/Hibernate',
          'Implement security with Spring Security',
          'Create RESTful APIs with proper error handling',
          'Add configuration management and profiles',
          'Implement logging and monitoring with Actuator',
          'Write unit tests with JUnit and Mockito',
          'Add API documentation with Swagger',
          'Implement caching and performance optimization'
        ],
        deliverables: [
          'Complete Spring Boot application',
          'Microservices architecture with proper separation',
          'Database integration and migration scripts',
          'Comprehensive test suite with good coverage',
          'API documentation and Postman collection',
          'Docker containerization and deployment',
          'Performance testing and monitoring setup',
          'GitHub repository with detailed documentation'
        ]
      };
    } else {
      // Generic full-stack project for other technologies
      return {
        ...baseProject,
        title: `Full-Stack Application - ${jobTitle}`,
        requirements: [
          'Build a complete full-stack application',
          'Implement both frontend and backend components',
          'Add database integration and data persistence',
          'Implement user authentication and authorization',
          'Create responsive user interface',
          'Add API endpoints for data communication',
          'Implement error handling and validation',
          'Write tests for both frontend and backend',
          'Add deployment configuration',
          'Implement security best practices'
        ],
        deliverables: [
          'Complete full-stack application',
          'Frontend with modern UI/UX',
          'Backend API with proper endpoints',
          'Database schema and data models',
          'Comprehensive testing suite',
          'Deployment configuration and scripts',
          'Documentation and setup instructions',
          'Live demo with all features working'
        ]
      };
    }
  };

  // Select project based on experience level and actual technologies
  const level = experienceLevel || 'Intermediate';
  const project = createTechnologySpecificProject(technologies, level, jobTitle, companyName, industry);

  // Create contextual description based on job and company
  const contextualDescription = jobDescription 
    ? `As part of the ${jobTitle} role at ${companyName}, you'll be working on a project that aligns with our ${industry} industry focus. ${project.description} This project will help us evaluate your practical skills and how you approach real-world development challenges.`
    : project.description;

  // Add additional context based on industry
  const industryContext = {
    'Technology': 'This project will test your ability to work with modern web technologies and frameworks.',
    'Finance': 'This project will evaluate your skills in building secure, scalable financial applications.',
    'Healthcare': 'This project will assess your ability to handle sensitive data and compliance requirements.',
    'E-commerce': 'This project will test your skills in building high-performance, user-friendly shopping experiences.',
    'Education': 'This project will evaluate your ability to create engaging, accessible learning platforms.',
    'Manufacturing': 'This project will assess your skills in building industrial-grade, reliable applications.',
    'Media': 'This project will test your ability to handle large-scale content and real-time interactions.',
    'Government': 'This project will evaluate your skills in building secure, compliant government applications.'
  };

  const finalDescription = industryContext[industry] 
    ? `${contextualDescription} ${industryContext[industry]}`
    : contextualDescription;

  return {
    title: project.title,
    description: finalDescription,
    requirements: project.requirements,
    deliverables: project.deliverables,
    timeLimit: project.timeLimit,
    evaluation: project.evaluation,
    experienceLevel: level,
    technologies: technologies,
    jobTitle: jobTitle,
    companyName: companyName,
    industry: industry,
    difficulty: level,
    estimatedComplexity: project.requirements.length > 8 ? 'High' : project.requirements.length > 5 ? 'Medium' : 'Low'
  };
};

module.exports.createTechnicalTest = async (postId, token) => {
  try {
    const post = await Post.findById(postId).populate("user", "username email");
    if (!post) {
      throw new Error("Post not found");
    }

    // Extract technologies and experience level from the post
    const technologies = post.skillAnalysis?.requiredSkills?.map(skill => skill.name) || ['JavaScript', 'React', 'Node.js'];
    const jobTitle = post.jobDetails?.title || "Software Developer";
    const experienceLevel = post.jobDetails?.experienceLevel || "Intermediate";
    const jobDescription = post.jobDetails?.description || "";
    const companyName = post.companyName || post.jobDetails?.companyName || "Our Company";
    const industry = post.industry || post.jobDetails?.industry || "Technology";

    // Generate coding project content based on experience level and post details
    const projectData = await module.exports.generateCodingProject(technologies, jobTitle, experienceLevel, jobDescription, companyName, industry);
    
    return {
      postId,
      testContent: projectData,
      technologies,
      jobTitle,
      experienceLevel,
      companyName,
      industry,
      createdAt: new Date()
    };
  } catch (error) {
    throw new Error(`Error creating technical test: ${error.message}`);
  }
};

// Generate PDF from technical test content
module.exports.generateTestPDF = async (testData) => {
  try {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30
      }
    });
    
    const fileName = `coding-project-${testData.postId}-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../uploads', fileName);
    
    // Ensure uploads directory exists
    const uploadsDir = path.dirname(filePath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Create write stream
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Simple helper functions
    const addHeader = (text, fontSize = 16) => {
      doc.fillColor('#1A365D')
         .fontSize(fontSize)
         .font('Helvetica-Bold')
         .text(text);
      doc.fillColor('black')
         .font('Helvetica');
      doc.moveDown(0.8);
    };

    const addList = (items, numbered = false) => {
      doc.fontSize(11);
      items.forEach((item, index) => {
        const prefix = numbered ? `${index + 1}. ` : '• ';
        doc.text(`${prefix}${item}`, { indent: 20 });
        doc.moveDown(0.3);
      });
    };

    // Simple header
    doc.fillColor('#1A365D')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('TECHNICAL ASSESSMENT', { align: 'center' });
    
    doc.fontSize(14)
       .font('Helvetica')
       .text('Coding Project Assignment', { align: 'center' });
    
    doc.moveDown(2);

    // Project information table
    addHeader('PROJECT DETAILS');
    
    const projectInfo = [
      `Project: ${testData.testContent.title}`,
      `Position: ${testData.jobTitle}`,
      `Company: ${testData.companyName || 'Our Company'}`,
      `Level: ${testData.experienceLevel}`,
      `Duration: ${testData.testContent.timeLimit}`,
      `Technologies: ${testData.technologies.join(', ')}`,
      `Industry: ${testData.industry || 'Technology'}`
    ];
    
    projectInfo.forEach(info => {
      doc.fontSize(12).text(info);
      doc.moveDown(0.3);
    });
    
    doc.moveDown(1.5);

    // Project description
    addHeader('WHAT TO BUILD');
    doc.fontSize(11).text(testData.testContent.description);
    doc.moveDown(1.5);

    // Requirements
    addHeader('REQUIREMENTS');
    addList(testData.testContent.requirements, true);
    doc.moveDown(1.5);

    // Deliverables
    addHeader('WHAT TO SUBMIT');
    addList(testData.testContent.deliverables, true);
    doc.moveDown(1.5);

    // Evaluation
    addHeader('HOW YOU WILL BE EVALUATED');
    addList(testData.testContent.evaluation, true);
    doc.moveDown(1.5);

    // Submission steps
    addHeader('SUBMISSION STEPS');
    const submissionSteps = [
      'Create a GitHub repository with your solution',
      'Write a README.md with setup instructions',
      'Add unit tests with good coverage',
      'Deploy your app to a cloud platform',
      'Email us your GitHub link and demo URL',
      'Include screenshots or demo video'
    ];
    addList(submissionSteps, true);
    doc.moveDown(1.5);

    // Project structure
    addHeader('RECOMMENDED FOLDER STRUCTURE');
    doc.fontSize(10).font('Courier');
    const structure = [
      'project-name/',
      '├── README.md',
      '├── package.json',
      '├── src/',
      '│   ├── components/',
      '│   ├── services/',
      '│   └── index.js',
      '├── tests/',
      '└── docs/'
    ];
    structure.forEach(line => {
      doc.text(line, { indent: 20 });
      doc.moveDown(0.2);
    });
    doc.font('Helvetica');
    doc.moveDown(1.5);

    // Tips
    addHeader('TIPS');
    const tips = [
      'Read all requirements before starting',
      'Plan your approach first',
      'Write clean, commented code',
      'Test your solution thoroughly',
      'Document your decisions',
      'Make sure it runs without errors'
    ];
    addList(tips);
    doc.moveDown(1.5);

    // Deadline
    addHeader('DEADLINE');
    doc.fontSize(12).text(`Submit within ${testData.testContent.timeLimit} of receiving this assignment.`);
    doc.moveDown(0.5);
    doc.text('Questions? Email: technical-support@talentai.bid');
    doc.moveDown(1);

    // Footer
    doc.fontSize(12)
       .fillColor('#2B6CB0')
       .text('Good luck! 🚀', { align: 'center' });
    
    doc.fontSize(10)
       .fillColor('#718096')
       .text(`Generated on ${new Date().toLocaleDateString()} by TalenIA`, { align: 'center' });

    // Finalize the PDF
    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          size: fs.statSync(filePath).size
        });
      });
      stream.on('error', reject);
    });
  } catch (error) {
    throw new Error(`Error generating PDF: ${error.message}`);
  }
};

// Send email with technical test PDF
module.exports.sendTechnicalTestEmail = async (testData, pdfInfo, candidateEmail, candidateName = 'Candidate') => {
  try {
    // Use the same email configuration as sendOTP
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465, // SSL/TLS port for outgoing mail
      secure: true, // Use SSL
      auth: {
        user: "contact@talentai.bid",
        pass: "87h0u74H",
      },
    });

    // Enhanced email content with modern styling
    const mailOptions = {
      from: '"TalenIA Technical Assessment" <contact@talentai.bid>',
      to: candidateEmail,
      subject: `🚀 Technical Assessment - ${testData.jobTitle} Position | ${testData.companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Technical Assessment Assignment</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
          <div style="max-width: 700px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1A365D 0%, #2B6CB0 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">TECHNICAL ASSESSMENT</h1>
              <p style="color: #E2E8F0; margin: 10px 0 0 0; font-size: 16px;">Coding Project Challenge</p>
              <p style="color: #CBD5E0; margin: 5px 0 0 0; font-size: 14px;">TalenIA Professional Evaluation Platform</p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1A365D; margin: 0 0 20px 0; font-size: 24px;">Hello ${candidateName}! 👋</h2>
              
              <p style="color: #4A5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for your interest in the <strong style="color: #2B6CB0;">${testData.jobTitle}</strong> position at <strong style="color: #2B6CB0;">${testData.companyName}</strong>.
              </p>

              <p style="color: #4A5568; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We're excited to see your technical skills in action! Please find attached your <strong>coding project assignment</strong> that will help us evaluate your practical development abilities.
              </p>

              <!-- Project Overview Card -->
              <div style="background: #F7FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <h3 style="color: #1A365D; margin: 0 0 15px 0; font-size: 20px;">📋 Project Overview</h3>
                <p style="color: #4A5568; margin: 0 0 15px 0; font-size: 16px;"><strong>Project:</strong> ${testData.testContent.title}</p>
                <p style="color: #4A5568; margin: 0 0 15px 0; font-size: 16px;"><strong>Experience Level:</strong> ${testData.experienceLevel}</p>
                <p style="color: #4A5568; margin: 0 0 15px 0; font-size: 16px;"><strong>Time Limit:</strong> ${testData.testContent.timeLimit}</p>
                <p style="color: #4A5568; margin: 0 0 15px 0; font-size: 16px;"><strong>Technologies:</strong> ${testData.technologies.join(', ')}</p>
                <p style="color: #4A5568; margin: 0; font-size: 16px;"><strong>Complexity:</strong> ${testData.estimatedComplexity || 'Medium'}</p>
              </div>

              <!-- What You'll Build -->
              <h3 style="color: #1A365D; margin: 30px 0 15px 0; font-size: 20px;">🚀 What You'll Build</h3>
              <div style="background: #F0FFF4; border-left: 4px solid #38A169; padding: 20px; margin: 20px 0;">
                <ul style="margin: 0; padding-left: 20px; color: #4A5568;">
                  <li style="margin: 8px 0;"><strong>Complete Application</strong> - Build a working project from scratch</li>
                  <li style="margin: 8px 0;"><strong>Real-world Features</strong> - Implement practical, industry-relevant functionality</li>
                  <li style="margin: 8px 0;"><strong>Modern Development</strong> - Use current best practices and technologies</li>
                  <li style="margin: 8px 0;"><strong>Testing & Documentation</strong> - Write comprehensive tests and clear documentation</li>
                  <li style="margin: 8px 0;"><strong>Deployment Ready</strong> - Deploy your application to a cloud platform</li>
          </ul>
              </div>

              <!-- Submission Requirements -->
              <h3 style="color: #1A365D; margin: 30px 0 15px 0; font-size: 20px;">📤 Submission Requirements</h3>
              <div style="background: #FEF5E7; border-left: 4px solid #F6AD55; padding: 20px; margin: 20px 0;">
                <ol style="margin: 0; padding-left: 20px; color: #4A5568;">
                  <li style="margin: 8px 0;">Create a GitHub repository with your complete solution</li>
                  <li style="margin: 8px 0;">Include comprehensive README with setup and usage instructions</li>
                  <li style="margin: 8px 0;">Write unit tests with at least 80% code coverage</li>
                  <li style="margin: 8px 0;">Deploy your application to a cloud platform (Heroku, Vercel, AWS, etc.)</li>
                  <li style="margin: 8px 0;">Submit your GitHub repository link and live demo URL via email</li>
                  <li style="margin: 8px 0;">Include screenshots or a demo video showcasing key features</li>
                </ol>
              </div>

              <!-- Evaluation Criteria -->
              <h3 style="color: #1A365D; margin: 30px 0 15px 0; font-size: 20px;">🏆 Evaluation Criteria</h3>
              <div style="background: #F0F4FF; border-left: 4px solid #2B6CB0; padding: 20px; margin: 20px 0;">
                <ul style="margin: 0; padding-left: 20px; color: #4A5568;">
                  <li style="margin: 8px 0;"><strong>Code Quality & Architecture (30%)</strong> - Clean, maintainable code with proper structure</li>
                  <li style="margin: 8px 0;"><strong>Functionality & Completeness (25%)</strong> - All requirements implemented and working</li>
                  <li style="margin: 8px 0;"><strong>Testing & Documentation (20%)</strong> - Comprehensive tests and clear documentation</li>
                  <li style="margin: 8px 0;"><strong>Performance & Optimization (15%)</strong> - Efficient algorithms and optimized code</li>
                  <li style="margin: 8px 0;"><strong>Best Practices & Standards (10%)</strong> - Following industry conventions and patterns</li>
          </ul>
              </div>

              <!-- Tips for Success -->
              <h3 style="color: #1A365D; margin: 30px 0 15px 0; font-size: 20px;">💡 Tips for Success</h3>
              <div style="background: #F0F9FF; border-left: 4px solid #63B3ED; padding: 20px; margin: 20px 0;">
                <ul style="margin: 0; padding-left: 20px; color: #4A5568;">
                  <li style="margin: 8px 0;">Start with a clear project plan and architecture diagram</li>
                  <li style="margin: 8px 0;">Implement core features first, then add advanced functionality</li>
                  <li style="margin: 8px 0;">Write tests as you develop, not as an afterthought</li>
                  <li style="margin: 8px 0;">Use version control effectively with meaningful commit messages</li>
                  <li style="margin: 8px 0;">Document your API endpoints and key functions thoroughly</li>
          </ul>
        </div>

              <!-- Deadline -->
              <div style="background: #FEF5E7; border: 1px solid #F6AD55; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
                <h3 style="color: #C05621; margin: 0 0 10px 0; font-size: 18px;">⏰ Submission Deadline</h3>
                <p style="color: #4A5568; margin: 0; font-size: 16px; font-weight: 600;">
                  Submit your completed project within <strong>${testData.testContent.timeLimit}</strong> of receiving this assessment.
                </p>
                <p style="color: #718096; margin: 10px 0 0 0; font-size: 14px;">
                  Late submissions may be considered on a case-by-case basis.
                </p>
              </div>

              <!-- Contact Information -->
              <div style="background: #F7FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <h3 style="color: #1A365D; margin: 0 0 15px 0; font-size: 18px;">📞 Need Help?</h3>
                <p style="color: #4A5568; margin: 0 0 10px 0; font-size: 16px;">
                  For technical questions or clarifications about the requirements, please contact our development team.
                </p>
                <p style="color: #2B6CB0; margin: 0; font-size: 16px; font-weight: 600;">
                  Email: technical-support@talentai.bid
                </p>
                <p style="color: #718096; margin: 5px 0 0 0; font-size: 14px;">
                  Response time: Within 24 hours during business days
                </p>
              </div>

              <!-- Call to Action -->
              <div style="text-align: center; margin: 40px 0;">
                <p style="color: #4A5568; font-size: 18px; margin: 0 0 20px 0;">
                  <strong>Good luck with your coding project! We're excited to see what you build! 🚀</strong>
                </p>
                <p style="color: #718096; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  <strong>The TalenIA Hiring Team</strong>
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #F7FAFC; padding: 30px; text-align: center; border-top: 1px solid #E2E8F0;">
              <p style="color: #718096; margin: 0 0 10px 0; font-size: 12px;">
                Generated on ${new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} by TalenIA Technical Assessment Platform
              </p>
              <p style="color: #718096; margin: 0; font-size: 12px;">
                For questions, contact: support@talentai.bid | Visit: www.talentai.bid
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: pdfInfo.fileName,
          path: pdfInfo.filePath,
          contentType: 'application/pdf'
        }
      ]
    };

    // Test the connection first
    await transporter.verify();
    console.log('✅ Email server connection verified');

    const result = await transporter.sendMail(mailOptions);
    console.log('Technical test email sent:', result.messageId);
    
    return result;
  } catch (error) {
    throw new Error(`Error sending email: ${error.message}`);
  }
};

// Main function to create and send technical test
module.exports.createAndSendTechnicalTest = async (postId, token, candidateEmail, candidateName = 'Candidate') => {
  let testData = null;
  let pdfInfo = null;
  
  try {
    // Step 1: Create technical test content
    testData = await module.exports.createTechnicalTest(postId, token);
    console.log('✅ Technical test content created');
    
    // Step 2: Generate PDF
    pdfInfo = await module.exports.generateTestPDF(testData);
    console.log('✅ PDF generated:', pdfInfo.fileName);
    
    // Step 3: Try to send email with PDF
    let emailResult = null;
    try {
      emailResult = await module.exports.sendTechnicalTestEmail(testData, pdfInfo, candidateEmail, candidateName);
      console.log('✅ Email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
      
      // Return success but with email failure info
      return {
        success: true,
        testData,
        pdfInfo,
        emailResult: null,
        emailError: emailError.message,
        message: 'Technical test created successfully, but email sending failed. PDF is available for manual sending.'
      };
    }
    
    // Step 4: Clean up PDF file after sending (optional)
    setTimeout(() => {
      if (fs.existsSync(pdfInfo.filePath)) {
        fs.unlinkSync(pdfInfo.filePath);
        console.log('🗑️ PDF file cleaned up');
      }
    }, 60000); // Delete after 1 minute
    
    return {
      success: true,
      testData,
      pdfInfo,
      emailResult,
      message: 'Technical test created and sent successfully'
    };
  } catch (error) {
    console.error('❌ Error in createAndSendTechnicalTest:', error);
    
    // Clean up PDF file if it was created
    if (pdfInfo && fs.existsSync(pdfInfo.filePath)) {
      try {
        fs.unlinkSync(pdfInfo.filePath);
        console.log('🗑️ PDF file cleaned up after error');
      } catch (cleanupError) {
        console.error('Error cleaning up PDF file:', cleanupError.message);
      }
    }
    
    throw new Error(`Error in createAndSendTechnicalTest: ${error.message}`);
  }
};