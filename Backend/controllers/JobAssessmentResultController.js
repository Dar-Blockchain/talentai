const JobAssessmentResult = require("../models/JobAssessmentResultModel");

exports.getJobAssessmentsByCompany = async (req, res) => {
  try {
    const companyId = req.user._id;
    console.log(companyId);
    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const results = await JobAssessmentResult.find({ companyId })
      .populate({
        path: "condidateId",
        populate: { path: "userId", select: "username email" }
      })
      .populate({
        path: "companyId",
        populate: { path: "userId", select: "username email" }
      })
      .populate({
        path: "jobId"
      })
      .sort({ timestamp: -1 }); // Optional: sort by newest first

    res.status(200).json({
      success: true,
      count: results.length,
      assessments: results
    });
  } catch (error) {
    console.error("Error fetching job assessments by company:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve job assessments",
      details: error.message
    });
  }
};
