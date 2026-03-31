module.exports.controledAcces = (roles) => {
  return async (req, res, next) => {
    // Convert single role string to array for unified processing
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    console.log("🔐 controledAcces - Checking role authorization...");
    console.log("   - User role:", req.user?.role || "undefined");
    console.log("   - Allowed roles:", allowedRoles);
    
    if (allowedRoles.includes(req.user?.role)) {
      console.log("✅ User role authorized");
      next(); // If the user role matches, continue execution
    } else {
      console.log("❌ User role not authorized");
      res.status(401).json({ success: false, message: "Unauthorized" }); // Otherwise, return a 401 error
    }
  };
};
