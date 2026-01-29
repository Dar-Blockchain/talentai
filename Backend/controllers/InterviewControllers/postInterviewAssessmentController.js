const postInterviewAssessmentService = require("../../services/InterviewServices/postInterviewAssessmentService");
const CandidatePostStepProgress = require("../../models/CandidatePostStepProgress");
const PostSteps = require("../../models/postStepsModel");
const Profile = require("../../models/ProfileModel");

// ========== CREATE ==========
module.exports.createPostInterviewAssessment = async (req, res) => {
  try {
    const assessmentData = req.body;
    assessmentData.candidate = req.user._id;

    // =======================
    // VALIDATION
    // =======================
    if (!assessmentData.post) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: post'
      });
    }

    // =======================
    // CREATE ASSESSMENT
    // =======================
    const assessment =
      await postInterviewAssessmentService.createPostInterviewAssessment(
        assessmentData
      );

    // =======================
    // INCREMENT CANDIDATE QUOTA
    // =======================
    try {
      await Profile.findOneAndUpdate(
        { userId: req.user._id },
        { $inc: { quota: 1 }, $set: { quotaUpdatedAt: new Date() } }
      );
    } catch (quotaErr) {
      console.error('⚠️ Quota update failed:', quotaErr.message);
    }

    // =======================
    // PIPELINE PROGRESSION
    // =======================
    let progressUpdate = null;

    try {
      let postSteps = await PostSteps.find({ postId: assessmentData.post });

      // Sort by nodeNumber
      postSteps.sort((a, b) => {
        const na = a?.data?.config?.nodeNumber ?? 0;
        const nb = b?.data?.config?.nodeNumber ?? 0;
        return na - nb;
      });

      if (!postSteps.length) {
        throw new Error('No post steps found');
      }

      const interviewSteps = postSteps.filter(step =>
        ['technical', 'soft', 'interview'].includes(step.data.type)
      );

      if (!interviewSteps.length) {
        throw new Error('No interview steps found');
      }

      // =======================
      // LOAD PROGRESS
      // =======================
      let progress = await CandidatePostStepProgress
        .findOne({
          idCandidate: req.user._id,
          idPost: assessmentData.post
        })
        .populate('currentStep');

      // =======================
      // CASE 1: NO PROGRESS YET
      // =======================
      if (!progress) {
        const firstStep = interviewSteps[0];
        const nextStep = interviewSteps[1] || null;

        progress = await CandidatePostStepProgress.create({
          idCandidate: req.user._id,
          idPost: assessmentData.post,
          currentStep: nextStep ? nextStep._id : firstStep._id,
          steps: postSteps.map(step => {
            if (step._id.equals(firstStep._id)) {
              return {
                stepId: step._id,
                status: 'done',
                interviewDetails: assessment._id,
                attempts: 1,
                completedAt: new Date()
              };
            }

            if (nextStep && step._id.equals(nextStep._id)) {
              return {
                stepId: step._id,
                status: 'inProgress'
              };
            }

            return {
              stepId: step._id,
              status: 'pending'
            };
          })
        });

        progress = await progress.populate('currentStep');
        progressUpdate = progress;
      }

      // =======================
      // CASE 2: PROGRESS EXISTS
      // =======================
      else {
        const currentStepId = progress.currentStep._id;
        const currentStepNumber =
          progress.currentStep.data.config.nodeNumber;

        const nextInterviewStep = interviewSteps.find(step =>
          step.data.config.nodeNumber > currentStepNumber
        );

        // 1️⃣ Mark current step as DONE
        await CandidatePostStepProgress.updateOne(
          {
            _id: progress._id,
            'steps.stepId': currentStepId
          },
          {
            $set: {
              'steps.$.status': 'done',
              'steps.$.interviewDetails': assessment._id,
              'steps.$.completedAt': new Date()
            },
            $inc: {
              'steps.$.attempts': 1
            }
          }
        );

        // 2️⃣ Activate next step
        if (nextInterviewStep) {
          await CandidatePostStepProgress.updateOne(
            {
              _id: progress._id,
              'steps.stepId': nextInterviewStep._id
            },
            {
              $set: {
                currentStep: nextInterviewStep._id,
                'steps.$.status': 'inProgress'
              }
            }
          );
        }

        progress = await CandidatePostStepProgress
          .findById(progress._id)
          .populate('currentStep');

        progressUpdate = progress;
      }
    } catch (progressError) {
      console.error(
        '⚠️ Pipeline progression failed:',
        progressError.message
      );
    }

    // =======================
    // RESPONSE
    // =======================
    return res.status(201).json({
      success: true,
      message: 'Post interview assessment created successfully',
      data: assessment,
      progressUpdate
    });

  } catch (error) {
    console.error('❌ Error creating post interview assessment:', error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An assessment with this session ID already exists',
        code: 'DUPLICATE_SESSION_ID'
      });
    }

    return res.status(error.status || 500).json({
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
