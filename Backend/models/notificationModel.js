/**
 * Notification Model - Mongoose Schema
 * Gère les notifications envoyées aux utilisateurs.
 * 
 * @module models/Notification
 */

const mongoose = require('mongoose');

/**
 * Enumération des types de notifications.
 * Modifie cette liste selon les besoins métiers.
 */
const NOTIFICATION_TYPES = ['info', 'success', 'warning', 'error', 'custom'];

/**
 * Schéma Mongoose pour la notification utilisateur.
 */
const NotificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Le contenu de la notification est requis.'],
      trim: true,
      maxlength: [512, 'Le contenu de la notification est trop long.'],
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: 'Type de notification invalide.',
      },
      default: 'info',
    },
    url: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+$/.test(v); // URL valide ou vide
        },
        message: 'URL de notification invalide.',
      },
    },
    read: {
      type: Boolean,
      default: false,
      index: true, // Pour filtrer rapidement les non-lues
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Un destinataire est requis.'],
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
      index: true,
    },
  },
  {
    collection: 'notifications',
    versionKey: false,
  }
);

// Index composé pour les requêtes les plus courantes (par destinataire, date, non lue)
NotificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

/**
 * Méthode d'instance pour marquer une notification comme lue.
 */
NotificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

/**
 * Méthode statique pour récupérer les notifications non lues d'un utilisateur.
 * @param {ObjectId} userId 
 * @returns {Promise<Array>}
 */
NotificationSchema.statics.findUnreadByUser = function(userId) {
  return this.find({ recipient: userId, read: false }).sort({ createdAt: -1 });
};

/**
 * Modèle Notification
 */
const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = {
  Notification,
  NotificationSchema,
  NOTIFICATION_TYPES,
};
