// Shared by reset-quota.cron.js (which actually performs the reset) and
// profile.service.js (which computes quotaResetAt for the API response) so
// the two never drift out of sync.
//
// parseFloat (not parseInt) so fractional values work for testing -- e.g.
// QUOTA_RESET_DAYS=0.02 (~29 min) to watch a full cycle without waiting a
// real day. Falls back to 30 when unset or unparseable.
const parsed = parseFloat(process.env.QUOTA_RESET_DAYS);
const QUOTA_RESET_DAYS = Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
const QUOTA_RESET_MS = QUOTA_RESET_DAYS * 24 * 60 * 60 * 1000;

module.exports = { QUOTA_RESET_DAYS, QUOTA_RESET_MS };
