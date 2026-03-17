# 📚 TalentAI Platform - Complete Documentation Index

## Welcome to the TalentAI API Documentation Suite

This complete documentation package includes everything you need to understand, integrate with, and develop using the TalentAI Platform API.

---

## 📋 Documentation Files

### 🔵 **1. Main Swagger Files** (Interactive API Documentation)

#### `/Backend/swagger.json` (5,600+ lines)
- **Purpose**: Complete API specification in OpenAPI 3.0 format
- **Best For**: Swagger UI viewers, code generation
- **Includes**: 
  - All endpoints with detailed parameters
  - Request/response schemas
  - Authentication schemes
  - Error codes and examples
- **Access**: `http://localhost:5001/api/docs`

#### `/Backend/swagger-complete.json` (New - Unified)
- **Purpose**: Consolidated specification with all categories
- **Best For**: Development reference, auto-documentation
- **Structure**: 14+ tag categories for organization

#### `/Backend/docs/swagger-campaigns.json`
- **Purpose**: Specific documentation for internal campaigns
- **Best For**: Campaign & participant management endpoints
- **Access**: `http://localhost:5001/api/docs/campaigns`

---

### 🟢 **2. Markdown Documentation Files** (THIS PROJECT)

#### `SWAGGER_API_DOCUMENTATION.md` ⭐ **START HERE**
- **Purpose**: Human-readable complete API reference
- **Content**:
  - 🔐 Authentication flows
  - 📝 All endpoints by category
  - 📊 Request/response examples
  - 🛡️ Error handling guide
  - 💡 Best practices
- **Length**: ~700 lines of detailed examples
- **Best For**: Developers, API consumers, integration planning

#### `API_ARCHITECTURE.md`
- **Purpose**: System architecture and route organization
- **Content**:
  - System diagram
  - Complete route structure
  - Data models overview
  - Integration points
  - Security features
- **Best For**: System design, route planning, understanding structure

#### `QUICK_START_GUIDE.md`
- **Purpose**: Get started in 5 minutes
- **Content**:
  - Server setup instructions
  - Authentication flow walkthrough
  - Common curl commands
  - Postman/Insomnia collection setup
  - Test sequences by user type
  - Debugging tips
- **Best For**: New developers, getting your first request working
- **Quick Links**: Copy-paste ready commands

#### `API_ENDPOINTS_SUMMARY.md` (This File)
- **Purpose**: Index and navigation guide
- **Content**: This index you're reading!

---

## 🗺️ Navigation Guide

### For Different User Roles

#### 👨‍💻 **Backend Developer**
1. Start: `QUICK_START_GUIDE.md` (5 min setup)
2. Read: `API_ARCHITECTURE.md` (understand structure)
3. Reference: `swagger.json` + `SWAGGER_API_DOCUMENTATION.md`
4. Implement: Use swagger definitions for endpoints

#### 🎨 **Frontend Developer**
1. Start: `QUICK_START_GUIDE.md` (5 min setup)
2. Reference: `SWAGGER_API_DOCUMENTATION.md` (all endpoints)
3. Test: Use Postman collection (in QUICK_START_GUIDE.md)
4. Integrate: Copy request/response examples

#### 🏗️ **System Architect**
1. Start: `API_ARCHITECTURE.md` (system overview)
2. Review: Swagger system diagram
3. Analyze: Data models and integration points
4. Plan: Based on architecture document

#### 🧪 **QA/Tester**
1. Start: `QUICK_START_GUIDE.md` (setup)
2. Read: Test sequences by user type
3. Test: Use curl commands or Postman
4. Reference: Error codes in SWAGGER_API_DOCUMENTATION.md

#### 🚀 **DevOps/Deployment**
1. Review: Environment variables (misc section)
2. Check: Security features (SWAGGER_API_DOCUMENTATION.md)
3. Configure: Rate limiting, monitoring
4. Deploy: Following production checklist

---

## 📍 Finding Specific Information

### By Feature/Category

#### 🔐 Authentication
- **How to authenticate?** → QUICK_START_GUIDE.md (Steps 1-2)
- **Auth endpoints?** → SWAGGER_API_DOCUMENTATION.md (Auth section)
- **Token format?** → API_ARCHITECTURE.md (Security Features)
- **OAuth flow?** → swagger.json `POST /auth/connect-gmail`

#### 👤 User Profiles
- **Create profile?** → QUICK_START_GUIDE.md (Common Requests)
- **Search profiles?** → SWAGGER_API_DOCUMENTATION.md (Profiles)
- **Model structure?** → API_ARCHITECTURE.md (Data Models)

#### 📝 Job Posts
- **Post a job?** → QUICK_START_GUIDE.md (For Companies)
- **All post endpoints?** → SWAGGER_API_DOCUMENTATION.md (Posts)
- **Post structure?** → API_ARCHITECTURE.md (Post Model)

#### 🤖 HR Agents (HCS-11)
- **Initialize agents?** → SWIFT_START_GUIDE.md (Hedera section)
- **Agent messaging?** → SWAGGER_API_DOCUMENTATION.md (HR Agents)
- **Agent model?** → API_ARCHITECTURE.md (HRAgent Model)

#### ⛓️ Blockchain (Hedera)
- **Create agent?** → QUICK_START_GUIDE.md
- **Create token?** → QUICK_START_GUIDE.md + SWAGGER_API_DOCUMENTATION.md
- **HCS-11 profile?** → SWAGGER_API_DOCUMENTATION.md
- **All Hedera tools?** → SWIFT_START_GUIDE.md

#### 🔔 Notifications
- **Create notification?** → SWIFT_START_GUIDE.md (Common Requests)
- **All notification endpoints?** → SWAGGER_API_DOCUMENTATION.md
- **Notification model?** → API_ARCHITECTURE.md

#### 📊 Campaigns
- **Create campaign?** → SWIFT_START_GUIDE.md (For Companies)
- **Campaign endpoints?** → SWAGGER_API_DOCUMENTATION.md (Campaigns)
- **Campaign API docs?** → `/api/docs/campaigns`

---

## 🔗 Direct Links to Key Endpoints

### Dashboard (`/dashboard`)
- Stats Cards: `GET /dashboard/statsCards` (requires auth, scoped to user)

### Authentication (`/auth`)
- Register: `POST /auth/register`
- Verify OTP: `POST /auth/verify-otp`
- Gmail: `POST /auth/connect-gmail`
- Logout: `POST /auth/logout`
- Users: `GET /auth/users`

### Profiles (`/profiles`)
- Create/Update: `POST /profiles`
- Get All: `GET /profiles`
- Get Me: `GET /profiles/me`
- Get by ID: `GET /profiles/{userId}`
- Search Skills: `GET /profiles/search/skills`
- Delete: `DELETE /profiles`

### Posts (`/post`)
- Create: `POST /post/save-post`
- Search: `GET /post/search`
- Get All: `GET /post/get-all-posts`
- Get One: `GET /post/getPostById/{id}`
- Update: `PUT /post/updatePost/{id}`
- Delete: `DELETE /post/deletePost/{id}`
- By Skills: `GET /post/adsPost`

### Interviews
- Skills Test: `POST/GET /skill-interview-assessments`
- Post-Interview: `POST/GET /post-interview-assessments`
- Questions: `POST /api/generate-questions`

### HR Agents (`/hr-agents`)
- Initialize All: `POST /hr-agents/initialize`
- Initialize One: `POST /hr-agents/initialize-single`
- Get All: `GET /hr-agents`
- By Avatar: `GET /hr-agents/avatar/{name}`
- By Role: `GET /hr-agents/role/{role}`
- Messaging: `POST /hr-agents/submit-evaluation-message`
- Profile: `GET /hr-agents/profile/{id}`

### Hedera (`/hedera-tools`, `/api`)
- Create Agent: `POST /api/create-agent`
- Create Token: `POST /hedera-tools/create-token`
- Create Topic: `POST /hedera-tools/create-topic`
- Submit Message: `POST /hedera-tools/submit-message`
- Get Balance: `GET /hedera-tools/balance`

### HCS-11 (`/api/hcs11`)
- Status: `GET /api/hcs11/status`
- Validate: `POST /api/hcs11/validate`
- Create: `POST /api/hcs11/create-profile`
- Inscribe: `POST /api/hcs11/create-and-inscribe`
- Company Agent: `POST /api/hcs11/create-company-agent`

### Notifications (`/notification-system`)
- Create: `POST /notification-system`
- Get All: `GET /notification-system`
- Get One: `GET /notification-system/{id}`
- Mark Read: `PATCH /notification-system/{id}/read`
- Delete: `DELETE /notification-system/{id}`

### Campaigns (`/internal-campaigns`)
- Create: `POST /internal-campaigns`
- Get All: `GET /internal-campaigns`
- Get One: `GET /internal-campaigns/{id}`
- Update: `PUT /internal-campaigns/{id}`
- Delete: `DELETE /internal-campaigns/{id}`
- Stats: `GET /internal-campaigns/{id}/stats`

---

## 📊 Statistics

### Documentation Coverage
- ✅ 50+ API endpoints documented
- ✅ 14+ feature categories
- ✅ 100+ code examples
- ✅ 4 markdown guides
- ✅ 3 swagger JSON files
- ✅ Complete request/response schemas

### API Completeness
- 🔐 Authentication: 5 endpoints
- 👤 Profiles: 6 endpoints
- 📝 Posts: 15+ endpoints
- 💰 Payment: 4 endpoints
-  Interviews: 3 endpoints
- 🤖 HR Agents: 12+ endpoints
- ⛓️ Hedera: 10+ endpoints
- 🆔 HCS-11: 5 endpoints
- 🔔 Notifications: 5 endpoints
- 📊 Campaigns: 6 endpoints
- 🏢 Company: 6 endpoints
- 💬 Chat: 2 endpoints
- 📋 Utilities: 7+ endpoints

---

## 🚀 Getting Started Checklist

- [ ] Read `QUICK_START_GUIDE.md` (5 min)
- [ ] Start API server: `npm start` in Backend folder
- [ ] Test welcome: `curl http://localhost:5001/`
- [ ] Register user: Use curl from QUICK_START_GUIDE.md
- [ ] Get JWT token: From verify-otp response
- [ ] Test authenticated request: Get profile
- [ ] Open Swagger UI: `http://localhost:5001/api/docs`
- [ ] Import Postman collection (optional)
- [ ] Read relevant API documentation by feature
- [ ] Build your integration!

---

## 📞 Support & Help

### Documentation Issues
- ❓ Can't find an endpoint? → Check `SWAGGER_API_DOCUMENTATION.md` index
- 🐛 Found a bug in docs? → Report to support@talentai.com
- 💡 Have a question? → Check QUICK_START_GUIDE.md debugging section

### API Issues
- 🔴 500 Error? → Check server logs
- 🟠  401 Unauthorized? → Check QUICK_START_GUIDE.md auth section
- 🟡 Wrong response? → Verify parameters in swagger.json

### External Resources
- 📖 [Full Swagger Docs](http://localhost:5001/api/docs)
- 📖 [Campaign Docs](http://localhost:5001/api/docs/campaigns)
- 🔗 [GitHub Repository](https://github.com/talentai)
- 💬 [Discord Community](https://discord.gg/talentai)
- 📧 [Email Support](mailto:support@talentai.com)

---

## 📝 Documentation Versions

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | March 2026 | Complete documentation suite |
| 1.5.0 | Feb 2026 | Added HCS-11 support |
| 1.0.0 | Jan 2026 | Initial release |

---

## 🎯 Next Steps

### For Implementation
1. **Pick your feature**: Authentication, profiles, posts, etc.
2. **Find the endpoint**: Use navigation guide above
3. **Check the example**: QUICK_START_GUIDE.md or swagger.json
4. **Test with curl**: Copy from documentation
5. **Integrate in code**: Use response format from swagger
6. **Handle errors**: Reference error codes in SWAGGER_API_DOCUMENTATION.md

### For Integration
1. **API calls**: Every endpoint documented with examples
2. **Error handling**: Standard error response format
3. **Authentication**: JWT in Authorization header
4. **Pagination**: Use page/limit parameters
5. **Rate limits**: Check headers for limit info

### For Deployment
1. **Environment variables**: Check misc section
2. **Security**: Review security features section
3. **Monitoring**: Setup rate limit monitoring
4. **Scaling**: Consider caching and optimization
5. **Backup**: Regular database backups

---

## 📄 Document Map

```
Root Directory
├── SWAGGER_API_DOCUMENTATION.md (← START HERE for details)
├── API_ARCHITECTURE.md (← System architecture)
├── QUICK_START_GUIDE.md (← 5 min setup)
├── API_ENDPOINTS_SUMMARY.md (← This file)
│
├── Backend/
│   ├── swagger.json (← Main OpenAPI spec)
│   ├── swagger-complete.json (← Unified spec)
│   │
│   ├── docs/
│   │   └── swagger-campaigns.json (← Campaign docs)
│   │
│   ├── routes/ (← 35 route files)
│   │   ├── authentication.routes.js
│   │   ├── post.routes.js
│   │   ├── hrAgent.routes.js
│   │   ├── notification.routes.js
│   │   ├── internalCampaign.routes.js
│   │   └── ... (29+ more)
│   │
│   ├── controllers/ (← 35+ controller files)
│   └── config/
│       └── register-routes.js (← Route registration)
│
└── README.md (← Project overview)
```

---

## ✅ Verification

### API Running?
```bash
curl http://localhost:5001/
# Expected: {"message":"Bienvenue sur l'API Express!"}
```

### Swagger UI Available?
```bash
open http://localhost:5001/api/docs
# Should open interactive Swagger UI
```

### Documentation Complete?
```bash
ls -la *.md
# Should show:
# - SWAGGER_API_DOCUMENTATION.md
# - API_ARCHITECTURE.md
# - QUICK_START_GUIDE.md
# - API_ENDPOINTS_SUMMARY.md
```

---

## 🎓 Learning Path

### Beginner (0-30 min)
1. `QUICK_START_GUIDE.md` ✅
2. Swagger UI at http://localhost:5001/api/docs
3. Try one endpoint with curl

### Intermediate (30 min - 2 hours)
1. `SWAGGER_API_DOCUMENTATION.md` - read your feature section
2. `API_ARCHITECTURE.md` - understand the system
3. Test 5+ endpoints with curl/Postman
4. Read auth flow section

### Advanced (2+ hours)
1. Deep dive into specific features
2. Review swagger schemas
3. Study error handling
4. Implement complete flow (auth → create → update → delete)

### Expert (Ongoing)
1. Optimize API calls
2. Implement caching
3. Monitor rate limits
4. Contribute improvements
5. Help others in community

---

**Last Updated**: March 2026  
**Maintained By**: TalentAI Development Team  
**Status**: Fully Documented ✅

---

**Ready to build with TalentAI?** Start with → [QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md) 🚀
