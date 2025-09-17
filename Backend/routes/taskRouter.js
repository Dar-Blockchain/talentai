/**
 * Routes for task management
 * 
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - LogMiddleware("Task"): journalise les requêtes liées aux tâches
 */
const express = require("express");
const router = express.Router();
const { requireAuthUser } = require("../middleware/authMiddleware");
const postService = require("../services/postService");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");
const nodemailer = require('nodemailer');

// Auth obligatoire + logs pour toutes les routes
router.use(requireAuthUser, authLogMiddleware("Task"));

// POST /task/send-task
// Description: Send technical test task via email with PDF
router.post("/send-task", async (req, res) => {
  try {
    const { postId, stepId, candidateId, candidateEmail, candidateName, jobTitle, stepLabel } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // Debug logging
    console.log('Task router received data:', {
      postId,
      candidateEmail,
      candidateName,
      stepId,
      candidateId,
      jobTitle,
      stepLabel,
      hasToken: !!token
    });
    
    if (!postId || !candidateEmail) {
      console.log('Validation failed - missing required fields:', {
        postId: !!postId,
        candidateEmail: !!candidateEmail
      });
      return res.status(400).json({
        success: false,
        error: 'postId and candidateEmail are required'
      });
    }

    const result = await postService.createAndSendTechnicalTest(
      postId, 
      token, 
      candidateEmail, 
      candidateName
    );
    
    res.status(200).json({
      success: true,
      data: result,
      message: 'Technical test sent successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

// GET /task/test-email
// Description: Test email configuration
router.get("/test-email", async (req, res) => {
  try {
    // Use the same email configuration as sendOTP
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465, // SSL/TLS port for outgoing mail
      secure: true, // Use SSL
      auth: {
        user: "contact@talentai.bid",
        pass: "87h0u74H",
      },
    });

    // Test connection
    await transporter.verify();
    
    res.status(200).json({
      success: true,
      message: 'Email configuration is valid and working',
      email: 'contact@talentai.bid'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: `Email configuration test failed: ${error.message}`
    });
  }
});

module.exports = router;
