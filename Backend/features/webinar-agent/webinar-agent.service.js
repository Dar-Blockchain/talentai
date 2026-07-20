const WebinarSubmission   = require("./webinar-submission.model");
const { deriverMarche, calculerScoreIA } = require("./webinar-scoring");
const { fanOut } = require("./webinar-fanout");
const { refreshStats } = require("./webinar.service");

/**
 * Upsert a partial submission (called on each step save).
 * Creates the document on first call, updates on subsequent calls.
 */
exports.saveProgress = async ({ submissionId, webinarId, contact, source, lang, consent, answers }) => {
  const hasEmail = contact?.email && contact.email.trim() !== "";

  // Dot-notation answer keys so partial saves merge rather than overwrite
  const answerPatch = answers
    ? Object.fromEntries(Object.entries(answers).map(([k, v]) => [`answers.${k}`, v]))
    : {};

  const $set = {
    webinar_id: webinarId,
    lang:       lang || "fr",
    consent:    consent ?? false,
    ...(hasEmail ? { contact } : {}),
    ...(source   ? { source }  : {}),
    ...answerPatch,
  };

  let doc;
  let isReturning = false;
  if (submissionId) {
    doc = await WebinarSubmission.findByIdAndUpdate(
      submissionId,
      { $set },
      { new: true, setDefaultsOnInsert: true },
    );
    if (!doc) throw new Error("Submission not found");
  } else if (hasEmail) {
    // Upsert by email + webinarId to deduplicate returning visitors.
    // includeResultMetadata surfaces whether this matched an existing doc, so
    // the frontend can tell a returning visitor apart from a brand-new
    // registration (Mongoose 8 renamed the old `rawResult` option to this).
    const result = await WebinarSubmission.findOneAndUpdate(
      { "contact.email": contact.email.trim(), webinar_id: webinarId },
      { $set },
      { upsert: true, new: true, setDefaultsOnInsert: true, includeResultMetadata: true },
    );
    doc = result.value;
    isReturning = !!result.lastErrorObject?.updatedExisting;
  } else {
    doc = await WebinarSubmission.create({ ...$set });
  }

  return { submissionId: doc._id.toString(), completed: doc.completed === true, isReturning };
};

/**
 * Complete a submission: compute scoring, persist, fan-out to integrations.
 */
exports.complete = async (submissionId, finalAnswers) => {
  const doc = await WebinarSubmission.findById(submissionId);
  if (!doc) throw new Error("Submission not found");

  const answers = { ...(doc.answers?.toObject ? doc.answers.toObject() : doc.answers), ...finalAnswers };

  // Derive marche from pays if not already set
  if (!answers.marche && (answers.pays || answers.q4_pays)) {
    answers.marche = deriverMarche(answers.pays || answers.q4_pays);
  }

  const scoring = await calculerScoreIA(answers, doc.webinar_id, doc.lang || "fr");

  const completed = await WebinarSubmission.findByIdAndUpdate(
    submissionId,
    { $set: { answers, scoring, completed: true } },
    { new: true },
  );

  // Fire-and-forget — do not block the HTTP response
  fanOut(completed).catch(() => {});
  refreshStats(doc.webinar_id).catch(() => {});

  return completed;
};

/**
 * Resume: return partial submission data so the UI can restore state.
 */
exports.getProgress = async (submissionId) => {
  const doc = await WebinarSubmission.findById(submissionId).lean();
  if (!doc) throw new Error("Submission not found");
  return doc;
};

/**
 * Replay fan-out for submissions where one or more integrations failed.
 */
exports.replayFailed = async () => {
  const failed = await WebinarSubmission.find({
    completed: true,
    $or: [
      { "synced.notion": false },
      { "synced.sheets": false },
      { "synced.esp":    false },
    ],
  }).limit(50);

  await Promise.allSettled(failed.map(doc => fanOut(doc)));
  return { replayed: failed.length };
};
