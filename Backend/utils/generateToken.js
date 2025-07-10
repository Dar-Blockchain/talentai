const jwt = require("jsonwebtoken");

// Générer un token JWT
module.exports.generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.Net_Secret, {
      expiresIn: "5y", // 5 ans
    });
  };