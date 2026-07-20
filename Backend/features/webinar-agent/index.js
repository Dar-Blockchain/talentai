const webinarAgentRouter  = require("./webinar-agent.routes");
const webinarRouter       = require("./webinar.routes");
const webinarAgentService = require("./webinar-agent.service");
const WebinarSubmission   = require("./webinar-submission.model");
const Webinar             = require("./webinar.model");

module.exports = { webinarAgentRouter, webinarRouter, webinarAgentService, WebinarSubmission, Webinar };
