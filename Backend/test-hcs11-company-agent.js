/**
 * Temporary test script for HCS-11 Company Agent Creation
 * This bypasses authentication for testing purposes
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const hcs11Controller = require('./controllers/hcs11Controller');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock user middleware (bypasses auth for testing)
app.use((req, res, next) => {
  req.user = {
    _id: 'test_user_id',
    email: 'test@hcs11test.com',
    username: 'test',
    profile: null
  };
  next();
});

// Test route without auth requirement
app.post('/test-company-agent', hcs11Controller.createCompanyAgent);

// Start test server
const startTestServer = async () => {
  try {
    console.log('🔄 Connecting to database for testing...');
    await connectDB();

    const port = 5002;
    app.listen(port, () => {
      console.log(`🧪 Test server running on port ${port}`);
      console.log(`📋 Test endpoint: POST http://localhost:${port}/test-company-agent`);
      console.log('');

      // Run the test
      runTest();
    });
  } catch (error) {
    console.error('❌ Failed to start test server:', error);
  }
};

const runTest = async () => {
  const { default: fetch } = await import('node-fetch');

  console.log('🚀 Running HCS-11 Company Agent Creation Test...');
  console.log('='.repeat(60));

  const testData = {
    companyName: "TechCorp AI",
    postId: "POST-2024-001",
    agentPosition: "Senior Full Stack Developer",
    companyDescription: "Leading AI solutions provider specializing in enterprise automation and machine learning applications"
  };

  console.log('📝 Test Data:');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');

  try {
    console.log('📡 Sending request...');
    const response = await fetch('http://localhost:5002/test-company-agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();

    console.log('📋 Response Status:', response.status);
    console.log('📋 Response:');
    console.log(JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('');
      console.log('✅ TEST PASSED - Company agent created successfully!');
      console.log('🔗 Verification URLs:');
      if (result.verificationUrls) {
        Object.entries(result.verificationUrls).forEach(([key, url]) => {
          console.log(`   ${key}: ${url}`);
        });
      }
    } else {
      console.log('');
      console.log('❌ TEST FAILED - Error in company agent creation');
    }

  } catch (error) {
    console.log('');
    console.log('❌ TEST ERROR:', error.message);
  }

  console.log('');
  console.log('🏁 Test completed. Press Ctrl+C to exit.');
};

// Start the test server
startTestServer();