const { callLLM } = require('../../../../utils/bedrock-client');
const logger = require('../../../../utils/logger');

const CLEANUP_TIMEOUT_MS = 3000;
const MIN_LEN_FOR_CLEANUP = 20;
const SKIP_MARKER = '[SKIPPED]';

function extractJdKeywords(session) {
  const jd = session?.jobData || session?.jobDetails || session?.config?.jobData || {};
  const skills = []
    .concat(jd?.skillAnalysis?.requiredSkills || [])
    .concat(jd?.skillAnalysis?.softSkills || [])
    .map(s => s?.name)
    .filter(Boolean);
  const cfgSkills = (session?.config?.skills || session?.config?.requiredSkills || [])
    .map(s => typeof s === 'string' ? s : s?.name)
    .filter(Boolean);
  return [...new Set([...skills, ...cfgSkills])].slice(0, 40);
}

function looksLikeParaphrase(original, cleaned) {
  if (!cleaned) return true;
  const ol = original.trim().length;
  const cl = cleaned.trim().length;
  if (cl < ol * 0.6) return true;
  if (cl > ol * 1.6) return true;
  return false;
}

/**
 * Non-blocking transcript cleanup for accent-driven speech-to-text errors.
 * Fixes only likely mis-hearings (technical terms, proper nouns, phonetic substitutions).
 * Never paraphrases. On any failure returns the original transcript.
 *
 * @param {string} transcript
 * @param {object} ctx - { session, lastQuestion }
 * @returns {Promise<string>}
 */
async function cleanupTranscript(transcript, { session, lastQuestion } = {}) {
  if (!transcript || typeof transcript !== 'string') return transcript;
  const raw = transcript.trim();
  if (raw === SKIP_MARKER) return raw;
  if (raw.length < MIN_LEN_FOR_CLEANUP) return raw;

  const jdKeywords = session ? extractJdKeywords(session) : [];

  const systemPrompt = [
    'You are a transcription cleanup assistant for live technical interviews.',
    'The candidate speaks accented English (often Nigerian, Indian, Filipino or another West African / South Asian variant).',
    'The transcript is from real-time speech-to-text and may contain mis-hearings on:',
    '- technical terms ("Nexus" → "Next.js", "no JS" → "Node.js", "express us" → "Express", "type strip" → "TypeScript", "kew barnets" → "Kubernetes")',
    '- proper nouns (candidate name, company name, prior employers, product names)',
    '- accent-driven phonetic substitutions ("tink"→"think", "dat"→"that", "wit"→"with", "de"→"the")',
    '',
    'RULES (strict):',
    '1. Return ONLY the corrected transcript. No preamble, no quotes, no explanation.',
    '2. Do NOT paraphrase, summarize, add words, change tense, or expand contractions.',
    '3. Do NOT invent facts, technologies, or dates that were not spoken.',
    '4. Preserve the candidate\'s grammar and word order — only fix words that look like transcription errors.',
    '5. If the transcript is already clean, return it exactly unchanged.',
    '6. Never say "I cannot" or "I don\'t know" — return the original transcript if unsure.',
  ].join('\n');

  const userContext = [
    lastQuestion ? `Last interviewer question: ${String(lastQuestion).slice(0, 400)}` : null,
    jdKeywords.length ? `JD keywords (candidate is likely to mention): ${jdKeywords.join(', ')}` : null,
    '',
    'Transcript to clean:',
    raw,
  ].filter(Boolean).join('\n');

  try {
    const { content } = await callLLM({
      systemPrompt,
      messages: [{ role: 'user', content: userContext }],
      temperature: 0.0,
      maxTokens: Math.min(1024, Math.ceil(raw.length * 1.5 / 3)), // ~char/token≈3
      timeout: CLEANUP_TIMEOUT_MS,
      useFastModel: true, // Nova Lite
    });
    const cleaned = (content || '').trim().replace(/^["']|["']$/g, '');
    if (!cleaned) return raw;
    if (looksLikeParaphrase(raw, cleaned)) {
      logger.info?.('transcript-cleanup: rejected (looks like paraphrase)', { origLen: raw.length, cleanedLen: cleaned.length });
      return raw;
    }
    return cleaned;
  } catch (err) {
    logger.warn?.('transcript-cleanup: failed, using raw', { err: err?.message });
    return raw;
  }
}

module.exports = { cleanupTranscript };
