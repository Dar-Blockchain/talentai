# Evaluation System Endpoints

## 📋 **Two Clear Endpoints**

### **Endpoint 1: Create Evaluation Topic**
**Purpose**: Creates a topic for candidate evaluation and returns topic ID

```bash
POST /hedera-tools/create-evaluation-topic
```

**What it does**:
- Creates a new Hedera topic with HCS-11 compliant memo
- Uses agent's public key as submit key
- Saves topic metadata to database
- Returns topic ID for future message submissions

**Request Body**:
```json
{
  "company": "TalentAI",
  "postId": "DEV-001",
  "candidateName": "Hatem",
  "candidateId": "candidate_123",
  "agentId": "675a123456789abcdef12345"
}
```

**Response**:
```json
{
  "success": true,
  "topicId": "0.0.123456",  ← Save this for step 2
  "transactionId": "0.0.123456-1234567890-123456789",
  "topicMemo": "{\"standard\":\"HCS-11\",\"type\":\"candidate_evaluation\",\"company\":\"TalentAI\",\"postId\":\"DEV-001\",\"candidate\":\"Hatem\",\"coordinatorAgent\":\"Sinda-SoftSkill-Agent\",\"timestamp\":\"2024-01-15T10:30:00.000Z\"}",
  "message": "Evaluation topic created for Hatem at TalentAI",
  "createdBy": "Sinda-SoftSkill-Agent"
}
```

---

### **Endpoint 2: Submit Evaluation Message**
**Purpose**: Submits HCS-11 evaluation message to existing topic

```bash
POST /hedera-tools/submit-evaluation-message
```

**What it does**:
- Takes topic ID from step 1
- Creates HCS-11 compliant evaluation message
- Submits message to Hedera topic using agent credentials
- Updates database with evaluation results
- Calculates final results when all agents complete

**Request Body**:
```json
{
  "topicId": "0.0.123456",  ← Use topic ID from step 1
  "agentId": "675a987654321abcdef67890",
  "evaluation": {
    "passed": true,
    "score": 85,
    "feedback": "Candidate demonstrates excellent technical skills in React and Node.js",
    "interviewNotes": "Strong problem-solving abilities, good communication during technical discussion"
  }
}
```

**Response**:
```json
{
  "success": true,
  "topicId": "0.0.123456",
  "messageId": "0.0.123456-1234567890-987654321",
  "agentProfile": {
    "name": "Olga-Technical-Agent",
    "avatarName": "olga",
    "role": "Technical Skills Evaluator",
    "accountId": "0.0.789012"
  },
  "evaluation": {
    "topicId": "0.0.123456",
    "candidate": "Hatem",
    "company": "TalentAI",
    "postId": "DEV-001",
    "result": {
      "passed": true,
      "score": 85,
      "feedback": "Candidate demonstrates excellent technical skills in React and Node.js",
      "interviewNotes": "Strong problem-solving abilities, good communication during technical discussion"
    },
    "timestamp": "2024-01-15T11:00:00.000Z"
  },
  "coordinatorMessage": {
    "to": "coordinator_agent",
    "action": "candidate_approved",
    "summary": "Technical Skills Evaluator evaluation: PASSED (Score: 85)"
  },
  "topicStatus": "active",
  "message": "HCS-11 evaluation message submitted by Olga-Technical-Agent to topic 0.0.123456"
}
```

---

## 🔄 **Complete Workflow**

### **Step 1: Create Topic (One Time)**
```bash
curl -X POST http://localhost:3000/hedera-tools/create-evaluation-topic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "company": "TalentAI",
    "postId": "DEV-001", 
    "candidateName": "Hatem",
    "agentId": "coordinator_agent_id"
  }'

# Response: { "topicId": "0.0.123456" }
```

### **Step 2: Submit Evaluations (Multiple Times)**
```bash
# Agent 1: Sinda (Soft Skills)
curl -X POST http://localhost:3000/hedera-tools/submit-evaluation-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "topicId": "0.0.123456",
    "agentId": "sinda_agent_id",
    "evaluation": {
      "passed": true,
      "score": 88,
      "feedback": "Excellent communication and teamwork skills"
    }
  }'

# Agent 2: Olga (Technical Skills)  
curl -X POST http://localhost:3000/hedera-tools/submit-evaluation-message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "topicId": "0.0.123456",
    "agentId": "olga_agent_id",
    "evaluation": {
      "passed": true,
      "score": 85,
      "feedback": "Strong technical skills in React and Node.js"
    }
  }'

# Continue for all 6 agents...
```

---

## 📋 **HCS-11 Message Format**

The `submit-evaluation-message` endpoint automatically creates HCS-11 compliant messages:

```json
{
  "standard": "HCS-11",
  "type": "agent_validation",
  "agentProfile": {
    "name": "Olga-Technical-Agent",
    "avatarName": "olga",
    "role": "Technical Skills Evaluator",
    "accountId": "0.0.789012"
  },
  "evaluation": {
    "topicId": "0.0.123456",
    "candidate": "Hatem",
    "company": "TalentAI",
    "postId": "DEV-001",
    "result": {
      "passed": true,
      "score": 85,
      "feedback": "Strong technical skills",
      "interviewNotes": "Good problem solving"
    },
    "timestamp": "2024-01-15T11:00:00.000Z"
  },
  "coordinatorMessage": {
    "to": "coordinator_agent",
    "action": "candidate_approved",
    "summary": "Technical Skills Evaluator evaluation: PASSED (Score: 85)"
  }
}
```

---

## 🎯 **Key Benefits**

1. **Clear Separation**:
   - Step 1: Create topic, get topic ID
   - Step 2: Use topic ID to submit evaluations

2. **HCS-11 Compliance**:
   - Automatic HCS-11 message formatting
   - Agent profile included in every message
   - Coordinator notifications built-in

3. **Database Integration**:
   - Evaluations saved to database
   - Final results calculated automatically
   - Topic status tracking

4. **Agent Authentication**:
   - Each agent uses their own Hedera credentials
   - Messages signed with agent's private key

5. **Immutable Record**:
   - All evaluations permanently stored on Hedera network
   - Transparent and auditable process

The workflow is now clearly separated: **create topic → submit messages**! 🚀