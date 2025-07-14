const interviewDetailsService = require("../services/interviewDetailsService");

exports.getAll = async (req, res) => {
  try {
    const { page, limit, sort, type, profileId } = req.query;

    const result = await interviewDetailsService.getAllInterviewDetails({
      page,
      limit,
      sort,
      type,
      profileId,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.getInterviewDetailsById = async (req, res) => {
  try {
    const { id } = req.params;
    const details = await interviewDetailsService.getInterviewDetailsById(id);
    res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message,
    });
  }
};
