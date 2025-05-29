const Post = require("../models/PostModel");
const User = require("../models/UserModel");
const AgentService = require("./AgentService");
const { schedulePostMatchingAgenda } = require("../postMatchingAgenda");

// Validation des données du post
const validatePostData = (postData) => {
  const { jobDetails, skillAnalysis, linkedinPost } = postData;

  // Validation des jobDetails
  if (!jobDetails?.title || !jobDetails?.description) {
    throw new Error("Job title and description are required");
  }

  // Validation du salaire
  if (jobDetails.salary) {
    if (jobDetails.salary.min > jobDetails.salary.max) {
      throw new Error("Minimum salary cannot be greater than maximum salary");
    }
  }

  // Validation des compétences requises
  if (!skillAnalysis?.requiredSkills?.length) {
    throw new Error("At least one required skill must be specified");
  }

  // Validation du post LinkedIn
  if (!linkedinPost?.formattedContent?.headline || !linkedinPost?.finalPost) {
    throw new Error("LinkedIn post content is required");
  }

  return true;
};

// Créer un nouveau post
module.exports.createPost = async (postData) => {
  try {
    // Valider les données
    validatePostData(postData);

    const post = new Post(postData);
    const user = await User.findById(postData.user);
    user.post.push(post._id);
    await user.save();
    await post.save();
    console.log(post);
    //await schedulePostMatchingAgenda(post._id.toString(), {
    //  requiredSkills: post.skillAnalysis.requiredSkills
    //});
    return post;
  } catch (error) {
    throw new Error(`Error creating post: ${error.message}`);
  }
};

// Récupérer tous les posts avec filtres avancés
module.exports.getAllPosts = async (filters = {}) => {
  try {
    let query = {};

    // Filtres pour le statut
    if (filters.status) {
      query.status = filters.status;
    }

    // Filtres pour le type d'emploi
    if (filters.employmentType) {
      query["jobDetails.employmentType"] = filters.employmentType;
    }

    // Filtres pour le niveau d'expérience
    if (filters.experienceLevel) {
      query["jobDetails.experienceLevel"] = filters.experienceLevel;
    }

    // Filtres pour les compétences
    if (filters.skills) {
      query["skillAnalysis.requiredSkills.name"] = { $in: filters.skills };
    }

    // Filtres pour la fourchette de salaire
    if (filters.salary) {
      if (filters.salary.min) {
        query["jobDetails.salary.min"] = { $gte: filters.salary.min };
      }
      if (filters.salary.max) {
        query["jobDetails.salary.max"] = { $lte: filters.salary.max };
      }
    }

    return await Post.find(query)
      .populate("user", "username email")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching posts: ${error.message}`);
  }
};

// Récupérer un post par son ID
module.exports.getPostById = async (postId) => {
  try {
    const post = await Post.findById(postId).populate("user", "username email");
    if (!post) {
      throw new Error("Post not found");
    }
    return post;
  } catch (error) {
    throw new Error(`Error fetching post: ${error.message}`);
  }
};

// Récupérer les required skills d'un post par son ID
module.exports.getRequiredSkillsByPostId = async (postId) => {
  try {
    if (!postId) {
      throw new Error("Post ID is required");
    }
    // Fetch post but only select `requiredSkills`
    const post = await Post.findById(postId).select(
      "skillAnalysis.requiredSkills"
    );
    if (!post) {
      throw new Error("Post not found");
    }
    // Extract required skills with levels
    const requiredSkills =
      post.skillAnalysis?.requiredSkills?.map((skill) => ({
        name: skill.name,
        level: skill.level,
      })) || [];

    return { postId, requiredSkills };
  } catch (error) {
    throw new Error(`Error fetching required skills: ${error.message}`);
  }
};

// Récupérer les posts d'un utilisateur
module.exports.getPostsByUserId = async (userId) => {
  try {
    return await Post.find({ user: userId })
      .populate("user", "username email")
      .sort({ createdAt: -1 });
  } catch (error) {
    throw new Error(`Error fetching user posts: ${error.message}`);
  }
};

// Mettre à jour un post
module.exports.updatePost = async (postId, userId, updateData) => {
  try {
    // Valider les données si une mise à jour complète est fournie
    if (
      updateData.jobDetails ||
      updateData.skillAnalysis ||
      updateData.linkedinPost
    ) {
      validatePostData(updateData);
    }

    const post = await Post.findOne({ _id: postId, user: userId });
    if (!post) {
      throw new Error("Post not found or unauthorized");
    }

    Object.assign(post, updateData);
    return await post.save();
  } catch (error) {
    throw new Error(`Error updating post: ${error.message}`);
  }
};

// Supprimer un post
module.exports.deletePost = async (postId, userId) => {
  try {
    const post = await Post.findOneAndDelete({ _id: postId, user: userId });
    if (!post) {
      throw new Error("Post not found or unauthorized");
    }
    return post;
  } catch (error) {
    throw new Error(`Error deleting post: ${error.message}`);
  }
};

// Changer le statut d'un post
module.exports.updatePostStatus = async (postId, userId, status) => {
  try {
    const post = await Post.findOne({ _id: postId, user: userId });
    if (!post) {
      throw new Error("Post not found or unauthorized");
    }

    post.status = status;
    return await post.save();
  } catch (error) {
    throw new Error(`Error updating post status: ${error.message}`);
  }
};
