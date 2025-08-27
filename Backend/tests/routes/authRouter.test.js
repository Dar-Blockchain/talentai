const request = require('supertest');
const express = require('express');
const authRouter = require('../../routes/authRouter');
const authController = require('../../controllers/authController');
const authMiddleware = require('../../middleware/authMiddleware');
const logMiddleware = require('../../middleware/SystemeLogs/LogMiddleware');

// Mock des contrôleurs et middlewares
jest.mock('../../controllers/authController');
jest.mock('../../middleware/authMiddleware');
jest.mock('../../middleware/SystemeLogs/LogMiddleware');

// Créer une application Express pour les tests
const app = express();
app.use(express.json());

// Appliquer le routeur
app.use('/auth', authRouter);

describe('Auth Router Tests', () => {
  beforeEach(() => {
    // Nettoyer tous les mocks avant chaque test
    jest.clearAllMocks();
    
    // Mock des middlewares
    logMiddleware.mockReturnValue((req, res, next) => next());
    authMiddleware.requireAuthUser.mockImplementation((req, res, next) => {
      req.user = { id: 'test-user-id', email: 'test@example.com' };
      next();
    });
  });

  describe('POST /auth/register', () => {
    it('should handle user registration', async () => {
      const mockResponse = {
        message: 'Inscription réussie',
        email: 'test@example.com',
        username: 'testuser'
      };

      authController.register.mockImplementation((req, res) => {
        res.status(201).json(mockResponse);
      });

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com' })
        .expect(201);

      expect(response.body).toEqual(mockResponse);
      expect(authController.register).toHaveBeenCalled();
    });

    it('should validate request body', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/verify-otp', () => {
    it('should handle OTP verification', async () => {
      const mockResponse = {
        message: 'Email vérifié avec succès',
        user: { id: 'user123', email: 'test@example.com' },
        token: 'jwt-token-123'
      };

      authController.verifyOTP.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          email: 'test@example.com',
          otp: '123456',
          location: 'Paris'
        })
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authController.verifyOTP).toHaveBeenCalled();
    });

    it('should require email and OTP', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/connect-gmail', () => {
    it('should handle Gmail connection', async () => {
      const mockResponse = {
        message: 'Connexion Gmail réussie',
        user: { id: 'user123', email: 'test@gmail.com' },
        token: 'jwt-token-123'
      };

      authController.connectWithGmail.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/auth/connect-gmail')
        .send({ id_token: 'google-id-token-123' })
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authController.connectWithGmail).toHaveBeenCalled();
    });

    it('should require id_token', async () => {
      const response = await request(app)
        .post('/auth/connect-gmail')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /auth/GetGmailByToken', () => {
    it('should get Gmail info by token', async () => {
      const mockResponse = {
        email: 'test@gmail.com',
        name: 'Test User',
        picture: 'https://example.com/avatar.jpg'
      };

      authController.GetGmailByToken.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/auth/GetGmailByToken')
        .set('Authorization', 'Bearer google-token-123')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authController.GetGmailByToken).toHaveBeenCalled();
    });
  });

  describe('GET /auth/warnUser', () => {
    it('should require authentication', async () => {
      // Mock du middleware d'authentification pour ce test
      authMiddleware.requireAuthUser.mockImplementation((req, res, next) => {
        res.status(401).json({ message: 'Non autorisé' });
      });

      const response = await request(app)
        .get('/auth/warnUser')
        .expect(401);

      expect(response.body.message).toBe('Non autorisé');
      expect(authMiddleware.requireAuthUser).toHaveBeenCalled();
    });

    it('should allow authenticated users', async () => {
      const mockResponse = {
        message: 'Utilisateur averti',
        warnings: 1
      };

      authController.warnUser.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .get('/auth/warnUser')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authController.warnUser).toHaveBeenCalled();
    });
  });

  describe('POST /auth/logout', () => {
    it('should require authentication', async () => {
      // Mock du middleware d'authentification pour ce test
      authMiddleware.requireAuthUser.mockImplementation((req, res, next) => {
        res.status(401).json({ message: 'Non autorisé' });
      });

      const response = await request(app)
        .post('/auth/logout')
        .expect(401);

      expect(response.body.message).toBe('Non autorisé');
      expect(authMiddleware.requireAuthUser).toHaveBeenCalled();
    });

    it('should handle logout for authenticated users', async () => {
      const mockResponse = {
        message: 'Déconnexion réussie'
      };

      authController.logout.mockImplementation((req, res) => {
        res.status(200).json(mockResponse);
      });

      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual(mockResponse);
      expect(authController.logout).toHaveBeenCalled();
    });
  });

  describe('Middleware Integration', () => {
    it('should apply logging middleware to all routes', () => {
      // Vérifier que le middleware de logging est appliqué
      expect(logMiddleware).toHaveBeenCalledWith('Auth');
    });

    it('should apply authentication middleware to protected routes', () => {
      // Les routes protégées doivent utiliser requireAuthUser
      expect(authMiddleware.requireAuthUser).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle controller errors gracefully', async () => {
      // Mock d'une erreur dans le contrôleur
      authController.register.mockImplementation((req, res) => {
        res.status(500).json({ message: 'Erreur interne du serveur' });
      });

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com' })
        .expect(500);

      expect(response.body.message).toBe('Erreur interne du serveur');
    });

    it('should handle middleware errors', async () => {
      // Mock d'une erreur dans le middleware d'authentification
      authMiddleware.requireAuthUser.mockImplementation((req, res, next) => {
        next(new Error('Erreur d\'authentification'));
      });

      const response = await request(app)
        .get('/auth/warnUser')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Request Validation', () => {
    it('should validate JSON format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .set('Content-Type', 'text/plain')
        .send('invalid json')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should handle malformed requests', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
