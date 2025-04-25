// controllers/resumeController.js
const Resume = require('../models/resumeSchema');

exports.createResume = async (req, res) => {
  try {
    const { sections } = req.body;

    // validation basique
    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: '`sections` doit être un tableau non vide' });
    }

    // chaque bloc doit avoir id + type
    const invalid = sections.find(s => !s.id || !s.type);
    if (invalid) {
      return res.status(400).json({ error: 'Chaque section doit contenir `id` et `type`' });
    }

    const resume = await Resume.create({
      userId: req.user?._id,
      sections: sections.map(s => ({ ...s, raw: s })) // on duplique l’objet complet
    });

    res.status(201).json({ message: 'CV enregistré', resumeId: resume._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
