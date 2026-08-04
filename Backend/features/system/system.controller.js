// Calculated ONCE at server startup — never changes until next deploy
const VERSION = Date.now().toString();
const DEPLOYED_AT = new Date().toISOString();

const getVersion = async (req, res) => {
  return res.json({
    version: VERSION,
    deployedAt: DEPLOYED_AT,
  });
};

module.exports = { getVersion };