const fs = require("fs");
const path = require("path");
const { PDFParse } = require("pdf-parse");
const JobApplication = require("../models/JobApplication.model");
const Profile = require("../models/Profile.model");
const Post = require("../models/Post.model");
const { callLLM } = require("../helpers/bedrock.helpers");
const { analyzeCV } = require("./analyseResume.service");

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
    const prompt = `You are an expert recruiter. Your task is to evaluate how well a candidate matches a specific job posting.

The job can be anything — software engineering, marketing, sales, design, finance, operations, etc.
Do NOT apply a fixed scoring template. Instead, read the job description first, identify what truly matters for THIS role, then define 4–6 evaluation criteria that are relevant to it and assign each a weight so the total adds up to 100 points.

Rules:
- Criteria must reflect what the job actually requires, not generic assumptions.
- Do NOT invent requirements not mentioned in the job posting.
- Use resumeText and resumeAnalysis as the primary evidence source — they show real work, not just claimed skills.
- Declared skills and profile data are secondary signals.
- Do NOT penalize for skills or experience the job does not ask for.
- Each criterion must have a short descriptive key (snake_case, no spaces), a human-readable label, a max score, and the score you award.

---
CANDIDATE DATA:
${JSON.stringify(candidateData, null, 2)}

---
JOB DATA:
${JSON.stringify(jobData, null, 2)}

---
SCORING PROCESS

Step 1 — Read the job description and identify what matters most for this specific role.
Step 2 — Define 4–6 criteria relevant to this job. Distribute 100 points across them by importance.
Step 3 — Score the candidate on each criterion based on evidence.
Step 4 — Sum all scores → matchScore (0–100).
Step 5 — Apply the recommendation threshold:
  85–100 → "Top candidat"
  70–84  → "Recommandé"
  50–69  → "À considérer"
  30–49  → "Non retenu"
   0–29  → "Hors profil"

---
Return ONLY this JSON — no markdown, no extra text outside the object:
{
  "matchScore": <integer 0-100, sum of all criterion scores>,
  "recommendation": "<Top candidat | Recommandé | À considérer | Non retenu | Hors profil>",
  "breakdown": [
    {
      "key": "<snake_case_identifier>",
      "label": "<Human readable criterion name>",
      "maxScore": <integer, weight you assigned>,
      "score": <integer, 0 to maxScore>,
      "note": "<one sentence justification>"
    }
  ],
  "reasoning": "<2–4 sentences: candidate strengths, gaps, and why this recommendation>"
}`;
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
