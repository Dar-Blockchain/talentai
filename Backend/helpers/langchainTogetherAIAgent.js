const { ChatTogetherAI } = require('@langchain/community/chat_models/togetherai');
const { HumanMessage, SystemMessage, AIMessage } = require('@langchain/core/messages');
const { StringOutputParser } = require('@langchain/core/output_parsers');
require('dotenv').config();

/**
 * LangChain-based Agent using TogetherAI
 * Replaces the ConversationalAgent functionality
 */
class LangChainTogetherAIAgent {
  constructor(config) {
    this.accountId = config.accountId;
    this.privateKey = config.privateKey;
    this.network = config.network || 'testnet';
    this.operationalMode = config.operationalMode || 'standard';
    this.verbose = config.verbose || false;
    this.skipProfileValidation = config.skipProfileValidation || true;
    
    // Initialize TogetherAI with LangChain
    this.llm = new ChatTogetherAI({
      model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", // or any other TogetherAI model
      apiKey: process.env.TOGETHER_API_KEY,
      temperature: 0.7,
      maxTokens: 2000,
    });
    
    this.outputParser = new StringOutputParser();
    this.conversationHistory = [];
    this.initialized = false;
  }

  /**
   * Initialize the agent (replaces ConversationalAgent.initialize())
   */
  async initialize() {
    try {
      if (this.verbose) {
        console.log(`🔧 Initializing LangChain TogetherAI Agent...`);
        console.log(`📱 Account ID: ${this.accountId}`);
        console.log(`🌐 Network: ${this.network}`);
        console.log(`⚙️  Mode: ${this.operationalMode}`);
        console.log(`🚫 Skipping Hedera profile validation (as configured)`);
      }
      
      // Skip any Hedera-related operations since we're using TogetherAI only
      // No need for HCS-11 profile validation or Hedera client setup
      
      // Test connection to TogetherAI only
      try {
        const testMessage = new SystemMessage("Test connection");
        await this.llm.invoke([testMessage]);
        
        if (this.verbose) {
          console.log(`✅ TogetherAI connection test successful`);
        }
      } catch (togetherError) {
        console.warn(`⚠️  TogetherAI connection test failed, but continuing: ${togetherError.message}`);
        // Continue initialization even if test fails - actual usage will handle errors
      }
      
      this.initialized = true;
      
      if (this.verbose) {
        console.log(`✅ LangChain TogetherAI Agent initialized successfully`);
        console.log(`🎯 Ready for AI-powered conversations without Hedera dependencies`);
      }
      
      return { success: true, message: "Agent initialized successfully" };
    } catch (error) {
      console.error(`❌ Failed to initialize LangChain TogetherAI Agent:`, error.message);
      // Don't throw error for initialization issues - let the agent work anyway
      this.initialized = true;
      return { success: false, message: `Partial initialization: ${error.message}` };
    }
  }

  /**
   * Process a message (replaces ConversationalAgent.processMessage())
   */
  async processMessage(prompt, systemPrompt = null) {
    try {
      if (!this.initialized) {
        throw new Error("Agent not initialized. Call initialize() first.");
      }

      const messages = [];
      
      // Add system message if provided
      if (systemPrompt) {
        messages.push(new SystemMessage(systemPrompt));
      }
      
      // Add conversation history
      messages.push(...this.conversationHistory);
      
      // Add current human message
      messages.push(new HumanMessage(prompt));

      if (this.verbose) {
        console.log(`🤖 Processing message with LangChain TogetherAI...`);
        console.log(`📝 Prompt: ${prompt.substring(0, 100)}...`);
      }

      // Get response from TogetherAI via LangChain
      const response = await this.llm.invoke(messages);
      const parsedResponse = await this.outputParser.invoke(response);

      // Add to conversation history
      this.conversationHistory.push(new HumanMessage(prompt));
      this.conversationHistory.push(new AIMessage(parsedResponse));
      
      // Keep conversation history manageable (last 10 messages)
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      if (this.verbose) {
        console.log(`✅ Response generated: ${parsedResponse.substring(0, 100)}...`);
      }

      return {
        response: parsedResponse,
        success: true,
        metadata: {
          model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
          provider: "together-ai",
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error(`❌ Error processing message:`, error.message);
      throw new Error(`Message processing failed: ${error.message}`);
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    if (this.verbose) {
      console.log(`🧹 Conversation history cleared`);
    }
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Set system context for future messages
   */
  setSystemContext(systemPrompt) {
    // Remove any existing system messages and add new one at the beginning
    this.conversationHistory = this.conversationHistory.filter(
      msg => !(msg instanceof SystemMessage)
    );
    this.conversationHistory.unshift(new SystemMessage(systemPrompt));
  }
}

module.exports = { LangChainTogetherAIAgent };