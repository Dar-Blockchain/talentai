const path = require("path");
const express = require("express");

// Import all route modules
const { registerSwagger } = require('./swagger');
const authRouter = require("../routes/authentication.routes");
const companyPermissionsRouter = require("../routes/companyPermissions.routes");
const dashboardRouter = require("../routes/dashboard.routes");
const profileRouter = require("../features/users").profileRouter;
const postRouter = require("../routes/post.routes");
const feedbackRouter = require("../routes/feedback.routes");
const postInterviewAssessmentRouter = require("../routes/postInterviewAssessment.routes");
const notificationSystemRouter = require("../routes/notificationSystem.routes");
const stripRouter = require("../routes/strip.routes");
const SkillInterviewAssessmentRoutes = require("../routes/skillInterviewAssessment.routes");
const CompanyInvitationRouters = require("../routes/companyInvitation.routes");
const CompanyMembershipRoutes = require("../routes/companyMembership.routes");
const chatRouter = require("../routes/chat.routes");
const teamChatRouter = require("../routes/teamChat.routes");
const planLimitsRouter = require("../routes/planLimits.routes");
const subscriptionRouter = require("../routes/subscription.routes");
const internalCampaignRoutes = require('../routes/internalCampaign.routes');
const { router: departmentRoutes } = require('../features/departments');
const contactRouter = require('../routes/contact.routes');
const employeePermissionsRouter = require('../routes/employeePermissions.routes');
const jobApplicationRouter = require("../routes/jobApplication.routes");
const apiKeyRouter = require('../routes/apiKeys.routes');
const paymentRouter = require('../routes/payment.routes');
const usersRouter = require('../features/users').userRouter;

/**
 * Register all routes on the Express app
 * @param {Express} app - Express application instance
 */
function registerRoutes(app) {
  // Swagger API docs at /api/docs
  registerSwagger(app);

  // Static file serving for resume uploads
  app.use("/resume", express.static(path.join(__dirname, "../uploads/resumes")));

  // Authentication & Profile
  app.use("/auth", authRouter);
  app.use("/users", usersRouter);
  app.use("/admin", companyPermissionsRouter);
  app.use("/employee-permissions", employeePermissionsRouter);
  app.use("/dashboard", dashboardRouter);
  app.use("/profiles", profileRouter);

  // Company Management
  app.use("/plan-limits", planLimitsRouter);
  app.use("/subscriptions", subscriptionRouter);
  app.use('/company-invitations', CompanyInvitationRouters);
  app.use('/company-memberships', CompanyMembershipRoutes);

  // Evaluation & Interview
  app.use("/skill-interview-assessments", SkillInterviewAssessmentRoutes);
  app.use("/post-interview-assessments", postInterviewAssessmentRouter);

  // Posts & Jobs
  app.use("/post", postRouter);

  // Chat & Messaging
  const noChatCache = (req, res, next) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");
    next();
  };
  app.use("/chat", noChatCache, chatRouter);
  app.use("/team-chat", noChatCache, teamChatRouter);

  // Notifications
  app.use("/notification", notificationSystemRouter);

  // Candidate Management
  app.use("/job-applications", jobApplicationRouter);

  // Utility
  app.use("/feedback", feedbackRouter);

  // Billing
  app.use("/stripe", stripRouter);
  app.use("/payments", paymentRouter);

  // Internal Campaigns & Departments
  app.use('/internal-campaigns', internalCampaignRoutes);
  app.use('/departments', departmentRoutes);
  app.use('/contact', contactRouter);

  // API Key Management
  app.use('/api/api-keys', apiKeyRouter);
}

module.exports = {
  registerRoutes,
};
