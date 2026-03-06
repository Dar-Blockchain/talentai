const InterviewApplicant = require('../models/InterviewApplicant.model');
const mongoose = require('mongoose');

class InterviewApplicantController {
  /**
   * Register a new applicant when they open a job interview link
   * POST /interview-applicants
   * Body: { jobId, firstName, lastName, email, ref? }
   */
  static async register(req, res) {
    try {
      const { jobId, firstName, lastName, email, ref } = req.body;

      if (!jobId || !firstName || !lastName || !email) {
        return res.status(400).json({
          success: false,
          message: 'jobId, firstName, lastName and email are required',
        });
      }

      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ success: false, message: 'Invalid jobId' });
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Upsert: create if not exists, return existing if already registered (jobId + email unique)
      const applicant = await InterviewApplicant.findOneAndUpdate(
        { jobId, email: normalizedEmail },
        {
          $setOnInsert: {
            jobId,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            ref: ref || null,
            status: 'pending',
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Applicant registered successfully',
        data: applicant,
      });
    } catch (error) {
      console.error('InterviewApplicant register error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get all applicants for a specific job
   * GET /interview-applicants/job/:jobId
   */
  static async getByJob(req, res) {
    try {
      const { jobId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ success: false, message: 'Invalid jobId' });
      }

      const applicants = await InterviewApplicant.find({ jobId }).sort({ createdAt: -1 });

      return res.json({
        success: true,
        data: applicants,
        count: applicants.length,
      });
    } catch (error) {
      console.error('InterviewApplicant getByJob error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update applicant status (e.g. when interview starts/ends)
   * PATCH /interview-applicants/:id/status
   * Body: { status, interviewSessionId? }
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, interviewSessionId } = req.body;

      const allowed = ['pending', 'in_progress', 'completed'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
      }

      const applicant = await InterviewApplicant.findByIdAndUpdate(
        id,
        { status, ...(interviewSessionId && { interviewSessionId }) },
        { new: true }
      );

      if (!applicant) {
        return res.status(404).json({ success: false, message: 'Applicant not found' });
      }

      return res.json({ success: true, data: applicant });
    } catch (error) {
      console.error('InterviewApplicant updateStatus error:', error.message);
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = InterviewApplicantController;
