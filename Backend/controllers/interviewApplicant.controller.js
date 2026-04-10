const InterviewApplicant = require('../models/InterviewApplicant.model');
const User = require('../models/User.model');
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
      // Delete any extra duplicates first, keep only the oldest
      const existing = await InterviewApplicant.find({ jobId, email: normalizedEmail }).sort({ createdAt: 1 });
      if (existing.length > 1) {
        const idsToDelete = existing.slice(1).map(d => d._id);
        await InterviewApplicant.deleteMany({ _id: { $in: idsToDelete } });
      }

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
      // Handle duplicate key race condition gracefully
      if (error.code === 11000) {
        const applicant = await InterviewApplicant.findOne({ jobId: req.body.jobId, email: req.body.email?.trim().toLowerCase() });
        return res.status(200).json({ success: true, message: 'Already registered', data: applicant });
      }
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
   * Validate that the logged-in user is the intended recipient of the interview link
   * GET /interview-applicants/validate/:jobId
   */
  static async validateAccess(req, res) {
    try {
      const { jobId } = req.params;
      const { ref } = req.query; // candidate email encoded in the URL

      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        return res.status(400).json({ success: false, message: 'Invalid jobId' });
      }

      // If no ref or ref is 'link', it's a public link — allow
      if (!ref || ref === 'link') {
        return res.status(200).json({ success: true, allowed: true, reason: 'open_link' });
      }

      // Get the logged-in user's email
      const user = await User.findById(req.user._id).select('email');
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      const loggedInEmail = user.email.trim().toLowerCase();
      const intendedEmail = decodeURIComponent(ref).trim().toLowerCase();

      // Validate the logged-in user matches the intended recipient
      if (loggedInEmail !== intendedEmail) {
        return res.status(403).json({
          success: false,
          allowed: false,
          message: 'This interview invitation was not sent to your account.',
        });
      }

      return res.status(200).json({ success: true, allowed: true, reason: 'invited' });
    } catch (error) {
      console.error('InterviewApplicant validateAccess error:', error.message);
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
