const { Together } = require("together-ai");
const Resume = require('../models/resumeSchema');
const together = new Together({ apiKey: process.env.TOGETHER_API_KEY , timeout: 20_000});

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
    // Find all resumes belonging to the authenticated user
    const resumes = await Resume.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(resumes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

/* ========== READ ONE ========== */
exports.getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ 
      _id: req.params.id,
      userId: req.user._id 
    });
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
    const { sections } = req.body;
    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: '`sections` must be an array' });
    }

    const resume = await Resume.findOneAndUpdate(
      { 
        _id: req.params.id, 
        userId: req.user._id 
      },
      { sections: sections.map(s => ({ ...s, raw: s })) },
      { new: true, runValidators: true }
    );

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({ 
      message: 'Resume updated successfully', 
      resume 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
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

    let raw = JSON.stringify({
      [block]: content
    });
    
    const systemMsg =
      `As a professional CV writer, your task is to enhance the ${block} section by creating exactly two powerful bullet points.
      
      Rules to follow:
      - Create exactly two bullet points, each starting with a hyphen (-)
      - Use professional and dynamic language
      - Add powerful action verbs
      - Quantify achievements when possible
      - Keep each bullet point concise but impactful
      - Do not modify dates or company names
      - Do not create new information, only enrich existing content
      - Focus on the most important and impressive aspects
      - Each bullet point should be a complete, standalone statement`;

    const stream = await together.chat.completions.create({
      model: "deepseek-ai/DeepSeek-V3",
        messages: [
        { role: 'system', content: systemMsg },
        { role: 'user',   content: raw }
      ],
      temperature: 0.3,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) raw += content;
    }

    if (!raw) throw new Error('Empty response');

    return res.json({ 
      message: `${block} regenerated successfully`, 
      content: raw
    });

  } catch (err) {
    console.error('Together AI error:', err);
    res.status(err.status ?? 500).json({ error: err.message || 'Server error' });
  }
};
