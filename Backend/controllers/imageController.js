const imageService = require("../services/imageService");
const path = require("path");
const fs = require("fs");

/**
 * Controller to handle GET /:image
 * Serves an image file from the public/images directory.
 */
module.exports.getImage = (req, res) => {
  const imageName = req.params.image;

  // Use the service to get image info
  const { found, filePath, mimeType } = imageService.getImage(imageName);

  console.log("found: ", found, "filePath: ", filePath, "mimeType: ", mimeType);

  if (!found) {
    return res.status(404).json({ error: "Image not found." });
  }

  res.setHeader("Content-Type", mimeType);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(500).json({ error: "Failed to send image." });
    }
  });
};
