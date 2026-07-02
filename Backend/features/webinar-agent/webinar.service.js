const Webinar           = require("./webinar.model");
const WebinarSubmission = require("./webinar-submission.model");

exports.listWebinars = async ({ page = 1, limit = 20, status } = {}) => {
  const filter = status ? { status } : {};
  const skip   = (page - 1) * limit;
  const [data, total] = await Promise.all([
    Webinar.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Webinar.countDocuments(filter),
  ]);
  return { data, total, page, totalPages: Math.ceil(total / limit) };
};

exports.getWebinar = async (id) => {
  const doc = await Webinar.findById(id).lean();
  if (!doc) throw new Error("Webinar not found");
  return doc;
};

exports.getActiveWebinar = async () => {
  const doc = await Webinar.findOne({ status: "active" })
    .sort({ createdAt: -1 })
    .select("title description date lang questions highlights stats about_fr about_en webinar_link")
    .lean();
  return doc || null;
};

exports.getPublicWebinar = async (id) => {
  const doc = await Webinar.findById(id)
    .select("title description date lang questions highlights stats status about_fr about_en webinar_link")
    .lean();
  if (!doc) throw new Error("Webinar not found");
  return doc;
};

exports.createWebinar = async ({ title, description, date, status, lang, userId, questions: passedQuestions, highlights }) => {
  const doc = await Webinar.create({
    title, description, date,
    status: status || "draft",
    lang: lang || "fr",
    questions: passedQuestions || [],
    highlights: highlights || [],
    created_by: userId || null,
  });
  return doc;
};

exports.updateWebinar = async (id, patch) => {
  const { questions, ...rest } = patch;
  const update = { $set: rest };
  if (questions !== undefined) update.$set.questions = questions;
  const doc = await Webinar.findByIdAndUpdate(id, update, { new: true, runValidators: false });
  if (!doc) throw new Error("Webinar not found");
  return doc;
};

exports.deleteWebinar = async (id) => {
  const doc = await Webinar.findByIdAndDelete(id);
  if (!doc) throw new Error("Webinar not found");
};

exports.verifyWebinar = async (id) => {
  const doc = await Webinar.findByIdAndUpdate(id, { $set: { status: "active" } }, { new: true });
  if (!doc) throw new Error("Webinar not found");
  return doc;
};

exports.archiveWebinar = async (id) => {
  const doc = await Webinar.findByIdAndUpdate(id, { $set: { status: "archived" } }, { new: true });
  if (!doc) throw new Error("Webinar not found");
  return doc;
};

exports.listSubmissions = async ({ webinarId, page = 1, limit = 50, completed }) => {
  const filter = { webinar_id: webinarId };
  if (completed !== undefined) filter.completed = completed;
  const skip  = (page - 1) * limit;
  const total = await WebinarSubmission.countDocuments(filter);
  const data  = await WebinarSubmission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
  return { data, total, page, totalPages: Math.ceil(total / limit) };
};

exports.sendLinkReminder = async (id) => {
  const { sendWebinarReminderEmail } = require("../../utils/email.service");
  const webinar = await Webinar.findById(id).lean();
  if (!webinar) throw new Error("Webinar not found");
  if (!webinar.webinar_link) throw new Error("No webinar link set. Add one in the webinar settings first.");

  const submissions = await WebinarSubmission.find({
    webinar_id: id,
    completed: true,
    "contact.email": { $exists: true, $ne: null, $ne: "" },
  }).lean();

  let sent = 0;
  let failed = 0;
  await Promise.allSettled(
    submissions.map(s =>
      sendWebinarReminderEmail(s, webinar)
        .then(ok => { if (ok) sent++; else failed++; })
        .catch(() => { failed++; })
    )
  );
  return { sent, failed, total: submissions.length };
};

exports.refreshStats = async (id) => {
  const [total, completed, scoring] = await Promise.all([
    WebinarSubmission.countDocuments({ webinar_id: id }),
    WebinarSubmission.countDocuments({ webinar_id: id, completed: true }),
    WebinarSubmission.find({ webinar_id: id, completed: true }, { "scoring.maturite_ia": 1, "scoring.tier": 1 }).lean(),
  ]);

  const tierBreakdown = {};
  let totalMaturite = 0;
  for (const s of scoring) {
    const tier = s.scoring?.tier;
    if (tier) tierBreakdown[tier] = (tierBreakdown[tier] || 0) + 1;
    if (s.scoring?.maturite_ia != null) totalMaturite += s.scoring.maturite_ia;
  }
  const avg_maturite_ia = scoring.length ? Math.round(totalMaturite / scoring.length) : null;

  const doc = await Webinar.findByIdAndUpdate(
    id,
    { $set: {
      "stats.total_registrations": total,
      "stats.total_completions":   completed,
      "stats.avg_maturite_ia":     avg_maturite_ia,
      "stats.tier_breakdown":      tierBreakdown,
    }},
    { new: true },
  );
  if (!doc) throw new Error("Webinar not found");
  return doc;
};
