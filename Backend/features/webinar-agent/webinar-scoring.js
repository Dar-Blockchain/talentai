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

function deriverMarche(pays) {
  if (!pays) return "autre";
  return COUNTRY_TO_MARCHE[pays.trim()] || "autre";
}

// ── Build rich Q&A block from the actual webinar questions stored in DB ───────
async function buildQABlock(webinarId, rawAnswers, lang = "fr") {
  try {
    const webinar = await Webinar.findById(webinarId).select("title questions").lean();
    if (!webinar || !webinar.questions?.length) return { block: null, title: null };

    const sorted = [...webinar.questions].sort((a, b) => a.order - b.order);
    const lines  = [];

    for (const q of sorted) {
      const raw = rawAnswers[q.key];
      if (raw === undefined || raw === null || raw === "") continue;

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

      lines.push(`• ${label}\n  → ${answer}`);
    }

    return { block: lines.join("\n\n"), title: webinar.title };
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

  const systemPrompt = `You are a senior B2B sales qualification analyst and AI adoption strategist at Talent AI — an AI-powered hiring platform that automates candidate screening, interviews, and assessment for mid-to-large companies.

## Your mission
Analyze a prospect's webinar registration answers and produce a rich, multi-dimensional qualification report. You combine the skills of a sales director, a consultant in HR tech, and a behavioral analyst.

## About Talent AI
- Core product: AI agents that conduct structured interviews, assess candidates, detect fraud, and rank applicants automatically
- Target customers: HR teams, recruiters, hiring managers, and CEOs at companies doing 10+ hires/year
- Key differentiators: speed (10x faster screening), consistency (no human bias), fraud detection, multilingual support
- Primary markets: France, Tunisia, Maghreb, West Africa, Gulf states

## Scoring dimensions

### 1. maturite_ia (0–100) — AI Maturity
How digitally advanced and AI-ready is this person/organization?
- 0–20: Never heard of AI in HR, skeptical or fearful
- 21–40: Curious but no concrete usage, wants to understand basics
- 41–60: Has experimented with AI tools (ChatGPT, ATS, etc.) occasionally
- 61–80: Uses AI regularly in workflow, understands ROI
- 81–100: AI-native, already integrated multiple tools, seeks to scale

### 2. intensite_pain (0–100) — Recruitment Pain Intensity
How acute and urgent is their hiring problem?
- 0–20: Recruiting is not a major issue for them
- 21–40: Some friction but manageable, not a priority
- 41–60: Real pain, losing time or quality candidates, wants a solution
- 61–80: Significant pain, impacting business, actively searching for solutions
- 81–100: Crisis level — bad hires, fraud, extreme delays, burning money

### 3. readiness_score (0–100) — Overall Readiness to Act
Composite signal: willingness × urgency × budget signal × decision power
- 0–30: Not ready, just learning
- 31–60: Potentially ready in 3–6 months
- 61–80: Ready to evaluate in the next 30–60 days
- 81–100: Ready to pilot now or buy now

### 4. icp_fit — Ideal Customer Profile match
- "ok": Perfect fit — right role, right volume, right market, decision power
- "faible": Partial fit — some criteria match but gaps exist
- "hors": Out of scope — wrong market, wrong role, or no recruitment activity

### 5. these — Which Talent AI pitch resonates most
- "v1": Volume & speed — they need to process many applicants faster
- "v2": Quality & compliance — they want better decisions, less bias, audit trail
- "v3": Fraud & verification — identity fraud, diploma fraud, ghost candidates is their #1 pain
- "indetermine": Signal unclear

### 6. tier — Sales priority tier
- "A": Hot lead — act within 48h, all signals green (pain ≥65, maturity ≥50, ICP ok, wants to pilot)
- "B": Warm lead — follow up within 1 week (strong pain OR maturity but not both, or ICP faible)
- "C": Nurture — monthly touchpoint, not ready now but could be in 3–6 months
- "D": Disqualified — wrong profile, no budget signal, no hiring needs, out of market

### 7. key_insight — The single most important thing to know about this prospect
One sharp, specific sentence that would help a sales rep prepare for the call. Reference their actual answers.

### 8. main_pain — Their primary pain point in plain language
One concrete sentence describing what's costing them time/money/quality right now.

### 9. recommended_action — What Talent AI should do next for this lead
Specific, actionable next step (e.g., "Send a case study on fraud detection in the BPO sector", "Invite to a live demo focused on volume screening")

### 10. strengths — What makes this lead promising (array of 2–4 short strings)
Concrete positive signals from their answers.

### 11. blockers — What could prevent a sale (array of 1–3 short strings)
Real friction points or risks based on their answers.

## Critical rules
- Be brutally honest and precise — not everyone is Tier A. Most real leads are B or C.
- Calibrate your scores across the full range. Avoid clustering everything at 50–70.
- Reference specific answers when writing key_insight, main_pain, recommended_action.
- Write key_insight, main_pain, recommended_action, strengths, and blockers in ${isEn ? "English" : "French"}.
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
  "key_insight": "<one sharp sentence about this prospect>",
  "main_pain": "<one sentence describing their core recruitment problem>",
  "recommended_action": "<specific next step for the sales team>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
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

    const parsed = JSON.parse(jsonMatch[0]);

    const scoring = {
      maturite_ia:        Math.max(0, Math.min(100, Math.round(Number(parsed.maturite_ia)        || 0))),
      intensite_pain:     Math.max(0, Math.min(100, Math.round(Number(parsed.intensite_pain)     || 0))),
      readiness_score:    Math.max(0, Math.min(100, Math.round(Number(parsed.readiness_score)    || 0))),
      icp_fit:            ["ok", "faible", "hors"].includes(parsed.icp_fit)                        ? parsed.icp_fit    : "faible",
      these:              ["v1", "v2", "v3", "indetermine"].includes(parsed.these)                 ? parsed.these      : "indetermine",
      tier:               ["A", "B", "C", "D"].includes(parsed.tier)                              ? parsed.tier       : "C",
      key_insight:        typeof parsed.key_insight        === "string" ? parsed.key_insight.slice(0, 300)   : null,
      main_pain:          typeof parsed.main_pain          === "string" ? parsed.main_pain.slice(0, 300)     : null,
      recommended_action: typeof parsed.recommended_action === "string" ? parsed.recommended_action.slice(0, 300) : null,
      strengths:          Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4).map(s => String(s).slice(0, 120)) : [],
      blockers:           Array.isArray(parsed.blockers)  ? parsed.blockers.slice(0, 3).map(s => String(s).slice(0, 120))  : [],
    };

    return scoring;
  } catch (err) {
    console.error("[webinar-scoring] AI scoring failed, falling back:", err.message);
    return calculerScoreFallback(rawAnswers);
  }
}

// ── Deterministic fallback ────────────────────────────────────────────────────
function calculerScoreFallback(answers) {
  const usage_ia                = answers.usage_ia                || answers.q5_usage_ia;
  const legitimite_entretien_ia = answers.legitimite_entretien_ia || answers.q7_legitimite;
  const etape_douloureuse       = answers.etape_douloureuse       || answers.q8_etape;
  const time_to_hire            = answers.time_to_hire            || answers.q9_tth;
  const verbatim                = answers.verbatim                || answers.q10_verbatim;
  const volume                  = answers.volume                  || answers.q3_volume;
  const role                    = answers.role                    || answers.q1_role;
  const secteur                 = answers.secteur                 || answers.q2_secteur;
  const intention               = answers.intention               || answers.q11_intention;
  const marche                  = deriverMarche(answers.pays      || answers.q4_pays);

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
