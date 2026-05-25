const generateJobPostService = require("../../services/PosteServices/generateJobPost.service");
const { flattenPost } = require("../../helpers/post.validation.helpers");
const fs = require("fs");
const path = require("path");

module.exports.generateJobPost = async (req, res) => {
  try {
    const user = req.user;
    let jobData = {};

    // Check if file is uploaded
    if (req.file) {
      const filePath = req.file.path;
      const fileExtension = path.extname(req.file.originalname).toLowerCase();

      try {
        let fileContent;

        if (fileExtension === ".json") {
          // Parse JSON file
          fileContent = fs.readFileSync(filePath, "utf-8");
          jobData = JSON.parse(fileContent);
        } else if (fileExtension === ".csv") {
          // Parse CSV file - more flexible parsing
          fileContent = fs.readFileSync(filePath, "utf-8");
          const lines = fileContent.split("\n").filter(line => line.trim());
          
          if (lines.length > 0) {
            const headers = lines[0].split(",").map((h) => h.trim());
            
            // Combine all remaining lines as data (supports multi-line values)
            const dataLines = lines.slice(1);
            dataLines.forEach((line, lineIndex) => {
              const values = line.split(",").map((v) => v.trim());
              headers.forEach((header, index) => {
                if (index < values.length) {
                  if (lineIndex === 0) {
                    jobData[header] = values[index];
                  } else {
                    // Concatenate multiple rows
                    jobData[header] = (jobData[header] || "") + " " + values[index];
                  }
                }
              });
            });
          }
        } else {
          // Parse any text file (.txt, .md, .docx text export, etc.) as description
          // Accept any text format without strict structure
          fileContent = fs.readFileSync(filePath, "utf-8");
          jobData.description = fileContent.trim();
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);
      } catch (fileError) {
        console.error("Error reading file:", fileError);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        return res.status(400).json({
          error: "Error parsing file",
          details: fileError.message,
        });
      }
    } else {
      // Fallback to body parameters if no file is uploaded
      jobData = req.body;
    }

    const { description, workMode, contractType, language, interviewLanguages } = jobData;

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
      { workMode, contractType, language, interviewLanguages },
    );

    const { jobDetails, skillAnalysis, ...rest } = result;
    res.json({
      success: true,
      ...rest,
      ...(jobDetails ?? {}),
      requiredSkills: skillAnalysis?.requiredSkills ?? [],
      softSkills: skillAnalysis?.softSkills ?? [],
    });
  } catch (error) {
    console.error("Error in generateJobPost:", error);
    const status = error?.status || 500;
    res.status(status).json({ error: error.message || "Internal error" });
  }
};
