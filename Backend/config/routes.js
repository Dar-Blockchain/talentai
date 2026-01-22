/**
 * Routes Configuration
 * Centralized route registration
 */

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// Import all route modules
const authRouter = require('../routes/authenticationRouter');
const companyPermissionsRouter = require('../routes/companyPermissionsRouter');
const permissionsRouter = require('../routes/permissionsRouter');
const dashboardRouter = require('../routes/dashboardRouter');
const profileRouter = require('../routes/profileRouter');
const linkedinPostRouter = require('../routes/generateJobPostRouter');
const postRouter = require('../routes/postRouter');
const matchingRoutes = require('../routes/matchingRouter');
const todoRouter = require('../routes/todoRouter');
const feedbackRouter = require('../routes/feedbackRoutes');
const logRoutes = require('../routes/logRoutes');
// const interviewDetailsRouter = require('../routes/interviewDetailsRouter');
const InterviewAssessmentRoutes = require('../routes/InterviewAssessmentRoutes');
const postInterviewAssessmentRouter = require('../routes/postInterviewAssessmentRouter');
const notificationSystemRouter = require('../routes/notificationSystemRoutes');
const postStepsRouter = require('../routes/postStepsRouter');
const candidatePostStepProgressRouter = require('../routes/candidatePostStepProgressRouter');
const hederaToolsRouter = require('../routes/hederaToolsRouter');
const hcs11Router = require('../routes/hcs11Router');
const hrAgentRouter = require('../routes/hrAgentRouter');
const taskRouter = require('../routes/taskRouter');
const agentConfigRouter = require('../routes/agentConfigRouter');
const tokenRouter = require('../routes/tokenRouter');
const stripRouter = require('../routes/StripRouter');
const SkillInterviewAssessmentRoutes = require('../routes/SkillInterviewAssessmentRoutes');
const matchingConfigRoutes = require('../routes/matchingConfigRoutes');
const paymentRouter = require('../routes/paymentRouter');
const unlockCandidateRouter = require('../routes/unlockCandidateRouter');
const pipelineInterviewRoutes = require('../routes/pipelineInterviewRoutes');
const CompanyInvitationRouters = require('../routes/CompanyInvitationRouter');
const CompanyMembershipRoutes = require('../routes/CompanyMembershipRouter');
const chatRouter = require('../routes/chatRouter');

/**
 * Register all routes on the Express app
 * @param {Express} app - Express application instance
 */
function registerRoutes(app) {
  // API Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Authentication & Profile
  app.use('/auth', authRouter); //✅ authentication 
  app.use('/admin', companyPermissionsRouter); // ✅ (admin company permissions) -> admin (to be checked)
  app.use('/permissions', permissionsRouter); //✅ (general permissions management) -> permissions (to be checked)
  app.use('/dashboard', dashboardRouter); //✅ dashboard
  app.use('/profiles', profileRouter); //✅ profile management
  
  // Company Management
  app.use('/CompanyInvitation', CompanyInvitationRouters); // Company Invitation Management -> company-invitations
  app.use('/CompanyMembership', CompanyMembershipRoutes); // Company Membership Management -> company-memberships
  //app.use('/company-invitations', CompanyInvitationRouters); // Company Invitation Management
  //app.use('/company-memberships', CompanyMembershipRoutes); // Company Membership Management

  // Evaluation & Interview
  // app.use('/interviewDetails', interviewDetailsRouter);
  //app.use('/InterviewAssessment', InterviewAssessmentRoutes);
  app.use('/skill-interview-assessments', SkillInterviewAssessmentRoutes); //✅ Skill Interview Assessments -> skill-interview-assessments
  app.use('/post-interview-assessments', postInterviewAssessmentRouter); //✅   Post Interview Assessments -> post-interview-assessments

  // Posts & Jobs
  app.use('/linkedinPost', linkedinPostRouter); // LinkedIn Post Generation -> linkedin-post
  app.use('/post', postRouter); // Post Management -> posts
  app.use('/post-steps', postStepsRouter); //✅ Post Steps Management -> post-steps

  // Chat & Messaging
  app.use('/chat', chatRouter); // Chat functionalities chat -> chats (to be checked)

  // Matching & Recruitment
  app.use('/matching', matchingRoutes); // Matching Engine matching -> matchings
  app.use('/matchingConfig', matchingConfigRoutes); // Matching Configuration -> matching-configs

  // Notifications
  app.use('/notification-system', notificationSystemRouter); // Notification System -> notifications

  // Candidate Management
  app.use('/candidate-progress', candidatePostStepProgressRouter); //✅ Candidate Post Step Progress -> candidate-progress
  app.use('/unlock-candidate', unlockCandidateRouter); //✅ Unlock Candidate -> unlock-candidates

  // Blockchain & Web3
  app.use('/hedera-tools', hederaToolsRouter); //✅ Hedera Tools -> hedera-tools
  app.use('/api/hcs11', hcs11Router); //✅ HCS11 Integration -> api/hcs11

  // AI & Agents
  app.use('/hr-agents', hrAgentRouter); //✅ HR Agents Management -> hr-agents
  app.use('/agent-config', agentConfigRouter); //✅ Agent Configuration -> agent-configs

  // Utility & Management
  app.use('/todo', todoRouter); //✅ To-Do Management -> todos
  app.use('/feedback', feedbackRouter); // Feedback Management -> feedbacks
  app.use('/logs', logRoutes); //✅ System Logs Management -> logs
  app.use('/task', taskRouter); // Task Management -> tasks
  app.use('/tokens', tokenRouter); //✅ Token Management -> tokens

  // Payment & Billing
  app.use('/payment', paymentRouter); //✅ Payment Processing -> payments
  app.use('/api/stripe', stripRouter); //✅ Stripe Integration -> api/stripe

  // Pipeline Interview
  app.use('/api/pipeline-interview', pipelineInterviewRoutes); // Pipeline Interview Routes -> /interview-pipelines


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
