const jwt = require("jsonwebtoken");
const userModel = require("../models/UserModel");

const requireAuthUser = async (req, res, next) => {
  // const token = req.cookies.jwt_token;

  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.Net_Secret, async (err, decodedToken) => {
      if (err) {
        res.status(401).json({ message: "Invalid or expired token" });
      } else {
        try {
          const user = await userModel
            .findById(decodedToken.id)
            .populate("profile");
          if (!user) {
            return res.status(401).json({ message: "User not found" });
          }
          req.user = user;
          next();
        } catch (error) {
          res
            .status(500)
            .json({
              message: "Error verifying user",
            });
        }
      }
    });
  } else {
    res.status(401).json({ message: "Unauthorized access - Token missing" });
  }
};

module.exports = { requireAuthUser };
