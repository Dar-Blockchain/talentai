const generateJobPostService = require("../../services/PosteServices/generateJobPost.service");

module.exports.generateJobPost = async (req, res) => {
  try {
    const { description, workMode, contractType, language } = req.body;
    const user = req.user;

    if (!description) {
      return res.status(400).json({
        error: "Missing job description",
        required: {
          description: "Detailed description of the job position",
        },
      });
    }

    const result = await generateJobPostService.generateJobPost(
      description,
      user,
      { workMode, contractType, language },
    );
    res.json(result);
  } catch (error) {
    console.error("Error in generateJobPost:", error);
    const status = error?.status || 500;
    res.status(status).json({ error: error.message || "Internal error" });
  }
};
