// Générer un code OTP
module.exports.generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  