const { callLLM } = require("../../utils/bedrock-client");
const Webinar      = require("./webinar.model");

// ── Country → market mapping (still used for Notion multi-region DB routing) ──
const COUNTRY_TO_MARCHE = {
  "Tunisie": "tunisie", "Tunisia": "tunisie",
  "France": "europe_francophone", "Belgique": "europe_francophone",
  "Luxembourg": "europe_francophone", "Suisse": "europe_francophone", "Monaco": "europe_francophone",
  "Maroc": "maghreb", "Morocco": "maghreb",
  "Algérie": "maghreb", "Algeria": "maghreb", "Libye": "maghreb", "Libya": "maghreb",
  "Sénégal": "afrique_francophone", "Côte d'Ivoire": "afrique_francophone",
  "Cameroun": "afrique_francophone", "Mali": "afrique_francophone",
  "Burkina Faso": "afrique_francophone", "Guinée": "afrique_francophone",
  "Togo": "afrique_francophone", "Bénin": "afrique_francophone",
  "Niger": "afrique_francophone", "Tchad": "afrique_francophone",
  "Congo": "afrique_francophone", "Gabon": "afrique_francophone",
  "Madagascar": "afrique_francophone", "Rwanda": "afrique_francophone",
  "Burundi": "afrique_francophone",
  "Nigeria": "afrique_anglophone", "Kenya": "afrique_anglophone",
  "Ghana": "afrique_anglophone", "South Africa": "afrique_anglophone",
  "Egypt": "afrique_anglophone", "Ethiopia": "afrique_anglophone",
  "UAE": "moyen_orient", "Saudi Arabia": "moyen_orient", "Qatar": "moyen_orient",
  "Kuwait": "moyen_orient", "Bahrain": "moyen_orient", "Oman": "moyen_orient",
  "Jordan": "moyen_orient", "Lebanon": "moyen_orient", "Iraq": "moyen_orient",
};

function deriverMarche(pays) {
  if (!pays) return "autre";
  return COUNTRY_TO_MARCHE[pays.trim()] || "autre";
}

function clamp(n, min, max) {
  const v = Math.round(Number(n));
  if (Number.isNaN(v)) return min;
  return Math.max(min, Math.min(max, v));
}

const CATEGORIES = ["adoption", "governance", "quality", "antifraud"];

// Keyword hints used only when the LLM classification call fails — matched
// against the question's FR/EN label. "adoption" is the catch-all default.
const CATEGORY_KEYWORDS = {
  antifraud:  ["fraude", "fraud", "washing", "vigilance", "déclaratif", "trust", "confiance", "preuve", "audit trail"],
  governance: ["gouvernance", "governance", "conformité", "compliance", "policy", "politique", "cadre", "framework", "responsab"],
  quality:    ["qualité", "quality", "mesure", "measurement", "kpi", "évaluation", "evaluation", "précision", "accuracy"],
};

function classifyByKeywords(label) {
  const l = (label || "").toLowerCase();
  for (const cat of ["antifraud", "governance", "quality"]) {
    if (CATEGORY_KEYWORDS[cat].some(kw => l.includes(kw))) return cat;
  }
  return "adoption";
}

// ── Build the structured list of answered choice/select/multiselect questions,
//    each with the respondent's chosen option(s) and that option's admin-set
//    score (0–100, validated to sum to 100 across a question's options) ──────
function buildAnsweredChoiceList(questions, rawAnswers, isEn) {
  const list = [];
  for (const q of questions || []) {
    const isChoiceGroup = q.type === "choice" || q.type === "select" || q.type === "multiselect";
    if (!isChoiceGroup) continue;

    const raw = rawAnswers[q.key];
    const isEmptyArray = Array.isArray(raw) && raw.length === 0;
    if (raw === undefined || raw === null || raw === "" || isEmptyArray) continue;

    const label = (isEn ? q.label_en : q.label_fr) || q.label_fr || q.label_en;
    const selectedKeys = Array.isArray(raw) ? raw : [raw];
    const selectedOptions = selectedKeys
      .map(k => q.options?.find(o => o.key === k))
      .filter(Boolean);
    if (selectedOptions.length === 0) continue;

    const score = selectedOptions.reduce((s, o) => s + (o.score || 0), 0) / selectedOptions.length;
    const optionLabel = selectedOptions
      .map(o => (isEn ? o.label_en : o.label_fr) || o.label_fr || o.label_en)
      .join(", ");

    list.push({ key: q.key, label, optionLabel, score });
  }
  return list;
}

// ── Single LLM call: classify each answered question into one of the 4
//    maturity pillars, plus write the organizer-only free-text insights.
//    All numeric scoring stays deterministic JS math (see computeMaturityScoring)
//    — the LLM is only trusted for classification/text, never arithmetic ──────
async function classifyAndAnnotate(answeredQs, webinarTitle, isEn) {
  const systemPrompt = `You are a senior analyst qualifying webinar registrants on their AI maturity.

## Your mission
Given a respondent's answers to an AI-maturity questionnaire, do two things:

1. Classify EVERY answered question into exactly one of these 4 pillars:
   - "adoption": AI adoption, tool usage, day-to-day practice
   - "governance": governance, compliance, policy, accountability frameworks
   - "quality": quality control, measurement, KPIs, evaluation of AI outputs
   - "antifraud": fraud detection, AI-washing vigilance, trust/proof/validation

2. Write three short internal notes (NOT shown to the respondent):
   - key_insight: one sharp sentence about this respondent's overall profile
   - main_pain: one sentence describing their core AI-maturity gap
   - recommended_action: a specific next step for the sales/success team

## Critical rules
- Every question key given to you must appear in your "classifications" output.
- Base your classification on the question's actual content, not just keywords.
- All text fields must be in ${isEn ? "English" : "French"}.
- Respond with ONLY a valid JSON object — no markdown, no code fences.

## Required JSON format
{
  "classifications": { "<question_key>": "adoption" | "governance" | "quality" | "antifraud", ... },
  "key_insight": "<one sentence>",
  "main_pain": "<one sentence>",
  "recommended_action": "<one sentence>"
}`;

  const userMessage = `## Webinar
${webinarTitle ? `Topic: "${webinarTitle}"` : ""}

## Answered questions (question key — label — chosen answer)
${answeredQs.map(q => `- ${q.key} — ${q.label} — ${q.optionLabel}`).join("\n")}

Classify each question key and write the internal notes.`;

  const response = await callLLM({
    systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    temperature: 0.15,
    maxTokens: 700,
    timeout: 25000,
  });

  const text = (response.content || response.text || "").trim();
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in LLM response");

  const p = JSON.parse(jsonMatch[0]);
  const classifications = {};
  for (const q of answeredQs) {
    const c = p.classifications?.[q.key];
    classifications[q.key] = CATEGORIES.includes(c) ? c : classifyByKeywords(q.label);
  }

  return {
    classifications,
    key_insight:        typeof p.key_insight        === "string" ? p.key_insight.slice(0, 300)        : null,
    main_pain:           typeof p.main_pain          === "string" ? p.main_pain.slice(0, 300)          : null,
    recommended_action: typeof p.recommended_action === "string" ? p.recommended_action.slice(0, 300) : null,
  };
}

function classifyAndAnnotateFallback(answeredQs) {
  const classifications = {};
  for (const q of answeredQs) classifications[q.key] = classifyByKeywords(q.label);
  return { classifications, key_insight: null, main_pain: null, recommended_action: null };
}

function emptyScoring() {
  return {
    subScores: { adoption: 0, governance: 0, quality: 0, antifraud: 0 },
    total48: 0, total100: 0, maturityLevel: "beginner",
    strength: null, vigilance: null,
    qualification: { status: "cold", painSignal: false },
    routing: { script: null, recommend1on1: true, followUpTimeframe: "nurture, 1–3 months" },
    key_insight: null, main_pain: null, recommended_action: null,
  };
}

function routingFor(profileType, qualificationStatus) {
  const script = profileType === "staffing_bpo" ? "v1" : profileType === "enterprise_chro" ? "v2" : null;
  const recommend1on1 = profileType !== "referrer";
  const followUpTimeframe =
    qualificationStatus === "hot"  ? "within 48h" :
    qualificationStatus === "warm" ? "within 1 week" :
    "nurture, 1–3 months";
  return { script, recommend1on1, followUpTimeframe };
}

// ── Main entry point ───────────────────────────────────────────────────────────
async function computeMaturityScoring(rawAnswers, webinarId, lang = "fr", profileType = null) {
  const isEn = lang === "en";
  const webinar = await Webinar.findById(webinarId).select("title questions").lean().catch(() => null);
  const answeredQs = buildAnsweredChoiceList(webinar?.questions, rawAnswers, isEn);

  if (answeredQs.length === 0) {
    const empty = emptyScoring();
    empty.routing = routingFor(profileType, empty.qualification.status);
    return empty;
  }

  let annotation;
  try {
    annotation = await classifyAndAnnotate(answeredQs, webinar?.title, isEn);
  } catch (err) {
    console.error("[webinar-scoring] AI classification failed, falling back:", err.message);
    annotation = classifyAndAnnotateFallback(answeredQs);
  }

  const byCategory = { adoption: [], governance: [], quality: [], antifraud: [] };
  for (const q of answeredQs) {
    const cat = annotation.classifications[q.key] || "adoption";
    byCategory[cat].push(q);
  }

  const subScores = {};
  for (const cat of CATEGORIES) {
    const qs = byCategory[cat];
    const avg = qs.length ? qs.reduce((s, q) => s + q.score, 0) / qs.length : 0;
    subScores[cat] = clamp(avg * 12 / 100, 0, 12);
  }

  const total48  = CATEGORIES.reduce((s, c) => s + subScores[c], 0);
  const total100 = clamp(total48 * 100 / 48, 0, 100);
  const maturityLevel =
    total100 >= 78 ? "pioneer" :
    total100 >= 56 ? "practitioner" :
    total100 >= 34 ? "explorer" : "beginner";

  const sorted = [...answeredQs].sort((a, b) => b.score - a.score);
  const best  = sorted[0];
  const worst = sorted[sorted.length - 1];
  const toPoint = (q) => q ? { questionLabel: q.label, optionLabel: q.optionLabel, category: annotation.classifications[q.key] || "adoption" } : null;

  const painSignal = subScores.antifraud < 6 || subScores.quality < 6;
  let qualStatus =
    maturityLevel === "pioneer" || maturityLevel === "practitioner" ? "hot" :
    maturityLevel === "explorer" ? "warm" : "cold";
  if (painSignal && qualStatus !== "hot") qualStatus = qualStatus === "cold" ? "warm" : "hot";

  return {
    subScores, total48, total100, maturityLevel,
    strength:  toPoint(best),
    vigilance: toPoint(worst === best ? null : worst),
    qualification: { status: qualStatus, painSignal },
    routing: routingFor(profileType, qualStatus),
    key_insight:        annotation.key_insight,
    main_pain:          annotation.main_pain,
    recommended_action: annotation.recommended_action,
  };
}

module.exports = { deriverMarche, computeMaturityScoring };
