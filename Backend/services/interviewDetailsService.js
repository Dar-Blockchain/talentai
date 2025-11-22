const InterviewDetails = require("../models/InterviewDetailsModel");
const Profile = require("../models/ProfileModel");

exports.getAllInterviewDetails = async ({ page = 1, limit = 10, sort = "-createdAt", type, profileId }) => {
  const query = {};

  if (type) query.type = type;
  if (profileId) query.candidate = profileId;

  const skip = (page - 1) * limit;

  const [results, total] = await Promise.all([
    InterviewDetails.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("candidate", "firstName lastName email")
      .populate("company", "name")
      .populate({
        path: "post",
        select: "title jobDetails.title jobDetails.description post_Steps",
        populate: {
          path: "post_Steps",
          model: "Post_Steps",
          select: "id order type data position connections"
        }
      })
      .populate("jobAssessmentResult")
      .populate("postSteps") // Using the virtual populate
      .exec(),
    InterviewDetails.countDocuments(query)
  ]);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    results,
    totalPages: Math.ceil(total / limit)
  };
};



module.exports.getInterviewDetailsById = async (id) => {
  const interview = await InterviewDetails.findById(id)
    .populate("candidate", "firstName lastName email") // adapte les champs si besoin
    .populate("company", "name email")
    .populate({
      path: "post",
      select: "title jobDetails post_Steps",
      populate: {
        path: "post_Steps",
        model: "Post_Steps",
        select: "id type data position connections"
      }
    })
    .populate("jobAssessmentResult")
    .populate("postSteps"); // Using the virtual populate
  if (!interview) throw new Error("InterviewDetails non trouvée !");
  return interview;
};

exports.createInterviewDetails = async (interviewData, metadata, rawInterviewData) => {
  try {
    const newInterview = new InterviewDetails(interviewData);
    const savedInterview = await newInterview.save();
    
    // Populate les références après la sauvegarde
    const populatedInterview = await InterviewDetails.findById(savedInterview._id)
      .populate("candidate", "firstName lastName email")
      .populate("company", "name email")
      .populate({
        path: "post",
        select: "title jobDetails post_Steps",
        populate: {
          path: "post_Steps",
          model: "Post_Steps",
          select: "id type data position connections"
        }
      })
      .populate("jobAssessmentResult")
      .populate("postSteps");

    // Mettre à jour le profil avec l'interview et les skills
    const candidateId = interviewData.candidate;
    console.log("Candidate ID:", candidateId);
    
    // Créer un skill unique à partir des données brutes
    const skillName = metadata?.role || "Unknown Skill";
    const experienceLevel = metadata?.proficiency || "NoLevel";
    const overallScore = rawInterviewData?.finalReport?.coverage?.overall || 0;
    
    // Mapper experienceLevel en proficiencyLevel (1-5)
    const experienceLevelMap = {
      "Entry Level": 1,
      "Junior": 2,
      "Mid Level": 3,
      "Senior": 4,
      "Expert": 5,
    };
    const proficiencyLevel = experienceLevelMap[experienceLevel] || 0;
    
    const skill = {
      name: skillName,
      proficiencyLevel: proficiencyLevel,
      experienceLevel: experienceLevel,
      NumberTestPassed: 0,
      ScoreTest: overallScore,
      Levelconfirmed: proficiencyLevel - 1,
      isPrimary: false,
    };

    console.log("Skill to save:", skill);

    // Ajouter l'interview au profil
    await Profile.findByIdAndUpdate(
      candidateId,
      {
        $push: {
          interviewDetails: savedInterview._id,
        },
      },
      { new: true }
    );

    // Si metadata.type === 'soft', enregistrer dans softSkills, sinon dans skills
    const skillType = (metadata?.type || '').toLowerCase();
    if (skillType === 'soft') {
      // softSkills schema: { name, category, proficiencyLevel, experienceLevel, ScoreTest, isPrimary }
      const softSkill = {
        name: skillName,
        category: metadata?.category || '',
        proficiencyLevel: proficiencyLevel,
        experienceLevel: experienceLevel,
        ScoreTest: overallScore,
        isPrimary: false,
      };

      // Vérifier si softSkill existe
      const existingSoft = await Profile.findOne(
        { _id: candidateId, 'softSkills.name': skillName },
        { 'softSkills.$': 1 }
      );

      if (existingSoft && existingSoft.softSkills.length > 0) {
        // Mettre à jour ScoreTest et proficiencyLevel
        await Profile.findByIdAndUpdate(
          candidateId,
          {
            $set: {
              'softSkills.$[elem].ScoreTest': overallScore,
              'softSkills.$[elem].proficiencyLevel': proficiencyLevel,
            },
          },
          {
            arrayFilters: [{ 'elem.name': skillName }],
            new: true,
          }
        );
        console.log(`Soft skill "${skillName}" updated`);
      } else {
        // Ajouter softSkill neuf
        await Profile.findByIdAndUpdate(
          candidateId,
          { $addToSet: { softSkills: softSkill } },
          { new: true }
        );
        console.log(`Soft skill "${skillName}" added`);
      }
    } else {
      // Hard skill logic (skills array) - incrémenter NumberTestPassed si existe
      const existingSkill = await Profile.findOne(
        { _id: candidateId, 'skills.name': skillName },
        { 'skills.$': 1 }
      );

      if (existingSkill && existingSkill.skills.length > 0) {
        // Le skill existe, incrémenter NumberTestPassed
        await Profile.findByIdAndUpdate(
          candidateId,
          {
            $inc: { 'skills.$[elem].NumberTestPassed': 1 },
            $set: {
              'skills.$[elem].ScoreTest': overallScore,
              'skills.$[elem].proficiencyLevel': proficiencyLevel,
              'skills.$[elem].Levelconfirmed': proficiencyLevel,
            },
          },
          {
            arrayFilters: [{ 'elem.name': skillName }],
            new: true,
          }
        );
        console.log(`Skill "${skillName}" updated - NumberTestPassed incremented`);
      } else {
        // Le skill n'existe pas, l'ajouter
        await Profile.findByIdAndUpdate(
          candidateId,
          { $addToSet: { skills: skill } },
          { new: true }
        );
        console.log(`Skill "${skillName}" added as new`);
      }
    }

    return populatedInterview;
  } catch (error) {
    throw new Error(`Failed to create interview details: ${error.message}`);
  }
};