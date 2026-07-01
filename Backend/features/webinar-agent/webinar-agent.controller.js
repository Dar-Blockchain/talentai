const service = require("./webinar-agent.service");

exports.saveProgress = async (req, res) => {
  try {
    const { submissionId, webinarId, contact, source, lang, consent, answers } = req.body;
    if (!webinarId) return res.status(400).json({ success: false, error: "webinarId is required" });

    const result = await service.saveProgress({ submissionId, webinarId, contact, source, lang, consent, answers });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.complete = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { answers } = req.body;
    if (!submissionId) return res.status(400).json({ success: false, error: "submissionId is required" });

    const submission = await service.complete(submissionId, answers || {});
    res.json({ success: true, submission });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getProgress = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const doc = await service.getProgress(submissionId);
    res.json({ success: true, submission: doc });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

exports.replayFailed = async (req, res) => {
  try {
    const result = await service.replayFailed();
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
