const teamConversationService = require('./team-conversation.service');

const handleError = (res, error) => {
  return res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
};

module.exports.createRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'targetUserId is required' });
    }
    const data = await teamConversationService.createOrGetConversation(req.user, targetUserId, req.auth);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error in createRequest:', error);
    return handleError(res, error);
  }
};
