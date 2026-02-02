/**
 * Pipeline Interview Controller
 * Handles fetching interview configuration from pipeline steps
 */

const Post = require('../../models/Post.model');
const PostSteps = require('../../models/postSteps.model');
const pipelineConfigBuilder = require('../../services/InterviewServices/pipelineInterviewConfigBuilder');

/**
 * Get interview parameters for a specific pipeline step
 * GET /api/pipeline-interview/params/:jobId/:stepNumber
 */
exports.getInterviewParamsForStep = async (req, res) => {
  try {
    const { jobId, stepNumber } = req.params;

    console.log(`📋 Fetching interview params for job ${jobId}, step ${stepNumber}`);

    // 1. Fetch job/post details
    const post = await Post.findById(jobId).select('title companyName');
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // 2. Get all pipeline steps for this job
    const steps = await PostSteps.find({ postId: jobId }).sort({ 'data.config.nodeNumber': 1 });
    if (!steps || steps.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pipeline steps found for this job'
      });
    }

    // 3. Find the specific step by stepNumber
    const targetStep = steps.find(step => step.data.config.nodeNumber === parseInt(stepNumber));
    if (!targetStep) {
      return res.status(404).json({
        success: false,
        message: `Step ${stepNumber} not found in pipeline`
      });
    }

    // 4. Verify step is an interview-type node
    const interviewNodeTypes = ['technical', 'soft', 'interview'];
    if (!interviewNodeTypes.includes(targetStep.data.type)) {
      return res.status(400).json({
        success: false,
        message: `Step ${stepNumber} is not an interview node (type: ${targetStep.data.type})`
      });
    }

    // 5. Build interview parameters from node config
    const jobDetails = {
      companyName: post.companyName,
      title: post.title
    };

    const interviewParams = pipelineConfigBuilder.buildParamsFromNode(targetStep, jobDetails);
    const queryString = pipelineConfigBuilder.buildQueryString(interviewParams);

    // 6. Build response with metadata
    const response = {
      success: true,
      data: {
        stepId: targetStep._id,
        stepNumber: targetStep.data.config.nodeNumber,
        stepType: targetStep.data.type,
        stepTitle: targetStep.data.label || `Step ${stepNumber}`,
        interviewParams: interviewParams,
        queryString: queryString,
        fullUrl: `/interview/hr?${queryString}&jobId=${jobId}&stepNumber=${stepNumber}&source=pipeline`,
        jobDetails: {
          jobId: post._id,
          title: post.title,
          company: post.companyName
        },
        // Info about next step (if exists)
        hasNextStep: steps.length > parseInt(stepNumber),
        totalSteps: steps.length
      }
    };

    console.log(`✅ Successfully built interview params for step ${stepNumber}`);
    return res.status(200).json(response);

  } catch (error) {
    console.error('❌ Error fetching pipeline interview params:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch interview parameters',
      error: error.message
    });
  }
};

/**
 * Get all interview steps for a job (for navigation/preview)
 * GET /api/pipeline-interview/steps/:jobId
 */
exports.getInterviewSteps = async (req, res) => {
  try {
    const { jobId } = req.params;

    console.log(`📋 Fetching all interview steps for job ${jobId}`);

    const post = await Post.findById(jobId).select('title companyName');
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    const steps = await PostSteps.find({ postId: jobId }).sort({ 'data.config.nodeNumber': 1 });

    // Filter only interview-type nodes
    const interviewSteps = steps
      .filter(step => ['technical', 'soft', 'interview'].includes(step.data.type))
      .map(step => ({
        stepId: step._id,
        stepNumber: step.data.config.nodeNumber,
        stepType: step.data.type,
        stepTitle: step.data.label || `Step ${step.data.config.nodeNumber}`,
        configured: step.data.config?.configured || false
      }));

    return res.status(200).json({
      success: true,
      data: {
        jobId: post._id,
        jobTitle: post.title,
        company: post.companyName,
        totalSteps: steps.length,
        interviewSteps: interviewSteps,
        interviewCount: interviewSteps.length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching interview steps:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch interview steps',
      error: error.message
    });
  }
};
