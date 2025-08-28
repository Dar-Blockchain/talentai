const { Together } = require("together-ai");
require("dotenv").config();

const { HttpError } = require("../utils/httpUtils");
const { parseAIResponse } = require("../parsers/AIResponseParser");
const Post = require("../models/PostModel");
const {
  handleHROverallScore,
  saveInterviewDetailsForJob,
} = require("../utils/evaluationUtils");
const candidatePostStepProgressService = require("./candidatePostStepProgressService");

const {
  generateHRStepQuestionsPrompts,
  generateSoftSkillStepQuestionsPrompts,
  generateTechnicalSkillStepQuestionsPrompts,
} = require("../prompts/recruitementStepPrompts");

const evaluationPrompts = require("../prompts/evaluationPrompts");
const Profile = require("../models/ProfileModel");
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });
const JobAssessmentResult = require("../models/JobAssessmentResultModel");
const profileService = require("../services/profileService");
const InterviewDetails = require("../models/InterviewDetailsModel");

module.exports.generateQuestions = async (
  companyDetails,
  postStep,
  post,
  userSkills,
  jobRequiredSkills,
  user
) => {
  try {
    let systemPrompt = "";
    let userPrompt = "";
    let questionsCount = 10;

    const stepType = postStep.data.type;
    const stepPrompt = postStep.data.config.lastPrompt;

    if (stepType == "interview") {
      // refers to an hrInterview
      systemPrompt = generateHRStepQuestionsPrompts.getSystemPrompt(
        questionsCount,
        stepPrompt,
        companyDetails,
        post.jobDetails
      );

      userPrompt = generateHRStepQuestionsPrompts.getUserPrompt(
        userSkills,
        questionsCount,
        stepPrompt,
        companyDetails,
        post.jobDetails
      );
    } else if (stepType == "soft") {
      systemPrompt = generateSoftSkillStepQuestionsPrompts.getSystemPrompt(
        questionsCount,
        stepPrompt,
        companyDetails,
        post.jobDetails
      );

      userPrompt = generateSoftSkillStepQuestionsPrompts.getUserPrompt(
        userSkills,
        questionsCount,
        stepPrompt,
        companyDetails,
        post.jobDetails
      );
    } else if (stepType == "technical") {
      systemPrompt =
        generateTechnicalSkillStepQuestionsPrompts.getSystemPrompt(
          questionsCount
        );

      userPrompt = generateTechnicalSkillStepQuestionsPrompts.getUserPrompt(
        questionsCount,
        jobRequiredSkills
      );
    }

    console.log("aaaa: ", systemPrompt);
    console.log("bbbb: ", userPrompt);

    const stream = await together.chat.completions.create({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });

    let raw = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) raw += content;
    }

    let questions = await parseAIResponse(raw);

    // Create or update a record in candidate_Post_Step_Progress after generating the questions
    try {
      // Retrieve all steps of the post
      const postStepsService = require("./postStepsService");
      const allPostStepsResult = await postStepsService.getPostStepsByPostId(
        post._id
      );

      if (!allPostStepsResult.success) {
        console.error("Error retrieving post steps:", allPostStepsResult.error);
        return { questions, totalQuestions: questions.length };
      }

      const allPostSteps = allPostStepsResult.data;

      // Check if a progress record already exists for this candidate and this post
      const existingProgress =
        await candidatePostStepProgressService.getProgressByCandidateAndPost(
          user._id,
          post._id
        );

      if (existingProgress.success && existingProgress.data) {
        // Record exists, add missing steps
        const existingStepIds = existingProgress.data.steps.map((step) => {
          // Handle populated stepId or ObjectId
          return step.stepId && step.stepId._id
            ? step.stepId._id.toString()
            : step.stepId.toString();
        });

        // Create a list of new steps to add
        const newStepsToAdd = [];
        allPostSteps.forEach((step, index) => {
          if (!existingStepIds.includes(step._id.toString())) {
            // If this is the first added step and there is no step inProgress yet, mark it as inProgress
            const hasInProgressStep = existingProgress.data.steps.some(
              (s) => s.status === "inProgress"
            );
            const isFirstNewStep = existingProgress.data.steps.length === 0;

            newStepsToAdd.push({
              stepId: step._id,
              status:
                isFirstNewStep || !hasInProgressStep ? "inProgress" : "pending",
              completedAt: null,
            });
          }
        });

        // Add only new steps to avoid duplicates
        if (newStepsToAdd.length > 0) {
          // Sanitize existing steps (replace populated documents with their _id)
          const sanitizedExistingSteps = existingProgress.data.steps.map(
            (s) => ({
              stepId: s.stepId && s.stepId._id ? s.stepId._id : s.stepId,
              interviewDetails:
                s.interviewDetails && s.interviewDetails._id
                  ? s.interviewDetails._id
                  : s.interviewDetails || null,
              status: s.status,
              completedAt: s.completedAt || null,
            })
          );

          // Combine existing steps with the new ones
          const allSteps = [...sanitizedExistingSteps, ...newStepsToAdd];

          // Update the record
          const updateResult =
            await candidatePostStepProgressService.updateProgress(
              existingProgress.data._id,
              { steps: allSteps }
            );

          if (!updateResult.success) {
            console.error("Error updating progress:", updateResult.error);
          }
        }
      } else {
        // Create a new record with all steps of the post
        const allStepsData = allPostSteps.map((step, index) => ({
          stepId: step._id,
          status: index === 0 ? "inProgress" : "pending", // First step = inProgress, others = pending
          completedAt: null,
        }));

        const progressData = {
          idCandidate: user._id, // Candidate ID (logged-in user)
          idPost: post._id, // Post ID
          currentStep: postStep._id, // Current step ID
          steps: allStepsData, // All steps of the post
          InterviewDetails: null, // To adapt according to your logic
        };

        const progressResult =
          await candidatePostStepProgressService.createProgress(progressData);
        if (!progressResult.success) {
          console.error("Error creating progress:", progressResult.error);
        }
      }
    } catch (progressError) {
      console.error(
        "Error creating/updating the progress record:",
        progressError
      );
      // Do not fail the main request for this error
    }

    return { questions, totalQuestions: questions.length };
  } catch (error) {
    console.error("Error generating post step questions:", error);
    if (error instanceof HttpError) throw error;

    throw new HttpError(500, `Internal server error: ${error}`);
  }
};

exports.analyseQuestions = async ({ questions, postStep, user }) => {
  try {
    const stepType = postStep.data.type;

    let systemPrompt = "";
    let userPrompt = "";

    if (stepType == "interview") {
      // refers to an hrInterview
      systemPrompt =
        evaluationPrompts.analyzeHRAnswersPrompts.getSystemPrompt();
      userPrompt =
        evaluationPrompts.analyzeHRAnswersPrompts.getUserPrompt(questions);
    } else if (stepType == "soft") {
      systemPrompt =
        evaluationPrompts.analyzeHRAnswersPrompts.getSystemPrompt();
      userPrompt =
        evaluationPrompts.analyzeHRAnswersPrompts.getUserPrompt(questions);
    } else if (stepType == "technical") {
      systemPrompt =
        evaluationPrompts.analyzeJobTestResultsPrompts.getSystemPrompt();

      const post = await Post.findById(postStep.postId);
      if (!post) {
        throw new HttpError(404, "Post not found in the DB");
      }

      const jobSkills = post.skillAnalysis?.requiredSkills || [];
      if (!Array.isArray(jobSkills) || jobSkills.length === 0) {
        throw new HttpError(400, "Post has no requiredSkills");
      }

      const requiredSkills = jobSkills.map((s) => ({
        name: s.name,
        proficiencyLevel: s.proficiencyLevel ?? s.level ?? s.requiredLevel,
      }));

      userPrompt = evaluationPrompts.analyzeJobTestResultsPrompts.getUserPrompt(
        requiredSkills,
        questions
      );
    }

    const stream = await together.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2048,
      temperature: 0.3,
      stream: true,
    });

    let raw = "";
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) raw += content;
    }

    // I. parse AI response
    let analysis = await parseAIResponse(raw);

    console.log("old value", analysis.overallScore);
    if (stepType !== "technical") {
      analysis.overallScore = handleHROverallScore(analysis.skillAnalysis);
      console.log("new value", analysis.overallScore);
    }
    const profile = await Profile.findById(user.profile);

    if (!profile) throw new HttpError(404, "No profile found for this user.");

    const jobId = postStep.postId;

    const interviewDetailsId = await saveInterviewDetailsForJob(
      profile,
      analysis.overallScore,
      analysis.skillAnalysis,
      jobId,
      analysis.recommendations,
      questions
    );
    console.log("interviewDetailsId", interviewDetailsId);
    // Update the status of steps in candidate_Post_Step_Progress after the analysis
    try {
      // Retrieve the progress record for this candidate and this post
      const existingProgress =
        await candidatePostStepProgressService.getProgressByCandidateAndPost(
          user._id,
          jobId
        );

      if (existingProgress.success && existingProgress.data) {
        const progress = existingProgress.data;

        // Find the index of the current step (handle populated stepId or ObjectId)
        const normalizeId = (val) =>
          val && val._id ? val._id.toString() : val ? val.toString() : "";
        const currentStepIndex = progress.steps.findIndex(
          (step) => normalizeId(step.stepId) === normalizeId(postStep._id)
        );

        if (currentStepIndex !== -1) {
          // Mark the current step as 'done'
          progress.steps[currentStepIndex].status = "done";
          progress.steps[currentStepIndex].completedAt = new Date();
          // Link the created interview to this step
          if (interviewDetailsId) {
            progress.steps[currentStepIndex].interviewDetails =
              interviewDetailsId;
          }

          // Mark the next step as 'inProgress' if it exists
          if (currentStepIndex + 1 < progress.steps.length) {
            progress.steps[currentStepIndex + 1].status = "inProgress";
            progress.steps[currentStepIndex + 1].completedAt = null;

            // Update currentStep to the next step
            progress.currentStep = progress.steps[currentStepIndex + 1].stepId;
          }

          // Sanitize before updating (avoid sending populated documents)
          const sanitizedSteps = progress.steps.map((s) => ({
            stepId: s.stepId && s.stepId._id ? s.stepId._id : s.stepId,
            interviewDetails:
              s.interviewDetails && s.interviewDetails._id
                ? s.interviewDetails._id
                : s.interviewDetails || null,
            status: s.status,
            completedAt: s.completedAt || null,
          }));
          const sanitizedCurrentStep =
            progress.currentStep && progress.currentStep._id
              ? progress.currentStep._id
              : progress.currentStep;

          // Update the record
          const updateResult =
            await candidatePostStepProgressService.updateProgress(
              progress._id,
              {
                steps: sanitizedSteps,
                currentStep: sanitizedCurrentStep,
                updatedAt: new Date(),
              }
            );

          if (!updateResult.success) {
            console.error(
              "Error updating progress after analysis:",
              updateResult.error
            );
          }
        }
      }
    } catch (progressError) {
      console.error("Error updating progress after analysis:", progressError);
      // Do not fail the main request for this error
    }

  const company = await profileService.getProfileByPostId(jobId);
  const jobAssessmentResult = new JobAssessmentResult({
    timestamp: new Date(),
    assessmentType: "job",
    jobId,
    condidateId: profile._id,
    companyId: company._id,
    numberOfQuestions: questions.length,
    analysis,
    interviewId: interviewDetailsId,
  });

  await jobAssessmentResult.save();

  if (!Array.isArray(company.assessmentResults)) company.assessmentResults = [];
  company.assessmentResults.push(jobAssessmentResult._id);
  await company.save();

  await InterviewDetails.findByIdAndUpdate(interviewDetailsId, {
    $set: { jobAssessmentResult: jobAssessmentResult._id },
  });

  // IX. Update quota
  profile.quota++;

  // X. update profile with interview details
  if (!profile.interviewDetails) {
    profile.interviewDetails = [];
  }
    profile.interviewDetails.push(interviewDetailsId);
    await profile.save();

    return { analysis };
  } catch (error) {
    console.error("Error analysing questions:", error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, `Internal server error: ${error}`);
  }
};
