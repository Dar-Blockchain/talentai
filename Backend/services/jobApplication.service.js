const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const JobApplication = require("../models/JobApplication.model");
const PostInterviewAssessment = require("../models/PostInterviewAssessment.model");
const Profile = require("../models/Profile.model");
const Post = require("../models/Post.model");
const { callLLM } = require("../helpers/bedrock.helpers");
const { analyzeCV } = require("./analyseResume.service");
const { generateMatchingScorePrompt } = require("../prompts/matchingScorePrompt");

async function extractResumeTextFromPdf(pdfPath) {
  const fileBuffer = fs.readFileSync(pdfPath);
  const parser = new PDFParse({ data: fileBuffer });
  const result = await parser.getText();
  return (result?.text || "").replace(/\s+/g, " ").trim();
}

// ========== CALCULATE MATCH SCORE WITH BEDROCK ==========
const calculateMatchScoreWithBedrock = async (candidateProfile, jobPost, resumeAnalysis = null, resumeText = "") => {
  try {
    console.log("\n" + "─".repeat(80));
    console.log("🤖 [BEDROCK MATCHING ENGINE] - CALLING AI FOR INTELLIGENT MATCHING");
    console.log("─".repeat(80));
    console.log("📋 LOGIC: Prepare all candidate & job data, send to Bedrock AI, parse score");
    
    // ═══ STEP 1: Prepare candidate data ═══
    console.log("\n[1️⃣  STEP] Preparing CANDIDATE DATA for AI analysis...");
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
      yearsOfExperience: candidateProfile.yearsOfExperience || "Not specified",
    };
    console.log(`    ✓ Name: ${candidateData.name}`);
    console.log(`    ✓ Technical Skills: ${candidateData.skills.length} skills extracted`);
    console.log(`    ✓ Soft Skills: ${candidateData.softSkills.length} skills extracted`);
    console.log(`    ✓ Resume Attached: ${candidateData.resumeFile !== "Not specified" ? "YES" : "NO"}`);
    console.log(`    ✓ Years of Experience: ${candidateData.yearsOfExperience}`);

    // ═══ STEP 2: Prepare job posting data ═══
    console.log("\n[2️⃣  STEP] Preparing JOB POSTING DATA for comparison...");
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
      fullJobPosting: jobPostObject,
    };
    console.log(`    ✓ Job Title: ${jobData.title}`);
    console.log(`    ✓ Required Technical Skills: ${jobData.requiredSkills.length} skills needed`);
    console.log(`    ✓ Required Soft Skills: ${jobData.softSkills.length} skills needed`);
    console.log(`    ✓ Experience Level: ${jobData.experienceLevel}`);
    console.log(`    ✓ Work Mode: ${jobData.workMode}`);

    // ═══ STEP 3: Build AI prompt ═══
    console.log("\n[3️⃣  STEP] Building AI PROMPT with matching criteria...");
    const prompt = generateMatchingScorePrompt(candidateData, jobData);
    console.log(`    ✓ AI Prompt length: ${prompt.length} characters`);
    console.log(`    ✓ Temperature: 0.7 (balanced creativity)`);
    console.log(`    ✓ Max Tokens: 2000`);

    // ═══ STEP 4: Call Bedrock API ═══
    console.log("\n[4️⃣  STEP] Sending REQUEST to Bedrock AI model...");
    console.log(`    ⏳ Calling callLLM() with candidate + job data...`);
    
    const response = await callLLM({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      maxTokens: 2000
    });
    console.log(`    ✓ Bedrock API response received`);

    // ═══ STEP 4: Process Bedrock response ═══
    console.log("\n[4️⃣  STEP] Processing BEDROCK RESPONSE...");
    const content = response.content || "{}";
    console.log(`    ✓ Response received (${content.length} characters)`);
    console.log(`    📄 Response Preview: ${content.substring(0, 150)}...`);
    
    // ═══ STEP 5: Parse JSON response ═══
    console.log("\n[5️⃣  STEP] Parsing JSON response from AI...");
    let result = {};
    try {
      // Try to extract JSON from response
      let jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        console.log(`    ✓ JSON object found in response`);
        let jsonStr = jsonMatch[0];
        
        // If JSON appears truncated, try to fix it
        if (!jsonStr.endsWith('}')) {
          console.log(`    ⚠️  JSON appears truncated, attempting to fix...`);
          const lastQuoteIndex = jsonStr.lastIndexOf('"');
          if (lastQuoteIndex > 0) {
            jsonStr = jsonStr.substring(0, lastQuoteIndex) + '"}';
            console.log(`    ✓ JSON fixed successfully`);
          }
        }
        
        result = JSON.parse(jsonStr);
        console.log(`    ✓ JSON parsed successfully`);
      } else {
        console.log(`    ℹ️  No JSON braces found, attempting direct parse...`);
        result = JSON.parse(content);
      }
    } catch (parseError) {
      console.error(`\n    ❌ JSON PARSING ERROR: ${parseError.message}`);
      console.error(`    📝 Failed to parse: ${content.substring(0, 200)}`);
      console.warn(`    ⚠️  Defaulting to score 0 due to parse error`);
      return {
        matchScore: 0,
        reasoning: "AI response parsing failed."
      };
    }

    // ═══ STEP 6: Validate and normalize score ═══
    console.log("\n[6️⃣  STEP] Validating and normalizing MATCH SCORE...");
    const matchScore = Math.min(100, Math.max(0, parseInt(result.matchScore) || 0));
    const reasoning = result.reasoning || "No reasoning provided";
    const recommendation = result.recommendation || "";
    const breakdown = Array.isArray(result.breakdown) ? result.breakdown : [];

    console.log(`    ✓ Raw score from AI: ${result.matchScore}`);
    console.log(`    ✓ Normalized score: ${matchScore}/100`);
    console.log(`    ✓ Recommendation: ${recommendation}`);
    breakdown.forEach((c) => console.log(`    ✓ ${c.label}: ${c.score}/${c.maxScore} — ${c.note}`));
    console.log(`    💡 AI Reasoning: ${reasoning}`);

    // ═══ FINAL RESULT ═══
    console.log("\n" + "─".repeat(80));
    console.log(`✅ BEDROCK MATCHING COMPLETE`);
    console.log(`   Final Score: ${matchScore}/100 — ${recommendation}`);
    console.log("─".repeat(80) + "\n");

    return {
      matchScore,
      recommendation,
      breakdown,
      reasoning,
    };
  } catch (error) {
    console.error(`\n❌ [BEDROCK MATCHING ERROR] Critical error occurred`);
    console.error(`   Error Type: ${error.name}`);
    console.error(`   Error Message: ${error.message}`);
    console.error(`   Stack: ${error.stack.split('\n')[0]}`);
    console.warn(`   ⚠️  Fallback: Returning default score of 0`);
    return 0;
  }
};

// ========== CALCULATE MATCH SCORE (via AI Agent) ==========
const calculateApplicationMatchScore = async (profileId, postId, companyId) => {
  try {
    console.log("\n" + "═".repeat(100));
    console.log("🎯 [MATCH SCORE CALCULATION ENGINE] - COMPLETE WORKFLOW");
    console.log("═".repeat(100));
    console.log("📌 OBJECTIVE: Calculate intelligent job-candidate match score using AI");
    console.log("📋 WORKFLOW: Load Candidate → Load Job → Extract Resume → Call AI → Return Score");
    console.log("═".repeat(100));
    
    console.log(`\n⏱️  Starting process at: ${new Date().toISOString()}`);
    console.log(`   Input Parameters:`);
    console.log(`     • Profile ID: ${profileId}`);
    console.log(`     • Post ID: ${postId}`);
    console.log(`     • Company ID: ${companyId}`);

    // ═══ STEP 1: Fetch candidate profile ═══
    console.log("\n\n[STEP 1️⃣] LOAD CANDIDATE PROFILE FROM DATABASE");
    console.log("─".repeat(100));
    console.log("📥 Action: Fetching profile from MongoDB with ID: " + profileId);
    
    const profile = await Profile.findById(profileId).populate("userId", "firstName lastName email");
    if (!profile) {
      console.error(`\n   ❌ ERROR: Profile NOT FOUND with ID ${profileId}`);
      console.warn(`   Returning score: 0 (default fallback)`);
      return {
        matchScore: 0,
        reasoning: "Candidate profile not found.",
      };
    }
    
    console.log(`\n✅ PROFILE LOADED SUCCESSFULLY`);
    console.log(`   Candidate Name: ${profile.firstName || "Unknown"} ${profile.lastName || ""}`);
    console.log(`   Email: ${profile.userId?.email || "Not provided"}`);
    console.log(`\n   Technical Skills Information:`);
    console.log(`     └─ Total Skills: ${profile.skills?.length || 0}`);
    if (profile.skills && profile.skills.length > 0) {
      console.log(`     └─ Skill Details: ${profile.skills.map(s => `${s.name} (Level: ${s.Levelconfirmed || "N/A"})`).join(" | ")}`);
    } else {
      console.log(`     └─ ⚠️  No technical skills recorded`);
    }
    
    console.log(`\n   Soft Skills Information:`);
    console.log(`     └─ Total Soft Skills: ${profile.softSkills?.length || 0}`);
    if (profile.softSkills && profile.softSkills.length > 0) {
      console.log(`     └─ Skill Details: ${profile.softSkills.map(s => `${s.name} (${s.category || "General"})`).join(" | ")}`);
    }
    
    console.log(`\n   Compensation & Preferences:`);
    console.log(`     └─ Expected Salary: ${profile.expectedSalary?.min || "N/A"}-${profile.expectedSalary?.max || "N/A"} ${profile.expectedSalary?.currency || "N/A"}`);
    console.log(`     └─ Work Mode Preference: ${profile.workModePreference || "Not specified"}`);
    console.log(`     └─ Contract Type Preference: ${profile.preferredContractType || "Not specified"}`);
    console.log(`     └─ CV/Resume File: ${profile.resume || "NOT UPLOADED"}`);

    // ═══ STEP 2: Fetch job post ═══
    console.log("\n\n[STEP 2️⃣] LOAD JOB POSTING FROM DATABASE");
    console.log("─".repeat(100));
    console.log("📥 Action: Fetching job post from MongoDB with ID: " + postId);
    
    const post = await Post.findById(postId).populate("skillAnalysis");
    if (!post) {
      console.error(`\n   ❌ ERROR: Job Post NOT FOUND with ID ${postId}`);
      console.warn(`   Returning score: 0 (default fallback)`);
      return {
        matchScore: 0,
        reasoning: "Job post not found.",
      };
    }
    
    console.log(`\n✅ JOB POST LOADED SUCCESSFULLY`);
    console.log(`   Job Title: "${post.jobDetails?.title || "Untitled"}"`);
    console.log(`   Company: ${post.user ? "(populated)" : "(not populated)"}`);
    
    console.log(`\n   Required Skills Analysis:`);
    console.log(`     └─ Total Required Skills: ${post.skillAnalysis?.requiredSkills?.length || 0}`);
    if (post.skillAnalysis && post.skillAnalysis.requiredSkills && post.skillAnalysis.requiredSkills.length > 0) {
      console.log(`     └─ Skill Details: ${post.skillAnalysis.requiredSkills.map(s => `${s.name} (Level: ${s.level}, Weight: ${s.percentage || "N/A"}%)`).join(" | ")}`);
    }
    
    console.log(`\n   Required Soft Skills:`);
    console.log(`     └─ Total Soft Skills: ${post.skillAnalysis?.softSkills?.length || 0}`);
    if (post.skillAnalysis && post.skillAnalysis.softSkills && post.skillAnalysis.softSkills.length > 0) {
      console.log(`     └─ Skill Details: ${post.skillAnalysis.softSkills.map(s => `${s.name}`).join(" | ")}`);
    }
    
    console.log(`\n   Job Compensation & Details:`);
    console.log(`     └─ Salary Offered: ${post.jobDetails?.salary?.min || "N/A"}-${post.jobDetails?.salary?.max || "N/A"} ${post.jobDetails?.salary?.currency || "N/A"}`);
    console.log(`     └─ Work Mode: ${post.jobDetails?.workMode || "Not specified"}`);
    console.log(`     └─ Employment Type: ${post.jobDetails?.employmentType || "Not specified"}`);
    console.log(`     └─ Experience Level Required: ${post.jobDetails?.experienceLevel || "Not specified"}`);

    // ═══ STEP 3: Extract and analyze resume ═══
    console.log("\n\n[STEP 3️⃣] EXTRACT & ANALYZE CANDIDATE RESUME (PDF)");
    console.log("─".repeat(100));
    
    let resumeAnalysis = null;
    let resumeText = "";
    
    if (profile.resume) {
      const resumeFilePath = path.resolve(__dirname, "../public/resume", profile.resume);
      console.log(`📁 Resume File Path: ${resumeFilePath}`);
      console.log(`📄 File Name: ${profile.resume}`);
      
      try {
        console.log(`\n⏳ Processing: Extracting text from PDF...`);
        resumeText = await extractResumeTextFromPdf(resumeFilePath);
        console.log(`   ✓ Text extraction completed (${resumeText.length} characters extracted)`);
        
        console.log(`\n⏳ Processing: Analyzing resume with AI...`);
        const analysisJson = await analyzeCV(resumeFilePath);
        resumeAnalysis = JSON.parse(analysisJson);
        
        console.log(`✅ RESUME ANALYSIS COMPLETED`);
        console.log(`   Data Fields Extracted: ${Object.keys(resumeAnalysis).length}`);
        console.log(`     └─ Name: ${resumeAnalysis.name || "N/A"}`);
        console.log(`     └─ Email: ${resumeAnalysis.email || "N/A"}`);
        console.log(`     └─ Years of Experience: ${resumeAnalysis.yearsOfExperience || "N/A"}`);
        console.log(`     └─ Technical Skills Count: ${(resumeAnalysis.skills || []).length}`);
        console.log(`     └─ Work Experience Entries: ${(resumeAnalysis.experience || []).length}`);
        console.log(`     └─ Education Entries: ${(resumeAnalysis.education || []).length}`);
        console.log(`     └─ Certifications: ${(resumeAnalysis.certifications || []).length}`);
      } catch (error) {
        console.warn(`\n⚠️  RESUME EXTRACTION WARNING`);
        console.warn(`   Error occurred: ${error.message}`);
        console.warn(`   Proceeding WITHOUT resume analysis (will use profile data only)`);
        resumeAnalysis = null;
        resumeText = "";
      }
    } else {
      console.log(`⚠️  NO RESUME UPLOADED`);
      console.log(`   Candidate has not uploaded a CV`);
      console.log(`   Matching will use PROFILE DATA ONLY`);
    }

    // ═══ STEP 4: Call Bedrock AI for matching ═══
    console.log("\n\n[STEP 4️⃣] INVOKE BEDROCK AI MATCHING ENGINE");
    console.log("─".repeat(100));
    console.log("🤖 Action: Sending all data to Bedrock AI for intelligent analysis");
    console.log(`   Data being sent:`);
    console.log(`     • Candidate Profile: Name, skills, experience, preferences`);
    console.log(`     • Resume Analysis: ${resumeAnalysis ? "YES (structured data)" : "NO"}`);
    console.log(`     • Resume Text: ${resumeText ? `YES (${resumeText.length} chars)` : "NO"}`);
    console.log(`     • Job Description: Title, requirements, compensation`);

    console.log(`\n⏳ Calling Bedrock AI... (this may take 2-5 seconds)`);
    const matchResult = await calculateMatchScoreWithBedrock(profile, post, resumeAnalysis, resumeText);
    console.log(`\n✅ AI Matching Completed`);

    // ═══ STEP 5: Process result ═══
    console.log("\n\n[STEP 5️⃣] PROCESS & FINALIZE RESULTS");
    console.log("─".repeat(100));
    
    const score = matchResult.matchScore || 0;
    const reasoning = matchResult.reasoning || "No reasoning provided";
    
    console.log(`\n📊 FINAL MATCH SCORE: ${score}/100`);
    console.log(`   AI Reasoning (${reasoning.length} chars):`);
    console.log(reasoning);
    
    // Interpret the score
    let interpretation = "";
    if (score >= 81) interpretation = "🟢 EXCELLENT MATCH - Strong fit for this role";
    else if (score >= 61) interpretation = "🔵 GOOD MATCH - Reasonable fit with minor gaps";
    else if (score >= 41) interpretation = "🟡 AVERAGE MATCH - Some alignment, key gaps exist";
    else if (score >= 21) interpretation = "🟠 BELOW AVERAGE - Significant gaps in fit";
    else interpretation = "🔴 POOR MATCH - Lacks critical skills/experience";
    
    console.log(`   Interpretation: ${interpretation}`);
    console.log(`\n   Summary:`);
    console.log(`     └─ Candidate: ${profile.firstName} ${profile.lastName}`);
    console.log(`     └─ Position: "${post.jobDetails?.title}"`);
    console.log(`     └─ Company ID: ${companyId}`);
    console.log(`     └─ Evaluation Date: ${new Date().toISOString()}`);

    console.log("\n" + "═".repeat(100));
    console.log("✅ MATCH SCORE CALCULATION COMPLETED SUCCESSFULLY");
    console.log("═".repeat(100) + "\n");

    return {
      matchScore: score,
      reasoning,
    };
  } catch (error) {
    console.error("\n" + "═".repeat(100));
    console.error("❌ [CRITICAL ERROR] MATCH SCORE CALCULATION FAILED");
    console.error("═".repeat(100));
    console.error(`\n   Error Details:`);
    console.error(`     • Error Type: ${error.name}`);
    console.error(`     • Error Message: ${error.message}`);
    console.error(`     • Location: ${error.stack.split('\n')[1]}`);
    console.error(`\n   Fallback Action: Returning default score of 0`);
    console.error("═".repeat(100) + "\n");
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
    cleanData.status = "visited";

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

    const PostInterviewAssessment = require("../models/PostInterviewAssessment.model");

    // ── Build base query ─────────────────────────────────────────────────────
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

    // ── Search by name / email ────────────────────────────────────────────────
    if (filters.search) {
      const rx = { $regex: filters.search, $options: "i" };
      const profileMatches = await Profile.find({
        $or: [{ firstName: rx }, { lastName: rx }, { email: rx }],
      }).select("_id");
      query.profile = { $in: profileMatches.map((p) => p._id) };
    }

    // ── Fetch applications (all, for in-memory interviewScore sort/filter) ───
    const applications = await JobApplication.find(query)
      .select("_id status matchScore appliedAt profile")
      .populate({
        path: "profile",
        select: "firstName lastName email user_image userId resume",
        populate: { path: "userId", select: "email" },
      })
      .sort({ appliedAt: -1 })
      .lean();

    // ── Fetch all assessments for this post in one query ─────────────────────
    const assessments = await PostInterviewAssessment.find({ post: postId })
      .select("candidate interviewData.finalReport.scores.overall createdAt")
      .lean();

    const assessmentByUser = new Map();
    assessments.forEach((a) => {
      assessmentByUser.set(String(a.candidate), a);
    });

    // ── Merge & build flat rows ───────────────────────────────────────────────
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
      };
    });

    // ── In-memory filters that depend on joined data ──────────────────────────
    if (filters.interviewScoreMin !== undefined) {
      rows = rows.filter((r) => r.interviewScore !== null && r.interviewScore >= filters.interviewScoreMin);
    }
    if (filters.interviewScoreMax !== undefined) {
      rows = rows.filter((r) => r.interviewScore !== null && r.interviewScore <= filters.interviewScoreMax);
    }

    // ── Sort ──────────────────────────────────────────────────────────────────
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

    // ── Paginate ──────────────────────────────────────────────────────────────
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

    const PostInterviewAssessment = require("../models/PostInterviewAssessment.model");
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
      .select("_id status matchScore appliedAt profile post")
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

module.exports.downloadCVsByCompany = async (companyId, filters = {}) => {
  try {
    if (!companyId) throw Object.assign(new Error("Company ID is required"), { status: 400 });

    const ObjectId = require("mongoose").Types.ObjectId;
    const path = require("path");
    const fs = require("fs");

    const query = { company: new ObjectId(companyId), isWithdrawn: false };
    if (filters.status) query.status = filters.status;
    if (filters.postId) query.post = new ObjectId(filters.postId);

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
      .select("profile post")
      .populate({ path: "profile", select: "firstName lastName resume" })
      .populate({ path: "post", select: "jobDetails" })
      .lean();

    const resumeDir = path.resolve(__dirname, "../public/resume");

    const files = [];
    const seenFiles = new Set();

    for (const app of applications) {
      const p = app.profile;
      if (!p || !p.resume) continue;

      const filePath = path.join(resumeDir, p.resume);
      if (!fs.existsSync(filePath)) continue;
      if (seenFiles.has(filePath)) continue;
      seenFiles.add(filePath);

      const firstName = p.firstName || "Unknown";
      const lastName  = p.lastName  || "";
      const postTitle = app.post?.jobDetails?.title || "Job";
      const ext       = path.extname(p.resume) || ".pdf";
      const archiveName = `${firstName}_${lastName}_${postTitle}${ext}`
        .replace(/[^a-zA-Z0-9._-]/g, "_");

      files.push({ filePath, archiveName });
    }

    return files;
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

    console.log("\n" + "═".repeat(80));
    console.log("📊 [KPI] PENDING SHORTLISTS - CALCULATING");
    console.log("═".repeat(80));

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
      console.log(`\n🔍 KPI Scope: Company ${companyId}, Post ${postId}`);
    } else {
      console.log(`\n🔍 KPI Scope: Company ${companyId}, All Posts`);
    }

    console.log(`📈 Criteria:`);
    console.log(`   • Match Score: >= ${SHORTLIST_THRESHOLD}`);
    console.log(`   • Recruiter Decision: NULL (Pending)`);
    console.log(`   • Status: Active (not withdrawn/archived)`);

    // Count matching applications
    const count = await JobApplication.countDocuments(baseQuery);
    
    console.log(`\n✅ Result:`);
    console.log(`   Pending Shortlist Count: ${count}`);
    console.log("═".repeat(80) + "\n");

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
    console.error(`\n❌ [KPI ERROR] Failed to calculate pending shortlists:`, error.message);
    error.status = error.status || 500;
    throw error;
  }
};

// ========== KPI - GET PENDING SHORTLIST DETAILS ==========
// Get detailed list of pending shortlist candidates
module.exports.getPendingShortlistDetails = async (companyId, postId = null, page = 1, limit = 20) => {
  try {
    const SHORTLIST_THRESHOLD = 60;
    
    console.log(`\n📋 Fetching pending shortlist details...`);

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

    console.log(`   ✓ Found ${totalCount} pending shortlists`);

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
    console.error(`\n❌ Error fetching pending shortlist details:`, error.message);
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

    // ── Top 10: applications that completed or were shortlisted ─────────────────
    // JobApplication: profile → Profile (has userId, firstName, lastName)
    // PostInterviewAssessment: candidate → User (userId matches Profile.userId)
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

    // Build a map: profileId → userId so we can look up assessments by candidate (User ref)
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

    // scoreMap key: postId_userId — use scores.overall (AI quality score, not coverage)
    const scoreMap = {};
    assessments.forEach(a => {
      const key = `${String(a.post)}_${String(a.candidate)}`;
      scoreMap[key] = Math.round(a.interviewData?.finalReport?.scores?.overall ?? 0);
    });

    // Build ranked list
    const ranked = completedApps.map(a => {
      const userId    = profileIdToUserId[String(a.profile?._id)] || '';
      const postIdStr = String(a.post?._id || '');
      const score     = scoreMap[`${postIdStr}_${userId}`] ?? 0;
      return {
        firstName: a.profile?.firstName || '—',
        lastName:  a.profile?.lastName  || '',
        postTitle: a.post?.jobDetails?.title || '—',
        score,
        status: a.recruiterDecision === 'shortlisted' ? 'shortlisted' : 'completed',
      };
    });

    ranked.sort((a, b) => b.score - a.score);
    const top10 = ranked.slice(0, 10).map((r, i) => ({ rank: i + 1, ...r }));

    // ── Avg score (only assessments with score > 0) ──────────────────────────────
    const assessBase = { company: companyId, 'interviewData.finalReport.scores.overall': { $gt: 0 } };
    if (postId) assessBase.post = new mongoose.Types.ObjectId(postId);

    const avg = (arr) => arr.length
      ? Math.round(arr.reduce((s, a) => s + (a.interviewData?.finalReport?.scores?.overall || 0), 0) / arr.length)
      : null;

    const [curScores, prevScores] = await Promise.all([
      PostInterviewAssessment.find({ ...assessBase, updatedAt: { $gte: d30 } })
        .select('interviewData.finalReport.scores.overall').lean(),
      PostInterviewAssessment.find({ ...assessBase, updatedAt: { $gte: d60, $lt: d30 } })
        .select('interviewData.finalReport.scores.overall').lean(),
    ]);

    const avgCurrent  = avg(curScores);
    const avgPrevious = avg(prevScores);
    const avgDelta    = avgCurrent !== null && avgPrevious !== null
      ? avgCurrent - avgPrevious
      : null;

    // ── By post: top 5 posts by avg score ───────────────────────────────────────
    const byPostAgg = await PostInterviewAssessment.aggregate([
      { $match: assessBase },
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
      label: r.postDoc?.jobDetails?.title || '—',
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
// TTS: firstInvitationSentAt → interview completion date (updatedAt when status=interview_completed)
// TTH: post.createdAt → interview completion date
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

    // Group by month — use recruiterDecisionAt if set, else updatedAt (interview completion time)
    const byMonth = {};
    months.forEach(m => { byMonth[`${m.year}-${m.month}`] = { tts: [], tth: [] }; });

    apps.forEach(app => {
      const endDate = app.recruiterDecisionAt
        ? new Date(app.recruiterDecisionAt)
        : new Date(app.updatedAt);

      const key = `${endDate.getFullYear()}-${endDate.getMonth() + 1}`;
      if (!byMonth[key]) return;

      // TTS: invitation → decision (or completion). Fall back to appliedAt if no invitation.
      const startTts = app.firstInvitationSentAt
        ? new Date(app.firstInvitationSentAt)
        : app.appliedAt ? new Date(app.appliedAt) : null;
      if (startTts) {
        const tts = (endDate - startTts) / 86400000;
        if (tts >= 0) byMonth[key].tts.push(tts);
      }

      // TTH: post created → decision/completion
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
    const Profile      = require('../models/Profile.model');

    const base = { company: companyId, isArchived: false };

    // ── Counts ──────────────────────────────────────────────────────────────────
    const [completed, shortlisted] = await Promise.all([
      JobApplication.countDocuments({ ...base, status: 'interview_completed' }),
      JobApplication.countDocuments({ ...base, recruiterDecision: 'shortlisted' }),
    ]);

    // Hours saved: each completed interview saves 30 min of manual screening
    const savedHours = Math.round(completed * 0.5);

    // ── Subscription cost (sum of all payments for this company) ─────────────
    const companyProfile = await Profile.findOne({ userId: companyId }).select('_id').lean();
    let subscriptionCost = 0;
    if (companyProfile) {
      const payments = await Payment.find({ companyProfileId: companyProfile._id })
        .select('planPrice').lean();
      subscriptionCost = payments.reduce((s, p) => s + (p.planPrice || 0), 0);
    }

    const costPerHire       = shortlisted > 0 ? Math.round(subscriptionCost / shortlisted) : null;
    const costPerShortlisted = shortlisted > 0 ? Math.round(subscriptionCost / shortlisted) : null;

    // ── TTH trend: last 12 months (post.createdAt → completion/decision) ────────
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
// Applied → Invited → Completed → Shortlisted
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

    console.log(`\n📋 [RECRUITER DECISION] Updating decision for application: ${applicationId}`);
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
      .populate("company", "-authHistory -notifications")
      .populate("cvAnalysis");

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    console.log(`✅ Decision updated successfully`);
    console.log(`   Candidate: ${application.profile?.firstName} ${application.profile?.lastName}`);
    console.log(`   Position: ${application.post?.jobDetails?.title || "N/A"}`);

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== GET SHORTLISTED CANDIDATES ==========
module.exports.getShortlistedCandidates = async (companyId, postId = null, page = 1, limit = 20) => {
  try {
    console.log(`\n📊 Fetching shortlisted candidates for company: ${companyId}`);

    const baseQuery = {
      company: companyId,
      recruiterDecision: "shortlisted",
      isWithdrawn: false,
      isArchived: false,
    };

    if (postId) {
      baseQuery.post = postId;
      console.log(`   Post ID: ${postId}`);
    }

    const skip = (page - 1) * limit;
    const totalCount = await JobApplication.countDocuments(baseQuery);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await JobApplication.find(baseQuery)
      .select("_id profile post matchScore recruiterDecisionAt appliedAt companyNotes")
      .populate({
        path: "profile",
        select: "firstName lastName email location skills yearsOfExperience",
      })
      .populate({
        path: "post",
        select: "jobDetails title",
      })
      .sort({ recruiterDecisionAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`   ✓ Found ${totalCount} shortlisted candidates`);

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
    };
  } catch (error) {
    console.error(`\n❌ Error fetching shortlisted candidates:`, error.message);
    error.status = error.status || 500;
    throw error;
  }
};

// ========== GET REJECTED CANDIDATES ==========
module.exports.getRejectedCandidates = async (companyId, postId = null, page = 1, limit = 20) => {
  try {
    console.log(`\n📊 Fetching rejected candidates for company: ${companyId}`);

    const baseQuery = {
      company: companyId,
      recruiterDecision: "rejected",
      isWithdrawn: false,
      isArchived: false,
    };

    if (postId) {
      baseQuery.post = postId;
      console.log(`   Post ID: ${postId}`);
    }

    const skip = (page - 1) * limit;
    const totalCount = await JobApplication.countDocuments(baseQuery);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await JobApplication.find(baseQuery)
      .select("_id profile post matchScore rejectionReason recruiterDecisionAt appliedAt")
      .populate({
        path: "profile",
        select: "firstName lastName email location skills",
      })
      .populate({
        path: "post",
        select: "jobDetails title",
      })
      .sort({ recruiterDecisionAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`   ✓ Found ${totalCount} rejected candidates`);

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
    };
  } catch (error) {
    console.error(`\n❌ Error fetching rejected candidates:`, error.message);
    error.status = error.status || 500;
    throw error;
  }
};

// ========== GET CANDIDATES BY DECISION ==========
module.exports.getCandidatesByDecision = async (companyId, decision, postId = null, page = 1, limit = 20) => {
  try {
    if (!decision || !["shortlisted", "rejected"].includes(decision)) {
      const error = new Error("Decision must be 'shortlisted' or 'rejected'");
      error.status = 400;
      throw error;
    }

    console.log(`\n📊 Fetching ${decision} candidates for company: ${companyId}`);

    const baseQuery = {
      company: companyId,
      recruiterDecision: decision,
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
      .select("_id profile post matchScore rejectionReason recruiterDecisionAt appliedAt companyNotes")
      .populate({
        path: "profile",
        select: "firstName lastName email location skills yearsOfExperience",
      })
      .populate({
        path: "post",
        select: "jobDetails title",
      })
      .sort({ recruiterDecisionAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`   ✓ Found ${totalCount} ${decision} candidates`);

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
    };
  } catch (error) {
    console.error(`\n❌ Error fetching candidates by decision:`, error.message);
    error.status = error.status || 500;
    throw error;
  }
};
