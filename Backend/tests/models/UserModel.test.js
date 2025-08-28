const mongoose = require('mongoose');
const User = require('../../models/UserModel');
const Profile = require('../../models/ProfileModel');

describe('User Model Test', () => {
  // Test de création d'un utilisateur valide
  describe('Valid User Creation', () => {
    it('should create a user with valid data', async () => {
      const validUser = {
        username: 'testuser',
        email: 'test@example.com',
        role: 'Candidat'
      };

      const user = new User(validUser);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toBe(validUser.username);
      expect(savedUser.email).toBe(validUser.email);
      expect(savedUser.role).toBe(validUser.role);
      expect(savedUser.isVerified).toBe(false);
      expect(savedUser.isBanned).toBe(false);
      expect(savedUser.isHaker).toBe(false);
      expect(savedUser.warnings).toBe(0);
      expect(savedUser.trafficCounter).toBe(0);
      expect(savedUser.authHistory).toHaveLength(0);
    });

    it('should create a user with all optional fields', async () => {
      const fullUser = {
        username: 'fulluser',
        email: 'full@example.com',
        role: 'Company',
        isVerified: true,
        warnings: 2,
        ip: '192.168.1.1',
        Localisation: 'Paris, France'
      };

      const user = new User(fullUser);
      const savedUser = await user.save();

      expect(savedUser.isVerified).toBe(true);
      expect(savedUser.warnings).toBe(2);
      expect(savedUser.ip).toBe('192.168.1.1');
      expect(savedUser.Localisation).toBe('Paris, France');
    });
  });

  // Test de validation des champs requis
  describe('Required Fields Validation', () => {
    it('should fail without username', async () => {
      const userWithoutUsername = new User({
        email: 'test@example.com',
        role: 'Candidat'
      });

      let err;
      try {
        await userWithoutUsername.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.username).toBeDefined();
    });

    it('should fail without email', async () => {
      const userWithoutEmail = new User({
        username: 'testuser',
        role: 'Candidat'
      });

      let err;
      try {
        await userWithoutEmail.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.email).toBeDefined();
    });

    it('should fail without role', async () => {
      const userWithoutRole = new User({
        username: 'testuser',
        email: 'test@example.com'
      });

      let err;
      try {
        await userWithoutEmail.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.role).toBeDefined();
    });
  });

  // Test de validation des rôles
  describe('Role Validation', () => {
    it('should accept valid roles', async () => {
      const validRoles = ['Company', 'jury', 'Candidat', 'Admin'];
      
      for (const role of validRoles) {
        const user = new User({
          username: `user_${role}`,
          email: `${role}@example.com`,
          role: role
        });
        
        const savedUser = await user.save();
        expect(savedUser.role).toBe(role);
      }
    });

    it('should reject invalid role', async () => {
      const userWithInvalidRole = new User({
        username: 'testuser',
        email: 'test@example.com',
        role: 'InvalidRole'
      });

      let err;
      try {
        await userWithInvalidRole.save();
      } catch (error) {
        err = error;
      }
      expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(err.errors.role).toBeDefined();
    });
  });

  // Test de validation des emails uniques
  describe('Unique Email Validation', () => {
    it('should fail with duplicate email', async () => {
      const user1 = new User({
        username: 'user1',
        email: 'duplicate@example.com',
        role: 'Candidat'
      });
      await user1.save();

      const user2 = new User({
        username: 'user2',
        email: 'duplicate@example.com',
        role: 'Company'
      });

      let err;
      try {
        await user2.save();
      } catch (error) {
        err = error;
      }
      expect(err.code).toBe(11000); // Code d'erreur MongoDB pour duplicate key
    });
  });

  // Test de validation des usernames uniques
  describe('Unique Username Validation', () => {
    it('should fail with duplicate username', async () => {
      const user1 = new User({
        username: 'duplicateuser',
        email: 'user1@example.com',
        role: 'Candidat'
      });
      await user1.save();

      const user2 = new User({
        username: 'duplicateuser',
        email: 'user2@example.com',
        role: 'Company'
      });

      let err;
      try {
        await user2.save();
      } catch (error) {
        err = error;
      }
      expect(err.code).toBe(11000);
    });
  });

  // Test des valeurs par défaut
  describe('Default Values', () => {
    it('should set default values correctly', async () => {
      const user = new User({
        username: 'defaultuser',
        email: 'default@example.com',
        role: 'Candidat'
      });

      const savedUser = await user.save();

      expect(savedUser.isVerified).toBe(false);
      expect(savedUser.isBanned).toBe(false);
      expect(savedUser.isHaker).toBe(false);
      expect(savedUser.warnings).toBe(0);
      expect(savedUser.trafficCounter).toBe(0);
      expect(savedUser.authHistory).toHaveLength(0);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });
  });

  // Test de l'historique d'authentification
  describe('Authentication History', () => {
    it('should add authentication history entry', async () => {
      const user = new User({
        username: 'authuser',
        email: 'auth@example.com',
        role: 'Candidat'
      });

      const savedUser = await user.save();
      
      savedUser.authHistory.push({
        date: new Date(),
        ip: '192.168.1.1',
        localisation: 'Paris',
        method: 'OTP',
        status: 'Success'
      });

      const updatedUser = await savedUser.save();
      expect(updatedUser.authHistory).toHaveLength(1);
      expect(updatedUser.authHistory[0].ip).toBe('192.168.1.1');
      expect(updatedUser.authHistory[0].method).toBe('OTP');
    });
  });

  // Test des timestamps
  describe('Timestamps', () => {
    it('should set timestamps on creation', async () => {
      const user = new User({
        username: 'timestampuser',
        email: 'timestamp@example.com',
        role: 'Candidat'
      });

      const savedUser = await user.save();
      
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    it('should update timestamp on modification', async () => {
      const user = new User({
        username: 'updateuser',
        email: 'update@example.com',
        role: 'Candidat'
      });

      const savedUser = await user.save();
      const originalUpdatedAt = savedUser.updatedAt;
      
      // Attendre un peu pour que le timestamp soit différent
      await new Promise(resolve => setTimeout(resolve, 10));
      
      savedUser.username = 'updatedusername';
      const updatedUser = await savedUser.save();
      
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
