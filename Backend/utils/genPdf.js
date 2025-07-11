const fs = require("fs");
const path = require("path");

const createExportDirIfNeeded = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
};

const generateFilePath = (projectName) => {
  const sanitizedProjectName = projectName.replace(/[^a-z0-9]/gi, '_');
  return path.join(__dirname, "../public", `${sanitizedProjectName}_PdfAssessment.pdf`);
};

const deleteFileAfterSend = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error deleting file after send:", err);
    }
  });
};

module.exports = {
  createExportDirIfNeeded,
  generateFilePath,
  deleteFileAfterSend,
};
