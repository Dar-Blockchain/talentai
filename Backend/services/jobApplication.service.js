const JobApplication = require("../models/JobApplication.model");
const Profile = require("../models/Profile.model");
const Post = require("../models/Post.model");
const CVAnalysis = require("../models/CVAnalysis.model");
const { calculateMatchScore } = require("./MatchingService/matching.service");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ========== CALCULATE MATCH SCORE WITH OPENAI ==========
const calculateMatchScoreWithOpenAI = async (candidateProfile, jobPost) => {
  try {
    console.log(`\n🤖 [OPENAI MATCHING] - Sending to OpenAI for AI-powered matching...`);
    
    // Prepare candidate data
    const candidateData = {
      name: `${candidateProfile.firstName} ${candidateProfile.lastName}`,
      skills: candidateProfile.skills?.map(s => ({
        name: s.name,
        level: s.Levelconfirmed || s.proficiencyLevel || "Not specified",
        experienceLevel: s.experienceLevel || "Not specified"
      })) || [],
      softSkills: candidateProfile.softSkills?.map(s => ({
        name: s.name,
        category: s.category || "General",
        level: s.proficiencyLevel || "Not specified"
      })) || [],
      salary: candidateProfile.expectedSalary || {},
      workModePreference: candidateProfile.workModePreference || "Not specified",
      contractPreference: candidateProfile.preferredContractType || "Not specified",
      yearsOfExperience: candidateProfile.yearsOfExperience || "Not specified",
    };

    // Prepare job data
    const jobData = {
      title: jobPost.jobDetails?.title || "Not specified",
      description: jobPost.jobDetails?.description || "Not specified",
      requiredSkills: jobPost.skillAnalysis?.requiredSkills?.map(s => ({
        name: s.name,
        level: s.level || "Not specified",
        importance: s.importance || "Not specified"
      })) || [],
      softSkills: jobPost.skillAnalysis?.softSkills?.map(s => ({
        name: s.name,
        level: s.level || "Not specified"
      })) || [],
      salary: jobPost.jobDetails?.salary || {},
      workMode: jobPost.jobDetails?.workMode || "Not specified",
      employmentType: jobPost.jobDetails?.employmentType || "Not specified",
      experienceLevel: jobPost.jobDetails?.experienceLevel || "Not specified",
    };

    const prompt = `You are an expert HR and talent matching AI. Analyze the compatibility between a candidate and a job position.

CANDIDATE PROFILE:
${JSON.stringify(candidateData, null, 2)}

JOB POSITION:
${JSON.stringify(jobData, null, 2)}

Based on this information, provide a matching score between 0 and 100, where:
- 0-20: Poor match - candidate lacks critical skills or experience
- 21-40: Below average - significant skill gaps or misalignment
- 41-60: Average - some alignment but key gaps exist
- 61-80: Good match - strong alignment with minor gaps
- 81-100: Excellent match - strong alignment across most criteria

Consider these factors:
1. **Technical Skills Match** (40%): How well do candidate's technical skills match the job requirements?
2. **Soft Skills Match** (10%): Do the soft skills align with the role's needs?
3. **Experience Level** (15%): Does the candidate's experience level match the job's requirements?
4. **Salary Alignment** (10%): Is there reasonable overlap between candidate's expectations and job offer?
5. **Work Mode Match** (10%): Does work mode preference align with job requirements?
6. **Contract Type Match** (15%): Does employment type preference match the job offer?

IMPORTANT: Return ONLY a JSON object with this exact structure:
{
  "matchScore": <number 0-100>,
  "reasoning": "<brief explanation of the score>"
}

Do not include any other text, markdown, or explanation outside of the JSON object.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Extract the response content
    const content = response.choices[0]?.message?.content || "{}";
    console.log(`📄 OpenAI Response:`, content);
    
    // Parse JSON response
    let result = {};
    try {
      // Try to extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        result = JSON.parse(content);
      }
    } catch (parseError) {
      console.error(`⚠️ Failed to parse OpenAI response:`, parseError.message);
      return 0;
    }

    const matchScore = Math.min(100, Math.max(0, parseInt(result.matchScore) || 0));
    
    console.log(`✅ Match Score from OpenAI: ${matchScore}/100`);
    console.log(`   Reasoning: ${result.reasoning || "Not provided"}`);
    
    return matchScore;
  } catch (error) {
    console.error(`❌ [OPENAI MATCHING ERROR]`, error.message);
    console.error("Falling back to default score of 0");
    return 0;
  }
};

// ========== CALCULATE MATCH SCORE (via AI Agent) ==========
const calculateApplicationMatchScore = async (profileId, postId, companyId) => {
  try {
    console.log("\n" + "=".repeat(80));
    console.log("📊 [MATCH SCORE ENGINE] - CALCULATING MATCH SCORE");
    console.log("=".repeat(80));
    console.log(`Profile ID: ${profileId}`);
    console.log(`Post ID: ${postId}`);
    console.log(`Company ID: ${companyId}`);

    // Fetch candidate profile with all skills data
    console.log(`\n🔍 Step 1: Fetching candidate profile...`);
    const profile = await Profile.findById(profileId).populate("userId", "firstName lastName email");
    if (!profile) {
      console.warn(`❌ Profile not found: ${profileId}`);
      return 0;
    }
    console.log(`✅ Profile loaded: ${profile.firstName || "Unknown"} ${profile.lastName || ""}`);
    console.log(`   └─ Technical Skills: ${profile.skills?.length || 0} found`);
    if (profile.skills && profile.skills.length > 0) {
      console.log(`      Skills: ${profile.skills.map(s => `${s.name} (Lvl: ${s.Levelconfirmed})`).join(", ")}`);
    }
    console.log(`   └─ Soft Skills: ${profile.softSkills?.length || 0} found`);
    console.log(`   └─ Salary Expectation: ${profile.expectedSalary?.min}-${profile.expectedSalary?.max} ${profile.expectedSalary?.currency}`);
    console.log(`   └─ Work Mode Preference: ${profile.workModePreference || "Not specified"}`);
    console.log(`   └─ Contract Type: ${profile.preferredContractType || "Not specified"}`);

    // Fetch job post with skill requirements
    console.log(`\n🔍 Step 2: Fetching job post...`);
    const post = await Post.findById(postId).populate("skillAnalysis");
    if (!post) {
      console.warn(`❌ Post not found: ${postId}`);
      return 0;
    }
    console.log(`✅ Job post loaded: "${post.jobDetails?.title || "Untitled"}"`);
    console.log(`   └─ Required Skills: ${post.skillAnalysis?.requiredSkills?.length || 0} found`);
    if (post.skillAnalysis && post.skillAnalysis.requiredSkills) {
      console.log(`      Skills: ${post.skillAnalysis.requiredSkills.map(s => `${s.name} (Lvl: ${s.level}, Weight: ${s.percentage}%)`).join(", ")}`);
    }
    console.log(`   └─ Soft Skills Required: ${post.skillAnalysis?.softSkills?.length || 0}`);
    console.log(`   └─ Salary Offered: ${post.jobDetails?.salary?.min}-${post.jobDetails?.salary?.max} ${post.jobDetails?.salary?.currency}`);
    console.log(`   └─ Work Mode: ${post.jobDetails?.workMode || "Not specified"}`);
    console.log(`   └─ Employment Type: ${post.jobDetails?.employmentType || "Not specified"}`);

    // Extract job skills from post skillAnalysis
    const jobSkills = post.skillAnalysis?.requiredSkills || [];
    const jobDetails = {
      title: post.jobDetails?.title,
      description: post.jobDetails?.description,
      skillAnalysis: post.skillAnalysis,
      salary: post.jobDetails?.salary,
      location: post.jobDetails?.location,
      workMode: post.jobDetails?.workMode,
      employmentType: post.jobDetails?.employmentType,
    };

    // Extract candidate skills from profile
    const candidateSkills = profile.skills || [];
    const candidateProfile = {
      _id: profile._id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      softSkills: profile.softSkills || [],
      expectedSalary: profile.expectedSalary,
      workModePreference: profile.workModePreference,
      preferredContractType: profile.preferredContractType,
    };

    // Get matching configuration (if exists)
    console.log(`\n🔍 Step 3: Loading matching configuration...`);
    const MatchingConfig = require("../models/MatchingConfig.model");
    const matchingConfig = await MatchingConfig.findOne({ company: companyId });
    const configData = matchingConfig || { weights: {} };
    console.log(`✅ Matching config loaded${matchingConfig ? " (custom weights)" : " (default weights)"}`);
    const weights = configData.weights || {};
    console.log(`   └─ Hard Skills Weight: ${weights.hardSkill || 50}%`);
    console.log(`   └─ Soft Skills Weight: ${weights.SoftSkill || 10}%`);
    console.log(`   └─ Experience Weight: ${weights.experience || 10}%`);
    console.log(`   └─ Salary Weight: ${weights.salary || 10}%`);
    console.log(`   └─ Work Mode Weight: ${weights.workMode || 10}%`);
    console.log(`   └─ Contract Weight: ${weights.contract || 10}%`);

    // Calculate match score using OpenAI AI matching algorithm
    console.log(`\n🔍 Step 4: Running OpenAI matching algorithm...`);
    console.log(`   Sending candidate CV and job post to OpenAI for intelligent matching...`);

    const matchResult = await calculateMatchScoreWithOpenAI(profile, post);

    const score = matchResult || 0;
    console.log(`\n✅ [MATCH SCORE CALCULATED BY OPENAI]`);
    console.log(`   Candidate: ${candidateProfile.firstName} ${candidateProfile.lastName}`);
    console.log(`   Job: "${post.jobDetails?.title}"`);
    console.log(`   Final Match Score: ${score}/100`);
    console.log("=".repeat(80) + "\n");

    return score;
  } catch (error) {
    console.error(`❌ [MATCH SCORE ERROR] Error calculating match score:`, error);
    console.error("Stack trace:", error.stack);
    return 0; // Return 0 if calculation fails
  }
};

// ========== CREATE ==========
module.exports.createJobApplication = async (applicationData) => {
  try {
    // Remove matchScore from applicationData if provided (it will be calculated)
    const { matchScore: _, ...cleanData } = applicationData;

    // Check if application already exists
    const existing = await JobApplication.findOne({
      profile: cleanData.profile,
      post: cleanData.post,
      isWithdrawn: false,
    });

    if (existing) {
      const error = new Error("Application already exists for this candidate and post");
      error.status = 409;
      throw error;
    }

    // Calculate match score automatically using AI matching
    const calculatedMatchScore = await calculateApplicationMatchScore(
      cleanData.profile,
      cleanData.post,
      cleanData.company
    );

    // Add calculated match score to application data
    cleanData.matchScore = calculatedMatchScore;
    cleanData.status = "applied";

    const application = await JobApplication.create(cleanData);

    // Populate references
    const populatedApplication = await JobApplication.findById(application._id)
      .populate("profile")
      .populate("post")
      .populate("company", "-authHistory -notifications")
      .populate("cvAnalysis")
      .populate("interviewAssessment");

    return populatedApplication;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Get all applications ==========
module.exports.getAllJobApplications = async (filters = {}, page = 1, limit = 10) => {
  try {
    const query = {};

    // Build filters
    if (filters.profile) query.profile = filters.profile;
    if (filters.post) query.post = filters.post;
    if (filters.company) query.company = filters.company;
    if (filters.status) query.status = filters.status;
    if (filters.isArchived !== undefined) query.isArchived = filters.isArchived;
    if (filters.isWithdrawn !== undefined) query.isWithdrawn = filters.isWithdrawn;

    // Search filter for candidate name or email
    if (filters.search) {
      const profileMatches = await Profile.find({
        $or: [
          { firstName: { $regex: filters.search, $options: "i" } },
          { lastName: { $regex: filters.search, $options: "i" } },
        ],
      }).select("_id");

      query.profile = { $in: profileMatches.map((p) => p._id) };
    }

    const skip = (page - 1) * limit;
    const totalCount = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await JobApplication.find(query)
      .populate("profile")
      .populate("post")
      .populate("company", "-authHistory -notifications")
      .populate("cvAnalysis")
      .populate("interviewAssessment")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: applications,
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Get by ID ==========
module.exports.getJobApplicationById = async (applicationId) => {
  try {
    if (!applicationId) {
      const error = new Error("Application ID is required");
      error.status = 400;
      throw error;
    }

    const application = await JobApplication.findById(applicationId)
      .populate({ path: "profile", populate: { path: "userId", select: "email" } })
      .populate("post")
      .populate("company", "-authHistory -notifications")
      .populate("cvAnalysis")
      .populate("interviewAssessment");

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Get applications by candidate ==========
module.exports.getApplicationsByCandidate = async (profileId, filters = {}, page = 1, limit = 10) => {
  try {
    if (!profileId) {
      const error = new Error("Profile ID is required");
      error.status = 400;
      throw error;
    }

    const query = { profile: profileId, isWithdrawn: false };

    if (filters.status) query.status = filters.status;
    if (filters.isArchived !== undefined) query.isArchived = filters.isArchived;

    const skip = (page - 1) * limit;
    const totalCount = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await JobApplication.find(query)
      .populate("post")
      .populate("company", "-authHistory -notifications")
      .populate("cvAnalysis")
      .populate("interviewAssessment")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: applications,
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Get applications by company and post ==========
module.exports.getApplicationsByPost = async (postId, filters = {}, page = 1, limit = 10) => {
  try {
    if (!postId) {
      const error = new Error("Post ID is required");
      error.status = 400;
      throw error;
    }

    const query = { post: postId, isWithdrawn: false };

    if (filters.status) query.status = filters.status;
    if (filters.isArchived !== undefined) query.isArchived = filters.isArchived;

    // Search filter for candidate name
    if (filters.search) {
      const profileMatches = await Profile.find({
        $or: [
          { firstName: { $regex: filters.search, $options: "i" } },
          { lastName: { $regex: filters.search, $options: "i" } },
        ],
      }).select("_id");

      query.profile = { $in: profileMatches.map((p) => p._id) };
    }

    const skip = (page - 1) * limit;
    const totalCount = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await JobApplication.find(query)
      .populate("profile")
      .populate("cvAnalysis")
      .populate("interviewAssessment")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: applications,
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Get applications by company ==========
module.exports.getApplicationsByCompany = async (companyId, filters = {}, page = 1, limit = 10) => {
  try {
    if (!companyId) {
      const error = new Error("Company ID is required");
      error.status = 400;
      throw error;
    }

    const query = { company: companyId, isWithdrawn: false };

    if (filters.status) query.status = filters.status;
    if (filters.post) query.post = filters.post;
    if (filters.isArchived !== undefined) query.isArchived = filters.isArchived;

    // Score range filter
    if (filters.scoreMin !== undefined || filters.scoreMax !== undefined) {
      query.matchScore = {};
      if (filters.scoreMin !== undefined) query.matchScore.$gte = filters.scoreMin;
      if (filters.scoreMax !== undefined) query.matchScore.$lte = filters.scoreMax;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      query.appliedAt = {};
      if (filters.dateFrom) query.appliedAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        query.appliedAt.$lte = to;
      }
    }

    // Search filter for candidate name
    if (filters.search || filters.candidateName) {
      const searchTerm = filters.search || filters.candidateName;
      const profileMatches = await Profile.find({
        $or: [
          { firstName: { $regex: searchTerm, $options: "i" } },
          { lastName: { $regex: searchTerm, $options: "i" } },
        ],
      }).select("_id");

      query.profile = { $in: profileMatches.map((p) => p._id) };
    }

    // Filter by skills
    if (filters.skills && filters.skills.length > 0) {
      const skillsArray = Array.isArray(filters.skills) ? filters.skills : [filters.skills];
      const skillRegexes = skillsArray.map((s) => new RegExp(s, "i"));
      const profilesWithSkills = await Profile.find({
        skills: {
          $elemMatch: {
            name: { $in: skillRegexes },
          },
        },
      }).select("_id");

      const profileIds = profilesWithSkills.map((p) => p._id);
      if (query.profile) {
        // If already filtered by name, intersect with skills filter
        query.profile = { $in: profileIds.filter((id) => query.profile.$in.includes(id)) };
      } else {
        query.profile = { $in: profileIds };
      }
    }

    const skip = (page - 1) * limit;
    const totalCount = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await JobApplication.find(query)
      .populate({ path: "profile", populate: { path: "userId", select: "email" } })
      .populate("post")
      .populate("cvAnalysis")
      .populate("interviewAssessment")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: applications,
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== UPDATE ==========
module.exports.updateJobApplication = async (applicationId, updateData) => {
  try {
    if (!applicationId) {
      const error = new Error("Application ID is required");
      error.status = 400;
      throw error;
    }

    // Prevent updating core references
    delete updateData.profile;
    delete updateData.post;
    delete updateData.company;

    // Updates timestamps
    updateData.updatedAt = new Date();

    // Handle status-based fields
    if (updateData.status === "viewed" && !updateData.viewedAt) {
      updateData.viewedAt = new Date();
    }
    if (updateData.status === "shortlisted" && !updateData.shortlistedAt) {
      updateData.shortlistedAt = new Date();
    }

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("profile")
      .populate("post")
      .populate("company", "-authHistory -notifications")
      .populate("cvAnalysis")
      .populate("interviewAssessment");

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== SOFT DELETE / WITHDRAW ==========
module.exports.withdrawJobApplication = async (applicationId) => {
  try {
    if (!applicationId) {
      const error = new Error("Application ID is required");
      error.status = 400;
      throw error;
    }

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        isWithdrawn: true,
        withdrawnAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("profile")
      .populate("post")
      .populate("company", "-authHistory -notifications");

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== ARCHIVE ==========
module.exports.archiveJobApplication = async (applicationId) => {
  try {
    if (!applicationId) {
      const error = new Error("Application ID is required");
      error.status = 400;
      throw error;
    }

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        isArchived: true,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("profile")
      .populate("post")
      .populate("company", "-authHistory -notifications");

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== DELETE ==========
module.exports.deleteJobApplication = async (applicationId) => {
  try {
    if (!applicationId) {
      const error = new Error("Application ID is required");
      error.status = 400;
      throw error;
    }

    const application = await JobApplication.findByIdAndDelete(applicationId);

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== STATISTICS ==========
module.exports.getApplicationStats = async (companyId, postId = null) => {
  try {
    if (!companyId) {
      const error = new Error("Company ID is required");
      error.status = 400;
      throw error;
    }

    const matchStage = { company: require("mongoose").Types.ObjectId(companyId) };
    if (postId) matchStage.post = require("mongoose").Types.ObjectId(postId);

    const stats = await JobApplication.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          appliedCount: {
            $sum: { $cond: [{ $eq: ["$status", "applied"] }, 1, 0] },
          },
          viewedCount: {
            $sum: { $cond: [{ $eq: ["$status", "viewed"] }, 1, 0] },
          },
          shortlistedCount: {
            $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] },
          },
          interviewScheduledCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "interview_scheduled"] }, 1, 0],
            },
          },
          interviewCompletedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "interview_completed"] }, 1, 0],
            },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
          averageMatchScore: { $avg: "$matchScore" },
        },
      },
    ]);

    return stats[0] || {};
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.getApplicationMetrics = async (companyId) => {
  try {
    if (!companyId) {
      const error = new Error("Company ID is required");
      error.status = 400;
      throw error;
    }

    const ObjectId = require("mongoose").Types.ObjectId;

    // Get count of unique posts that have received applications
    const postsWithApplications = await JobApplication.aggregate([
      { $match: { company: new ObjectId(companyId) } },
      {
        $group: {
          _id: "$post",
        },
      },
      {
        $count: "totalPosts",
      },
    ]);

    // Get metrics for all applications
    const applicationsMetrics = await JobApplication.aggregate([
      { $match: { company: new ObjectId(companyId) } },
      {
        $group: {
          _id: null,
          avgCVScore: { $avg: "$matchScore" },
          topCVScore: { $max: "$matchScore" },
        },
      },
    ]);

    const totalPostsWithApplications = postsWithApplications.length > 0 ? postsWithApplications[0].totalPosts : 0;
    const appMetrics = applicationsMetrics[0] || {};

    return {
      totalApplicants: totalPostsWithApplications,
      totalJobPosts: totalPostsWithApplications,
      avgCVScore: appMetrics.avgCVScore ? Math.round(appMetrics.avgCVScore) : 0,
      topCVScore: appMetrics.topCVScore ? Math.round(appMetrics.topCVScore) : 0,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};
