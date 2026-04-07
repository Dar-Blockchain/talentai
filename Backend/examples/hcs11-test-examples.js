/**
 * HCS-11 Service Test Examples
 *
 * This file contains example usage and test scenarios for the HCS-11 service.
 * You can use these examples to test the API endpoints with tools like Postman or curl.
 */

// Example 1: Basic company profile creation
const basicProfileExample = {
  companyName: "TechCorp AI",
  companyDescription: "Leading AI solutions for enterprise automation and customer support"
};

// Example 2: Complete profile with agent configuration
const completeProfileExample = {
  companyName: "InnovateTech Solutions",
  companyDescription: "Cutting-edge technology solutions for modern businesses with focus on AI and automation",
  agentConfig: {
    displayName: "InnovateTech Assistant",
    agentType: "AUTONOMOUS",
    capabilities: ["CUSTOMER_SUPPORT", "DATA_ANALYSIS", "AUTOMATION", "CONSULTATION"],
    model: "GPT-4",
    bio: "Advanced AI assistant specialized in technology consulting and enterprise solutions",
    socialLinks: {
      website: "https://innovatetech.com",
      linkedin: "https://linkedin.com/company/innovatetech",
      twitter: "https://twitter.com/innovatetech"
    },
    properties: {
      industry: "Technology",
      supportedLanguages: ["English", "Spanish", "French"],
      operatingHours: "24/7",
      specializations: ["Cloud Computing", "AI/ML", "Cybersecurity"]
    }
  }
};

// Example 3: Minimal startup profile
const startupProfileExample = {
  companyName: "StartupCorp",
  companyDescription: "Innovative startup focused on AI-driven solutions for small businesses"
};

/**
 * Test API Endpoints using curl commands
 */

const curlExamples = {
  // 1. Check service status
  checkStatus: `curl -X GET http://localhost:5000/api/hcs11/status \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json"`,

  // 2. Validate profile data
  validateProfile: `curl -X POST http://localhost:5000/api/hcs11/validate \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(basicProfileExample)}'`,

  // 3. Create profile (without inscribing to Hedera)
  createProfile: `curl -X POST http://localhost:5000/api/hcs11/create-profile \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(completeProfileExample)}'`,

  // 4. Create and inscribe profile to Hedera
  createAndInscribe: `curl -X POST http://localhost:5000/api/hcs11/create-and-inscribe \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(completeProfileExample)}'`
};

/**
 * Postman Collection Examples
 */
const postmanCollection = {
  info: {
    name: "HCS-11 AI Agent Profile API",
    description: "Collection for testing HCS-11 AI Agent Profile creation endpoints"
  },
  endpoints: [
    {
      name: "Check HCS-11 Service Status",
      method: "GET",
      url: "{{base_url}}/api/hcs11/status",
      headers: [
        { key: "Authorization", value: "Bearer {{jwt_token}}" }
      ]
    },
    {
      name: "Validate Profile Data",
      method: "POST",
      url: "{{base_url}}/api/hcs11/validate",
      headers: [
        { key: "Authorization", value: "Bearer {{jwt_token}}" },
        { key: "Content-Type", value: "application/json" }
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(basicProfileExample, null, 2)
      }
    },
    {
      name: "Create AI Agent Profile",
      method: "POST",
      url: "{{base_url}}/api/hcs11/create-profile",
      headers: [
        { key: "Authorization", value: "Bearer {{jwt_token}}" },
        { key: "Content-Type", value: "application/json" }
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(completeProfileExample, null, 2)
      }
    },
    {
      name: "Create and Inscribe Profile to Hedera",
      method: "POST",
      url: "{{base_url}}/api/hcs11/create-and-inscribe",
      headers: [
        { key: "Authorization", value: "Bearer {{jwt_token}}" },
        { key: "Content-Type", value: "application/json" }
      ],
      body: {
        mode: "raw",
        raw: JSON.stringify(completeProfileExample, null, 2)
      }
    }
  ],
  variables: [
    { key: "base_url", value: "http://localhost:5000" },
    { key: "jwt_token", value: "your_jwt_token_here" }
  ]
};

/**
 * Expected Response Examples
 */
const responseExamples = {
  serviceStatus: {
    available: true,
    message: "HCS-11 service is properly configured and available"
  },

  validationSuccess: {
    isValid: true,
    errors: []
  },

  validationFailure: {
    isValid: false,
    errors: [
      "Company name is required",
      "Company description is required"
    ]
  },

  profileCreationSuccess: {
    success: true,
    message: "AI Agent profile created successfully for TechCorp AI",
    profile: { /* profile object */ },
    agentProfile: { /* formatted agent profile */ }
  },

  inscriptionSuccess: {
    success: true,
    profileId: "0.0.123456",
    topicId: "0.0.789012",
    verificationUrl: "https://hashscan.io/testnet/topic/0.0.789012",
    message: "AI Agent profile created and inscribed successfully for TechCorp AI",
    agentProfile: { /* formatted agent profile */ }
  }
};

/**
 * Environment Setup Instructions
 */
const environmentSetup = {
  requiredEnvVars: [
    "HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID",
    "HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE"
  ],

  dependencies: [
    "@hashgraphonline/standards-sdk: Already installed in package.json",
    "@hashgraph/sdk: Already installed in package.json"
  ],

  setup: [
    "1. Add Hedera environment variables to Backend/.env",
    "2. Ensure you have a valid Hedera testnet account",
    "3. Make sure the backend server is running (npm run dev)",
    "4. Use a valid JWT token for authentication"
  ]
};

// Export for use in testing
module.exports = {
  basicProfileExample,
  completeProfileExample,
  startupProfileExample,
  curlExamples,
  postmanCollection,
  responseExamples,
  environmentSetup
};

// Console output for easy copying
if (require.main === module) {
  console.log('🧪 HCS-11 Service Test Examples');
  console.log('================================\n');

  console.log('📝 Basic Profile Example:');
  console.log(JSON.stringify(basicProfileExample, null, 2));
  console.log('\n');

  console.log('📝 Complete Profile Example:');
  console.log(JSON.stringify(completeProfileExample, null, 2));
  console.log('\n');

  console.log('🔧 Environment Setup:');
  environmentSetup.setup.forEach(step => console.log(step));
  console.log('\n');

  console.log('🌐 API Endpoints:');
  console.log('GET  /api/hcs11/status');
  console.log('POST /api/hcs11/validate');
  console.log('POST /api/hcs11/create-profile');
  console.log('POST /api/hcs11/create-and-inscribe');
}