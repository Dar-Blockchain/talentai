const Resume = require('../models/resumeSchema');

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
    const filter = req.user._id
    const resumes = await Resume.find(filter).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ========== READ ONE ========== */
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.user._id);
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
      req.user._id,
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
      req.user._id,
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
    const resume = await Resume.findByIdAndDelete(req.user._id);
    if (!resume) return res.status(404).json({ error: 'CV introuvable' });
    res.json({ message: 'CV supprimé' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// controllers/resumeController.js
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20_000 });

exports.regenerate = async (req, res) => {
  try {
    const raw = req.body?.prompt?.trim();
    if (!raw) return res.status(400).json({ error: '`prompt` est requis.' });

    /* ----- Prompt strict : pas d’ajout, pas d’invention ----- */
    const systemMsg =
      `You are a copy-editor. Rewrite the user's resume text to sound more professional ` +
      `WITHOUT adding, removing or inventing any information. ` +
      `Keep exactly the same sections, headings and ordering. Only rephrase wording.`;

    /* On limite à ~25 % de plus que la taille d’origine */
    const maxTokens = Math.ceil(raw.split(/\s+/).length * 1.25);

    const { choices } = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user',   content: raw }
      ]
    });

    const content = choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Réponse vide');

    return res.json({ message: 'Résumé régénéré avec succès.', content });

  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(err.status ?? 500).json({ error: err.message || 'Erreur serveur.' });
  }
};
