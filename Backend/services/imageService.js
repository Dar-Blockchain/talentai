const path = require("path");
const fs = require("fs");

/**
 * Service function to get an image file from the public/images directory.
 * @param {string} imageName - The name of the image file to retrieve.
 * @returns {Object} - { found: boolean, filePath: string, mimeType: string }
 */
const getImage = (imageName) => {

  const imagesDir = path.join(__dirname, "../images");
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
  const ext = path.extname(imageName.trim()).toLowerCase();

  console.log("check ext: ", ext);

  if (!allowedExtensions.includes(ext)) {
    return { found: false, filePath: null, mimeType: null };
  }

  const filePath = path.join(imagesDir, imageName.trim());

  console.log("lifePath:",filePath);

  // Check if the file exists using an absolute path and log for debugging
  try {
    const resolvedPath = path.resolve(filePath);
    console.log("Resolved file path:", resolvedPath);
    if (!fs.existsSync(resolvedPath) || !fs.statSync(resolvedPath).isFile()) {
      return { found: false, filePath: null, mimeType: null };
    }
  } catch (err) {
    console.error("Error checking file existence:", err);
    return { found: false, filePath: null, mimeType: null };
  }

  // Basic mime type mapping
  const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };

  return {
    found: true,
    filePath,
    mimeType: mimeTypes[ext] || "application/octet-stream",
  };
};

module.exports = {
  getImage,
};
