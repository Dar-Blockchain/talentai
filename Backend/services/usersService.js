const User = require("../models/UserModel");

module.exports.getAllUsers = async () => {
    const users = await User.find();
    return users;
  };