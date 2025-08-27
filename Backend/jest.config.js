module.exports = {
  // Répertoires de test
  testMatch: [
    "**/tests/**/*.test.js",
    "**/tests/**/*.spec.js"
  ],
  
  // Répertoires à ignorer
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  
  // Fichier de configuration global
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Variables d'environnement pour les tests
  testEnvironment: 'node',
  
  // Collecte de couverture de code
  collectCoverage: true,
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**'
  ],
  
  // Répertoire de sortie pour la couverture
  coverageDirectory: 'coverage',
  
  // Formats de rapport de couverture
  coverageReporters: ['text', 'lcov', 'html'],
  
  // Seuil de couverture minimum
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Timeout pour les tests
  testTimeout: 30000,
  
  // Verbosité des tests
  verbose: true,
  
  // Force la sortie des erreurs
  forceExit: true,
  
  // Nettoyer les mocks automatiquement
  clearMocks: true,
  
  // Restaurer les mocks automatiquement
  restoreMocks: true
};
