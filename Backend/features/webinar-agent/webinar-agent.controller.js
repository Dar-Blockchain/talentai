const service = require("./webinar-agent.service");

const handle = (fn, status = 500) => async (req, res) => {
  try { await fn(req, res); }
  catch (err) { res.status(status).json({ success: false, error: err.message }); }
};

exports.saveProgress = handle(async (req, res) => {
  const { submissionId, webinarId, contact, source, lang, consent, answers } = req.body;
  if (!webinarId) return res.status(400).json({ success: false, error: "webinarId is required" });
  const result = await service.saveProgress({ submissionId, webinarId, contact, source, lang, consent, answers });
  res.json({ success: true, ...result });
});

exports.complete = handle(async (req, res) => {
  const { submissionId } = req.params;
  if (!submissionId) return res.status(400).json({ success: false, error: "submissionId is required" });
  const submission = await service.complete(submissionId, req.body.answers || {});
  res.json({ success: true, submission });
});

exports.getProgress = handle(async (req, res) => {
  const doc = await service.getProgress(req.params.submissionId);
  res.json({ success: true, submission: doc });
}, 404);

exports.replayFailed = handle(async (req, res) => {
  const result = await service.replayFailed();
  res.json({ success: true, ...result });
});
