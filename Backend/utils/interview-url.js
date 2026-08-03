/**
 * Builds a base64url-encoded interview session URL.
 * Mirrors src/lib/interviewSession.ts on the frontend.
 *
 * @param {Object} params
 * @param {'post'|'skill'} params.type
 * @param {string} [params.jobId]
 * @param {string} [params.companyId]
 * @param {string} [params.ref]
 * @param {string} [params.skill]
 * @param {string} [params.category]
 * @param {string} [params.language]
 * @returns {string}  e.g. /interviews/eyJ0eXBlIjoicG9zdCIsImpvYklkIjoiNjRhOCJ9
 */
function buildInterviewUrl(params) {
  const json = JSON.stringify(params);
  const b64 = Buffer.from(json)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `/interviews/${b64}`;
}

module.exports = { buildInterviewUrl };
