/**
 * HCS-11 Company Agent Creation Test Examples
 *
 * This file demonstrates how to create company agents with Hedera accounts
 * and HCS-11 profiles using the new /api/hcs11/create-company-agent endpoint.
 */

// Example 1: Basic company agent creation
const basicCompanyAgent = {
  companyName: "TechCorp AI",
  postId: "POST-2024-001",
  agentPosition: "Senior Full Stack Developer",
  companyDescription: "Leading AI solutions provider specializing in enterprise automation and machine learning applications"
};

// Example 2: Complete company agent with custom configuration
const completeCompanyAgent = {
  companyName: "InnovateTech Solutions",
  postId: "DEV-2024-15",
  agentPosition: "DevOps Engineer",
  companyDescription: "Cutting-edge technology solutions for modern businesses with focus on cloud infrastructure and automation",
  agentConfig: {
    capabilities: ["RECRUITING", "TECHNICAL_EVALUATION", "COMPANY_REPRESENTATION", "CANDIDATE_SCREENING"],
    model: "GPT-4",
    industry: "Technology",
    department: "Engineering",
    properties: {
      experienceLevel: "Senior",
      teamSize: "10-50",
      workEnvironment: "Remote/Hybrid",
      techStack: ["AWS", "Docker", "Kubernetes", "Terraform", "Python", "Node.js"]
    }
  }
};

// Example 3: Healthcare company agent
const healthcareCompanyAgent = {
  companyName: "MedTech Innovations",
  postId: "MED-2024-07",
  agentPosition: "Healthcare Software Developer",
  companyDescription: "Revolutionary healthcare technology solutions improving patient outcomes and medical efficiency",
  agentConfig: {
    capabilities: ["RECRUITING", "HEALTHCARE_COMPLIANCE_CHECK", "TECHNICAL_EVALUATION"],
    model: "GPT-4",
    industry: "Healthcare",
    department: "Software Development",
    properties: {
      complianceRequirements: ["HIPAA", "FDA"],
      specialization: "Medical Software",
      certifications: ["HL7", "FHIR"]
    }
  }
};

/**
 * curl Examples for Testing
 */
const curlExamples = {
  // Basic company agent creation
  basicAgent: `curl -X POST http://localhost:5000/api/hcs11/create-company-agent \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(basicCompanyAgent)}'`,

  // Complete company agent creation
  completeAgent: `curl -X POST http://localhost:5000/api/hcs11/create-company-agent \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(completeCompanyAgent)}'`,

  // Healthcare company agent
  healthcareAgent: `curl -X POST http://localhost:5000/api/hcs11/create-company-agent \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(healthcareCompanyAgent)}'`
};

/**
 * Expected Response Structure
 */
const expectedResponse = {
  success: true,
  agentId: "company_agent_1234567890",
  agentName: "TechCorp AI:POST-2024-001",
  hederaAccountId: "0.0.123456",
  hederaPublicKey: "302a300506032b6570032100...",
  companyInfo: {
    companyName: "TechCorp AI",
    postId: "POST-2024-001",
    agentPosition: "Senior Full Stack Developer",
    companyDescription: "Leading AI solutions provider..."
  },
  onChainDetails: {
    responsibleAccountId: "0.0.1378",
    network: "testnet",
    deploymentTransactionId: "0.0.123456@1635724800.123456789",
    registrationTransactionId: "0.0.123456@1635724801.123456789",
    agentAccountId: "0.0.123456",
    agentPublicKey: "302a300506032b6570032100...",
    inboundTopicId: "0.0.789012",
    outboundTopicId: "0.0.789013",
    deploymentHashScan: "https://hashscan.io/testnet/transaction/...",
    registrationHashScan: "https://hashscan.io/testnet/transaction/...",
    profileHashScan: "https://hashscan.io/testnet/topic/0.0.789012"
  },
  communication: {
    inboundTopicId: "0.0.789012",
    outboundTopicId: "0.0.789013"
  },
  verificationUrls: {
    profile: "https://hashscan.io/testnet/topic/0.0.789012",
    account: "https://hashscan.io/testnet/account/0.0.123456",
    inboundTopic: "https://hashscan.io/testnet/topic/0.0.789012",
    outboundTopic: "https://hashscan.io/testnet/topic/0.0.789013"
  },
  message: "Company agent TechCorp AI:POST-2024-001 created successfully with Hedera account and HCS-11 profile"
};

/**
 * Key Features of the Company Agent Creation:
 */
const keyFeatures = [
  "✅ Creates new Hedera account for the company agent",
  "✅ Generates agent name in format: 'CompanyName:PostID'",
  "✅ Creates HCS-11 compliant profile with company and position info",
  "✅ Creates inbound and outbound Hedera topics for communication",
  "✅ Deploys profile to Hedera network with consensus messages",
  "✅ Registers agent for network discovery",
  "✅ Returns all HashScan verification URLs",
  "✅ Provides detailed logging for on-chain creation tracking",
  "✅ Includes agent account ID and public key in response",
  "✅ Structured for recruiting and candidate evaluation use cases"
];

/**
 * What happens when you call the endpoint:
 */
const processFlow = [
  "1. 🔍 Validates input (companyName, postId, agentPosition, companyDescription required)",
  "2. 🏦 Creates new Hedera account with private/public key pair",
  "3. 🤖 Generates agent name: 'CompanyName:PostID'",
  "4. 📋 Builds HCS-11 compliant profile with company/position details",
  "5. 📩 Creates inbound topic: 'hcs-11:hcs://11/in-company-slug'",
  "6. 📤 Creates outbound topic: 'hcs-11:hcs://11/out-company-slug'",
  "7. 🚀 Deploys profile to inbound topic with consensus message",
  "8. 📡 Registers agent on outbound topic for network discovery",
  "9. ✅ Returns complete response with all IDs, URLs, and verification links"
];

// Export for use in testing
module.exports = {
  basicCompanyAgent,
  completeCompanyAgent,
  healthcareCompanyAgent,
  curlExamples,
  expectedResponse,
  keyFeatures,
  processFlow
};

// Console output for easy reference
if (require.main === module) {
  console.log('🚀 HCS-11 Company Agent Creation Test Guide');
  console.log('===========================================\n');

  console.log('📝 Basic Company Agent Example:');
  console.log(JSON.stringify(basicCompanyAgent, null, 2));
  console.log('\n');

  console.log('🔧 Complete Company Agent Example:');
  console.log(JSON.stringify(completeCompanyAgent, null, 2));
  console.log('\n');

  console.log('🏥 Healthcare Company Agent Example:');
  console.log(JSON.stringify(healthcareCompanyAgent, null, 2));
  console.log('\n');

  console.log('🎯 Key Features:');
  keyFeatures.forEach(feature => console.log(feature));
  console.log('\n');

  console.log('🔄 Process Flow:');
  processFlow.forEach(step => console.log(step));
  console.log('\n');

  console.log('🌐 API Endpoint:');
  console.log('POST /api/hcs11/create-company-agent');
  console.log('🔑 Authentication: Bearer JWT Token Required');
}