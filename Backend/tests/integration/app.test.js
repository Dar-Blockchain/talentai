const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');

// Mock des services externes
jest.mock('../../services/authService');
jest.mock('../../services/emailService');
jest.mock('../../services/hederaService');

describe('Application Integration Tests', () => {
  beforeAll(async () => {
    // Configuration de la base de données de test
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/test';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  });

  describe('Health Check', () => {
    it('should return 200 for health check endpoint', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Authentication Flow', () => {
    it('should handle complete authentication flow', async () => {
      // Test d'inscription
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com' })
        .expect(201);

      expect(registerResponse.body).toHaveProperty('message');
      expect(registerResponse.body).toHaveProperty('email');

      // Test de vérification OTP
      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .send({
          email: 'test@example.com',
          otp: '123456',
          location: 'Paris'
        })
        .expect(200);

      expect(verifyResponse.body).toHaveProperty('token');
      expect(verifyResponse.body).toHaveProperty('user');
    });

    it('should handle authentication errors gracefully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Protected Routes', () => {
    it('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/profile')
        .expect(401);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('non autorisé');
    });

    it('should allow access with valid token', async () => {
      // D'abord, créer un utilisateur et obtenir un token
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({ email: 'protected@example.com' })
        .expect(201);

      const verifyResponse = await request(app)
        .post('/auth/verify-otp')
        .send({
          email: 'protected@example.com',
          otp: '123456',
          location: 'Paris'
        })
        .expect(200);

      const token = verifyResponse.body.token;

      // Maintenant, tester une route protégée
      const profileResponse = await request(app)
        .get('/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('non trouvé');
    });

    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle server errors', async () => {
      // Simuler une erreur serveur en modifiant temporairement la configuration
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      // Test d'une route qui pourrait générer une erreur
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'error@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('message');

      // Restaurer l'environnement
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await request(app)
        .options('/auth/register')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should allow requests from allowed origins', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting for authentication endpoints', async () => {
      // Faire plusieurs requêtes rapides pour déclencher le rate limiting
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/auth/register')
            .send({ email: `rate${i}@example.com` })
        );
      }

      const responses = await Promise.all(promises);
      
      // Au moins une requête devrait être limitée
      const hasRateLimited = responses.some(response => 
        response.status === 429 || response.body.message?.includes('limite')
      );
      
      expect(hasRateLimited).toBe(true);
    });
  });

  describe('Database Connection', () => {
    it('should handle database connection errors gracefully', async () => {
      // Simuler une perte de connexion à la base de données
      const originalConnection = mongoose.connection;
      mongoose.connection = null;

      const response = await request(app)
        .get('/health')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('erreur');

      // Restaurer la connexion
      mongoose.connection = originalConnection;
    });
  });

  describe('Middleware Stack', () => {
    it('should apply all required middlewares', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Vérifier que les middlewares sont appliqués
      expect(response.headers['x-powered-by']).toBeDefined();
      expect(response.headers['content-type']).toContain('application/json');
    });

    it('should handle middleware errors', async () => {
      // Simuler une erreur dans un middleware
      const originalErrorHandler = app._errorHandler;
      app._errorHandler = (err, req, res, next) => {
        res.status(500).json({ message: 'Erreur middleware' });
      };

      const response = await request(app)
        .get('/health')
        .expect(500);

      expect(response.body.message).toBe('Erreur middleware');

      // Restaurer le gestionnaire d'erreur
      app._errorHandler = originalErrorHandler;
    });
  });
});
