require("dotenv").config();
const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  Hbar,
} = require("@hashgraph/sdk");
const Agent = require("../models/Agent.model");

// Lazy client initialization for AgentService
let agentServiceClient = null;

const getAgentServiceClient = () => {
  if (!agentServiceClient) {
    try {
      if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        console.warn('⚠️  Agent Service: Environment variables not set.');
        return null;
      }

      agentServiceClient = Client.forTestnet();
      agentServiceClient.setOperator(
        process.env.HEDERA_ACCOUNT_ID,
        process.env.HEDERA_PRIVATE_KEY
      );
      agentServiceClient.setNetworkTimeout(10000);

      console.log('✅ Agent Service client initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing Agent Service client:', error.message);
      return null;
    }
  }
  return agentServiceClient;
};

/**
 * createAgent creates a new agent using the Hedera SDK and stores it in the database
 * @param {object} operatorClient - the operator client from Hedera
 * @param {number} initialHbar - initial balance for the agent (default 50 HBAR)
 * @returns {object} The newly created agent object
 */

/**
 * getAgentByName returns the agent with the specified name from the database
 * @param {string} name - the name of the agent
 * @returns {object|null} The agent object if found, otherwise null
 */
async function getAgentByName(name) {
  try {
    // Query the database for agent by name
    const agent = await Agent.findOne({ name });
    if (!agent) {
      console.log(`Agent with name ${name} not found`);
      return null;
    }
    return agent;
  } catch (error) {
    console.error("Error finding agent by name:", error);
    throw error;
  }
}

/**
 * Creates a new Hedera wallet for the agent and saves it to the database.
 * @param {string} name - Name of the agent.
 * @returns {Promise<{agent: object}>}
 */
async function createAgent(name) {
  try {
    // Create Hedera wallet
    const newPrivateKey = PrivateKey.generate();
    const newPublicKey = newPrivateKey.publicKey;

    const transaction = new AccountCreateTransaction()
      .setKey(newPublicKey)
      .setInitialBalance(new Hbar(1));

    const response = await transaction.execute(client);
    const receipt = await response.getReceipt(client);
    const accountId = receipt.accountId.toString();

    // Save agent to database
    const agent = new Agent({
      name,
      accountId,
      privkey: newPrivateKey.toString(),
      pubkey: newPublicKey.toString(),
    });

    await agent.save();

    return {
      name: agent.name,
      accountId: agent.accountId,
      pubkey: agent.pubkey,
      // Note: In production, avoid returning the private key in responses.
      privkey: agent.privkey,
    };
  } catch (error) {
    console.error("Error creating agent:", error);
    throw new Error("Failed to create agent");
  }
}

/**
 * Generate content using AI (simple wrapper for technical test generation)
 * @param {string} prompt - The prompt to send to the AI
 * @returns {Promise<string>} The generated content
 */
async function generateContent(prompt) {
  try {
    // For now, return a mock technical test content
    // In production, this would call an actual AI service
    console.log('🤖 Generating technical test content...');
    console.log('📝 Prompt:', prompt.substring(0, 200) + '...');

    // Mock technical test content based on the prompt
    const mockContent = `
# CODING TECHNICAL ASSESSMENT

## Instructions
- Complete all coding challenges below
- Submit your solutions within 48 hours
- Include working, runnable code
- Provide clear documentation

## Coding Exercises

### Exercise 1: Algorithm Implementation
Write a function that finds the longest common subsequence between two strings.

**Requirements:**
- Function signature: \`function longestCommonSubsequence(str1, str2)\`
- Return the length of the longest common subsequence
- Handle edge cases (empty strings, no common characters)

**Example:**
\`\`\`
Input: str1 = "ABCDGH", str2 = "AEDFHR"
Output: 3 (ADH)
\`\`\`

### Exercise 2: Data Structure Challenge
Implement a stack with O(1) time complexity for push, pop, and getMin operations.

**Requirements:**
- Create a class \`MinStack\`
- Methods: \`push(val)\`, \`pop()\`, \`getMin()\`
- All operations must be O(1) time complexity

### Exercise 3: API Development
Create a REST API endpoint for user authentication.

**Requirements:**
- POST /api/auth/login
- Accept email and password
- Return JWT token on success
- Handle validation errors
- Include proper error responses

### Exercise 4: Database Query
Write SQL queries for the following scenarios:

1. Find all users who registered in the last 30 days
2. Get the top 5 most active users by post count
3. Calculate average salary by department

**Table Structure:**
\`\`\`sql
Users: id, email, created_at, last_login
Posts: id, user_id, title, content, created_at
Employees: id, name, department, salary
\`\`\`

## Practical Project

### Mini Project: Todo Application
Build a simple todo application with the following features:

**Frontend Requirements:**
- Add new todos
- Mark todos as complete
- Delete todos
- Filter by status (all, active, completed)
- Local storage persistence

**Backend Requirements:**
- REST API for CRUD operations
- Data validation
- Error handling
- Simple in-memory storage (no database required)

**Deliverables:**
- Working frontend (HTML/CSS/JavaScript or React)
- Backend API (Node.js/Express or Python/Flask)
- README with setup instructions
- Code should be clean and well-documented

## Code Review Task

Review the following JavaScript code and identify issues:

\`\`\`javascript
function processUsers(users) {
  var result = [];
  for (var i = 0; i < users.length; i++) {
    if (users[i].age > 18) {
      result.push({
        name: users[i].name,
        email: users[i].email,
        isAdult: true
      });
    }
  }
  return result;
}
\`\`\`

**Tasks:**
1. Identify at least 3 issues with this code
2. Provide an improved version
3. Explain your improvements

## Submission Guidelines

1. Create a folder with your name
2. Organize code by exercise number
3. Include a README.md explaining your approach
4. Ensure all code is runnable
5. Submit via email reply

**Time Limit:** 2-3 hours
**Good luck!**
`;

    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Technical test content generated successfully');
    return mockContent;

  } catch (error) {
    console.error('❌ Error generating content:', error);
    throw new Error(`Content generation failed: ${error.message}`);
  }
}

module.exports = { createAgent, getAgentByName, generateContent };
