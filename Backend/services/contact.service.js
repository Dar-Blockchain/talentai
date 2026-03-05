/**
 * Contact Service
 * Manages contact form submissions and email sending
 */

const { transporter } = require("../utils/email-service");

class ContactService {
  /**
   * Validate contact form input
   */
  static validateContactInput(data) {
    const { name, email, company, teamSize, message } = data;

    if (!name || !email || !company || !message) {
      throw {
        status: 400,
        message: "Missing required fields: name, email, company, and message are required.",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw {
        status: 400,
        message: "Invalid email format.",
      };
    }

    // Validate message length
    if (message.length < 10) {
      throw {
        status: 400,
        message: "Message must be at least 10 characters long.",
      };
    }

    if (message.length > 5000) {
      throw {
        status: 400,
        message: "Message cannot exceed 5000 characters.",
      };
    }

    return { name, email, company, teamSize, message };
  }

  /**
   * Generate HTML email template
   */
  static generateEmailTemplate(data) {
    const { name, email, company, teamSize, message } = data;

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #F7FAFC;">
        <div style="background: #141415; color: #fff; padding: 24px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; font-size: 20px;">New Contact Form Submission</h2>
        </div>
        <div style="background: #fff; padding: 24px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6B7280; width: 120px;">Name</td>
              <td style="padding: 8px 0; font-weight: 600;">${this.escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Email</td>
              <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #0CDA8B;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Company</td>
              <td style="padding: 8px 0;">${this.escapeHtml(company)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6B7280;">Team Size</td>
              <td style="padding: 8px 0;">${teamSize || "Not specified"}</td>
            </tr>
          </table>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 16px 0;" />
          <p style="color: #6B7280; margin: 0 0 8px;">Message</p>
          <p style="white-space: pre-wrap; margin: 0; line-height: 1.6;">${this.escapeHtml(message)}</p>
        </div>
        <p style="text-align: center; color: #9CA3AF; font-size: 12px; margin-top: 16px;">TalentAI — contact@talentai.bid</p>
      </div>
    `;
  }

  /**
   * Create mail options object
   */
  static createMailOptions(data) {
    const { name, email, company } = data;
    const htmlContent = this.generateEmailTemplate(data);

    return {
      from: '"TalentAI Contact" <contact@talentai.bid>',
      to: "contact@talentai.bid",
      replyTo: email,
      subject: `[TalentAI Contact] ${name} — ${company}`,
      html: htmlContent,
    };
  }

  /**
   * Send contact email
   */
  static async sendContactEmail(data) {
    try {
      const validatedData = this.validateContactInput(data);
      const mailOptions = this.createMailOptions(validatedData);

      await transporter.sendMail(mailOptions);

      return {
        success: true,
        message: "Contact email sent successfully",
        data: {
          recipient: mailOptions.to,
          subject: mailOptions.subject,
          replyTo: validatedData.email,
        },
      };
    } catch (error) {
      console.error("❌ Contact email failed:", error.message);

      throw {
        status: error.status || 500,
        message: error.message || "Failed to send contact email.",
      };
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  static escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Log contact submission
   */
  static async logContactSubmission(data) {
    try {
      // Log to console for now, can be extended to database
      console.log("📧 New contact submission:", {
        name: data.name,
        email: data.email,
        company: data.company,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to log contact submission:", error.message);
    }
  }
}

module.exports = ContactService;
