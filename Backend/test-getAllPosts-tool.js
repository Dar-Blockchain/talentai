/**
 * Test script for getAllPosts tool
 */

const { findTool } = require('./tools/ai-tools');

async function testGetAllPostsTool() {
  console.log('🧪 Testing getAllPosts tool...\n');

  try {
    const tool = findTool('getAllPosts');
    if (!tool) {
      console.error('❌ Tool getAllPosts not found');
      return;
    }

    console.log('✅ Tool found:', tool.name);

    // Test execution with empty params
    const mockUser = { _id: 'test-user-id' };
    const result = await tool.execute({}, mockUser);

    console.log('✅ Tool executed successfully');
    console.log('Result:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ Tool execution failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

if (require.main === module) {
  testGetAllPostsTool().catch(console.error);
}

module.exports = { testGetAllPostsTool };