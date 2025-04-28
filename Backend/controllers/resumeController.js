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
    const { block, content } = req.body;
    
    if (!block || !content) {
      return res.status(400).json({ error: 'Le bloc et son contenu sont requis' });
    }

    const validBlocks = ['bio', 'experience', 'skills', 'education', 'projects'];
    if (!validBlocks.includes(block)) {
      return res.status(400).json({ error: 'Bloc invalide. Les blocs valides sont : bio, experience, skills, education, projects' });
    }

    const raw = JSON.stringify({
      [block]: content
    });

    const systemMsg =
      `As a professional CV writer, your task is to enhance and enrich the ${block} section in a professional and impactful way.
      
      Rules to follow:
      - Use professional and dynamic language
      - Add powerful action verbs
      - Quantify achievements when possible
      - Structure information clearly and concisely
      - Keep the same format
      - Do not modify dates or company names
      - Do not create new information, only enrich existing content
      - Develop each point in a detailed and professional manner
      - Return only the enhanced content, not in JSON format`;

    const { choices } = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user',   content: raw }
      ]
    });

    const response = choices?.[0]?.message?.content?.trim();
    if (!response) throw new Error('Empty response');

    return res.json({ 
      message: `${block} regenerated successfully`, 
      content: response
    });

  } catch (err) {
    console.error('OpenAI error:', err);
    res.status(err.status ?? 500).json({ error: err.message || 'Server error' });
  }
};
