// Import all route modules
const authRouter = require("../routes/authentication.routes");
const companyPermissionsRouter = require("../routes/companyPermissions.routes");
const permissionsRouter = require("../routes/permissions.routes");
const dashboardRouter = require("../routes/dashboard.routes");
const profileRouter = require("../routes/profile.routes");
const postRouter = require("../routes/post.routes");
const todoRouter = require("../routes/todo.routes");
const feedbackRouter = require("../routes/feedback.routes");
const logRoutes = require("../routes/log.routes");
const postInterviewAssessmentRouter = require("../routes/postInterviewAssessment.routes");
const notificationSystemRouter = require("../routes/notificationSystem.routes");
const postStepsRouter = require("../routes/postSteps.routes");
const candidatePostStepProgressRouter = require("../routes/candidatePostStepProgress.routes");
const stripRouter = require("../routes/strip.routes");
const SkillInterviewAssessmentRoutes = require("../routes/skillInterviewAssessment.routes");
const pipelineInterviewRoutes = require("../routes/pipelineInterview.routes");
const CompanyInvitationRouters = require("../routes/companyInvitation.routes");
const CompanyMembershipRoutes = require("../routes/companyMembership.routes");
const chatRouter = require("../routes/chat.routes");
const planLimitsRouter = require("../routes/planLimits.routes");
const subscriptionRouter = require("../routes/subscription.routes");
const internalCampaignRoutes = require('../routes/internalCampaign.routes');
const campaignParticipantRoutes = require('../routes/campaignParticipant.routes');
const departmentRoutes = require('../routes/department.routes');
const contactRouter = require('../routes/contact.routes');
const cvAnalysisRouter = require('../routes/cvAnalysis.routes');
const employeePermissionsRouter = require('../routes/employeePermissions.routes');
const jobApplicationRouter = require("../routes/jobApplication.routes");
const apiKeyRouter = require('../routes/apiKeys.routes');
const paymentRouter = require('../routes/payment.routes');

// const backupRouter = require('../routes/backupRouter');
const backupRouter = require('../routes/backup.routes');

/**
 * Register all routes on the Express app
 * @param {Express} app - Express application instance
 */
function registerRoutes(app) {
  
  // Authentication & Profile
  app.use("/auth", authRouter); //✅ authentication
  app.use("/admin", companyPermissionsRouter); // ✅ (admin company permissions) -> admin (to be checked)
  app.use("/permissions", permissionsRouter); //✅ (general permissions management) -> permissions (to be checked)
  app.use("/employee-permissions", employeePermissionsRouter); //✅ Employee Permissions Management
  app.use("/dashboard", dashboardRouter); //✅ dashboard
  app.use("/profiles", profileRouter); //✅ profile management

  // Company Management
  app.use("/plan-limits", planLimitsRouter); //✅ Plan Limits Management -> plan-limits
  app.use("/subscriptions", subscriptionRouter); //✅ Subscription Management -> subscriptions
  app.use('/company-invitations', CompanyInvitationRouters); //✅ Company Invitation Management
  app.use('/company-memberships', CompanyMembershipRoutes); //✅ Company Membership Management

  // Evaluation & Interview
  app.use("/skill-interview-assessments", SkillInterviewAssessmentRoutes); //✅ Skill Interview Assessments -> skill-interview-assessments
  app.use("/post-interview-assessments", postInterviewAssessmentRouter); //✅   Post Interview Assessments -> post-interview-assessments

  // Posts & Jobs
  app.use("/post", postRouter); //✅ Post Management -> posts
  app.use("/post-steps", postStepsRouter); //✅ Post Steps Management -> post-steps

  // Chat & Messaging
  app.use("/chat", chatRouter); //✅ Chat functionalities chat -> chats (to be checked)

  // Notifications
  app.use("/notification-system", notificationSystemRouter); // Notification System -> notifications
  //app.use('/notifications', notificationSystemRouter); //✅ Notification System -> notifications

  // Candidate Management
  //app.use("/candidate-progress", candidatePostStepProgressRouter); //✅ Candidate Post Step Progress -> candidate-progress
  app.use("/job-applications", jobApplicationRouter); //✅ Job Applications -> job-applications

  // Utility & Management
  // app.use("/todo", todoRouter); //✅ To-Do Management -> todos
  app.use("/feedback", feedbackRouter); //✅ Feedback Management -> feedbacks
  app.use("/logs", logRoutes); //✅ System Logs Management -> logs  
  app.use('/admin/backups', backupRouter); //✅ Database Backup Management -> admin/backups

  // Billing
  app.use("/stripe", stripRouter); //✅ Stripe Integration -> api/stripe

  // Pipeline Interview
  //app.use("/api/pipeline-interview", pipelineInterviewRoutes); // Pipeline Interview Routes -> /interview-pipelines

  //payment
  app.use("/payments", paymentRouter); //✅ Payment Management -> payments

  // Register internal campaign routes
  app.use('/internal-campaigns', internalCampaignRoutes);
  app.use('/campaign-participants', campaignParticipantRoutes);
  app.use('/departments', departmentRoutes);
  app.use('/contact', contactRouter);
  // CV Analysis Routes
  app.use('/cv-analysis', cvAnalysisRouter); //✅ CV Analysis Management -> cv-analysis

  // API Key Management
  app.use('/api/api-keys', apiKeyRouter); //✅ API Key Management -> api-keys

}

module.exports = {
  registerRoutes,
};
