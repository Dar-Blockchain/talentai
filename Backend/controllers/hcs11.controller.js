const hcs11Service = require("../services/hcs11.service");

const createProfile = async (req, res) => {
  try {
    console.log("📝 HCS-11 Profile creation request received");

    const { companyName, companyDescription, agentConfig } = req.body;

    // Basic validation
    if (!companyName || !companyDescription) {
      return res.status(400).json({
        success: false,
        message: "Company name and description are required",
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Check if service is available
    if (!hcs11Service.isServiceAvailable()) {
      return res.status(503).json({
        success: false,
        message: "HCS-11 service is not properly configured",
        error: "SERVICE_UNAVAILABLE",
      });
    }

    const profileData = {
      companyName,
      companyDescription,
      agentConfig,
    };

    const result = await hcs11Service.createAIAgentProfile(profileData);

    if (result.success) {
      console.log("✅ HCS-11 Profile created successfully for:", companyName);
      return res.status(200).json(result);
    } else {
      console.log("❌ HCS-11 Profile creation failed:", result.message);
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("❌ Error in createProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const createAndInscribeProfile = async (req, res) => {
  try {
    console.log("📝 HCS-11 Profile creation and inscription request received");

    const { companyName, companyDescription, agentConfig } = req.body;

    // Basic validation
    if (!companyName || !companyDescription) {
      return res.status(400).json({
        success: false,
        message: "Company name and description are required",
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Check if service is available
    if (!hcs11Service.isServiceAvailable()) {
      return res.status(503).json({
        success: false,
        message: "HCS-11 service is not properly configured",
        error: "SERVICE_UNAVAILABLE",
      });
    }

    const profileData = {
      companyName,
      companyDescription,
      agentConfig,
    };

    const result = await hcs11Service.createAndInscribeProfile(profileData);

    if (result.success) {
      console.log(
        "✅ HCS-11 Profile created and inscribed successfully for:",
        companyName,
      );
      console.log("🔗 Verification URL:", result.verificationUrl);
      return res.status(200).json(result);
    } else {
      console.log(
        "❌ HCS-11 Profile creation and inscription failed:",
        result.message,
      );
      return res.status(400).json(result);
    }
  } catch (error) {
    console.error("❌ Error in createAndInscribeProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const validateProfile = async (req, res) => {
  try {
    const { companyName, companyDescription, agentConfig } = req.body;

    const profileData = {
      companyName,
      companyDescription,
      agentConfig,
    };

    const validation = hcs11Service.validateProfileData(profileData);

    return res.status(200).json(validation);
  } catch (error) {
    console.error("❌ Error in validateProfile controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getServiceStatus = async (req, res) => {
  try {
    const isAvailable = hcs11Service.isServiceAvailable();

    return res.status(200).json({
      available: isAvailable,
      message: isAvailable
        ? "HCS-11 service is properly configured and available"
        : "HCS-11 service requires Hedera environment variables to be configured",
    });
  } catch (error) {
    console.error("❌ Error in getServiceStatus controller:", error);
    return res.status(500).json({
      available: false,
      message: "Error checking service status",
      error: error.message,
    });
  }
};

const createCompanyAgent = async (req, res) => {
  try {
    console.log(
      "🚀 Creating Company Agent with Hedera Account and HCS-11 Profile",
    );

    const {
      companyName,
      postId,
      agentPosition,
      companyDescription,
      agentConfig,
    } = req.body;

    // Basic validation
    if (!companyName || !postId || !agentPosition || !companyDescription) {
      return res.status(400).json({
        success: false,
        message:
          "Company name, post ID, agent position, and company description are required",
        error: "MISSING_REQUIRED_FIELDS",
      });
    }

    // Check if service is available
    if (!hcs11Service.isServiceAvailable()) {
      return res.status(503).json({
        success: false,
        message: "HCS-11 service is not properly configured",
        error: "SERVICE_UNAVAILABLE",
      });
    }

    // Generate agent name in format: companyName:postID
    const agentName = `${companyName}:${postId}`;
    console.log("📋 Company Agent Details:");
    console.log("   - Agent Name:", agentName);
    console.log("   - Company:", companyName);
    console.log("   - Post ID:", postId);
    console.log("   - Position:", agentPosition);
    console.log("   - Description:", companyDescription);

    // Step 1: Create Hedera wallet for this company agent
    console.log("💰 Creating Hedera Account...");
    const { createHederaWallet } = require("../services/hedera.service");
    const hederaWallet = await createHederaWallet();

    console.log("✅ Hedera Account Created:");
    console.log("   - Account ID:", hederaWallet.accountId);
    console.log("   - Public Key:", hederaWallet.pubkey);
    console.log("   - Network:", process.env.HEDERA_NETWORK || "testnet");

    // Step 1.5: Set HCS-11 memo on the newly created agent account
    console.log("📝 Setting HCS-11 Memo on Agent Account...");
    try {
      // Initialize HCS10Client with the agent's credentials to set memo
      const { HCS10Client } = require("@hashgraphonline/standards-sdk");
      const agentClient = new HCS10Client({
        network: process.env.HEDERA_NETWORK || "testnet",
        operatorId: hederaWallet.accountId,
        operatorPrivateKey: hederaWallet.privkey,
        guardedRegistryBaseUrl:
          process.env.REGISTRY_URL || "https://moonscape.tech",
        prettyPrint: false,
        logLevel: "info",
      });

      // Set HCS-11 memo using the pattern from HR agent controller
      const resourceId = hederaWallet.accountId; // Use the agent's account ID as resource
      let memo;

      try {
        memo = agentClient.setProfileForAccountMemo(resourceId, 11);
      } catch (sdkError) {
        console.warn(
          "⚠️  SDK memo method failed, using fallback format:",
          sdkError.message,
        );
        // Fallback to manual format if SDK fails
        memo = `hcs-11:hcs://${11}/${resourceId}`;
      }

      // Actually set the memo on the Hedera account
      const {
        Client,
        AccountUpdateTransaction,
        PrivateKey,
      } = require("@hashgraph/sdk");

      const client = Client.forTestnet();
      if (process.env.HEDERA_NETWORK === "mainnet") {
        client.setNetwork("mainnet");
      }
      client.setOperator(
        hederaWallet.accountId,
        PrivateKey.fromString(hederaWallet.privkey),
      );

      const accountUpdateTx = new AccountUpdateTransaction()
        .setAccountId(hederaWallet.accountId)
        .setAccountMemo(memo);

      const txResponse = await accountUpdateTx.execute(client);
      const receipt = await txResponse.getReceipt(client);

      console.log("✅ HCS-11 Memo Set Successfully on Hedera Account:");
      console.log("   - Account ID:", hederaWallet.accountId);
      console.log("   - Resource ID:", resourceId);
      console.log("   - Memo:", memo);
      console.log("   - Protocol Version:", 11);
      console.log("   - Transaction ID:", txResponse.transactionId.toString());
      console.log("   - Transaction Status:", receipt.status.toString());
    } catch (memoError) {
      console.warn(
        "⚠️  Warning: Failed to set HCS-11 memo:",
        memoError.message,
      );
      console.warn(
        "   - Agent account may not have proper memo, but continuing...",
      );
    }

    // Step 2: Create HCS-11 profile using proper HR agent pattern
    console.log("📝 Creating HCS-11 Profile...");

    // Create agent object that matches HR agent structure
    const companyAgent = {
      _id: `company_agent_${Date.now()}`,
      name: agentName,
      avatarName: companyName.toLowerCase().replace(/\s+/g, "-"),
      role: "COMPANY_RECRUITER",
      description: `AI recruiting agent for ${companyName}, specializing in ${agentPosition} positions. ${companyDescription}`,
      hederaAccountId: hederaWallet.accountId,
      hederaPrivateKey: hederaWallet.privkey,
      hederaPublicKey: hederaWallet.pubkey,
      isActive: true,
      hcs11CustomProfile: {
        companyInfo: {
          name: companyName,
          description: companyDescription,
          industry: agentConfig?.industry || "Technology",
          website: agentConfig?.website || "",
          socialLinks: agentConfig?.socialLinks || {},
        },
        position: {
          postId,
          title: agentPosition,
          department: agentConfig?.department || "Human Resources",
        },
        agentPersonality: {
          communicationStyle: "professional",
          approachMethod: "company_representative",
          evaluationPhilosophy: "Company-focused candidate assessment",
        },
        specializedCapabilities: agentConfig?.capabilities || [
          "RECRUITING",
          "CANDIDATE_EVALUATION",
          "COMPANY_REPRESENTATION",
        ],
        evaluationFramework: {
          focus: "company_fit_assessment",
          criteria: ["technical_skills", "cultural_fit", "experience_match"],
        },
        domainExpertise: {
          industry: agentConfig?.industry || "Technology",
          position: agentPosition,
          specialization: agentConfig?.properties?.techStack || [],
        },
      },
    };

    // Use the existing HR agent profile creation function
    const hrAgentController = require("./hrAgent.controller");
    const profileResult =
      await hrAgentController.createAgentHCS11Profile(companyAgent);

    if (profileResult.success) {
      console.log("✅ Company Agent Creation Complete!");
      console.log("==========================================");
      console.log("📋 Company Agent Summary:");
      console.log("   - Agent Name:", agentName);
      console.log("   - Company:", companyName);
      console.log("   - Position:", agentPosition);
      console.log("   - Post ID:", postId);
      console.log("   - Hedera Account:", hederaWallet.accountId);
      console.log("   - Profile ID:", profileResult.profileId);
      console.log("   - Inbound Topic:", profileResult.inboundTopicId);
      console.log("   - Outbound Topic:", profileResult.outboundTopicId);
      console.log("==========================================");

      return res.status(200).json({
        success: true,
        agentId: profileResult.profileId,
        agentName: agentName,
        hederaAccountId: hederaWallet.accountId,
        hederaPublicKey: hederaWallet.pubkey,
        companyInfo: {
          companyName,
          postId,
          agentPosition,
          companyDescription,
        },
        profileDetails: profileResult.profile,
        onChainDetails: {
          responsibleAccountId: process.env.HEDERA_ACCOUNT_ID,
          network: process.env.HEDERA_NETWORK || "testnet",
          deploymentTransactionId: profileResult.deploymentMessageId,
          registrationTransactionId: profileResult.deploymentMessageId,
          agentAccountId: hederaWallet.accountId,
          agentPublicKey: hederaWallet.pubkey,
          inboundTopicId: profileResult.inboundTopicId,
          outboundTopicId: profileResult.outboundTopicId,
          deploymentHashScan: `https://hashscan.io/${process.env.HEDERA_NETWORK || "testnet"}/transaction/${profileResult.deploymentMessageId}`,
          registrationHashScan: `https://hashscan.io/${process.env.HEDERA_NETWORK || "testnet"}/transaction/${profileResult.deploymentMessageId}`,
          profileHashScan: `https://hashscan.io/${process.env.HEDERA_NETWORK || "testnet"}/topic/${profileResult.inboundTopicId}`,
        },
        communication: {
          inboundTopicId: profileResult.inboundTopicId,
          outboundTopicId: profileResult.outboundTopicId,
        },
        verificationUrls: {
          profile: `https://hashscan.io/${process.env.HEDERA_NETWORK || "testnet"}/topic/${profileResult.inboundTopicId}`,
          account: `https://hashscan.io/${process.env.HEDERA_NETWORK || "testnet"}/account/${hederaWallet.accountId}`,
          inboundTopic: `https://hashscan.io/${process.env.HEDERA_NETWORK || "testnet"}/topic/${profileResult.inboundTopicId}`,
          outboundTopic: `https://hashscan.io/${process.env.HEDERA_NETWORK || "testnet"}/topic/${profileResult.outboundTopicId}`,
        },
        message: `Company agent ${agentName} created successfully with Hedera account and HCS-11 profile`,
      });
    } else {
      console.log("❌ HCS-11 Profile creation failed:", profileResult.message);
      return res.status(400).json({
        success: false,
        message: "Failed to create HCS-11 profile",
        error: profileResult.error,
        hederaAccount: {
          accountId: hederaWallet.accountId,
          note: "Hedera account created but profile deployment failed",
        },
      });
    }
  } catch (error) {
    console.error("❌ Error in createCompanyAgent controller:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createProfile,
  createAndInscribeProfile,
  validateProfile,
  getServiceStatus,
  createCompanyAgent,
};
