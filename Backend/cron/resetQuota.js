// cron/resetQuota.js
const cron = require("node-cron");
const Profile = require("../models/ProfileModel");

// 🕛 Planification : chaque jour à 00h00
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("🔁 Vérification et réinitialisation des quotas (si >30 jours)...");

    const now = new Date();
    const thresholdDate = new Date(now.setDate(now.getDate() - 30)); // il y a 30 jours

    // On sélectionne uniquement les profils dont le quotaUpdatedAt est plus vieux que 30 jours
    const result = await Profile.updateMany(
      { quotaUpdatedAt: { $lte: thresholdDate } },
      { $set: { quota: 0, quotaUpdatedAt: new Date() } }
    );

    console.log(`✅ Quotas réinitialisés pour ${result.modifiedCount} profils (inactifs depuis ≥30 jours).`);
  } catch (error) {
    console.error("❌ Erreur lors de la réinitialisation des quotas :", error);
  }
});
