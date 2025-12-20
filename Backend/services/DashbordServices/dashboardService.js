// usersService.js
const User = require("../../models/UserModel");

module.exports.getAllUsers = async (searchQuery, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    // Construire la requête de recherche avec plusieurs critères
    let query = {};
    if (searchQuery.username || searchQuery.email || searchQuery.role) {
      query = {
        $and: [
          searchQuery.username ? { username: { $regex: searchQuery.username, $options: 'i' } } : {},
          searchQuery.email ? { email: { $regex: searchQuery.email, $options: 'i' } } : {},
          searchQuery.role ? { role: { $regex: searchQuery.role, $options: 'i' } } : {},
        ]
      };
    }

    // Récupérer les utilisateurs avec pagination, recherche et population des champs 'profile' et 'post'
    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('profile')
      .populate('post')
      .exec();

    // Compter le nombre total d'utilisateurs en fonction du filtre de recherche
    const totalUsers = await User.countDocuments(query);

    const totalPages = Math.ceil(totalUsers / limit);

    return {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
      },
    };
  } catch (error) {
    throw new Error("Erreur lors de la récupération des utilisateurs : " + error.message);
  }
};

//Simple Get All

// jobAssessmentService.js
const JobAssessmentResult = require("../../models/JobAssessmentResultModel");

module.exports.getAllJobAssessments = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    // S'assurer que limit est un nombre
    limit = parseInt(limit);

    if (isNaN(limit) || limit <= 0) {
      throw new Error("Le paramètre limit doit être un nombre valide supérieur à 0.");
    }

    // Utiliser `populate` avec `strictPopulate: false` si nécessaire
    const results = await JobAssessmentResult.find()
      .skip(skip)  // Pagination: sauter les résultats précédents
      .limit(limit)  // Limiter le nombre de résultats
      .populate('candidateId', null, null, { strictPopulate: false })  // Peupler candidateId
      .populate('companyId', null, null, { strictPopulate: false })  // Peupler companyId
      .populate('jobId', null, null, { strictPopulate: false })  // Peupler jobId
      .exec();

    // Compter le nombre total de résultats pour la pagination
    const totalResults = await JobAssessmentResult.countDocuments();

    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalResults,
      },
    };
  } catch (error) {
    throw new Error("Erreur lors de la récupération des résultats d'évaluation des jobs : " + error.message);
  }
};

//last chanse
module.exports.getJobAssessmentResultsGroupedByJobId = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    // Ensure that limit is a valid number
    limit = parseInt(limit);

    if (isNaN(limit) || limit <= 0) {
      throw new Error("The 'limit' parameter must be a valid number greater than 0.");
    }

    // First, get the total count of unique jobIds for pagination
    const totalResults = await JobAssessmentResult.aggregate([
      {
        $match: {
          assessmentType: "job",
        },
      },
      {
        $group: {
          _id: "$jobId",
        },
      },
      {
        $count: "total",
      },
    ]);

    const totalGroups = totalResults.length > 0 ? totalResults[0].total : 0;

    // Main aggregation pipeline
    const results = await JobAssessmentResult.aggregate([
      {
        $match: {
          assessmentType: "job",
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      {
        $unwind: {
          path: "$jobDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "condidateId",
          foreignField: "_id",
          as: "candidateDetails",
        },
      },
      {
        $unwind: {
          path: "$candidateDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "profiles",
          localField: "companyId",
          foreignField: "_id",
          as: "companyDetails",
        },
      },
      {
        $unwind: {
          path: "$companyDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$jobId",
          assessments: { 
            $push: {
              _id: "$_id",
              condidateId: "$condidateId",
              companyId: "$companyId",
              jobId: {
                _id: "$jobDetails._id",
                title: "$jobDetails.jobDetails.title",
                description: "$jobDetails.jobDetails.description",
                requirements: "$jobDetails.jobDetails.requirements",
                responsibilities: "$jobDetails.jobDetails.responsibilities",
                location: "$jobDetails.jobDetails.location",
                employmentType: "$jobDetails.jobDetails.employmentType",
                experienceLevel: "$jobDetails.jobDetails.experienceLevel",
                salary: "$jobDetails.jobDetails.salary",
                createdAt: "$jobDetails.createdAt",
              },
              timestamp: "$timestamp",
              assessmentType: "$assessmentType",
              numberOfQuestions: "$numberOfQuestions",
              analysis: "$analysis",
              candidateDetails: "$candidateDetails",
              companyDetails: "$companyDetails",
            }
          },
          numberOfAttempts: { $sum: 1 },
          totalScore: { $sum: "$analysis.overallScore" },
          // Utilisation de $first pour récupérer la première valeur de numberOfQuestions
          totalQuestions: { $first: "$numberOfQuestions" },  // Récupère la première valeur de numberOfQuestions
        },
      },
      
      {
        $sort: { _id: -1 }, // Sort by jobId descending
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $project: {
          _id: 1,
          jobId: {
            _id: { $arrayElemAt: ["$assessments.jobId._id", 0] },
            title: { $arrayElemAt: ["$assessments.jobId.title", 0] },
            description: { $arrayElemAt: ["$assessments.jobId.description", 0] },
            requirements: { $arrayElemAt: ["$assessments.jobId.requirements", 0] },
            responsibilities: { $arrayElemAt: ["$assessments.jobId.responsibilities", 0] },
            location: { $arrayElemAt: ["$assessments.jobId.location", 0] },
            employmentType: { $arrayElemAt: ["$assessments.jobId.employmentType", 0] },
            experienceLevel: { $arrayElemAt: ["$assessments.jobId.experienceLevel", 0] },
            salary: { $arrayElemAt: ["$assessments.jobId.salary", 0] },
            createdAt: { $arrayElemAt: ["$assessments.jobId.createdAt", 0] },
          },
          jobName: { $arrayElemAt: ["$assessments.jobId.title", 0] },
          jobDescription: { $arrayElemAt: ["$assessments.jobId.description", 0] },
          numberOfAttempts: 1,
          averageScore: {
            $cond: {
              if: { $gt: ["$numberOfAttempts", 0] },
              then: { $round: [{ $divide: ["$totalScore", "$numberOfAttempts"] }, 2] },
              else: 0,
            },
          },
          totalQuestions: 10,
          assessments: 1,
        },
      },
    ]);

    const totalPages = Math.ceil(totalGroups / limit);

    return {
      results,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalResults: totalGroups,
      },
    };
  } catch (error) {
    throw new Error(
      "Error fetching job assessment results: " + error.message
    );
  }
};

const Post = require('../../models/PostModel');
const Feedback = require('../../models/feedbackModel');
const Bid = require('../../models/BidModel');
const Profile = require('../../models/ProfileModel');

module.exports.getCounts = async () => {
  try {
    // Comptage des documents dans chaque collection
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const jobAssessmentCount = await JobAssessmentResult.countDocuments();
    const feedbackCount = await Feedback.countDocuments();
    const bidCount = await Bid.countDocuments();
    const resumeCount = await Resume.countDocuments();

    // Agrégation pour compter toutes les compétences (hardSkills et softSkills)
    const totalSkillsResult = await Profile.aggregate([
      {
        $project: {
          totalHardSkills: { $size: "$skills" },
          totalSoftSkills: { $size: "$softSkills" },
        }
      },
      {
        $group: {
          _id: null,
          totalHardSkillsCount: { $sum: "$totalHardSkills" },
          totalSoftSkillsCount: { $sum: "$totalSoftSkills" },
          totalSkillsCount: { $sum: { $add: ["$totalHardSkills", "$totalSoftSkills"] } }
        }
      }
    ]);

    const totalHardSkillsCount = totalSkillsResult.length > 0 ? totalSkillsResult[0].totalHardSkillsCount : 0;
    const totalSoftSkillsCount = totalSkillsResult.length > 0 ? totalSkillsResult[0].totalSoftSkillsCount : 0;
    const totalSkillsCount = totalSkillsResult.length > 0 ? totalSkillsResult[0].totalSkillsCount : 0;

    // Calcul des pourcentages
    const hardSkillsPercentage = totalSkillsCount > 0 ? (totalHardSkillsCount / totalSkillsCount) * 100 : 0;
    const softSkillsPercentage = totalSkillsCount > 0 ? (totalSoftSkillsCount / totalSkillsCount) * 100 : 0;

    // Calcul de la moyenne de analysis.overallScore dans JobAssessmentResult
    const avgOverallScoreResult = await JobAssessmentResult.aggregate([
      {
        $match: {
          "analysis.overallScore": { $ne: 0 } // Exclure les scores à 0
        }
      },
      {
        $group: {
          _id: null,
          avgOverallScore: { $avg: "$analysis.overallScore" }
        }
      }
    ]);

    const avgOverallScore = avgOverallScoreResult.length > 0 ? avgOverallScoreResult[0].avgOverallScore : 0;

    // Compte le nombre de JobAssessmentResult avec overallScore > 0
    const jobAssessmentWithScoreCount = await JobAssessmentResult.countDocuments({
      "analysis.overallScore": { $gt: 0 }
    });

    // Calcule le pourcentage
    const jobAssessmentWithScorePercentage = jobAssessmentCount > 0
      ? (jobAssessmentWithScoreCount / jobAssessmentCount) * 100
      : 0;

    // Récupérer les top skills de la plateforme (hardSkills et softSkills)
    const topSkillsResult = await Profile.aggregate([
      // Regrouper les compétences (hardSkills et softSkills)
      {
        $project: {
          skills: 1,
          softSkills: 1,
        }
      },
      {
        $unwind: "$skills" // "Déréférencer" les compétences des utilisateurs
      },
      {
        $group: {
          _id: "$skills.name", // Compter les compétences par leur nom
          count: { $sum: 1 }, // Nombre d'occurrences
          avgLevel: { $avg: "$skills.proficiencyLevel" }, // Moyenne du niveau de compétence
        }
      },
      {
        $sort: { count: -1, avgLevel: -1 } // Trier par fréquence, puis par niveau de maîtrise
      },
      {
        $limit: 10 // Retourner les 10 top skills
      }
    ]);

    // Retourner les résultats
    return {
      users: userCount,
      posts: postCount,
      jobAssessments: jobAssessmentCount,
      jobAssessmentsWithScore: jobAssessmentWithScoreCount, // (optionnel, pour debug)
      jobAssessmentsWithScorePercentage: jobAssessmentWithScorePercentage, // <-- AJOUTÉ
      feedback: feedbackCount,
      bids: bidCount,
      resumes: resumeCount,
      avgOverallScore: avgOverallScore,  // Moyenne des scores
      totalSkills: totalSkillsCount,     // Nombre total de compétences
      totalHardSkills: totalHardSkillsCount, // Nombre total de hard skills
      totalSoftSkills: totalSoftSkillsCount, // Nombre total de soft skills
      hardSkillsPercentage: hardSkillsPercentage, // Pourcentage de hard skills
      softSkillsPercentage: softSkillsPercentage, // Pourcentage de soft skills
      topSkills: topSkillsResult, // Top 10 des compétences
    };
  } catch (error) {
    throw new Error('Error fetching counts: ' + error.message);
  }
};



module.exports.getCountsByDay = async () => {
  try {
    // Comptage des utilisateurs créés chaque jour
    const usersCreatedByDay = await User.aggregate([
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }  // Formater la date pour qu'elle soit au format "YYYY-MM-DD"
        }
      },
      {
        $group: {
          _id: "$day",  // Regrouper par date (jour)
          userCount: { $sum: 1 }  // Compter le nombre d'utilisateurs créés ce jour-là
        }
      },
      {
        $sort: { _id: 1 }  // Trier par date croissante
      }
    ]);

    // Comptage des posts créés chaque jour
    const postsCreatedByDay = await Post.aggregate([
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }  // Formater la date pour qu'elle soit au format "YYYY-MM-DD"
        }
      },
      {
        $group: {
          _id: "$day",  // Regrouper par date (jour)
          postCount: { $sum: 1 }  // Compter le nombre de posts créés ce jour-là
        }
      },
      {
        $sort: { _id: 1 }  // Trier par date croissante
      }
    ]);

    // Comptage des job assessments créés chaque jour
    const jobAssessmentsCreatedByDay = await JobAssessmentResult.aggregate([
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }  // Formater la date pour qu'elle soit au format "YYYY-MM-DD"
        }
      },
      {
        $group: {
          _id: "$day",  // Regrouper par date (jour)
          jobAssessmentCount: { $sum: 1 }  // Compter le nombre de job assessments créés ce jour-là
        }
      },
      {
        $sort: { _id: 1 }  // Trier par date croissante
      }
    ]);

    // Calculer le nombre total d'utilisateurs, de posts et de job assessments
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalJobAssessments = await JobAssessmentResult.countDocuments();

    // Calculer les pourcentages
    const usersWithPercentage = usersCreatedByDay.map((dayData) => {
      const percentage = totalUsers > 0 ? (dayData.userCount / totalUsers) * 100 : 0;
      return {
        day: dayData._id,
        userCount: dayData.userCount,
        percentage: percentage.toFixed(2)  // Formater le pourcentage avec 2 décimales
      };
    });

    const postsWithPercentage = postsCreatedByDay.map((dayData) => {
      const percentage = totalPosts > 0 ? (dayData.postCount / totalPosts) * 100 : 0;
      return {
        day: dayData._id,
        postCount: dayData.postCount,
        percentage: percentage.toFixed(2)
      };
    });

    const jobAssessmentsWithPercentage = jobAssessmentsCreatedByDay.map((dayData) => {
      const percentage = totalJobAssessments > 0 ? (dayData.jobAssessmentCount / totalJobAssessments) * 100 : 0;
      return {
        day: dayData._id,
        jobAssessmentCount: dayData.jobAssessmentCount,
        percentage: percentage.toFixed(2)
      };
    });

    return {
      usersCreatedByDay: usersWithPercentage,
      postsCreatedByDay: postsWithPercentage,
      jobAssessmentsCreatedByDay: jobAssessmentsWithPercentage
    };
  } catch (error) {
    throw new Error('Error fetching counts by day: ' + error.message);
  }
};
module.exports.getUserCountsByLocation = async () => {
  try {
    // Agrégation pour compter les utilisateurs par localisation
    const usersByLocation = await User.aggregate([
      {
        $group: {
          _id: "$Localisation",  // Grouper par localisation
          userCount: { $sum: 1 }  // Compter le nombre d'utilisateurs par localisation
        }
      },
      {
        $sort: { userCount: -1 }  // Trier les résultats par nombre d'utilisateurs, du plus grand au plus petit
      }
    ]);

    return usersByLocation;
  } catch (error) {
    throw new Error('Error fetching user counts by location: ' + error.message);
  }
};

function normalizeSkillName(raw) {
  if (!raw) return '';
  const part = raw.split('.')[0];
  return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
}

module.exports.getJobAssessmentsBySkill = async (skillName) => {
  try {
    const normalizedSkill = skillName ? normalizeSkillName(skillName) : '';
    const matchStage = skillName
      ? { "analysis.skillAnalysis.skillName": normalizedSkill }
      : {};

    const assessments = await JobAssessmentResult.aggregate([
      { $unwind: "$analysis.skillAnalysis" },
      // Formatte skillName dans analysis.skillAnalysis
      {
        $addFields: {
          "analysis.skillAnalysis.skillName": {
            $concat: [
              { $toUpper: { $substrCP: [ { $arrayElemAt: [ { $split: [ "$analysis.skillAnalysis.skillName", "." ] }, 0 ] }, 0, 1 ] } },
              { $substrCP: [ { $arrayElemAt: [ { $split: [ "$analysis.skillAnalysis.skillName", "." ] }, 0 ] }, 1, { $subtract: [ { $strLenCP: { $arrayElemAt: [ { $split: [ "$analysis.skillAnalysis.skillName", "." ] }, 0 ] } }, 1 ] } ] }
            ]
          }
        }
      },
      { $match: matchStage },
      {
        $lookup: {
          from: "profiles",
          localField: "condidateId",
          foreignField: "_id",
          as: "candidateProfile"
        }
      },
      { $unwind: { path: "$candidateProfile", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "candidateProfile.userId",
          foreignField: "_id",
          as: "candidateDetails"
        }
      },
      { $unwind: { path: "$candidateDetails", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "posts",
          localField: "jobId",
          foreignField: "_id",
          as: "jobDetails"
        }
      },
      { $unwind: { path: "$jobDetails", preserveNullAndEmptyArrays: true } },
      // Format requiredSkills dans jobDetails.skillAnalysis
      {
        $addFields: {
          "jobDetails.skillAnalysis.requiredSkills": {
            $map: {
              input: "$jobDetails.skillAnalysis.requiredSkills",
              as: "skill",
              in: {
                $mergeObjects: [
                  "$$skill",
                  {
                    name: {
                      $concat: [
                        { $toUpper: { $substrCP: [ { $arrayElemAt: [ { $split: [ "$$skill.name", "." ] }, 0 ] }, 0, 1 ] } },
                        { $substrCP: [ { $arrayElemAt: [ { $split: [ "$$skill.name", "." ] }, 0 ] }, 1, { $subtract: [ { $strLenCP: { $arrayElemAt: [ { $split: [ "$$skill.name", "." ] }, 0 ] } }, 1 ] } ] }
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$jobId",
          candidates: {
            $addToSet: {
              username: "$candidateDetails.username",
              email: "$candidateDetails.email",
              jobMatch: "$analysis.jobMatch"
            }
          },
          totalAssessments: { $sum: 1 },
          jobDetails: { $first: "$jobDetails" }
        }
      },
      {
        $project: {
          jobId: "$_id",
          candidates: 1,
          totalAssessments: 1,
          jobDetails: 1
        }
      }
    ]);

    return assessments;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des évaluations par compétence: " + error.message);
  }
};


const xlsx = require("xlsx");

module.exports.generateUserExcel = async () => {
  try {
    // Récupérer tous les utilisateurs et peupler leurs profils
    const users = await User.find({})
      .populate("profile")  // Peupler le champ profile avec les données associées
      .select("username FirstName LastName email role lastLogin ip Localisation profile");  // Inclure le profil dans la sélection
    
    // Convertir les utilisateurs et profils en format JSON pour Excel
    const usersData = users.map(user => {
      const profile = user.profile ? {
        type: user.profile.type,
        quota: user.profile.quota,
        quotaUpdatedAt: user.profile.quotaUpdatedAt,
        readyForMatch: user.profile.readyForMatch,
        overallScore: user.profile.overallScore,
        skills: user.profile.skills,
        softSkills: user.profile.softSkills,
        todoList: user.profile.todoList,
        interviewDetails: user.profile.interviewDetails,
        companyDetails: user.profile.companyDetails,
        requiredSkills: user.profile.requiredSkills,
        requiredExperienceLevel: user.profile.requiredExperienceLevel,
        assessmentResults: user.profile.assessmentResults,
        companyBid: user.profile.companyBid,
        usersBidedByCompany: user.profile.usersBidedByCompany
      } : {}; // Si le profil est null, on renvoie un objet vide

      return {
        Username: user.username,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.email,
        Role: user.role,
        ip: user.ip,
        Localisation: user.Localisation,
        LastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'N/A', // Format de date lisible
        ...profile // Inclure les champs du profil
      };
    });

    // Créer un classeur Excel
    const ws = xlsx.utils.json_to_sheet(usersData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Users");

    // Générer un fichier Excel en mémoire
    const fileBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    return fileBuffer;
  } catch (error) {
    throw new Error("Erreur lors de la génération du fichier Excel: " + error.message);
  }
};

module.exports.generateUserExcelWithAssessmentZero = async () => {
  try {
    // Récupérer tous les résultats d'évaluation avec un overallScore de 0
    const assessments = await JobAssessmentResult.find({ "analysis.overallScore": 0 })
      .populate({
        path: "condidateId", // Peupler le profil du candidat (user)
        select: "userId", // Sélectionner uniquement le userId pour récupérer l'utilisateur
      })
      .populate({
        path: "companyId", // Peupler le profil de l'entreprise (user)
        select: "userId", // Sélectionner uniquement le userId pour récupérer l'entreprise
      });

    // Filtrer les utilisateurs à partir des résultats d'évaluation
    const users = [];
    assessments.forEach((assessment) => {
      if (assessment.condidateId && assessment.condidateId.userId) {
        users.push(assessment.condidateId.userId);
      }
    });

    // Récupérer les utilisateurs associés aux résultats d'évaluation
    const populatedUsers = await User.find({ _id: { $in: users } })
      .select("username FirstName LastName email role lastLogin ip Localisation");

    // Convertir les utilisateurs en format JSON pour Excel
    const usersData = populatedUsers.map(user => {
      return {
        UserID: user._id.toString(), // Récupérer l'ID de l'utilisateur et le convertir en chaîne de caractères
        Username: user.username,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.email,
        Role: user.role,
        ip: user.ip,
        Localisation: user.Localisation,
        LastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'N/A', // Format de date lisible
      };
    });

    // Créer un classeur Excel
    const ws = xlsx.utils.json_to_sheet(usersData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Users with Assessment Score 0");

    // Générer un fichier Excel en mémoire
    const fileBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    return fileBuffer;
  } catch (error) {
    throw new Error("Erreur lors de la génération du fichier Excel: " + error.message);
  }
};


module.exports.generateUserExcelWithAssessmentAbove50 = async () => {
  try {
    // Récupérer tous les résultats d'évaluation avec un overallScore >= 50
    const assessments = await JobAssessmentResult.find({ "analysis.overallScore": { $gte: 50 } })
      .populate({
        path: "condidateId", // Peupler le profil du candidat (user)
        select: "userId", // Sélectionner uniquement le userId pour récupérer l'utilisateur
      })
      .populate({
        path: "companyId", // Peupler le profil de l'entreprise (user)
        select: "userId", // Sélectionner uniquement le userId pour récupérer l'entreprise
      });

    // Filtrer les utilisateurs à partir des résultats d'évaluation
    const users = [];
    assessments.forEach((assessment) => {
      if (assessment.condidateId && assessment.condidateId.userId) {
        users.push(assessment.condidateId.userId);
      }
    });

    // Récupérer les utilisateurs associés aux résultats d'évaluation
    const populatedUsers = await User.find({ _id: { $in: users } })
      .select("username FirstName LastName email role lastLogin ip Localisation");

    // Convertir les utilisateurs en format JSON pour Excel
    const usersData = populatedUsers.map(user => {
      return {
        UserID: user._id.toString(), // Récupérer l'ID de l'utilisateur et le convertir en chaîne de caractères
        Username: user.username,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.email,
        Role: user.role,
        ip: user.ip,
        Localisation: user.Localisation,
        LastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'N/A', // Format de date lisible
      };
    });

    // Créer un classeur Excel
    const ws = xlsx.utils.json_to_sheet(usersData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Users >= 50"); // Nom de la feuille raccourci

    // Générer un fichier Excel en mémoire
    const fileBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    return fileBuffer;
  } catch (error) {
    throw new Error("Erreur lors de la génération du fichier Excel: " + error.message);
  }
};
