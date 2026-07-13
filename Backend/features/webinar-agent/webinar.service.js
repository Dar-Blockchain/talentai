const Webinar           = require("./webinar.model");
const WebinarSubmission = require("./webinar-submission.model");
const { sendWebinarReminderEmail } = require("../../utils/email.service");

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Set a single status field and return the updated doc. */
async function setStatus(id, status) {
  const doc = await Webinar.findByIdAndUpdate(id, { $set: { status } }, { new: true });
  if (!doc) throw new Error("Webinar not found");
  return doc;
}

/** Picks the fallback/primary value shown to consumers that aren't lang-aware
 * (admin list, emails, cron), based on the webinar's configured language. */
function primary(lang, frVal, enVal) {
  const isArray = Array.isArray(frVal) || Array.isArray(enVal);
  const empty   = isArray ? [] : "";
  const fr = frVal ?? empty;
  const en = enVal ?? empty;
  const frFilled = isArray ? fr.length > 0 : !!fr;
  const enFilled = isArray ? en.length > 0 : !!en;
  if (lang === "en") return enFilled ? en : fr;
  return frFilled ? fr : en;
}

// ── Exports ───────────────────────────────────────────────────────────────────

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

const PUBLIC_FIELDS = "title title_fr title_en description description_fr description_en date lang questions highlights stats about_fr about_en webinar_link";

exports.getActiveWebinar = async () => {
  return Webinar.findOne({ status: "active" })
    .sort({ createdAt: -1 })
    .select(PUBLIC_FIELDS)
    .lean() ?? null;
};

exports.getPublicWebinar = async (id) => {
  const doc = await Webinar.findById(id)
    .select(`${PUBLIC_FIELDS} status`)
    .lean();
  if (!doc) throw new Error("Webinar not found");
  return doc;
};

exports.createWebinar = async ({
  title, title_fr, title_en,
  description, description_fr, description_en,
  date, status, lang, userId, questions: passedQuestions,
  highlights, highlights_fr, highlights_en,
  about_fr, about_en, webinar_link, ai_context,
}) => {
  const L   = lang || "fr";
  const tFr = title_fr       ?? title       ?? "";
  const tEn = title_en       ?? title       ?? "";
  const dFr = description_fr ?? description ?? "";
  const dEn = description_en ?? description ?? "";
  const hFr = highlights_fr  ?? highlights  ?? [];
  const hEn = highlights_en  ?? highlights  ?? [];

  return Webinar.create({
    title:           primary(L, tFr, tEn),
    title_fr:        tFr,
    title_en:        tEn,
    description:     primary(L, dFr, dEn),
    description_fr:  dFr,
    description_en:  dEn,
    highlights:      primary(L, hFr, hEn),
    highlights_fr:   hFr,
    highlights_en:   hEn,
    date,
    status:       status           || "draft",
    lang:         L,
    questions:    passedQuestions  || [],
    about_fr:     about_fr         || "",
    about_en:     about_en         || "",
    webinar_link: webinar_link     || "",
    ai_context:   ai_context       || "",
    created_by:   userId           || null,
  });
};

exports.updateWebinar = async (id, patch) => {
  const enriched = { ...patch };
  const hasTitle = patch.title_fr !== undefined || patch.title_en !== undefined;
  const hasDesc  = patch.description_fr !== undefined || patch.description_en !== undefined;
  const hasHi    = patch.highlights_fr !== undefined || patch.highlights_en !== undefined;

  if (hasTitle || hasDesc || hasHi || patch.lang !== undefined) {
    const existing = await Webinar.findById(id).lean();
    if (!existing) throw new Error("Webinar not found");
    const L = patch.lang ?? existing.lang;

    if (hasTitle || patch.lang !== undefined) {
      const tFr = patch.title_fr ?? existing.title_fr ?? existing.title ?? "";
      const tEn = patch.title_en ?? existing.title_en ?? existing.title ?? "";
      enriched.title_fr = tFr;
      enriched.title_en = tEn;
      enriched.title    = primary(L, tFr, tEn);
    }
    if (hasDesc || patch.lang !== undefined) {
      const dFr = patch.description_fr ?? existing.description_fr ?? existing.description ?? "";
      const dEn = patch.description_en ?? existing.description_en ?? existing.description ?? "";
      enriched.description_fr = dFr;
      enriched.description_en = dEn;
      enriched.description    = primary(L, dFr, dEn);
    }
    if (hasHi || patch.lang !== undefined) {
      const hFr = patch.highlights_fr ?? existing.highlights_fr ?? existing.highlights ?? [];
      const hEn = patch.highlights_en ?? existing.highlights_en ?? existing.highlights ?? [];
      enriched.highlights_fr = hFr;
      enriched.highlights_en = hEn;
      enriched.highlights    = primary(L, hFr, hEn);
    }
  }

  const doc = await Webinar.findByIdAndUpdate(id, { $set: enriched }, { new: true, runValidators: false });
  if (!doc) throw new Error("Webinar not found");
  return doc;
};

exports.deleteWebinar = async (id) => {
  const doc = await Webinar.findByIdAndDelete(id);
  if (!doc) throw new Error("Webinar not found");
};

exports.verifyWebinar = (id) => setStatus(id, "active");

exports.listSubmissions = async ({ webinarId, page = 1, limit = 50, completed }) => {
  const filter = { webinar_id: webinarId };
  if (completed !== undefined) filter.completed = completed;
  const skip  = (page - 1) * limit;
  const [data, total] = await Promise.all([
    WebinarSubmission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    WebinarSubmission.countDocuments(filter),
  ]);
  return { data, total, page, totalPages: Math.ceil(total / limit) };
};

exports.sendLinkReminder = async (id) => {
  const webinar = await Webinar.findById(id).lean();
  if (!webinar) throw new Error("Webinar not found");
  if (!webinar.webinar_link) throw new Error("No webinar link set. Add one in the webinar settings first.");

  const submissions = await WebinarSubmission.find({
    webinar_id: id,
    completed: true,
    "contact.email": { $exists: true, $nin: [null, ""] },
  }).lean();

  let sent = 0, failed = 0;
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
    if (s.scoring?.tier)              tierBreakdown[s.scoring.tier] = (tierBreakdown[s.scoring.tier] || 0) + 1;
    if (s.scoring?.maturite_ia != null) totalMaturite += s.scoring.maturite_ia;
  }

  const doc = await Webinar.findByIdAndUpdate(
    id,
    { $set: {
      "stats.total_registrations": total,
      "stats.total_completions":   completed,
      "stats.avg_maturite_ia":     scoring.length ? Math.round(totalMaturite / scoring.length) : null,
      "stats.tier_breakdown":      tierBreakdown,
    }},
    { new: true },
  );
  if (!doc) throw new Error("Webinar not found");
  return doc;
};
