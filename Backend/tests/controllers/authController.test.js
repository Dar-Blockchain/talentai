const request = require('supertest');
const express = require('express');
const authController = require('../../controllers/authController');
const authService = require('../../services/authService');
const Profile = require('../../models/ProfileModel');

// Mock des services
jest.mock('../../services/authService');
jest.mock('../../models/ProfileModel');

// Créer une application Express pour les tests
const app = express();
app.use(express.json());

// Routes de test
app.post('/auth/register', authController.register);
app.post('/auth/verify-otp', authController.verifyOTP);
app.post('/auth/gmail', authController.connectWithGmail);
app.post('/auth/logout', authController.logout);

describe('Auth Controller Tests', () => {
  beforeEach(() => {
    // Nettoyer tous les mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a user successfully', async () => {
      const mockResult = {
        message: 'Inscription réussie',
        email: 'test@example.com',
        username: 'testuser'
      };

      authService.registerUser.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com' })
        .expect(201);

      expect(response.body).toEqual(mockResult);
      expect(authService.registerUser).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle registration error', async () => {
      const errorMessage = 'Email déjà utilisé';
      authService.registerUser.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'existing@example.com' })
        .expect(400);

      expect(response.body).toEqual({ message: errorMessage });
    });

    it('should handle missing email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/verify-otp', () => {
    it('should verify OTP successfully with profile', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        profile: 'profile123'
      };

      const mockProfile = {
        _id: 'profile123',
        name: 'Test User'
      };

      const mockResult = {
        user: mockUser,
        token: 'jwt-token-123'
      };

      authService.verifyUserOTP.mockResolvedValue(mockResult);
      Profile.findById.mockResolvedValue(mockProfile);

      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          email: 'test@example.com',
          otp: '123456',
          location: 'Paris'
        })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Email vérifié avec succès',
        user: mockUser,
        token: 'jwt-token-123',
        profile: mockProfile
      });

      expect(authService.verifyUserOTP).toHaveBeenCalledWith('test@example.com', '123456', 'Paris');
      expect(Profile.findById).toHaveBeenCalledWith('profile123');
    });

    it('should verify OTP successfully without profile', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com'
      };

      const mockResult = {
        user: mockUser,
        token: 'jwt-token-123'
      };

      authService.verifyUserOTP.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          email: 'test@example.com',
          otp: '123456',
          location: 'Paris'
        })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Email vérifié avec succès',
        user: mockUser,
        token: 'jwt-token-123',
        profile: null
      });
    });

    it('should handle OTP verification error', async () => {
      const errorMessage = 'Code OTP invalide';
      authService.verifyUserOTP.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          email: 'test@example.com',
          otp: 'invalid',
          location: 'Paris'
        })
        .expect(400);

      expect(response.body).toEqual({ message: errorMessage });
    });

    it('should handle missing required fields', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/gmail', () => {
    it('should connect with Gmail successfully', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@gmail.com'
      };

      const mockResult = {
        message: 'Connexion Gmail réussie',
        user: mockUser,
        token: 'jwt-token-123'
      };

      authService.connectWithGmail.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/auth/gmail')
        .send({ id_token: 'google-id-token-123' })
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(authService.connectWithGmail).toHaveBeenCalledWith('google-id-token-123');
    });

    it('should handle Gmail connection error', async () => {
      const errorMessage = 'Token Gmail invalide';
      authService.connectWithGmail.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/auth/gmail')
        .send({ id_token: 'invalid-token' })
        .expect(400);

      expect(response.body).toEqual({ message: errorMessage });
    });

    it('should handle missing id_token', async () => {
      const response = await request(app)
        .post('/auth/gmail')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully without session', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(200);

      expect(response.body).toEqual({ message: 'Déconnexion réussie' });
    });

    it('should logout successfully with session', async () => {
      // Simuler une session existante
      const mockSession = {
        destroy: jest.fn((callback) => callback(null))
      };

      const req = { session: mockSession };
      const res = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('jwt_token');
      expect(mockSession.destroy).toHaveBeenCalled();
    });

    it('should handle session destruction error', async () => {
      const mockSession = {
        destroy: jest.fn((callback) => callback(new Error('Session error')))
      };

      const req = { session: mockSession };
      const res = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      authController.logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith('jwt_token');
      expect(mockSession.destroy).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      const errorMessage = 'Service temporairement indisponible';
      authService.registerUser.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body.message).toBe(errorMessage);
    });

    it('should handle unexpected errors', async () => {
      authService.registerUser.mockRejectedValue('Unexpected error');

      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should validate OTP format', async () => {
      const response = await request(app)
        .post('/auth/verify-otp')
        .send({
          email: 'test@example.com',
          otp: 'abc',
          location: 'Paris'
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });
});
