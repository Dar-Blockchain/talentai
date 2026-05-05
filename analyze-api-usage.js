/**
 * API Usage Analyzer - Script Helper pour Frontend
 * 
 * Ce script aide à analyser quels endpoints API sont réellement utilisés dans le code frontend
 * 
 * Usage:
 * 1. Copiez ce fichier dans votre projet frontend
 * 2. Exécutez: node analyze-api-usage.js
 * 3. Consultez le rapport généré
 */

const fs = require('fs');
const path = require('path');

// Tous les endpoints API du backend
const API_ENDPOINTS = {
  auth: [
    '/auth/register',
    '/auth/login',
    '/auth/verify-otp',
    '/auth/resend-otp',
    '/auth/analyze',
    '/auth/warnUser',
    '/auth/logout',
    '/auth/check-role',
  ],
  profile: [
    '/profiles/me',
    '/profiles/createOrUpdateProfile',
    '/profiles/updateProfileVisibility',
    '/profiles/:userId',
    '/profiles/createOrUpdateCompanyProfile',
    '/profiles/search/skills',
    '/profiles/addSoftSkills',
    '/profiles/getSoftSkills',
    '/profiles/getSoftSkillsById/:userId',
    '/profiles/deleteHardSkill',
    '/profiles/deleteSoftSkills',
    '/profiles/getCompanyWithAssessments',
    '/profiles/:profileId/payments',
    '/profiles/:profileId/payments/active',
    '/profiles/:profileId/payments/add',
    '/profiles/updateFinalBid',
  ],
  posts: [
    '/post/search',
    '/post/details/:id',
    '/post/public-stats',
    '/post/save-post',
    '/post/get-all-posts',
    '/post/my-posts',
    '/post/metrics',
    '/post/getPostById/:id',
    '/post/updatePost/:id',
    '/post/updatePostStatus/:id',
    '/post/deletePost/:id',
    '/post/generate-job-post',
  ],
  jobApplications: [
    '/job-applications/post/:postId',
    '/job-applications',
    '/job-applications/candidate/my',
    '/job-applications/candidate/my/stats',
    '/job-applications/company/my',
    '/job-applications/contact-candidate',
    '/job-applications/post/:postId/summary',
    '/job-applications/company/my/summary',
    '/job-applications/company/my/metrics',
    '/job-applications/company/my/cvs/download',
    '/job-applications/auto-invite/trigger',
    '/job-applications/reminder/trigger',
    '/job-applications/:applicationId',
    '/job-applications/:applicationId/withdraw',
    '/job-applications/:applicationId/archive',
    '/job-applications/:applicationId/invite-to-interview',
  ],
  chat: [
    '/chat/conversations',
    '/chat/messages',
    '/chat/conversations/:conversationId',
    '/chat/messages/:conversationId',
    '/chat/messages/:messageId',
  ],
  skills: [
    '/skill-interview-assessments',
    '/post-interview-assessments',
  ],
  pipeline: [
    '/api/pipeline-interview',
  ],
  invitations: [
    '/company-invitations',
  ],
  memberships: [
    '/company-memberships',
  ],
  dashboard: [
    '/dashboard/getAllUsers',
    '/dashboard/getCounts',
    '/dashboard/statsCards',
    '/dashboard/getUserCountsByDay',
  ],
  todo: [
    '/todo/profile',
  ],
  feedback: [
    '/feedback/addFeedback',
    '/feedback/getAllFeedback',
  ],
  tasks: [
    '/task/send-task',
    '/task/test-email',
  ],
  stripe: [
    '/stripe/create-checkout-session',
  ],
  backups: [
    '/admin/backups',
  ],
  planLimits: [
    '/plan-limits',
  ],
  subscriptions: [
    '/subscriptions',
  ],
  cvAnalysis: [
    '/cv-analysis',
  ],
  departments: [
    '/departments',
  ],
  contact: [
    '/contact',
  ],
  apiKeys: [
    '/api/api-keys',
  ],
};

/**
 * Récursive function to read all files in a directory
 */
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and build directories
      if (!['node_modules', '.next', 'dist', 'build'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Analyze API usage in code files
 */
function analyzeApiUsage() {
  console.log('🔍 Analyse de l\'utilisation des APIs...\n');

  const frontendPath = process.cwd(); // Current directory
  const files = getAllFiles(frontendPath);

  const usage = {
    used: [],
    unused: [],
    patterns: {},
  };

  // Get all endpoints as a flat list
  const allEndpoints = Object.values(API_ENDPOINTS).flat();

  console.log(`📁 Fichiers analysés: ${files.length}\n`);

  // Check each file for API calls
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');

      allEndpoints.forEach(endpoint => {
        // Create regex pattern for endpoint
        // Support both exact match and parameterized versions
        const pattern = endpoint
          .replace(/:[a-zA-Z]+/g, '[a-zA-Z0-9_-]+') // Replace :paramName with pattern
          .replace(/\//g, '\\/'); // Escape forward slashes

        const regex = new RegExp(`['"\`]${pattern}['"\`]|['"\`]([^'"\`]*${endpoint.split('/')[endpoint.split('/').length - 1]}[^'"\`]*)['"\`]`, 'gi');

        if (regex.test(content)) {
          if (!usage.used.includes(endpoint)) {
            usage.used.push(endpoint);
          }
          if (!usage.patterns[endpoint]) {
            usage.patterns[endpoint] = [];
          }
          usage.patterns[endpoint].push(file);
        }
      });
    } catch (error) {
      console.error(`❌ Erreur lecture ${file}: ${error.message}`);
    }
  });

  // Identify unused endpoints
  allEndpoints.forEach(endpoint => {
    if (!usage.used.includes(endpoint)) {
      usage.unused.push(endpoint);
    }
  });

  return usage;
}

/**
 * Generate report
 */
function generateReport(usage) {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RAPPORT D\'UTILISATION DES APIs');
  console.log('='.repeat(80) + '\n');

  console.log(`✅ APIs UTILISÉES: ${usage.used.length}`);
  console.log('-'.repeat(80));
  usage.used.forEach(endpoint => {
    console.log(`  ✓ ${endpoint}`);
  });

  console.log(`\n❌ APIs NON UTILISÉES: ${usage.unused.length}`);
  console.log('-'.repeat(80));
  usage.unused.forEach(endpoint => {
    console.log(`  ✗ ${endpoint}`);
  });

  console.log(`\n📈 RÉSUMÉ`);
  console.log('-'.repeat(80));
  console.log(`Total APIs: ${usage.used.length + usage.unused.length}`);
  console.log(`Utilisées: ${usage.used.length} (${((usage.used.length / (usage.used.length + usage.unused.length)) * 100).toFixed(2)}%)`);
  console.log(`Non utilisées: ${usage.unused.length} (${((usage.unused.length / (usage.used.length + usage.unused.length)) * 100).toFixed(2)}%)`);

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'api-usage-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(usage, null, 2));
  console.log(`\n💾 Rapport détaillé sauvegardé: ${reportPath}`);
}

/**
 * Main execution
 */
try {
  const usage = analyzeApiUsage();
  generateReport(usage);
} catch (error) {
  console.error('Erreur:', error.message);
  process.exit(1);
}

module.exports = { analyzeApiUsage, API_ENDPOINTS };
