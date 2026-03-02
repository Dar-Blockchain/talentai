# TalentAI Platform - API Complete Documentation

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Base URLs](#base-urls)
3. [Authentication](#authentication)
4. [API Endpoints by Category](#api-endpoints-by-category)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Introduction

Welcome to the **TalentAI Platform API**, a comprehensive ecosystem for talent recruitment, evaluation, and HR management powered by Hedera blockchain and HCS-11 standards.

**API Version**: 2.0.0  
**Last Updated**: March 2026

### Key Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 🤖 **AI-Powered Recruitment** - Intelligent candidate matching and assessment
- ⛓️ **Blockchain Integration** - Hedera network for secure transactions
- 📊 **Analytics & Dashboards** - Real-time recruitment metrics
- 💬 **HCS-11 Agent Communication** - Autonomous HR agents with consensus messaging
- 🎯 **Matching Engine** - Advanced candidate-to-job matching
- 📧 **Notification System** - Multi-channel notifications
- 💳 **Payment Integration** - Stripe payment processing

---

## Base URLs

```
Development:  http://localhost:5001
Production:   https://api.talentai.bid
```

---

## Authentication

### Bearer Token (JWT)

All protected endpoints require a JWT token in the `Authorization` header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Token Acquisition

Tokens are obtained through:
- Email + OTP verification (`/auth/verify-otp`)
- Gmail OAuth connection (`/auth/connect-gmail`)

---

## API Endpoints by Category

### 🔐 AUTHENTICATION & USERS

#### Register User
```
POST /auth/register
```
**Public** - No authentication required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (201):**
```json
{
  "message": "Registration successful. Check email for OTP code.",
  "email": "user@example.com",
  "username": "user"
}
```

---

#### Verify OTP
```
POST /auth/verify-otp
```
**Public**

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "location": {
    "ip": "192.168.1.1",
    "city": "Paris",
    "country": "FR",
    "timezone": "Europe/Paris"
  }
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "_id": "user_id",
    "username": "user",
    "email": "user@example.com",
    "isVerified": true
  },
  "token": "eyJhbGc..."
}
```

---

#### Gmail Connection
```
POST /auth/connect-gmail
```
**Public**

**Request Body:**
```json
{
  "email": "user@gmail.com"
}
```

---

#### Logout
```
POST /auth/logout
```
**Protected** - Requires authentication

---

#### Get All Users
```
GET /auth/users
```
**Protected** - Requires Admin role

---

### 👤 PROFILES

#### Create/Update Profile
```
POST /profiles
```
**Protected**

**Request Body:**
```json
{
  "type": "Candidate",
  "skills": [
    { "name": "TypeScript", "proficiencyLevel": 4 },
    { "name": "React", "proficiencyLevel": 3 }
  ],
  "bio": "Full-stack developer with 5 years experience",
  "experience": 5,
  "education": [...],
  "projects": [...],
  "certifications": [...],
  "socialLinks": {
    "github": "https://github.com/user",
    "linkedin": "https://linkedin.com/in/user"
  },
  "location": {
    "country": "France",
    "city": "Paris"
  },
  "languages": [
    { "name": "English", "proficiency": "Advanced" }
  ],
  "availability": "Available",
  "hourlyRate": 50,
  "preferredWorkType": ["Remote", "Hybrid"]
}
```

---

#### Get All Profiles
```
GET /profiles
```
**Protected**

---

#### Get Your Profile
```
GET /profiles/me
```
**Protected**

---

#### Get Profile by ID
```
GET /profiles/{userId}
```
**Protected**

---

#### Search Profiles by Skills
```
GET /profiles/search/skills?skills=TypeScript,React,Node.js
```
**Protected**

---

#### Delete Your Profile
```
DELETE /profiles
```
**Protected**

---

### 📝 POSTS (Job Postings)

#### Create Post
```
POST /post/save-post
```
**Protected**

---

#### Get All Posts (Public)
```
GET /post/search
```
**Public** - No authentication required

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `search` - Search term
- `status` - Filter by status

---

#### Get All Posts (Authenticated)
```
GET /post/get-all-posts
```
**Protected**

---

#### Get My Posts
```
GET /post/my-posts
```
**Protected**

---

#### Get Post Details (Public)
```
GET /post/details/{id}
```
**Public**

---

#### Get Post Details (Admin)
```
GET /post/getPostById/{id}
```
**Protected**

---

#### Update Post
```
PUT /post/updatePost/{id}
```
**Protected** - Owner only

---

#### Update Post Status
```
PATCH /post/updatePostStatus/{id}
```
**Protected** - Owner only

**Request Body:**
```json
{
  "status": "active"
}
```

---

#### Delete Post
```
DELETE /post/deletePost/{id}
```
**Protected** - Owner only

---

#### Get Posts by User's Top Skills
```
GET /post/adsPost
```
**Protected** - Returns 3 posts based on top skills

---

#### Send Technical Test
```
POST /post/send-technical-test
```
**Protected**

**Request Body:**
```json
{
  "candidateEmail": "candidate@example.com",
  "testDetails": {...}
}
```

---

#### Get Public Stats
```
GET /post/public-stats
```
**Public**

---

#### Get Post Metrics
```
GET /post/metrics
```
**Protected**

---

### 💰 POST PAYMENTS

#### Calculate Post Price
```
GET /post/payment/calculate-price/{postId}
```
**Protected**

---

#### Process Payment
```
POST /post/payment/process
```
**Protected**

**Request Body:**
```json
{
  "postId": "post_id",
  "agentId": "agent_id"
}
```

---

#### Get Payment History
```
GET /post/payment/history
```
**Protected**

---

#### Get Payment Details
```
GET /post/payment/details/{postId}
```
**Protected**

---

### 🔍 MATCHING ENGINE

#### Get Candidate Matches for Job
```
GET /matching/jobs/{jobPostId}/matches
```
**Protected**

**Response (200):**
```json
{
  "success": true,
  "jobPost": "job_id",
  "count": 5,
  "matches": [
    {
      "candidateId": "candidate_id",
      "name": "John Doe",
      "score": 0.95,
      "skills": [
        { "name": "TypeScript", "level": 4 },
        { "name": "React", "level": 3 }
      ]
    }
  ]
}
```

---

#### Configure Matching
```
POST /matchingConfig
GET /matchingConfig
```

---

### 📋 SKILL & POST-INTERVIEW ASSESSMENTS

#### Create Skill Assessment
```
POST /skill-interview-assessments
```
**Protected**

---

#### Get Skill Assessments
```
GET /skill-interview-assessments
```
**Protected**

---

#### Create Post-Interview Assessment
```
POST /post-interview-assessments
```
**Protected**

---

#### Get Post-Interview Assessments
```
GET /post-interview-assessments
```
**Protected**

---

### 📊 POST STEPS & CANDIDATE PROGRESS

#### Create Post Steps
```
POST /post-steps
```
**Protected**

---

#### Get Post Steps
```
GET /post-steps
```
**Protected**

---

#### Get Candidate Progress
```
GET /candidate-progress
```
**Protected**

**Query Parameters:**
- `postId` - Filter by post
- `candidateId` - Filter by candidate
- `status` - Filter by status

---

#### Unlock Candidate
```
POST /unlock-candidate
```
**Protected**

---

### 🧠 EVALUATION (AI-Powered)

#### Generate Interview Questions
```
POST /api/generate-questions
```
**Public**

**Request Body:**
```json
{
  "skills": "TypeScript, React, Node.js",
  "experience": "3 years of full-stack development"
}
```

**Response (200):**
```json
{
  "questions": "1. Describe a complex React project...\n2. How do you handle state management..."
}
```

---

### 💬 COMMUNICATION & CHAT

#### Create Chat Conversation
```
POST /chat
```
**Protected**

---

#### Get Chat Conversations
```
GET /chat
```
**Protected**

---

### 🤖 HR AGENTS (HCS-11)

#### Initialize All HR Agents
```
POST /hr-agents/initialize
```
**Protected** - Admin role required

**Request Body:**
```json
{
  "name": "Sarah-TechLead-Agent",
  "avatarName": "sarah",
  "role": "Technical Leadership Specialist",
  "description": "Validates technical leadership skills",
  "hcs11CustomProfile": {
    "agentPersonality": {
      "communicationStyle": "technical_analytical",
      "approachMethod": "systematic_deep_dive",
      "evaluationPhilosophy": "Focus on scalable architecture"
    },
    "specializedCapabilities": ["system_architecture_assessment"],
    "evaluationFramework": {
      "primaryFocus": "backend_systems",
      "assessmentCriteria": ["system_design_thinking"]
    },
    "domainExpertise": {
      "primaryTechnologies": ["Node.js", "Python"],
      "specializations": ["API_gateway_design"]
    }
  }
}
```

---

#### Initialize Single HR Agent
```
POST /hr-agents/initialize-single
```
**Protected** - Admin role required

Same request body as above.

---

#### Get All HR Agents
```
GET /hr-agents
```
**Protected** - Admin role required

---

#### Get Agent by Avatar Name
```
GET /hr-agents/avatar/{avatarName}
```
**Protected** - Admin role required

**Avatar Names:** sinda, olga, jaaf, sam, julia, yuka

---

#### Get Agent by Role
```
GET /hr-agents/role/{role}
```
**Protected** - Admin role required

---

#### Delete All Agents
```
DELETE /hr-agents/all
```
**Protected** - Admin role required

---

#### HR Agent Messaging (HCS-10/HCS-11)
```
POST /hr-agents/submit-evaluation-message
```
**Protected**

**Request Body:**
```json
{
  "agentAId": "mongo_id_of_agent_a",
  "agentBId": "mongo_id_of_agent_b",
  "candidateId": "candidate_id",
  "message": "Please review this candidate's technical skills."
}
```

---

#### Get Agent Profile
```
GET /hr-agents/profile/{agentId}
```
**Protected** - Admin role required

---

#### Get HCS-11 Profile from Network
```
GET /hr-agents/hcs11-profile/{agentId}
```
**Protected** - Admin role required

---

#### Fix Agent Memo
```
POST /hr-agents/fix-memo/{agentId}
```
**Protected** - Admin role required

---

#### Check All Agents Configuration
```
GET /hr-agents/check-all
```
**Protected** - Admin role required

---

#### Diagnose Coordinator Issues
```
GET /hr-agents/diagnose/{coordinatorId}
```
**Protected** - Admin role required

---

#### Fix Proof of Reception
```
POST /hr-agents/fix-proof-of-reception
```
**Protected** - Admin role required

**Request Body:**
```json
{
  "coordinatorId": "agent_id",
  "topicId": "hedera_topic_id",
  "candidateId": "candidate_id"
}
```

---

### ⛓️ HEDERA TOOLS

#### Create Autonomous Agent
```
POST /api/create-agent
```
**Public**

**Request Body:**
```json
{
  "name": "MyAutonomousAgent"
}
```

---

#### Create Fungible Token
```
POST /hedera-tools/create-token
```
**Protected**

**Request Body:**
```json
{
  "name": "My Token",
  "symbol": "MTK",
  "decimals": 2,
  "initialSupply": 1000,
  "agentId": "agent_mongo_id"
}
```

---

#### Create TalentAI Token (TALAI)
```
POST /api/create-talentai-token
```
**Protected**

**Request Body:**
```json
{
  "agentName": "MyAutonomousAgent"
}
```

---

#### Mint TALAI Tokens
```
POST /api/mint-tokens
```
**Protected**

**Request Body:**
```json
{
  "agentName": "MyAutonomousAgent",
  "userId": "user_id",
  "amount": 100
}
```

---

#### Create Consensus Topic
```
POST /hedera-tools/create-topic
```
**Protected**

**Request Body:**
```json
{
  "memo": "Optional topic memo",
  "agentId": "agent_id"
}
```

---

#### Submit Message to Topic
```
POST /hedera-tools/submit-message
```
**Protected**

**Request Body:**
```json
{
  "topicId": "hedera_topic_id",
  "message": "Hello, Hedera!",
  "agentId": "agent_id"
}
```

---

#### Create Evaluation Topic
```
POST /hedera-tools/create-evaluation-topic
```
**Protected**

**Request Body:**
```json
{
  "company": "TalentAI",
  "postId": "DEV-001",
  "candidateName": "Hatem",
  "agentId": "agent_id"
}
```

---

#### Submit Evaluation Message
```
POST /hedera-tools/submit-evaluation-message
```
**Protected**

**Request Body:**
```json
{
  "topicId": "hedera_topic_id",
  "agentId": "agent_id",
  "evaluation": {
    "passed": true,
    "score": 85,
    "feedback": "Excellent technical skills",
    "interviewNotes": "Strong problem-solving"
  }
}
```

---

#### Get Account Balance
```
GET /hedera-tools/balance?accountId={accountId}&agentId={agentId}
```
**Protected**

---

#### Get My Balance
```
GET /hedera-tools/my-balance?agentId={agentId}
```
**Protected**

---

#### Get Available Tools
```
GET /hedera-tools/tools?agentId={agentId}
```
**Protected**

---

### 🆔 HCS-11 STANDARDS

#### Check HCS-11 Service Status
```
GET /api/hcs11/status
```
**Public**

---

#### Validate HCS-11 Profile
```
POST /api/hcs11/validate
```
**Protected**

---

#### Create HCS-11 Profile
```
POST /api/hcs11/create-profile
```
**Protected**

**Request Body:**
```json
{
  "companyName": "TechCorp AI",
  "companyDescription": "Leading AI solutions provider",
  "agentConfig": {
    "displayName": "TechCorp Assistant",
    "agentType": "AUTONOMOUS",
    "capabilities": ["CUSTOMER_SUPPORT", "DATA_ANALYSIS"],
    "model": "GPT-4",
    "bio": "Advanced AI assistant",
    "socialLinks": {
      "website": "https://techcorp.com"
    }
  }
}
```

---

#### Create and Inscribe HCS-11 Profile
```
POST /api/hcs11/create-and-inscribe
```
**Protected**

Same request body as above. This endpoint also writes to Hedera.

---

#### Create Company Agent with HCS-11
```
POST /api/hcs11/create-company-agent
```
**Protected**

**Request Body:**
```json
{
  "companyName": "TechCorp AI",
  "postId": "POST-2024-001",
  "agentPosition": "Senior Full Stack Developer",
  "companyDescription": "Leading AI solutions",
  "agentConfig": {
    "capabilities": ["RECRUITING", "CANDIDATE_EVALUATION"],
    "model": "GPT-4",
    "industry": "Technology"
  }
}
```

---

### 🔔 NOTIFICATION SYSTEM

#### Create Notification
```
POST /notification-system
```
**Protected**

**Request Body:**
```json
{
  "recipient": "user_id",
  "content": "Your profile has been updated successfully.",
  "url": "https://app.talentai.bid/profile"
}
```

---

#### Get My Notifications
```
GET /notification-system
```
**Protected**

**Query Parameters:**
- `unread` - Filter unread notifications
- `limit` - Number of notifications (default: 20)
- `offset` - Pagination offset

---

#### Get Notification by ID
```
GET /notification-system/{id}
```
**Protected** - Owner or Admin

---

#### Mark Notification as Read
```
PATCH /notification-system/{id}/read
```
**Protected** - Owner or Admin

---

#### Delete Notification
```
DELETE /notification-system/{id}
```
**Protected** - Owner or Admin

---

### 🎯 INTERNAL CAMPAIGNS

#### Create Internal Campaign
```
POST /internal-campaigns
```
**Protected**

**Request Body:**
```json
{
  "title": "Q4 Skills Assessment",
  "type": "SKILLS_MAPPING",
  "description": "Assess employee skills for Q4",
  "anonymityMode": "NOMINATIVE",
  "modules": {
    "type": "SKILL_TEST",
    "config": {},
    "order": 1
  },
  "accessMethod": "LINK",
  "targetDepartment": "Engineering",
  "targetEmployeeCount": 50,
  "deadline": "2026-03-31T23:59:59Z",
  "skill": "Leadership, Communication"
}
```

---

#### Get Company Campaigns
```
GET /internal-campaigns
```
**Protected**

**Query Parameters:**
- `status` - Filter: DRAFT, ACTIVE, PAUSED, CLOSED, EXPIRED

---

#### Get Campaign Details
```
GET /internal-campaigns/{campaignId}
```
**Protected** - Owner or Admin

---

#### Update Campaign
```
PUT /internal-campaigns/{campaignId}
```
**Protected** - Owner only

---

#### Delete Campaign
```
DELETE /internal-campaigns/{campaignId}
```
**Protected** - Owner only

---

#### Get Campaign Statistics
```
GET /internal-campaigns/{campaignId}/stats
```
**Protected** - Owner or Admin

---

### 👥 CAMPAIGN PARTICIPANTS

#### Create Campaign Participant
```
POST /campaign-participants
```
**Protected**

---

#### Get Campaign Participants
```
GET /campaign-participants
```
**Protected**

---

### 🏢 COMPANY MANAGEMENT

#### Get Permissions
```
GET /permissions
```
**Protected**

---

#### Get Company Admin Permissions
```
GET /admin
```
**Protected** - Admin role

---

#### Get Plan Limits
```
GET /plan-limits
```
**Protected**

---

#### Create Company Invitation
```
POST /CompanyInvitation
```
**Protected**

---

#### Get Company Invitations
```
GET /CompanyInvitation
```
**Protected**

---

#### Create Company Membership
```
POST /CompanyMembership
```
**Protected**

---

#### Get Company Memberships
```
GET /CompanyMembership
```
**Protected**

---

#### Get Dashboard
```
GET /dashboard
```
**Protected**

---

### 💳 PAYMENT

#### Process Payment
```
POST /payment
```
**Protected**

---

#### Get Payments
```
GET /payment
```
**Protected**

---

#### Stripe Integration
```
POST /api/stripe
```
**Protected**

---

### 📋 UTILITIES

#### Create To-Do
```
POST /todo
```
**Protected**

---

#### Get To-Dos
```
GET /todo
```
**Protected**

---

#### Create Feedback
```
POST /feedback
```
**Protected**

---

#### Get Feedbacks
```
GET /feedback
```
**Protected**

---

#### Get System Logs
```
GET /logs
```
**Protected** - Admin role

---

#### Create Task
```
POST /task
```
**Protected**

---

#### Get Tasks
```
GET /task
```
**Protected**

---

#### Get Tokens
```
GET /tokens
```
**Protected**

---

### 📚 ADDITIONAL ROUTES

#### LinkedIn Post Generation
```
POST /linkedinPost
GET /linkedinPost
```
**Protected**

---

#### Pipeline Interview
```
GET /api/pipeline-interview
```
**Protected**

---

#### Generate LinkedIn Post
```
POST /linkedinPost
```
**Protected**

---

## Error Handling

### Standard Error Response

```json
{
  "error": "Error code or message",
  "details": "Detailed error description",
  "timestamp": "2026-03-01T10:30:00Z",
  "path": "/api/endpoint"
}
```

### Common HTTP Status Codes

| Status | Meaning |
|--------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal error |
| 503 | Service Unavailable |

---

## Rate Limiting

**Rate limits apply to:**
- Public endpoints: 100 requests per minute
- Authenticated endpoints: 500 requests per minute
- Admin endpoints: 1000 requests per minute

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1614556800
```

---

## Environment Variables

### Required
```
MONGODB_URI=mongodb://...
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=...
JWT_SECRET=your_secret_key
```

### Optional
```
STRIPE_SECRET_KEY=...
GOOGLE_OAUTH_CLIENT_ID=...
GMAIL_APP_PASSWORD=...
```

---

## Support & Contact

- 📧 Email: support@talentai.com
- 🐛 Report Issues: https://github.com/talentai/issues
- 📖 Full Documentation: https://docs.talentai.com

---

**Last Updated**: March 2026  
**API Version**: 2.0.0
