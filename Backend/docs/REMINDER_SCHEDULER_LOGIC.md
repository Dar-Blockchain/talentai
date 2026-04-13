/**
 * REMINDER SCHEDULER - LOGIQUE CLARIFIÉE
 * 
 * ============================================
 * RÈGLES DE RENVOI DES REMINDERS
 * ============================================
 * 
 * Chaque candidat reçoit EXACTEMENT 2 reminders :
 * 
 * 1️⃣ FIRST REMINDER (24h après l'application)
 *    ├─ Condition: hoursElapsed >= 24 ET firstReminderSentAt === null
 *    ├─ Envoyé: Une seule fois, quand >= 24h depuis appliedAt
 *    ├─ Suivi: Date enregistrée dans firstReminderSentAt
 *    └─ Message: "We hope you're interested! This position closes in 24 hours..."
 *
 * 2️⃣ SECOND REMINDER (avant 24h de l'expiration)
 *    ├─ Condition: hoursUntilExpiration < 24 ET secondReminderSentAt === null
 *    ├─ Envoyé: Une seule fois, quand < 24h avant expirationDate
 *    ├─ Suivi: Date enregistrée dans secondReminderSentAt
 *    └─ Message: "⚠️ This position is closing soon! Less than 24 hours left..."
 * 
 * ============================================
 * EXEMPLE CHRONOLOGIQUE
 * ============================================
 * 
 * Scenario: Post créé le 15 avril, expire le 30 avril (15 jours)
 * 
 * 15 avril - 14h30: Candidat applique
 *    └─ JobApplication créé
 *       ├─ appliedAt: 15 avril 14h30
 *       ├─ firstReminderSentAt: null
 *       └─ secondReminderSentAt: null
 *
 * 16 avril - 14h30 (24h plus tard): Scheduler tourne
 *    └─ Condition: hoursElapsed >= 24 ✅
 *    ✉️ FIRST REMINDER ENVOYÉ
 *       └─ firstReminderSentAt: 16 avril 14h30
 *
 * 17-28 avril: Scheduler ne fait rien
 *    └─ Raison: 
 *       ├─ First déjà envoyé (firstReminderSentAt != null)
 *       └─ Second pas encore applicable (hoursUntilExpiration > 24)
 *
 * 29 avril - 15h00 (< 24h avant l'expiration): Scheduler tourne
 *    └─ Condition: hoursUntilExpiration < 24 ✅
 *    ✉️ SECOND REMINDER ENVOYÉ
 *       └─ secondReminderSentAt: 29 avril 15h00
 *
 * 30 avril - 14h30: Post expire
 *    └─ Aucun reminder supplémentaire
 * 
 * ============================================
 * CONTRÔLES D'INTÉGRITÉ
 * ============================================
 * 
 * ✅ Max 2 reminders par candidat:
 *    - firstReminderSentAt et secondReminderSentAt trackent chacun une date
 *    - Les conditions utilisent !== null pour éviter les envois dupliqués
 *
 * ✅ Timing correct:
 *    - 1er: APRÈS 24h de l'application
 *    - 2e: AVANT 24h restantes (< 24h avant expirationDate)
 *
 * ✅ Fenêtre horaire:
 *    - Envois uniquement entre 12:00 et 21:00
 *    - Horloge vérifiée à chaque heure (cron '0 * * * *')
 *
 * ============================================
 * VARIABLES UTILISÉES
 * ============================================
 * 
 * const REMINDER_CONFIG = {
 *   FIRST_REMINDER_HOURS: 24,    // Heures après application
 *   SECOND_REMINDER_HOURS: 24,   // Heures avant expiration
 * }
 * 
 * JobApplication fields:
 * - appliedAt: Date de création de l'application
 * - expirationDate: Date d'expiration du post
 * - firstReminderSentAt: Timestamp du 1er reminder (null si pas envoyé)
 * - secondReminderSentAt: Timestamp du 2e reminder (null si pas envoyé)
 * 
 * ============================================
 * FICHIERS ASSOCIÉS
 * ============================================
 * 
 * 📄 Backend/constants/scheduler.constants.js
 *    └─ Configuration des timings et messages
 *
 * 📄 Backend/cron/reminderScheduler.cron.js
 *    ├─ shouldSendFirstReminder()
 *    ├─ shouldSendSecondReminder()
 *    └─ runReminderJob()
 *
 * 📄 Backend/models/JobApplication.model.js
 *    ├─ firstReminderSentAt (Date)
 *    └─ secondReminderSentAt (Date)
 */
