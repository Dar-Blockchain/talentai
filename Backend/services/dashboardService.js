// usersService.js
const User = require("../models/UserModel");

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
const JobAssessmentResult = require("../models/JobAssessmentResultModel");

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

const Post = require('../models/PostModel');
const Feedback = require('../models/feedbackModel');
const Bid = require('../models/BidModel');
const Resume = require('../models/resumeSchema');

module.exports.getCounts = async () => {
  try {
    // Comptage des documents dans chaque collection
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const jobAssessmentCount = await JobAssessmentResult.countDocuments();
    const feedbackCount = await Feedback.countDocuments();
    const bidCount = await Bid.countDocuments();
    const resumeCount = await Resume.countDocuments();

    // Calcul de la moyenne de analysis.overallScore dans JobAssessmentResult
    const avgOverallScoreResult = await JobAssessmentResult.aggregate([
      {
        $group: {
          _id: null,  // Pas besoin de grouper par un champ spécifique
          avgOverallScore: { $avg: "$analysis.overallScore" },
        }
      }
    ]);

    // Vérification si des résultats sont trouvés, sinon on assigne 0
    const avgOverallScore = avgOverallScoreResult.length > 0 ? avgOverallScoreResult[0].avgOverallScore : 0;

    // Retourner les résultats
    return {
      users: userCount,
      posts: postCount,
      jobAssessments: jobAssessmentCount,
      feedback: feedbackCount,
      bids: bidCount,
      resumes: resumeCount,
      avgOverallScore: avgOverallScore,  // Ajout de la moyenne des scores
    };
  } catch (error) {
    throw new Error('Error fetching counts: ' + error.message);
  }
};
