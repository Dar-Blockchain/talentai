module.exports.controledAcces = (roles) => {
  return async (req, res, next) => {
    // Convert single role string to array for unified processing
    const allowedRoles = Array.isArray(roles) ? roles : [roles];


    if (allowedRoles.includes(req.user?.role)) {
      next(); // If the user role matches, continue execution
    } else {
      res.status(401).json({ success: false, message: "Unauthorized" }); // Otherwise, return a 401 error
    }
  };
};
