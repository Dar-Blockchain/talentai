const router      = require("./auth.routes");
const authService = require("./auth.service");

module.exports = {
  router,       // mount at /auth in register-routes.js
  authService,  // service API — for inter-feature calls
};
