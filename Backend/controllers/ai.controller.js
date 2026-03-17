/**
 * Contrôleur pour les interactions avec les agents IA
 * Permet aux agents IA d'exécuter des outils via les APIs
 */

const { findTool, getAvailableTools } = require('../tools/ai-tools');

/**
 * Exécuter un outil demandé par l'agent IA
 * POST /ai/execute-tool
 */
exports.executeTool = async (req, res) => {
  try {
    const { toolName, parameters } = req.body;

    if (!toolName) {
      return res.status(400).json({
        success: false,
        error: 'Tool name is required'
      });
    }

    const tool = findTool(toolName);
    if (!tool) {
      return res.status(404).json({
        success: false,
        error: `Tool '${toolName}' not found`
      });
    }

    // Valider les paramètres si nécessaire
    if (tool.parameters && tool.parameters.required) {
      const missingParams = tool.parameters.required.filter(param =>
        !parameters || !(param in parameters)
      );

      if (missingParams.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required parameters: ${missingParams.join(', ')}`
        });
      }
    }

    // Exécuter l'outil
    const result = await tool.execute(parameters, req.user);

    res.json({
      success: true,
      tool: toolName,
      result: result
    });

  } catch (error) {
    console.error('AI Tool execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during tool execution'
    });
  }
};

/**
 * Obtenir la liste des outils disponibles
 * GET /ai/tools
 */
exports.getAvailableTools = async (req, res) => {
  try {
    const tools = getAvailableTools();
    res.json({
      success: true,
      tools: tools
    });
  } catch (error) {
    console.error('Error getting available tools:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

/**
 * Endpoint de santé pour vérifier que le service IA fonctionne
 * GET /ai/health
 */
exports.healthCheck = async (req, res) => {
  res.json({
    success: true,
    message: 'AI Tools service is running',
    timestamp: new Date().toISOString(),
    availableTools: getAvailableTools().length
  });
};