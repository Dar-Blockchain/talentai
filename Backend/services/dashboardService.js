// usersService.js
const User = require("../models/UserModel");

module.exports.getAllUsers = async (searchQuery, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    // Build search query with multiple criteria
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

    // Retrieve users with pagination, search, and populate 'profile' and 'post' fields
    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('profile')
      .populate('post')
      .exec();

    // Count total users based on search filter
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
    throw new Error("Error retrieving users: " + error.message);
  }
};

//Simple Get All

// jobAssessmentService.js
const JobAssessmentResult = require("../models/PostInterviewAssessmentModel");
const PostInterviewAssessment = require("../models/PostInterviewAssessmentModel");

module.exports.getAllJobAssessments = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    // Ensure limit is a valid number
    limit = parseInt(limit);

    if (isNaN(limit) || limit <= 0) {
      throw new Error("The 'limit' parameter must be a valid number greater than 0.");
    }

    // Use `populate` with `strictPopulate: false` if needed
    const results = await JobAssessmentResult.find()
      .skip(skip)  // Pagination: skip previous results
      .limit(limit)  // Limit number of results
      .populate('candidateId', null, null, { strictPopulate: false })  // Populate candidateId
      .populate('companyId', null, null, { strictPopulate: false })  // Populate companyId
      .populate('jobId', null, null, { strictPopulate: false })  // Populate jobId
      .exec();

    // Count total results for pagination
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
    throw new Error("Error fetching job assessment results: " + error.message);
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
          totalScore: { $sum: "$interviewData.finalReport.scores.overall" },
          // Use $first to retrieve the first value of numberOfQuestions
          totalQuestions: { $first: "$numberOfQuestions" },  // Get the first value of numberOfQuestions
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
const Profile = require('../models/ProfileModel');

module.exports.getCounts = async () => {
  try {
    // Count documents in each collection
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const jobAssessmentCount = await JobAssessmentResult.countDocuments();
    const feedbackCount = await Feedback.countDocuments();
    const bidCount = await Bid.countDocuments();

    // Aggregation to count all skills (hardSkills and softSkills)
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

    // Calculate percentages
    const hardSkillsPercentage = totalSkillsCount > 0 ? (totalHardSkillsCount / totalSkillsCount) * 100 : 0;
    const softSkillsPercentage = totalSkillsCount > 0 ? (totalSoftSkillsCount / totalSkillsCount) * 100 : 0;

    // Calculate the average of interviewData.finalReport.scores.overall in PostInterviewAssessment
    const avgOverallScoreResult = await PostInterviewAssessment.aggregate([
      {
        $match: {
          "interviewData.finalReport.scores.overall": { $ne: null, $gt: 0 } // Exclude null and scores of 0
        }
      },
      {
        $group: {
          _id: null,
          avgOverallScore: { $avg: "$interviewData.finalReport.scores.overall" }
        }
      }
    ]);

    const avgOverallScore = avgOverallScoreResult.length > 0 ? avgOverallScoreResult[0].avgOverallScore : 0;

    // Compte le nombre de PostInterviewAssessment avec overallScore > 0
    const jobAssessmentWithScoreCount = await PostInterviewAssessment.countDocuments({
      "interviewData.finalReport.scores.overall": { $gt: 0 }
    });

    // Calculate the percentage
    const jobAssessmentWithScorePercentage = jobAssessmentCount > 0
      ? (jobAssessmentWithScoreCount / jobAssessmentCount) * 100
      : 0;

    // Retrieve top skills from the platform (hardSkills and softSkills)
    const topSkillsResult = await Profile.aggregate([
      // Group skills (hardSkills and softSkills)
      {
        $project: {
          skills: 1,
          softSkills: 1,
        }
      },
      {
        $unwind: "$skills" // Unwind skills from users
      },
      {
        $group: {
          _id: "$skills.name", // Count skills by name
          count: { $sum: 1 }, // Number of occurrences
          avgLevel: { $avg: "$skills.proficiencyLevel" }, // Average skill proficiency level
        }
      },
      {
        $sort: { count: -1, avgLevel: -1 } // Sort by frequency, then by proficiency level
      },
      {
        $limit: 10 // Return top 10 skills
      }
    ]);

    // Return the results
    return {
      users: userCount,
      posts: postCount,
      jobAssessments: jobAssessmentCount,
      jobAssessmentsWithScore: jobAssessmentWithScoreCount, // (optionnel, pour debug)
      jobAssessmentsWithScorePercentage: jobAssessmentWithScorePercentage, // <-- AJOUTÉ
      feedback: feedbackCount,
      bids: bidCount,
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
    // Count users created each day
    const usersCreatedByDay = await User.aggregate([
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }  // Format date to "YYYY-MM-DD"
        }
      },
      {
        $group: {
          _id: "$day",  // Group by date (day)
          userCount: { $sum: 1 }  // Count number of users created that day
        }
      },
      {
        $sort: { _id: 1 }  // Sort by date ascending
      }
    ]);

    // Count posts created each day
    const postsCreatedByDay = await Post.aggregate([
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }  // Format date to "YYYY-MM-DD"
        }
      },
      {
        $group: {
          _id: "$day",  // Group by date (day)
          postCount: { $sum: 1 }  // Count number of posts created that day
        }
      },
      {
        $sort: { _id: 1 }  // Sort by date ascending
      }
    ]);

    // Count job assessments created each day
    const jobAssessmentsCreatedByDay = await JobAssessmentResult.aggregate([
      {
        $project: {
          day: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }  // Format date to "YYYY-MM-DD"
        }
      },
      {
        $group: {
          _id: "$day",  // Group by date (day)
          jobAssessmentCount: { $sum: 1 }  // Count number of job assessments created that day
        }
      },
      {
        $sort: { _id: 1 }  // Sort by date ascending
      }
    ]);

    // Calculate total number of users, posts, and job assessments
    const totalUsers = await User.countDocuments();
    const totalPosts = await Post.countDocuments();
    const totalJobAssessments = await JobAssessmentResult.countDocuments();

    // Calculate percentages
    const usersWithPercentage = usersCreatedByDay.map((dayData) => {
      const percentage = totalUsers > 0 ? (dayData.userCount / totalUsers) * 100 : 0;
      return {
        day: dayData._id,
        userCount: dayData.userCount,
        percentage: percentage.toFixed(2)  // Format percentage with 2 decimal places
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
    // Aggregation to count users by location
    const usersByLocation = await User.aggregate([
      {
        $group: {
          _id: "$Localisation",  // Group by location
          userCount: { $sum: 1 }  // Count number of users by location
        }
      },
      {
        $sort: { userCount: -1 }  // Sort results by user count, highest to lowest
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
    throw new Error("Error retrieving assessments by skill: " + error.message);
  }
};


const xlsx = require("xlsx");

module.exports.generateUserExcel = async () => {
  try {
    // Retrieve all users and populate their profiles
    const users = await User.find({})
      .populate("profile")  // Populate the profile field with associated data
      .select("username FirstName LastName email role lastLogin ip Localisation profile");  // Include profile in selection
    
    // Convert users and profiles to JSON format for Excel
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
      } : {}; // If profile is null, return empty object

      return {
        Username: user.username,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.email,
        Role: user.role,
        ip: user.ip,
        Localisation: user.Localisation,
        LastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'N/A', // Readable date format
        ...profile // Include profile fields
      };
    });

    // Create an Excel workbook
    const ws = xlsx.utils.json_to_sheet(usersData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Users");

    // Generate Excel file in memory
    const fileBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    return fileBuffer;
  } catch (error) {
    throw new Error("Error generating Excel file: " + error.message);
  }
};

module.exports.generateUserExcelWithAssessmentZero = async () => {
  try {
    // Retrieve all assessment results with overallScore of 0
    const assessments = await PostInterviewAssessment.find({ "interviewData.finalReport.scores.overall": { $exists: false } || { "interviewData.finalReport.scores.overall": 0 } })
      .populate('post')
      .populate('candidate')
      .populate('company');

    // Filter users from assessment results
    const users = [];
    assessments.forEach((assessment) => {
      if (assessment.candidate && assessment.candidate._id) {
        users.push(assessment.candidate._id);
      }
    });

    // Retrieve users associated with assessment results
    const populatedUsers = await User.find({ _id: { $in: users } })
      .select("username FirstName LastName email role lastLogin ip Localisation");

    // Convert users to JSON format for Excel
    const usersData = populatedUsers.map(user => {
      return {
        UserID: user._id.toString(), // Retrieve user ID and convert to string
        Username: user.username,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.email,
        Role: user.role,
        ip: user.ip,
        Localisation: user.Localisation,
        LastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'N/A', // Readable date format
      };
    });

    // Create an Excel workbook
    const ws = xlsx.utils.json_to_sheet(usersData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Users with Assessment Score 0");

    // Generate Excel file in memory
    const fileBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    return fileBuffer;
  } catch (error) {
    throw new Error("Error generating Excel file: " + error.message);
  }
};


module.exports.generateUserExcelWithAssessmentAbove50 = async () => {
  try {
    // Retrieve all assessment results with overallScore >= 50
    const assessments = await PostInterviewAssessment.find({ "interviewData.finalReport.scores.overall": { $gte: 50 } })
      .populate('post')
      .populate('candidate')
      .populate('company');

    // Filter users from assessment results
    const users = [];
    assessments.forEach((assessment) => {
      if (assessment.candidate && assessment.candidate._id) {
        users.push(assessment.candidate._id);
      }
    });

    // Retrieve users associated with assessment results
    const populatedUsers = await User.find({ _id: { $in: users } })
      .select("username FirstName LastName email role lastLogin ip Localisation");

    // Convert users to JSON format for Excel
    const usersData = populatedUsers.map(user => {
      return {
        UserID: user._id.toString(), // Retrieve user ID and convert to string
        Username: user.username,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.email,
        Role: user.role,
        ip: user.ip,
        Localisation: user.Localisation,
        LastLogin: user.lastLogin ? user.lastLogin.toISOString() : 'N/A', // Readable date format
      };
    });

    // Create an Excel workbook
    const ws = xlsx.utils.json_to_sheet(usersData);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Users >= 50"); // Shortened sheet name

    // Generate Excel file in memory
    const fileBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    return fileBuffer;
  } catch (error) {
    throw new Error("Error generating Excel file: " + error.message);
  }
};
