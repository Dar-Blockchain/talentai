const Webinar           = require("./webinar.model");
const WebinarSubmission = require("./webinar-submission.model");
const { sendWebinarReminderEmail, sendWebinarInvitationEmail } = require("../../utils/email.service");

// A plain-enough check to filter out obviously-malformed rows from a pasted
// list or an uploaded spreadsheet — real deliverability is the mail server's job.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

const PUBLIC_FIELDS = "title title_fr title_en description description_fr description_en date end_date lang questions highlights highlights_enabled stats about_fr about_en webinar_link booking_link";

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
  date, end_date, status, lang, userId, questions: passedQuestions,
  highlights, highlights_fr, highlights_en, highlights_enabled,
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
    highlights_enabled: highlights_enabled ?? true,
    date,
    end_date:     end_date         || null,
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

// Mirrors the admin UI's question validation (webinarForm.ts) so publishing
// via a direct API call can't bypass it: choice/select/multiselect questions
// need at least 2 options, and their option scores must total exactly 100.
function findInvalidQuestion(questions) {
  for (const q of questions || []) {
    const isChoiceGroup = q.type === "choice" || q.type === "select" || q.type === "multiselect";
    if (!isChoiceGroup) continue;
    if (!q.options || q.options.length < 2) return { question: q, reason: "min_options" };
    const total = q.options.reduce((sum, o) => sum + (o.score || 0), 0);
    if (total !== 100) return { question: q, reason: "score_total" };
  }
  return null;
}

exports.verifyWebinar = async (id) => {
  const webinar = await Webinar.findById(id).lean();
  if (!webinar) throw new Error("Webinar not found");
  if (!webinar.questions || webinar.questions.length === 0) {
    throw new Error("Add at least one question before publishing.");
  }
  const invalid = findInvalidQuestion(webinar.questions);
  if (invalid) {
    throw new Error(
      invalid.reason === "min_options"
        ? "Choice questions need at least 2 options."
        : "Each choice question's option scores must add up to exactly 100.",
    );
  }
  return setStatus(id, "active");
};

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

/** Cold invites to arbitrary email addresses (pasted or uploaded by the admin)
 * — unlike sendLinkReminder, these people haven't registered yet, so the
 * email links to the public registration page instead of a join link. */
exports.inviteToWebinar = async (id, emails) => {
  const webinar = await Webinar.findById(id).lean();
  if (!webinar) throw new Error("Webinar not found");

  const uniqueEmails = [...new Set(
    (Array.isArray(emails) ? emails : [])
      .map(e => String(e).trim().toLowerCase())
      .filter(e => EMAIL_RE.test(e)),
  )];
  if (uniqueEmails.length === 0) throw new Error("No valid email addresses provided.");

  let sent = 0, failed = 0;
  await Promise.allSettled(
    uniqueEmails.map(email =>
      sendWebinarInvitationEmail(email, webinar)
        .then(ok => { if (ok) sent++; else failed++; })
        .catch(() => { failed++; })
    )
  );
  return { sent, failed, total: uniqueEmails.length };
};

exports.refreshStats = async (id) => {
  // Contact/source fields (segment, sector, channel, UTM) are captured at
  // registration time via saveProgress, before completion — so this must
  // pull ALL submissions, not just completed ones, or early registrants who
  // haven't finished the questionnaire yet get silently excluded from those
  // breakdowns. Scoring-derived breakdowns (maturity/qualification/avg_score)
  // stay correct regardless, since those fields simply don't exist yet on
  // incomplete docs and are skipped by the truthy checks below.
  const [total, completed, submissions] = await Promise.all([
    WebinarSubmission.countDocuments({ webinar_id: id }),
    WebinarSubmission.countDocuments({ webinar_id: id, completed: true }),
    WebinarSubmission.find(
      { webinar_id: id },
      { "scoring.total100": 1, "scoring.maturityLevel": 1, "scoring.qualification.status": 1, "contact.profile_type": 1, "contact.sector": 1, "source.utm_source": 1, "source.channel": 1 },
    ).lean(),
  ]);

  const maturityBreakdown      = {};
  const qualificationBreakdown = {};
  const segmentBreakdown       = {};
  const utmBreakdown           = {};
  const channelBreakdown       = {};
  const sectorBreakdown        = {};
  let totalScore = 0, scoredCount = 0;

  for (const s of submissions) {
    const level = s.scoring?.maturityLevel;
    if (level) maturityBreakdown[level] = (maturityBreakdown[level] || 0) + 1;

    const qual = s.scoring?.qualification?.status;
    if (qual) qualificationBreakdown[qual] = (qualificationBreakdown[qual] || 0) + 1;

    const segment = s.contact?.profile_type;
    if (segment) segmentBreakdown[segment] = (segmentBreakdown[segment] || 0) + 1;

    const utm = s.source?.utm_source;
    if (utm) utmBreakdown[utm] = (utmBreakdown[utm] || 0) + 1;

    const channel = s.source?.channel;
    if (channel) channelBreakdown[channel] = (channelBreakdown[channel] || 0) + 1;

    // Multi-select — one registrant can add to more than one sector bucket.
    // `sector` predates the multi-select change, so old docs read via .lean()
    // (no schema casting) may still hold a bare string instead of an array —
    // normalize so this doesn't silently iterate the string's characters.
    const rawSector = s.contact?.sector;
    const sectors = Array.isArray(rawSector) ? rawSector : (typeof rawSector === "string" && rawSector ? [rawSector] : []);
    for (const sector of sectors) {
      sectorBreakdown[sector] = (sectorBreakdown[sector] || 0) + 1;
    }

    if (s.scoring?.total100 != null) { totalScore += s.scoring.total100; scoredCount++; }
  }

  const doc = await Webinar.findByIdAndUpdate(
    id,
    { $set: {
      "stats.total_registrations":     total,
      "stats.total_completions":       completed,
      "stats.avg_score":               scoredCount ? Math.round(totalScore / scoredCount) : null,
      "stats.maturity_breakdown":      maturityBreakdown,
      "stats.qualification_breakdown": qualificationBreakdown,
      "stats.segment_breakdown":       segmentBreakdown,
      "stats.utm_breakdown":           utmBreakdown,
      "stats.channel_breakdown":       channelBreakdown,
      "stats.sector_breakdown":        sectorBreakdown,
    }},
    { new: true },
  );
  if (!doc) throw new Error("Webinar not found");
  return doc;
};
