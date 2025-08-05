# Agent-Based Evaluation System with Hedera HCS-11

This system enables HR agents to evaluate candidates using Hedera Consensus Service with HCS-11 standard compliance.

## Overview

The system allows:
1. **HR Agents** (stored in database with Hedera wallets) to perform evaluations
2. **Evaluation Topics** to be created for candidate pipelines
3. **Validation Messages** to be sent using HCS-11 standard
4. **Coordinator Agent** to receive and process evaluation results

## Workflow

### 1. Initialize HR Agents
First, create the HR agents with Hedera wallets:

```bash
POST /hr-agents/initialize
```

This creates 6 agents:
- **Sinda** - Soft Skills Specialist
- **Olga** - Technical Skills Evaluator  
- **Jaaf** - Experience Validator
- **Sam** - Cultural Fit Assessor
- **Julia** - Leadership Potential Evaluator
- **Yuka** - Communication Skills Specialist

### 2. Create Evaluation Topic
Create a topic for a specific candidate evaluation pipeline:

```bash
POST /hedera-tools/create-evaluation-topic
Content-Type: application/json

{
  "company": "TalentAI",
  "postId": "DEV-001",
  "candidateName": "Hatem",
  "candidateId": "candidate_123",
  "agentId": "675a123456789abcdef12345"
}
```

**Response:**
```json
{
  "success": true,
  "topicId": "0.0.123456",
  "transactionId": "0.0.123456-1234567890-123456789",
  "topicMemo": "{\"standard\":\"HCS-11\",\"type\":\"candidate_evaluation\",\"company\":\"TalentAI\",\"postId\":\"DEV-001\",\"candidate\":\"Hatem\",\"coordinatorAgent\":\"Sinda-SoftSkill-Agent\",\"timestamp\":\"2024-01-15T10:30:00.000Z\"}",
  "message": "Evaluation topic created for Hatem at TalentAI",
  "createdBy": "Sinda-SoftSkill-Agent"
}
```

### 3. Send Agent Validation Messages
Each agent sends their evaluation using their own Hedera credentials:

```bash
POST /hedera-tools/send-validation-message
Content-Type: application/json

{
  "topicId": "0.0.123456",
  "agentId": "675a123456789abcdef12345",
  "evaluation": {
    "passed": true,
    "score": 85,
    "feedback": "Candidate demonstrates excellent technical skills in React and Node.js",
    "interviewNotes": "Strong problem-solving abilities, good communication during technical discussion"
  }
}
```

**Response:**
```json
{
  "success": true,
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
  "message": "Validation message sent by Olga-Technical-Agent (Technical Skills Evaluator)"
}
```

### 4. HCS-11 Message Format

All messages follow HCS-11 standard:

**Topic Creation Message:**
```json
{
  "standard": "HCS-11",
  "type": "candidate_evaluation",
  "company": "TalentAI",
  "postId": "DEV-001",
  "candidate": "Hatem",
  "coordinatorAgent": "Sinda-SoftSkill-Agent",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Agent Validation Message:**
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
      "feedback": "Excellent technical skills",
      "interviewNotes": "Strong problem-solving"
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

### 5. Query Evaluation Results

**Get specific evaluation topic:**
```bash
GET /hedera-tools/evaluation-topic/0.0.123456
```

**Get all evaluation topics:**
```bash
GET /hedera-tools/evaluation-topics?company=TalentAI&postId=DEV-001&status=active
```

## Agent Roles and Responsibilities

| Agent | Avatar | Role | Evaluates |
|-------|--------|------|-----------|
| Sinda | sinda | Soft Skills Specialist | Communication, teamwork, emotional intelligence |
| Olga | olga | Technical Skills Evaluator | Programming skills, technical knowledge |
| Jaaf | jaaf | Experience Validator | Work history, relevant experience |
| Sam | sam | Cultural Fit Assessor | Values alignment, team compatibility |
| Julia | julia | Leadership Potential Evaluator | Leadership skills, management potential |
| Yuka | yuka | Communication Skills Specialist | Presentation skills, written communication |

## Automatic Evaluation Completion

When all agents have submitted their evaluations:
- Topic status changes to "completed"
- Final recommendation is calculated (70% pass rate required)
- Overall score is averaged across all evaluations

## Security Features

- Each agent uses their own Hedera credentials
- Private keys are never exposed in API responses
- All messages are immutably stored on Hedera network
- HCS-11 compliance ensures message standardization

## Example Complete Workflow

```bash
# 1. Initialize agents (one-time setup)
POST /hr-agents/initialize

# 2. Create evaluation topic
POST /hedera-tools/create-evaluation-topic
{
  "company": "TalentAI",
  "postId": "DEV-001", 
  "candidateName": "Hatem",
  "agentId": "sinda_agent_id"
}

# 3. Each agent evaluates (6 separate calls)
POST /hedera-tools/send-validation-message
{
  "topicId": "0.0.123456",
  "agentId": "olga_agent_id",
  "evaluation": {
    "passed": true,
    "score": 85,
    "feedback": "Strong technical skills"
  }
}

# 4. Check final results
GET /hedera-tools/evaluation-topic/0.0.123456
```

This system provides a transparent, immutable, and standardized way to conduct candidate evaluations using blockchain technology.