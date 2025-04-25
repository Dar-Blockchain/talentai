const Resume = require('../models/Resume');

/* ========== CREATE ========== */
exports.createResume = async (req, res) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: '`sections` doit être un tableau non vide' });
    }

    const resume = await Resume.create({
      userId: req.user?._id,
      sections: sections.map(s => ({ ...s, raw: s }))
    });

    res.status(201).json({ message: 'CV enregistré', resume });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ========== READ ALL (liste) ========== */
exports.getResumes = async (req, res) => {
  try {
    const filter = req.query.userId ? { userId: req.query.userId } : {};
    const resumes = await Resume.find(filter).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ========== READ ONE ========== */
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) return res.status(404).json({ error: 'CV introuvable' });
    res.json(resume);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ========== UPDATE (PUT remplace tout) ========== */
exports.replaceResume = async (req, res) => {
  try {
    const { sections } = req.body;
    if (!Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: '`sections` doit être un tableau non vide' });
    }

    const resume = await Resume.findByIdAndUpdate(
      req.params.id,
      { sections: sections.map(s => ({ ...s, raw: s })) },
      { new: true, runValidators: true }
    );
    if (!resume) return res.status(404).json({ error: 'CV introuvable' });
    res.json({ message: 'CV remplacé', resume });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ========== PATCH (mise à jour partielle) ========== */
exports.updateResume = async (req, res) => {
  try {
    const updates = req.body;           // ex : { "sections.2.skills": [...] }
    const resume = await Resume.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!resume) return res.status(404).json({ error: 'CV introuvable' });
    res.json({ message: 'CV mis à jour', resume });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ========== DELETE ========== */
exports.deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findByIdAndDelete(req.params.id);
    if (!resume) return res.status(404).json({ error: 'CV introuvable' });
    res.json({ message: 'CV supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
