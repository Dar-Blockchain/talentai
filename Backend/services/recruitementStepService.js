const { Together } = require("together-ai");
require("dotenv").config();

const { HttpError } = require("../utils/httpUtils");
const { parseAIResponse } = require("../parsers/AIResponseParser");
const Post = require("../models/PostModel");
const { handleHROverallScore, saveInterviewDetailsForJob } = require("../utils/evaluationUtils");
const candidatePostStepProgressService = require("./candidatePostStepProgressService");

const {
  generateHRStepQuestionsPrompts,
  generateSoftSkillStepQuestionsPrompts,
  generateTechnicalSkillStepQuestionsPrompts,
} = require("../prompts/recruitementStepPrompts");

const evaluationPrompts = require("../prompts/evaluationPrompts");
const Profile = require("../models/ProfileModel");
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

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

    // Créer ou mettre à jour un enregistrement dans candidate_Post_Step_Progress après la génération des questions
    try {
      // Récupérer tous les steps du post
      const postStepsService = require('./postStepsService');
      const allPostStepsResult = await postStepsService.getPostStepsByPostId(post._id);
      
      if (!allPostStepsResult.success) {
        console.error('Erreur lors de la récupération des steps du post:', allPostStepsResult.error);
        return { questions, totalQuestions: questions.length };
      }
      
      const allPostSteps = allPostStepsResult.data;
      
      // Vérifier si un enregistrement de progression existe déjà pour ce candidat et ce post
      const existingProgress = await candidatePostStepProgressService.getProgressByCandidateAndPost(user._id, post._id);
      
      if (existingProgress.success && existingProgress.data) {
        // L'enregistrement existe, ajouter les steps manquants
        const existingStepIds = existingProgress.data.steps.map(step => {
          // Gérer stepId peuplé ou ObjectId
          return step.stepId && step.stepId._id ? step.stepId._id.toString() : step.stepId.toString();
        });
        
        // Créer une liste des nouveaux steps à ajouter
        const newStepsToAdd = [];
        allPostSteps.forEach((step, index) => {
          if (!existingStepIds.includes(step._id.toString())) {
            // Si c'est le premier step ajouté et qu'il n'y a pas encore de step inProgress, le marquer comme inProgress
            const hasInProgressStep = existingProgress.data.steps.some(s => s.status === 'inProgress');
            const isFirstNewStep = existingProgress.data.steps.length === 0;
            
            newStepsToAdd.push({
              stepId: step._id,
              status: (isFirstNewStep || !hasInProgressStep) ? 'inProgress' : 'pending',
              completedAt: null
            });
          }
        });
        
        // Ajouter seulement les nouveaux steps pour éviter les doublons
        if (newStepsToAdd.length > 0) {
          // Assainir les steps existants (remplacer les documents peuplés par leurs _id)
          const sanitizedExistingSteps = existingProgress.data.steps.map(s => ({
            stepId: s.stepId && s.stepId._id ? s.stepId._id : s.stepId,
            interviewDetails: s.interviewDetails && s.interviewDetails._id ? s.interviewDetails._id : (s.interviewDetails || null),
            status: s.status,
            completedAt: s.completedAt || null,
          }));

          // Combiner les steps existants avec les nouveaux
          const allSteps = [...sanitizedExistingSteps, ...newStepsToAdd];

          // Mettre à jour l'enregistrement
          const updateResult = await candidatePostStepProgressService.updateProgress(
            existingProgress.data._id,
            { steps: allSteps }
          );
          
          if (!updateResult.success) {
            console.error('Erreur lors de la mise à jour du progrès:', updateResult.error);
          }
        }
             } else {
         // Créer un nouvel enregistrement avec tous les steps du post
         const allStepsData = allPostSteps.map((step, index) => ({
           stepId: step._id,
           status: index === 0 ? 'inProgress' : 'pending', // Premier step = inProgress, autres = pending
           completedAt: null
         }));
         
         const progressData = {
           idCandidate: user._id, // ID du candidat (utilisateur connecté)
           idPost: post._id, // ID du post
           currentStep: postStep._id, // ID de l'étape courante
           steps: allStepsData, // Tous les steps du post
           InterviewDetails: null // À adapter selon votre logique
         };
        
        const progressResult = await candidatePostStepProgressService.createProgress(progressData);
        if (!progressResult.success) {
          console.error('Erreur lors de la création du progrès:', progressResult.error);
        }
      }
    } catch (progressError) {
      console.error('Erreur lors de la création/mise à jour de l\'enregistrement de progression:', progressError);
      // Ne pas faire échouer la requête principale pour cette erreur
    }

    return { questions, totalQuestions: questions.length };
  } catch (error) {
    console.error("Error generating post step questions:", error);
    if (error instanceof HttpError) throw error;

    throw new HttpError(500, `Internal server error: ${error}`);
  }
};

exports.analyseQuestions = async ({ questions, postStep ,user}) => {
  try {
    const stepType = postStep.data.type;
    let systemPrompt = "";
    let userPrompt = "";

    if (stepType == "interview") {
      // refers to an hrInterview
      systemPrompt = evaluationPrompts.analyzeHRAnswersPrompts.getSystemPrompt();
      userPrompt = evaluationPrompts.analyzeHRAnswersPrompts.getUserPrompt(questions);

    } else if (stepType == "soft") {
      systemPrompt = evaluationPrompts.analyzeHRAnswersPrompts.getSystemPrompt();
      userPrompt = evaluationPrompts.analyzeHRAnswersPrompts.getUserPrompt(questions);
    } else if (stepType == "technical") {
      systemPrompt = evaluationPrompts.analyzeJobTestResultsPrompts.getSystemPrompt();

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

    if (!profile)
      throw new HttpError(404, "Aucun profil trouvé pour cet utilisateur.");
    
    const jobId = postStep.postId;

    const interviewDetailsId = await saveInterviewDetailsForJob(
      profile,
      analysis.overallScore,
      analysis.skillAnalysis,
      jobId,
      analysis.recommendations,
      questions
    );
console.log("interviewDetailsId",interviewDetailsId)
    // Mettre à jour le statut des steps dans candidate_Post_Step_Progress après l'analyse
    try {
      // Récupérer l'enregistrement de progression pour ce candidat et ce post
      const existingProgress = await candidatePostStepProgressService.getProgressByCandidateAndPost(user._id, jobId);
      
      if (existingProgress.success && existingProgress.data) {
        const progress = existingProgress.data;
        
        // Trouver l'index du step actuel (gérer stepId peuplé ou ObjectId)
        const normalizeId = (val) => (val && val._id ? val._id.toString() : val ? val.toString() : '');
        const currentStepIndex = progress.steps.findIndex(step => 
          normalizeId(step.stepId) === normalizeId(postStep._id)
        );
        
        if (currentStepIndex !== -1) {
          // Marquer le step actuel comme 'done'
          progress.steps[currentStepIndex].status = 'done';
          progress.steps[currentStepIndex].completedAt = new Date();
          // Lier l'entretien créé à ce step
          if (interviewDetailsId) {
            progress.steps[currentStepIndex].interviewDetails = interviewDetailsId;
          }
          
          // Marquer le step suivant comme 'inProgress' s'il existe
          if (currentStepIndex + 1 < progress.steps.length) {
            progress.steps[currentStepIndex + 1].status = 'inProgress';
            progress.steps[currentStepIndex + 1].completedAt = null;
            
            // Mettre à jour le currentStep vers le step suivant
            progress.currentStep = progress.steps[currentStepIndex + 1].stepId;
          }
          
          // Assainir avant mise à jour (éviter d'envoyer des documents peuplés)
          const sanitizedSteps = progress.steps.map(s => ({
            stepId: s.stepId && s.stepId._id ? s.stepId._id : s.stepId,
            interviewDetails: s.interviewDetails && s.interviewDetails._id ? s.interviewDetails._id : (s.interviewDetails || null),
            status: s.status,
            completedAt: s.completedAt || null,
          }));
          const sanitizedCurrentStep = progress.currentStep && progress.currentStep._id ? progress.currentStep._id : progress.currentStep;

          // Mettre à jour l'enregistrement
          const updateResult = await candidatePostStepProgressService.updateProgress(
            progress._id,
            { 
              steps: sanitizedSteps,
              currentStep: sanitizedCurrentStep,
              updatedAt: new Date()
            }
          );
          
          if (!updateResult.success) {
            console.error('Erreur lors de la mise à jour du progrès après analyse:', updateResult.error);
          }
        }
      }
    } catch (progressError) {
      console.error('Erreur lors de la mise à jour du progrès après analyse:', progressError);
      // Ne pas faire échouer la requête principale pour cette erreur
    }

    return { analysis };
  } catch (error) {
    console.error("Error analysing questions:", error);
    if (error instanceof HttpError) throw error;
    throw new HttpError(500, `Internal server error: ${error}`);
  }
};

