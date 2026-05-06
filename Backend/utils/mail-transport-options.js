/**
 * Builds nodemailer transport options from env.
 * Defaults: port 465 + TLS (most hosts). For STARTTLS (e.g. many Gmail SMTP setups), set:
 *   EMAIL_PORT=587
 *   EMAIL_SECURE=false
 *
 * If "from" does not match the authenticated mailbox, many providers reject or drop mail — use EMAIL_FROM
 * or rely on default (same as EMAIL_USER).
 */
function getMailTransportOptions() {
  const port = parseInt(process.env.EMAIL_PORT || '465', 10) || 465;
  const secureEnv = process.env.EMAIL_SECURE;
  const secure =
    secureEnv !== undefined
      ? /^true$/i.test(String(secureEnv))
      : port === 465;

  const opts = {
    host: process.env.EMAIL_HOST,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  };

  if (port === 587 && !secure) {
    opts.requireTLS = true;
  }

  return opts;
}

module.exports = { getMailTransportOptions };
