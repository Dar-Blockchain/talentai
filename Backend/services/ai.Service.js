const bedrock = require('../helpers/bedrock.helpers');
require('dotenv').config();

/**
 * AI Service for generating technical test content
 */
class AIService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the AI service
   */
  async initialize() {
    try {
      if (this.initialized) {
        return { success: true, message: 'AI Service already initialized' };
      }

      this.initialized = true;
      console.log('✅ AI Service initialized successfully (Bedrock)');
      return { success: true, message: 'AI Service initialized successfully' };
    } catch (error) {
      console.error('❌ Error initializing AI Service:', error);
      this.initialized = true;
      return { success: false, message: `AI Service initialized with mock mode: ${error.message}` };
    }
  }

  /**
   * Generate technical test content using AI
   * @param {string} prompt - The prompt for generating the test
   * @returns {Promise<string>} Generated technical test content
   */
  async generateContent(prompt) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const systemPrompt = `You are an expert technical interviewer and coding assessment creator.
      Generate comprehensive, practical coding tests that evaluate real-world programming skills.
      Focus on practical coding challenges, algorithms, data structures, and system design.
      Make the tests challenging but fair, with clear instructions and examples.`;

      const result = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        maxTokens: 2000,
        timeout: 20000
      });

      console.log('✅ AI-generated technical test content created (Bedrock)');
      return result.content;
    } catch (error) {
      console.error('❌ Error generating AI content:', error);
      console.log('🔄 Falling back to mock content generation');
      return this.generateMockContent(prompt);
    }
  }

  /**
   * Generate mock technical test content (fallback)
   * @param {string} prompt - The original prompt (for context)
   * @returns {string} Mock technical test content
   */
  generateMockContent(prompt) {
    console.log('🤖 Generating mock technical test content...');
    console.log('📝 Prompt context:', prompt.substring(0, 200) + '...');

    // Extract technologies from prompt if possible
    const technologies = this.extractTechnologiesFromPrompt(prompt);
    const jobTitle = this.extractJobTitleFromPrompt(prompt);
    const experienceLevel = this.extractExperienceLevelFromPrompt(prompt);

    return this.createMockTechnicalTest(technologies, jobTitle, experienceLevel);
  }

  /**
   * Extract technologies from the prompt
   */
  extractTechnologiesFromPrompt(prompt) {
    const commonTechs = ['React', 'Node.js', 'JavaScript', 'Python', 'Java', 'C++', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Git'];
    const foundTechs = commonTechs.filter(tech =>
      prompt.toLowerCase().includes(tech.toLowerCase())
    );
    return foundTechs.length > 0 ? foundTechs : ['JavaScript', 'Node.js', 'React'];
  }

  /**
   * Extract job title from the prompt
   */
  extractJobTitleFromPrompt(prompt) {
    const jobTitleMatch = prompt.match(/position for a (.+?) at/i);
    return jobTitleMatch ? jobTitleMatch[1] : 'Software Developer';
  }

  /**
   * Extract experience level from the prompt
   */
  extractExperienceLevelFromPrompt(prompt) {
    if (prompt.toLowerCase().includes('senior')) return 'Senior';
    if (prompt.toLowerCase().includes('junior')) return 'Junior';
    if (prompt.toLowerCase().includes('entry')) return 'Entry';
    return 'Intermediate';
  }

  /**
   * Create mock technical test content
   */
  createMockTechnicalTest(technologies, jobTitle, experienceLevel) {
    const techList = technologies.join(', ');

    return `# CODING TECHNICAL ASSESSMENT
## ${jobTitle} Position - ${experienceLevel} Level

**Technologies:** ${techList}
**Time Limit:** 2-3 hours
**Instructions:** Complete all challenges and submit working, runnable code.

---

## Coding Exercises

### Exercise 1: Algorithm Challenge
Implement a function to find the two numbers in an array that add up to a target sum.

**Requirements:**
- Function: \`twoSum(nums, target)\`
- Return indices of the two numbers
- Assume exactly one solution exists
- Cannot use the same element twice

**Example:**
\`\`\`
Input: nums = [2, 7, 11, 15], target = 9
Output: [0, 1] (because nums[0] + nums[1] = 2 + 7 = 9)
\`\`\`

### Exercise 2: Data Structure Implementation
Create a class that implements a queue using two stacks.

**Requirements:**
- Class: \`QueueWithStacks\`
- Methods: \`enqueue(val)\`, \`dequeue()\`, \`peek()\`, \`isEmpty()\`
- All operations should be efficient

### Exercise 3: API Development
Build a REST API endpoint for managing a simple blog.

**Requirements:**
- GET /api/posts - List all posts
- POST /api/posts - Create new post
- PUT /api/posts/:id - Update post
- DELETE /api/posts/:id - Delete post
- Include proper error handling and validation

**Post Schema:**
\`\`\`json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "author": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
\`\`\`

### Exercise 4: Database Design
Design a database schema for an e-commerce system.

**Requirements:**
- Users table (customers and admins)
- Products table
- Orders table
- Order items table
- Categories table
- Include proper relationships and constraints

**Write SQL queries for:**
1. Find top 10 best-selling products
2. Get user order history
3. Calculate monthly revenue

## Practical Project

### Mini Application: Task Manager
Build a full-stack task management application.

**Frontend Requirements:**
- Task list with add/edit/delete functionality
- Task status (pending, in-progress, completed)
- Due date management
- Search and filter capabilities
- Responsive design

**Backend Requirements:**
- REST API for task CRUD operations
- Data validation
- Error handling
- Simple authentication (optional)

**Technologies to use:** ${techList}

## Code Review Task

Review this code and provide improvements:

\`\`\`javascript
function getUserData(userId) {
  fetch('/api/users/' + userId)
    .then(response => response.json())
    .then(data => {
      document.getElementById('username').innerHTML = data.name;
      document.getElementById('email').innerHTML = data.email;
    })
    .catch(error => {
      console.log('Error: ' + error);
    });
}
\`\`\`

**Tasks:**
1. Identify issues and potential problems
2. Provide an improved version
3. Explain your improvements

## Submission Guidelines

1. Organize code in separate files/folders
2. Include a README with setup instructions
3. Ensure all code is runnable and tested
4. Provide clear documentation
5. Submit via email reply

**Good luck with your assessment!**`;
  }
}

// Create singleton instance
const aiService = new AIService();

module.exports = {
  generateContent: (prompt) => aiService.generateContent(prompt),
  initialize: () => aiService.initialize()
};
