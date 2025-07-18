const Notification = require('../models/notificationModel');

exports.createNotification = async ({ content, type, url, recipient }) => {
  return await Notification.create({ content, type, url, recipient });
};
