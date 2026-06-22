const jobApplicationRouter = require("./job-application.routes");
const jobApplicationService = require("./job-application.service");
const JobApplication = require("./job-application.model");

module.exports = {
  jobApplicationRouter,
  jobApplicationService,
  JobApplication,
};
