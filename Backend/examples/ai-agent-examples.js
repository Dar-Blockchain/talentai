/**
 * Example usage of the AI Agent system
 * This file demonstrates how to use the autonomous AI agent
 */

// Example 1: Simple tool execution
const exampleExecuteTool = async () => {
  const response = await fetch('/ai/execute-tool', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: JSON.stringify({
      toolName: 'createPost',
      parameters: {
        title: 'Senior Node.js Developer',
        description: 'We are looking for an experienced Node.js developer...',
        skills: ['Node.js', 'Express', 'MongoDB'],
        location: 'Paris',
        salary: { min: 50000, max: 70000, currency: 'EUR' }
      }
    })
  });

  const result = await response.json();
  console.log('Tool execution result:', result);
};

// Example 2: Autonomous agent execution
const exampleRunAgent = async () => {
  const response = await fetch('/ai/agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    },
    body: JSON.stringify({
      message: 'Create a job posting for a React developer in Paris and calculate its publication price',
      conversationId: 'conv-123'
    })
  });

  const result = await response.json();
  console.log('Agent execution result:', result);
  /*
  Expected output:
  {
    success: true,
    steps: [
      {
        iteration: 1,
        tool: 'createPost',
        parameters: { title: '...', description: '...', ... },
        result: { success: true, data: { ... } },
        timestamp: '2024-01-01T10:00:00.000Z'
      },
      {
        iteration: 1,
        tool: 'calculatePostPrice',
        parameters: { postId: '...' },
        result: { success: true, data: { totalPrice: 150, ... } },
        timestamp: '2024-01-01T10:00:01.000Z'
      }
    ],
    finalResult: 'Job posting created successfully! The publication price is 150 TAI tokens.',
    metadata: {
      iterations: 1,
      toolsUsed: ['createPost', 'calculatePostPrice'],
      conversationId: 'conv-123',
      timestamp: '2024-01-01T10:00:02.000Z'
    }
  }
  */
};

// Example 3: Get agent capabilities
const exampleGetCapabilities = async () => {
  const response = await fetch('/ai/agent/capabilities', {
    headers: {
      'Authorization': 'Bearer YOUR_JWT_TOKEN'
    }
  });

  const result = await response.json();
  console.log('Agent capabilities:', result);
  /*
  Expected output:
  {
    success: true,
    capabilities: {
      maxIterations: 3,
      supportedModels: ['gpt-4'],
      availableTools: 17,
      tools: [
        {
          name: 'createPost',
          description: 'Créer une nouvelle offre d\'emploi (post)',
          requiredParams: ['title', 'description']
        },
        // ... other tools
      ]
    }
  }
  */
};

module.exports = {
  exampleExecuteTool,
  exampleRunAgent,
  exampleGetCapabilities
};