/**
 * Routes Configuration
 * Centralized route registration
 */

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// Import all route modules
const authRouter = require('../routes/authenticationRouter');
const companyPermissionsRouter = require('../routes/companyPermissionsRouter');
const dashboardRouter = require('../routes/dashboardRouter');
const profileRouter = require('../routes/profileRouter');
const evaluationRouter = require('../routes/evaluationRouter');
const linkedinPostRouter = require('../routes/generateJobPostRouter');
const postRouter = require('../routes/postRouter');
const matchingRoutes = require('../routes/matchingRouter');
const todoRouter = require('../routes/todoRouter');
const feedbackRouter = require('../routes/feedbackRoutes');
const logRoutes = require('../routes/logRoutes');
const interviewDetailsRouter = require('../routes/interviewDetailsRouter');
const InterviewAssessmentRoutes = require('../routes/InterviewAssessmentRoutes');
const notificationSystemRouter = require('../routes/notificationSystemRoutes');
const postStepsRouter = require('../routes/postStepsRouter');
const candidatePostStepProgressRouter = require('../routes/candidatePostStepProgressRouter');
const hederaToolsRouter = require('../routes/hederaToolsRouter');
const hcs11Router = require('../routes/hcs11Router');
const hrAgentRouter = require('../routes/hrAgentRouter');
const recruitementStepRouter = require('../routes/recruitementStepRouter');
const taskRouter = require('../routes/taskRouter');
const agentConfigRouter = require('../routes/agentConfigRouter');
const tokenRouter = require('../routes/tokenRouter');
const stripRouter = require('../routes/StripRouter');
const matchingConfigRoutes = require('../routes/matchingConfigRoutes');
const paymentRouter = require('../routes/paymentRouter');
const unlockCandidateRouter = require('../routes/unlockCandidateRouter');
const pipelineInterviewRoutes = require('../routes/pipelineInterviewRoutes');
const CompanyInvitationRouters = require('../routes/CompanyInvitationRouter');

/**
 * Register all routes on the Express app
 * @param {Express} app - Express application instance
 */
function registerRoutes(app) {
  // API Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Authentication & Profile
  app.use('/auth', authRouter);
  app.use('/admin', companyPermissionsRouter);
  app.use('/dashboard', dashboardRouter);
  app.use('/profiles', profileRouter);
  app.use('/CompanyInvitation', CompanyInvitationRouters);

  // Evaluation & Interview
  app.use('/evaluation', evaluationRouter);
  app.use('/interviewDetails', interviewDetailsRouter);
  app.use('/InterviewAssessment', InterviewAssessmentRoutes);

  // Posts & Jobs
  app.use('/linkedinPost', linkedinPostRouter);
  app.use('/post', postRouter);
  app.use('/post-steps', postStepsRouter);

  // Matching & Recruitment
  app.use('/matching', matchingRoutes);
  app.use('/matchingConfig', matchingConfigRoutes);
  app.use('/recruitementStep', recruitementStepRouter);

  // Notifications
  app.use('/notification-system', notificationSystemRouter);

  // Candidate Management
  app.use('/candidate-progress', candidatePostStepProgressRouter);
  app.use('/unlock-candidate', unlockCandidateRouter);

  // Blockchain & Web3
  app.use('/hedera-tools', hederaToolsRouter);
  app.use('/api/hcs11', hcs11Router);

  // AI & Agents
  app.use('/hr-agents', hrAgentRouter);
  app.use('/agent-config', agentConfigRouter);

  // Utility & Management
  app.use('/todo', todoRouter);
  app.use('/feedback', feedbackRouter);
  app.use('/logs', logRoutes);
  app.use('/task', taskRouter);
  app.use('/tokens', tokenRouter);

  // Payment & Billing
  app.use('/payment', paymentRouter);
  app.use('/api/stripe', stripRouter);

  // Pipeline Interview
  app.use('/api/pipeline-interview', pipelineInterviewRoutes);

  // Health check routes
  app.get('/', (req, res) => {
    res.json({ message: 'Bienvenue sur l\'API Express!' });
  });

  app.get('/some-route', (req, res) => {
    res.json('Route accessible');
  });
}

module.exports = {
  registerRoutes
};
