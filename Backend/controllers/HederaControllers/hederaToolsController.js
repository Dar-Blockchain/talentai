require("dotenv").config();
const { 
  HederaLangchainToolkit, 
  AgentMode, 
  coreHTSPluginToolNames, 
  coreConsensusPluginToolNames, 
  coreQueriesPluginToolNames,
  coreQueriesPlugin,
  coreHTSPlugin,
  coreConsensusPlugin
} = require('hedera-agent-kit');
const { Client, PrivateKey, PublicKey } = require('@hashgraph/sdk');
const AgentModel = require('../../models/AgentModel');
const EvaluationTopicModel = require('../../models/EvaluationTopicModel');

// Lazy client initialization
let client = null;
let clientInitialized = false;

const getClient = () => {
  if (!client && !clientInitialized) {
    try {
      if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        console.warn('⚠️  Hedera Tools: Environment variables not set. Functionality will be limited.');
        clientInitialized = true;
        return null;
      }
      
      client = Client.forTestnet().setOperator(
        process.env.HEDERA_ACCOUNT_ID,
        PrivateKey.fromStringECDSA(process.env.HEDERA_PRIVATE_KEY),
      );
      
      // Set network timeout for faster response
      client.setNetworkTimeout(10000);
      
      clientInitialized = true;
      console.log('✅ Hedera Tools client initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Hedera Tools client:', error.message);
      clientInitialized = true;
      return null;
    }
  }
  return client;
};

// Extract the four specific tools
const {
  CREATE_FUNGIBLE_TOKEN_TOOL,
} = coreHTSPluginToolNames;

const {
  CREATE_TOPIC_TOOL,
  SUBMIT_TOPIC_MESSAGE_TOOL,
} = coreConsensusPluginToolNames;

const {
  GET_HBAR_BALANCE_QUERY_TOOL,
} = coreQueriesPluginToolNames;

// Note: Individual toolkits are created per agent in endpoints using createAgentToolkit()
// No global toolkit needed - each operation uses agent-specific credentials

/**
 * Create a fungible token directly using the toolkit
 */
exports.createFungibleToken = async (req, res) => {
  try {
    const { name, symbol, decimals = 2, initialSupply = 1000, treasuryAccount, agentId } = req.body;

    if (!name || !symbol) {
      return res.status(400).json({ 
        error: "Token name and symbol are required" 
      });
    }

    if (!agentId) {
      return res.status(400).json({ 
        error: "Agent ID is required" 
      });
    }

    // Create agent-specific toolkit
    const agentToolkit = await createAgentToolkit(agentId);

    // Get the tools from the agent's toolkit
    const tools = agentToolkit.getTools();
    console.log(tools);
    const createTokenTool = tools.find(tool => tool.name === 'create_fungible_token_tool');
    
    if (!createTokenTool) {
      return res.status(500).json({ error: "Create token tool not found" });
    }

          // Call the tool directly without LLM
      console.log('Creating token with params:', {
          tokenName: name,
          tokenSymbol: symbol,
          decimals,
          initialSupply
      });
      
      const result = await createTokenTool._call({
        tokenName: name,
        tokenSymbol: symbol,
        decimals,
        initialSupply,
        treasuryAccountId: treasuryAccount || process.env.HEDERA_ACCOUNT_ID
      });

    res.json({
      success: true,
      tokenId: result.tokenId,
      transactionId: result.transactionId,
      message: `Fungible token ${symbol} created successfully`
    });

  } catch (error) {
    res.status(500).json({
      error: "Token creation failed",
      details: error.message,
    });
  }
};

/**
 * Create a consensus topic
 */
exports.createTopic = async (req, res) => {
  try {
    const { memo, adminKey, submitKey, agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({ 
        error: "Agent ID is required" 
      });
    }

    // Create agent-specific toolkit
    const agentToolkit = await createAgentToolkit(agentId);

    // Get the tools from the agent's toolkit
    const tools = agentToolkit.getTools();
    const createTopicTool = tools.find(tool => tool.name === 'create_topic_tool');

    if (!createTopicTool) {
      return res.status(500).json({ error: "Create topic tool not found" });
    }

    // Prepare topic parameters
    const topicParams = {
      topicMemo: memo || `Topic created at ${new Date().toISOString()}`
    };

    // Add keys if provided
    if (adminKey) {
      topicParams.adminKey = PublicKey.fromString(adminKey);
    }
    if (submitKey) {
      topicParams.submitKey = PublicKey.fromString(submitKey);
    }

    // Call the tool directly without LLM
    const result = await createTopicTool._call(topicParams);

    res.json({
      success: true,
      topicId: result.topicId,
      transactionId: result.transactionId,
      message: "Consensus topic created successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: "Topic creation failed",
      details: error.message,
    });
  }
};

/**
 * Submit a message to a consensus topic
 */
exports.submitTopicMessage = async (req, res) => {
  try {
    const { topicId, message, agentId } = req.body;

    if (!topicId || !message) {
      return res.status(400).json({ 
        error: "Topic ID and message are required" 
      });
    }

    if (!agentId) {
      return res.status(400).json({ 
        error: "Agent ID is required" 
      });
    }

    // Create agent-specific toolkit
    const agentToolkit = await createAgentToolkit(agentId);

    // Get the tools from the agent's toolkit
    const tools = agentToolkit.getTools();
    const submitMessageTool = tools.find(tool => tool.name === 'submit_topic_message_tool');

    if (!submitMessageTool) {
      return res.status(500).json({ error: "Submit message tool not found" });
    }

    // Call the tool directly without LLM
    const result = await submitMessageTool._call({
      topicId,
      message
    });

    res.json({
      success: true,
      transactionId: result.transactionId,
      topicId,
      message: "Message submitted to topic successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: "Message submission failed",
      details: error.message,
    });
  }
};

/**
 * Get HBAR balance for an account
 */
exports.getHbarBalance = async (req, res) => {
  try {
    const { accountId, agentId } = req.query;

    if (!accountId) {
      return res.status(400).json({ 
        error: "Account ID is required" 
      });
    }

    if (!agentId) {
      return res.status(400).json({ 
        error: "Agent ID is required" 
      });
    }

    // Create agent-specific toolkit
    const agentToolkit = await createAgentToolkit(agentId);

    // Get the tools from the agent's toolkit
    const tools = agentToolkit.getTools();
    const balanceQueryTool = tools.find(tool => tool.name === 'get_hbar_balance_query_tool');

    if (!balanceQueryTool) {
      return res.status(500).json({ error: "Balance query tool not found" });
    }

    // Call the tool directly without LLM
    const result = await balanceQueryTool._call({
      accountId
    });

    res.json({
      success: true,
      accountId,
      balance: result.balance,
      unit: "HBAR",
      message: "Balance retrieved successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: "Balance query failed",
      details: error.message,
    });
  }
};

/**
 * Get current account balance (for the agent's account)
 */
exports.getMyBalance = async (req, res) => {
  try {
    const { agentId } = req.query;

    if (!agentId) {
      return res.status(400).json({ 
        error: "Agent ID is required" 
      });
    }

    // Create agent-specific toolkit
    const agentToolkit = await createAgentToolkit(agentId);
    const agent = await AgentModel.findById(agentId);
    const accountId = agent.hederaAccountId || agent.accountId;

    // Get the tools from the agent's toolkit
    const tools = agentToolkit.getTools();
    const balanceQueryTool = tools.find(tool => tool.name === 'get_hbar_balance_query_tool');

    if (!balanceQueryTool) {
      return res.status(500).json({ error: "Balance query tool not found" });
    }

    // Call the tool directly without LLM
    const result = await balanceQueryTool._call({
      accountId
    });

    res.json({
      success: true,
      accountId,
      balance: result.balance,
      unit: "HBAR",
      message: "Your balance retrieved successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: "Balance query failed",
      details: error.message,
    });
  }
};

/**
 * Get available tools information
 */
exports.getAvailableTools = async (req, res) => {
  try {
    const { agentId } = req.query;

    if (!agentId) {
      return res.status(400).json({ 
        error: "Agent ID is required" 
      });
    }

    // Create agent-specific toolkit
    const agentToolkit = await createAgentToolkit(agentId);
    const tools = agentToolkit.getTools();
    
    const toolsInfo = tools.map(tool => ({
      name: tool.name,
      description: tool.description || "No description available",
      parameters: tool.parameters || {}
    }));

    res.json({
      success: true,
      tools: toolsInfo,
      count: tools.length,
      message: "Available Hedera tools retrieved successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to get tools information",
      details: error.message,
    });
  }
};

/**
 * Helper function to create agent-specific Hedera toolkit
 */
async function createAgentToolkit(agentId) {
  const agent = await AgentModel.findById(agentId);
  if (!agent) {
    throw new Error('Agent not found');
  }

  // Create client with agent's credentials
  const agentClient = Client.forTestnet().setOperator(
    agent.hederaAccountId,
    PrivateKey.fromStringDer(agent.hederaPrivateKey)
  );

  // Create toolkit for this specific agent
  const agentToolkit = new HederaLangchainToolkit({
    client: agentClient,
    configuration: {
      tools: [
        CREATE_TOPIC_TOOL,
        SUBMIT_TOPIC_MESSAGE_TOOL,
        CREATE_FUNGIBLE_TOKEN_TOOL,
        GET_HBAR_BALANCE_QUERY_TOOL,
      ],
      plugins: [coreHTSPlugin, coreConsensusPlugin, coreQueriesPlugin],
      context: {
        mode: AgentMode.AUTONOMOUS,
      },
    },
  });

  return { agent, toolkit: agentToolkit };
}

/**
 * Create evaluation topic for candidate pipeline
 * POST /hedera-tools/create-evaluation-topic
 */
exports.createEvaluationTopic = async (req, res) => {
  try {
    const { company, postId, candidateName, candidateId, agentId } = req.body;

    if (!company || !postId || !candidateName || !agentId) {
      return res.status(400).json({
        error: "Company, postId, candidateName, and agentId are required"
      });
    }

    // Get agent and create toolkit
    const { agent, toolkit } = await createAgentToolkit(agentId);
    console.log(agent);
    // Create HCS-11 compliant memo (keep it short for Hedera limits)
    const topicMemo = `eval:${company}:${postId}:${candidateName}`;

    // Get create topic tool
    const tools = toolkit.getTools();
    const createTopicTool = tools.find(tool => tool.name === 'create_topic_tool');

    if (!createTopicTool) {
      return res.status(500).json({ error: "Create topic tool not found" });
    }

    // Create the topic with agent's public key
    const publicKeyString = agent.hederaPublicKey;
    console.log(publicKeyString);
    if (!publicKeyString) {
      return res.status(400).json({ 
        error: "Agent public key not found in database" 
      });
    }

    let agentPublicKey;
    try {
      agentPublicKey = PublicKey.fromString(publicKeyString);
    } catch (error) {
      return res.status(400).json({ 
        error: "Invalid public key format in database",
        details: error.message 
      });
    }

    const result = await createTopicTool._call({
      topicMemo: topicMemo,
      isSubmitKey : false,
      submitKey: agentPublicKey,
      adminKey: agentPublicKey
    });
    
    // Parse result as JSON
    const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
    let topicIdString = parsedResult.topicId.shard.low+"."+parsedResult.topicId.realm.low+"."+parsedResult.topicId.num.low;
    
    // Save to database
    const evaluationTopic = new EvaluationTopicModel({
      topicId: topicIdString,
      company,
      postId,
      candidateName,
      candidateId,
      topicMemo,
      createdBy: agent.name,
      evaluations: []
    });

    await evaluationTopic.save();

    res.json({
      success: true,
      topicId: topicIdString,
      transactionId: parsedResult.transactionId,
      topicMemo,
      message: `Evaluation topic created for ${candidateName} at ${company}`,
      createdBy: agent.name
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to create evaluation topic",
      details: error.message,
    });
  }
};

/**
 * Submit evaluation message to existing topic
 * POST /hedera-tools/submit-evaluation-message
 */
exports.submitEvaluationMessage = async (req, res) => {
  try {
    const { 
      topicId, 
      agentId, 
      evaluation: { passed, score, feedback, interviewNotes } 
    } = req.body;

    if (!topicId || !agentId || passed === undefined) {
      return res.status(400).json({
        error: "TopicId, agentId, and evaluation.passed are required"
      });
    }

    // Get evaluation topic from database
    const evaluationTopic = await EvaluationTopicModel.findOne({ topicId });
    if (!evaluationTopic) {
      return res.status(404).json({ error: "Evaluation topic not found" });
    }

    // Get agent and create toolkit
    const { agent, toolkit } = await createAgentToolkit(agentId);

    // Create HCS-11 compliant evaluation message
    const hcs11Message = {
      standard: "HCS-11",
      type: "agent_validation",
      agentProfile: {
        name: agent.name,
        avatarName: agent.avatarName,
        role: agent.role,
        accountId: agent.hederaAccountId || agent.accountId
      },
      evaluation: {
        topicId,
        candidate: evaluationTopic.candidateName,
        company: evaluationTopic.company,
        postId: evaluationTopic.postId,
        result: {
          passed,
          score: score || null,
          feedback: feedback || "",
          interviewNotes: interviewNotes || ""
        },
        timestamp: new Date().toISOString()
      },
      coordinatorMessage: {
        to: "coordinator_agent",
        action: passed ? "candidate_approved" : "candidate_rejected",
        summary: `${agent.role} evaluation: ${passed ? 'PASSED' : 'FAILED'}${score ? ` (Score: ${score})` : ''}`
      }
    };

    // Get submit message tool
    const tools = toolkit.getTools();
    const submitMessageTool = tools.find(tool => tool.name === 'submit_topic_message_tool');

    if (!submitMessageTool) {
      return res.status(500).json({ error: "Submit message tool not found" });
    }

    // Submit the HCS-11 message to the topic
    const result = await submitMessageTool._call({
      topicId: topicId,
      message: JSON.stringify(hcs11Message)
    });
    console.log(result);
    const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
    let topicIdString = parsedResult.transactionId.accountId.shard.low+"."+parsedResult.transactionId.accountId.realm.low+"."+parsedResult.transactionId.accountId.num.low;

    console.log(result);
    // Update evaluation topic in database
    evaluationTopic.evaluations.push({
      agentId: agent._id,
      agentName: agent.name,
      agentRole: agent.role,
      messageId: topicIdString,
      evaluation: {
        passed,
        score,
        feedback,
        interviewNotes
      }
    });

    // Check if all required agents have evaluated
    const requiredAgents = await AgentModel.find({ isActive: true });
    const completedEvaluations = evaluationTopic.evaluations.length;

    if (completedEvaluations >= requiredAgents.length) {
      evaluationTopic.status = "completed";
      
      // Calculate final result
      const passedCount = evaluationTopic.evaluations.filter(e => e.evaluation.passed).length;
      const totalScore = evaluationTopic.evaluations.reduce((sum, e) => sum + (e.evaluation.score || 0), 0);
      const avgScore = totalScore / evaluationTopic.evaluations.length;
      
      evaluationTopic.finalResult = {
        overallScore: avgScore,
        recommendation: passedCount >= (requiredAgents.length * 0.7) ? "RECOMMENDED" : "NOT_RECOMMENDED",
        completedAt: new Date()
      };
    }

    await evaluationTopic.save();

    res.json({
      success: true,
      topicId: topicId,
      messageId: result.transactionId,
      agentProfile: hcs11Message.agentProfile,
      evaluation: hcs11Message.evaluation,
      coordinatorMessage: hcs11Message.coordinatorMessage,
      topicStatus: evaluationTopic.status,
      message: `HCS-11 evaluation message submitted by ${agent.name} to topic ${topicId}`
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to submit evaluation message",
      details: error.message,
    });
  }
};

/**
 * Send agent validation message to evaluation topic
 * POST /hedera-tools/send-validation-message
 */
exports.sendValidationMessage = async (req, res) => {
  try {
    const { 
      topicId, 
      agentId, 
      evaluation: { passed, score, feedback, interviewNotes } 
    } = req.body;

    if (!topicId || !agentId || passed === undefined) {
      return res.status(400).json({
        error: "TopicId, agentId, and evaluation.passed are required"
      });
    }

    // Get evaluation topic
    const evaluationTopic = await EvaluationTopicModel.findOne({ topicId });
    if (!evaluationTopic) {
      return res.status(404).json({ error: "Evaluation topic not found" });
    }

    // Get agent and create toolkit
    const { agent, toolkit } = await createAgentToolkit(agentId);

    // Create HCS-11 compliant validation message
    const validationMessage = {
      standard: "HCS-11",
      type: "agent_validation",
      agentProfile: {
        name: agent.name,
        avatarName: agent.avatarName,
        role: agent.role,
        accountId: agent.hederaAccountId || agent.accountId
      },
      evaluation: {
        topicId,
        candidate: evaluationTopic.candidateName,
        company: evaluationTopic.company,
        postId: evaluationTopic.postId,
        result: {
          passed,
          score: score || null,
          feedback: feedback || "",
          interviewNotes: interviewNotes || ""
        },
        timestamp: new Date().toISOString()
      },
      coordinatorMessage: {
        to: "coordinator_agent",
        action: passed ? "candidate_approved" : "candidate_rejected",
        summary: `${agent.role} evaluation: ${passed ? 'PASSED' : 'FAILED'}${score ? ` (Score: ${score})` : ''}`
      }
    };

    // Get submit message tool
    const tools = toolkit.getTools();
    const submitMessageTool = tools.find(tool => tool.name === 'submit_topic_message_tool');

    if (!submitMessageTool) {
      return res.status(500).json({ error: "Submit message tool not found" });
    }

    // Submit the message
    const result = await submitMessageTool._call({
      topicId: topicId,
      message: JSON.stringify(validationMessage)
    });

    // Update evaluation topic in database
    evaluationTopic.evaluations.push({
      agentId: agent._id,
      agentName: agent.name,
      agentRole: agent.role,
      messageId: result.transactionId,
      evaluation: {
        passed,
        score,
        feedback,
        interviewNotes
      }
    });

    // Check if all required agents have evaluated
    const requiredAgents = await AgentModel.find({ isActive: true });
    const completedEvaluations = evaluationTopic.evaluations.length + 1; // +1 for current evaluation

    if (completedEvaluations >= requiredAgents.length) {
      evaluationTopic.status = "completed";
      
      // Calculate final result
      const allEvaluations = [...evaluationTopic.evaluations, {
        evaluation: { passed, score }
      }];
      
      const passedCount = allEvaluations.filter(e => e.evaluation.passed).length;
      const totalScore = allEvaluations.reduce((sum, e) => sum + (e.evaluation.score || 0), 0);
      const avgScore = totalScore / allEvaluations.length;
      
      evaluationTopic.finalResult = {
        overallScore: avgScore,
        recommendation: passedCount >= (requiredAgents.length * 0.7) ? "RECOMMENDED" : "NOT_RECOMMENDED",
        completedAt: new Date()
      };
    }

    await evaluationTopic.save();

    res.json({
      success: true,
      messageId: result.transactionId,
      agentProfile: validationMessage.agentProfile,
      evaluation: validationMessage.evaluation,
      coordinatorMessage: validationMessage.coordinatorMessage,
      topicStatus: evaluationTopic.status,
      message: `Validation message sent by ${agent.name} (${agent.role})`
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to send validation message",
      details: error.message,
    });
  }
};

/**
 * Get evaluation topic details and messages
 * GET /hedera-tools/evaluation-topic/:topicId
 */
exports.getEvaluationTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const evaluationTopic = await EvaluationTopicModel.findOne({ topicId })
      .populate('evaluations.agentId', 'name avatarName role');

    if (!evaluationTopic) {
      return res.status(404).json({ error: "Evaluation topic not found" });
    }

    res.json({
      success: true,
      data: evaluationTopic
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to get evaluation topic",
      details: error.message,
    });
  }
};

/**
 * Get all evaluation topics for a company/post
 * GET /hedera-tools/evaluation-topics
 */
exports.getEvaluationTopics = async (req, res) => {
  try {
    const { company, postId, status } = req.query;
    
    const filter = {};
    if (company) filter.company = company;
    if (postId) filter.postId = postId;
    if (status) filter.status = status;

    const evaluationTopics = await EvaluationTopicModel.find(filter)
      .populate('evaluations.agentId', 'name avatarName role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: evaluationTopics
    });

  } catch (error) {
    res.status(500).json({
      error: "Failed to get evaluation topics",
      details: error.message,
    });
  }
};