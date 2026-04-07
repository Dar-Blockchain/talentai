require("dotenv").config();
const { HCS10Client } = require('@hashgraphonline/standards-sdk');

// Lazy client initialization for HCS-11 Service
let hcs10Client = null;

const getHCS10Client = () => {
  if (!hcs10Client) {
    try {
      if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
        console.warn('⚠️  HCS-11 Service: Hedera environment variables not set.');
        return null;
      }

      console.log('🔧 HCS-11 Service Configuration:');
      console.log('   - Network:', process.env.HEDERA_NETWORK || 'testnet');
      console.log('   - Operator Account ID:', process.env.HEDERA_ACCOUNT_ID);
      console.log('   - Registry URL:', process.env.REGISTRY_URL || 'https://moonscape.tech');

      hcs10Client = new HCS10Client({
        network: process.env.HEDERA_NETWORK || 'testnet',
        operatorId: process.env.HEDERA_ACCOUNT_ID,
        operatorPrivateKey: process.env.HEDERA_PRIVATE_KEY,
        guardedRegistryBaseUrl: process.env.REGISTRY_URL || 'https://moonscape.tech',
        prettyPrint: false,
        logLevel: 'info'
      });

      console.log('✅ HCS-11 Service HCS10Client initialized successfully');
      console.log('   - Responsible Account ID:', process.env.HEDERA_ACCOUNT_ID);
    } catch (error) {
      console.error('❌ Error initializing HCS-11 Service client:', error.message);
      return null;
    }
  }
  return hcs10Client;
};

/**
 * Validates HCS-11 profile data
 * @param {Object} profileData - The profile data to validate
 * @returns {Object} - Validation result with isValid boolean and errors array
 */
const validateProfileData = (profileData) => {
  const errors = [];

  if (!profileData.companyName || profileData.companyName.trim().length === 0) {
    errors.push('Company name is required');
  }

  if (!profileData.companyDescription || profileData.companyDescription.trim().length === 0) {
    errors.push('Company description is required');
  }

  if (profileData.companyName && profileData.companyName.length > 100) {
    errors.push('Company name must be less than 100 characters');
  }

  if (profileData.companyDescription && profileData.companyDescription.length > 500) {
    errors.push('Company description must be less than 500 characters');
  }

  if (profileData.agentConfig?.displayName && profileData.agentConfig.displayName.length > 100) {
    errors.push('Agent display name must be less than 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Builds HCS-11 compliant agent profile from company data
 * @param {Object} profileData - The input profile data
 * @returns {Object} - HCS-11 formatted agent profile
 */
const buildHCS11Profile = (profileData) => {
  const agentConfig = profileData.agentConfig || {};
  const timestamp = new Date().toISOString();
  const profileId = `company_agent_${Date.now()}`;

  return {
    // Core HCS-11 standard fields
    p: "hcs-11",
    standard: "HCS-11",
    version: "1.0.0",
    type: "agent_profile",
    op: "deploy",
    timestamp: timestamp,

    // Agent Identity Section
    identity: {
      agentId: profileId,
      name: agentConfig.displayName || `${profileData.companyName} AI Agent`,
      displayName: agentConfig.displayName || `${profileData.companyName} AI Agent`,
      avatar: agentConfig.avatar || 'default',
      role: agentConfig.agentType || 'AUTONOMOUS',
      description: agentConfig.bio || profileData.companyDescription,
      organizationalUnit: profileData.companyName
    },

    // Company Information
    company: {
      name: profileData.companyName,
      description: profileData.companyDescription,
      industry: agentConfig.properties?.industry || 'Technology',
      website: agentConfig.socialLinks?.website || '',
      socialLinks: agentConfig.socialLinks || {}
    },

    // Agent Capabilities and Specialization
    capabilities: {
      core: agentConfig.capabilities || ['CUSTOMER_SUPPORT', 'GENERAL_PURPOSE'],
      specialization: agentConfig.properties?.specializations || [],
      aiModel: {
        provider: "openai",
        version: agentConfig.model || "gpt-4",
        specialTraining: "company_support_protocols",
        customizedFor: profileData.companyName
      },
      languages: agentConfig.properties?.supportedLanguages || ["en"],
      operatingHours: agentConfig.properties?.operatingHours || "24/7"
    },

    // Governance and Compliance
    governance: {
      permissions: {
        communicate: true,
        collaborate: true,
        dataAccess: "company_only",
        networkParticipation: "messaging_only"
      },
      restrictions: {
        personalDataStorage: false,
        crossNetworkCommunication: true,
        unauthorizedAccess: false,
        scopeLimitation: "company_operations_only"
      },
      compliance: {
        standards: ["HCS-11", "GDPR"],
        dataRetention: "as_per_company_policy",
        auditLog: true,
        privacy: "by_design"
      }
    },

    // Metadata and Versioning
    metadata: {
      creator: "TalentAI_HCS11_Service",
      purpose: `AI agent for ${profileData.companyName}`,
      category: "company_ai_agent",
      tags: ["ai_agent", "company_support", profileData.companyName.toLowerCase().replace(/\s+/g, '_')],
      version: "1.0.0",
      schemaVersion: "hcs-11-v1.0",
      lastUpdated: timestamp,
      profileImage: agentConfig.profileImage || ''
    },

    // Profile Hash and Integrity (to be calculated)
    integrity: {
      profileHash: null,
      signatureChain: [],
      verificationStatus: "pending"
    }
  };
};

/**
 * Creates an HCS-11 AI Agent Profile
 * @param {Object} profileData - The profile data containing companyName and companyDescription
 * @returns {Promise<Object>} - Result object with success status and profile details
 */
module.exports.createAIAgentProfile = async (profileData) => {
  try {
    console.log('🚀 Creating HCS-11 AI Agent Profile for:', profileData.companyName);
    console.log('📋 Profile Creation Details:');
    console.log('   - Company Name:', profileData.companyName);
    console.log('   - Company Description:', profileData.companyDescription);
    console.log('   - Responsible Account:', process.env.HEDERA_ACCOUNT_ID);

    // Validate input data
    const validation = validateProfileData(profileData);
    if (!validation.isValid) {
      console.log('❌ Profile validation failed:', validation.errors);
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      };
    }

    // Get HCS10Client
    const client = getHCS10Client();
    if (!client) {
      console.log('❌ HCS10Client not available');
      return {
        success: false,
        message: 'HCS10Client not available',
        error: 'CLIENT_UNAVAILABLE'
      };
    }

    // Build HCS-11 compliant profile
    const hcs11Profile = buildHCS11Profile(profileData);
    const profileId = hcs11Profile.identity.agentId;

    console.log('✅ HCS-11 AI Agent Profile Structure Created:');
    console.log('   - Profile ID:', profileId);
    console.log('   - Agent Name:', hcs11Profile.identity.name);
    console.log('   - Company:', hcs11Profile.company.name);
    console.log('   - Capabilities:', hcs11Profile.capabilities.core);
    console.log('   - AI Model:', hcs11Profile.capabilities.aiModel.version);
    console.log('   - Profile Size:', JSON.stringify(hcs11Profile).length, 'bytes');

    return {
      success: true,
      profile: hcs11Profile,
      message: `AI Agent profile created successfully for ${profileData.companyName}`,
      agentProfile: hcs11Profile,
      profileDetails: {
        profileId: profileId,
        responsibleAccount: process.env.HEDERA_ACCOUNT_ID,
        profileSize: JSON.stringify(hcs11Profile).length
      }
    };

  } catch (error) {
    console.error('❌ Error creating HCS-11 profile:', error);
    return {
      success: false,
      message: 'Failed to create AI Agent profile',
      error: error.message
    };
  }
};

/**
 * Creates and inscribes an HCS-11 AI Agent Profile to Hedera
 * @param {Object} profileData - The profile data containing companyName and companyDescription
 * @param {Object} agentCredentials - Optional agent Hedera credentials {accountId, privateKey}
 * @returns {Promise<Object>} - Result object with success status, profile and topic details
 */
module.exports.createAndInscribeProfile = async (profileData, agentCredentials = null) => {
  try {
    console.log('🚀 Creating and inscribing HCS-11 AI Agent Profile for:', profileData.companyName);

    // Validate input data
    const validation = validateProfileData(profileData);
    if (!validation.isValid) {
      return {
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      };
    }

    // Get HCS10Client - use agent credentials if provided
    let client;
    if (agentCredentials && agentCredentials.accountId && agentCredentials.privateKey) {
      console.log('🔑 Using Agent Credentials for HCS10Client:');
      console.log('   - Agent Account ID:', agentCredentials.accountId);

      try {
        const { HCS10Client } = require('@hashgraphonline/standards-sdk');
        client = new HCS10Client({
          network: process.env.HEDERA_NETWORK || 'testnet',
          operatorId: agentCredentials.accountId,
          operatorPrivateKey: agentCredentials.privateKey,
          guardedRegistryBaseUrl: process.env.REGISTRY_URL || 'https://moonscape.tech',
          prettyPrint: false,
          logLevel: 'info'
        });
        console.log('✅ Agent-specific HCS10Client initialized successfully');
      } catch (error) {
        console.error('❌ Error initializing agent-specific HCS10Client:', error.message);
        return {
          success: false,
          message: 'Failed to initialize agent-specific HCS10Client',
          error: 'AGENT_CLIENT_UNAVAILABLE'
        };
      }
    } else {
      console.log('🔑 Using Default System HCS10Client');
      client = getHCS10Client();
      if (!client) {
        return {
          success: false,
          message: 'HCS10Client not available',
          error: 'CLIENT_UNAVAILABLE'
        };
      }
    }

    // Build HCS-11 compliant profile
    const hcs11Profile = buildHCS11Profile(profileData);
    const timestamp = new Date().toISOString();
    const profileId = hcs11Profile.identity.agentId;

    console.log('📝 Creating communication topics...');
    const operatorAccountId = agentCredentials ? agentCredentials.accountId : process.env.HEDERA_ACCOUNT_ID;
    console.log('🏢 Company Profile Details:');
    console.log('   - Company Name:', profileData.companyName);
    console.log('   - Profile ID:', profileId);
    console.log('   - Operating Account:', operatorAccountId);
    console.log('   - System Account:', process.env.HEDERA_ACCOUNT_ID);

    // Step 1: Create inbound topic for the company agent
    let inboundTopicId;
    let inboundTopicTransactionId;
    try {
      const protocolStandard = '11';
      const companySlug = profileData.companyName.toLowerCase().replace(/\s+/g, '-');
      const inboundTopicMemo = `hcs-11:hcs://${protocolStandard}/in-${companySlug}`;

      console.log('📩 Creating Inbound Topic:');
      console.log('   - Topic Name:', `${profileData.companyName}-Agent-Inbound`);
      console.log('   - Topic Memo:', inboundTopicMemo);
      console.log('   - Creator Account:', process.env.HEDERA_ACCOUNT_ID);

      const inboundTopic = await client.createTopic(`${profileData.companyName}-Agent-Inbound`, inboundTopicMemo);
      inboundTopicId = inboundTopic.toString();

      console.log('✅ Inbound Topic Created Successfully:');
      console.log('   - Topic ID:', inboundTopicId);
      console.log('   - Network:', process.env.HEDERA_NETWORK || 'testnet');
      console.log('   - HashScan URL:', `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/topic/${inboundTopicId}`);

    } catch (topicError) {
      console.error(`❌ Failed to create inbound topic: ${topicError.message}`);
      console.error('   - Error Details:', topicError);
      return {
        success: false,
        message: `Inbound topic creation failed: ${topicError.message}`,
        error: 'TOPIC_CREATION_FAILED'
      };
    }

    // Step 2: Create outbound topic for the company agent
    let outboundTopicId;
    let outboundTopicTransactionId;
    try {
      const protocolStandard = '11';
      const companySlug = profileData.companyName.toLowerCase().replace(/\s+/g, '-');
      const outboundTopicMemo = `hcs-11:hcs://${protocolStandard}/out-${companySlug}`;

      console.log('📤 Creating Outbound Topic:');
      console.log('   - Topic Name:', `${profileData.companyName}-Agent-Outbound`);
      console.log('   - Topic Memo:', outboundTopicMemo);
      console.log('   - Creator Account:', process.env.HEDERA_ACCOUNT_ID);

      const outboundTopic = await client.createTopic(`${profileData.companyName}-Agent-Outbound`, outboundTopicMemo);
      outboundTopicId = outboundTopic.toString();

      console.log('✅ Outbound Topic Created Successfully:');
      console.log('   - Topic ID:', outboundTopicId);
      console.log('   - Network:', process.env.HEDERA_NETWORK || 'testnet');
      console.log('   - HashScan URL:', `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/topic/${outboundTopicId}`);

    } catch (topicError) {
      console.error(`❌ Failed to create outbound topic: ${topicError.message}`);
      console.error('   - Error Details:', topicError);
      return {
        success: false,
        message: `Outbound topic creation failed: ${topicError.message}`,
        error: 'TOPIC_CREATION_FAILED'
      };
    }

    // Step 3: Add communication configuration to profile
    hcs11Profile.communication = {
      inbound: {
        topicId: inboundTopicId,
        purpose: "message_reception",
        access: "controlled"
      },
      outbound: {
        topicId: outboundTopicId,
        purpose: "message_transmission",
        access: "controlled"
      },
      protocols: {
        supported: ["HCS-10", "HCS-11"],
        primary: "HCS-11"
      },
      messageFormats: ["structured_json", "conversation"],
      maxMessageSize: 1024,
      rateLimits: {
        messagesPerMinute: 60,
        burstLimit: 10
      }
    };

    // Step 4: Deploy profile using HCS-11 standard message format
    console.log('📝 Deploying HCS-11 profile to network...');
    console.log('🚀 Profile Deployment Details:');
    console.log('   - Profile ID:', profileId);
    console.log('   - Target Topic ID:', inboundTopicId);
    console.log('   - Deployed By Account:', process.env.HEDERA_ACCOUNT_ID);
    console.log('   - Network:', process.env.HEDERA_NETWORK || 'testnet');
    console.log('   - Timestamp:', timestamp);

    try {
      const deploymentId = `deploy_${Date.now()}`;
      const deploymentMessage = {
        p: "hcs-11",
        op: "deploy",
        type: "agent_profile",
        timestamp: timestamp,
        agentId: profileId,
        profile: hcs11Profile,
        deployment: {
          deployedBy: process.env.HEDERA_ACCOUNT_ID,
          deploymentId: deploymentId,
          status: "active",
          network: process.env.HEDERA_NETWORK || "testnet",
          consensusRequired: true
        },
        m: `HCS-11 agent profile deployment for ${profileData.companyName}`
      };

      console.log('📤 Sending Profile Deployment Message:');
      console.log('   - Message Size:', JSON.stringify(deploymentMessage).length, 'bytes');
      console.log('   - Deployment ID:', deploymentId);

      const deploymentResult = await client.sendMessage(
        inboundTopicId,
        JSON.stringify(deploymentMessage)
      );

      console.log('✅ Profile Deployment Transaction Successful:');
      console.log('   - Transaction ID:', deploymentResult.toString());
      console.log('   - Topic ID:', inboundTopicId);
      console.log('   - Network:', process.env.HEDERA_NETWORK || 'testnet');
      console.log('   - Transaction HashScan:', `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/transaction/${deploymentResult.toString()}`);
      console.log('   - Topic HashScan:', `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/topic/${inboundTopicId}`);

      // Step 5: Send profile registration to outbound topic
      console.log('📡 Registering Agent for Network Discovery:');
      console.log('   - Agent ID:', profileId);
      console.log('   - Registration Topic ID:', outboundTopicId);
      console.log('   - Registration Account:', process.env.HEDERA_ACCOUNT_ID);

      const registrationTimestamp = new Date().toISOString();
      const registrationMessage = {
        p: "hcs-11",
        op: "register",
        type: "agent_announcement",
        timestamp: registrationTimestamp,
        agentId: profileId,
        announcement: {
          name: hcs11Profile.identity.name,
          company: profileData.companyName,
          capabilities: hcs11Profile.capabilities.core,
          inboundTopic: inboundTopicId,
          outboundTopic: outboundTopicId,
          status: "online",
          discoverable: true
        },
        m: `Agent registration announcement for network discovery`
      };

      console.log('📤 Sending Registration Message:');
      console.log('   - Message Size:', JSON.stringify(registrationMessage).length, 'bytes');
      console.log('   - Registration Timestamp:', registrationTimestamp);

      const registrationResult = await client.sendMessage(
        outboundTopicId,
        JSON.stringify(registrationMessage)
      );

      console.log('✅ Agent Registration Transaction Successful:');
      console.log('   - Registration Transaction ID:', registrationResult.toString());
      console.log('   - Registration Topic ID:', outboundTopicId);
      console.log('   - Registration HashScan:', `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/transaction/${registrationResult.toString()}`);

      console.log('');
      console.log('🎉 HCS-11 Profile Creation Complete!');
      console.log('==========================================');
      console.log('📋 On-Chain Creation Summary:');
      console.log('   - Profile ID:', profileId);
      console.log('   - Company Name:', profileData.companyName);
      console.log('   - Responsible Account ID:', process.env.HEDERA_ACCOUNT_ID);
      console.log('   - Network:', process.env.HEDERA_NETWORK || 'testnet');
      console.log('   - Inbound Topic ID:', inboundTopicId);
      console.log('   - Outbound Topic ID:', outboundTopicId);
      console.log('   - Deployment Transaction ID:', deploymentResult.toString());
      console.log('   - Registration Transaction ID:', registrationResult.toString());
      console.log('   - Profile HashScan URL:', `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/topic/${inboundTopicId}`);
      console.log('   - Registration HashScan URL:', `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/topic/${outboundTopicId}`);
      console.log('==========================================');

      return {
        success: true,
        profileId: profileId,
        topicId: inboundTopicId,
        outboundTopicId: outboundTopicId,
        verificationUrl: `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/topic/${inboundTopicId}`,
        message: `AI Agent profile created and inscribed successfully for ${profileData.companyName}`,
        agentProfile: hcs11Profile,
        onChainDetails: {
          responsibleAccountId: process.env.HEDERA_ACCOUNT_ID,
          network: process.env.HEDERA_NETWORK || 'testnet',
          deploymentTransactionId: deploymentResult.toString(),
          registrationTransactionId: registrationResult.toString(),
          inboundTopicId: inboundTopicId,
          outboundTopicId: outboundTopicId,
          deploymentHashScan: `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/transaction/${deploymentResult.toString()}`,
          registrationHashScan: `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/transaction/${registrationResult.toString()}`,
          profileHashScan: `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/topic/${inboundTopicId}`,
          registrationHashScan_topic: `https://hashscan.io/${process.env.HEDERA_NETWORK || 'testnet'}/topic/${outboundTopicId}`
        },
        communication: {
          inboundTopicId,
          outboundTopicId
        }
      };

    } catch (deploymentError) {
      console.error(`❌ Failed to deploy profile: ${deploymentError.message}`);

      // Return success with topics but note deployment failure
      return {
        success: true,
        profileId: profileId,
        topicId: inboundTopicId,
        outboundTopicId: outboundTopicId,
        verificationUrl: `https://hashscan.io/testnet/topic/${inboundTopicId}`,
        message: `Topics created but profile deployment failed: ${deploymentError.message}`,
        agentProfile: hcs11Profile,
        communication: {
          inboundTopicId,
          outboundTopicId
        },
        deploymentWarning: deploymentError.message
      };
    }

  } catch (error) {
    console.error('❌ Error creating and inscribing HCS-11 profile:', error);
    return {
      success: false,
      message: 'Failed to create and inscribe AI Agent profile',
      error: error.message
    };
  }
};

/**
 * Gets the verification URL for a profile topic
 * @param {string} topicId - The Hedera topic ID
 * @returns {string} - The verification URL
 */
module.exports.getProfileVerificationURL = (topicId) => {
  return `https://hashscan.io/testnet/topic/${topicId}`;
};

/**
 * Validates profile data (exported for external use)
 * @param {Object} profileData - The profile data to validate
 * @returns {Object} - Validation result
 */
module.exports.validateProfileData = validateProfileData;

/**
 * Helper function to check if HCS-11 service is available
 * @returns {boolean} - True if service is properly configured
 */
module.exports.isServiceAvailable = () => {
  return !!(process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY);
};