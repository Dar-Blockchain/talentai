const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

/**
 * Classe utilitaire pour créer des données de test
 */
class TestDataFactory {
  /**
   * Crée un utilisateur de test
   */
  static createTestUser(overrides = {}) {
    return {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      role: 'Candidat',
      isVerified: false,
      isBanned: false,
      isHaker: false,
      warnings: 0,
      trafficCounter: 0,
      authHistory: [],
      ...overrides
    };
  }

  /**
   * Crée un profil de test
   */
  static createTestProfile(overrides = {}) {
    return {
      userId: new mongoose.Types.ObjectId(),
      firstName: 'Test',
      lastName: 'User',
      bio: 'Test bio',
      skills: ['JavaScript', 'Node.js'],
      experience: 2,
      education: 'Bachelor',
      ...overrides
    };
  }

  /**
   * Crée un post de test
   */
  static createTestPost(overrides = {}) {
    return {
      title: 'Test Post',
      description: 'Test description',
      requirements: ['Skill 1', 'Skill 2'],
      salary: 50000,
      location: 'Paris',
      type: 'Full-time',
      company: new mongoose.Types.ObjectId(),
      ...overrides
    };
  }

  /**
   * Crée un token JWT de test
   */
  static createTestToken(userId = new mongoose.Types.ObjectId().toString()) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  }

  /**
   * Crée des données de requête de test
   */
  static createTestRequest(overrides = {}) {
    return {
      body: {},
      params: {},
      query: {},
      headers: {},
      cookies: {},
      user: null,
      ...overrides
    };
  }

  /**
   * Crée des données de réponse de test
   */
  static createTestResponse() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.setHeader = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
  }

  /**
   * Crée une fonction next de test
   */
  static createTestNext() {
    return jest.fn();
  }
}

/**
 * Classe utilitaire pour nettoyer la base de données
 */
class DatabaseCleaner {
  /**
   * Nettoie toutes les collections
   */
  static async cleanAllCollections() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }

  /**
   * Nettoie une collection spécifique
   */
  static async cleanCollection(collectionName) {
    const collection = mongoose.connection.collection(collectionName);
    if (collection) {
      await collection.deleteMany();
    }
  }

  /**
   * Supprime un document spécifique
   */
  static async deleteDocument(model, id) {
    try {
      await model.findByIdAndDelete(id);
    } catch (error) {
      // Ignorer les erreurs si le document n'existe pas
    }
  }
}

/**
 * Classe utilitaire pour les assertions personnalisées
 */
class CustomAssertions {
  /**
   * Vérifie qu'une réponse contient les champs requis
   */
  static expectResponseFields(response, requiredFields) {
    requiredFields.forEach(field => {
      expect(response.body).toHaveProperty(field);
    });
  }

  /**
   * Vérifie qu'une réponse a le bon statut et contient un message
   */
  static expectErrorResponse(response, expectedStatus, expectedMessage = null) {
    expect(response.status).toBe(expectedStatus);
    expect(response.body).toHaveProperty('message');
    
    if (expectedMessage) {
      expect(response.body.message).toBe(expectedMessage);
    }
  }

  /**
   * Vérifie qu'une réponse de succès contient les données attendues
   */
  static expectSuccessResponse(response, expectedStatus, expectedData = null) {
    expect(response.status).toBe(expectedStatus);
    
    if (expectedData) {
      expect(response.body).toMatchObject(expectedData);
    }
  }

  /**
   * Vérifie qu'un objet a la structure attendue
   */
  static expectObjectStructure(obj, expectedStructure) {
    Object.keys(expectedStructure).forEach(key => {
      expect(obj).toHaveProperty(key);
      if (expectedStructure[key] !== null) {
        expect(typeof obj[key]).toBe(expectedStructure[key]);
      }
    });
  }
}

/**
 * Classe utilitaire pour les mocks
 */
class MockHelper {
  /**
   * Crée un mock de service avec des méthodes par défaut
   */
  static createServiceMock(methods = {}) {
    const defaultMethods = {
      success: jest.fn().mockResolvedValue({ success: true }),
      error: jest.fn().mockRejectedValue(new Error('Service error')),
      ...methods
    };

    return defaultMethods;
  }

  /**
   * Crée un mock de modèle Mongoose
   */
  static createModelMock(methods = {}) {
    const defaultMethods = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
        populate: jest.fn().mockReturnThis()
      }),
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn().mockReturnThis()
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
        populate: jest.fn().mockReturnThis()
      }),
      create: jest.fn().mockResolvedValue({}),
      save: jest.fn().mockResolvedValue({}),
      ...methods
    };

    return defaultMethods;
  }

  /**
   * Crée un mock de middleware
   */
  static createMiddlewareMock(behavior = 'next') {
    switch (behavior) {
      case 'next':
        return jest.fn((req, res, next) => next());
      case 'error':
        return jest.fn((req, res, next) => next(new Error('Middleware error')));
      case 'unauthorized':
        return jest.fn((req, res, next) => {
          res.status(401).json({ message: 'Non autorisé' });
        });
      default:
        return jest.fn((req, res, next) => next());
    }
  }
}

/**
 * Classe utilitaire pour les tests de validation
 */
class ValidationTester {
  /**
   * Teste la validation d'un modèle avec des données valides
   */
  static async testValidData(Model, validData) {
    const instance = new Model(validData);
    const validationResult = await instance.validate();
    expect(validationResult).toBeUndefined();
  }

  /**
   * Teste la validation d'un modèle avec des données invalides
   */
  static async testInvalidData(Model, invalidData, expectedErrors) {
    const instance = new Model(invalidData);
    
    try {
      await instance.validate();
      throw new Error('Validation should have failed');
    } catch (error) {
      expect(error.errors).toBeDefined();
      
      expectedErrors.forEach(field => {
        expect(error.errors[field]).toBeDefined();
      });
    }
  }

  /**
   * Teste les contraintes d'unicité
   */
  static async testUniqueConstraint(Model, fieldName, duplicateValue) {
    // Créer le premier document
    const firstDoc = new Model({ [fieldName]: duplicateValue });
    await firstDoc.save();

    // Essayer de créer un second document avec la même valeur
    const secondDoc = new Model({ [fieldName]: duplicateValue });
    
    try {
      await secondDoc.save();
      throw new Error('Unique constraint should have failed');
    } catch (error) {
      expect(error.code).toBe(11000); // Code MongoDB pour duplicate key
    }
  }
}

module.exports = {
  TestDataFactory,
  DatabaseCleaner,
  CustomAssertions,
  MockHelper,
  ValidationTester
};
