/**
 * Fan-out: push a completed submission to Notion, Google Sheets, and the ESP.
 * Each integration is fire-and-forget with retry; a failure in one does NOT
 * block the others. Call this after the submission is persisted to DB.
 */
const axios = require("axios");
const WebinarSubmission = require("./webinar-submission.model");
const Webinar = require("./webinar.model");
const { sendWebinarResultsEmail } = require("../../utils/email.service");

// ── Helpers ───────────────────────────────────────────────────────────────────

async function withRetry(fn, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); }
    catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
}

// ── Notion ────────────────────────────────────────────────────────────────────

const NOTION_TOKEN    = process.env.NOTION_TOKEN;
// Map marche → Notion database ID (set all 6 in env)
const NOTION_DB_IDS = {
  tunisie:              process.env.NOTION_DB_TUNISIE,
  europe_francophone:   process.env.NOTION_DB_EUROPE_FR,
  afrique_francophone:  process.env.NOTION_DB_AFRIQUE_FR,
  afrique_anglophone:   process.env.NOTION_DB_AFRIQUE_EN,
  moyen_orient:         process.env.NOTION_DB_MOYEN_ORIENT,
  maghreb:              process.env.NOTION_DB_MAGHREB,
  autre:                process.env.NOTION_DB_AUTRE,
};

async function pushToNotion(submission) {
  if (!NOTION_TOKEN) return;
  const dbId = NOTION_DB_IDS[submission.answers.marche] || NOTION_DB_IDS.autre;
  if (!dbId) return;

  const props = {
    Email:      { title: [{ text: { content: submission.contact.email } }] },
    Nom:        { rich_text: [{ text: { content: submission.contact.nom } }] },
    Secteur:    { select: { name: submission.answers.secteur || "" } },
    Role:       { select: { name: submission.answers.role || "" } },
    Volume:     { select: { name: submission.answers.volume || "" } },
    MaturiteIA: { number: submission.scoring.maturite_ia },
    Frein:      { select: { name: submission.answers.frein || "" } },
    Etape:      { select: { name: submission.answers.etape_douloureuse || "" } },
    TimeToHire: { select: { name: submission.answers.time_to_hire || "" } },
    Verbatim:   { rich_text: [{ text: { content: submission.answers.verbatim || "" } }] },
    Intention:  { select: { name: submission.answers.intention || "" } },
    These:      { select: { name: submission.scoring.these || "" } },
    Tier:       { select: { name: submission.scoring.tier || "" } },
    CreatedAt:  { date: { start: submission.createdAt?.toISOString() || new Date().toISOString() } },
  };

  await withRetry(() =>
    axios.post(
      "https://api.notion.com/v1/pages",
      { parent: { database_id: dbId }, properties: props },
      { headers: { Authorization: `Bearer ${NOTION_TOKEN}`, "Notion-Version": "2022-06-28" } },
    )
  );
}

// ── Google Sheets ─────────────────────────────────────────────────────────────

const SHEETS_WEBHOOK = process.env.WEBINAR_SHEETS_WEBHOOK; // Apps Script Web App URL

async function pushToSheets(submission) {
  if (!SHEETS_WEBHOOK) return;
  const row = {
    created_at:          submission.createdAt,
    email:               submission.contact.email,
    nom:                 submission.contact.nom,
    entreprise:          submission.contact.entreprise,
    webinar_id:          submission.webinar_id,
    lang:                submission.lang,
    utm_source:          submission.source?.utm_source,
    utm_campaign:        submission.source?.utm_campaign,
    role:                submission.answers.role,
    secteur:             submission.answers.secteur,
    volume:              submission.answers.volume,
    pays:                submission.answers.pays,
    marche:              submission.answers.marche,
    usage_ia:            submission.answers.usage_ia,
    frein:               submission.answers.frein,
    legitimite_ia:       submission.answers.legitimite_entretien_ia,
    etape_douloureuse:   submission.answers.etape_douloureuse,
    time_to_hire:        submission.answers.time_to_hire,
    verbatim:            submission.answers.verbatim,
    intention:           submission.answers.intention,
    attente:             submission.answers.attente,
    maturite_ia:         submission.scoring.maturite_ia,
    intensite_pain:      submission.scoring.intensite_pain,
    icp_fit:             submission.scoring.icp_fit,
    these:               submission.scoring.these,
    tier:                submission.scoring.tier,
  };

  await withRetry(() => axios.post(SHEETS_WEBHOOK, row));
}

// ── ESP (generic REST — configure for Brevo/Mailchimp/etc.) ──────────────────

const ESP_API_KEY    = process.env.WEBINAR_ESP_API_KEY;
const ESP_API_URL    = process.env.WEBINAR_ESP_API_URL; // e.g. https://api.brevo.com/v3/contacts
const ESP_LIST_ID    = process.env.WEBINAR_ESP_LIST_ID ? Number(process.env.WEBINAR_ESP_LIST_ID) : null;

async function pushToEsp(submission) {
  if (!ESP_API_KEY || !ESP_API_URL) return;
  const { marche, these, tier, intention } = submission.scoring || {};

  const tags = [
    marche   ? `marche:${marche}` : null,
    these    ? `these:${these}`   : null,
    tier     ? `tier:${tier}`     : null,
    tier === "C" ? "nurture:acculturation" : null,
  ].filter(Boolean);

  const body = {
    email:      submission.contact.email,
    attributes: { FIRSTNAME: submission.contact.nom, WEBINAR_TIER: tier, WEBINAR_THESE: these },
    listIds:    ESP_LIST_ID ? [ESP_LIST_ID] : [],
    updateEnabled: true,
    // Brevo-style tag field; adjust key for other ESPs
    tags,
  };

  await withRetry(() =>
    axios.post(ESP_API_URL, body, {
      headers: { "api-key": ESP_API_KEY, "Content-Type": "application/json" },
    })
  );
}

// ── Main fan-out ──────────────────────────────────────────────────────────────

async function fanOut(submission) {
  const updates = { synced: {} };

  // Fetch webinar for email (title, date)
  const webinar = await Webinar.findById(submission.webinar_id)
    .select("title date lang")
    .lean()
    .catch(() => null);

  await Promise.allSettled([
    pushToNotion(submission)
      .then(() => { updates.synced.notion = true; })
      .catch(() => { updates.synced.notion = false; }),

    pushToSheets(submission)
      .then(() => { updates.synced.sheets = true; })
      .catch(() => { updates.synced.sheets = false; }),

    pushToEsp(submission)
      .then(() => { updates.synced.esp = true; })
      .catch(() => { updates.synced.esp = false; }),

    // Send results email to the participant
    webinar && submission.contact?.email
      ? sendWebinarResultsEmail(submission, webinar).catch(() => {})
      : Promise.resolve(),
  ]);

  // Persist sync status without blocking the response
  await WebinarSubmission.findByIdAndUpdate(submission._id, {
    "synced.notion": updates.synced.notion ?? false,
    "synced.sheets": updates.synced.sheets ?? false,
    "synced.esp":    updates.synced.esp    ?? false,
  }).catch(() => {});
}

module.exports = { fanOut };
