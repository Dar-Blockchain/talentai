const multer = require("multer");
const path   = require("path");
const fs     = require("fs");
const { randomUUID } = require("crypto");

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "resumes");

// Ensure upload directory exists (outside public/)
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  // Randomised filename — prevents path traversal and enumeration
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const uploadfile = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error("Only PDF, DOC, and DOCX files are allowed."), { status: 400 }));
    }
  },
});

module.exports = uploadfile;
