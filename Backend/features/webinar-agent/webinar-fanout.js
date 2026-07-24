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

const NOTION_TOKEN  = process.env.NOTION_TOKEN;
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
    Email:         { title: [{ text: { content: submission.contact.email } }] },
    Nom:           { rich_text: [{ text: { content: submission.contact.nom } }] },
    Segment:       { select: { name: submission.contact.profile_type || "" } },
    Score:         { number: submission.scoring.total100 },
    MaturityLevel: { select: { name: submission.scoring.maturityLevel || "" } },
    Qualification: { select: { name: submission.scoring.qualification?.status || "" } },
    Script:        { select: { name: submission.scoring.routing?.script || "" } },
    CreatedAt:     { date: { start: submission.createdAt?.toISOString() || new Date().toISOString() } },
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

const SHEETS_WEBHOOK = process.env.WEBINAR_SHEETS_WEBHOOK;

async function pushToSheets(submission) {
  if (!SHEETS_WEBHOOK) return;
  const row = {
    created_at:      submission.createdAt,
    email:            submission.contact.email,
    nom:              submission.contact.nom,
    entreprise:       submission.contact.entreprise,
    segment:          submission.contact.profile_type,
    webinar_id:       submission.webinar_id,
    lang:             submission.lang,
    utm_source:       submission.source?.utm_source,
    utm_campaign:     submission.source?.utm_campaign,
    marche:           submission.answers?.marche,
    score_adoption:   submission.scoring.subScores?.adoption,
    score_governance: submission.scoring.subScores?.governance,
    score_quality:    submission.scoring.subScores?.quality,
    score_antifraud:  submission.scoring.subScores?.antifraud,
    total_score:      submission.scoring.total100,
    maturity_level:   submission.scoring.maturityLevel,
    qualification:    submission.scoring.qualification?.status,
    script:           submission.scoring.routing?.script,
  };

  await withRetry(() => axios.post(SHEETS_WEBHOOK, row));
}

// ── ESP (generic REST — configure for Brevo/Mailchimp/etc.) ──────────────────

const ESP_API_KEY = process.env.WEBINAR_ESP_API_KEY;
const ESP_API_URL = process.env.WEBINAR_ESP_API_URL;
const ESP_LIST_ID = process.env.WEBINAR_ESP_LIST_ID ? Number(process.env.WEBINAR_ESP_LIST_ID) : null;

async function pushToEsp(submission) {
  if (!ESP_API_KEY || !ESP_API_URL) return;
  const { maturityLevel, qualification, routing } = submission.scoring || {};
  const marche = submission.answers?.marche;
  const segment = submission.contact?.profile_type;

  const tags = [
    marche              ? `marche:${marche}`               : null,
    segment             ? `segment:${segment}`              : null,
    maturityLevel       ? `maturity:${maturityLevel}`       : null,
    qualification?.status ? `qualification:${qualification.status}` : null,
    routing?.script     ? `script:${routing.script}`        : null,
    qualification?.status === "cold" ? "nurture:acculturation" : null,
  ].filter(Boolean);

  const body = {
    email:      submission.contact.email,
    attributes: { FIRSTNAME: submission.contact.nom, WEBINAR_QUALIFICATION: qualification?.status, WEBINAR_MATURITY: maturityLevel },
    listIds:    ESP_LIST_ID ? [ESP_LIST_ID] : [],
    updateEnabled: true,
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
  const webinar = await Webinar.findById(submission.webinar_id)
    .select("title date lang webinar_link")
    .lean()
    .catch(() => null);

  const synced = { notion: false, sheets: false, esp: false };

  await Promise.allSettled([
    pushToNotion(submission).then(() => { synced.notion = true; }).catch(() => {}),
    pushToSheets(submission).then(() => { synced.sheets = true; }).catch(() => {}),
    pushToEsp(submission)   .then(() => { synced.esp    = true; }).catch(() => {}),
    webinar && submission.contact?.email
      ? sendWebinarResultsEmail(submission, webinar).catch(() => {})
      : Promise.resolve(),
  ]);

  await WebinarSubmission.findByIdAndUpdate(submission._id, {
    "synced.notion": synced.notion,
    "synced.sheets": synced.sheets,
    "synced.esp":    synced.esp,
  }).catch(() => {});
}

module.exports = { fanOut };
