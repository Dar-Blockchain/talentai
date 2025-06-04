const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  feedback: {
    type: [String], // Tableau de 5 chaînes de caractères
    required: true,
    validate: [arrayLimit, '{PATH} exceeds the limit of 5'],
    default: ["", "", "", "", ""], // Initialisation vide des 5 cases
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 1000,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Validation de la longueur du tableau feedback (5 éléments maximum)
function arrayLimit(val) {
  return val.length === 5;
}

module.exports = mongoose.model('Feedback', FeedbackSchema);
