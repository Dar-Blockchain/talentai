const router          = require("./department.routes");
const Department      = require("./department.model");
const departmentService = require("./department.service");

module.exports = {
  router,           // mount at /departments in register-routes.js
  Department,       // Mongoose model — for populate() in other features
  departmentService, // service API — for inter-feature calls
};
