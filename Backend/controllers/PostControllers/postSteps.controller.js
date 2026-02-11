const postStepsService = require("../../services/PosteServices/postSteps.service");

// Create a new post step (single or multiple)
module.exports.createPostStep = async (req, res) => {
  try {
    const result = await postStepsService.createPostStep(req.body);

    if (result.success) {
      const isMultiple = Array.isArray(req.body);
      const message = isMultiple
        ? `${result.count} post steps created successfully`
        : "Post step created successfully";

      return res.status(201).json({
        success: true,
        message: message,
        data: result.data,
        count: result.count,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error creating post step",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Create a new node with automatic generation
module.exports.createNode = async (req, res) => {
  try {
    const { postId } = req.params;
    const nodeData = req.body;

    const result = await postStepsService.createNode(postId, nodeData);

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: "Node created successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error creating node",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Save multiple nodes at once
module.exports.saveMultipleNodes = async (req, res) => {
  try {
    const { postId } = req.params;
    const nodesData = req.body;

    const result = await postStepsService.saveMultipleNodes(postId, nodesData);

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: "Nodes saved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error saving nodes",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Add steps to a post with postId parameter
module.exports.addStepsToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const stepsData = req.body;

    const result = await postStepsService.addStepsToPost(postId, stepsData);

    if (result.success) {
      const isMultiple = Array.isArray(stepsData);
      let message = "";

      if (isMultiple) {
        if (result.created > 0 && result.updated > 0) {
          message = `${result.created} steps created and ${result.updated} steps updated successfully`;
        } else if (result.created > 0) {
          message = `${result.created} steps created successfully`;
        } else if (result.updated > 0) {
          message = `${result.updated} steps updated successfully`;
        }
      } else {
        if (result.updated > 0) {
          message = "Step updated successfully";
        } else {
          message = "Step created successfully";
        }
      }

      return res.status(200).json({
        success: true,
        message: message,
        data: result.data,
        count: result.count,
        created: result.created,
        updated: result.updated,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error adding steps",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Retrieve all post steps
module.exports.getAllPostSteps = async (req, res) => {
  try {
    const result = await postStepsService.getAllPostSteps();

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Post steps retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error retrieving post steps",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Retrieve a post step by ID
module.exports.getPostStepById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await postStepsService.getPostStepById(id);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Post step retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Post step not found",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Retrieve a step by its unique ID (nodeId)
module.exports.getPostStepByNodeId = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const result = await postStepsService.getPostStepByNodeId(nodeId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Post step retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Post step not found",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Retrieve steps for a specific post
module.exports.getPostStepsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await postStepsService.getPostStepsByPostId(postId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Post steps retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error retrieving post steps",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a post step
module.exports.updatePostStep = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await postStepsService.updatePostStep(id, req.body);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Post step updated successfully",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Post step not found",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a step by its unique ID (nodeId)
module.exports.updatePostStepByNodeId = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const result = await postStepsService.updatePostStepByNodeId(
      nodeId,
      req.body,
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Post step updated successfully",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Post step not found",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a node configuration
module.exports.updateNodeConfig = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const configData = req.body;

    const result = await postStepsService.updateNodeConfig(nodeId, configData);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Node configuration updated successfully",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Node not found",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update a node position
module.exports.updateNodePosition = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const positionData = req.body;

    const result = await postStepsService.updateNodePosition(
      nodeId,
      positionData,
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Node position updated successfully",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Node not found",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Submit task: set status to done and save github link
module.exports.submitTask = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const { githubLink } = req.body;

    const result = await postStepsService.submitTaskByNodeId(
      nodeId,
      githubLink,
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Task submitted successfully",
        data: result.data,
      });
    } else {
      return res
        .status(result.error === "Post step not found" ? 404 : 400)
        .json({
          success: false,
          message: "Error submitting task",
          error: result.error,
        });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a post step
module.exports.deletePostStep = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await postStepsService.deletePostStep(id);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Post step deleted successfully",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Post step not found",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete a step by its unique ID (nodeId)
module.exports.deletePostStepByNodeId = async (req, res) => {
  try {
    const { nodeId } = req.params;
    const result = await postStepsService.deletePostStepByNodeId(nodeId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Post step deleted successfully",
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Post step not found",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Retrieve steps by type
module.exports.getPostStepsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const result = await postStepsService.getPostStepsByType(type);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Post steps retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error retrieving post steps",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Retrieve nodes by specific type (technical, interview, condition, email)
module.exports.getNodesBySpecificType = async (req, res) => {
  try {
    const { postId, nodeType } = req.params;
    const result = await postStepsService.getNodesBySpecificType(
      postId,
      nodeType,
    );

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Nodes retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error retrieving nodes",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get next node number
module.exports.getNextNodeNumber = async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await postStepsService.getNextNodeNumber(postId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Next node number retrieved successfully",
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Error retrieving next node number",
        error: result.error,
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
