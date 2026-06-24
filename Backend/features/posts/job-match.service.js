const Profile      = require("../users/profile.model");
const ProfileSkill = require("../skills/profile-skill.model");
const Post         = require("./post.model");
const { sendJobMatchEmail } = require("../../utils/email.service");
const notificationService  = require("../notifications/notification.service");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Normalize skill name for fuzzy matching:
// "React.js" â†’ "reactjs", "Next.js" â†’ "nextjs", "Node JS" â†’ "nodejs", "vue" â†’ "vue"
const normalize = (name) =>
  (name || "").toLowerCase().replace(/[\s.\-_]/g, "").replace(/js$/, "js");

module.exports.notifyMatchingCandidates = async (postId) => {
  try {
    const post = await Post.findById(postId).populate("user", "email username").lean();
    if (!post) return;

    const jobTitle        = post.jobDetails?.title || "New Position";
    const companyName     = post.user?.username || "A company";
    const experienceLevel = post.jobDetails?.experienceLevel || null;
    const workMode        = post.jobDetails?.workMode || null;
    const jobLanguage     = post.interviewLanguages?.[0] || "en";

    // Build a searchable text from the post title + description to match against candidate skills
    const postSearchText = [
      post.jobDetails?.title || "",
      post.jobDetails?.description || "",
    ].join(" ").toLowerCase();
    const jobLink = `${FRONTEND_URL}/candidate/jobs/${postId}`;

    // Fetch all candidate profiles with their skills from ProfileSkill collection
    const candidates = await Profile.find({ type: "Candidate" })
      .select("firstName lastName email contactInformation userId")
      .populate("userId", "email")
      .lean();

    // Load all relevant skills in one query and group by profile id
    const candidateIds = candidates.map((p) => p._id);
    const allSkills = await ProfileSkill.find({ profile: { $in: candidateIds }, kind: "technical" }).lean();
    const skillsByProfile = allSkills.reduce((acc, s) => {
      const key = String(s.profile);
      (acc[key] = acc[key] || []).push(s);
      return acc;
    }, {});

    let sent = 0;
    for (const profile of candidates) {
      const email = profile.email || profile.contactInformation?.email || profile.userId?.email;
      if (!email) continue;

      // Only skills with proficiency >= 60
      const candidateSkills = (skillsByProfile[String(profile._id)] || [])
        .filter(s => (s.levelConfirmed ?? s.proficiencyLevel ?? 0) >= 60)
        .map(s => ({ raw: s.name, norm: normalize(s.name) }))
        .filter(s => s.norm);

      if (candidateSkills.length === 0) continue;

      // Match: candidate skill name appears anywhere in the post title or description
      const matched = candidateSkills.filter(s =>
        postSearchText.includes(s.norm) || postSearchText.includes(s.raw.toLowerCase())
      );
      if (matched.length === 0) continue;

      const matchScore = Math.min(100, Math.round((matched.length / candidateSkills.length) * 100));
      const matchedSkills = matched.map(s => s.raw || s.norm).join(", ");
      const candidateName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "there";

      await sendJobMatchEmail(email, {
        candidateName,
        jobTitle,
        companyName,
        experienceLevel,
        workMode,
        matchedSkills,
        matchScore,
        jobLink,
      }, jobLanguage);

      const recipientId = profile.userId?._id ?? profile.userId;
      if (recipientId) {
        notificationService.createNotification(
          recipientId,
          `ðŸŽ¯ Great news! Your profile matches "${jobTitle}" at ${companyName}. Check it out now!`,
          'info'
        ).catch(err => console.warn(`In-app notification failed for user ${recipientId}:`, err.message));
      }

      sent++;
    }

    return sent;
  } catch (error) {
    console.error("âŒ Error in notifyMatchingCandidates:", error.message);
  }
};
