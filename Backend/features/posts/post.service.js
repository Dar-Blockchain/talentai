const Post         = require("./post.model");
const User         = require("../users/user.model");
const Profile      = require("../users/profile.model");
const ProfileSkill = require("../skills/profile-skill.model");
const PostInterviewAssessmentModel = require("../interviews/post-interview/post-interview.model");
const JobApplication = require("../job-applications/job-application.model");
const subscriptionService = require("../billing/subscriptions/subscription.service");
const bedrock = require("../../utils/bedrock-client");
const { generatePrompt, normalizeSkillAnalysis } = require("./prompts/generate-job-post.prompts");
const validatePostData = (postData) => {
  const { jobDetails, skillAnalysis } = postData;

  if (!jobDetails?.title || !jobDetails?.description) {
    throw new Error("Job title and description are required");
  }

  if (jobDetails.salary) {
    if (jobDetails.salary.min > jobDetails.salary.max) {
      throw new Error("Minimum salary cannot be greater than maximum salary");
    }
  }

  if (!skillAnalysis?.requiredSkills?.length) {
    throw new Error("At least one required skill must be specified");
  }

  return true;
};

module.exports.createPost = async (postData, token) => {
  try {
    validatePostData(postData);

    const post = new Post(postData);
    await post.save();
    return post;
  } catch (error) {
    throw new Error(`Error creating post: ${error.message}`);
  }
};

module.exports.createPostWithSideEffects = async (postData, token, userProfile) => {
  try {
    if (postData.jobDetails && !postData.jobDetails.workMode) {
      if (postData.companyDetails?.employmentType) {
        postData.jobDetails.workMode = postData.companyDetails.employmentType;
      } else if (postData.employmentType) {
        postData.jobDetails.workMode = postData.employmentType;
      }
    }

    const post = await module.exports.createPost(postData, token);

    if (userProfile.type === 'Company' && userProfile.activeSubscription) {
      try {
        await subscriptionService.incrementUsage(
          userProfile.activeSubscription._id,
          'postsUsed',
          1
        );
      } catch (usageError) {
        console.error('âš ï¸ [createPostWithSideEffects] Warning: Could not update posts usage:', usageError.message);
      }
    }

    return post;
  } catch (error) {
    console.error('Error in createPostWithSideEffects:', error.message);
    throw error;
  }
};

module.exports.getAllPostsWithSearch = async (filters = {}, page = 1, limit = 6) => {
  try {
    const {
      search,
      location,
      type,
      employmentType,
      status,
      category,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const query = {};

    query.status = 'open';

    if (status && status !== 'open') {
      console.warn('âš ï¸ [getAllPostsWithSearch] Status filter ignored: only "open" posts are returned. Requested: ' + status);
    }

    if (search) {
      const searchTerms = search.trim().split(/\s+/);
      const searchConditions = [];

      searchTerms.forEach(term => {
        searchConditions.push(
          { "jobDetails.title": { $regex: term, $options: "i" } },
          { "jobDetails.description": { $regex: term, $options: "i" } },
          { "jobDetails.requirements": { $regex: term, $options: "i" } },
          { "skillAnalysis.requiredSkills.name": { $regex: term, $options: "i" } }
        );
      });

      query.$or = searchConditions;
    }

    if (location && location !== "All Locations") {
      query["jobDetails.location"] = { $regex: location, $options: "i" };
    }

    if (type && type !== "All Types") {
      const typeConditions = [
        { "jobDetails.workType": { $regex: type, $options: "i" } },
        { "jobDetails.type": { $regex: type, $options: "i" } },
      ];

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

    if (employmentType && employmentType !== "All Employment Types") {
      query["jobDetails.employmentType"] = { $regex: employmentType, $options: "i" };
    }

    if (category && category !== "All Categories") {
      query.category = { $regex: category, $options: "i" };
    }

    const sort = {};
    if (sortBy === "salary") {
      sort["jobDetails.salary.min"] = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "title") {
      sort["jobDetails.title"] = sortOrder === "asc" ? 1 : -1;
    } else {
      sort[sortBy] = sortOrder === "asc" ? 1 : -1;
    }

    const skip = (page - 1) * limit;

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

    const total = await Post.countDocuments(query);

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

module.exports.getPostById = async (postId) => {
  try {
    const post = await Post.findById(postId).select('-MatchingConfig').populate('user', '_id');
    if (!post) {
      throw new Error("Post not found");
    }

    if (!post.interviewLanguages || post.interviewLanguages.length === 0) {
      post.interviewLanguages = ['en'];
    }

    const result = post.toObject();
    if (post.user?._id) {
      const profile = await Profile.findOne({ userId: post.user._id, type: 'Company' }).select('companyDetails.name');
      const companyName = profile?.companyDetails?.name;
      result.createdBy = {
        id:   post.user._id,
        name: companyName,
      };
    }
    return result;
  } catch (error) {
    throw new Error(`Error fetching post: ${error.message}`);
  }
};

module.exports.getRequiredSkillsByPostId = async (postId) => {
  try {
    if (!postId) {
      throw new Error("Post ID is required");
    }
    const post = await Post.findById(postId).select(
      "skillAnalysis.requiredSkills"
    );
    if (!post) {
      throw new Error("Post not found");
    }
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

module.exports.getPostsByUserId = async (userId) => {
  try {
    return await Post.find({ user: userId })
      .select('-MatchingConfig')
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .lean();
  } catch (error) {
    throw new Error(`Error fetching user posts: ${error.message}`);
  }
};

module.exports.getPostsByUserIdWithPagination = async (userId, page = 1, limit = 6, search = '', sort = 'newest', status = '', showArchived = false, creationType = '') => {
  try {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    let query = { user: userId };
    if (showArchived) {
      query.archived = true;
    } else {
      query.archived = { $ne: true };
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

    const validCreationTypes = ['ai', 'manual'];
    if (creationType && validCreationTypes.includes(creationType.toLowerCase())) {
      query.creationType = creationType.toLowerCase();
    }

    if (status && status.trim() !== '') {
      const s = status.toLowerCase();
      if (s === 'closed') {
        query.$or = [
          { status: 'closed' },
          { status: 'open', expirationDate: { $lt: new Date() } },
        ];
      } else if (s === 'open') {
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

    let sortObj = { createdAt: -1 };
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

    const [posts, total] = await Promise.all([
      Post.find(query)
        .select('-MatchingConfig')
        .populate("user", "username email")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Post.countDocuments(query)
    ]);

    const postIds = posts.map((p) => p._id);
    const applicationCounts = postIds.length
      ? await JobApplication.aggregate([
          { $match: { post: { $in: postIds } } },
          { $group: { _id: "$post", count: { $sum: 1 } } },
        ])
      : [];
    const countsByPostId = new Map(applicationCounts.map((c) => [c._id.toString(), c.count]));
    const postsWithCounts = posts.map((p) => ({
      ...p,
      applicationsCount: countsByPostId.get(p._id.toString()) || 0,
    }));

    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    return {
      posts: postsWithCounts,
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

module.exports.updatePost = async (postId, userId, updateData) => {
  try {
    if (
      updateData.jobDetails ||
      updateData.skillAnalysis
    ) {
      validatePostData(updateData);
    }

    const post = await Post.findOne({ _id: postId, user: userId });
    if (!post) {
      throw new Error("Post not found or unauthorized");
    }

    if (updateData.createdBy) delete updateData.createdBy;

    if (updateData.interviewLanguages !== undefined && (!Array.isArray(updateData.interviewLanguages) || updateData.interviewLanguages.length === 0)) {
      delete updateData.interviewLanguages;
    }

    Object.assign(post, updateData);
    return await post.save();
  } catch (error) {
    throw new Error(`Error updating post: ${error.message}`);
  }
};

module.exports.deletePost = async (postId, userId) => {
  try {
    const post = await Post.findOne({ _id: postId, user: userId });
    if (!post) {
      throw new Error("Post not found or unauthorized");
    }

    if (post.agentConfig) {
      const AgentConfig = require('../../models/AgentConfig.model');
      await AgentConfig.findByIdAndUpdate(
        post.agentConfig,
        { archived: true, archivedAt: new Date() }
      );
    }

    if (post.agentId) {
      const Agent = require('../../models/Agent.model');
      await Agent.findByIdAndUpdate(
        post.agentId,
        { archived: true, archivedAt: new Date() }
      );
    }

    const PostInterviewAssessment = require('../interviews/post-interview/post-interview.model');
    await PostInterviewAssessment.updateMany(
      { post: postId },
      { archived: true, archivedAt: new Date() }
    );

    const archivedPost = await Post.findByIdAndUpdate(
      postId,
      { archived: true, archivedAt: new Date() },
      { new: true }
    );
    return archivedPost;
  } catch (error) {
    throw new Error(`Error deleting post: ${error.message}`);
  }
};

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

module.exports.getPostsByUserTopSkill = async (userId, page = 1, limit = 10) => {
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const user = await User.findById(userId).populate({
    path: "profile",
    select: "expectedSalary",
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.profile) {
    return {
      success: false,
      message: "No skills found. Add at least one skill to your profile to get recommendations.",
    };
  }

  const profileSkills = await ProfileSkill.find({ profile: user.profile._id, kind: "technical" }).lean();

  if (profileSkills.length === 0) {
    return {
      success: false,
      message: "No skills found. Add at least one skill to your profile to get recommendations.",
    };
  }

  const skillNames = profileSkills.map((s) => s.name).filter(Boolean);

  if (skillNames.length === 0) {
    return {
      success: false,
      message: "No valid skills found in profile. Add at least one skill to receive recommendations.",
    };
  }

  const testedPosts = await PostInterviewAssessmentModel.find({
    candidate: user._id,
  }).distinct("jobId");

  let candidatePosts = await Post.find({
    "skillAnalysis.requiredSkills.name": { $in: skillNames },
    _id: { $nin: testedPosts },
    status: 'open'
  })
    .sort({ createdAt: -1 })
    .lean();

  try {
    const userExpected = user?.profile?.expectedSalary;
    if (userExpected && (userExpected.min || userExpected.max)) {
      const userMin = typeof userExpected.min === "number" ? userExpected.min : 0;
      const userMax = typeof userExpected.max === "number" ? userExpected.max : Number.MAX_SAFE_INTEGER;

      candidatePosts = candidatePosts.filter((post) => {
        const postMin = post?.jobDetails?.salary?.min ?? 0;
        const postMax = post?.jobDetails?.salary?.max ?? Number.MAX_SAFE_INTEGER;
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

  const scored = candidatePosts.map((post) => {
    const required = (post.skillAnalysis?.requiredSkills || []).map((rs) => rs.name);
    const matchCount = required.reduce(
      (acc, name) => acc + (skillNames.includes(name) ? 1 : 0),
      0
    );
    return { post, matchCount };
  });

  scored.sort(
    (a, b) =>
      b.matchCount - a.matchCount ||
      new Date(b.post.createdAt) - new Date(a.post.createdAt)
  );

  const allPosts = scored.map((s) => s.post);

  const paginatedPosts = allPosts.slice(skip, skip + limitNum);
  const total = allPosts.length;
  const totalPages = Math.ceil(total / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;

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

module.exports.getPostMetrics = async (userId) => {
  try {
    const now = new Date();

    const allPosts = await Post.find({ user: userId })
      .select('status expirationDate archived')
      .lean();

    const metrics = {
      total: 0,
      active: 0,
      draft: 0,
      closed: 0,
      archived: 0,
    };

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

module.exports.getPostsInAlertKPI = async (userId) => {
  try {
    const now = new Date();
    const fourteenDaysFromNow = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    const count = await Post.countDocuments({
      user: userId,
      status: 'open',
      expirationDate: { $gt: now, $lte: fourteenDaysFromNow },
      archived: { $ne: true },
    });

    return { count };
  } catch (error) {
    throw new Error(`Error getting posts in alert KPI: ${error.message}`);
  }
};

module.exports.getPostsStatusKPI = async (userId, page = 1, limit = 4, postId = null, dateFrom = null, sortBy = null, sortDir = null) => {
  try {
    const now      = new Date();
    const pageNum  = Math.max(1, parseInt(page)  || 1);
    const limitNum = Math.max(1, parseInt(limit) || 4);
    const skip     = (pageNum - 1) * limitNum;

    // When a specific post is picked from the filter dropdown, show it regardless
    // of status (it may be closed) — the status restriction only applies to the
    // unfiltered "all posts" list.
    const postMatch = { user: userId, archived: { $ne: true } };
    if (postId) {
      postMatch._id = postId;
    } else {
      postMatch.status = { $in: ['draft', 'open'] };
    }

    // Sorting is by a value computed AFTER joining applications (matched,
    // completed interviews, recruiter decisions), so it can't be done as a
    // simple Post.find().sort() before that join. Instead: pull every matching
    // post (unpaginated), compute all the derived KPI fields for the FULL set,
    // sort that in JS, then paginate — this keeps the sort scoped to the whole
    // dataset (all pages), not just whatever page happened to load first.
    const totalCount = await Post.countDocuments(postMatch);
    if (totalCount === 0) {
      return { data: [], pagination: { currentPage: pageNum, totalPages: 0, totalCount: 0 } };
    }

    const posts = await Post.find(postMatch)
      .select('_id jobDetails expirationDate thresholdScore status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const postIds = posts.map(p => p._id);

    const appMatch = { company: userId, post: { $in: postIds }, isArchived: false, isWithdrawn: false };
    if (dateFrom) appMatch.appliedAt = { $gte: new Date(dateFrom) };

    const agg = await JobApplication.aggregate([
      { $match: appMatch },
      {
        $group: {
          _id:              '$post',
          totalCount:       { $sum: 1 },
          // Pushed together so the per-post threshold can be applied in JS below.
          applications:     { $push: { matchScore: '$matchScore', recruiterDecision: '$recruiterDecision' } },
          completedCount:   { $sum: { $cond: [{ $eq: ['$status', 'interview_completed'] }, 1, 0] } },
        },
      },
    ]);

    const aggMap = {};
    agg.forEach(a => { aggMap[String(a._id)] = a; });

    // "Matched" (CV Match Coverage column) = candidate qualifies for interview on
    // CV match alone (matchScore >= the post's own acceptance threshold).
    // "Shortlisted"/"Rejected" (Status column) both require a manual recruiter
    // decision AND matchScore >= threshold — so a candidate who was never a real
    // match (matchScore < threshold, incl. legacy rows auto-marked "rejected"
    // before the "not_matched" outcome existed) never counts as either. Neither
    // count can exceed Matched/Coverage. Withdrawn/archived apps are excluded
    // from everything below.
    let data = posts.map(post => {
      const a       = aggMap[String(post._id)] || { totalCount: 0, applications: [], completedCount: 0 };
      const threshold = post.thresholdScore || 60;
      const apps      = a.applications || [];
      const isMatch      = x => x.matchScore != null && x.matchScore >= threshold;
      const matched     = apps.filter(isMatch).length;
      const shortlisted = apps.filter(x => x.recruiterDecision === 'shortlisted' && isMatch(x)).length;
      const rejected     = apps.filter(x => x.recruiterDecision === 'rejected' && isMatch(x)).length;
      const total     = a.totalCount;
      return {
        id:                String(post._id),
        title:             post.jobDetails?.title || 'Untitled',
        jobStatus:         post.status === 'draft' ? 'draft' : 'published',
        matched,
        shortlisted,
        rejected,
        completedInterviews: a.completedCount || 0,
        totalApplicants:   total,
        coverage:        total > 0 ? Math.round((matched / total) * 100) / 100 : 0,
        deadline:        post.expirationDate
          ? Math.max(0, Math.round((new Date(post.expirationDate) - now) / 86400000))
          : null,
      };
    });

    if (sortBy && (sortDir === 'asc' || sortDir === 'desc')) {
      const dir = sortDir === 'asc' ? 1 : -1;
      const keyOf = {
        jobStatus: (r) => r.jobStatus,
        matched:   (r) => r.matched,
        completed: (r) => r.completedInterviews,
        decision:  (r) => r.shortlisted - r.rejected,
        // No deadline (null) always sorts to the end, regardless of direction.
        deadline:  (r) => r.deadline,
      }[sortBy];

      if (keyOf) {
        data = data.slice().sort((a, b) => {
          const av = keyOf(a);
          const bv = keyOf(b);
          if (av == null && bv == null) return 0;
          if (av == null) return 1;
          if (bv == null) return -1;
          if (av < bv) return -1 * dir;
          if (av > bv) return 1 * dir;
          return 0;
        });
      }
    }

    const paged = data.slice(skip, skip + limitNum).map(({ _createdAt, ...row }) => row);

    return { data: paged, pagination: { currentPage: pageNum, totalPages: Math.ceil(totalCount / limitNum), totalCount } };
  } catch (error) {
    throw new Error(`Error getting posts status KPI: ${error.message}`);
  }
};

// â”€â”€ Generate Job Post â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function parseLLMJson(raw) {
  const firstBrace = raw.indexOf("{");
  const lastBrace  = raw.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in LLM response");
  }

  let jsonStr = raw.substring(firstBrace, lastBrace + 1)
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  try {
    return JSON.parse(jsonStr);
  } catch {
    jsonStr = jsonStr
      .replace(/'/g, '"')
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
      .replace(/(:\s*)(\w+)(\s*[,}])/g, '$1"$2"$3')
      .replace(/(:\s*)\[([^\]]*)\]/g, (match, p1, p2) => {
        const fixedArray = p2
          .split(",")
          .map((item) => {
            const trimmed = item.trim();
            return trimmed.startsWith('"') ? trimmed : `"${trimmed}"`;
          })
          .join(",");
        return `${p1}[${fixedArray}]`;
      });
    return JSON.parse(jsonStr);
  }
}

module.exports.generateJobPost = async (description, user, overrides = {}) => {
  const MAX_RETRIES  = parseInt(process.env.GENERATE_JOBPOST_MAX_RETRIES   || "3",    10);
  const BASE_DELAY   = parseInt(process.env.GENERATE_JOBPOST_BASE_DELAY_MS || "1000", 10);
  const { workMode, contractType, language = "en", interviewLanguages } = overrides;

  const company         = user?.profile ? await Profile.findById(user.profile).lean() : null;
  const companyLocation = company?.companyDetails?.location || "";
  const prompt          = generatePrompt(description, companyLocation, language, contractType);
  const sleep           = (ms) => new Promise((r) => setTimeout(r, ms));

  const attemptOnce = async () => {
    const response = await bedrock.callLLM({
      systemPrompt:
        "You are an expert technical recruiter and AI assistant specializing in job analysis, skill extraction, and structured job post generation. Your output must always be a single valid JSON object â€” no extra text, no markdown, no explanations. Follow every rule in the user prompt exactly and consistently.",
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.3,
      maxTokens:   4096,
      timeout:     30000,
    });

    let result;
    try {
      result = parseLLMJson(response.content);
    } catch (e) {
      const err = new Error(`Failed to parse response from LLM: ${e.message}`);
      err.rawResponse = response.content;
      throw err;
    }

    if (workMode     && result?.jobDetails) result.jobDetails.workMode       = workMode;
    if (contractType && result?.jobDetails) result.jobDetails.employmentType = contractType;

    const normalized = normalizeSkillAnalysis(result);
    if (normalized) {
      normalized.language = language === 'fr' ? 'fr' : 'en';
    }
    return normalized;
  };

  let lastError;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await attemptOnce();
    } catch (err) {
      lastError = err;
      const isParseError = (err.message || "").includes("Failed to parse") || !!err.rawResponse;
      if (attempt === MAX_RETRIES || !isParseError) throw err;

      const backoff = Math.pow(2, attempt - 1) * BASE_DELAY;
      const jitter  = Math.floor(Math.random() * Math.min(500, backoff));
      console.warn(`generateJobPost: parse error attempt ${attempt}, retry in ${backoff + jitter}ms`);
      await sleep(backoff + jitter);
    }
  }

  throw lastError || new Error("Unknown error in generateJobPost");
};
