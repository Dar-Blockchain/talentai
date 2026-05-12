const TeamConversation = require("../../models/TeamConversation.model");
const TeamMessage = require("../../models/TeamMessage.model");
const {
  resolveAndAssertCompanyContext,
  createHttpError,
} = require("../../helpers/teamChatAccess.helper");

const validateMessageText = (text) => {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phonePattern = /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}|\d{10,}/;

  if (emailPattern.test(text)) {
    throw createHttpError(
      "You cannot share email addresses in messages. Please use the platform's communication features.",
      400,
    );
  }

  if (phonePattern.test(text)) {
    throw createHttpError(
      "You cannot share phone numbers in messages. Please use the platform's communication features.",
      400,
    );
  }
};

const formatMessage = (message) => ({
  _id: message._id,
  conversationId: message.conversationId,
  companyId: message.companyId,
  senderId: message.senderId,
  receiverId: message.receiverId,
  text: message.text,
  type: message.type,
  isRead: message.isRead,
  readAt: message.readAt || null,
  createdAt: message.createdAt,
});

const getConversationMessages = async (
  currentUser,
  conversationId,
  auth = null,
  options = {},
) => {
  await resolveAndAssertCompanyContext(currentUser, auth);

  const conversation = await TeamConversation.findById(conversationId);
  if (!conversation) {
    throw createHttpError("Conversation not found", 404);
  }

  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === currentUser._id.toString(),
  );

  if (!isParticipant) {
    throw createHttpError("Unauthorized access to conversation", 403);
  }

  const result = await TeamMessage.getConversationMessages(conversationId, options);

  return {
    messages: result.messages.map(formatMessage),
    pagination: result.pagination,
  };
};

const sendMessage = async (
  currentUser,
  { conversationId, receiverId, text },
  auth = null,
) => {
  await resolveAndAssertCompanyContext(currentUser, auth);

  if (!text || !text.trim()) {
    throw createHttpError("Message text is required", 400);
  }

  validateMessageText(text);

  const conversation = await TeamConversation.findById(conversationId);
  if (!conversation) {
    throw createHttpError("Conversation not found", 404);
  }

  if (conversation.status !== "active") {
    throw createHttpError("Cannot send message: conversation is not active", 403);
  }

  const senderId = currentUser._id.toString();
  const isParticipant = conversation.participants.some(
    (participant) => participant.toString() === senderId,
  );

  if (!isParticipant) {
    throw createHttpError("Unauthorized: Not a participant of this conversation", 403);
  }

  const receiverIsParticipant = conversation.participants.some(
    (participant) => participant.toString() === receiverId.toString(),
  );

  if (!receiverIsParticipant || receiverId.toString() === senderId) {
    throw createHttpError("Invalid receiver for this conversation", 400);
  }

  const message = await TeamMessage.create({
    conversationId,
    companyId: conversation.companyId,
    senderId,
    receiverId,
    text: text.trim(),
    type: "text",
    isRead: false,
  });

  await conversation.updateLastMessage({
    text: message.text,
    senderId: message.senderId,
    createdAt: message.createdAt,
  });
  await conversation.incrementUnreadCount(receiverId);

  return formatMessage(message);
};

module.exports = {
  getConversationMessages,
  sendMessage,
  formatMessage,
};
