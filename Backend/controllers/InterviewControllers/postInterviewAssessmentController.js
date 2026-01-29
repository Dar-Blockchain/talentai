const postInterviewAssessmentService = require("../../services/InterviewServices/postInterviewAssessmentService");
const CandidatePostStepProgress = require("../../models/CandidatePostStepProgress");
const PostSteps = require("../../models/postStepsModel");
const Profile = require("../../models/ProfileModel");

// ========== CREATE ==========
module.exports.createPostInterviewAssessment = async (req, res) => {
  try {
    const assessmentData = req.body;
    assessmentData.candidate = req.user._id;
    // Validation
    if (!assessmentData.post) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: post, candidate (company will be extracted from post)'
      });
    }

    const assessment = await postInterviewAssessmentService.createPostInterviewAssessment(assessmentData);

    // Incrémenter le quota du profil candidat après création de l'évaluation
    try {
      await Profile.findOneAndUpdate(
        { userId: req.user._id },
        { $inc: { quota: 1 }, $set: { quotaUpdatedAt: new Date() } },
        { new: true }
      );
    } catch (quotaErr) {
      console.error('Erreur lors de l\'incrémentation du quota :', quotaErr);
      // Ne pas échouer la création si l'incrémentation du quota échoue
    }

    // 🔥 NEW: Auto-move to next step if post contains PostSteps
    let progressUpdate = null;
    try {
      let postSteps = await PostSteps.find({ postId: assessmentData.post });

      // Ensure deterministic ordering by nodeNumber to avoid picking the wrong "first" step
      postSteps = postSteps.sort((a, b) => {
        const na = a?.data?.config?.nodeNumber ?? 0;
        const nb = b?.data?.config?.nodeNumber ?? 0;
        return na - nb;
      });

      if (postSteps && postSteps.length > 0) {
        console.log(`📋 Post ${assessmentData.post} contains ${postSteps.length} steps. Auto-moving to next step...`);
        
        // Identify interview steps first (needed for both init and update)
        const interviewSteps = postSteps.filter(step => ['technical', 'soft', 'interview'].includes(step.data.type));
        const firstInterviewStep = interviewSteps.length > 0 ? interviewSteps[0] : null;
        const nextInterviewStep = firstInterviewStep ? interviewSteps.find(step => step.data.config.nodeNumber > firstInterviewStep.data.config.nodeNumber) : null;

        // Try to get existing progress
        let progress = await CandidatePostStepProgress.findOne({
          idCandidate: req.user._id,
          idPost: assessmentData.post
        }).populate('currentStep');

        if (!progress) {
          // CREATE: Initialize new progress with first step done
          if (firstInterviewStep) {
            const currentStepId = nextInterviewStep ? nextInterviewStep._id : firstInterviewStep._id;
            progress = await CandidatePostStepProgress.create({
              idCandidate: req.user._id,
              idPost: assessmentData.post,
              currentStep: currentStepId,
              steps: postSteps.map(step => {
                if (step._id.equals(firstInterviewStep._id)) {
                  return {
                    stepId: step._id,
                    status: 'done',
                    interviewDetails: assessment._id,
                    passed: null,
                    finalScore: null,
                    attempts: 1,
                    completedAt: new Date()
                  };
                } else if (nextInterviewStep && step._id.equals(nextInterviewStep._id)) {
                  return {
                    stepId: step._id,
                    status: 'inProgress',
                    interviewDetails: null,
                    passed: null,
                    finalScore: null,
                    attempts: 0,
                    completedAt: null
                  };
                } else {
                  return {
                    stepId: step._id,
                    status: 'pending',
                    interviewDetails: null,
                    passed: null,
                    finalScore: null,
                    attempts: 0,
                    completedAt: null
                  };
                }
              })
            });
            await progress.populate('currentStep');
            if (nextInterviewStep) {
              console.log(`✅ First step completed, moving to next step: ${nextInterviewStep.data.config.nodeNumber}`);
            } else {
              console.log(`✅ Only one interview step, pipeline complete after this step`);
            }
          }
        } else {
          // Update current step status and move to next using an atomic DB update to avoid races
          const currentStepId = progress.currentStep._id;
          const currentStepNumber = progress.currentStep.data.config.nodeNumber;
          const nextInterviewStep = postSteps.find(step =>
            step.data.config.nodeNumber > currentStepNumber &&
            ['technical', 'soft', 'interview'].includes(step.data.type)
          );

          const filter = { _id: progress._id, currentStep: currentStepId };
          const update = {
            $set: {
              'steps.$[cur].status': 'done',
              'steps.$[cur].interviewDetails': assessment._id,
              'steps.$[cur].completedAt': new Date(),
              currentStep: nextInterviewStep ? nextInterviewStep._id : currentStepId
            },
            $inc: { 'steps.$[cur].attempts': 1 }
          };

          const arrayFilters = [{ 'cur.stepId': currentStepId }];
          if (nextInterviewStep) {
            update.$set['steps.$[next].status'] = 'inProgress';
            arrayFilters.push({ 'next.stepId': nextInterviewStep._id });
          }

          const updated = await CandidatePostStepProgress.findOneAndUpdate(filter, update, {
            new: true,
            arrayFilters,
            runValidators: true
          }).populate('currentStep');

          if (updated) {
            progress = updated;
            if (nextInterviewStep) {
              console.log(`✅ Moving to next step: ${nextInterviewStep.data.config.nodeNumber}`);
            } else {
              console.log(`✅ No more interview steps, pipeline complete`);
            }
          } else {
            // Fallback: if update didn't match (race or mismatch), refresh progress and try in-memory update
            await progress.populate('currentStep');
            const currentStepProgress = progress.steps.find(s => s.stepId.equals(progress.currentStep._id));
            if (currentStepProgress && !currentStepProgress.interviewDetails) {
              currentStepProgress.status = 'done';
              currentStepProgress.interviewDetails = assessment._id;
              currentStepProgress.attempts = (currentStepProgress.attempts || 0) + 1;
              currentStepProgress.completedAt = new Date();

              const nextStep = postSteps.find(step =>
                step.data.config.nodeNumber > progress.currentStep.data.config.nodeNumber &&
                ['technical', 'soft', 'interview'].includes(step.data.type)
              );
              if (nextStep) {
                progress.currentStep = nextStep._id;
                const nextStepIndex = progress.steps.findIndex(s => s.stepId.equals(nextStep._id));
                if (nextStepIndex !== -1) progress.steps[nextStepIndex].status = 'inProgress';
              }

              await progress.save();
              await progress.populate('currentStep');
            } else {
              console.log('⚠️ Current step already completed or not found — skipping advancement');
            }
          }
        }

        progressUpdate = progress;
      }
    } catch (progressError) {
      console.error('⚠️ Warning: Could not auto-move to next step:', progressError.message);
      // Don't fail the request, just log the warning
    }

    res.status(201).json({
      success: true,
      message: 'Post interview assessment created successfully',
      data: assessment,
      progressUpdate: progressUpdate || null
    });
  } catch (error) {
    console.error('Error creating post interview assessment:', error);
    
    // Handle duplicate key error (E11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An assessment with this session ID already exists.',
        code: 'DUPLICATE_SESSION_ID'
      });
    }
    
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error creating post interview assessment'
    });
  }
};

// ========== READ - Get all assessments ==========
module.exports.getAllPostInterviewAssessments = async (req, res) => {
  try {
    const { page = 1, limit = 10, post, candidate, company } = req.query;

    const filters = {};
    if (post) filters.post = post;
    if (candidate) filters.candidate = candidate;
    if (company) filters.company = company;

    const result = await postInterviewAssessmentService.getAllPostInterviewAssessments(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: 'All assessments retrieved successfully',
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error getting all assessments:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error retrieving assessments'
    });
  }
};

// ========== READ - Get by ID ==========
module.exports.getPostInterviewAssessmentById = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID is required'
      });
    }

    const assessment = await postInterviewAssessmentService.getPostInterviewAssessmentById(assessmentId);

    res.status(200).json({
      success: true,
      message: 'Post interview assessment retrieved successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error getting post interview assessment:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error retrieving assessment'
    });
  }
};

// ========== READ - Get all for a post ==========
module.exports.getAssessmentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const filters = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const assessments = await postInterviewAssessmentService.getAssessmentsByPost(postId, filters);

    res.status(200).json({
      success: true,
      message: 'Assessments retrieved successfully',
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    console.error('Error getting assessments by post:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error retrieving assessments'
    });
  }
};

// ========== READ - Get all for a candidate ==========
module.exports.getAssessmentsByCandidate = async (req, res) => {
  try {
    const candidateId = req.user._id;

    const filters = req.query;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID is required'
      });
    }

    const assessments = await postInterviewAssessmentService.getAssessmentsByCandidate(candidateId, filters);

    // Enrich assessments with CandidatePostStepProgress
    const enrichedAssessments = await Promise.all(
      assessments.map(async (assessment) => {
        const progress = await CandidatePostStepProgress.findOne({
          idCandidate: req.user._id,
          idPost: assessment.post
        }).populate('currentStep').populate('steps.interviewDetails');

        return {
          assessment: assessment,
          candidatePostStepProgress: progress
        };
      })
    );

    res.status(200).json({
      success: true,
      message: 'Assessments retrieved successfully',
      count: enrichedAssessments.length,
      data: enrichedAssessments
    });
  } catch (error) {
    console.error('Error getting assessments by candidate:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error retrieving assessments'
    });
  }
};

// ========== READ - Get all for authenticated company ==========
module.exports.getAllPostInterviewAssessmentsForCompany = async (req, res) => {
  try {
    const companyId = req.user._id;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }

    const assessments = await postInterviewAssessmentService.getAssessmentsByCompany(companyId);

    res.status(200).json({
      success: true,
      message: 'Assessments retrieved successfully',
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    console.error('Error getting assessments by company:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error retrieving assessments'
    });
  }
};

// ========== UPDATE - Update assessment ==========
module.exports.updatePostInterviewAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const updateData = req.body;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID is required'
      });
    }

    const assessment = await postInterviewAssessmentService.updatePostInterviewAssessment(assessmentId, updateData);

    res.status(200).json({
      success: true,
      message: 'Post interview assessment updated successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error updating post interview assessment:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error updating assessment'
    });
  }
};

// ========== UPDATE - Update interview data ==========
module.exports.updateInterviewData = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const interviewData = req.body;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID is required'
      });
    }

    const assessment = await postInterviewAssessmentService.updateInterviewData(assessmentId, interviewData);

    res.status(200).json({
      success: true,
      message: 'Interview data updated successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error updating interview data:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error updating interview data'
    });
  }
};

// ========== DELETE - Delete assessment ==========
module.exports.deletePostInterviewAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID is required'
      });
    }

    const result = await postInterviewAssessmentService.deletePostInterviewAssessment(assessmentId);

    res.status(200).json({
      success: true,
      message: 'Post interview assessment deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting post interview assessment:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error deleting assessment'
    });
  }
};

// ========== DELETE - Delete all for a post ==========
module.exports.deleteAssessmentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const result = await postInterviewAssessmentService.deleteAssessmentsByPost(postId);

    res.status(200).json({
      success: true,
      message: 'Assessments deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting assessments by post:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error deleting assessments'
    });
  }
};

// ========== ANALYTICS - Get statistics ==========
module.exports.getAssessmentStatistics = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const stats = await postInterviewAssessmentService.getAssessmentStatistics(postId);

    res.status(200).json({
      success: true,
      message: 'Assessment statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting assessment statistics:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error retrieving statistics'
    });
  }
};

// ========== SEARCH ==========
module.exports.searchAssessments = async (req, res) => {
  try {
    const searchCriteria = req.query;

    const assessments = await postInterviewAssessmentService.searchAssessments(searchCriteria);

    res.status(200).json({
      success: true,
      message: 'Assessments search completed',
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    console.error('Error searching assessments:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error searching assessments'
    });
  }
};
