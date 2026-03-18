# AI Agent System Documentation

## Overview

The TalentAI platform includes a complete AI Agent system that allows users to interact with the platform using natural language. The system uses OpenAI's GPT-4 with function calling (tools) to autonomously execute tasks.

## Architecture

### Components

1. **AI Tools** (`tools/ai-tools.js`)
   - Collection of executable tools
   - Each tool has: name, description, parameters schema, execute function

2. **AI Controller** (`controllers/ai.controller.js`)
   - Handles individual tool execution
   - Endpoint: `POST /ai/execute-tool`

3. **AI Agent Controller** (`controllers/ai.agent.controller.js`)
   - Autonomous agent using OpenAI GPT-4
   - Endpoint: `POST /ai/agent`

4. **AI Routes** (`routes/ai.routes.js`)
   - Route definitions and middleware

## Available Tools

The system currently supports 17 tools covering all post-related operations:

### Post Management
- `createPost` - Create new job posting
- `getAllPosts` - Get all posts (admin)
- `getMyPosts` - Get user's posts
- `getPostById` - Get specific post by ID
- `getPostDetails` - Get public post details
- `updatePost` - Update existing post
- `updatePostStatus` - Change post status
- `deletePost` - Delete post

### Search & Discovery
- `searchPosts` - Search posts with filters
- `getPostsByUserTopSkills` - Get recommended posts based on user skills

### Payment & Pricing
- `calculatePostPrice` - Calculate publication price
- `processPostPayment` - Process payment (beta: free)
- `getPostPaymentHistory` - Get payment history
- `getPostPaymentDetails` - Get payment details

### Assessment & Testing
- `sendTechnicalTest` - Send technical test via email
- `getInterviewConfig` - Get interview configuration

### Analytics
- `getPostMetrics` - Get post metrics
- `getPublicStats` - Get public platform statistics

## API Endpoints

### Tool Execution
```http
POST /ai/execute-tool
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "toolName": "createPost",
  "parameters": {
    "title": "Senior Developer",
    "description": "Job description...",
    "skills": ["React", "Node.js"]
  }
}
```

### Autonomous Agent
```http
POST /ai/agent
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "message": "Create a job for a React developer and calculate the price",
  "conversationId": "optional-conversation-id"
}
```

### Agent Capabilities
```http
GET /ai/agent/capabilities
Authorization: Bearer <jwt>
```

### Available Tools
```http
GET /ai/tools
```

## Agent Behavior

### Decision Making
The agent uses GPT-4 to:
1. Understand user intent from natural language
2. Select appropriate tools
3. Determine parameter values
4. Chain multiple tools when needed
5. Provide human-readable responses

### Execution Flow
1. **Plan**: Agent analyzes request and plans tool calls
2. **Act**: Executes tools in sequence
3. **Observe**: Processes results and decides next steps
4. **Repeat**: Continues until task is complete (max 3 iterations)

### Safety Features
- Parameter validation before execution
- Error handling for failed tool calls
- Maximum iteration limit (3) to prevent infinite loops
- Authentication required for all operations

## Example Usage

### Simple Tool Call
```javascript
// Create a job posting
const result = await agent.executeTool('createPost', {
  title: 'Senior Node.js Developer',
  description: 'We need an experienced developer...',
  skills: ['Node.js', 'Express', 'MongoDB'],
  location: 'Paris'
});
```

### Natural Language Agent
```javascript
// Agent handles the workflow automatically
const result = await agent.runAgent({
  message: 'Create a React developer job in Paris and calculate publishing cost',
  conversationId: 'job-creation-123'
});

// Result includes:
// - steps: detailed execution log
// - finalResult: human-readable summary
// - metadata: execution statistics
```

## Response Format

### Agent Response
```json
{
  "success": true,
  "steps": [
    {
      "iteration": 1,
      "tool": "createPost",
      "parameters": { "title": "...", "description": "..." },
      "result": { "success": true, "data": { "id": "..." } },
      "timestamp": "2024-01-01T10:00:00.000Z"
    }
  ],
  "finalResult": "Job posting created successfully! The publication price is 150 TAI tokens.",
  "metadata": {
    "iterations": 1,
    "toolsUsed": ["createPost", "calculatePostPrice"],
    "conversationId": "conv-123",
    "timestamp": "2024-01-01T10:00:02.000Z"
  }
}
```

## Adding New Tools

To add a new tool:

1. Define the tool in `tools/ai-tools.js`:
```javascript
const newTool = {
  name: 'newToolName',
  description: 'Tool description',
  parameters: {
    type: 'object',
    properties: { /* JSON schema */ },
    required: ['param1']
  },
  execute: async (params, user) => {
    // Tool implementation
    return result;
  }
};
```

2. Add to `availableTools` array
3. Export the tool if needed

The agent will automatically discover and use the new tool.

## Security

- All endpoints require authentication (`requireAuthUser` middleware)
- Tool execution includes user context
- Authorization headers are passed to underlying controllers
- Request logging via `authLogMiddleware`

## Monitoring

- Console logging for each agent step
- Execution metrics in response metadata
- Error tracking and graceful failure handling

## Future Enhancements

- Conversation memory/persistence
- Multi-turn conversations
- Custom tool chains
- Performance optimization
- Advanced error recovery