const taskService = require("../services/task.service");

// POST /task/send-task
exports.sendTask = async (req, res) => {
  try {
    const {
      postId,
      stepId,
      candidateId,
      candidateEmail,
      candidateName,
      jobTitle,
      stepLabel,
    } = req.body;
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!postId || !candidateEmail) {
      return res.status(400).json({
        success: false,
        error: "postId and candidateEmail are required",
      });
    }

    const result = await taskService.sendTask({
      postId,
      token,
      candidateEmail,
      candidateName,
      stepId,
      candidateId,
      jobTitle,
      stepLabel,
    });

    res.status(200).json({
      success: true,
      data: result,
      message: "Technical test sent successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};
