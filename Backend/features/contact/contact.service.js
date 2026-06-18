const { sendEnterpriseInquiry } = require("../../utils/email-service");

class ContactService {
  static validateContactInput(data) {
    const { name, email, company, teamSize, message } = data;

    if (!name || !email) {
      throw { status: 400, message: "Missing required fields: name and email are required." };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw { status: 400, message: "Invalid email format." };
    }

    if (message && message.length > 5000) {
      throw { status: 400, message: "Message cannot exceed 5000 characters." };
    }

    return { name, email, company, teamSize, message };
  }

  static async sendContactEmail(data) {
    try {
      const { name, email, company, message } = this.validateContactInput(data);
      await sendEnterpriseInquiry({ name, email, company, message });
      return {
        success: true,
        message: "Your message has been sent. Our team will get back to you within 24 hours.",
      };
    } catch (error) {
      console.error("❌ Contact email failed:", error.message);
      throw { status: error.status || 500, message: error.message || "Failed to send contact email." };
    }
  }

  static async logContactSubmission(data) {
    try {
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
