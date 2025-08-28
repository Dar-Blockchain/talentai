const jwt = require('jsonwebtoken');
const userModel = require('../../models/UserModel');
const { requireAuthUser } = require('../../middleware/authMiddleware');

// Mock des modules
jest.mock('jsonwebtoken');
jest.mock('../../models/UserModel');

describe('Auth Middleware Tests', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
    
    // Mock des objets request, response et next
    mockReq = {
      headers: {},
      cookies: {}
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    mockNext = jest.fn();
    
    // Mock des variables d'environnement
    process.env.Net_Secret = 'test-secret-key';
  });

  describe('requireAuthUser - Token Validation', () => {
    it('should call next() when valid token is provided', async () => {
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = { id: 'user123' };
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        profile: 'profile123'
      };

      // Mock du header d'autorisation
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      
      // Mock de jwt.verify
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecodedToken);
      });
      
      // Mock de userModel.findById
      userModel.findById.mockResolvedValue(mockUser);

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(
        mockToken,
        process.env.Net_Secret,
        expect.any(Function)
      );
      expect(userModel.findById).toHaveBeenCalledWith('user123');
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('should return 401 when no token is provided', async () => {
      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Accès non autorisé - Token manquant'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header is malformed', async () => {
      mockReq.headers.authorization = 'InvalidFormat';

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Accès non autorisé - Token manquant'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid or expired', async () => {
      const mockToken = 'invalid-jwt-token';
      mockReq.headers.authorization = `Bearer ${mockToken}`;

      // Mock de jwt.verify avec une erreur
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(new Error('Token expired'), null);
      });

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token invalide ou expiré'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAuthUser - User Validation', () => {
    it('should return 401 when user is not found', async () => {
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = { id: 'nonexistent-user' };
      
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecodedToken);
      });
      
      userModel.findById.mockResolvedValue(null);

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Utilisateur non trouvé'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 when database query fails', async () => {
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = { id: 'user123' };
      
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecodedToken);
      });
      
      const dbError = new Error('Database connection failed');
      userModel.findById.mockRejectedValue(dbError);

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Erreur lors de la vérification de l\'utilisateur'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should populate profile when user is found', async () => {
      const mockToken = 'valid-jwt-token';
      const mockDecodedToken = { id: 'user123' };
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
        profile: 'profile123'
      };
      
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecodedToken);
      });
      
      // Mock de userModel.findById avec populate
      const mockFindById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockUser)
      });
      userModel.findById.mockReturnValue(mockFindById);

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(userModel.findById).toHaveBeenCalledWith('user123');
      expect(mockFindById.populate).toHaveBeenCalledWith('profile');
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAuthUser - Edge Cases', () => {
    it('should handle empty authorization header', async () => {
      mockReq.headers.authorization = '';

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Accès non autorisé - Token manquant'
      });
    });

    it('should handle authorization header with only Bearer keyword', async () => {
      mockReq.headers.authorization = 'Bearer';

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Accès non autorisé - Token manquant'
      });
    });

    it('should handle authorization header with extra spaces', async () => {
      const mockToken = 'valid-jwt-token';
      mockReq.headers.authorization = `  Bearer  ${mockToken}  `;
      
      const mockDecodedToken = { id: 'user123' };
      const mockUser = { _id: 'user123', email: 'test@example.com' };
      
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecodedToken);
      });
      
      userModel.findById.mockResolvedValue(mockUser);

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(
        mockToken,
        process.env.Net_Secret,
        expect.any(Function)
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAuthUser - Cookie Fallback', () => {
    it('should check cookies when authorization header is missing', async () => {
      const mockToken = 'cookie-jwt-token';
      mockReq.cookies = { jwt_token: mockToken };
      
      const mockDecodedToken = { id: 'user123' };
      const mockUser = { _id: 'user123', email: 'test@example.com' };
      
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecodedToken);
      });
      
      userModel.findById.mockResolvedValue(mockUser);

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith(
        mockToken,
        process.env.Net_Secret,
        expect.any(Function)
      );
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('requireAuthUser - Error Handling', () => {
    it('should handle JWT verification errors gracefully', async () => {
      const mockToken = 'valid-jwt-token';
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      
      const jwtError = new Error('JWT verification failed');
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(jwtError, null);
      });

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Token invalide ou expiré'
      });
    });

    it('should handle user model errors gracefully', async () => {
      const mockToken = 'valid-jwt-token';
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      
      const mockDecodedToken = { id: 'user123' };
      jwt.verify.mockImplementation((token, secret, callback) => {
        callback(null, mockDecodedToken);
      });
      
      const userModelError = new Error('User model error');
      userModel.findById.mockRejectedValue(userModelError);

      await requireAuthUser(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Erreur lors de la vérification de l\'utilisateur'
      });
    });
  });
});
