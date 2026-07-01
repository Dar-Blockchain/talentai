const path = require("path");
const express = require("express");

// Import all route modules
const { registerSwagger } = require('./swagger');
const { router: authRouter } = require("../features/auth");
const {
  companyInvitationRouter: CompanyInvitationRouters,
  companyMembershipRouter: CompanyMembershipRoutes,
  employeePermissionsRouter,
} = require("../features/company-members");
const { dashboardRouter } = require("../features/dashboard");
const profileRouter = require("../features/users").profileRouter;
const { postRouter } = require("../features/posts");
const feedbackRouter = require("../features/feedbacks/feedback.routes");
const postInterviewAssessmentRouter = require("../features/interviews/post-interview/post-interview.routes");
const { router: notificationSystemRouter } = require("../features/notifications");
const { stripeRouter } = require("../features/billing/payments");
const SkillInterviewAssessmentRoutes = require("../features/interviews/skill-interview/skill-interview.routes");
const { router: chatRouter } = require("../features/chat");
const { router: teamChatRouter } = require("../features/team-chat");
const { router: planLimitsRouter } = require("../features/billing/plans");
const { subscriptionRouter } = require("../features/billing/subscriptions");
const { router: internalCampaignRoutes } = require('../features/campaigns');
const { router: departmentRoutes } = require('../features/departments');
const { contactRouter } = require('../features/contact');
const { jobApplicationRouter } = require("../features/job-applications");
const { router: apiKeyRouter } = require('../features/api-keys');
const { paymentRouter } = require('../features/billing/payments');
const usersRouter = require('../features/users').userRouter;
const skillRouter = require('../features/skills/skill.routes');
const { webinarAgentRouter, webinarRouter } = require('../features/webinar-agent');

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
  app.use("/feedbacks", feedbackRouter);

  // Billing
  app.use("/stripe", stripeRouter);
  app.use("/payments", paymentRouter);

  // Internal Campaigns & Departments
  app.use('/internal-campaigns', internalCampaignRoutes);
  app.use('/departments', departmentRoutes);
  app.use('/contact', contactRouter);

  // Skills
  app.use('/skills', skillRouter);

  // API Key Management
  app.use('/api/api-keys', apiKeyRouter);

  // Webinar onboarding agent (public submission flow)
  app.use('/webinar-agent', webinarAgentRouter);
  // Webinar management (admin CRUD)
  app.use('/webinars', webinarRouter);
}

module.exports = {
  registerRoutes,
};
