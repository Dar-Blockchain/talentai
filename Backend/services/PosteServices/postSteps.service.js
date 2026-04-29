const PostSteps = require("../../models/PostSteps.model");
const Post = require("../../models/Post.model");
const candidatePostStepProgressService = require("../candidatePostStepProgress.service");
const CandidatePostStepProgress = require("../../models/Candidate.PostStepsProgress.model");

// Create a new post step (single or multiple)
module.exports.createPostStep = async (postStepData) => {
  try {
    if (Array.isArray(postStepData)) {
      console.log(`📦 createPostStep: Processing ${postStepData.length} steps`);
      postStepData.sort((a, b) => a.order - b.order);

      const savedPostSteps = [];
      const errors = [];

      for (let i = 0; i < postStepData.length; i++) {
        const stepData = postStepData[i];

        try {
          console.log(`\n🔍 [Step ${i + 1}/${postStepData.length}] Processing:`, {
            id: stepData.id,
            type: stepData.data?.type,
            postId: stepData.postId,
            nodeNumber: stepData.nodeNumber
          });

          if (!stepData.id) {
            const timestamp = Date.now() + Math.random();
            const nodeType = stepData.data?.type || stepData.type || "node";
            stepData.id = `${nodeType}_${timestamp}`;
            console.log(`  ⚠️ Generated ID for step: ${stepData.id}`);
          }

          if (stepData.data?.config) {
            if (!stepData.data.config.nodeNumber) {
              const nextNodeResult = await module.exports.getNextNodeNumber(
                stepData.postId
              );
              if (nextNodeResult.success) {
                stepData.data.config.nodeNumber = nextNodeResult.data;
                console.log(`  📊 Assigned nodeNumber: ${nextNodeResult.data}`);
              }
            }
          }

          console.log(`  💾 Creating MongoDB document for step: ${stepData.id}`);
          const postStep = new PostSteps(stepData);

          console.log(`  💾 Saving to MongoDB...`);
          const savedPostStep = await postStep.save();

          console.log(`  ✅ Successfully saved step: ${stepData.id}`, {
            _id: savedPostStep._id,
            id: savedPostStep.id,
            nodeNumber: savedPostStep.nodeNumber
          });

          savedPostSteps.push(savedPostStep);

        } catch (stepError) {
          const errorMsg = `Failed to save step ${stepData.id}: ${stepError.message}`;
          console.error(`  ❌ ${errorMsg}`);

          // Check for duplicate key error
          if (stepError.code === 11000) {
            console.error(`  🚨 DUPLICATE KEY ERROR:`, {
              id: stepData.id,
              duplicateField: stepError.keyPattern,
              duplicateValue: stepError.keyValue
            });
          }

          errors.push({
            stepId: stepData.id,
            error: stepError.message,
            code: stepError.code
          });

          // Continue processing other steps instead of throwing
          console.log(`  ⏭️ Continuing to next step...`);
        }
      }

      console.log(`\n📊 Summary: ${savedPostSteps.length} saved, ${errors.length} failed`);

      if (savedPostSteps.length === 0) {
        console.error(`❌ No steps were saved successfully. Errors:`, errors);
        return {
          success: false,
          error: `Failed to save any steps`,
          errors: errors,
          count: 0
        };
      }

      if (savedPostSteps.length > 0) {
        const postId = savedPostSteps[0].postId;
        console.log(`🔗 Updating post ${postId} with ${savedPostSteps.length} step references`);

        try {
          await module.exports.updatePostWithSteps(
            postId,
            savedPostSteps.map((step) => step._id)
          );
          console.log(`✅ Post updated with step references`);
        } catch (updateError) {
          console.error(`⚠️ Failed to update post with step references:`, updateError.message);
        }
      }

      return {
        success: true,
        data: savedPostSteps,
        count: savedPostSteps.length,
        errors: errors.length > 0 ? errors : undefined
      };
    } else {
      console.log(`📦 createPostStep: Processing single step`);

      if (!postStepData.id) {
        const timestamp = Date.now();
        const nodeType = postStepData.data?.type || postStepData.type || "node";
        postStepData.id = `${nodeType}_${timestamp}`;
        console.log(`⚠️ Generated ID for single step: ${postStepData.id}`);
      }

      console.log(`🔍 Single step details:`, {
        id: postStepData.id,
        type: postStepData.data?.type,
        postId: postStepData.postId,
        nodeNumber: postStepData.nodeNumber
      });

      if (postStepData.data?.config) {
        if (!postStepData.data.config.nodeNumber) {
          const nextNodeResult = await module.exports.getNextNodeNumber(
            postStepData.postId
          );
          if (nextNodeResult.success) {
            postStepData.data.config.nodeNumber = nextNodeResult.data;
            console.log(`📊 Assigned nodeNumber: ${nextNodeResult.data}`);
          }
        }
      }

      console.log(`💾 Creating MongoDB document...`);
      const postStep = new PostSteps(postStepData);

      console.log(`💾 Saving to MongoDB...`);
      const savedPostStep = await postStep.save();

      console.log(`✅ Successfully saved single step:`, {
        _id: savedPostStep._id,
        id: savedPostStep.id,
        nodeNumber: savedPostStep.nodeNumber
      });

      console.log(`🔗 Updating post with step reference...`);
      await module.exports.updatePostWithSteps(savedPostStep.postId, [
        savedPostStep._id,
      ]);
      console.log(`✅ Post updated with step reference`);

      return { success: true, data: savedPostStep, count: 1 };
    }
  } catch (error) {
    console.error('❌ createPostStep critical error:', error);

    // Check for duplicate key error
    if (error.code === 11000) {
      console.error(`🚨 DUPLICATE KEY ERROR:`, {
        duplicateField: error.keyPattern,
        duplicateValue: error.keyValue,
        message: error.message
      });
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.code === 11000 ? {
        type: 'DUPLICATE_KEY',
        field: error.keyPattern,
        value: error.keyValue
      } : undefined
    };
  }
};

// Update the post with the PostSteps references
module.exports.updatePostWithSteps = async (postId, stepIds) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const existingSteps = post.PostSteps || [];
    const newSteps = [...new Set([...existingSteps, ...stepIds])];

    await Post.findByIdAndUpdate(
      postId,
      { PostSteps: newSteps },
      { new: true, runValidators: false }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, error: error.message };
  }
};

// Remove post references when deleting a PostStep
module.exports.removeStepFromPost = async (postId, stepId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const updatedSteps = post.PostSteps.filter(
      (id) => id.toString() !== stepId.toString()
    );

    await Post.findByIdAndUpdate(
      postId,
      { PostSteps: updatedSteps },
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
    const postSteps = await PostSteps.find()
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
    const postStep = await PostSteps.findById(id).populate("postId", "title");
    if (!postStep) {
      return { success: false, error: "Post step not found" };
    }
    return { success: true, data: postStep };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Retrieve a step by its unique ID (nodeId) and optionally filter by postId
module.exports.getPostStepByNodeId = async (nodeId, postId = null) => {
  try {
    const query = { id: nodeId };

    // If postId is provided, ensure we only find steps from that post
    if (postId) {
      query.postId = postId;
    }

    const postStep = await PostSteps.findOne(query).populate(
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
    const postSteps = await PostSteps.find({ postId })
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
    const updatedPostStep = await PostSteps.findByIdAndUpdate(
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
    const updatedPostStep = await PostSteps.findOneAndUpdate(
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
    const deletedPostStep = await PostSteps.findByIdAndDelete(id);
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
    const deletedPostStep = await PostSteps.findOneAndDelete({ id: nodeId });
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
    const postSteps = await PostSteps.find({ "data.type": type })
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
    const postSteps = await PostSteps.find({ "data.type": nodeType })
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
    const updatedPostStep = await PostSteps.findOneAndUpdate(
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
    const updatedPostStep = await PostSteps.findOneAndUpdate(
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
    let updatedPostStep = await PostSteps.findOneAndUpdate(
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
      updatedPostStep = await PostSteps.findByIdAndUpdate(
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
    const lastNode = await PostSteps.findOne({ postId }).sort({
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

    const postStep = new PostSteps(newNodeData);
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

    const savedNodes = await PostSteps.insertMany(nodesToSave);

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
    const nodes = await PostSteps.find({
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
    const errors = [];  // 🔥 NEW: Track errors for each step

    console.log(`📦 addStepsToPost: Processing ${stepsWithPostId.length} steps for post ${postId}`);

    for (const step of stepsWithPostId) {
      try {
        console.log(`🔍 Processing step: ${step.id} (type: ${step.data?.type})`);

        // 🔥 FIX: Pass postId to ensure we only find steps from THIS post
        const existingStep = await module.exports.getPostStepByNodeId(step.id, postId);

        if (existingStep.success && existingStep.data) {
          console.log(`  ↻ Updating existing step: ${step.id} for post: ${postId}`);

          // 🔥 FIX: Update status if step is configured
          if (step.data?.config?.configured && step.status === 'pending') {
            step.status = 'done';
            console.log(`  ✅ Status updated to 'done' (configured)`);
          }

          const updateResult = await module.exports.updatePostStepByNodeId(
            step.id,
            step
          );
          if (updateResult.success) {
            results.push(updateResult.data);
            updatedCount++;
            console.log(`  ✅ Updated step: ${step.id}`);
          } else {
            const error = `Update failed for ${step.id}: ${updateResult.error}`;
            errors.push(error);
            console.error(`  ❌ ${error}`);
          }
        } else {
          console.log(`  ➕ Creating new step: ${step.id} for post: ${postId}`);

          // 🔥 FIX: Set status if step is configured
          if (step.data?.config?.configured && !step.status) {
            step.status = 'done';
            console.log(`  ✅ Status set to 'done' (configured)`);
          }

          const createResult = await module.exports.createPostStep([step]);
          if (createResult.success) {
            results.push(createResult.data[0]);
            createdCount++;
            console.log(`  ✅ Created step: ${step.id}`);
          } else {
            const error = `Create failed for ${step.id}: ${createResult.error}`;
            errors.push(error);
            console.error(`  ❌ ${error}`);
          }
        }
      } catch (stepError) {
        const error = `Error processing ${step.id}: ${stepError.message}`;
        errors.push(error);
        console.error(`  ❌ ${error}`, stepError);
        // 🔥 CHANGED: Don't throw - continue processing other steps
      }
    }

    // 🔥 NEW: Return error if no steps were saved
    if (results.length === 0 && errors.length > 0) {
      console.error(`❌ Failed to save any steps:`, errors);
      return {
        success: false,
        error: `Failed to save any steps: ${errors.join('; ')}`,
        errors
      };
    }

    console.log(`✅ addStepsToPost complete: ${results.length} saved (${createdCount} created, ${updatedCount} updated)`);

    return {
      success: true,
      data: results,
      count: results.length,
      created: createdCount,
      updated: updatedCount,
      errors: errors.length > 0 ? errors : undefined  // 🔥 NEW: Include partial errors
    };
  } catch (error) {
    console.error('❌ addStepsToPost error:', error);
    return { success: false, error: error.message };
  }
};
