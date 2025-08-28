const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Configuration globale pour Jest
beforeAll(async () => {
  // Créer une instance MongoDB en mémoire pour les tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connecter à la base de données de test
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Nettoyer après chaque test
afterEach(async () => {
  // Vider toutes les collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Fermer la connexion après tous les tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Configuration des timeouts
jest.setTimeout(30000);

// Mock des variables d'environnement
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/test';
