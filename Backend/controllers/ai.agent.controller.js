/**
 * AI Agent Controller
 * Handles autonomous agent execution using LLM with tool calling
 */

const OpenAI = require('openai');
const { findTool, getAvailableTools } = require('../tools/ai-tools');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Validate tool parameters against schema
 */
const validateToolParameters = (tool, params) => {
  if (!tool.parameters || !tool.parameters.required) return true;

  const missingParams = tool.parameters.required.filter(param => !(param in params));
  if (missingParams.length > 0) {
    throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
  }

  // Basic type validation could be added here if needed
  return true;
};

/**
 * Log agent step for monitoring
 */
const logAgentStep = (step, details) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] AI Agent Step: ${step}`, details);
};

/**
 * Run AI Agent
 * POST /ai/agent
 * Body: { message: string, conversationId?: string }
 */
exports.runAgent = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Get available tools and format for OpenAI
    const tools = getAvailableTools();
    const openaiTools = tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
      }
    }));

    // Initialize conversation messages
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant for the TalentAI job platform. You help users with job posting tasks using the available tools.

Available tools: ${tools.map(t => t.name).join(', ')}

Guidelines:
- Understand user intent and select appropriate tools
- Chain multiple tools if needed (e.g., create post then calculate price)
- Provide clear, helpful responses
- Stop when you have the final answer`
      },
      {
        role: 'user',
        content: message
      }
    ];

    const steps = [];
    let finalResult = null;
    const maxIterations = 3;

    logAgentStep('start', { message, conversationId, userId: req.user?.id });

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      logAgentStep('iteration', { iteration: iteration + 1, messageCount: messages.length });

      // Call OpenAI with tool calling
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages,
        tools: openaiTools,
        tool_choice: 'auto',
        temperature: 0.1 // Lower temperature for more consistent tool selection
      });

      const choice = response.choices[0];
      const assistantMessage = choice.message;

      // Add assistant message to conversation
      messages.push({
        ...assistantMessage,
        content: assistantMessage.content || ''
      });

      if (choice.finish_reason === 'stop') {
        // Agent provided final answer
        finalResult = assistantMessage.content;
        logAgentStep('completed', { finalResult });
        break;

      } else if (choice.finish_reason === 'tool_calls') {
        // Agent wants to call tools
        const toolCalls = assistantMessage.tool_calls || [];

        for (const toolCall of toolCalls) {
          const { id, function: func } = toolCall;
          const toolName = func.name;
          let params;

          try {
            params = JSON.parse(func.arguments);
          } catch (parseError) {
            logAgentStep('error', { type: 'parse_error', toolName, error: parseError.message });
            messages.push({
              role: 'tool',
              tool_call_id: id,
              content: `Error: Invalid parameters format - ${parseError.message}`
            });
            continue;
          }

          // Find the tool
          const tool = findTool(toolName);
          if (!tool) {
            logAgentStep('error', { type: 'tool_not_found', toolName });
            messages.push({
              role: 'tool',
              tool_call_id: id,
              content: `Error: Tool '${toolName}' not found`
            });
            continue;
          }

          // Validate parameters
          try {
            validateToolParameters(tool, params);
          } catch (validationError) {
            logAgentStep('error', { type: 'validation_error', toolName, params, error: validationError.message });
            messages.push({
              role: 'tool',
              tool_call_id: id,
              content: `Error: ${validationError.message}`
            });
            continue;
          }

          // Execute tool
          try {
            logAgentStep('tool_execution', { toolName, params });
            const result = await tool.execute(params, req.user);

            // Record step
            steps.push({
              iteration: iteration + 1,
              tool: toolName,
              parameters: params,
              result: result,
              timestamp: new Date().toISOString()
            });

            // Add tool result to conversation
            messages.push({
              role: 'tool',
              tool_call_id: id,
              content: JSON.stringify(result) || 'Tool executed successfully'
            });

          } catch (executionError) {
            logAgentStep('error', { type: 'execution_error', toolName, params, error: executionError.message });

            // Record failed step
            steps.push({
              iteration: iteration + 1,
              tool: toolName,
              parameters: params,
              error: executionError.message,
              timestamp: new Date().toISOString()
            });

            messages.push({
              role: 'tool',
              tool_call_id: id,
              content: `Error: ${executionError.message || 'Unknown error during tool execution'}`
            });
          }
        }

      } else {
        // Unexpected finish reason
        logAgentStep('error', { type: 'unexpected_finish_reason', finishReason: choice.finish_reason });
        finalResult = 'I encountered an unexpected situation. Please try again.';
        break;
      }
    }

    // If we reached max iterations without completion
    if (finalResult === null) {
      finalResult = 'I was unable to complete your request within the allowed steps. Please try a more specific request.';
      logAgentStep('max_iterations_reached', { stepsCount: steps.length });
    }

    res.json({
      success: true,
      steps: steps,
      finalResult: finalResult,
      metadata: {
        iterations: steps.length > 0 ? Math.max(...steps.map(s => s.iteration)) : 0,
        toolsUsed: [...new Set(steps.map(s => s.tool))],
        conversationId: conversationId,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI Agent execution error:', error);
    logAgentStep('fatal_error', { error: error.message });

    res.status(500).json({
      success: false,
      error: 'Internal server error during agent execution',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get agent capabilities and available tools
 * GET /ai/agent/capabilities
 */
exports.getCapabilities = async (req, res) => {
  try {
    const tools = getAvailableTools();
    res.json({
      success: true,
      capabilities: {
        maxIterations: 3,
        supportedModels: ['gpt-4'],
        availableTools: tools.length,
        tools: tools.map(t => ({
          name: t.name,
          description: t.description,
          requiredParams: t.parameters?.required || []
        }))
      }
    });
  } catch (error) {
    console.error('Error getting agent capabilities:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};