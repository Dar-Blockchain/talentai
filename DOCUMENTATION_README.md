# 🚀 TalentAI Platform API - Complete Documentation

## Overview

This is the **complete, production-ready API documentation** for the TalentAI Platform - a comprehensive talent recruitment, evaluation, and HR management system powered by Hedera blockchain and HCS-11 standards.

### ✨ Highlights
- 📊 **50+ API Endpoints** - Fully documented with examples
- 🔐 **Secure Authentication** - JWT-based with OAuth support
- 🤖 **AI-Powered Recruitment** - Intelligent matching and assessment
- ⛓️ **Blockchain Integration** - Hedera network with HCS-10/HCS-11
- 📈 **Real-time Analytics** - Dashboard metrics and reporting
- 💼 **Enterprise Ready** - Rate limiting, monitoring, error handling

---

## 📚 Documentation Files

### 🟢 **START HERE**

#### 1. [`QUICK_START_GUIDE.md`](./QUICK_START_GUIDE.md)
**⏱️ 5 minutes to your first API call**
- Server setup
- Authentication walkthrough
- Copy-paste curl commands
- Postman/Insomnia setup
- Common requests with examples

👉 **Start with this if you're new!**

---

### 🔵 **Main Reference**

#### 2. [`SWAGGER_API_DOCUMENTATION.md`](./SWAGGER_API_DOCUMENTATION.md)
**Complete API Reference (700+ lines)**
- All 50+ endpoints documented
- Request/response examples
- Error codes and solutions
- Authentication flows
- Best practices

👉 **Use this for endpoint details**

---

### 🟣 **Architecture & Design**

#### 3. [`API_ARCHITECTURE.md`](./API_ARCHITECTURE.md)
**System Design and Routes (500+ lines)**
- System architecture diagram
- Route organization by category
- Data models
- Integration points
- Security features

👉 **Use this to understand how it all fits together**

---

### 🟠 **Navigation & Index**

#### 4. [`API_ENDPOINTS_SUMMARY.md`](./API_ENDPOINTS_SUMMARY.md)
**Quick navigation and index**
- Navigation by role (Dev, QA, etc.)
- Feature-based endpoint finder
- Statistics and coverage
- Support & troubleshooting

👉 **Use this to find what you need fast**

---

### 🟡 **Interactive Documentation**

#### 5. **Swagger UI** (Visual API Explorer)
```
http://localhost:5001/api/docs
```
- Interactive endpoint testing
- Real-time request/response
- Schema visualization
- Try it out functionality

#### 6. **Campaign API Docs**
```
http://localhost:5001/api/docs/campaigns
```
- Specific documentation for campaign management
- Participant endpoints
- Statistics and metrics

---

## 🗺️ Quick Navigation

### By User Type

| Role | Start Here | Learn | Reference |
|------|-----------|-------|-----------|
| **Backend Dev** | QUICK_START_GUIDE.md | API_ARCHITECTURE.md | swagger.json |
| **Frontend Dev** | QUICK_START_GUIDE.md | SWAGGER_API_DOCUMENTATION.md | Swagger UI |
| **DevOps/SRE** | API_ARCHITECTURE.md | Security section | Environment vars |
| **QA/Tester** | QUICK_START_GUIDE.md | Error codes | Test sequences |
| **Architect** | API_ARCHITECTURE.md | Data models | Integration points |

### By Feature

| Feature | Documentation |
|---------|-----------------|
| **Authentication** | QUICK_START_GUIDE.md (Steps 1-2) |
| **Profiles** | SWAGGER_API_DOCUMENTATION.md → Profiles |
| **Job Posts** | SWAGGER_API_DOCUMENTATION.md → Posts |
| **Matching** | SWAGGER_API_DOCUMENTATION.md → Matching |
| **Interviews** | SWAGGER_API_DOCUMENTATION.md → Interviews |
| **HR Agents** | SWAGGER_API_DOCUMENTATION.md → HR Agents |
| **Blockchain** | QUICK_START_GUIDE.md + SWAGGER_API_DOCUMENTATION.md |
| **Notifications** | SWAGGER_API_DOCUMENTATION.md → Notifications |
| **Campaigns** | swagger-campaigns.json |

---

## 🚀 Five-Minute Quickstart

### 1. Start Server
```bash
cd Backend
npm install
npm start
```
Server: `http://localhost:5001`

### 2. Register User
```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. Verify OTP
```bash
curl -X POST http://localhost:5001/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

### 4. Save Token
```bash
# Copy "token" from response
export TOKEN="your_jwt_token_here"
```

### 5. Make Authenticated Request
```bash
curl -X GET http://localhost:5001/profiles/me \
  -H "Authorization: Bearer $TOKEN"
```

✅ **That's it!** You're now authenticated and can access any endpoint.

---

## 📊 API Statistics

### Coverage
- ✅ **50+ Endpoints** fully documented
- ✅ **14 Categories** organized by feature
- ✅ **100+ Code Examples** ready to use
- ✅ **4 Markdown Guides** for different purposes
- ✅ **3 Swagger JSON** files for automation

### Endpoints by Category
```
🔐 Authentication    →  5 endpoints
👤 Profiles         →  6 endpoints
📝 Posts/Jobs       → 15 endpoints
💰 Payments         →  4 endpoints
🔍 Matching         →  2 endpoints
📊 Interviews       →  3 endpoints
🤖 HR Agents        → 12 endpoints
⛓️ Hedera Tools     → 10 endpoints
🆔 HCS-11           →  5 endpoints
🔔 Notifications    →  5 endpoints
📊 Campaigns        →  6 endpoints
🏢 Company          →  6 endpoints
💬 Chat             →  2 endpoints
📋 Utilities        →  7 endpoints
```

---

## 🔐 Authentication

All protected endpoints require a JWT token. Get one by:

### Option 1: Email + OTP
```bash
# Step 1: Register
POST /auth/register
Body: { "email": "user@example.com" }

# Step 2: Verify OTP (check email)
POST /auth/verify-otp  
Body: { "email": "...", "otp": "123456" }
Response: { "token": "eyJ..." }
```

### Option 2: Gmail OAuth
```bash
POST /auth/connect-gmail
Body: { "email": "user@gmail.com" }
Response: { "token": "eyJ..." }
```

### Use Token
```bash
GET /profiles/me
Header: Authorization: Bearer eyJ...
```

---

## 🎯 Common Tasks

### Create Your Profile
```bash
POST /profiles
Body: {
  "type": "Candidate",
  "skills": [{"name": "React", "proficiencyLevel": 4}],
  "bio": "Full-stack developer",
  "experience": 5
}
```

### Post a Job (Company)
```bash
POST /post/save-post
Body: {
  "title": "Senior Developer",
  "description": "...",
  "skills": [...],
  "salary": {"min": 50000, "max": 80000}
}
```

### Find Candidate Matches
```bash
GET /matching/jobs/{jobPostId}/matches
Response: [
  { "candidateId": "...", "name": "John", "score": 0.95 }
]
```

### Create Internal Campaign
```bash
POST /internal-campaigns
Body: {
  "title": "Q4 Skills Assessment",
  "type": "SKILLS_MAPPING",
  "modules": {"type": "SKILL_TEST", "order": 1}
}
```

### Initialize HR Agents
```bash
POST /hr-agents/initialize-single
Body: {
  "name": "Sarah-TechLead-Agent",
  "avatarName": "sarah",
  "role": "Technical Leadership Specialist",
  "description": "..."
}
```

---

## 🛠️ Tools & Integrations

### Recommended Tools
- **Postman** - API testing (collection setup in QUICK_START_GUIDE.md)
- **Insomnia** - REST client
- **curl** - Command line (examples in documentation)
- **Swagger UI** - Interactive docs at http://localhost:5001/api/docs

### External Services
- **MongoDB** - Primary database
- **Hedera Network** - Blockchain transactions
- **Stripe** - Payment processing
- **Gmail/Google OAuth** - User authentication
- **HCS-11 Standards** - Agent identity profiles

---

## 📈 Features by Version

### Current Version: 2.0.0 (March 2026)

#### ✨ Key Features
- 🔐 **JWT Authentication** with email OTP and Gmail OAuth
- 👤 **User Profiles** with skills, experience, education
- 📝 **Job Posting** with advanced search and filtering
- 🔍 **Intelligent Matching** - AI-powered candidate-to-job matching
- 📊 **Skill Assessments** - Interview questions and evaluation
- 🤖 **HR Agents** - 6 autonomous agents with HCS-11 profiles
- ⛓️ **Blockchain** - Hedera integration with tokens and topics
- 🆔 **HCS-11** - Identity and profile management standards
- 🔔 **Notifications** - Real-time system notifications
- 📊 **Campaigns** - Internal employee surveys and assessments
- 💰 **Payments** - Stripe integration for job posting fees
- 💬 **Chat** - Direct messaging between users

---

## 🔍 Finding Information

### I want to...
- **Get started quickly** → [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)
- **Understand the architecture** → [API_ARCHITECTURE.md](./API_ARCHITECTURE.md)
- **Find a specific endpoint** → [API_ENDPOINTS_SUMMARY.md](./API_ENDPOINTS_SUMMARY.md)
- **See detailed examples** → [SWAGGER_API_DOCUMENTATION.md](./SWAGGER_API_DOCUMENTATION.md)
- **Try it interactively** → http://localhost:5001/api/docs
- **Understand a specific feature** → Use table of contents in relevant guide

---

## 📞 Support

### Documentation
- 📧 Email: support@talentai.com
- 🐛 Issues: https://github.com/talentai/issues
- 💬 Community: https://discord.gg/talentai
- 📖 Full Docs: https://docs.talentai.com

### Useful Links
- 🚀 API Base URL: http://localhost:5001 (dev) / https://api.talentai.bid (prod)
- 📖 Swagger UI: http://localhost:5001/api/docs
- 🔗 GitHub: https://github.com/talentai
- 💎 Hedera Explorer: https://hashscan.io/testnet

---

## ✅ Verification Checklist

- [ ] API server running on port 5001
- [ ] Can access http://localhost:5001/ (welcome message)
- [ ] Swagger UI available at http://localhost:5001/api/docs
- [ ] MongoDB connection working
- [ ] Can register and verify users
- [ ] JWT tokens being issued correctly
- [ ] Can make authenticated requests
- [ ] Error responses formatted correctly

---

## 🎓 Learning Path

### For Beginners
1. Read: **QUICK_START_GUIDE.md** (5 min)
2. Try: Run first curl command
3. Test: Register and get token
4. Explore: Swagger UI

### For Intermediate Users
1. Read: **SWAGGER_API_DOCUMENTATION.md** (your feature)
2. Understand: API_ARCHITECTURE.md
3. Test: Use Postman/Insomnia
4. Build: Simple integration

### For Advanced Users
1. Review: swagger.json schema details
2. Optimize: Implement caching
3. Monitor: Rate limits and errors
4. Scale: Load testing and optimization

---

## 📝 Document Index

```
📚 Documentation Suite

├── QUICK_START_GUIDE.md
│   └── 5-minute setup & common tasks
│
├── SWAGGER_API_DOCUMENTATION.md  
│   └── 700+ lines of detailed endpoint docs
│
├── API_ARCHITECTURE.md
│   └── System design & route structure
│
├── API_ENDPOINTS_SUMMARY.md
│   └── Navigation index
│
├── swagger.json (Backend/)
│   └── OpenAPI 3.0 specification
│
├── swagger-complete.json (Backend/)
│   └── Unified complete specification
│
└── swagger-campaigns.json (Backend/docs/)
    └── Campaign-specific endpoints

Plus: 36+ route files & 35+ controller files
```

---

## 🎯 Next Steps

### For Developers
1. ✅ Read QUICK_START_GUIDE.md
2. ✅ Start the API server
3. ✅ Test authentication flow
4. ✅ Try your first endpoint
5. ✅ Set up Postman/Insomnia
6. ✅ Review relevant documentation
7. ✅ Build your integration

### For Architects
1. ✅ Review API_ARCHITECTURE.md
2. ✅ Understand data models
3. ✅ Check integration points
4. ✅ Review security features
5. ✅ Plan your implementation

### For DevOps
1. ✅ Check environment variables
2. ✅ Review security section
3. ✅ Set up monitoring
4. ✅ Configure rate limiting
5. ✅ Plan deployment

---

## 📄 File Structure

```
project-root/
├── QUICK_START_GUIDE.md ⭐ START HERE
├── SWAGGER_API_DOCUMENTATION.md
├── API_ARCHITECTURE.md
├── API_ENDPOINTS_SUMMARY.md
├── README.md (this file)
│
├── Backend/
│   ├── swagger.json (main spec - 5600+ lines)
│   ├── swagger-complete.json (unified)
│   ├── docs/swagger-campaigns.json
│   ├── routes/ (36 files)
│   ├── controllers/ (35+ files)
│   ├── config/register-routes.js
│   └── ... (more backend files)
│
└── ... (frontend files)
```

---

## 🚀 Ready to Build?

### Option 1: Quick Test (5 min)
```bash
# Start server
cd Backend && npm start

# In another terminal
bash QUICK_START_GUIDE.md  # Follow the steps
```

### Option 2: Complete Setup (30 min)
1. Read QUICK_START_GUIDE.md thoroughly
2. Set up Postman with collection
3. Test all basic endpoints
4. Review SWAGGER_API_DOCUMENTATION.md
5. Start building your feature

### Option 3: Deep Dive (2+ hours)
1. Study API_ARCHITECTURE.md
2. Review swagger.json schemas
3. Understand all 50+ endpoints
4. Plan your integration
5. Implement with full context

---

## ✨ Key Points

- **Well Documented**: 700+ lines across 4 guides + 50+ endpoints
- **Easy to Start**: 5-minute quickstart guide
- **Complete Examples**: Every endpoint has curl/code examples
- **Multiple Formats**: Markdown, Swagger JSON, interactive UI
- **Role-Based**: Guides for devs, QA, architects, etc.
- **Production Ready**: Security, rate limiting, error handling

---

## 📊 Last Updated

- **Version**: 2.0.0
- **Date**: March 2026
- **Status**: ✅ Production Ready
- **Endpoints**: 50+ fully documented
- **Coverage**: 100% of major features

---

## 🎉 You're All Set!

Now you have everything you need to:
- ✅ Understand the API
- ✅ Start making requests
- ✅ Build integrations
- ✅ Deploy to production
- ✅ Get support when needed

### Quick Links
- 📖 [Quick Start - 5 min](./QUICK_START_GUIDE.md)
- 📋 [Full Reference - 700+ lines](./SWAGGER_API_DOCUMENTATION.md)
- 🏗️ [Architecture - System design](./API_ARCHITECTURE.md)
- 🔍 [Index - Find anything](./API_ENDPOINTS_SUMMARY.md)
- 🌐 [Swagger UI - Interactive](http://localhost:5001/api/docs)

---

**Happy Building! 🚀**

Questions? Check the relevant guide above or contact support@talentai.com
