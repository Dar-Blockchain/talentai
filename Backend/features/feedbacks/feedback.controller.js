const feedbackService = require("./feedback.service");
const { INTERVIEW_MODELS } = require("./feedback.model");

exports.create = async (req, res) => {
  try {
    const { rating, comment, interviewId, interviewType } = req.body;

    // interviewId and interviewType must come together
    if (!!interviewId !== !!interviewType) {
      return res.status(400).json({ error: "interviewId and interviewType must both be provided or both omitted" });
    }
    if (interviewType && !INTERVIEW_MODELS.includes(interviewType)) {
      return res.status(400).json({ error: `interviewType must be one of: ${INTERVIEW_MODELS.join(", ")}` });
    }

    const feedback = await feedbackService.createFeedback({
      userId: req.user._id,
      rating,
      comment,
      ...(interviewId && { interviewId, interviewType }),
    });

    res.status(201).json(feedback);
  } catch (err) {
    // Duplicate feedback for the same interview
    if (err.code === 11000) {
      return res.status(409).json({ error: "You have already submitted feedback for this interview" });
    }
    res.status(500).json({ error: err.message });
  }
};
