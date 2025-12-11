const AgentModel = require("../models/AgentModel");
const { createHederaWallet } = require("../services/hederaService");
const {
  LangChainTogetherAIAgent,
} = require("../helpers/langchainTogetherAIAgent");
const {
  HederaLangchainToolkit,
  AgentMode,
  coreHTSPlugin,
  coreConsensusPlugin,
  coreQueriesPlugin,
} = require("hedera-agent-kit");
const { Client, PrivateKey, PublicKey } = require("@hashgraph/sdk");
const EvaluationTopicModel = require("../models/EvaluationTopicModel");
const {
  HCS10Client,
  HCS11Client,
  AIAgentType,
  AIAgentCapability,
  Logger,
  ConnectionsManager,
} = require("@hashgraphonline/standards-sdk");
const JobPost = require("../models/PostModel");
const Profile = require("../models/ProfileModel");

// services/MatchingService/computeMatches.js

const { calculateMatchScore, normalizeSkillName } = require("../services/MatchingService/matchingService");
const { getMatchingConfig } = require("../services/MatchingService/matchingConfigService");
const UnlockCandidate = require("../models/UnlockCandidateModel"); 

async function computeMatches(jobPostId, companyId) {
  // Charger les candidats
  const candidates = await Profile.find({ type: "Candidate" })
    .populate("userId", "username email")
    .populate("companyBid.company", "username email")
    .lean();

  // Charger le job
  const jobPost = await JobPost.findById(jobPostId)
    .select("skillAnalysis.requiredSkills skillAnalysis.softSkills jobDetails")
    .lean();

  if (!jobPost || !jobPost.skillAnalysis) {
    return { jobTitle: "Unknown", matches: [] };
  }

  /** ------------------------
   * Préparation des skills
   * ------------------------- */
  const requiredHardSkills = (jobPost.skillAnalysis.requiredSkills || [])
    .filter((s) => s && s.name)
    .map((s) => ({ ...s, name: normalizeSkillName(s.name) }));

  const requiredSoftSkills = jobPost.skillAnalysis.softSkills || [];
    // 0️⃣ Charger la config UNE SEULE FOIS
    const matchingConfig = await getMatchingConfig(companyId, jobPostId);
  /** ------------------------
   * Matching
   * ------------------------- */
  const matches = [];

  for (const candidate of candidates) {
    if (!candidate.userId) continue;

    const candidateSkills = (candidate.skills || [])
      .filter((s) => s && s.name)
      .map((s) => ({ ...s, name: normalizeSkillName(s.name) }));

    /** ------------------------
     * APPEL DE LA NOUVELLE LOGIQUE
     * calculateMatchScore()
     * ------------------------- */
    /* -----------------------------------------
       2️⃣b Charger tous les unlocked en une seule requête
    ----------------------------------------- */
    const unlockedRecords = await UnlockCandidate.find(
      { companyId, job: jobPostId }, // filtre par job si nécessaire
      { idCandidate: 1, _id: 0 }
    ).lean();
    const unlockedSet = new Set(unlockedRecords.map(u => String(u.idCandidate)));

    const { score, unlocked } = await calculateMatchScore(
      requiredHardSkills,
      candidateSkills,
      jobPost.jobDetails,
      candidate,
      companyId,
      matchingConfig,
      unlockedSet
    );

    if (score <= 0) continue;

    const matchedSkills = candidateSkills.filter((cs) =>
      requiredHardSkills.some((rs) => rs.name === cs.name)
    );

    matches.push({
      candidateId: candidate.userId._id,
      name: candidate.userId.username || "Anonymous",
      score,
      unlocked,
      finalBid: candidate.companyBid?.finalBid || null,
      biddingCompany: candidate.companyBid?.company?.username || null,
      matchedSkills,
      requiredSkills: requiredHardSkills,
    });
  }

  // Trier par score décroissant
  matches.sort((a, b) => b.score - a.score);

  return {
    jobTitle: jobPost.jobDetails?.title || "Unknown",
    matches,
  };
}

// Coordinator diagnostic functions integrated into controller

const hrAgentController = {
  /**
   * Initialize HR Validation Agents with HCS-11 Compliant Profiles
   * Creates all 6 HR validation agents with Hedera wallets and official HCS-11 profiles (one-time operation)
   */
  async initializeAgents(req, res) {
    try {
      const { agentConfigs } = req.body;

      // Validate agentConfigs
      if (!agentConfigs || !Array.isArray(agentConfigs)) {
        return res.status(400).json({
          success: false,
          message: "agentConfigs array is required",
        });
      }

      // Check if user has admin role
      //   if (req.user.role !== 'admin') {
      //     return res.status(403).json({
      //       success: false,
      //       message: 'Access denied. Admin role required.'
      //     });
      //   }

      // Check if agents already exist
      // const existingAgents = await AgentModel.find();
      // if (existingAgents.length > 0) {
      //   return res.status(400).json({
      //     success: false,
      //     message: 'HR agents already initialized'
      //   });
      // }

      // Define the 6 HR validation agents with detailed HCS-11 custom profiles
      // const agentConfigs = [
      //   {
      //     name: "Sinda-SoftSkill-Agent",
      //     avatarName: "sinda",
      //     role: "Soft Skills Specialist",
      //     description: "Validates candidate soft skills and interpersonal abilities",
      //     hcs11CustomProfile: {
      //       agentPersonality: {
      //         communicationStyle: "empathetic_analytical",
      //         approachMethod: "behavioral_interview",
      //         focusAreas: ["emotional_intelligence", "team_collaboration", "adaptability"],
      //         evaluationPhilosophy: "Human connection drives professional success"
      //       },
      //       specializedCapabilities: {
      //         psychometricAnalysis: true,
      //         emotionalIntelligenceAssessment: true,
      //         interpersonalDynamicsEvaluation: true,
      //         softSkillsMapping: true,
      //         culturalSensitivityAssessment: true
      //       },
      //       evaluationFramework: {
      //         primaryMetrics: ["empathy_quotient", "communication_clarity", "team_integration"],
      //         assessmentTools: ["behavioral_scenarios", "role_playing", "peer_feedback_simulation"],
      //         scoringModel: "holistic_behavioral_assessment",
      //         benchmarkStandards: ["industry_soft_skills", "team_dynamics", "leadership_readiness"]
      //       },
      //       domainExpertise: {
      //         industries: ["technology", "healthcare", "finance", "education"],
      //         teamSizes: ["startup", "mid_size", "enterprise"],
      //         workEnvironments: ["remote", "hybrid", "on_site"],
      //         culturalContexts: ["multicultural", "diverse", "inclusive"]
      //       }
      //     }
      //   },
      //   {
      //     name: "Olga-Technical-Agent",
      //     avatarName: "olga",
      //     role: "Technical Skills Evaluator",
      //     description: "Validates candidate technical skills and expertise",
      //     hcs11CustomProfile: {
      //       agentPersonality: {
      //         communicationStyle: "analytical_precise",
      //         approachMethod: "technical_deep_dive",
      //         focusAreas: ["code_quality", "system_design", "problem_solving"],
      //         evaluationPhilosophy: "Technical excellence through practical demonstration"
      //       },
      //       specializedCapabilities: {
      //         codeReviewAnalysis: true,
      //         algorithmicThinking: true,
      //         systemArchitectureEvaluation: true,
      //         technicalProblemSolving: true,
      //         performanceOptimization: true,
      //         securityAssessment: true
      //       },
      //       evaluationFramework: {
      //         primaryMetrics: ["technical_depth", "code_efficiency", "architectural_thinking"],
      //         assessmentTools: ["live_coding", "system_design", "code_review", "technical_scenarios"],
      //         scoringModel: "technical_competency_matrix",
      //         benchmarkStandards: ["senior_developer", "tech_lead", "architect_level"]
      //       },
      //       domainExpertise: {
      //         technologies: ["javascript", "python", "java", "react", "node.js", "aws", "docker"],
      //         frameworks: ["frontend", "backend", "fullstack", "mobile", "cloud"],
      //         methodologies: ["agile", "devops", "tdd", "microservices"],
      //         experienceLevels: ["junior", "mid", "senior", "lead", "principal"]
      //       }
      //     }
      //   },
      //   {
      //     name: "Jaaf-Experience-Agent",
      //     avatarName: "jaaf",
      //     role: "Experience Validator",
      //     description: "Validates candidate work experience and background",
      //     hcs11CustomProfile: {
      //       agentPersonality: {
      //         communicationStyle: "investigative_thorough",
      //         approachMethod: "chronological_analysis",
      //         focusAreas: ["career_progression", "achievement_validation", "experience_depth"],
      //         evaluationPhilosophy: "Past performance predicts future success"
      //       },
      //       specializedCapabilities: {
      //         careerTrajectoryAnalysis: true,
      //         achievementVerification: true,
      //         skillProgressionMapping: true,
      //         industryExperienceValidation: true,
      //         responsibilityGrowthAssessment: true
      //       },
      //       evaluationFramework: {
      //         primaryMetrics: ["experience_relevance", "career_growth", "impact_measurement"],
      //         assessmentTools: ["experience_deep_dive", "achievement_verification", "reference_simulation"],
      //         scoringModel: "progressive_experience_analysis",
      //         benchmarkStandards: ["role_requirements", "industry_experience", "seniority_level"]
      //       },
      //       domainExpertise: {
      //         careerStages: ["entry_level", "mid_career", "senior_professional", "executive"],
      //         industryVerticals: ["fintech", "healthcare", "e_commerce", "saas", "consulting"],
      //         roleTypes: ["individual_contributor", "team_lead", "manager", "director"],
      //         transitionTypes: ["career_change", "industry_switch", "role_progression"]
      //       }
      //     }
      //   },
      //   {
      //     name: "Sam-Culture-Agent",
      //     avatarName: "sam",
      //     role: "Cultural Fit Assessor",
      //     description: "Evaluates candidate cultural fit and values alignment",
      //     hcs11CustomProfile: {
      //       agentPersonality: {
      //         communicationStyle: "values_focused_intuitive",
      //         approachMethod: "cultural_immersion",
      //         focusAreas: ["values_alignment", "team_dynamics", "organizational_fit"],
      //         evaluationPhilosophy: "Cultural harmony drives organizational success"
      //       },
      //       specializedCapabilities: {
      //         valuesAssessment: true,
      //         culturalIntelligence: true,
      //         teamDynamicsEvaluation: true,
      //         organizationalFitAnalysis: true,
      //         diversityAndInclusionAssessment: true
      //       },
      //       evaluationFramework: {
      //         primaryMetrics: ["cultural_alignment", "team_integration", "value_congruence"],
      //         assessmentTools: ["values_mapping", "cultural_scenarios", "team_simulation"],
      //         scoringModel: "cultural_compatibility_index",
      //         benchmarkStandards: ["company_culture", "team_values", "organizational_mission"]
      //       },
      //       domainExpertise: {
      //         companyTypes: ["startup", "scale_up", "enterprise", "non_profit"],
      //         culturalFrameworks: ["innovation_driven", "process_oriented", "people_first", "results_focused"],
      //         teamStructures: ["hierarchical", "flat", "matrix", "cross_functional"],
      //         workStyles: ["collaborative", "autonomous", "mentorship_driven", "performance_oriented"]
      //       }
      //     }
      //   },
      //   {
      //     name: "Julia-Leadership-Agent",
      //     avatarName: "julia",
      //     role: "Leadership Potential Evaluator",
      //     description: "Assesses candidate leadership capabilities and potential",
      //     hcs11CustomProfile: {
      //       agentPersonality: {
      //         communicationStyle: "inspirational_strategic",
      //         approachMethod: "leadership_competency",
      //         focusAreas: ["strategic_thinking", "team_development", "decision_making"],
      //         evaluationPhilosophy: "Great leaders create more leaders"
      //       },
      //       specializedCapabilities: {
      //         leadershipStyleAssessment: true,
      //         strategicThinkingEvaluation: true,
      //         teamBuildingCapabilities: true,
      //         decisionMakingAnalysis: true,
      //         visionaryCommunication: true,
      //         changeManagementSkills: true
      //       },
      //       evaluationFramework: {
      //         primaryMetrics: ["leadership_presence", "strategic_vision", "team_influence"],
      //         assessmentTools: ["leadership_scenarios", "strategic_planning", "team_challenges"],
      //         scoringModel: "leadership_competency_framework",
      //         benchmarkStandards: ["emerging_leader", "experienced_manager", "senior_executive"]
      //       },
      //       domainExpertise: {
      //         leadershipLevels: ["team_lead", "manager", "director", "vp", "c_suite"],
      //         leadershipStyles: ["transformational", "servant", "authentic", "situational"],
      //         organizationalContexts: ["turnaround", "growth", "stable", "startup"],
      //         teamSizes: ["small_team", "department", "division", "organization"]
      //       }
      //     }
      //   },
      //   {
      //     name: "Yuka-Communication-Agent",
      //     avatarName: "yuka",
      //     role: "Communication Skills Specialist",
      //     description: "Validates candidate communication and presentation skills",
      //     hcs11CustomProfile: {
      //       agentPersonality: {
      //         communicationStyle: "articulate_adaptive",
      //         approachMethod: "multi_modal_communication",
      //         focusAreas: ["verbal_excellence", "written_clarity", "presentation_mastery"],
      //         evaluationPhilosophy: "Clear communication is the bridge to success"
      //       },
      //       specializedCapabilities: {
      //         verbalCommunicationAnalysis: true,
      //         writtenCommunicationEvaluation: true,
      //         presentationSkillsAssessment: true,
      //         activeListeningEvaluation: true,
      //         cross_culturalCommunication: true,
      //         persuasionAndInfluenceSkills: true
      //       },
      //       evaluationFramework: {
      //         primaryMetrics: ["message_clarity", "audience_engagement", "communication_impact"],
      //         assessmentTools: ["presentation_exercise", "written_assessment", "interview_analysis"],
      //         scoringModel: "comprehensive_communication_matrix",
      //         benchmarkStandards: ["professional_standard", "executive_level", "public_speaking"]
      //       },
      //       domainExpertise: {
      //         communicationContexts: ["one_on_one", "team_meetings", "presentations", "public_speaking"],
      //         audiences: ["technical", "executive", "cross_functional", "external_clients"],
      //         mediums: ["verbal", "written", "digital", "visual"],
      //         culturalAdaptation: ["global_teams", "diverse_audiences", "multilingual_environments"]
      //       }
      //     }
      //   }
      // ];

      // Create agents in database with Hedera wallets and HCS-11 profiles
      const createdAgents = [];

      for (const config of agentConfigs) {
        console.log(`🔄 Creating agent: ${config.name}`);
        console.log(`   📝 Step 1: Creating Hedera wallet...`);

        // Create Hedera wallet for this agent
        const hederaWallet = await createHederaWallet();
        console.log(`   ✅ Wallet created: ${hederaWallet.accountId}`);

        // Save agent to database first with custom profile
        const agent = new AgentModel({
          ...config,
          isActive: true,
          createdAt: new Date(),
          hederaAccountId: hederaWallet.accountId,
          hederaPrivateKey: hederaWallet.privkey,
          hederaPublicKey: hederaWallet.pubkey,
          // Legacy fields for backwards compatibility
          accountId: hederaWallet.accountId,
          privkey: hederaWallet.privkey,
          pubkey: hederaWallet.pubkey,
        });

        const savedAgent = await agent.save();
        console.log(`   📦 Agent saved to database: ${savedAgent._id}`);

        // Step 2: Create HCS-10 topics first (needed for HCS-11 profile integration)
        console.log(`   📝 Step 2: Creating HCS-10 messaging topics...`);
        let inboundTopicId = null;
        let outboundTopicId = null;

        try {
          const topicResult = await hrAgentController.createAgentHCS11Profile(
            savedAgent
          );
          if (topicResult.success) {
            inboundTopicId = topicResult.inboundTopicId;
            outboundTopicId = topicResult.outboundTopicId;
            console.log(`   ✅ HCS-10 topics created successfully!`);
            console.log(`   📥 Inbound: ${inboundTopicId}`);
            console.log(`   📤 Outbound: ${outboundTopicId}`);
          }
        } catch (topicError) {
          console.log(
            `   ⚠️  HCS-10 topic creation failed: ${topicError.message}`
          );
        }

        // Step 3: Create HCS-11 compliant profile using official SDK methods
        console.log(
          `   📝 Step 3: Creating HCS-11 profile with official SDK...`
        );
        let profileResult = { success: false };
        try {
          profileResult = await hrAgentController.setHCS11AccountMemo(
            savedAgent,
            inboundTopicId,
            outboundTopicId
          );
          if (profileResult.success) {
            console.log(`   ✅ HCS-11 profile created successfully!`);
            console.log(
              `   📄 Profile Topic ID: ${profileResult.profileTopicId}`
            );
            console.log(`   🔗 Account memo updated automatically`);
          } else {
            console.log(
              `   ⚠️  HCS-11 profile creation failed: ${profileResult.error}`
            );
          }
        } catch (memoError) {
          console.log(
            `   ⚠️  HCS-11 profile setup failed: ${memoError.message}`
          );
          profileResult = { success: false, error: memoError.message };
        }

        try {
          if (profileResult.success) {
            savedAgent.hcs11Profile = profileResult.profile;
            savedAgent.inboundTopicId = profileResult.inboundTopicId;
            savedAgent.outboundTopicId = profileResult.outboundTopicId;
            savedAgent.profileId = profileResult.profileId;
            if (profileResult.deploymentMessageId) {
              savedAgent.deploymentMessageId =
                profileResult.deploymentMessageId;
            }
            if (profileResult.registrationMessageId) {
              savedAgent.profileRegistrationId =
                profileResult.registrationMessageId;
            }
            await savedAgent.save();
            console.log(`   ✅ HCS-11 profile created successfully`);
            console.log(`   🆔 Profile ID: ${profileResult.profileId}`);
            console.log(`   📩 Inbound Topic: ${profileResult.inboundTopicId}`);
            console.log(
              `   📤 Outbound Topic: ${profileResult.outboundTopicId}`
            );
            if (profileResult.deploymentMessageId) {
              console.log(
                `   🚀 Deployment ID: ${profileResult.deploymentMessageId}`
              );
            }
            if (profileResult.integrity) {
              console.log(
                `   🔐 Profile Hash: ${profileResult.integrity.profileHash}`
              );
            }
          } else {
            console.log(
              `   ⚠️  HCS-11 profile creation partially failed: ${profileResult.message}`
            );
          }
        } catch (profileError) {
          console.error(
            `   ❌ Failed to create HCS-11 profile: ${profileError.message}`
          );
          // Continue with agent creation even if profile fails
        }

        // Remove private key from response for security
        const agentResponse = savedAgent.toObject();
        delete agentResponse.hederaPrivateKey;
        delete agentResponse.privkey;
        createdAgents.push(agentResponse);

        console.log(`   🎉 Agent ${config.name} fully initialized!\n`);
      }

      res.status(200).json({
        success: true,
        message: "HR validation agents initialized successfully",
        data: createdAgents,
      });
    } catch (error) {
      console.error("Error initializing HR agents:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  /**
   * Initialize single HR agent with HCS-11 profile using data from request body
   */
  async initializeSingleAgent(req, res) {
    try {
      const { agentConfig } = req.body;

      if (!agentConfig) {
        return res.status(400).json({
          success: false,
          error: "Agent configuration is required",
        });
      }

      console.log(`🚀 Initializing single agent: ${agentConfig.name}...`);

      // Create Hedera wallet for the agent
      const hederaWallet = await createHederaWallet();
      console.log(
        `🔐 Created Hedera wallet for ${agentConfig.name}: ${hederaWallet.accountId}`
      );

      // Create agent record
      const newAgent = new AgentModel({
        ...agentConfig,
        hederaAccountId: hederaWallet.accountId,
        hederaPrivateKey: hederaWallet.privateKey,
        hederaPublicKey: hederaWallet.publicKey,
        status: "created",
        isActive: true,
        createdAt: new Date(),
      });

      await newAgent.save();
      console.log(`✅ Agent ${agentConfig.name} saved to database`);

      // Create HCS-11 profile
      await this.createAgentHCS11Profile(newAgent);
      console.log(`✅ HCS-11 profile created for ${agentConfig.name}`);

      res.json({
        success: true,
        message: `Agent ${agentConfig.name} initialized successfully`,
        agent: {
          id: newAgent._id,
          name: newAgent.name,
          role: newAgent.role,
          hederaAccountId: newAgent.hederaAccountId,
          status: newAgent.status,
        },
      });
    } catch (error) {
      console.error(`❌ Error initializing single agent:`, error);
      res.status(500).json({
        success: false,
        error: "Failed to initialize single agent",
        details: error.message,
      });
    }
  },

  /**
   * Create HCS-11 compliant agent profile with structured messaging and memo
   * Based on HCS-11 standard for agent profile management and identity
   */
  async createAgentHCS11Profile(agent) {
    try {
      console.log(
        `      🔧 Creating HCS-11 compliant profile for ${agent.name}...`
      );

      // Initialize HCS10Client for the agent
      const hcs10Client = new HCS10Client({
        network: "testnet",
        operatorId: agent.hederaAccountId,
        operatorPrivateKey: agent.hederaPrivateKey,
        guardedRegistryBaseUrl:
          process.env.REGISTRY_URL || "https://moonscape.tech",
        prettyPrint: false,
        logLevel: "info",
      });

      // Step 1: Create inbound topic for receiving messages with HCS-11 memo
      console.log(`      📩 Creating inbound topic with HCS-11 memo...`);
      let inboundTopicId;
      try {
        // Use HCS-11 protocol format for topics
        const protocolStandard = "11";
        const inboundTopicMemo = `hcs-11:hcs://${protocolStandard}/in-${agent.avatarName}`;

        const inboundTopic = await hcs10Client.createTopic(
          `${agent.name}-Inbound`,
          inboundTopicMemo
        );
        inboundTopicId = inboundTopic.toString();
        console.log(`      ✅ Inbound topic created: ${inboundTopicId}`);
      } catch (topicError) {
        console.error(
          `      ❌ Failed to create inbound topic: ${topicError.message}`
        );
        throw new Error(`Inbound topic creation failed: ${topicError.message}`);
      }

      // Step 2: Create outbound topic for sending messages with HCS-11 memo
      console.log(`      📤 Creating outbound topic with HCS-11 memo...`);
      let outboundTopicId;
      try {
        // Use HCS-11 protocol format for topics
        const protocolStandard = "11";
        const outboundTopicMemo = `hcs-11:hcs://${protocolStandard}/out-${agent.avatarName}`;

        const outboundTopic = await hcs10Client.createTopic(
          `${agent.name}-Outbound`,
          outboundTopicMemo
        );
        outboundTopicId = outboundTopic.toString();
        console.log(`      ✅ Outbound topic created: ${outboundTopicId}`);
      } catch (topicError) {
        console.error(
          `      ❌ Failed to create outbound topic: ${topicError.message}`
        );
        throw new Error(
          `Outbound topic creation failed: ${topicError.message}`
        );
      }

      // Step 3: Create comprehensive HCS-11 standard compliant profile
      const profileId = `agent_${agent._id.toString()}`;
      const timestamp = new Date().toISOString();

      const hcs11Profile = {
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
          name: agent.name,
          displayName: agent.name,
          avatar: agent.avatarName,
          role: agent.role,
          description: agent.description,
          organizationalUnit: "TalentAI_HR_Validation_System",
        },

        // Hedera Network Identity
        hedera: {
          accountId: agent.hederaAccountId,
          publicKey: agent.hederaPublicKey,
          network: process.env.HEDERA_NETWORK || "testnet",
          isActive: agent.isActive,
          createdAt: timestamp,
        },

        // Communication Configuration
        communication: {
          inbound: {
            topicId: inboundTopicId,
            purpose: "message_reception",
            access: "controlled",
          },
          outbound: {
            topicId: outboundTopicId,
            purpose: "message_transmission",
            access: "controlled",
          },
          protocols: {
            supported: ["HCS-10", "HCS-11"],
            primary: "HCS-11",
          },
          messageFormats: [
            "structured_json",
            "evaluation_data",
            "conversation",
          ],
          maxMessageSize: 1024,
          rateLimits: {
            messagesPerMinute: 60,
            burstLimit: 10,
          },
        },

        // Agent Capabilities and Specialization - Enhanced with Custom Profile
        capabilities: {
          core: [
            "conversational_ai",
            "candidate_evaluation",
            "collaborative_assessment",
            "structured_messaging",
            "hcs_consensus_participation",
          ],
          specialization: hrAgentController.getAgentSpecialization(agent.role),
          customProfile: agent.hcs11CustomProfile || {},
          agentPersonality: agent.hcs11CustomProfile?.agentPersonality || {
            communicationStyle: "professional",
            approachMethod: "standard_evaluation",
            evaluationPhilosophy: "Comprehensive candidate assessment",
          },
          specializedCapabilities:
            agent.hcs11CustomProfile?.specializedCapabilities || {},
          evaluationFramework:
            agent.hcs11CustomProfile?.evaluationFramework || {},
          domainExpertise: agent.hcs11CustomProfile?.domainExpertise || {},
          aiModel: {
            provider: "openai",
            version: "gpt-4",
            specialTraining: "hr_evaluation_protocols",
            customizedFor: agent.role,
            personalityProfile: agent.hcs11CustomProfile?.agentPersonality,
          },
          languages: ["en"],
          evaluationCriteria: hrAgentController.getEvaluationCriteria(
            agent.role
          ),
        },

        // Governance and Compliance
        governance: {
          permissions: {
            evaluate: true,
            communicate: true,
            collaborate: true,
            dataAccess: "evaluation_only",
            networkParticipation: "consensus_messaging",
          },
          restrictions: {
            personalDataStorage: false,
            crossNetworkCommunication: false,
            unauthorizedAccess: false,
            scopeLimitation: "talent_evaluation_only",
          },
          compliance: {
            standards: ["HCS-11", "ISO-27001", "GDPR"],
            dataRetention: "evaluation_session_only",
            auditLog: true,
            privacy: "by_design",
          },
          authorization: {
            registeredBy: agent.hederaAccountId,
            authorizedScopes: ["hr_evaluation", "candidate_assessment"],
            validUntil: new Date(
              Date.now() + 365 * 24 * 60 * 60 * 1000
            ).toISOString(), // 1 year
          },
        },

        // Metadata and Versioning
        metadata: {
          creator: "TalentAI_System",
          purpose:
            "Autonomous HR agent for talent evaluation and candidate assessment",
          category: "hr_validation_agent",
          tags: [
            "ai_agent",
            "hr_evaluation",
            "talent_assessment",
            agent.avatarName,
          ],
          version: "1.0.0",
          schemaVersion: "hcs-11-v1.0",
          lastUpdated: timestamp,
          checksum: hrAgentController.generateProfileChecksum(agent),
          documentationUrl: "https://docs.talentai.bid/agents/hcs-11",
        },

        // Profile Hash and Integrity
        integrity: {
          profileHash: null, // Will be calculated after profile creation
          signatureChain: [],
          verificationStatus: "pending",
        },
      };

      // Calculate profile hash for integrity
      hcs11Profile.integrity.profileHash =
        hrAgentController.calculateProfileHash(hcs11Profile);

      // Step 4: Deploy profile using HCS-11 standard message format
      console.log(`      📝 Deploying HCS-11 profile to network...`);
      try {
        const deploymentMessage = {
          p: "hcs-11",
          op: "deploy",
          type: "agent_profile",
          timestamp: timestamp,
          agentId: profileId,
          profile: hcs11Profile,
          deployment: {
            deployedBy: agent.hederaAccountId,
            deploymentId: `deploy_${Date.now()}`,
            status: "active",
            network: process.env.HEDERA_NETWORK || "testnet",
            consensusRequired: true,
          },
          m: `HCS-11 agent profile deployment for ${agent.role} validation agent`,
        };

        const deploymentResult = await hcs10Client.sendMessage(
          inboundTopicId,
          JSON.stringify(deploymentMessage)
        );

        console.log(
          `      ✅ Profile deployed with consensus message ID: ${deploymentResult.toString()}`
        );

        // Step 5: Send profile registration to outbound topic for network discovery
        const registrationMessage = {
          p: "hcs-11",
          op: "register",
          type: "agent_announcement",
          timestamp: new Date().toISOString(),
          agentId: profileId,
          announcement: {
            name: agent.name,
            role: agent.role,
            capabilities: hcs11Profile.capabilities.core,
            inboundTopic: inboundTopicId,
            outboundTopic: outboundTopicId,
            status: "online",
            discoverable: true,
          },
          m: `Agent registration announcement for network discovery`,
        };

        await hcs10Client.sendMessage(
          outboundTopicId,
          JSON.stringify(registrationMessage)
        );

        console.log(`      📡 Agent registered for network discovery`);

        return {
          success: true,
          profile: hcs11Profile,
          inboundTopicId: inboundTopicId,
          outboundTopicId: outboundTopicId,
          deploymentMessageId: deploymentResult.toString(),
          profileId: profileId,
          integrity: hcs11Profile.integrity,
        };
      } catch (deploymentError) {
        console.error(
          `      ❌ Failed to deploy profile: ${deploymentError.message}`
        );

        // Return success with topics but note deployment failure
        return {
          success: true,
          profile: hcs11Profile,
          inboundTopicId: inboundTopicId,
          outboundTopicId: outboundTopicId,
          message: `Topics created but profile deployment failed: ${deploymentError.message}`,
          profileId: profileId,
        };
      }
    } catch (error) {
      console.error(
        `      💥 HCS-11 profile creation failed: ${error.message}`
      );
      return {
        success: false,
        error: error.message,
        profile: null,
        inboundTopicId: null,
        outboundTopicId: null,
      };
    }
  },

  /**
   * Get agent specialization details based on role
   */
  getAgentSpecialization(role) {
    const specializations = {
      "Soft Skills Specialist": {
        focus: "interpersonal_skills",
        expertise: [
          "communication",
          "teamwork",
          "emotional_intelligence",
          "leadership",
        ],
        evaluationCriteria: [
          "collaboration",
          "adaptability",
          "problem_solving",
        ],
      },
      "Technical Skills Evaluator": {
        focus: "technical_competence",
        expertise: [
          "programming",
          "system_design",
          "technical_architecture",
          "code_quality",
        ],
        evaluationCriteria: ["technical_depth", "innovation", "best_practices"],
      },
      "Experience Validator": {
        focus: "professional_background",
        expertise: [
          "work_history",
          "achievements",
          "career_progression",
          "industry_knowledge",
        ],
        evaluationCriteria: ["relevance", "growth", "accomplishments"],
      },
      "Cultural Fit Assessor": {
        focus: "organizational_alignment",
        expertise: [
          "values_alignment",
          "team_dynamics",
          "company_culture",
          "behavioral_fit",
        ],
        evaluationCriteria: [
          "cultural_match",
          "team_integration",
          "value_alignment",
        ],
      },
      "Leadership Potential Evaluator": {
        focus: "leadership_capabilities",
        expertise: [
          "strategic_thinking",
          "team_management",
          "decision_making",
          "vision",
        ],
        evaluationCriteria: [
          "leadership_style",
          "influence",
          "strategic_thinking",
        ],
      },
      "Communication Skills Specialist": {
        focus: "communication_effectiveness",
        expertise: [
          "verbal_communication",
          "written_communication",
          "presentation_skills",
          "active_listening",
        ],
        evaluationCriteria: ["clarity", "persuasion", "engagement"],
      },
    };

    return (
      specializations[role] || {
        focus: "general_evaluation",
        expertise: ["assessment", "evaluation", "feedback"],
        evaluationCriteria: ["competence", "performance", "potential"],
      }
    );
  },

  /**
   * Get all HR agents
   */
  async getAllAgents(req, res) {
    try {
      const agents = await AgentModel.find().select("-hederaPrivateKey");

      res.status(200).json({
        success: true,
        data: agents,
      });
    } catch (error) {
      console.error("Error fetching HR agents:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  /**
   * Get agent by avatar name
   */
  async getAgentByAvatar(req, res) {
    try {
      const { avatarName } = req.params;

      const agent = await AgentModel.findOne({ avatarName }).select(
        "-hederaPrivateKey"
      );

      if (!agent) {
        return res.status(404).json({
          success: false,
          message: "Agent not found",
        });
      }

      res.status(200).json({
        success: true,
        data: agent,
      });
    } catch (error) {
      console.error("Error fetching agent by avatar:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  /**
   * Get agents by role
   */
  async getAgentsByRole(req, res) {
    try {
      const { role } = req.params;

      const agents = await AgentModel.find({ role }).select(
        "-hederaPrivateKey"
      );

      res.status(200).json({
        success: true,
        data: agents,
      });
    } catch (error) {
      console.error("Error fetching agents by role:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  /**
   * Get agents by company
   */
  async getAgentsByCompany(req, res) {
    try {
      const companyId = req.user._id;

      // Récupérer les agents
      const agents = await AgentModel.find(
        { Company: companyId },
        { _id: 1, name: 1, postId: 1 }
      )
        .populate({ path: "postId", select: "jobDetails user" })
        .lean();

      if (!agents || agents.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          message: "Aucun agent trouvé pour cette société",
        });
      }

      // Paralléliser le calcul des matches par agent (protection par agent)
      const agentTasks = agents.map(async (agent) => {
        const agentLabel = agent.name || String(agent._id);

        if (!agent.postId?._id) {
          return {
            agentId: agent._id,
            name: agentLabel,
            matches: [],
            message: "Pas de post associé",
          };
        }

        try {
          const { jobTitle, matches } = await computeMatches(agent.postId._id, companyId);
          return {
            agentId: agent._id,
            name: agentLabel,
            jobTitle,
            matches,
          };
        } catch (err) {
          console.error(`Error computing matches for agent ${agent._id}:`, err);
          return {
            agentId: agent._id,
            name: agentLabel,
            matches: [],
            message: 'Erreur lors du calcul des matches',
          };
        }
      });

      const agentsWithMatches = await Promise.all(agentTasks);
      const totalMatches = agentsWithMatches.reduce((sum, a) => sum + (a.matches?.length || 0), 0);

      // Réponse JSON complète
      return res.status(200).json({
        success: true,
        companyId,
        totalAgents: agents.length,
        totalMatches,
        agents: agentsWithMatches,
      });
    } catch (error) {
      console.error("Error fetching agents by company:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  /**
   * Create a new HR agent
   */
  async createAgent(req, res) {
    try {
      // Check if user has admin role
      //   if (req.user.role !== 'admin') {
      //     return res.status(403).json({
      //       success: false,
      //       message: 'Access denied. Admin role required.'
      //     });
      //   }

      const { name, avatarName, role, description } = req.body;

      // Validate required fields
      if (!name || !avatarName || !role) {
        return res.status(400).json({
          success: false,
          message: "Name, avatarName, and role are required",
        });
      }

      // Check if agent with same name or avatar already exists
      const existingAgent = await AgentModel.findOne({
        $or: [{ name }, { avatarName }],
      });

      if (existingAgent) {
        return res.status(400).json({
          success: false,
          message: "Agent with this name or avatar already exists",
        });
      }

      console.log(`Creating Hedera wallet for agent: ${name}`);

      // Create Hedera wallet for this agent
      const hederaWallet = await createHederaWallet();

      const newAgent = new AgentModel({
        name,
        avatarName,
        role,
        description,
        isActive: true,
        createdAt: new Date(),
        hederaAccountId: hederaWallet.accountId,
        hederaPrivateKey: hederaWallet.privkey,
        hederaPublicKey: hederaWallet.pubkey,
        // Legacy fields for backwards compatibility
        accountId: hederaWallet.accountId,
        privkey: hederaWallet.privkey,
        pubkey: hederaWallet.pubkey,
      });

      const savedAgent = await newAgent.save();

      // Remove private key from response for security
      const agentResponse = savedAgent.toObject();
      delete agentResponse.hederaPrivateKey;
      delete agentResponse.privkey;

      res.status(201).json({
        success: true,
        message: "HR agent created successfully",
        data: agentResponse,
      });
    } catch (error) {
      console.error("Error creating HR agent:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  /**
   * Create agent-specific Hedera toolkit
   */
  async createAgentToolkit(agentId) {
    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      throw new Error("Agent not found");
    }

    const agentClient = Client.forTestnet().setOperator(
      agent.hederaAccountId,
      PrivateKey.fromStringDer(agent.hederaPrivateKey)
    );

    const toolkit = new HederaLangchainToolkit({
      client: agentClient,
      configuration: {
        tools: ["create_topic_tool", "submit_topic_message_tool"],
        plugins: [coreConsensusPlugin],
        context: { mode: AgentMode.AUTONOMOUS },
      },
    });

    return { agent, toolkit };
  },

  /**
   * Send validation message using any agent with HCS-10 standards
   * This creates an agent-to-agent conversation about candidate evaluation
   */
  async sendValidationMessage(req, res) {
    try {
      const {
        candidateId,
        evaluationResult,
        interviewNotes,
        topicId,
        agentId,
      } = req.body;

      if (!candidateId || !evaluationResult || !topicId || !agentId) {
        return res.status(400).json({
          error:
            "candidateId, evaluationResult, topicId, and agentId are required",
        });
      }

      // Get the sending agent
      const sendingAgent = await AgentModel.findById(agentId);
      if (!sendingAgent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      // Initialize HCS10Client for the agent
      const hcs10Client = new HCS10Client({
        network: "testnet",
        operatorId: sendingAgent.hederaAccountId,
        operatorPrivateKey: sendingAgent.hederaPrivateKey,
        guardedRegistryBaseUrl:
          process.env.REGISTRY_URL || "https://moonscape.tech",
        prettyPrint: true,
        logLevel: "debug",
      });

      // Create HCS-11 compliant evaluation message
      const hcs11Message = {
        standard: "HCS-11",
        type: "agent_evaluation",
        timestamp: new Date().toISOString(),
        agentProfile: {
          name: sendingAgent.name,
          avatar: sendingAgent.avatarName,
          role: sendingAgent.role,
          accountId: sendingAgent.hederaAccountId,
        },
        evaluation: {
          candidateId: candidateId,
          passed: evaluationResult.passed,
          score: evaluationResult.score,
          feedback: evaluationResult.feedback,
          interviewNotes: interviewNotes,
        },
        conversationalPrompt: `🎯 ${sendingAgent.role.toUpperCase()} EVALUATION COMPLETE
        
Candidate: ${candidateId}
Overall Assessment: ${
          evaluationResult.passed ? "✅ APPROVED" : "❌ NEEDS IMPROVEMENT"
        }
Score: ${evaluationResult.score}/100

📊 Key Findings:
${evaluationResult.feedback}

🗣️ Interview Insights:
${interviewNotes}

💡 Recommendation: ${
          evaluationResult.passed
            ? "This candidate demonstrates excellent abilities and would be a great fit for the team."
            : "This candidate needs development before proceeding."
        }

@Coordinator: Please review and provide your assessment. What are your thoughts on this evaluation?`,
      };

      // Send message using HCS-10 standards
      const messageResult = await hcs10Client.sendMessage(
        topicId,
        JSON.stringify(hcs11Message)
      );

      // Extract message ID
      const messageId = messageResult.toString();

      // Update evaluation topic in database
      const evaluationTopic = await EvaluationTopicModel.findOne({ topicId });
      if (evaluationTopic) {
        evaluationTopic.evaluations.push({
          agentId: sendingAgent._id,
          agentName: sendingAgent.name,
          agentRole: sendingAgent.role,
          messageId: messageId,
          evaluation: evaluationResult,
          timestamp: new Date(),
        });
        await evaluationTopic.save();
      }

      // Start automatic monitoring for coordinator response
      this.startAgentCommunicationMonitoring(
        topicId,
        sendingAgent._id,
        candidateId
      );

      res.json({
        success: true,
        message: `${sendingAgent.name}'s validation message sent successfully`,
        messageId: messageId,
        topicId: topicId,
        agentName: sendingAgent.name,
        evaluation: evaluationResult,
        hcs11Compliant: true,
      });
    } catch (error) {
      console.error("Error sending validation message:", error);
      res.status(500).json({
        error: "Failed to send validation message",
        details: error.message,
      });
    }
  },

  /**
   * Agent-to-Agent bidding system with HCS-10/HCS-11 messaging
   * Agent A sends bid message to Agent B via Hedera blockchain, Agent B responds and stores in database
   */
  async submitEvaluationMessage(req, res) {
    try {
      const {
        agentAId,
        agentBId,
        candidateId,
        postId,
        message,
        bidAmount,
        bidMessage,
      } = req.body;

      if (!agentAId || !agentBId || !candidateId) {
        return res.status(400).json({
          error: "agentAId, agentBId, and candidateId are required",
        });
      }

      // Get both agents with their HCS-11 profiles
      const agentA = await AgentModel.findById(agentAId);
      const agentB = await AgentModel.findById(agentBId);

      if (!agentA || !agentB) {
        return res.status(404).json({ error: "One or both agents not found" });
      }

      // Fetch HCS-11 profiles from Hedera network to get latest topic information
      console.log(
        `🔍 Fetching HCS-11 profiles from network to ensure topic availability...`
      );

      // Function to fetch and update agent profile with topic IDs
      const fetchAndUpdateAgentProfile = async (agent) => {
        try {
          console.log(
            `📡 Fetching HCS-11 profile for ${agent.name} (${agent.hederaAccountId})`
          );

          const client = new HCS11Client({
            network:
              process.env.HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet",
            auth: {
              operatorId: agent.hederaAccountId,
              privateKey: agent.hederaPrivateKey,
            },
            logLevel: "info",
          });

          // Fetch profile from network
          const profileResult = await client.fetchProfileByAccountId(
            agent.hederaAccountId,
            process.env.HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet"
          );

          if (profileResult.success && profileResult.profile) {
            console.log(`✅ Profile retrieved for ${agent.name}`);

            // Parse profile to extract topic information
            let parsedProfile = profileResult.profile;
            if (typeof profileResult.profile === "string") {
              try {
                parsedProfile = client.parseProfileFromString(
                  profileResult.profile
                );
              } catch (parseError) {
                console.log(
                  `⚠️ Could not parse profile: ${parseError.message}`
                );
              }
            }

            // Extract topic IDs from profile
            let inboundTopicId = agent.inboundTopicId;
            let outboundTopicId = agent.outboundTopicId;

            if (parsedProfile && typeof parsedProfile === "object") {
              // Try to extract from parsed profile
              if (parsedProfile.inboundTopicId) {
                inboundTopicId = parsedProfile.inboundTopicId;
                console.log(
                  `📥 Found inbound topic in profile: ${inboundTopicId}`
                );
              }
              if (parsedProfile.outboundTopicId) {
                outboundTopicId = parsedProfile.outboundTopicId;
                console.log(
                  `📤 Found outbound topic in profile: ${outboundTopicId}`
                );
              }
            }

            // Update agent in database if we have new topic information
            if (
              (inboundTopicId && inboundTopicId !== agent.inboundTopicId) ||
              (outboundTopicId && outboundTopicId !== agent.outboundTopicId)
            ) {
              console.log(
                `📝 Updating ${agent.name} with topic IDs from profile`
              );
              await AgentModel.findByIdAndUpdate(agent._id, {
                inboundTopicId: inboundTopicId || agent.inboundTopicId,
                outboundTopicId: outboundTopicId || agent.outboundTopicId,
                hcs11ProfileTopicId:
                  profileResult.profileTopicId || agent.hcs11ProfileTopicId,
                lastProfileFetch: new Date(),
              });

              // Update local agent object
              agent.inboundTopicId = inboundTopicId || agent.inboundTopicId;
              agent.outboundTopicId = outboundTopicId || agent.outboundTopicId;
              agent.hcs11ProfileTopicId =
                profileResult.profileTopicId || agent.hcs11ProfileTopicId;
            }

            return {
              success: true,
              inboundTopicId: inboundTopicId,
              outboundTopicId: outboundTopicId,
              profileTopicId: profileResult.profileTopicId,
            };
          } else {
            console.log(
              `❌ No profile found for ${agent.name}: ${
                profileResult.error || "Profile not found"
              }`
            );
            return {
              success: false,
              error: profileResult.error || "Profile not found on network",
            };
          }
        } catch (error) {
          console.error(
            `❌ Error fetching profile for ${agent.name}: ${error.message}`
          );
          return {
            success: false,
            error: error.message,
          };
        }
      };

      // Fetch profiles for both agents
      const [agentAProfile, agentBProfile] = await Promise.all([
        fetchAndUpdateAgentProfile(agentA),
        fetchAndUpdateAgentProfile(agentB),
      ]);

      // Validate agents have HCS-10 topics after profile fetch
      if (!agentA.inboundTopicId || !agentA.outboundTopicId) {
        return res.status(400).json({
          error: `Agent A (${agentA.name}) missing HCS-10 topics even after profile fetch.`,
          profileFetchResult: agentAProfile,
          solution:
            "Please run POST /hr-agents/initialize to create proper agent profiles with topics",
        });
      }

      if (!agentB.inboundTopicId || !agentB.outboundTopicId) {
        return res.status(400).json({
          error: `Agent B (${agentB.name}) missing HCS-10 topics even after profile fetch.`,
          profileFetchResult: agentBProfile,
          solution:
            "Please run POST /hr-agents/initialize to create proper agent profiles with topics",
        });
      }

      console.log(`✅ Both agents have required HCS-10 topics:`);

      console.log(
        `🤖 Starting HCS-10/HCS-11 agent messaging between ${agentA.name} and ${agentB.name}`
      );
      console.log(`📡 Using Hedera network profiles for communication`);
      console.log(
        `📥 Agent A Inbound: ${agentA.inboundTopicId} | 📤 Outbound: ${agentA.outboundTopicId}`
      );
      console.log(
        `📥 Agent B Inbound: ${agentB.inboundTopicId} | 📤 Outbound: ${agentB.outboundTopicId}`
      );

      // Start timing the conversation
      const conversationStartTime = Date.now();

      // Initialize HCS10 clients for both agents
      const agentAHCS10 = new HCS10Client({
        network: "testnet",
        operatorId: agentA.hederaAccountId,
        operatorPrivateKey: agentA.hederaPrivateKey,
        guardedRegistryBaseUrl:
          process.env.REGISTRY_URL || "https://moonscape.tech",
        prettyPrint: false,
        logLevel: "info",
      });

      const agentBHCS10 = new HCS10Client({
        network: "testnet",
        operatorId: agentB.hederaAccountId,
        operatorPrivateKey: agentB.hederaPrivateKey,
        guardedRegistryBaseUrl:
          process.env.REGISTRY_URL || "https://moonscape.tech",
        prettyPrint: false,
        logLevel: "info",
      });

      // Initialize LangChain agents for AI-powered responses
      let agentALangChain, agentBLangChain;

      try {
        agentALangChain = new LangChainTogetherAIAgent({
          accountId: agentA.hederaAccountId,
          privateKey: agentA.hederaPrivateKey,
          network: "testnet",
          operationalMode: "standard",
          verbose: false,
          skipProfileValidation: true,
        });
        await agentALangChain.initialize();
        console.log(`✅ Agent A (${agentA.name}) LangChain initialized`);
      } catch (error) {
        console.log(
          `⚠️  Agent A LangChain failed, using fallback: ${error.message}`
        );
        agentALangChain = {
          processMessage: async (prompt) => ({
            response: `Bidding amount ${finalBidAmount} for candidate ${candidateId} of the post ${
              postId || "N/A"
            }`,
            success: true,
            metadata: { provider: "fallback-mode" },
          }),
        };
      }

      try {
        agentBLangChain = new LangChainTogetherAIAgent({
          accountId: agentB.hederaAccountId,
          privateKey: agentB.hederaPrivateKey,
          network: "testnet",
          operationalMode: "standard",
          verbose: false,
          skipProfileValidation: true,
        });
        await agentBLangChain.initialize();
        console.log(`✅ Agent B (${agentB.name}) LangChain initialized`);
      } catch (error) {
        console.log(
          `⚠️  Agent B LangChain failed, using fallback: ${error.message}`
        );
        agentBLangChain = {
          processMessage: async (prompt) => ({
            response: `Your bid is stored`,
            success: true,
            metadata: { provider: "fallback-mode" },
          }),
        };
      }

      // Display conversation header
      const finalBidAmount =
        bidAmount && !isNaN(bidAmount) ? parseFloat(bidAmount) : 1000.0;
      console.log("\n" + "=".repeat(80));
      console.log(`🗣️  HCS-10/HCS-11 BIDDING SIMULATION STARTING`);
      console.log(`👥 Participants: ${agentA.name} → ${agentB.name}`);
      console.log(`🎯 Topic: Candidate ${candidateId} Evaluation`);
      console.log(`💰 Bid Amount: $${finalBidAmount}`);
      console.log(`📅 Started: ${new Date().toLocaleString()}`);
      console.log("=".repeat(80));

      // STEP 1: Agent A generates and sends bid message to Agent B's inbound topic
      console.log(`\n💬 STEP 1: ${agentA.name} composing bid message...`);

      // Agent A (Company Agent) sends exact bid message
      const exactBidMessage = `Bid amount ${finalBidAmount} for candidate ${candidateId} for post ${
        postId || "N/A"
      }`;
      const agentAResponse = { response: exactBidMessage }; // Direct message, no AI processing needed

      // Create HCS-11 compliant message structure
      const hcs11MessageFromA = {
        standard: "HCS-11",
        version: "1.0.0",
        type: "agent_evaluation_message",
        timestamp: new Date().toISOString(),
        messageId: `msg_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,

        // Sender profile information
        from: {
          agentId: agentA._id.toString(),
          name: agentA.name,
          avatarName: agentA.avatarName,
          role: agentA.role,
          hederaAccountId: agentA.hederaAccountId,
          profileTopicId: agentA.hcs11ProfileTopicId,
          outboundTopicId: agentA.outboundTopicId,
        },

        // Recipient profile information
        to: {
          agentId: agentB._id.toString(),
          name: agentB.name,
          avatarName: agentB.avatarName,
          role: agentB.role,
          hederaAccountId: agentB.hederaAccountId,
          profileTopicId: agentB.hcs11ProfileTopicId,
          inboundTopicId: agentB.inboundTopicId,
        },

        // Message content
        content: {
          subject: `Candidate ${candidateId} Bid Submission`,
          message: agentAResponse.response,
          candidateId: candidateId,
          postId: postId,
          evaluationType: agentA.role,
          bidAmount: finalBidAmount,
          currency: "USD",
          bidType: "candidate_evaluation",
          priority: "normal",
          requiresResponse: true,
        },

        // Metadata
        metadata: {
          conversationId: `bid_conv_${Date.now()}`,
          protocol: "hcs-10",
          messageFormat: "agent_bid_message",
          platform: "talentai_bidding",
        },
      };

      // Send message from Agent A to Agent B's inbound topic
      console.log(
        `📤 Sending message to ${agentB.name}'s inbound topic: ${agentB.inboundTopicId}`
      );
      const messageToB = await agentAHCS10.sendMessage(
        agentB.inboundTopicId,
        JSON.stringify(hcs11MessageFromA)
      );

      console.log(`✅ Message sent! Message ID: ${messageToB.toString()}`);
      console.log(`💭 "${agentAResponse.response}"`);

      // Wait a moment for message propagation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // STEP 2: Agent B (Master Agent) receives bid message and stores in database FIRST
      console.log(
        `\n💬 STEP 2: ${agentB.name} (Master Agent) storing bid in database...`
      );

      // Store bid in database BEFORE responding
      let agentBResponse;

      try {
        // Find or create evaluation topic for this bid
        let evaluationTopic = await EvaluationTopicModel.findOne({
          candidateId: candidateId,
          postId: postId,
        });

        if (!evaluationTopic) {
          // Create new evaluation topic with all required fields
          evaluationTopic = new EvaluationTopicModel({
            topicId: `bid_topic_${candidateId}_${Date.now()}`,
            company: "TalentAI Bidding System",
            postId: postId || `bid_post_${candidateId}`,
            candidateName: `Candidate_${candidateId}`,
            candidateId: candidateId,
            topicMemo: `Bidding topic for candidate ${candidateId} on post ${
              postId || "N/A"
            }`,
            status: "active",
            createdBy: agentB.name,
            evaluations: [],
            createdAt: new Date(),
          });
        }

        // Store the bid as an evaluation record
        evaluationTopic.evaluations.push({
          agentId: agentA._id,
          agentName: agentA.name,
          agentRole: agentA.role,
          messageId: hcs11MessageFromA.messageId,
          hederaMessageId: messageToB.toString(),
          evaluation: {
            passed: null,
            score: finalBidAmount, // Store bid amount as score
            feedback: agentAResponse.response,
            interviewNotes: `Bid received: ${finalBidAmount} for candidate ${candidateId} on post ${
              postId || "N/A"
            }`,
            messageType: "bid_message",
            bidAmount: finalBidAmount,
            currency: "USD",
            postId: postId,
            storedByMasterAgent: agentB.name,
          },
          timestamp: new Date(),
        });

        await evaluationTopic.save();
        console.log(
          `✅ Bid stored successfully in database by ${agentB.name} (Master Agent)`
        );

        // STEP 3: Now Master Agent responds with exact message
        agentBResponse = { response: "Bid successfully stored" }; // Exact response message
      } catch (dbError) {
        console.error(`❌ Database storage error: ${dbError.message}`);
        agentBResponse = { response: "Bid storage failed" };
      }

      // Create response message from Agent B to Agent A
      const hcs11ResponseFromB = {
        standard: "HCS-11",
        version: "1.0.0",
        type: "agent_response_message",
        timestamp: new Date().toISOString(),
        messageId: `msg_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        inReplyTo: hcs11MessageFromA.messageId,

        // Sender (Agent B)
        from: {
          agentId: agentB._id.toString(),
          name: agentB.name,
          avatarName: agentB.avatarName,
          role: agentB.role,
          hederaAccountId: agentB.hederaAccountId,
          profileTopicId: agentB.hcs11ProfileTopicId,
          outboundTopicId: agentB.outboundTopicId,
        },

        // Recipient (Agent A)
        to: {
          agentId: agentA._id.toString(),
          name: agentA.name,
          avatarName: agentA.avatarName,
          role: agentA.role,
          hederaAccountId: agentA.hederaAccountId,
          profileTopicId: agentA.hcs11ProfileTopicId,
          inboundTopicId: agentA.inboundTopicId,
        },

        // Response content
        content: {
          subject: `Re: Candidate ${candidateId} Evaluation`,
          message: agentBResponse.response,
          candidateId: candidateId,
          responseType: agentB.role,
          originalMessage: hcs11MessageFromA.content.message,
        },

        // Metadata
        metadata: {
          conversationId: hcs11MessageFromA.metadata.conversationId,
          protocol: "hcs-10",
          messageFormat: "agent_response",
          platform: "talentai",
        },
      };

      // Send response from Agent B to Agent A's inbound topic
      console.log(
        `📤 Sending response to ${agentA.name}'s inbound topic: ${agentA.inboundTopicId}`
      );
      const responseToA = await agentBHCS10.sendMessage(
        agentA.inboundTopicId,
        JSON.stringify(hcs11ResponseFromB)
      );

      console.log(`✅ Response sent! Message ID: ${responseToA.toString()}`);
      console.log(`💭 "${agentBResponse.response}"`);

      // Display conversation summary
      console.log(
        "\n" +
          "🔄 HCS-10/HCS-11 CONVERSATION SUMMARY "
            .padStart(50, "=")
            .padEnd(80, "=")
      );
      console.log(
        `1️⃣  ${agentA.name} → ${agentB.name}: "${agentAResponse.response}"`
      );
      console.log(
        `   📡 Sent to: ${
          agentB.inboundTopicId
        } | Message ID: ${messageToB.toString()}`
      );
      console.log(
        `2️⃣  ${agentB.name} → ${agentA.name}: "${agentBResponse.response}"`
      );
      console.log(
        `   📡 Sent to: ${
          agentA.inboundTopicId
        } | Message ID: ${responseToA.toString()}`
      );
      console.log("=".repeat(80));

      // Create conversation record
      const conversationRecord = {
        conversationId: hcs11MessageFromA.metadata.conversationId,
        type: "hcs-10-messaging",
        participants: [
          {
            agentId: agentA._id,
            name: agentA.name,
            role: agentA.role,
            hederaAccountId: agentA.hederaAccountId,
            profileTopicId: agentA.hcs11ProfileTopicId,
            inboundTopicId: agentA.inboundTopicId,
            outboundTopicId: agentA.outboundTopicId,
          },
          {
            agentId: agentB._id,
            name: agentB.name,
            role: agentB.role,
            hederaAccountId: agentB.hederaAccountId,
            profileTopicId: agentB.hcs11ProfileTopicId,
            inboundTopicId: agentB.inboundTopicId,
            outboundTopicId: agentB.outboundTopicId,
          },
        ],
        messages: [
          {
            messageId: hcs11MessageFromA.messageId,
            from: agentA.name,
            to: agentB.name,
            message: agentAResponse.response,
            timestamp: new Date(),
            role: agentA.role,
            topicId: agentB.inboundTopicId,
            hederaMessageId: messageToB.toString(),
            type: "evaluation",
          },
          {
            messageId: hcs11ResponseFromB.messageId,
            from: agentB.name,
            to: agentA.name,
            message: agentBResponse.response,
            timestamp: new Date(),
            role: agentB.role,
            topicId: agentA.inboundTopicId,
            hederaMessageId: responseToA.toString(),
            type: "response",
            inReplyTo: hcs11MessageFromA.messageId,
          },
        ],
        candidateId: candidateId,
        protocol: "hcs-10/hcs-11",
        completed: true,
        createdAt: new Date(),
      };

      // Update evaluation topic with HCS-10 message records
      const evaluationTopic = await EvaluationTopicModel.findOne({
        $or: [
          { topicId: agentA.inboundTopicId },
          { topicId: agentB.inboundTopicId },
          { candidateId: candidateId },
        ],
      });

      if (evaluationTopic) {
        // Add HCS-10 bid message records
        evaluationTopic.evaluations.push({
          agentId: agentA._id,
          agentName: agentA.name,
          agentRole: agentA.role,
          messageId: hcs11MessageFromA.messageId,
          hederaMessageId: messageToB.toString(),
          evaluation: {
            passed: null,
            score: finalBidAmount, // Using bid amount as score for reference
            feedback: agentAResponse.response,
            interviewNotes: `Bid submitted via HCS-10: $${finalBidAmount} for candidate ${candidateId}`,
            messageType: "agent_bid_message",
            bidAmount: finalBidAmount,
            currency: "USD",
            sentToTopic: agentB.inboundTopicId,
          },
          timestamp: new Date(),
        });

        evaluationTopic.evaluations.push({
          agentId: agentB._id,
          agentName: agentB.name,
          agentRole: agentB.role,
          messageId: hcs11ResponseFromB.messageId,
          hederaMessageId: responseToA.toString(),
          evaluation: {
            passed: null,
            score: null,
            feedback: agentBResponse.response,
            interviewNotes: `Bid acknowledgment via HCS-10: Received $${finalBidAmount} bid from ${agentA.name}`,
            messageType: "agent_bid_acknowledgment",
            receivedBidAmount: finalBidAmount,
            currency: "USD",
            sentToTopic: agentA.inboundTopicId,
            inReplyTo: hcs11MessageFromA.messageId,
          },
          timestamp: new Date(),
        });

        evaluationTopic.status = "active"; // Keep as active for bidding process
        await evaluationTopic.save();

        // Log successful database storage
        console.log(`💾 Bid information stored in database successfully`);
        console.log(`📊 Evaluation Topic ID: ${evaluationTopic._id}`);
        console.log(
          `💰 Bid Amount: $${finalBidAmount} recorded in evaluation records`
        );
      } else {
        // Create new evaluation topic if none exists
        const newEvaluationTopic = new EvaluationTopicModel({
          topicId: `bid_topic_${candidateId}_${Date.now()}`,
          company: "TalentAI Bidding System",
          postId: `bid_post_${candidateId}`,
          candidateName: `Candidate_${candidateId}`,
          candidateId: candidateId,
          topicMemo: `Bidding topic for candidate ${candidateId} via HCS-10/HCS-11 messaging`,
          status: "active",
          createdBy: agentA.name,
          evaluations: [
            {
              agentId: agentA._id,
              agentName: agentA.name,
              agentRole: agentA.role,
              messageId: hcs11MessageFromA.messageId,
              hederaMessageId: messageToB.toString(),
              evaluation: {
                passed: null,
                score: finalBidAmount,
                feedback: agentAResponse.response,
                interviewNotes: `Bid submitted via HCS-10: $${finalBidAmount}`,
                messageType: "agent_bid_message",
                bidAmount: finalBidAmount,
                currency: "USD",
              },
              timestamp: new Date(),
            },
          ],
          createdAt: new Date(),
        });

        await newEvaluationTopic.save();
        console.log(
          `💾 New evaluation topic created and bid stored: ${newEvaluationTopic._id}`
        );
      }

      // Display completion status
      console.log(
        "\n" +
          "✅ HCS-10/HCS-11 BIDDING COMPLETED "
            .padStart(50, "=")
            .padEnd(80, "=")
      );
      console.log(`🎉 Agent-to-agent bidding completed successfully!`);
      console.log(
        `   💰 ${agentA.name} → ${agentB.name}: Bid of $${finalBidAmount} sent to ${agentB.inboundTopicId}`
      );
      console.log(
        `   💾 ${agentB.name} → ${agentA.name}: Acknowledgment sent to ${agentA.inboundTopicId} & stored in database`
      );
      console.log(`📊 Messages exchanged: 2 (via Hedera network)`);
      console.log(`🎯 Candidate: ${candidateId}`);
      console.log(`💰 Bid Amount: $${finalBidAmount}`);
      console.log(
        `⏱️  Duration: ${((Date.now() - conversationStartTime) / 1000).toFixed(
          1
        )}s`
      );
      console.log(
        `🔗 Protocol: HCS-10 messaging with HCS-11 profiles + Database Storage`
      );
      console.log(`💾 Conversation ID: ${conversationRecord.conversationId}`);
      console.log("=".repeat(80) + "\n");

      res.json({
        success: true,
        message: "HCS-10/HCS-11 bidding simulation completed successfully",
        protocol: "hcs-10/hcs-11-bidding",
        conversation: conversationRecord,
        messaging: {
          agentA: {
            id: agentA._id,
            name: agentA.name,
            role: agentA.role,
            hederaAccountId: agentA.hederaAccountId,
            profileTopicId: agentA.hcs11ProfileTopicId,
            message: agentAResponse.response,
            sentTo: agentB.inboundTopicId,
            hederaMessageId: messageToB.toString(),
          },
          agentB: {
            id: agentB._id,
            name: agentB.name,
            role: agentB.role,
            hederaAccountId: agentB.hederaAccountId,
            profileTopicId: agentB.hcs11ProfileTopicId,
            message: agentBResponse.response,
            sentTo: agentA.inboundTopicId,
            hederaMessageId: responseToA.toString(),
          },
        },
        candidateId: candidateId,
        biddingDetails: {
          bidAmount: finalBidAmount,
          currency: "USD",
          bidderAgent: agentA.name,
          receiverAgent: agentB.name,
          storedInDatabase: true,
        },
        networkMessages: {
          bidMessageFromA: hcs11MessageFromA,
          acknowledgmentFromB: hcs11ResponseFromB,
        },
        conversationCompleted: true,
        biddingCompleted: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // Display error in chat format
      console.log(
        "\n" +
          "❌ HCS-10/HCS-11 MESSAGING FAILED ".padStart(40, "=").padEnd(80, "=")
      );
      console.error(`💥 Error during agent messaging:`);
      console.error(`🔍 Error Type: ${error.name}`);
      console.error(`📝 Error Message: ${error.message}`);
      console.error(`🎯 Candidate: ${req.body.candidateId || "Unknown"}`);
      console.error(
        `👥 Agents: ${req.body.agentAId || "Unknown"} ↔️ ${
          req.body.agentBId || "Unknown"
        }`
      );
      console.error(`⏰ Failed at: ${new Date().toLocaleString()}`);

      if (error.message.includes("missing HCS-10 topics")) {
        console.error(
          `🔧 Solution: Run POST /hr-agents/initialize to create agent profiles and topics`
        );
      }

      console.log("=".repeat(80) + "\n");

      res.status(500).json({
        success: false,
        error: "Failed to complete HCS-10/HCS-11 agent messaging",
        details: error.message,
        protocol: "hcs-10/hcs-11",
        troubleshooting: {
          commonIssues: [
            "Agents missing HCS-10 inbound/outbound topics",
            "Invalid Hedera credentials",
            "Network connectivity issues",
            "HCS-11 profile not properly inscribed",
          ],
          solutions: [
            "Run POST /hr-agents/initialize to create topics",
            "Use POST /hr-agents/debug-memo/:agentId to fix profiles",
            "Check Hedera network connectivity",
            "Verify agent credentials",
          ],
        },
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Fix HCS-11 memo for agents to resolve profile validation issues
   */
  async fixAgentMemo(req, res) {
    try {
      const { agentId } = req.params;

      if (!agentId) {
        return res.status(400).json({
          error: "agentId is required",
        });
      }

      // Get agent
      const agent = await AgentModel.findById(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      // Check if agent has proper Hedera configuration
      if (!agent.hederaAccountId || !agent.hederaPrivateKey) {
        return res.status(400).json({
          error: "Agent missing Hedera configuration",
          details: `AccountId: ${
            agent.hederaAccountId ? "Present" : "Missing"
          }, PrivateKey: ${agent.hederaPrivateKey ? "Present" : "Missing"}`,
        });
      }

      console.log(
        `🔧 Fixing HCS-11 memo for agent: ${agent.name} (${agent.hederaAccountId})`
      );

      // Create HCS-11 profile memo using standards SDK
      const profileMemo = hrAgentController.createHCS11ProfileMemo(agent);

      console.log(`🔧 Creating HCS-11 profile memo: ${profileMemo}`);

      // Try to update the account memo using Hedera SDK
      try {
        const {
          Client,
          PrivateKey,
          AccountUpdateTransaction,
        } = require("@hashgraph/sdk");

        const client = Client.forTestnet();
        client.setOperator(
          agent.hederaAccountId,
          PrivateKey.fromString(agent.hederaPrivateKey)
        );

        const accountUpdateTx = new AccountUpdateTransaction()
          .setAccountId(agent.hederaAccountId)
          .setAccountMemo(profileMemo);

        const txResponse = await accountUpdateTx.execute(client);
        const receipt = await txResponse.getReceipt(client);

        if (receipt.status.toString() === "SUCCESS") {
          console.log(`✅ HCS-11 memo updated successfully for ${agent.name}`);

          res.json({
            success: true,
            message: "Agent HCS-11 memo updated successfully",
            agent: {
              id: agent._id,
              name: agent.name,
              accountId: agent.hederaAccountId,
              role: agent.role,
            },
            memo: profileMemo,
            transactionId: txResponse.transactionId.toString(),
          });
        } else {
          throw new Error(
            `Transaction failed with status: ${receipt.status.toString()}`
          );
        }
      } catch (hederaError) {
        console.error(
          `❌ Failed to update Hedera account memo:`,
          hederaError.message
        );

        // Still return success but note the limitation
        res.json({
          success: true,
          message:
            "Agent profile created (memo update skipped due to Hedera limitations)",
          agent: {
            id: agent._id,
            name: agent.name,
            accountId: agent.hederaAccountId,
            role: agent.role,
          },
          memo: profileMemo,
          note: "Account memo update requires account owner permissions. Profile stored locally.",
          hederaError: hederaError.message,
        });
      }
    } catch (error) {
      console.error("Error fixing agent memo:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fix agent memo",
        details: error.message,
      });
    }
  },

  /**
   * Get agent HCS-11 profile details
   */
  async getAgentProfile(req, res) {
    try {
      const { agentId } = req.params;

      if (!agentId) {
        return res.status(400).json({
          error: "agentId is required",
        });
      }

      const agent = await AgentModel.findById(agentId).select(
        "-hederaPrivateKey -privkey"
      );

      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      // Check HCS-11 profile status
      const profileStatus = {
        hasProfile: !!agent.hcs11Profile,
        hasInboundTopic: !!agent.inboundTopicId,
        hasOutboundTopic: !!agent.outboundTopicId,
        isRegistered: !!agent.profileRegistrationId,
        isFullyConfigured: !!(
          agent.hcs11Profile &&
          agent.inboundTopicId &&
          agent.outboundTopicId
        ),
      };

      res.json({
        success: true,
        agent: {
          id: agent._id,
          name: agent.name,
          avatar: agent.avatarName,
          role: agent.role,
          description: agent.description,
          accountId: agent.hederaAccountId,
          publicKey: agent.hederaPublicKey,
          isActive: agent.isActive,
        },
        hcs11Profile: agent.hcs11Profile || null,
        communication: {
          inboundTopicId: agent.inboundTopicId || null,
          outboundTopicId: agent.outboundTopicId || null,
          registrationId: agent.profileRegistrationId || null,
        },
        status: profileStatus,
        recommendations: profileStatus.isFullyConfigured
          ? []
          : [
              !profileStatus.hasProfile &&
                "Run POST /hr-agents/fix-memo/{agentId} to create HCS-11 profile",
              !profileStatus.hasInboundTopic &&
                "Missing inbound topic - reinitialize agent",
              !profileStatus.hasOutboundTopic &&
                "Missing outbound topic - reinitialize agent",
            ].filter(Boolean),
      });
    } catch (error) {
      console.error("Error fetching agent profile:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch agent profile",
        details: error.message,
      });
    }
  },

  /**
   * Get evaluation criteria based on agent role
   */
  getEvaluationCriteria(role) {
    const criteriaMap = {
      "Soft Skills Specialist": {
        primary: [
          "communication_effectiveness",
          "interpersonal_skills",
          "emotional_intelligence",
        ],
        secondary: ["teamwork", "adaptability", "leadership_potential"],
        weightings: { communication: 0.4, interpersonal: 0.3, emotional: 0.3 },
        scoringMethod: "behavioral_assessment",
        benchmarks: ["industry_standard", "role_specific"],
      },
      "Technical Skills Evaluator": {
        primary: ["technical_competence", "problem_solving", "system_design"],
        secondary: ["code_quality", "innovation", "best_practices"],
        weightings: { technical: 0.5, problem_solving: 0.3, design: 0.2 },
        scoringMethod: "technical_assessment",
        benchmarks: ["technology_stack", "experience_level"],
      },
      "Experience Validator": {
        primary: ["relevant_experience", "career_progression", "achievements"],
        secondary: ["industry_knowledge", "leadership_roles", "impact"],
        weightings: { experience: 0.4, progression: 0.3, achievements: 0.3 },
        scoringMethod: "experience_verification",
        benchmarks: ["role_requirements", "industry_standards"],
      },
      "Cultural Fit Assessor": {
        primary: ["values_alignment", "team_dynamics", "cultural_adaptation"],
        secondary: ["communication_style", "work_preferences", "collaboration"],
        weightings: { values: 0.4, dynamics: 0.3, adaptation: 0.3 },
        scoringMethod: "cultural_assessment",
        benchmarks: ["company_culture", "team_values"],
      },
      "Leadership Potential Evaluator": {
        primary: ["strategic_thinking", "team_management", "decision_making"],
        secondary: ["vision", "influence", "change_management"],
        weightings: { strategic: 0.4, management: 0.3, decisions: 0.3 },
        scoringMethod: "leadership_assessment",
        benchmarks: ["leadership_competencies", "role_level"],
      },
      "Communication Skills Specialist": {
        primary: [
          "verbal_communication",
          "written_communication",
          "presentation",
        ],
        secondary: ["active_listening", "clarity", "persuasion"],
        weightings: { verbal: 0.4, written: 0.3, presentation: 0.3 },
        scoringMethod: "communication_assessment",
        benchmarks: ["role_requirements", "communication_standards"],
      },
    };

    return (
      criteriaMap[role] || {
        primary: ["general_competence"],
        secondary: ["basic_skills"],
        weightings: { general: 1.0 },
        scoringMethod: "basic_assessment",
        benchmarks: ["minimum_requirements"],
      }
    );
  },

  /**
   * Generate profile checksum for integrity verification
   */
  generateProfileChecksum(agent) {
    const crypto = require("crypto");
    const data = `${agent._id}${agent.name}${agent.role}${
      agent.hederaAccountId
    }${Date.now()}`;
    return crypto
      .createHash("sha256")
      .update(data)
      .digest("hex")
      .substring(0, 16);
  },

  /**
   * Calculate profile hash for integrity checking
   */
  calculateProfileHash(profile) {
    const crypto = require("crypto");
    // Create a copy without the integrity field to avoid circular reference
    const profileCopy = { ...profile };
    delete profileCopy.integrity;
    const profileString = JSON.stringify(
      profileCopy,
      Object.keys(profileCopy).sort()
    );
    return crypto.createHash("sha256").update(profileString).digest("hex");
  },

  /**
   * Validate HCS-11 profile structure and compliance
   */
  validateHCS11Profile(profile) {
    const requiredFields = [
      "p",
      "standard",
      "version",
      "type",
      "op",
      "timestamp",
      "identity",
      "hedera",
      "communication",
      "capabilities",
      "governance",
      "metadata",
      "integrity",
    ];

    const validation = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check required fields
    for (const field of requiredFields) {
      if (!profile[field]) {
        validation.isValid = false;
        validation.errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate standard compliance
    if (profile.p !== "hcs-11" || profile.standard !== "HCS-11") {
      validation.isValid = false;
      validation.errors.push("Profile must comply with HCS-11 standard");
    }

    // Validate communication topics
    if (
      !profile.communication?.inbound?.topicId ||
      !profile.communication?.outbound?.topicId
    ) {
      validation.isValid = false;
      validation.errors.push(
        "Both inbound and outbound topic IDs are required"
      );
    }

    // Validate Hedera account format
    const accountPattern = /^0\.0\.\d+$/;
    if (!accountPattern.test(profile.hedera?.accountId)) {
      validation.isValid = false;
      validation.errors.push("Invalid Hedera account ID format");
    }

    // Validate governance permissions
    if (!profile.governance?.permissions || !profile.governance?.compliance) {
      validation.warnings.push("Incomplete governance configuration");
    }

    return validation;
  },

  /**
   * Update HCS-11 profile with new information
   */
  async updateHCS11Profile(agentId, updates) {
    try {
      const agent = await AgentModel.findById(agentId);
      if (!agent || !agent.hcs11Profile) {
        throw new Error("Agent or HCS-11 profile not found");
      }

      const updatedProfile = {
        ...agent.hcs11Profile,
        ...updates,
        metadata: {
          ...agent.hcs11Profile.metadata,
          lastUpdated: new Date().toISOString(),
          version: hrAgentController.incrementVersion(
            agent.hcs11Profile.metadata.version
          ),
        },
      };

      // Recalculate integrity hash
      updatedProfile.integrity.profileHash =
        hrAgentController.calculateProfileHash(updatedProfile);
      updatedProfile.integrity.verificationStatus = "pending";

      // Update in database
      agent.hcs11Profile = updatedProfile;
      await agent.save();

      // Send update message to network
      if (agent.outboundTopicId) {
        const hcs10Client = new HCS10Client({
          network: "testnet",
          operatorId: agent.hederaAccountId,
          operatorPrivateKey: agent.hederaPrivateKey,
        });

        const updateMessage = {
          p: "hcs-11",
          op: "update",
          type: "agent_profile",
          timestamp: new Date().toISOString(),
          agentId: updatedProfile.identity.agentId,
          updates: updates,
          newHash: updatedProfile.integrity.profileHash,
          m: "Agent profile update notification",
        };

        await hcs10Client.sendMessage(
          agent.outboundTopicId,
          JSON.stringify(updateMessage)
        );
      }

      return {
        success: true,
        profile: updatedProfile,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Error updating HCS-11 profile:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Increment version number (semantic versioning)
   */
  incrementVersion(currentVersion) {
    const parts = currentVersion.split(".");
    const patch = parseInt(parts[2]) + 1;
    return `${parts[0]}.${parts[1]}.${patch}`;
  },

  /**
   * Validate memo length for Hedera (max 100 characters)
   */
  validateMemoLength(memo) {
    const maxLength = 100;
    if (memo.length > maxLength) {
      throw new Error(
        `Memo too long: ${
          memo.length
        } chars (max ${maxLength}). Content: ${memo.substring(0, 50)}...`
      );
    }
    return true;
  },

  /**
   * Create HCS-11 compliant protocol memo for agent using standards SDK
   */
  createHCS11ProfileMemo(agent, profileTopicId = null) {
    try {
      // Initialize the HCS-11 client with minimal config for memo generation
      const client = new HCS11Client({
        network:
          process.env.HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet",
        auth: {
          operatorId: agent.hederaAccountId,
          privateKey: agent.hederaPrivateKey,
        },
        logLevel: "error", // Reduce logging for memo generation
      });

      // Generate HCS-11 compliant memo using the standards SDK
      // Use profileTopicId if available, otherwise use account ID with HCS-11 standard
      const resourceId = profileTopicId || agent.hederaAccountId;
      const memo = client.setProfileForAccountMemo(resourceId, 11);

      return memo;
    } catch (error) {
      console.error(
        `❌ Error creating HCS-11 profile memo for agent ${agent.name}:`,
        error
      );
      // Fallback to manual format if SDK fails
      const resourceId = profileTopicId || agent.hederaAccountId;
      return `hcs-11:hcs://${11}/${resourceId}`;
    }
  },

  /**
   * Set HCS-11 compliant account memo for agent
   */
  async setHCS11AccountMemo(
    agent,
    inboundTopicId = null,
    outboundTopicId = null
  ) {
    console.log(
      `      🔄 Setting HCS-11 memo for ${agent.name} (${agent.hederaAccountId})`
    );
    console.log(`      🔑 Using agent's own credentials for authentication`);
    if (inboundTopicId)
      console.log(`      📥 Including inbound topic: ${inboundTopicId}`);
    if (outboundTopicId)
      console.log(`      📤 Including outbound topic: ${outboundTopicId}`);

    try {
      // Initialize the HCS-11 client using the AGENT'S own credentials
      const client = new HCS11Client({
        network:
          process.env.HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet",
        auth: {
          operatorId: agent.hederaAccountId,
          privateKey: agent.hederaPrivateKey,
        },
        logLevel: "info",
      });

      // Create AI agent profile using official HCS-11 SDK method
      // Only include basic properties, no topic dependencies
      const profileOptions = {
        alias: agent.name, // Full name as alias
        bio: agent.description || `HR ${agent.role} Skills Evaluation Agent`,
        creator: "TalentAI Platform",
        properties: {
          agentType: "hr-agent",
          role: agent.role,
          specializations: agent.capabilities || [],
          platform: "talentai",
          createdAt: new Date().toISOString(),
          hederaAccountId: agent.hederaAccountId,
        },
      };

      // Only add topics if they exist to avoid dependency errors
      if (inboundTopicId) {
        profileOptions.inboundTopicId = inboundTopicId;
      }
      if (outboundTopicId) {
        profileOptions.outboundTopicId = outboundTopicId;
      }

      const aiAgentProfile = client.createAIAgentProfile(
        agent.avatarName, // Display name (URL-safe)
        AIAgentType.AUTONOMOUS, // Agent type
        [
          // Map agent capabilities to HCS-11 capabilities
          AIAgentCapability.TEXT_GENERATION,
          AIAgentCapability.LANGUAGE_TRANSLATION,
          AIAgentCapability.KNOWLEDGE_RETRIEVAL,
          AIAgentCapability.DATA_INTEGRATION,
          ...(agent.role === "Technical"
            ? [AIAgentCapability.CODE_GENERATION]
            : []),
          ...(agent.role === "Soft"
            ? [AIAgentCapability.SUMMARIZATION_EXTRACTION]
            : []),
        ],
        "LangChain-TogetherAI", // Model
        profileOptions
      );

      console.log(
        `      🔄 Creating and inscribing HCS-11 profile for ${agent.name}...`
      );
      console.log(`      📝 Profile created using official HCS-11 SDK methods`);

      // Create and inscribe profile in one step with automatic account memo update
      const oneStepResult = await client.createAndInscribeProfile(
        aiAgentProfile,
        true, // Update account memo automatically
        {
          progressCallback: (progress) => {
            console.log(
              `      📊 ${progress.stage}: ${progress.progressPercent}%`
            );
          },
        }
      );

      if (oneStepResult.success) {
        console.log(
          `      ✅ HCS-11 profile created and published successfully!`
        );
        console.log(
          `      📄 Profile Topic ID: ${oneStepResult.profileTopicId}`
        );
        console.log(
          `      🔗 Account memo should now be set automatically by the SDK.`
        );

        // Wait a moment for the transaction to propagate before returning
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update agent record with profile information
        await AgentModel.findByIdAndUpdate(agent._id, {
          hcs11ProfileTopicId: oneStepResult.profileTopicId,
          hcs11Memo:
            oneStepResult.accountMemo ||
            `hcs-11:hcs://11/${oneStepResult.profileTopicId}`,
          status: "hcs11-profile-created",
        });

        return {
          success: true,
          profileTopicId: oneStepResult.profileTopicId,
          accountId: agent.hederaAccountId,
          accountMemo: oneStepResult.accountMemo,
          method: "official-hcs11-createAndInscribeProfile",
          type: "hcs11-standards-compliant",
        };
      } else {
        console.error(
          `      ❌ 'createAndInscribeProfile' failed: ${oneStepResult.error}`
        );
        throw new Error(oneStepResult.error);
      }
    } catch (hcs11Error) {
      console.log(`      ⚠️  HCS11Client failed: ${hcs11Error.message}`);
      console.log(`      🔄 Trying fallback approach with Hedera SDK...`);

      // Fallback: Generate and set memo manually
      try {
        const hcs11Memo = `hcs-11:hcs://11/${agent.hederaAccountId}`;
        console.log(`      📝 Generated fallback memo: ${hcs11Memo}`);

        const {
          Client,
          AccountUpdateTransaction,
          PrivateKey,
        } = require("@hashgraph/sdk");

        const client = Client.forTestnet();
        if (process.env.HEDERA_NETWORK === "mainnet") {
          client.setNetwork("mainnet");
        }

        // Use agent's own credentials
        client.setOperator(
          agent.hederaAccountId,
          PrivateKey.fromString(agent.hederaPrivateKey)
        );

        const accountUpdateTx = new AccountUpdateTransaction()
          .setAccountId(agent.hederaAccountId)
          .setAccountMemo(hcs11Memo);

        const txResponse = await accountUpdateTx.execute(client);
        const receipt = await txResponse.getReceipt(client);

        console.log(`      ✅ Fallback memo set successfully!`);
        console.log(
          `      📝 Transaction: ${txResponse.transactionId.toString()}`
        );

        return {
          success: true,
          memo: hcs11Memo,
          transactionId: txResponse.transactionId.toString(),
          accountId: agent.hederaAccountId,
          method: "fallback-hedera-sdk",
          type: "hcs11-manual",
        };
      } catch (fallbackError) {
        console.error(`      ❌ Both approaches failed!`);
        console.error(`      🔴 HCS11Client: ${hcs11Error.message}`);
        console.error(`      🔴 Fallback: ${fallbackError.message}`);

        return {
          success: false,
          error: `HCS11Client failed: ${hcs11Error.message}. Fallback failed: ${fallbackError.message}`,
        };
      }
    }
  },

  /**
   * Verify HCS-11 memo on Hedera account
   */
  /**
   * Parse HCS-11 protocol memo format
   */
  parseCompactHCS11Memo(memo) {
    // Format: hcs-11:hcs://protocol_standard/resource_id
    const hcs11ProtocolPattern = /^hcs-11:hcs:\/\/([0-9]+)\/(.+)$/;
    const matches = memo.match(hcs11ProtocolPattern);

    if (!matches) {
      return null;
    }

    const protocolStandard = matches[1];
    const resourceId = matches[2];

    // Check if it's an account ID (format: 0.0.123456) or other resource
    const isAccountId = /^[0-9]+\.[0-9]+\.[0-9]+$/.test(resourceId);

    return {
      standard: "hcs-11",
      protocol: "hcs",
      protocolStandard: protocolStandard,
      resourceId: resourceId,
      isAccountId: isAccountId,
      resourceType: isAccountId
        ? "account"
        : resourceId.startsWith("in-")
        ? "inbound-topic"
        : resourceId.startsWith("out-")
        ? "outbound-topic"
        : "other",
      isValidProtocolRef: true,
      isHCS11Standard: protocolStandard === "11",
      format: "hcs-protocol",
    };
  },

  async verifyHCS11Memo(accountId) {
    try {
      const { Client, AccountInfoQuery } = require("@hashgraph/sdk");

      const client = Client.forTestnet();
      client.setOperator(
        process.env.HEDERA_ACCOUNT_ID,
        process.env.HEDERA_PRIVATE_KEY
      );
      //client.setNetworkTimeout(10000);

      // Query account info to get memo
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(accountId)
        .execute(client);

      const memo = accountInfo.accountMemo;

      if (!memo) {
        return {
          success: false,
          error: "No memo found on account",
        };
      }

      // First try to parse as HCS-11 protocol format
      const protocolParsed = hrAgentController.parseCompactHCS11Memo(memo);
      if (protocolParsed) {
        return {
          success: true,
          memo: memo,
          parsedMemo: protocolParsed,
          isHCS11Compliant: true,
          format: "hcs-protocol",
        };
      }

      // Try to parse legacy custom formats for backward compatibility
      if (memo.startsWith("hcs-11:") && !memo.includes("hcs://")) {
        const parts = memo.split(":");
        if (parts.length === 4) {
          return {
            success: true,
            memo: memo,
            parsedMemo: {
              standard: "hcs-11",
              avatarName: parts[1],
              roleFirst: parts[2],
              shortId: parts[3],
              isCompactFormat: true,
              format: "legacy-colon",
            },
            isHCS11Compliant: false, // Not standard compliant
            format: "legacy-colon",
          };
        }
      }

      // Try to parse old camelCase format for backward compatibility
      if (memo.startsWith("Hcs11")) {
        const content = memo.slice(5);
        const matches = content.match(
          /^([A-Z][a-z]+)([A-Z][a-z]+)([a-f0-9]{8})$/
        );
        if (matches) {
          return {
            success: true,
            memo: memo,
            parsedMemo: {
              standard: "hcs-11",
              avatarName: matches[1].toLowerCase(),
              roleFirst: matches[2],
              shortId: matches[3],
              isCompactFormat: true,
              format: "legacy-camelCase",
            },
            isHCS11Compliant: false, // Not standard compliant
            format: "legacy-camelCase",
          };
        }
      }

      // Fall back to trying JSON format (legacy)
      try {
        const parsedMemo = JSON.parse(memo);

        if (parsedMemo.p !== "hcs-11" || parsedMemo.standard !== "HCS-11") {
          return {
            success: false,
            error: "Memo is not HCS-11 compliant",
            memo: memo,
          };
        }

        return {
          success: true,
          memo: memo,
          parsedMemo: parsedMemo,
          isHCS11Compliant: true,
          format: "json",
        };
      } catch (parseError) {
        return {
          success: false,
          error: `Invalid memo format. Expected 'hcs-11:hcs://11/resource_id' (HCS-11 protocol) or valid HCS-11 JSON. Got: ${memo}`,
          memo: memo,
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Check and fix all agents' configurations and memos
   */
  async checkAllAgents(req, res) {
    try {
      console.log("🔍 Checking all HR agents for configuration issues...");

      const agents = await AgentModel.find({});
      const report = {
        totalAgents: agents.length,
        configurationIssues: [],
        validAgents: [],
        recommendations: [],
      };

      for (const agent of agents) {
        const agentStatus = {
          id: agent._id,
          name: agent.name,
          avatar: agent.avatarName,
          role: agent.role,
          issues: [],
        };

        // Check Hedera configuration
        if (!agent.hederaAccountId) {
          agentStatus.issues.push("Missing Hedera Account ID");
        }
        if (!agent.hederaPrivateKey) {
          agentStatus.issues.push("Missing Hedera Private Key");
        }
        if (!agent.isActive) {
          agentStatus.issues.push("Agent is inactive");
        }

        if (agentStatus.issues.length > 0) {
          report.configurationIssues.push(agentStatus);
        } else {
          report.validAgents.push({
            id: agent._id,
            name: agent.name,
            accountId: agent.hederaAccountId,
          });
        }
      }

      // Generate recommendations
      if (report.configurationIssues.length > 0) {
        report.recommendations.push(
          "Run POST /hr-agents/initialize to create missing agents"
        );
        report.recommendations.push(
          "Use POST /hr-agents/fix-memo/{agentId} to fix HCS-11 memo issues"
        );
      }

      if (
        report.configurationIssues.some((agent) =>
          agent.issues.includes("Missing Hedera Account ID")
        )
      ) {
        report.recommendations.push(
          "Agents missing Hedera accounts need to be reinitialized"
        );
      }

      console.log(
        `📊 Agent Check Results: ${report.validAgents.length} valid, ${report.configurationIssues.length} with issues`
      );

      res.json({
        success: true,
        message: "Agent configuration check completed",
        report: report,
        summary: {
          healthy: report.validAgents.length,
          needsAttention: report.configurationIssues.length,
          totalChecked: report.totalAgents,
        },
      });
    } catch (error) {
      console.error("Error checking agents:", error);
      res.status(500).json({
        success: false,
        error: "Failed to check agents",
        details: error.message,
      });
    }
  },

  /**
   * Monitor for coordinator response (background process)
   * This simulates the polling mechanism from your example code
   */
  async monitorCoordinatorResponse(topicId, sindaAgentId, candidateId) {
    try {
      // Simulate waiting for coordinator response
      setTimeout(async () => {
        console.log(
          `🔍 Monitoring topic ${topicId} for coordinator response...`
        );

        // In a real implementation, you would poll the topic for new messages
        // For now, we'll simulate a coordinator response after 30 seconds

        const coordinatorAgent = await AgentModel.findOne({
          avatarName: "julia",
        });
        if (!coordinatorAgent) return;

        // Ensure coordinator has default Hedera config for LangChain agent
        if (!coordinatorAgent.hederaAccountId) {
          coordinatorAgent.hederaAccountId = "0.0.000000";
          coordinatorAgent.hederaPrivateKey = "mock-key-for-langchain-only";
        }

        // Simulate intelligent coordinator response
        let coordinatorConversationalAgent;
        try {
          coordinatorConversationalAgent = new LangChainTogetherAIAgent({
            accountId: coordinatorAgent.hederaAccountId,
            privateKey: coordinatorAgent.hederaPrivateKey,
            network: "testnet",
            operationalMode: "standard",
            verbose: false,
            skipProfileValidation: true, // Skip HCS-11 profile validation
          });
          await coordinatorConversationalAgent.initialize();
        } catch (error) {
          console.error(
            `❌ Coordinator agent initialization failed, using fallback:`,
            error.message
          );
          // Create fallback coordinator
          coordinatorConversationalAgent = {
            processMessage: async (prompt) => ({
              response: `As HR Coordinator, I've received the evaluation for candidate ${candidateId}. Thank you for the assessment. I'll review this and provide feedback on next steps.`,
              success: true,
              metadata: {
                provider: "fallback-mode",
                timestamp: new Date().toISOString(),
              },
            }),
          };
        }

        // Generate intelligent response based on the evaluation
        const contextualPrompt = `As the HR Coordinator, provide a thoughtful response to Sinda's soft skills evaluation for candidate ${candidateId}. Consider the evaluation results and provide next steps.`;

        const aiResponse = await coordinatorConversationalAgent.processMessage(
          contextualPrompt
        );

        console.log(`🤖 Coordinator AI Response: ${aiResponse.response}`);

        // This would trigger the submitEvaluationMessage in a real scenario
      }, 30000); // Wait 30 seconds before coordinator responds
    } catch (error) {
      console.error("Error monitoring coordinator response:", error);
    }
  },

  /**
   * Start HCS-10 agent communication monitoring
   * Listens for messages on topic and responds automatically
   */
  async startAgentCommunicationMonitoring(
    topicId,
    sendingAgentId,
    candidateId
  ) {
    try {
      console.log(`🔄 Starting HCS-10 monitoring for topic ${topicId}`);

      // Get coordinator agent
      const coordinatorAgent = await AgentModel.findOne({ avatarName: "yuka" });
      if (!coordinatorAgent) {
        console.error("Coordinator agent (Yuka) not found");
        return;
      }

      // Initialize HCS10Client for coordinator
      const coordinatorHCS10Client = new HCS10Client({
        network: "testnet",
        operatorId: coordinatorAgent.hederaAccountId,
        operatorPrivateKey: coordinatorAgent.hederaPrivateKey,
        guardedRegistryBaseUrl:
          process.env.REGISTRY_URL || "https://moonscape.tech",
        prettyPrint: true,
        logLevel: "debug",
      });

      // Ensure coordinator has default Hedera config for LangChain agent
      if (!coordinatorAgent.hederaAccountId) {
        coordinatorAgent.hederaAccountId = "0.0.000000";
        coordinatorAgent.hederaPrivateKey = "mock-key-for-langchain-only";
      }

      // Initialize LangChain TogetherAI Agent for intelligent responses
      let coordinatorConversationalAgent;
      try {
        coordinatorConversationalAgent = new LangChainTogetherAIAgent({
          accountId: coordinatorAgent.hederaAccountId,
          privateKey: coordinatorAgent.hederaPrivateKey,
          network: "testnet",
          operationalMode: "standard",
          verbose: true,
          skipProfileValidation: true, // Skip HCS-11 profile validation
        });
        await coordinatorConversationalAgent.initialize();
      } catch (error) {
        console.error(
          `❌ Coordinator agent initialization failed, using fallback:`,
          error.message
        );
        // Create fallback coordinator
        coordinatorConversationalAgent = {
          processMessage: async (prompt) => ({
            response: `As HR Coordinator, I'm monitoring the evaluation process for candidate ${candidateId}. I'll provide appropriate responses based on agent evaluations.`,
            success: true,
            metadata: {
              provider: "fallback-mode",
              timestamp: new Date().toISOString(),
            },
          }),
        };
      }

      // Monitor topic for new messages (simplified polling approach)
      const monitorInterval = setInterval(async () => {
        try {
          // Get recent messages from topic (this is a simplified approach)
          // In a real implementation, you'd use proper HCS message streaming

          // Simulate coordinator response after detecting agent message
          const coordinatorPrompt = `As the HR Coordinator, I've received an evaluation for candidate ${candidateId}. 
          Please provide a professional coordinator response that either:
          1. Approves the evaluation and moves to next step
          2. Requests additional information
          3. Schedules follow-up interviews
          4. Makes final hiring decision
          
          Keep response professional, constructive, and actionable.`;

          const coordinatorResponse =
            await coordinatorConversationalAgent.processMessage(
              coordinatorPrompt
            );

          // Create HCS-11 coordinator response
          const coordinatorHCS11Message = {
            standard: "HCS-11",
            type: "coordinator_response",
            timestamp: new Date().toISOString(),
            agentProfile: {
              name: coordinatorAgent.name,
              avatar: coordinatorAgent.avatarName,
              role: coordinatorAgent.role,
              accountId: coordinatorAgent.hederaAccountId,
            },
            response: coordinatorResponse.response,
            candidateId: candidateId,
            action: "evaluation_reviewed",
            conversationalPrompt: `📋 COORDINATOR REVIEW COMPLETE

${coordinatorResponse.response}

Next steps will be communicated to the evaluation team.`,
          };

          // Send coordinator response
          const responseMessageResult =
            await coordinatorHCS10Client.sendMessage(
              topicId,
              JSON.stringify(coordinatorHCS11Message)
            );

          const responseMessageId = responseMessageResult.toString();

          // Send immediate proof of reception
          const proofOfReceptionMessage = {
            standard: "HCS-11",
            type: "proof_of_reception",
            timestamp: new Date().toISOString(),
            agentProfile: {
              name: coordinatorAgent.name,
              avatar: coordinatorAgent.avatarName,
              role: coordinatorAgent.role,
              accountId: coordinatorAgent.hederaAccountId,
            },
            acknowledgment: {
              candidateId: candidateId,
              status: "received_and_processed",
              action: "evaluation_completed",
              originalMessageId: responseMessageId,
            },
            conversationalPrompt: `📨 PROOF OF RECEPTION

${coordinatorAgent.name} has successfully received, processed, and responded to the evaluation for candidate ${candidateId}.

✅ Message received and logged
✅ Evaluation processed and completed  
✅ Response sent and verified

Message chain verified and stored on Hedera Consensus Service.`,
          };

          // Send proof of reception
          const proofMessageResult = await coordinatorHCS10Client.sendMessage(
            topicId,
            JSON.stringify(proofOfReceptionMessage)
          );

          console.log(
            `📋 Coordinator ${coordinatorAgent.name} responded to topic ${topicId}`
          );
          console.log(
            `📨 Proof of reception sent with message ID: ${proofMessageResult.toString()}`
          );

          // Clear interval after first response (or implement smarter logic)
          clearInterval(monitorInterval);
        } catch (error) {
          console.error("Error in coordinator monitoring:", error);
        }
      }, 45000); // Check every 45 seconds

      // Clear interval after 10 minutes to prevent infinite monitoring
      setTimeout(() => {
        clearInterval(monitorInterval);
        console.log(`⏰ Stopped monitoring topic ${topicId} after timeout`);
      }, 600000);
    } catch (error) {
      console.error("Error starting agent communication monitoring:", error);
    }
  },

  /**
   * Diagnose coordinator issues
   * Checks if a coordinator exists and is properly configured for proof of reception
   */
  async diagnoseCoordinator(req, res) {
    try {
      const { coordinatorId } = req.params;

      if (!coordinatorId) {
        return res.status(400).json({
          error: "coordinatorId is required",
        });
      }

      console.log(`🔍 Starting diagnostic for coordinator: ${coordinatorId}`);

      // Check coordinator existence
      let coordinator = null;
      if (mongoose.Types.ObjectId.isValid(coordinatorId)) {
        coordinator = await AgentModel.findById(coordinatorId);
      } else if (coordinatorId.includes(".")) {
        coordinator = await AgentModel.findOne({
          hederaAccountId: coordinatorId,
        });
      }

      if (!coordinator) {
        // Try to find a default coordinator
        coordinator = await AgentModel.findOne({
          avatarName: { $in: ["yuka", "julia"] },
        });
      }

      // Get all coordinators
      const allCoordinators = await AgentModel.find({
        avatarName: { $in: ["yuka", "julia"] },
      });

      // Get recent evaluations
      const recentEvaluations = coordinator
        ? await EvaluationTopicModel.find({
            "evaluations.agentId": coordinator._id,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          })
            .sort({ createdAt: -1 })
            .limit(10)
        : [];

      res.json({
        success: true,
        diagnostic: {
          coordinatorId,
          coordinatorFound: !!coordinator,
          coordinator: coordinator
            ? {
                id: coordinator._id,
                name: coordinator.name,
                avatar: coordinator.avatarName,
                role: coordinator.role,
                isActive: coordinator.isActive,
                hasHederaAccount: !!coordinator.hederaAccountId,
                hasHederaKey: !!coordinator.hederaPrivateKey,
              }
            : null,
          allCoordinators: allCoordinators.map((c) => ({
            id: c._id,
            name: c.name,
            avatar: c.avatarName,
            isActive: c.isActive,
          })),
          recentEvaluationsCount: recentEvaluations.length,
          proofOfReceptionIssues: recentEvaluations.filter((evaluation) =>
            evaluation.evaluations.some(
              (eval) =>
                coordinator &&
                eval.agentId.toString() === coordinator._id.toString() &&
                !eval.messageId
            )
          ).length,
        },
      });
    } catch (error) {
      console.error("Error diagnosing coordinator:", error);
      res.status(500).json({
        success: false,
        error: "Failed to diagnose coordinator",
        details: error.message,
      });
    }
  },

  /**
   * Fix coordinator proof of reception by manually sending acknowledgment
   */
  async fixProofOfReception(req, res) {
    try {
      const { coordinatorId, topicId, candidateId } = req.body;

      if (!coordinatorId || !topicId || !candidateId) {
        return res.status(400).json({
          error: "coordinatorId, topicId, and candidateId are required",
        });
      }

      // Get coordinator
      let coordinator = null;
      if (mongoose.Types.ObjectId.isValid(coordinatorId)) {
        coordinator = await AgentModel.findById(coordinatorId);
      } else if (coordinatorId.includes(".")) {
        coordinator = await AgentModel.findOne({
          hederaAccountId: coordinatorId,
        });
      }

      if (!coordinator) {
        // Try to find a default coordinator
        coordinator = await AgentModel.findOne({
          avatarName: { $in: ["yuka", "julia"] },
        });
      }

      if (!coordinator) {
        return res.status(404).json({ error: "Coordinator not found" });
      }

      // Check if coordinator has proper Hedera configuration
      if (!coordinator.hederaAccountId || !coordinator.hederaPrivateKey) {
        return res.status(400).json({
          error: "Coordinator missing Hedera configuration",
          solution:
            "Reinitialize the coordinator with proper Hedera credentials",
        });
      }

      // Initialize HCS10Client for proof of reception
      const hcs10Client = new HCS10Client({
        network: "testnet",
        operatorId: coordinator.hederaAccountId,
        operatorPrivateKey: coordinator.hederaPrivateKey,
        guardedRegistryBaseUrl:
          process.env.REGISTRY_URL || "https://moonscape.tech",
        prettyPrint: true,
        logLevel: "debug",
      });

      // Send proof of reception message
      const proofOfReceptionMessage = {
        standard: "HCS-11",
        type: "proof_of_reception",
        timestamp: new Date().toISOString(),
        agentProfile: {
          name: coordinator.name,
          avatar: coordinator.avatarName,
          role: coordinator.role,
          accountId: coordinator.hederaAccountId,
        },
        acknowledgment: {
          candidateId: candidateId,
          status: "received",
          action: "evaluation_acknowledged",
        },
        conversationalPrompt: `📨 PROOF OF RECEPTION

${coordinator.name} acknowledges receipt of evaluation for candidate ${candidateId}.

✅ Message received and logged
🔄 Processing evaluation...
📋 Response will follow shortly

Message verified and stored on Hedera Consensus Service.`,
      };

      // Send the acknowledgment
      const messageResult = await hcs10Client.sendMessage(
        topicId,
        JSON.stringify(proofOfReceptionMessage)
      );

      const messageId = messageResult.toString();

      // Update evaluation topic with proof of reception
      const evaluationTopic = await EvaluationTopicModel.findOne({ topicId });
      if (evaluationTopic) {
        // Add a proof of reception entry
        evaluationTopic.evaluations.push({
          agentId: coordinator._id,
          agentName: coordinator.name,
          agentRole: coordinator.role,
          messageId: messageId,
          evaluation: {
            passed: null, // Not an evaluation, just acknowledgment
            score: null,
            feedback: "Proof of reception acknowledged",
            interviewNotes: "Message received and verified",
          },
          timestamp: new Date(),
        });

        await evaluationTopic.save();
      }

      console.log(
        `✅ Proof of reception sent by ${coordinator.name} for topic ${topicId}`
      );

      res.json({
        success: true,
        message: "Proof of reception sent successfully",
        coordinator: {
          id: coordinator._id,
          name: coordinator.name,
          avatar: coordinator.avatarName,
        },
        proofOfReception: {
          messageId: messageId,
          topicId: topicId,
          candidateId: candidateId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error fixing proof of reception:", error);
      res.status(500).json({
        success: false,
        error: "Failed to send proof of reception",
        details: error.message,
      });
    }
  },

  /**
   * Validate agent HCS-11 profile compliance
   */
  async validateAgentHCS11(req, res) {
    try {
      const { agentId } = req.params;

      const agent = await AgentModel.findById(agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: "Agent not found",
        });
      }

      if (!agent.hcs11Profile) {
        return res.status(400).json({
          success: false,
          error: "Agent does not have an HCS-11 profile",
          recommendation:
            "Run POST /hr-agents/initialize to create HCS-11 profiles",
        });
      }

      // Validate the profile
      const validation = hrAgentController.validateHCS11Profile(
        agent.hcs11Profile
      );

      // Additional custom validation for agent-specific requirements
      const customValidation = {
        hasCustomProfile: !!agent.hcs11CustomProfile,
        hasPersonality: !!agent.hcs11CustomProfile?.agentPersonality,
        hasSpecializedCapabilities:
          !!agent.hcs11CustomProfile?.specializedCapabilities,
        hasEvaluationFramework: !!agent.hcs11CustomProfile?.evaluationFramework,
        hasDomainExpertise: !!agent.hcs11CustomProfile?.domainExpertise,
      };

      res.json({
        success: true,
        agentId: agentId,
        agentName: agent.name,
        validation: validation,
        customProfileValidation: customValidation,
        profileHash: agent.hcs11Profile?.integrity?.profileHash,
        lastUpdated: agent.hcs11Profile?.metadata?.lastUpdated,
        recommendations: validation.isValid
          ? []
          : [
              "Fix validation errors to ensure HCS-11 compliance",
              "Update profile structure to match standard requirements",
            ],
      });
    } catch (error) {
      console.error("Error validating HCS-11 profile:", error);
      res.status(500).json({
        success: false,
        error: "Failed to validate HCS-11 profile",
        details: error.message,
      });
    }
  },

  /**
   * Update agent HCS-11 profile
   */
  async updateAgentProfile(req, res) {
    try {
      const { agentId } = req.params;
      const { updates } = req.body;

      if (!updates) {
        return res.status(400).json({
          success: false,
          error: "Updates object is required",
        });
      }

      const result = await hrAgentController.updateHCS11Profile(
        agentId,
        updates
      );

      if (result.success) {
        res.json({
          success: true,
          message: "Agent HCS-11 profile updated successfully",
          profile: result.profile,
          newHash: result.profile?.integrity?.profileHash,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error updating agent profile:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update agent profile",
        details: error.message,
      });
    }
  },

  /**
   * Bulk update HCS-11 memos for all agents
   */
  async updateAllAgentMemos(req, res) {
    try {
      console.log("🔄 Updating HCS-11 memos for all agents...");

      const agents = await AgentModel.find({ isActive: true });
      const results = [];

      for (const agent of agents) {
        console.log(
          `\n📝 Updating memo for ${agent.name} (${agent.hederaAccountId})...`
        );

        try {
          const result = await hrAgentController.setHCS11AccountMemo(agent);

          results.push({
            agentId: agent._id,
            agentName: agent.name,
            accountId: agent.hederaAccountId,
            success: result.success,
            transactionId: result.transactionId,
            error: result.error,
          });

          if (result.success) {
            console.log(`✅ ${agent.name}: Memo updated successfully`);
          } else {
            console.log(`❌ ${agent.name}: Failed - ${result.error}`);
          }
        } catch (agentError) {
          console.error(`❌ ${agent.name}: Error - ${agentError.message}`);
          results.push({
            agentId: agent._id,
            agentName: agent.name,
            accountId: agent.hederaAccountId,
            success: false,
            error: agentError.message,
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      res.json({
        success: true,
        message: `HCS-11 memo update completed. ${successCount} successful, ${failCount} failed.`,
        results: results,
        summary: {
          total: agents.length,
          successful: successCount,
          failed: failCount,
        },
      });
    } catch (error) {
      console.error("Error updating agent memos:", error);
      res.status(500).json({
        success: false,
        error: "Failed to update agent memos",
        details: error.message,
      });
    }
  },

  /**
   * Debug and fix HCS-11 memo for a specific agent
   */
  async debugAndFixMemo(req, res) {
    try {
      const { agentId } = req.params;

      const agent = await AgentModel.findById(agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: "Agent not found",
        });
      }

      console.log(
        `🔧 Debugging HCS-11 memo for agent: ${agent.name} (${agent.hederaAccountId})`
      );

      // First, check current memo status
      let currentMemoStatus = null;
      try {
        currentMemoStatus = await hrAgentController.verifyHCS11Memo(
          agent.hederaAccountId
        );
        console.log(`📊 Current memo status:`, currentMemoStatus);
      } catch (verifyError) {
        console.log(`⚠️ Could not verify current memo: ${verifyError.message}`);
      }

      // Force create HCS-11 memo using fallback method
      console.log(`🔧 Force creating HCS-11 memo using fallback method...`);
      try {
        const {
          Client,
          AccountUpdateTransaction,
          PrivateKey,
        } = require("@hashgraph/sdk");

        const client = Client.forTestnet();
        client.setOperator(
          agent.hederaAccountId,
          PrivateKey.fromString(agent.hederaPrivateKey)
        );

        const hcs11Memo = `hcs-11:hcs://11/${agent.hederaAccountId}`;
        console.log(`📝 Setting memo: ${hcs11Memo}`);

        const accountUpdateTx = new AccountUpdateTransaction()
          .setAccountId(agent.hederaAccountId)
          .setAccountMemo(hcs11Memo);

        const txResponse = await accountUpdateTx.execute(client);
        const receipt = await txResponse.getReceipt(client);

        console.log(
          `✅ Memo set successfully! Transaction: ${txResponse.transactionId.toString()}`
        );

        // Update agent record
        await AgentModel.findByIdAndUpdate(agent._id, {
          hcs11Memo: hcs11Memo,
          status: "hcs11-memo-fixed",
        });

        // Wait and verify
        await new Promise((resolve) => setTimeout(resolve, 3000));
        const verifyResult = await hrAgentController.verifyHCS11Memo(
          agent.hederaAccountId
        );

        res.json({
          success: true,
          message: "HCS-11 memo fixed successfully",
          agent: {
            id: agent._id,
            name: agent.name,
            accountId: agent.hederaAccountId,
          },
          memo: hcs11Memo,
          transactionId: txResponse.transactionId.toString(),
          verification: verifyResult,
        });
      } catch (fixError) {
        console.error(`❌ Failed to fix memo: ${fixError.message}`);
        res.status(500).json({
          success: false,
          error: "Failed to fix HCS-11 memo",
          details: fixError.message,
          currentMemoStatus,
        });
      }
    } catch (error) {
      console.error("Error debugging HCS-11 memo:", error);
      res.status(500).json({
        success: false,
        error: "Failed to debug HCS-11 memo",
        details: error.message,
      });
    }
  },

  /**
   * Refresh agent profiles from Hedera network
   * Syncs local database with latest HCS-11 profile data from network
   */
  async refreshAgentProfiles(req, res) {
    try {
      const { agentId } = req.params;

      let agents = [];
      if (agentId) {
        // Refresh specific agent
        const agent = await AgentModel.findById(agentId);
        if (!agent) {
          return res.status(404).json({
            success: false,
            error: "Agent not found",
          });
        }
        agents = [agent];
      } else {
        // Refresh all agents
        agents = await AgentModel.find({ isActive: true });
      }

      console.log(
        `🔄 Refreshing profiles for ${agents.length} agent(s) from Hedera network...`
      );
      const results = [];

      for (const agent of agents) {
        console.log(
          `📡 Fetching profile for ${agent.name} (${agent.hederaAccountId})`
        );

        try {
          const client = new HCS11Client({
            network:
              process.env.HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet",
            auth: {
              operatorId: agent.hederaAccountId,
              privateKey: agent.hederaPrivateKey,
            },
            logLevel: "info",
          });

          const profileResult = await client.fetchProfileByAccountId(
            agent.hederaAccountId,
            process.env.HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet"
          );

          if (profileResult.success && profileResult.profile) {
            // Parse profile
            let parsedProfile = profileResult.profile;
            if (typeof profileResult.profile === "string") {
              try {
                parsedProfile = client.parseProfileFromString(
                  profileResult.profile
                );
              } catch (parseError) {
                console.log(
                  `⚠️ Could not parse profile for ${agent.name}: ${parseError.message}`
                );
              }
            }

            // Extract and update information
            const updateData = {
              lastProfileFetch: new Date(),
            };

            if (profileResult.profileTopicId) {
              updateData.hcs11ProfileTopicId = profileResult.profileTopicId;
            }

            if (parsedProfile && typeof parsedProfile === "object") {
              if (parsedProfile.inboundTopicId) {
                updateData.inboundTopicId = parsedProfile.inboundTopicId;
              }
              if (parsedProfile.outboundTopicId) {
                updateData.outboundTopicId = parsedProfile.outboundTopicId;
              }
              // Store the full parsed profile
              updateData.hcs11Profile = parsedProfile;
            }

            // Update agent in database
            await AgentModel.findByIdAndUpdate(agent._id, updateData);

            results.push({
              agentId: agent._id,
              name: agent.name,
              hederaAccountId: agent.hederaAccountId,
              success: true,
              profileTopicId: profileResult.profileTopicId,
              inboundTopicId:
                parsedProfile?.inboundTopicId || agent.inboundTopicId,
              outboundTopicId:
                parsedProfile?.outboundTopicId || agent.outboundTopicId,
              updatedFields: Object.keys(updateData),
            });

            console.log(`✅ Profile refreshed for ${agent.name}`);
          } else {
            console.log(
              `❌ No profile found for ${agent.name}: ${profileResult.error}`
            );
            results.push({
              agentId: agent._id,
              name: agent.name,
              hederaAccountId: agent.hederaAccountId,
              success: false,
              error: profileResult.error || "Profile not found",
            });
          }
        } catch (error) {
          console.error(
            `❌ Error fetching profile for ${agent.name}: ${error.message}`
          );
          results.push({
            agentId: agent._id,
            name: agent.name,
            hederaAccountId: agent.hederaAccountId,
            success: false,
            error: error.message,
          });
        }
      }

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      res.json({
        success: true,
        message: `Profile refresh completed. ${successCount} successful, ${failCount} failed.`,
        summary: {
          total: agents.length,
          successful: successCount,
          failed: failCount,
        },
        results: results,
        refreshedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error refreshing agent profiles:", error);
      res.status(500).json({
        success: false,
        error: "Failed to refresh agent profiles",
        details: error.message,
      });
    }
  },

  /**
   * Retrieve HCS-11 profile for agent using standards SDK
   */
  async getAgentHCS11Profile(req, res) {
    try {
      const { agentId } = req.params;

      if (!agentId) {
        return res.status(400).json({
          success: false,
          error: "Agent ID is required",
        });
      }

      // Get agent from database
      const agent = await AgentModel.findById(agentId);
      if (!agent) {
        return res.status(404).json({
          success: false,
          error: "Agent not found",
        });
      }

      console.log(
        `🔍 Retrieving HCS-11 profile for agent: ${agent.name} (${agent.hederaAccountId})`
      );

      try {
        // Initialize HCS-11 client for profile retrieval
        const client = new HCS11Client({
          network:
            process.env.HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet",
          auth: {
            operatorId: agent.hederaAccountId,
            privateKey: agent.hederaPrivateKey,
          },
          logLevel: "info",
        });

        // Fetch profile by account ID using HCS-11 standard
        const profileResult = await client.fetchProfileByAccountId(
          agent.hederaAccountId,
          process.env.HEDERA_NETWORK === "mainnet" ? "mainnet" : "testnet"
        );

        if (profileResult.success && profileResult.profile) {
          console.log(
            `✅ HCS-11 profile retrieved successfully for ${agent.name}`
          );

          // Parse the profile if it's a string
          let parsedProfile = profileResult.profile;
          if (typeof profileResult.profile === "string") {
            try {
              parsedProfile = client.parseProfileFromString(
                profileResult.profile
              );
            } catch (parseError) {
              console.log(
                `⚠️ Could not parse profile string: ${parseError.message}`
              );
            }
          }

          res.json({
            success: true,
            message: "HCS-11 profile retrieved successfully",
            agent: {
              id: agent._id,
              name: agent.name,
              avatarName: agent.avatarName,
              role: agent.role,
              hederaAccountId: agent.hederaAccountId,
            },
            hcs11Profile: {
              raw: profileResult.profile,
              parsed: parsedProfile,
              profileTopicId: profileResult.profileTopicId,
              accountMemo: profileResult.accountMemo,
              retrievedFrom: "hcs11-standards-sdk",
            },
            metadata: {
              retrievedAt: new Date().toISOString(),
              network: process.env.HEDERA_NETWORK || "testnet",
              sdkMethod: "fetchProfileByAccountId",
            },
          });
        } else {
          console.log(
            `❌ No HCS-11 profile found for account ${agent.hederaAccountId}`
          );

          // Try to get local profile data as fallback
          const localProfile = agent.hcs11Profile || null;

          res.json({
            success: false,
            message: "No HCS-11 profile found on network",
            error: profileResult.error || "Profile not found",
            agent: {
              id: agent._id,
              name: agent.name,
              avatarName: agent.avatarName,
              role: agent.role,
              hederaAccountId: agent.hederaAccountId,
            },
            fallback: {
              localProfile: localProfile,
              memo: agent.hcs11Memo || null,
              profileTopicId: agent.hcs11ProfileTopicId || null,
            },
            recommendations: [
              "Check if the agent has a valid HCS-11 memo set",
              "Verify the profile was properly inscribed using createAndInscribeProfile",
              "Use POST /hr-agents/debug-memo/:agentId to fix memo issues",
            ],
          });
        }
      } catch (hcs11Error) {
        console.error(`❌ HCS-11 client error: ${hcs11Error.message}`);

        res.status(500).json({
          success: false,
          error: "Failed to retrieve HCS-11 profile",
          details: hcs11Error.message,
          agent: {
            id: agent._id,
            name: agent.name,
            hederaAccountId: agent.hederaAccountId,
          },
          troubleshooting: {
            possibleCauses: [
              "Agent credentials invalid",
              "Network connectivity issues",
              "Profile not properly inscribed",
              "Account memo missing or invalid",
            ],
            suggestedActions: [
              "Verify agent Hedera credentials",
              "Check network connectivity",
              "Use debug-memo endpoint to fix account memo",
              "Re-inscribe profile if necessary",
            ],
          },
        });
      }
    } catch (error) {
      console.error("Error retrieving HCS-11 profile:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error while retrieving profile",
        details: error.message,
      });
    }
  },

  /**
   * Verify account memo route handler
   */
  async verifyAccountMemo(req, res) {
    try {
      const { accountId } = req.params;

      if (!accountId) {
        return res.status(400).json({
          success: false,
          error: "Account ID is required",
        });
      }

      const verification = await hrAgentController.verifyHCS11Memo(accountId);

      res.json({
        success: verification.success,
        accountId: accountId,
        verification: verification,
        message: verification.success
          ? "HCS-11 memo verification successful"
          : `Verification failed: ${verification.error}`,
      });
    } catch (error) {
      console.error("Error verifying account memo:", error);
      res.status(500).json({
        success: false,
        error: "Failed to verify account memo",
        details: error.message,
      });
    }
  },

  /**
   * Test LangChain TogetherAI Agent functionality
   */
  async testLangChainAgent(req, res) {
    try {
      console.log(`🧪 Testing LangChain TogetherAI Agent functionality...`);

      // Create a test agent instance
      const testAgent = new LangChainTogetherAIAgent({
        accountId: "0.0.000000",
        privateKey: "test-key",
        network: "testnet",
        operationalMode: "standard",
        verbose: true,
        skipProfileValidation: true,
      });

      // Test initialization
      const initResult = await testAgent.initialize();
      console.log(`✅ Initialization result:`, initResult);

      // Test message processing
      const testPrompt =
        "As an HR agent, provide a brief evaluation of a software developer candidate.";
      const response = await testAgent.processMessage(testPrompt);

      console.log(`✅ Test message processed successfully`);

      res.json({
        success: true,
        message: "LangChain TogetherAI Agent test completed successfully",
        results: {
          initialization: initResult,
          messageProcessing: {
            prompt: testPrompt,
            response: response.response,
            metadata: response.metadata,
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ LangChain TogetherAI Agent test failed:", error);
      res.status(500).json({
        success: false,
        error: "LangChain TogetherAI Agent test failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  },

  /**
   * Test memo creation and validation for debugging
   */
  async testMemoCreation(req, res) {
    try {
      const { agentId } = req.params;

      if (!agentId) {
        return res.status(400).json({
          error: "agentId is required",
        });
      }

      const agent = await AgentModel.findById(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      // Test memo creation using HCS-11 standards SDK
      const profileMemo = hrAgentController.createHCS11ProfileMemo(agent);

      // Test memo parsing
      const parsedMemo = hrAgentController.parseCompactHCS11Memo(profileMemo);

      // Test memo verification if account exists
      let verificationResult = null;
      if (agent.hederaAccountId && agent.hederaAccountId !== "0.0.000000") {
        try {
          verificationResult = await hrAgentController.verifyHCS11Memo(
            agent.hederaAccountId
          );
        } catch (verifyError) {
          verificationResult = {
            success: false,
            error: verifyError.message,
          };
        }
      }

      res.json({
        success: true,
        agent: {
          id: agent._id,
          name: agent.name,
          role: agent.role,
          avatarName: agent.avatarName,
          hederaAccountId: agent.hederaAccountId,
        },
        memo: {
          content: profileMemo,
          length: profileMemo ? profileMemo.length : 0,
          isValid: profileMemo ? profileMemo.length <= 100 : false,
          maxLength: 100,
          type: "hcs11-standards-sdk",
        },
        parsing: {
          canParse: !!parsedMemo,
          parsed: parsedMemo,
        },
        verification: verificationResult,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Error testing memo creation:", error);
      res.status(500).json({
        success: false,
        error: "Failed to test memo creation",
        details: error.message,
      });
    }
  },

  /**
   * Comprehensive system status check
   */
  async systemStatus(req, res) {
    try {
      const agents = await AgentModel.find({});
      const systemInfo = {
        agentCount: agents.length,
        agents: [],
        migration: {
          langchainEnabled: true,
          togetherAIEnabled: !!process.env.TOGETHER_API_KEY,
          hederaEnabled: !!(
            process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY
          ),
          conversationalAgentDisabled: true, // We've migrated away from this
          memoFormat: "hcs-protocol", // Official HCS-11 protocol format
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasTogetherKey: !!process.env.TOGETHER_API_KEY,
          hasHederaKeys: !!(
            process.env.HEDERA_ACCOUNT_ID && process.env.HEDERA_PRIVATE_KEY
          ),
          network: process.env.HEDERA_NETWORK || "testnet",
        },
        hcs11ProfileCreation: {
          method: "createAndInscribeProfile",
          description:
            "Uses HCS-11 standards SDK to create profile and set account memo automatically",
          autoSetsMemo: true,
          profileTopicCreated: true,
          format:
            "Official HCS-11 profile inscribed on Hedera topic with account memo reference",
        },
      };

      for (const agent of agents) {
        const agentStatus = {
          id: agent._id,
          name: agent.name,
          avatarName: agent.avatarName,
          role: agent.role,
          isActive: agent.isActive,
          hederaAccountId: agent.hederaAccountId,
          hasHederaKeys: !!(agent.hederaAccountId && agent.hederaPrivateKey),
          memoStatus: "unknown",
          currentMemo: null,
          expectedMemo: null,
        };

        // Test memo creation using HCS-11 standards SDK
        try {
          const memo = hrAgentController.createHCS11ProfileMemo(agent);
          agentStatus.memoStatus = "can_create";
          agentStatus.memoLength = memo.length;
          agentStatus.expectedMemo = memo;
          agentStatus.isValidLength = memo.length <= 100;

          // Test parsing
          const parsed = hrAgentController.parseCompactHCS11Memo(memo);
          agentStatus.canParse = !!parsed;
          agentStatus.parsed = parsed;
        } catch (memoError) {
          agentStatus.memoStatus = "creation_failed";
          agentStatus.memoError = memoError.message;
        }

        systemInfo.agents.push(agentStatus);
      }

      res.json({
        success: true,
        system: systemInfo,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("❌ Error checking system status:", error);
      res.status(500).json({
        success: false,
        error: "Failed to check system status",
        details: error.message,
      });
    }
  },
};

module.exports = hrAgentController;
