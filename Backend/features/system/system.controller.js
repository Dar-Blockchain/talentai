const { execSync } = require("child_process");

class SystemController {
  static async getVersion(req, res) {
    let version = "unknown";
    try {
      version = execSync("git rev-parse --short HEAD").toString().trim();
    } catch (error) {
      console.error("❌ Failed to resolve git commit hash:", error.message);
    }

    return res.json({
      version,
      deployedAt: new Date().toISOString(),
    });
  }
}

module.exports = SystemController;
