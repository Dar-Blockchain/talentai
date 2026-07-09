const { callLLM } = require("../../utils/bedrock-client");
const Webinar      = require("./webinar.model");

// ── Country → market mapping ──────────────────────────────────────────────────
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

// Valid enum values — used for both LLM response validation and fallback scoring
const VALID_ICP_FIT = ["ok", "faible", "hors"];
const VALID_THESE   = ["v1", "v2", "v3", "indetermine"];
const VALID_TIER    = ["A", "B", "C", "D"];

function deriverMarche(pays) {
  if (!pays) return "autre";
  return COUNTRY_TO_MARCHE[pays.trim()] || "autre";
}

function clamp100(n) { return Math.max(0, Math.min(100, Math.round(Number(n) || 0))); }

// ── Build rich Q&A block from the actual webinar questions stored in DB ───────
async function buildQABlock(webinarId, rawAnswers, lang = "fr") {
  try {
    const webinar = await Webinar.findById(webinarId).select("title questions").lean();
    if (!webinar?.questions?.length) return { block: null, title: null };

    const lines = [...webinar.questions]
      .sort((a, b) => a.order - b.order)
      .flatMap(q => {
        const raw = rawAnswers[q.key];
        if (raw === undefined || raw === null || raw === "") return [];

        const label = (lang === "en" ? q.label_en : q.label_fr) || q.label_fr || q.label_en;

        let answer;
        if (q.type === "scale") {
          answer = `${raw}/5`;
        } else if (q.type === "text") {
          answer = String(raw).trim().slice(0, 600);
        } else {
          const opt = q.options?.find(o => o.key === raw);
          answer = opt
            ? `${lang === "en" ? opt.label_en : opt.label_fr} [key: ${raw}]`
            : String(raw);
        }

        return [`• ${label}\n  → ${answer}`];
      });

    return { block: lines.join("\n\n") || null, title: webinar.title };
  } catch {
    return { block: null, title: null };
  }
}

// ── Main AI scoring ───────────────────────────────────────────────────────────
async function calculerScoreIA(rawAnswers, webinarId, lang = "fr") {
  const marche = deriverMarche(rawAnswers.pays || rawAnswers.q4_pays || "");
  const { block: qaBlock, title: webinarTitle } = await buildQABlock(webinarId, rawAnswers, lang);

  const answersForPrompt = qaBlock
    || Object.entries(rawAnswers)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => `• ${k}: ${v}`)
        .join("\n");

  const isEn = lang === "en";

  const systemPrompt = `You are a senior analyst specializing in lead qualification and audience profiling for webinars and online events.

## Your mission
Analyze a respondent's answers to a webinar registration questionnaire and produce a rich, multi-dimensional qualification report. The webinar topic may be anything — AI, marketing, finance, HR, sales, productivity, etc. Adapt your analysis to whatever topic the webinar covers.

## Scoring dimensions

### 1. maturite_ia (0–100) — Topic Maturity / Knowledge Level
How knowledgeable and experienced is this person regarding the webinar's topic?
- 0–20: Complete beginner, no prior exposure
- 21–40: Aware of the topic but no hands-on experience
- 41–60: Has experimented or has basic working knowledge
- 61–80: Experienced practitioner, uses it regularly
- 81–100: Expert or advanced user, seeking to go deeper or scale

### 2. intensite_pain (0–100) — Problem Intensity / Engagement Level
How acute is their challenge or need related to the webinar topic?
- 0–20: No real problem, attending out of curiosity
- 21–40: Mild friction, not a priority right now
- 41–60: Real pain or need, actively looking for improvement
- 61–80: Significant challenge impacting their work or goals
- 81–100: Urgent, critical problem they need to solve now

### 3. readiness_score (0–100) — Readiness to Act / Conversion Potential
How likely are they to take a concrete next step after the webinar?
- 0–30: Just learning, no urgency, not ready for any action
- 31–60: Interested but needs nurturing, action possible in months
- 61–80: Ready to evaluate solutions or book a follow-up
- 81–100: Ready to act now — pilot, purchase, or book immediately

### 4. icp_fit — Ideal profile match for the webinar's target audience
- "ok": Perfect fit for the webinar's target audience
- "faible": Partial fit — some relevant signals but gaps exist
- "hors": Out of scope — wrong profile for this webinar's topic or goals

### 5. these — Which angle/pitch resonates most with this respondent
- "v1": They need speed and efficiency — doing more with less
- "v2": They need quality and precision — better decisions, less error
- "v3": They need trust and proof — validation, compliance, or credibility
- "indetermine": Signal unclear

### 6. tier — Follow-up priority
- "A": High priority — act within 48h, strong engagement and fit
- "B": Good prospect — follow up within 1 week
- "C": Nurture — not ready now, re-engage in 1–3 months
- "D": Low priority — wrong profile, no clear need or fit

### 7. key_insight — The single most important observation about this respondent
One sharp, specific sentence grounded in their actual answers.

### 8. main_pain — Their primary challenge in plain language
One concrete sentence describing what's blocking or frustrating them most right now.

### 9. recommended_action — What to do next with this lead
Specific, actionable next step tailored to their profile and the webinar topic.

### 10. strengths — What makes this respondent promising (array of 2–4 short strings)
Concrete positive signals from their answers.

### 11. blockers — What could limit engagement or conversion (array of 1–3 short strings)
Real friction points or risks based on their answers.

## Critical rules
- Adapt your analysis entirely to the webinar topic — do NOT assume it is about HR or AI recruiting unless the topic says so.
- Be honest and precise — not everyone is Tier A. Most respondents are B or C.
- Calibrate your scores across the full 0–100 range. Avoid clustering everything at 50–70.
- Reference specific answers when writing key_insight, main_pain, recommended_action.
- All text fields must be in ${isEn ? "English" : "French"}.
- Respond with ONLY a valid JSON object — no markdown, no explanation, no code blocks outside the JSON.

## Required JSON format
{
  "maturite_ia": <integer 0-100>,
  "intensite_pain": <integer 0-100>,
  "readiness_score": <integer 0-100>,
  "icp_fit": "ok" | "faible" | "hors",
  "these": "v1" | "v2" | "v3" | "indetermine",
  "tier": "A" | "B" | "C" | "D",
  "key_insight": "<one sharp sentence about this respondent>",
  "main_pain": "<one sentence describing their core challenge>",
  "recommended_action": "<specific next step>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "blockers": ["<blocker 1>", "<blocker 2>"]
}`;

  const userMessage = `## Webinar context
${webinarTitle ? `Webinar topic: "${webinarTitle}"` : ""}
Market/Region: ${marche !== "autre" ? marche : (rawAnswers.pays || rawAnswers.q4_pays || "unknown")}
Respondent language: ${lang.toUpperCase()}

## Prospect's answers
${answersForPrompt}

Analyze these answers and return the full qualification JSON.`;

  try {
    const response = await callLLM({
      systemPrompt,
      messages: [{ role: "user", content: userMessage }],
      temperature: 0.15,
      maxTokens: 900,
      timeout: 25000,
    });

    const text = (response.content || response.text || "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in LLM response");

    const p = JSON.parse(jsonMatch[0]);
    return {
      maturite_ia:        clamp100(p.maturite_ia),
      intensite_pain:     clamp100(p.intensite_pain),
      readiness_score:    clamp100(p.readiness_score),
      icp_fit:            VALID_ICP_FIT.includes(p.icp_fit) ? p.icp_fit : "faible",
      these:              VALID_THESE.includes(p.these)     ? p.these   : "indetermine",
      tier:               VALID_TIER.includes(p.tier)       ? p.tier    : "C",
      key_insight:        typeof p.key_insight        === "string" ? p.key_insight.slice(0, 300)        : null,
      main_pain:          typeof p.main_pain          === "string" ? p.main_pain.slice(0, 300)          : null,
      recommended_action: typeof p.recommended_action === "string" ? p.recommended_action.slice(0, 300) : null,
      strengths:          Array.isArray(p.strengths) ? p.strengths.slice(0, 4).map(s => String(s).slice(0, 120)) : [],
      blockers:           Array.isArray(p.blockers)  ? p.blockers.slice(0, 3).map(s => String(s).slice(0, 120))  : [],
    };
  } catch (err) {
    console.error("[webinar-scoring] AI scoring failed, falling back:", err.message);
    return calculerScoreFallback(rawAnswers);
  }
}

// ── Deterministic fallback ────────────────────────────────────────────────────

// Each answer may come from a legacy key or the new DB-driven key (qN_xxx).
const ANSWER_KEY_MAP = {
  role:                    ["role",     "q1_role"],
  secteur:                 ["secteur",  "q2_secteur"],
  volume:                  ["volume",   "q3_volume"],
  pays:                    ["pays",     "q4_pays"],
  usage_ia:                ["usage_ia", "q5_usage_ia"],
  frein:                   ["frein",    "q6_frein"],
  legitimite_entretien_ia: ["legitimite_entretien_ia", "q7_legitimite"],
  etape_douloureuse:       ["etape_douloureuse",       "q8_etape"],
  time_to_hire:            ["time_to_hire",            "q9_tth"],
  verbatim:                ["verbatim", "q10_verbatim"],
  intention:               ["intention","q11_intention"],
};

function pick(answers, key) {
  const [primary, fallback] = ANSWER_KEY_MAP[key];
  return answers[primary] ?? answers[fallback];
}

function calculerScoreFallback(answers) {
  const usage_ia                = pick(answers, "usage_ia");
  const legitimite_entretien_ia = pick(answers, "legitimite_entretien_ia");
  const etape_douloureuse       = pick(answers, "etape_douloureuse");
  const time_to_hire            = pick(answers, "time_to_hire");
  const verbatim                = pick(answers, "verbatim");
  const volume                  = pick(answers, "volume");
  const role                    = pick(answers, "role");
  const secteur                 = pick(answers, "secteur");
  const intention               = pick(answers, "intention");
  const marche                  = deriverMarche(pick(answers, "pays"));

  const baseMap     = { jamais: 0, curieux: 33, ponctuel: 66, integre: 100 };
  const base        = baseMap[usage_ia] ?? 0;
  const legit       = ((Number(legitimite_entretien_ia) || 1) - 1) * 25;
  const maturite_ia = Math.round(0.6 * base + 0.4 * legit);

  const etapePoids     = { casting: 100, fraude: 90, entretiens: 80, delais: 60, tri: 50, decision: 50, sourcing: 40 };
  const etapePond      = etapePoids[etape_douloureuse] ?? 0;
  const bonusTemps     = time_to_hire === "gt2m" ? 20 : time_to_hire === "1_2m" ? 10 : 0;
  const bonusVerb      = verbatim && String(verbatim).trim().length > 0 ? 10 : 0;
  const intensite_pain = Math.min(100, etapePond + bonusTemps + bonusVerb);

  let icp_fit;
  if (marche === "autre" || role === "autre") icp_fit = "hors";
  else if (["50_200", "gt200"].includes(volume) || ["rh", "dirigeant", "cabinet"].includes(role)) icp_fit = "ok";
  else icp_fit = "faible";

  let these;
  if (["50_200", "gt200"].includes(volume) || ["cabinet", "bpo"].includes(secteur)) these = "v1";
  else if (["rh", "dirigeant"].includes(role) && ["entretiens", "casting", "decision"].includes(etape_douloureuse)) these = "v2";
  else these = "indetermine";

  let tier;
  if (icp_fit === "hors") tier = "D";
  else if (intention === "oui" && intensite_pain >= 60 && icp_fit === "ok") tier = "A";
  else if (intensite_pain >= 60 && ["oui", "peut_etre"].includes(intention)) tier = "B";
  else tier = "C";

  const readiness_score = Math.min(100, Math.round(
    (intensite_pain * 0.4) + (maturite_ia * 0.3) + (intention === "oui" ? 30 : intention === "peut_etre" ? 15 : 0)
  ));

  return {
    maturite_ia, intensite_pain, readiness_score,
    icp_fit, these, tier,
    key_insight: null, main_pain: null, recommended_action: null,
    strengths: [], blockers: [],
  };
}

module.exports = { deriverMarche, calculerScoreIA, calculerScoreFallback };
