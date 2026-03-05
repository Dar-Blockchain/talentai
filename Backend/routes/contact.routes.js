const express = require("express");
const router = express.Router();
const { transporter } = require("../utils/email-service");

router.post("/", async (req, res) => {
  const { name, email, company, teamSize, message } = req.body;

  if (!name || !email || !company || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  const mailOptions = {
    from: '"TalentAI Contact" <contact@talentai.bid>',
    to: "contact@talentai.bid",
    replyTo: email,
    subject: `[TalentAI Contact] ${name} — ${company}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F7FAFC;">
        <div style="background: #141415; color: #fff; padding: 24px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 20px;">New Contact Form Submission</h2>
        </div>
        <div style="background: #fff; padding: 24px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6B7280; width: 120px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #0CDA8B;">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280;">Company</td><td style="padding: 8px 0;">${company}</td></tr>
            <tr><td style="padding: 8px 0; color: #6B7280;">Team Size</td><td style="padding: 8px 0;">${teamSize || "Not specified"}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
          <p style="color: #6B7280; margin: 0 0 8px;">Message</p>
          <p style="white-space: pre-wrap; margin: 0; line-height: 1.6;">${message}</p>
        </div>
        <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 16px;">TalentAI — contact@talentai.bid</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({ success: true });
  } catch (error) {
    console.error("❌ Contact email failed:", error.message);
    return res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

module.exports = router;
