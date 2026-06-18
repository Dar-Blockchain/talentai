const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const JobApplication = require("../models/JobApplication.model");
const PostInterviewAssessment = require("../features/interviews/post-interview/post-interview.model");
const Profile = require("../features/users/profile.model");
const CvAnalysis = require("../features/cv-analysis/cv-analysis.model");
const Post = require("../models/Post.model");
const { callLLM } = require("../helpers/bedrock.helpers");
const { analyzeCV } = require("../features/cv-analysis/analyse-resume.service");
const { generateMatchingScorePrompt } = require("../prompts/matchingScorePrompt");

// ========== CALCULATE MATCH SCORE WITH BEDROCK ==========
const calculateMatchScoreWithBedrock = async (candidateProfile, jobPost, resumeAnalysis = null, resumeText = "") => {
  try {
    const jobPostObject = jobPost.toObject ? jobPost.toObject() : jobPost;

    const candidateData = {
      name: `${candidateProfile.firstName} ${candidateProfile.lastName}`,
      resumeFile: candidateProfile.resume || "Not specified",
      resumeText: resumeText || "Not available",
      resumeAnalysis: resumeAnalysis || {},
      skills: candidateProfile.skills?.map((s) => ({
        name: s.name,
        level: s.Levelconfirmed || s.proficiencyLevel || "Not specified",
        experienceLevel: s.experienceLevel || "Not specified",
      })) || [],
      softSkills: candidateProfile.softSkills?.map((s) => ({
        name: s.name,
        category: s.category || "General",
        level: s.proficiencyLevel || "Not specified",
      })) || [],
      salary: candidateProfile.expectedSalary || {},
      workModePreference: candidateProfile.workModePreference || "Not specified",
      contractPreference: candidateProfile.preferredContractType || "Not specified",
      yearsOfExperience: resumeAnalysis?.yearsOfExperience || candidateProfile.yearsOfExperience || "Not specified",
      experience: resumeAnalysis?.experience || [],
      stages: resumeAnalysis?.stages || [],
      resumeSkills: resumeAnalysis?.skills || [],
    };

    const jobData = {
      title: jobPost.jobDetails?.title || "Not specified",
      description: jobPost.jobDetails?.description || "Not specified",
      requiredSkills: jobPost.skillAnalysis?.requiredSkills?.map((s) => ({
        name: s.name,
        level: s.level || "Not specified",
        importance: s.importance || "Not specified",
      })) || [],
      softSkills: jobPost.skillAnalysis?.softSkills?.map((s) => ({
        name: s.name,
        level: s.level || "Not specified",
      })) || [],
      salary: jobPost.jobDetails?.salary || {},
      workMode: jobPost.jobDetails?.workMode || "Not specified",
      employmentType: jobPost.jobDetails?.employmentType || "Not specified",
      experienceLevel: jobPost.jobDetails?.experienceLevel || "Not specified",
    };

    const prompt = generateMatchingScorePrompt(candidateData, jobData);

    const response = await callLLM({
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      maxTokens: 8000,   // reasoning model emits  Blocs before JSON â€” needs headroom
      timeout: 90000,    // 90 s â€” large prompt + thinking phase can exceed the 15 s default
    });

    const content = response.content || "{}";

    let result = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        // No JSON braces â€” try to pull a bare number from the response
        const numMatch = content.match(/\b(\d{1,3})\b/);
        if (numMatch) {
          result = { matchScore: parseInt(numMatch[1], 10), reasoning: content.trim() };
        } else {
          throw new Error("No JSON or numeric score found in AI response");
        }
      }
    } catch (parseError) {
      return {
        matchScore: 0,
        reasoning: `AI response parsing failed: ${parseError.message}`,
      };
    }

    const matchScore = Math.min(100, Math.max(0, parseInt(result.matchScore) || 0));
    const reasoning = result.reasoning || "No reasoning provided";
    const recommendation = result.recommendation || "";
    const breakdown = Array.isArray(result.breakdown) ? result.breakdown : [];

    return {
      matchScore,
      recommendation,
      breakdown,
      reasoning,
    };
  } catch (error) {
    return { matchScore: 0, reasoning: `Bedrock call failed: ${error.message}` };
  }
};

// ========== CALCULATE MATCH SCORE (via AI Agent) ==========
const calculateApplicationMatchScore = async (profileId, postId, companyId) => {
  try {
    const profile = await Profile.findById(profileId).populate("userId", "firstName lastName email");
    if (!profile) {
      return {
        matchScore: 0,
        reasoning: "Candidate profile not found.",
      };
    }
  
    const post = await Post.findById(postId).populate("skillAnalysis");
    if (!post) {
      return {
        matchScore: 0,
        reasoning: "Job post not found.",
      };
    }
    
    let resumeAnalysis = null;
    let resumeText = "";

    const savedAnalysis = await CvAnalysis.findOne({ profile: profileId })
      .sort({ createdAt: -1 })
      .lean();

    if (savedAnalysis) {
      console.log(`âœ… Using saved CV analysis (id: ${savedAnalysis._id})`);
      resumeAnalysis = {
        name:              savedAnalysis.name,
        email:             savedAnalysis.email,
        yearsOfExperience: savedAnalysis.yearsOfExperience,
        seniority:         savedAnalysis.seniority,
        skills:            savedAnalysis.skills || [],
        softSkills:        (savedAnalysis.softSkills || []).map(s => s.name || s),
        experience:        savedAnalysis.experience || [],
        stages:            [],
        education:         savedAnalysis.education || [],
        certifications:    savedAnalysis.certifications || [],
      };
      resumeText = (savedAnalysis.experience || [])
        .map(e => `${e.position || ""} at ${e.company || ""} (${e.startDate || ""}â€“${e.endDate || ""}): ${e.description || ""}`)
        .join("\n");
    } else {
      console.log(`âš ï¸  No saved CV analysis and no resume file â€” matching with profile data only`);
    }

    const matchResult = await calculateMatchScoreWithBedrock(profile, post, resumeAnalysis, resumeText);
    
    const score = matchResult.matchScore || 0;
    const reasoning = matchResult.reasoning || "No reasoning provided";

    return {
      matchScore: score,
      reasoning,
    };
  } catch (error) {
    return {
      matchScore: 0,
      reasoning: `Match score calculation failed: ${error.message}`,
    };
  }
};

// ========== CREATE ==========
module.exports.createJobApplication = async (applicationData) => {
  try {
    // Remove matchScore from applicationData if provided (it will be calculated)
    const { matchScore: _, ...cleanData } = applicationData;

    // Check if application already exists (regardless of withdrawal status)
    const existing = await JobApplication.findOne({
      profile: cleanData.profile,
      post: cleanData.post,
    });

    if (existing) {
      const error = new Error("Application already exists for this candidate and post");
      error.status = 409;
      throw error;
    }

    // Calculate match score automatically using AI matching
    const matchResult = await calculateApplicationMatchScore(
      cleanData.profile,
      cleanData.post,
      cleanData.company
    );

    // Add calculated match score and reasoning to application data
    cleanData.matchScore = matchResult.matchScore;
    cleanData.matchReasoning = matchResult.reasoning;
    cleanData.matchRecommendation = matchResult.recommendation || null;
    cleanData.matchBreakdown = Array.isArray(matchResult.breakdown) ? matchResult.breakdown : [];
    cleanData.status = "visited";

    // ========== AUTO-REJECT IF MATCH SCORE BELOW THRESHOLD ==========
    // Fetch the post to get the threshold score
    const post = await Post.findById(cleanData.post);
    const thresholdScore = post?.thresholdScore || 60; // Default threshold is 60

    if (cleanData.matchScore < thresholdScore) {
      console.log(`\nâš ï¸  [AUTO-REJECT TRIGGERED] Match Score (${cleanData.matchScore}) is below threshold (${thresholdScore})`);
      cleanData.recruiterDecision = "rejected";
      cleanData.recruiterDecisionAt = new Date();
      cleanData.rejectionReason = `Candidate's match score (${cleanData.matchScore}/100) is below the required threshold (${thresholdScore}/100). Automatic rejection based on qualification mismatch.`;
      console.log(`   âœ“ Auto-rejection applied`);
      console.log(`   âœ“ Rejection Reason: ${cleanData.rejectionReason}`);
    }

    const application = await JobApplication.create(cleanData);

    // Populate references
    const populatedApplication = await JobApplication.findById(application._id)
      .populate("profile")
      .populate("post")
      .populate("company", "-notifications")
      .populate("cvAnalysis")
      .populate("interviewAssessment");

    return populatedApplication;
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
      .populate("company", "-notifications")
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

// ========== READ - Get candidate application stats ==========
module.exports.getCandidateStats = async (profileId) => {
  if (!profileId) {
    const error = new Error("Profile ID is required");
    error.status = 400;
    throw error;
  }

  const baseQuery = { profile: profileId, isWithdrawn: false };

  const [totalApplications, totalInterviews, statusBreakdown, monthlyRaw] = await Promise.all([
    JobApplication.countDocuments(baseQuery),
    JobApplication.countDocuments({ ...baseQuery, status: { $in: ["interview_scheduled", "interview_completed"] } }),
    JobApplication.aggregate([
      { $match: baseQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    JobApplication.aggregate([
      { $match: { ...baseQuery, appliedAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 5, 1)) } } },
      { $group: { _id: { year: { $year: "$appliedAt" }, month: { $month: "$appliedAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  const statusCounts = {};
  statusBreakdown.forEach(({ _id, count }) => { statusCounts[_id] = count; });

  const now = new Date();
  const monthly = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const found = monthlyRaw.find(m => m._id.year === d.getFullYear() && m._id.month === d.getMonth() + 1);
    monthly.push({
      month: d.toLocaleDateString("en-US", { month: "short" }),
      applications: found ? found.count : 0,
    });
  }

  return { totalApplications, totalInterviews, statusCounts, monthly };
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
      .populate("company", "-notifications")
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
      .select("_id status matchScore appliedAt createdAt profile post company cvAnalysis")
      .populate({
        path: "profile",
        select: "firstName lastName email user_image resume phone location contactInformation skills",
        populate: { path: "userId", select: "email" },
      })
      .populate({
        path: "post",
        select: "_id jobDetails title",
      })
      .populate({
        path: "cvAnalysis",
        select: "name email phone location analysisScore sourceUrl skills softSkills spokenLanguages education certifications links seniority yearsOfExperience title summary experience",
      })
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
          visitedCount: {
            $sum: { $cond: [{ $eq: ["$status", "visited"] }, 1, 0] },
          },
          interviewCompletedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "interview_completed"] }, 1, 0],
            },
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

    // Get total number of applicants (all applications for this company)
    const totalApplicants = await JobApplication.countDocuments({ company: new ObjectId(companyId) });

    // Get count of unique job posts that have received applications
    const postsWithApplications = await JobApplication.aggregate([
      { $match: { company: new ObjectId(companyId) } },
      { $group: { _id: "$post" } },
      { $count: "totalPosts" },
    ]);

    // Get avg/top CV scores across all applications
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
      totalApplicants,
      totalJobPosts: totalPostsWithApplications,
      avgCVScore: appMetrics.avgCVScore ? Math.round(appMetrics.avgCVScore) : 0,
      topCVScore: appMetrics.topCVScore ? Math.round(appMetrics.topCVScore) : 0,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Flat summary of applications for a post ==========
module.exports.getApplicationsSummaryByPost = async (postId, filters = {}, page = 1, limit = 20) => {
  try {
    if (!postId) {
      const error = new Error("Post ID is required");
      error.status = 400;
      throw error;
    }

    const PostInterviewAssessment = require("../features/interviews/post-interview/post-interview.model");

    // â”€â”€ Build base query â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const query = { post: postId, isWithdrawn: false };

    if (filters.status) query.status = filters.status;

    if (filters.matchScoreMin !== undefined || filters.matchScoreMax !== undefined) {
      query.matchScore = {};
      if (filters.matchScoreMin !== undefined) query.matchScore.$gte = filters.matchScoreMin;
      if (filters.matchScoreMax !== undefined) query.matchScore.$lte = filters.matchScoreMax;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.appliedAt = {};
      if (filters.dateFrom) query.appliedAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        query.appliedAt.$lte = to;
      }
    }

    // â”€â”€ Search by name / email â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (filters.search) {
      const rx = { $regex: filters.search, $options: "i" };
      const profileMatches = await Profile.find({
        $or: [{ firstName: rx }, { lastName: rx }, { email: rx }],
      }).select("_id");
      query.profile = { $in: profileMatches.map((p) => p._id) };
    }

    // â”€â”€ Fetch applications (all, for in-memory interviewScore sort/filter) â”€â”€â”€
    const applications = await JobApplication.find(query)
      .select("_id status matchScore appliedAt profile recruiterDecision invitedAt")
      .populate({
        path: "profile",
        select: "firstName lastName email user_image userId resume",
        populate: { path: "userId", select: "email" },
      })
      .sort({ appliedAt: -1 })
      .lean();

    // â”€â”€ Fetch all assessments for this post in one query â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const assessments = await PostInterviewAssessment.find({ post: postId })
      .select("candidate interviewData.finalReport.scores.overall createdAt")
      .lean();

    const assessmentByUser = new Map();
    assessments.forEach((a) => {
      assessmentByUser.set(String(a.candidate), a);
    });

    // â”€â”€ Merge & build flat rows â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let rows = applications.map((app) => {
      const p = app.profile || {};
      const userId = String(p.userId?._id || p.userId || "");
      const assessment = assessmentByUser.get(userId);
      const interviewScore = assessment?.interviewData?.finalReport?.scores?.overall ?? null;
      return {
        id: app._id,
        candidateUserId: userId || null,
        firstName: p.firstName || null,
        lastName: p.lastName || null,
        email: p.email || p.userId?.email || null,
        userImage: p.user_image || null,
        matchScore: app.matchScore ?? null,
        interviewScore: interviewScore !== undefined ? interviewScore : null,
        appliedAt: app.appliedAt || null,
        completedAt: assessment?.createdAt || null,
        status: app.status,
        resumeFile: p.resume || null,
        recruiterDecision: app.recruiterDecision ?? null,
        invitedAt: app.invitedAt ?? null,
      };
    });

    // â”€â”€ In-memory filters that depend on joined data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (filters.interviewScoreMin !== undefined) {
      rows = rows.filter((r) => r.interviewScore !== null && r.interviewScore >= filters.interviewScoreMin);
    }
    if (filters.interviewScoreMax !== undefined) {
      rows = rows.filter((r) => r.interviewScore !== null && r.interviewScore <= filters.interviewScoreMax);
    }

    // â”€â”€ Sort â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const sortMap = {
      appliedAt_desc: (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt),
      appliedAt_asc:  (a, b) => new Date(a.appliedAt) - new Date(b.appliedAt),
      matchScore_desc: (a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1),
      matchScore_asc:  (a, b) => (a.matchScore ?? -1) - (b.matchScore ?? -1),
      interviewScore_desc: (a, b) => (b.interviewScore ?? -1) - (a.interviewScore ?? -1),
      interviewScore_asc:  (a, b) => (a.interviewScore ?? -1) - (b.interviewScore ?? -1),
      name_asc:  (a, b) => (a.firstName || "").localeCompare(b.firstName || ""),
      name_desc: (a, b) => (b.firstName || "").localeCompare(a.firstName || ""),
    };
    if (filters.sort && sortMap[filters.sort]) {
      rows.sort(sortMap[filters.sort]);
    }

    // â”€â”€ Paginate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const totalCount = rows.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const skip = (page - 1) * limit;
    const data = rows.slice(skip, skip + limit);

    return {
      data,
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

// ========== READ - Flat summary of all applications for a company ==========
module.exports.getApplicationsSummaryByCompany = async (companyId, filters = {}, page = 1, limit = 20) => {
  try {
    if (!companyId) throw Object.assign(new Error("Company ID is required"), { status: 400 });

    const PostInterviewAssessment = require("../features/interviews/post-interview/post-interview.model");
    const ObjectId = require("mongoose").Types.ObjectId;

    const query = { company: new ObjectId(companyId), isWithdrawn: false };

    if (filters.status) query.status = filters.status;
    if (filters.postId) query.post = new ObjectId(filters.postId);

    if (filters.matchScoreMin !== undefined || filters.matchScoreMax !== undefined) {
      query.matchScore = {};
      if (filters.matchScoreMin !== undefined) query.matchScore.$gte = filters.matchScoreMin;
      if (filters.matchScoreMax !== undefined) query.matchScore.$lte = filters.matchScoreMax;
    }

    if (filters.dateFrom || filters.dateTo) {
      query.appliedAt = {};
      if (filters.dateFrom) query.appliedAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        query.appliedAt.$lte = to;
      }
    }

    if (filters.search) {
      const rx = { $regex: filters.search, $options: "i" };
      const profileMatches = await Profile.find({
        $or: [{ firstName: rx }, { lastName: rx }, { email: rx }],
      }).select("_id");
      query.profile = { $in: profileMatches.map((p) => p._id) };
    }

    const applications = await JobApplication.find(query)
      .select("_id status matchScore appliedAt profile post recruiterDecision invitedAt")
      .populate({
        path: "profile",
        select: "firstName lastName email user_image userId resume",
        populate: { path: "userId", select: "email" },
      })
      .populate({ path: "post", select: "jobDetails" })
      .sort({ appliedAt: -1 })
      .lean();

    const postIds = [...new Set(applications.map((a) => String(a.post?._id)).filter(Boolean))];
    const assessments = await PostInterviewAssessment.find({ post: { $in: postIds } })
      .select("candidate post interviewData.finalReport.scores.overall createdAt")
      .lean();

    const assessmentMap = new Map();
    assessments.forEach((a) => {
      assessmentMap.set(`${a.post}:${a.candidate}`, a);
    });

    let rows = applications.map((app) => {
      const p = app.profile || {};
      const userId = String(p.userId?._id || p.userId || "");
      const postId = String(app.post?._id || "");
      const assessment = assessmentMap.get(`${postId}:${userId}`);
      const interviewScore = assessment?.interviewData?.finalReport?.scores?.overall ?? null;
      return {
        id: app._id,
        candidateUserId: userId || null,
        firstName: p.firstName || null,
        lastName: p.lastName || null,
        email: p.email || p.userId?.email || null,
        userImage: p.user_image || null,
        matchScore: app.matchScore ?? null,
        interviewScore: interviewScore !== undefined ? interviewScore : null,
        appliedAt: app.appliedAt || null,
        completedAt: assessment?.createdAt || null,
        status: app.status,
        postId: postId || null,
        postTitle: app.post?.jobDetails?.title || null,
        resumeFile: p.resume || null,
        recruiterDecision: app.recruiterDecision ?? null,
        invitedAt: app.invitedAt ?? null,
      };
    });

    if (filters.interviewScoreMin !== undefined)
      rows = rows.filter((r) => r.interviewScore !== null && r.interviewScore >= filters.interviewScoreMin);
    if (filters.interviewScoreMax !== undefined)
      rows = rows.filter((r) => r.interviewScore !== null && r.interviewScore <= filters.interviewScoreMax);

    const sortMap = {
      appliedAt_desc:      (a, b) => new Date(b.appliedAt) - new Date(a.appliedAt),
      appliedAt_asc:       (a, b) => new Date(a.appliedAt) - new Date(b.appliedAt),
      matchScore_desc:     (a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1),
      matchScore_asc:      (a, b) => (a.matchScore ?? -1) - (b.matchScore ?? -1),
      interviewScore_desc: (a, b) => (b.interviewScore ?? -1) - (a.interviewScore ?? -1),
      interviewScore_asc:  (a, b) => (a.interviewScore ?? -1) - (b.interviewScore ?? -1),
      name_asc:            (a, b) => (a.firstName || "").localeCompare(b.firstName || ""),
      name_desc:           (a, b) => (b.firstName || "").localeCompare(a.firstName || ""),
    };
    if (filters.sort && sortMap[filters.sort]) rows.sort(sortMap[filters.sort]);

    const totalCount = rows.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const data = rows.slice((page - 1) * limit, page * limit);

    return { data, currentPage: page, totalPages, totalCount, limit, hasNextPage: page < totalPages, hasPrevPage: page > 1 };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== KPI - PENDING SHORTLISTS ==========
// Definition: Count candidates WHERE matchScore >= SHORTLIST_THRESHOLD AND recruiterDecision IS NULL
module.exports.getPendingShortlistsKPI = async (companyId, postId = null, dateFrom = null) => {
  try {
    const SHORTLIST_THRESHOLD = 60; // Score minimum for shortlist consideration

    console.log("\n" + "â•".repeat(80));
    console.log("ðŸ“Š [KPI] PENDING SHORTLISTS - CALCULATING");
    console.log("â•".repeat(80));

    const baseQuery = {
      company: companyId,
      matchScore: { $gte: SHORTLIST_THRESHOLD },
      recruiterDecision: null,  // Pending decision
      isWithdrawn: false,
      isArchived: false,
    };

    if (dateFrom) baseQuery.appliedAt = { $gte: new Date(dateFrom) };

    // Add post filter if specified
    if (postId) {
      baseQuery.post = postId;
      console.log(`\nðŸ” KPI Scope: Company ${companyId}, Post ${postId}`);
    } else {
      console.log(`\nðŸ” KPI Scope: Company ${companyId}, All Posts`);
    }

    console.log(`ðŸ“ˆ Criteria:`);
    console.log(`   â€¢ Match Score: >= ${SHORTLIST_THRESHOLD}`);
    console.log(`   â€¢ Recruiter Decision: NULL (Pending)`);
    console.log(`   â€¢ Status: Active (not withdrawn/archived)`);

    // Count matching applications
    const count = await JobApplication.countDocuments(baseQuery);
    
    console.log(`\nâœ… Result:`);
    console.log(`   Pending Shortlist Count: ${count}`);
    console.log("â•".repeat(80) + "\n");

    return {
      pendingShortlistsCount: count,
      threshold: SHORTLIST_THRESHOLD,
      filters: {
        company: companyId,
        post: postId || "all",
        minMatchScore: SHORTLIST_THRESHOLD,
        recruiterDecision: "null",
        isActive: true,
      },
    };
  } catch (error) {
    console.error(`\nâŒ [KPI ERROR] Failed to calculate pending shortlists:`, error.message);
    error.status = error.status || 500;
    throw error;
  }
};

// ========== KPI - GET PENDING SHORTLIST DETAILS ==========
// Get detailed list of pending shortlist candidates
module.exports.getPendingShortlistDetails = async (companyId, postId = null, page = 1, limit = 20) => {
  try {
    const SHORTLIST_THRESHOLD = 60;
    
    console.log(`\nðŸ“‹ Fetching pending shortlist details...`);

    const baseQuery = {
      company: companyId,
      matchScore: { $gte: SHORTLIST_THRESHOLD },
      recruiterDecision: null,
      isWithdrawn: false,
      isArchived: false,
    };

    if (postId) {
      baseQuery.post = postId;
    }

    const skip = (page - 1) * limit;
    const totalCount = await JobApplication.countDocuments(baseQuery);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await JobApplication.find(baseQuery)
      .select("_id profile post matchScore matchReasoning appliedAt viewedAt shortlistedAt companyNotes")
      .populate({
        path: "profile",
        select: "firstName lastName email location skills yearsOfExperience",
      })
      .populate({
        path: "post",
        select: "jobDetails title",
      })
      .sort({ matchScore: -1, appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`   âœ“ Found ${totalCount} pending shortlists`);

    return {
      data: applications,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      threshold: SHORTLIST_THRESHOLD,
    };
  } catch (error) {
    console.error(`\nâŒ Error fetching pending shortlist details:`, error.message);
    error.status = error.status || 500;
    throw error;
  }
};

// ========== KPI - NO-SHOWS TO FOLLOW UP ==========
// Candidates invited > 5 days ago who haven't completed the interview
module.exports.getNoshowsKPI = async (companyId, postId = null, dateFrom = null) => {
  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const baseQuery = {
      company: companyId,
      firstInvitationSentAt: { $lt: fiveDaysAgo, $ne: null },
      status: "visited",
      recruiterDecision: null,
      isArchived: false,
    };

    if (postId) baseQuery.post = postId;
    if (dateFrom) baseQuery.appliedAt = { $gte: new Date(dateFrom) };

    const count = await JobApplication.countDocuments(baseQuery);

    return { count };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== KPI - SOURCING QUALITY (Zone 5) ==========
// Top 10 sourced from JobApplication (completed/shortlisted), score joined from PostInterviewAssessment
module.exports.getSourcingKPI = async (companyId, postId = null, dateFrom = null) => {
  try {
    const mongoose = require('mongoose');

    const now = new Date();
    const d30 = new Date(now - 30 * 86400000);
    const d60 = new Date(now - 60 * 86400000);

    // â”€â”€ Top 10: applications that completed or were shortlisted â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // JobApplication: profile â†’ Profile (has userId, firstName, lastName)
    // PostInterviewAssessment: candidate â†’ User (userId matches Profile.userId)
    const appFilter = {
      company: companyId,
      $or: [
        { status: 'interview_completed' },
        { recruiterDecision: 'shortlisted' },
      ],
    };
    if (postId) appFilter.post = new mongoose.Types.ObjectId(postId);
    if (dateFrom) appFilter.appliedAt = { $gte: new Date(dateFrom) };

    const completedApps = await JobApplication.find(appFilter)
      .select('post profile recruiterDecision')
      .populate('post', 'jobDetails')
      .populate('profile', 'userId firstName lastName')
      .lean();

    // Build a map: profileId â†’ userId so we can look up assessments by candidate (User ref)
    const profileIdToUserId = {};
    completedApps.forEach(a => {
      if (a.profile?._id && a.profile?.userId) {
        profileIdToUserId[String(a.profile._id)] = String(a.profile.userId);
      }
    });

    const userIds = Object.values(profileIdToUserId);
    const postIds = completedApps.map(a => a.post?._id).filter(Boolean);

    // Fetch all assessments for these candidates+posts
    const assessments = await PostInterviewAssessment.find({
      company:   companyId,
      candidate: { $in: userIds },
      post:      { $in: postIds },
    }).select('candidate post interviewData.finalReport.scores').lean();

    // scoreMap key: postId_userId â€” only store entries with a real score > 0
    const scoreMap = {};
    assessments.forEach(a => {
      const raw = a.interviewData?.finalReport?.scores?.overall;
      if (raw != null && raw > 0) {
        const key = `${String(a.post)}_${String(a.candidate)}`;
        scoreMap[key] = Math.round(raw);
      }
    });

    // Build ranked list â€” score is null if no assessment exists (not 0)
    const ranked = completedApps.map(a => {
      const userId    = profileIdToUserId[String(a.profile?._id)] || '';
      const postIdStr = String(a.post?._id || '');
      const key       = `${postIdStr}_${userId}`;
      const score     = key in scoreMap ? scoreMap[key] : null;
      return {
        firstName: a.profile?.firstName || 'â€”',
        lastName:  a.profile?.lastName  || '',
        postTitle: a.post?.jobDetails?.title || 'â€”',
        score,
        status: a.recruiterDecision === 'shortlisted' ? 'shortlisted' : 'completed',
      };
    });

    // Scored entries first (desc), then unscored entries after
    ranked.sort((a, b) => {
      if (a.score !== null && b.score !== null) return b.score - a.score;
      if (a.score !== null) return -1;
      if (b.score !== null) return 1;
      return 0;
    });
    const top10 = ranked.slice(0, 10).map((r, i) => ({ rank: i + 1, ...r }));

    // â”€â”€ Avg score: all completed/shortlisted candidates, score=0 for those without interview â”€â”€
    const avgCurrent = ranked.length
      ? Math.round(ranked.reduce((s, r) => s + (r.score ?? 0), 0) / ranked.length)
      : null;

    // â”€â”€ Previous period avg for delta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const assessBasePrev = { company: companyId, createdAt: { $gte: d60, $lt: d30 }, 'interviewData.finalReport.scores.overall': { $exists: true } };
    if (postId) assessBasePrev.post = new mongoose.Types.ObjectId(postId);
    const prevDocs = await PostInterviewAssessment.find(assessBasePrev).select('interviewData.finalReport.scores.overall').lean();
    const avgPrevious = prevDocs.length
      ? Math.round(prevDocs.reduce((s, a) => s + (a.interviewData?.finalReport?.scores?.overall ?? 0), 0) / prevDocs.length)
      : null;

    const avgDelta = avgCurrent !== null && avgPrevious !== null
      ? avgCurrent - avgPrevious
      : null;

    // â”€â”€ By post: avg score per post across completed/shortlisted candidates â”€â”€â”€â”€
    const byPostMatch = { company: companyId, 'interviewData.finalReport.scores.overall': { $exists: true } };
    if (postId) byPostMatch.post = new mongoose.Types.ObjectId(postId);
    const byPostAgg = await PostInterviewAssessment.aggregate([
      { $match: byPostMatch },
      {
        $group: {
          _id:      '$post',
          avgScore: { $avg: '$interviewData.finalReport.scores.overall' },
        },
      },
      { $sort: { avgScore: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'posts', localField: '_id', foreignField: '_id', as: 'postDoc' } },
      { $unwind: { path: '$postDoc', preserveNullAndEmptyArrays: true } },
    ]);

    const COLORS = ["#0D9488", "#0891B2", "#7C3AED", "#D97706", "#DC2626"];
    const byPost = byPostAgg.map((r, i) => ({
      label: r.postDoc?.jobDetails?.title || 'â€”',
      score: Math.round(r.avgScore),
      color: COLORS[i] || "#94A3B8",
    }));

    return { avgCurrent, avgDelta, byPost, top10 };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== KPI - VELOCITY (Zone 4) ==========
// TTS: firstInvitationSentAt â†’ interview completion date (updatedAt when status=interview_completed)
// TTH: post.createdAt â†’ interview completion date
// Uses interview_completed OR shortlisted apps so data shows even without recruiter decisions
module.exports.getVelocityKPI = async (companyId, postId = null, dateFrom = null) => {
  try {
    const base = {
      company: companyId,
      isArchived: false,
      $or: [
        { status: 'interview_completed' },
        { recruiterDecision: 'shortlisted' },
      ],
    };
    if (postId) base.post = postId;
    if (dateFrom) base.appliedAt = { $gte: new Date(dateFrom) };

    // Get last 6 calendar months
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year:  d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('en', { month: 'short' }),
      });
    }

    const apps = await JobApplication.find(base)
      .select('appliedAt firstInvitationSentAt recruiterDecisionAt updatedAt post status')
      .populate('post', 'createdAt')
      .lean();

    // Group by month â€” use recruiterDecisionAt if set, else updatedAt (interview completion time)
    const byMonth = {};
    months.forEach(m => { byMonth[`${m.year}-${m.month}`] = { tts: [], tth: [] }; });

    apps.forEach(app => {
      const endDate = app.recruiterDecisionAt
        ? new Date(app.recruiterDecisionAt)
        : new Date(app.updatedAt);

      const key = `${endDate.getFullYear()}-${endDate.getMonth() + 1}`;
      if (!byMonth[key]) return;

      // TTS: invitation â†’ decision (or completion). Fall back to appliedAt if no invitation.
      const startTts = app.firstInvitationSentAt
        ? new Date(app.firstInvitationSentAt)
        : app.appliedAt ? new Date(app.appliedAt) : null;
      if (startTts) {
        const tts = (endDate - startTts) / 86400000;
        if (tts >= 0) byMonth[key].tts.push(tts);
      }

      // TTH: post created â†’ decision/completion
      const postCreated = app.post?.createdAt;
      if (postCreated) {
        const tth = (endDate - new Date(postCreated)) / 86400000;
        if (tth >= 0) byMonth[key].tth.push(tth);
      }
    });

    const median = (arr) => {
      if (!arr.length) return null;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? Math.round((sorted[mid - 1] + sorted[mid]) / 2 * 10) / 10
        : Math.round(sorted[mid] * 10) / 10;
    };

    const trend = months.map(m => ({
      period: m.label,
      tts: median(byMonth[`${m.year}-${m.month}`].tts),
      tth: median(byMonth[`${m.year}-${m.month}`].tth),
    }));

    // Overall median across all data (not just last month)
    const allTts = apps.map(app => {
      const endDate  = app.recruiterDecisionAt ? new Date(app.recruiterDecisionAt) : new Date(app.updatedAt);
      const startTts = app.firstInvitationSentAt ? new Date(app.firstInvitationSentAt) : app.appliedAt ? new Date(app.appliedAt) : null;
      if (!startTts) return null;
      const v = (endDate - startTts) / 86400000;
      return v >= 0 ? v : null;
    }).filter(v => v !== null);

    const allTth = apps.map(app => {
      const endDate    = app.recruiterDecisionAt ? new Date(app.recruiterDecisionAt) : new Date(app.updatedAt);
      const postCreated = app.post?.createdAt;
      if (!postCreated) return null;
      const v = (endDate - new Date(postCreated)) / 86400000;
      return v >= 0 ? v : null;
    }).filter(v => v !== null);

    // For delta: compare last two months with data
    const withTts = trend.filter(r => r.tts !== null);
    const withTth = trend.filter(r => r.tth !== null);
    const prevTts = withTts.length > 1 ? withTts[withTts.length - 2].tts : null;
    const prevTth = withTth.length > 1 ? withTth[withTth.length - 2].tth : null;
    const currentTts = median(allTts);
    const currentTth = median(allTth);

    const delta = (cur, prev) =>
      cur !== null && prev !== null ? Math.round((cur - prev) * 10) / 10 : null;

    return {
      tts:      currentTts,
      ttsDelta: delta(currentTts, prevTts),
      tth:      currentTth,
      tthDelta: delta(currentTth, prevTth),
      trend,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== KPI - REPORTING & ROI (Zone 7) ==========
// savedHours, subscriptionCost, costPerHire, costPerShortlisted, tth trend 12 months
module.exports.getRoiKPI = async (companyId) => {
  try {
    const Payment      = require('../models/Payment.model');
    const Profile      = require('../features/users/profile.model');

    const base = { company: companyId, isArchived: false };

    // â”€â”€ Counts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [completed, shortlisted] = await Promise.all([
      JobApplication.countDocuments({ ...base, status: 'interview_completed' }),
      JobApplication.countDocuments({ ...base, recruiterDecision: 'shortlisted' }),
    ]);

    // Hours saved: each completed interview saves 30 min of manual screening
    const savedHours = Math.round(completed * 0.5);

    // â”€â”€ Subscription cost (sum of all payments for this company) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const companyProfile = await Profile.findOne({ userId: companyId }).select('_id').lean();
    let subscriptionCost = 0;
    if (companyProfile) {
      const payments = await Payment.find({ companyProfileId: companyProfile._id })
        .select('planPrice').lean();
      subscriptionCost = payments.reduce((s, p) => s + (p.planPrice || 0), 0);
    }

    const costPerHire       = shortlisted > 0 ? Math.round(subscriptionCost / shortlisted) : null;
    const costPerShortlisted = shortlisted > 0 ? Math.round(subscriptionCost / shortlisted) : null;

    // â”€â”€ TTH trend: last 12 months (post.createdAt â†’ completion/decision) â”€â”€â”€â”€â”€â”€â”€â”€
    const now    = new Date();
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year:  d.getFullYear(),
        month: d.getMonth() + 1,
        label: d.toLocaleString('en', { month: 'short' }),
      });
    }

    const apps = await JobApplication.find({
      ...base,
      $or: [{ status: 'interview_completed' }, { recruiterDecision: 'shortlisted' }],
    })
      .select('recruiterDecisionAt updatedAt post')
      .populate('post', 'createdAt')
      .lean();

    const byMonth = {};
    months.forEach(m => { byMonth[`${m.year}-${m.month}`] = []; });

    apps.forEach(app => {
      const endDate     = app.recruiterDecisionAt ? new Date(app.recruiterDecisionAt) : new Date(app.updatedAt);
      const postCreated = app.post?.createdAt;
      if (!postCreated) return;
      const tth = (endDate - new Date(postCreated)) / 86400000;
      if (tth < 0) return;
      const key = `${endDate.getFullYear()}-${endDate.getMonth() + 1}`;
      if (byMonth[key] !== undefined) byMonth[key].push(tth);
    });

    const median = (arr) => {
      if (!arr.length) return null;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0
        ? Math.round((sorted[mid - 1] + sorted[mid]) / 2 * 10) / 10
        : Math.round(sorted[mid] * 10) / 10;
    };

    const trend = months.map(m => ({
      month: m.label,
      tth:   median(byMonth[`${m.year}-${m.month}`]),
    }));

    return {
      savedHours,
      completedInterviews: completed,
      subscriptionCost,
      costPerHire,
      costPerShortlisted,
      shortlisted,
      trend,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== KPI - GLOBAL FUNNEL (Zone 3) ==========
// Applied â†’ Invited â†’ Completed â†’ Shortlisted
module.exports.getFunnelKPI = async (companyId, postId = null, dateFrom = null) => {
  try {
    const base = { company: companyId, isArchived: false };
    if (postId) base.post = postId;
    if (dateFrom) base.appliedAt = { $gte: new Date(dateFrom) };

    const [applied, invited, completed, shortlisted] = await Promise.all([
      JobApplication.countDocuments({ ...base }),
      JobApplication.countDocuments({ ...base, firstInvitationSentAt: { $ne: null } }),
      JobApplication.countDocuments({ ...base, status: 'interview_completed' }),
      JobApplication.countDocuments({ ...base, recruiterDecision: 'shortlisted' }),
    ]);

    return { applied, invited, completed, shortlisted };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== UPDATE RECRUITER DECISION ==========
module.exports.updateRecruiterDecision = async (applicationId, decision, rejectionReason = null) => {
  try {
    if (!applicationId) {
      const error = new Error("Application ID is required");
      error.status = 400;
      throw error;
    }

    if (!decision || !["shortlisted", "rejected"].includes(decision)) {
      const error = new Error("Decision must be 'shortlisted' or 'rejected'");
      error.status = 400;
      throw error;
    }

    console.log(`\nðŸ“‹ [RECRUITER DECISION] Updating decision for application: ${applicationId}`);
    console.log(`   Decision: ${decision}`);
    if (rejectionReason) console.log(`   Reason: ${rejectionReason}`);

    const updateData = {
      recruiterDecision: decision,
      recruiterDecisionAt: new Date(),
    };

    // Add rejection reason if provided
    if (decision === "rejected" && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    )
      .populate("profile")
      .populate("post")
      .populate("company", "-notifications")
      .populate("cvAnalysis");

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    console.log(`âœ… Decision updated successfully`);
    console.log(`   Candidate: ${application.profile?.firstName} ${application.profile?.lastName}`);
    console.log(`   Position: ${application.post?.jobDetails?.title || "N/A"}`);

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};
