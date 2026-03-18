/**
 * Test script for AI Agent system
 * Run with: node test-ai-agent.js
 */

const { getAvailableTools } = require('./tools/ai-tools');

async function testAgentSystem() {
  console.log('🧪 Testing AI Agent System...\n');

  // Test 1: Check available tools
  console.log('1️⃣ Testing tool discovery...');
  try {
    const tools = getAvailableTools();
    console.log(`✅ Found ${tools.length} available tools:`);
    tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });
    console.log('');
  } catch (error) {
    console.error('❌ Tool discovery failed:', error.message);
    return;
  }

  // Test 2: Validate tool schemas
  console.log('2️⃣ Validating tool schemas...');
  try {
    const tools = getAvailableTools();
    let validTools = 0;

    tools.forEach(tool => {
      if (tool.name && tool.description && tool.parameters) {
        validTools++;
      } else {
        console.log(`⚠️  Invalid tool schema: ${tool.name || 'unnamed'}`);
      }
    });

    console.log(`✅ ${validTools}/${tools.length} tools have valid schemas\n`);
  } catch (error) {
    console.error('❌ Schema validation failed:', error.message);
    return;
  }

  // Test 3: Check controller imports
  console.log('3️⃣ Testing controller imports...');
  try {
    const aiController = require('./controllers/ai.controller');
    const aiAgentController = require('./controllers/ai.agent.controller');

    if (aiController.executeTool && aiController.getAvailableTools) {
      console.log('✅ AI Controller loaded successfully');
    } else {
      console.log('⚠️  AI Controller missing expected methods');
    }

    if (aiAgentController.runAgent && aiAgentController.getCapabilities) {
      console.log('✅ AI Agent Controller loaded successfully');
    } else {
      console.log('⚠️  AI Agent Controller missing expected methods');
    }

    console.log('');
  } catch (error) {
    console.error('❌ Controller import failed:', error.message);
    return;
  }

  // Test 4: Check route configuration
  console.log('4️⃣ Testing route configuration...');
  try {
    const aiRoutes = require('./routes/ai.routes');

    // Routes should be an Express router
    if (aiRoutes && typeof aiRoutes.use === 'function') {
      console.log('✅ AI Routes configured successfully');
    } else {
      console.log('⚠️  AI Routes not properly configured');
    }

    console.log('');
  } catch (error) {
    console.error('❌ Route configuration failed:', error.message);
    return;
  }

  console.log('🎉 AI Agent System test completed successfully!');
  console.log('\n📚 Next steps:');
  console.log('   1. Start the server: npm start');
  console.log('   2. Test endpoints:');
  console.log('      GET /ai/tools');
  console.log('      GET /ai/agent/capabilities');
  console.log('      POST /ai/agent (with Authorization header)');
}

// Run the test
if (require.main === module) {
  testAgentSystem().catch(console.error);
}

module.exports = { testAgentSystem };