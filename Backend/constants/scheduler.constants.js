/**
 * Scheduler Constants
 * Configuration and constants for auto-invite and reminder schedulers
 */

// ========== TEST MODE ==========
// Set TEST_MODE=true to use short timings and run cron every minute
const TEST_MODE = process.env.SCHEDULER_TEST_MODE === 'true';

// ========== TIME WINDOWS ==========
const SCHEDULER_TIME_WINDOW = {
  START_HOUR: TEST_MODE ? 0  : 12,   // TEST: all hours | PROD: 12:00 noon
  END_HOUR:   TEST_MODE ? 24 : 21,   // TEST: all hours | PROD: 21:00
  DESCRIPTION: TEST_MODE ? 'TEST — no time restriction' : 'Emails only sent between 12:00 and 21:00'
};

// ========== AUTO INVITE SCHEDULER ==========
const AUTO_INVITE_CONFIG = {
  // Time thresholds
  FIRST_INVITE_HOURS: TEST_MODE ? (2 / 60) : 24,      // TEST: 2 min | PROD: 24h after application
  RECURRING_INVITE_HOURS: TEST_MODE ? (5 / 60) : 48,  // TEST: 5 min | PROD: 48h

  // Batch processing
  BATCH_LIMIT: 10,             // Process max 10 applications per run

  // Cron schedule — every minute in test, every hour in prod
  CRON_PATTERN: TEST_MODE ? '* * * * *' : '0 * * * *',

  // Application statuses to process
  VALID_STATUSES: ['visited'],

  // Messages
  MESSAGES: {
    INIT: '🚀 Initializing auto-invite scheduler...',
    RUNNING: '✅ Auto-invite scheduler running: Hourly (daily between 12:00 - 21:00) until interview completed',
    OUTSIDE_WINDOW: '⏭️  Outside time window. Skipping auto-invitations.',
    WITHIN_WINDOW: '✅ Within time window (12:00 - 21:00). Processing auto-invitations...',
    FOUND_APPLICATIONS: '📊 Found %firstTime% first-time + %recurring% recurring invites',
    TOTAL_ELIGIBLE: '   Total: %total% application(s) eligible for auto-invitation',
    NO_PENDING: '✅ No pending auto-invitations at this time',
    BATCH_COMPLETE: '📊 Auto-invitation batch complete:',
    SENT: '   ✅ Sent: %count%',
    FAILED: '   ❌ Failed: %count%',
    PROCESSING_APP: '📧 [AUTO INVITATION] Processing application: %id%',
    CANDIDATE_PROFILE_NOT_FOUND: '❌ Candidate profile not found for application: %id%',
    POST_NOT_FOUND: '❌ Post not found for application: %id%',
    COMPANY_NOT_FOUND: '❌ Company not found for post: %id%',
    EMAIL_FAILED: '❌ Failed to send email to %email%',
    EMAIL_SUCCESS: '✅ Email sent successfully to %email%',
    APP_UPDATED: '✅ Application updated - Invitation #%count% sent',
    ERROR: '❌ Error sending auto invitation for application %id%: %error%',
    JOB_ERROR: '❌ [AUTO INVITE SCHEDULER] Error: %error%'
  }
};

// ========== REMINDER SCHEDULER ==========
const REMINDER_CONFIG = {
  // Reminder timings
  // TEST:  first after 5 min, second when expiry < 10 min away
  // PROD:  first after 72h (3 days), second when expiry < 24h away
  FIRST_REMINDER_HOURS:  TEST_MODE ? (5  / 60) : 72,
  SECOND_REMINDER_HOURS: TEST_MODE ? (10 / 60) : 24,

  // Cron schedule — every minute in test, daily 09:30 in prod
  CRON_PATTERN: TEST_MODE ? '* * * * *' : '30 09 * * *',
  
  // Application statuses to process
  VALID_STATUSES: ['visited'],

  // Reminder types
  TYPES: {
    FIRST_REMINDER: '24h',     // After 24 hours of application
    SECOND_REMINDER: 'before_exp'  // Before 24h before expiration
  },
  
  // Messages
  MESSAGES: {
    INIT: '🚀 Initializing Interview Reminder Scheduler...',
    INITIALIZED: '✅ Reminder scheduler initialized:',
    FREQUENCY: '   ⏰ Frequency: Every hour (checks during 12:00 - 21:00)',
    FIRST_REMINDER_DESC: '   🔔 First reminder: 24 hours after application',
    SECOND_REMINDER_DESC: '   🔔 Second reminder: Less than 24 hours before post expiration',
    STOPS_WHEN: '   ⛔ Stops when: Interview completed',
    EMAIL_WINDOW: '   📧 Only sends emails between 12:00 and 21:00',
    JOB_RUNNING: '⏰ [REMINDER SCHEDULER] Running at %datetime%',
    OUTSIDE_WINDOW: '⏭️  Outside time window (current hour: %hour%). Skipping.',
    WITHIN_WINDOW: '✅ Within time window. Processing reminders...',
    FOUND_APPLICATIONS: '📊 Found %count% pending applications',
    SKIPPING_NO_POST: '⏭️  Skipping - post not found',
    APP_HEADER: '📋 Application: %id%',
    HOURS_SINCE_APPLICATION: '   ⏱️  Since application: %hours%h',
    HOURS_UNTIL_EXPIRATION: '   ⏳ Until expiration: %hours%h',
    APP_STATUS: '   Status: %status%',
    FIRST_CHECK: '   [FIRST CHECK] Hours: %hours%h, Already sent: %sent%, Should send: %shouldSend%',
    SECOND_CHECK: '   [SECOND CHECK] Hours until expiration: %hours%h',
    SECOND_CHECK_CONDITIONS: '                 Within 24h: %within%, Not sent: %notSent%',
    SECOND_CHECK_RESULT: '                 Should send: %shouldSend%',
    REMINDER_HEADER: '📧 [REMINDER - %type%] Processing application: %id%',
    CANDIDATE_NOT_FOUND: '   ❌ Candidate profile not found',
    COMPANY_NOT_FOUND: '   ❌ Company not found',
    EMAIL_FAILED: '   ❌ Failed to send email',
    EMAIL_SUCCESS: '   ✅ Email sent successfully',
    DB_UPDATED: '   ✅ Database updated - %type% reminder tracked',
    DB_ERROR: '   ❌ Error updating database: %error%',
    JOB_COMPLETE: '📊 Reminder job complete:',
    FIRST_REMINDERS_SENT: '   🔔 First reminders (24h):  %count%',
    SECOND_REMINDERS_SENT: '   🔔 Second reminders (<24h before exp): %count%',
    SKIPPED: '   ⏭️  Skipped: %count%',
    TOTAL_SENT: '   📈 Total reminders sent: %count%',
    JOB_ERROR: '❌ [REMINDER SCHEDULER] Error: %error%'
  }
};

// ========== SHARED CONFIGURATIONS ==========
const SHARED_CONFIG = {
  TIME_WINDOW: SCHEDULER_TIME_WINDOW,
  
  // Email info structure
  EMAIL_INFO_TEMPLATE: {
    email: 'candidateEmail@example.com',
    candidateName: 'John Doe',
    jobTitle: 'Software Engineer',
    companyName: 'Tech Company'
  }
};

module.exports = {
  SCHEDULER_TIME_WINDOW,
  AUTO_INVITE_CONFIG,
  REMINDER_CONFIG,
  SHARED_CONFIG
};
