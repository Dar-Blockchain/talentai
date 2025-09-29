const Post_Steps = require("../models/post_StepsModel");
const Post = require("../models/PostModel");
const candidatePostStepProgressService = require("./candidatePostStepProgressService");
const CandidatePostStepProgress = require("../models/candidate_Post_Step_Progress");

// Create a new post step (single or multiple)
module.exports.createPostStep = async (postStepData) => {
  try {
    if (Array.isArray(postStepData)) {
      postStepData.sort((a, b) => a.order - b.order);

      const savedPostSteps = [];

      for (const stepData of postStepData) {
        if (!stepData.id) {
          const timestamp = Date.now() + Math.random();
          const nodeType = stepData.data?.type || stepData.type || "node";
          stepData.id = `${nodeType}_${timestamp}`;
        }

        if (stepData.data?.config) {
          if (!stepData.data.config.nodeNumber) {
            const nextNodeResult = await module.exports.getNextNodeNumber(
              stepData.postId
            );
            if (nextNodeResult.success) {
              stepData.data.config.nodeNumber = nextNodeResult.data;
            }
          }
        }

        const postStep = new Post_Steps(stepData);
        const savedPostStep = await postStep.save();
        savedPostSteps.push(savedPostStep);
      }

      if (savedPostSteps.length > 0) {
        const postId = savedPostSteps[0].postId;
        await module.exports.updatePostWithSteps(
          postId,
          savedPostSteps.map((step) => step._id)
        );
      }

      return {
        success: true,
        data: savedPostSteps,
        count: savedPostSteps.length,
      };
    } else {
      if (!postStepData.id) {
        const timestamp = Date.now();
        const nodeType = postStepData.data?.type || postStepData.type || "node";
        postStepData.id = `${nodeType}_${timestamp}`;
      }

      if (postStepData.data?.config) {
        if (!postStepData.data.config.nodeNumber) {
          const nextNodeResult = await module.exports.getNextNodeNumber(
            postStepData.postId
          );
          if (nextNodeResult.success) {
            postStepData.data.config.nodeNumber = nextNodeResult.data;
          }
        }
      }

      const postStep = new Post_Steps(postStepData);
      const savedPostStep = await postStep.save();

      await module.exports.updatePostWithSteps(savedPostStep.postId, [
        savedPostStep._id,
      ]);

      return { success: true, data: savedPostStep, count: 1 };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update the post with the post_steps references
module.exports.updatePostWithSteps = async (postId, stepIds) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const existingSteps = post.post_Steps || [];
    const newSteps = [...new Set([...existingSteps, ...stepIds])];

    await Post.findByIdAndUpdate(
      postId,
      { post_Steps: newSteps },
      { new: true, runValidators: false }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, error: error.message };
  }
};

// Remove post references when deleting a post_step
module.exports.removeStepFromPost = async (postId, stepId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const updatedSteps = post.post_Steps.filter(
      (id) => id.toString() !== stepId.toString()
    );

    await Post.findByIdAndUpdate(
      postId,
      { post_Steps: updatedSteps },
      { new: true, runValidators: false }
    );

    return { success: true };
  } catch (error) {
    console.error("Error removing reference:", error);
    return { success: false, error: error.message };
  }
};

// Retrieve all post steps
module.exports.getAllPostSteps = async () => {
  try {
    const postSteps = await Post_Steps.find()
      .populate("postId", "title")
      .sort({ "data.config.nodeNumber": 1 });
    return { success: true, data: postSteps };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Retrieve a post step by ID
module.exports.getPostStepById = async (id) => {
  try {
    const postStep = await Post_Steps.findById(id).populate("postId", "title");
    if (!postStep) {
      return { success: false, error: "Post step not found" };
    }
    return { success: true, data: postStep };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Retrieve a step by its unique ID (nodeId)
module.exports.getPostStepByNodeId = async (nodeId) => {
  try {
    const postStep = await Post_Steps.findOne({ id: nodeId }).populate(
      "postId",
      "title"
    );
    if (!postStep) {
      return { success: false, error: "Post step not found" };
    }
    return { success: true, data: postStep };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Retrieve steps for a specific post
module.exports.getPostStepsByPostId = async (postId) => {
  try {
    const postSteps = await Post_Steps.find({ postId })
      .populate("postId", "title")
      .sort({ "data.config.nodeNumber": 1 });
    return { success: true, data: postSteps };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update a post step
module.exports.updatePostStep = async (id, updateData) => {
  try {
    const updatedPostStep = await Post_Steps.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("postId", "title");

    if (!updatedPostStep) {
      return { success: false, error: "Post step not found" };
    }
    return { success: true, data: updatedPostStep };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update a step by its unique ID (nodeId)
module.exports.updatePostStepByNodeId = async (nodeId, updateData) => {
  try {
    const updatedPostStep = await Post_Steps.findOneAndUpdate(
      { id: nodeId },
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("postId", "title");

    if (!updatedPostStep) {
      return { success: false, error: "Post step not found" };
    }
    return { success: true, data: updatedPostStep };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete a post step
module.exports.deletePostStep = async (id) => {
  try {
    const deletedPostStep = await Post_Steps.findByIdAndDelete(id);
    if (!deletedPostStep) {
      return { success: false, error: "Post step not found" };
    }

    await module.exports.removeStepFromPost(
      deletedPostStep.postId,
      deletedPostStep._id
    );

    return { success: true, data: deletedPostStep };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete a step by its unique ID (nodeId)
module.exports.deletePostStepByNodeId = async (nodeId) => {
  try {
    const deletedPostStep = await Post_Steps.findOneAndDelete({ id: nodeId });
    if (!deletedPostStep) {
      return { success: false, error: "Post step not found" };
    }

    await module.exports.removeStepFromPost(
      deletedPostStep.postId,
      deletedPostStep._id
    );

    return { success: true, data: deletedPostStep };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Retrieve steps by type
module.exports.getPostStepsByType = async (type) => {
  try {
    const postSteps = await Post_Steps.find({ "data.type": type })
      .populate("postId", "title")
      .sort({ "data.config.nodeNumber": 1 });
    return { success: true, data: postSteps };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Retrieve steps by node type (technical, interview, etc.)
module.exports.getPostStepsByNodeType = async (nodeType) => {
  try {
    const postSteps = await Post_Steps.find({ "data.type": nodeType })
      .populate("postId", "title")
      .sort({ "data.config.nodeNumber": 1 });
    return { success: true, data: postSteps };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update a node configuration
module.exports.updateNodeConfig = async (nodeId, configData) => {
  try {
    const updatedPostStep = await Post_Steps.findOneAndUpdate(
      { id: nodeId },
      {
        "data.config": configData,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("postId", "title");

    if (!updatedPostStep) {
      return { success: false, error: "Post step not found" };
    }
    return { success: true, data: updatedPostStep };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update a node position
module.exports.updateNodePosition = async (nodeId, positionData) => {
  try {
    const updatedPostStep = await Post_Steps.findOneAndUpdate(
      { id: nodeId },
      {
        position: positionData.position,
        positionAbsolute: positionData.positionAbsolute,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("postId", "title");

    if (!updatedPostStep) {
      return { success: false, error: "Post step not found" };
    }
    return { success: true, data: updatedPostStep };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Submit a task: save GitHub link and set status to done
module.exports.submitTaskByNodeId = async (nodeId, githubLink) => {
  try {
    if (!githubLink) {
      return { success: false, error: "githubLink is required" };
    }

    // First try to update by custom node id (field `id`)
    let updatedPostStep = await Post_Steps.findOneAndUpdate(
      { id: nodeId },
      {
        status: "done",
        "data.subtitle": githubLink,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("postId", "title");

    // Fallback: try by MongoDB _id if not found via custom id
    if (!updatedPostStep) {
      updatedPostStep = await Post_Steps.findByIdAndUpdate(
        nodeId,
        {
          status: "done",
          "data.subtitle": githubLink,
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      ).populate("postId", "title");
    }

    if (!updatedPostStep) {
      return { success: false, error: "Post step not found" };
    }

    // Also update candidate progress: mark this step done and advance currentStep
    try {
      // 1) Force set the matching step to done across all progresses (atomic array update)
      await CandidatePostStepProgress.updateMany(
        { "steps.stepId": updatedPostStep._id },
        {
          $set: {
            "steps.$[elem].status": "done",
            "steps.$[elem].completedAt": new Date(),
            updatedAt: new Date(),
          },
        },
        {
          arrayFilters: [{ "elem.stepId": updatedPostStep._id }],
          upsert: false,
        }
      );

      // 2) For progresses where this is the currentStep, advance to the next
      const progressesWithCurrent = await CandidatePostStepProgress.find({
        currentStep: updatedPostStep._id,
        "steps.stepId": updatedPostStep._id,
      }).select("_id");

      for (const p of progressesWithCurrent) {
        await candidatePostStepProgressService.updateStepStatus(
          p._id,
          updatedPostStep._id,
          "done"
        );
      }
    } catch (e) {
      // Do not fail the main operation if progress update has an issue
      console.error(
        "Error updating candidate progress for submitted task:",
        e.message
      );
    }
    return { success: true, data: updatedPostStep };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get next node number for a post
module.exports.getNextNodeNumber = async (postId) => {
  try {
    const lastNode = await Post_Steps.findOne({ postId }).sort({
      "data.config.nodeNumber": -1,
    });
    return {
      success: true,
      data: lastNode ? lastNode.data.config.nodeNumber + 1 : 1,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create a node with automatic ID and number generation
module.exports.createNode = async (postId, nodeData) => {
  try {
    const nextNodeResult = await module.exports.getNextNodeNumber(postId);
    if (!nextNodeResult.success) {
      return nextNodeResult;
    }

    const timestamp = Date.now();
    const nodeType = nodeData.data?.type || "node";
    const nodeId = `${nodeType}_${timestamp}`;

    if (!nodeData.data) {
      nodeData.data = {};
    }
    if (!nodeData.data.config) {
      nodeData.data.config = {};
    }
    nodeData.data.config.nodeNumber = nextNodeResult.data;

    const newNodeData = {
      ...nodeData,
      id: nodeId,
      postId: postId,
    };

    const postStep = new Post_Steps(newNodeData);
    const savedPostStep = await postStep.save();

    await module.exports.updatePostWithSteps(postId, [savedPostStep._id]);

    return { success: true, data: savedPostStep };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Save multiple nodes at once
module.exports.saveMultipleNodes = async (postId, nodesData) => {
  try {
    const nodesToSave = nodesData.map((nodeData, index) => {
      if (!nodeData.id) {
        const timestamp = Date.now() + index;
        const nodeType = nodeData.data?.type || "node";
        nodeData.id = `${nodeType}_${timestamp}`;
      }

      if (nodeData.data?.config) {
        nodeData.data.config.nodeNumber =
          nodeData.data.config.nodeNumber || index + 1;
      }

      return {
        ...nodeData,
        postId: postId,
      };
    });

    const savedNodes = await Post_Steps.insertMany(nodesToSave);

    await module.exports.updatePostWithSteps(
      postId,
      savedNodes.map((node) => node._id)
    );

    return { success: true, data: savedNodes };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Retrieve nodes by specific type (technical, interview, condition, email)
module.exports.getNodesBySpecificType = async (postId, nodeType) => {
  try {
    const nodes = await Post_Steps.find({
      postId,
      "data.type": nodeType,
    })
      .populate("postId", "title")
      .sort({ "data.config.nodeNumber": 1 });

    return { success: true, data: nodes };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Add steps to a post
module.exports.addStepsToPost = async (postId, stepsData) => {
  try {
    const stepsWithPostId = Array.isArray(stepsData)
      ? stepsData.map((step) => ({ ...step, postId }))
      : [{ ...stepsData, postId }];

    const results = [];
    let createdCount = 0;
    let updatedCount = 0;

    for (const step of stepsWithPostId) {
      try {
        const existingStep = await module.exports.getPostStepByNodeId(step.id);

        if (existingStep.success && existingStep.data) {
          const updateResult = await module.exports.updatePostStepByNodeId(
            step.id,
            step
          );
          if (updateResult.success) {
            results.push(updateResult.data);
            updatedCount++;
          } else {
            throw new Error(
              `Error updating step ${step.id}: ${updateResult.error}`
            );
          }
        } else {
          const createResult = await module.exports.createPostStep([step]);
          if (createResult.success) {
            results.push(createResult.data[0]);
            createdCount++;
          } else {
            throw new Error(
              `Error creating step ${step.id}: ${createResult.error}`
            );
          }
        }
      } catch (stepError) {
        throw new Error(
          `Error processing step ${step.id}: ${stepError.message}`
        );
      }
    }

    return {
      success: true,
      data: results,
      count: results.length,
      created: createdCount,
      updated: updatedCount,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
