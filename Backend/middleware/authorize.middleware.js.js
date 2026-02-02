module.exports.controledAcces = (role) => {
  return async (req, res, next) => {
    if (req.user.role === role) {
      next(); // If the user role matches, continue execution
    } else {
      res.status(401).json("Unauthorized"); // Otherwise, return a 401 error
    }
  };
};
