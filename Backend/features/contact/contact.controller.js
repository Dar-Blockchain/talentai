const ContactService = require("./contact.service");

class ContactController {
  static async submitContactForm(req, res) {
    try {
      const { name, email, company, teamSize, message, plan } = req.body;

      const result = await ContactService.sendContactEmail({
        name,
        email,
        company,
        teamSize,
        message: plan ? `[Plan: ${plan}]\n${message || ""}` : message,
      });

      return res.json(result);
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while processing your request.";
      console.error("❌ Contact form submission failed:", errorMessage);
      return res.status(statusCode).json({ success: false, message: errorMessage });
    }
  }
}

module.exports = ContactController;
