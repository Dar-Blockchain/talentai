/**
 * Contact Controller
 * Handles HTTP requests for contact form submissions
 */

const ContactService = require("../services/contact.service");

class ContactController {
  /**
   * Submit contact form
   * POST /contact
   *
   * Body:
   * {
   *   name: string (required),
   *   email: string (required),
   *   company: string (required),
   *   teamSize?: string (optional),
   *   message: string (required)
   * }
   *
   * Response:
   * {
   *   success: boolean,
   *   message: string,
   *   data?: object
   * }
   */
  static async submitContactForm(req, res) {
    try {
      const { name, email, company, teamSize, message, plan } = req.body;

      // Send contact email via service
      const result = await ContactService.sendContactEmail({
        name,
        email,
        company,
        teamSize,
        message: plan ? `[Plan: ${plan}]\n${message || ""}` : message,
      });

      // Log submission asynchronously (don't wait)
      ContactService.logContactSubmission({
        name,
        email,
        company,
        teamSize,
      }).catch((err) => console.error("Logging error:", err));

      return res.json(result);
    } catch (error) {
      const statusCode = error.status || 500;
      const errorMessage = error.message || "An error occurred while processing your request.";

      console.error("❌ Contact form submission failed:", errorMessage);

      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
      });
    }
  }
}

module.exports = ContactController;
