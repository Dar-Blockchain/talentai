/**
 * Configuration des tests pour différents environnements
 */

const testConfig = {
  // Configuration de base
  base: {
    timeout: 30000,
    retries: 3,
    slow: 5000
  },

  // Configuration de la base de données de test
  database: {
    test: {
      uri: process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/talentai_test',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    },
    memory: {
      uri: process.env.MONGODB_URI_MEMORY || 'mongodb://localhost:27017/talentai_memory',
      options: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    }
  },

  // Configuration des mocks
  mocks: {
    services: {
      email: true,
      hedera: true,
      ai: true,
      external: true
    },
    models: {
      user: false,
      profile: false,
      post: false
    }
  },

  // Configuration des tests
  tests: {
    unit: {
      enabled: true,
      coverage: true,
      threshold: {
        statements: 80,
        branches: 70,
        functions: 80,
        lines: 80
      }
    },
    integration: {
      enabled: true,
      database: 'test',
      cleanup: true
    },
    e2e: {
      enabled: false,
      baseUrl: 'http://localhost:3000',
      timeout: 60000
    }
  },

  // Configuration des variables d'environnement de test
  environment: {
    NODE_ENV: 'test',
    JWT_SECRET: 'test-jwt-secret-key',
    JWT_EXPIRES_IN: '1h',
    EMAIL_SERVICE: 'mock',
    HEDERA_NETWORK: 'testnet',
    AI_SERVICE: 'mock',
    LOG_LEVEL: 'error'
  },

  // Configuration des fixtures
  fixtures: {
    users: {
      admin: {
        username: 'admin_test',
        email: 'admin@test.com',
        role: 'Admin',
        isVerified: true
      },
      company: {
        username: 'company_test',
        email: 'company@test.com',
        role: 'Company',
        isVerified: true
      },
      candidate: {
        username: 'candidate_test',
        email: 'candidate@test.com',
        role: 'Candidat',
        isVerified: true
      },
      jury: {
        username: 'jury_test',
        email: 'jury@test.com',
        role: 'jury',
        isVerified: true
      }
    },
    profiles: {
      candidate: {
        firstName: 'Test',
        lastName: 'Candidate',
        bio: 'Test candidate bio',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: 3,
        education: 'Bachelor'
      },
      company: {
        companyName: 'Test Company',
        industry: 'Technology',
        size: '50-100',
        description: 'Test company description'
      }
    },
    posts: {
      job: {
        title: 'Test Job Post',
        description: 'Test job description',
        requirements: ['JavaScript', 'React'],
        salary: 60000,
        location: 'Paris',
        type: 'Full-time'
      }
    }
  },

  // Configuration des utilitaires de test
  utilities: {
    cleanup: {
      autoCleanup: true,
      cleanupInterval: 1000,
      maxRetries: 3
    },
    logging: {
      enabled: false,
      level: 'error',
      format: 'json'
    },
    performance: {
      measurePerformance: false,
      slowTestThreshold: 1000
    }
  }
};

/**
 * Fonction pour obtenir la configuration selon l'environnement
 */
function getTestConfig(environment = 'test') {
  const config = { ...testConfig };
  
  // Appliquer la configuration de l'environnement
  if (environment === 'memory') {
    config.database = testConfig.database.memory;
  }
  
  // Appliquer les variables d'environnement
  Object.keys(testConfig.environment).forEach(key => {
    if (!process.env[key]) {
      process.env[key] = testConfig.environment[key];
    }
  });
  
  return config;
}

/**
 * Fonction pour valider la configuration
 */
function validateTestConfig(config) {
  const requiredFields = ['database', 'tests', 'environment'];
  
  requiredFields.forEach(field => {
    if (!config[field]) {
      throw new Error(`Configuration manquante: ${field}`);
    }
  });
  
  return true;
}

/**
 * Fonction pour réinitialiser l'environnement de test
 */
function resetTestEnvironment() {
  // Réinitialiser les variables d'environnement
  Object.keys(testConfig.environment).forEach(key => {
    delete process.env[key];
  });
  
  // Nettoyer les mocks Jest
  if (typeof jest !== 'undefined') {
    jest.clearAllMocks();
    jest.resetModules();
  }
}

module.exports = {
  testConfig,
  getTestConfig,
  validateTestConfig,
  resetTestEnvironment
};
