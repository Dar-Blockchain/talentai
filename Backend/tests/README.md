# Tests Backend - TalentAI

Ce dossier contient tous les tests pour le backend de TalentAI, organisés de manière structurée et maintenable.

## 📁 Structure des Tests

```
tests/
├── config/                 # Configuration des tests
│   └── testConfig.js      # Configuration des environnements de test
├── controllers/            # Tests des contrôleurs
│   └── authController.test.js
├── integration/            # Tests d'intégration
│   └── app.test.js
├── middleware/             # Tests des middlewares
│   └── authMiddleware.test.js
├── models/                 # Tests des modèles
│   └── UserModel.test.js
├── routes/                 # Tests des routes
│   └── authRouter.test.js
├── utils/                  # Utilitaires de test
│   └── testHelpers.js
├── setup.js               # Configuration globale Jest
└── README.md              # Ce fichier
```

## 🚀 Installation et Configuration

### Prérequis
- Node.js 16+
- MongoDB (locale ou en mémoire)
- npm ou yarn

### Installation des dépendances
```bash
npm install
```

### Configuration des variables d'environnement
Créez un fichier `.env.test` dans le dossier `Backend/` :

```env
NODE_ENV=test
MONGODB_URI_TEST=mongodb://localhost:27017/talentai_test
JWT_SECRET=test-secret-key
JWT_EXPIRES_IN=1h
EMAIL_SERVICE=mock
HEDERA_NETWORK=testnet
AI_SERVICE=mock
LOG_LEVEL=error
```

## 🧪 Exécution des Tests

### Tous les tests
```bash
npm test
```

### Tests en mode watch (développement)
```bash
npm run test:watch
```

### Tests avec couverture de code
```bash
npm run test:coverage
```

### Tests par catégorie
```bash
# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration uniquement
npm run test:integration

# Tests des modèles
npm run test:models

# Tests des contrôleurs
npm run test:controllers

# Tests des routes
npm run test:routes

# Tests des middlewares
npm run test:middleware
```

### Tests en mode CI/CD
```bash
npm run test:ci
```

### Tests en mode debug
```bash
npm run test:debug
```

## 📊 Couverture de Code

La configuration Jest est configurée pour générer des rapports de couverture détaillés :

- **Seuil minimum** : 70% pour toutes les métriques
- **Formats** : HTML, LCOV, et texte
- **Dossiers couverts** : controllers, services, models, middleware, utils

### Générer un rapport de couverture
```bash
npm run test:coverage
```

Le rapport HTML sera généré dans le dossier `coverage/`.

## 🔧 Configuration Jest

Le fichier `jest.config.js` configure Jest avec :

- **Environnement** : Node.js
- **Setup** : `tests/setup.js` pour la configuration globale
- **Patterns** : Tests dans `tests/**/*.test.js`
- **Coverage** : Collecte automatique avec seuils
- **Timeouts** : 30 secondes par test
- **Mocks** : Nettoyage automatique

## 🗄️ Base de Données de Test

### Base de données en mémoire (recommandée)
Les tests utilisent `mongodb-memory-server` pour une isolation complète :

```javascript
// Dans tests/setup.js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoServer = await MongoMemoryServer.create();
const mongoUri = mongoServer.getUri();
```

### Base de données locale
Pour les tests d'intégration avancés, vous pouvez utiliser une base locale :

```bash
# Démarrer MongoDB localement
mongod --dbpath /data/db

# Exécuter les tests d'intégration
npm run test:integration
```

## 🎭 Mocks et Stubs

### Services externes
Les services externes sont automatiquement mockés :

```javascript
// Dans les tests
jest.mock('../../services/authService');
jest.mock('../../services/emailService');
jest.mock('../../services/hederaService');
```

### Modèles Mongoose
Les modèles peuvent être mockés selon les besoins :

```javascript
const { MockHelper } = require('../utils/testHelpers');
const userModelMock = MockHelper.createModelMock({
  findById: jest.fn().mockResolvedValue(mockUser)
});
```

## 🛠️ Utilitaires de Test

### TestDataFactory
Crée des données de test cohérentes :

```javascript
const { TestDataFactory } = require('./utils/testHelpers');

const testUser = TestDataFactory.createTestUser({
  email: 'custom@example.com',
  role: 'Admin'
});
```

### DatabaseCleaner
Nettoie la base de données entre les tests :

```javascript
const { DatabaseCleaner } = require('./utils/testHelpers');

beforeEach(async () => {
  await DatabaseCleaner.cleanAllCollections();
});
```

### CustomAssertions
Assertions personnalisées pour les réponses API :

```javascript
const { CustomAssertions } = require('./utils/testHelpers');

CustomAssertions.expectSuccessResponse(response, 200, {
  message: 'Succès',
  data: expect.any(Object)
});
```

## 📝 Écriture de Tests

### Structure d'un test
```javascript
describe('Nom du composant', () => {
  beforeEach(() => {
    // Configuration avant chaque test
  });

  afterEach(() => {
    // Nettoyage après chaque test
  });

  describe('Fonctionnalité spécifique', () => {
    it('should do something when condition is met', async () => {
      // Arrange
      const input = 'test data';
      
      // Act
      const result = await functionToTest(input);
      
      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('success', true);
    });
  });
});
```

### Bonnes pratiques
1. **Un test, une assertion** : Testez une seule chose à la fois
2. **Noms descriptifs** : Utilisez des noms clairs pour les tests
3. **Setup/Teardown** : Nettoyez toujours après les tests
4. **Mocks appropriés** : Mockez les dépendances externes
5. **Données de test** : Utilisez des données réalistes mais simples

### Tests d'API avec Supertest
```javascript
const request = require('supertest');
const app = require('../../app');

describe('API Endpoint', () => {
  it('should return 200 for valid request', async () => {
    const response = await request(app)
      .post('/api/endpoint')
      .send({ data: 'test' })
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
  });
});
```

## 🐛 Débogage des Tests

### Mode debug
```bash
npm run test:debug
```

### Tests spécifiques
```bash
# Test d'un fichier spécifique
npm test -- authController.test.js

# Test d'une fonction spécifique
npm test -- --testNamePattern="should register user"
```

### Logs détaillés
```bash
# Activer les logs Jest
DEBUG=* npm test

# Logs spécifiques
DEBUG=jest:* npm test
```

## 📈 Métriques et Performance

### Mesure des performances
```javascript
const startTime = Date.now();
// ... exécution du test
const endTime = Date.now();
console.log(`Test took ${endTime - startTime}ms`);
```

### Tests lents
Jest marque automatiquement les tests prenant plus de 5 secondes comme "lents".

## 🔄 Intégration Continue

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    cd Backend
    npm run test:ci
```

### Git Hooks
Ajoutez des hooks pre-commit pour exécuter les tests :

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test"
    }
  }
}
```

## 🚨 Résolution des Problèmes

### Erreurs communes

#### Timeout des tests
```javascript
// Augmenter le timeout pour un test spécifique
it('should complete long operation', async () => {
  // ... test
}, 60000);
```

#### Erreurs de base de données
```javascript
// Vérifier la connexion
beforeAll(async () => {
  await mongoose.connect(mongoUri);
  expect(mongoose.connection.readyState).toBe(1);
});
```

#### Mocks non fonctionnels
```javascript
// Réinitialiser les mocks
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
});
```

### Support
Pour toute question sur les tests :
1. Vérifiez la documentation Jest
2. Consultez les exemples dans le dossier `tests/`
3. Vérifiez la configuration dans `jest.config.js`

## 📚 Ressources

- [Documentation Jest](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/nodkz/mongodb-memory-server)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
