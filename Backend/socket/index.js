const { registerNotificationHandlers } = require('../features/notifications/notification.socket');
const chatSocketHandler = require('../features/chat/chat.socket');
const intelligentInterviewController = require('../features/interviews/shared/interview.socket');
const campaignInterviewController = require('../features/interviews/campaign-interview/campaign-interview.controller');

function registerAllHandlers(socket) {
  socket.on('join', (userId) => {
    socket.join(String(userId));
  });

  registerNotificationHandlers(socket);

  socket.on('disconnect', () => {});
}

function registerAllNamespaces(io) {
  chatSocketHandler.initializeChatNamespace(io);
  intelligentInterviewController.initializeHandlers(io);
  campaignInterviewController.initializeHandlers(io);
}

module.exports = { registerAllHandlers, registerAllNamespaces };
