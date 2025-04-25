// models/Resume.js
const { Schema, model, Types } = require('mongoose');

/**
 * Sous-schéma générique pour une « section » du CV.
 * On déclare :
 *   • Les positions/layout communs (x, y, width, height)
 *   • Les champs qu’on a déjà vus
 *   • Un champ `raw` qui contient la copie intégrale reçue ➜
 *     le back-end ne cassera pas si le front ajoute un nouveau champ.
 */
const sectionSchema = new Schema(
  {
    id:        { type: String, required: true },
    type:      { type: String, required: true },  // header, text, line, image, …
    x: Number, y: Number, width: Number, height: Number,

    /* ----------  champs spécifiques OPTIONNELS  ---------- */
    // header
    name: String,
    jobTitle: String,

    // text / custom
    content: String,

    // experience
    title: String,
    company: String,
    startDate: String,
    endDate: String,
    description: String,

    // education
    degree: String,
    institution: String,

    // skills
    skills:   [String],

    // languages
    languages:[{ name: String, level: String }],

    // projects
    projects: [{ name: String, description: String }],

    // image
    src: String,
    alt: String,
    isRound: Boolean,

    // line
    orientation: String,
    thickness: Number,
    color: String,

    /* ----------  sauvegarde brute  ---------- */
    raw: Schema.Types.Mixed
  },
  { _id: false }           // on garde l’ID fourni par le front
);

const resumeSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User' }, // optionnel
    sections: { type: [sectionSchema], required: true }
  },
  { timestamps: true }
);

module.exports = model('Resume', resumeSchema);
