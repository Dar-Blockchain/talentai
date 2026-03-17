# TalentAI Platform - API Architecture & Routes Summary

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TALENTAI PLATFORM API v2.0                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Frontend   │  │   Mobile     │  │  Third-Party │              │
│  │   (Next.js)  │  │   Apps       │  │  Integrations│              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│         └─────────────────┼─────────────────┘                       │
│                           │                                         │
│                    ┌──────▼────────┐                               │
│                    │  JWT Bearer   │                               │
│                    │  Auth Headers │                               │
│                    └──────┬────────┘                               │
│                           │                                        │
│  ┌────────────────────────▼─────────────────────────┐            │
│  │         EXPRESS.JS API SERVER (Port 5001)        │            │
│  ├────────────────────────────────────────────────────────────┤    │
│  │  ┌──────────────┬──────────────┬──────────────────────┐  │    │
│  │  │ Auth Routes  │ Profile      │ Posts & Jobs         │  │    │
│  │  │              │ Management   │                      │  │    │
│  │  ├──────────────┼──────────────┼──────────────────────┤  │    │
│  │  │ • Register   │ • Create     │ • Create Job         │  │    │
│  │  │ • Verify OTP │ • Update     │ • Search Jobs        │  │    │
│  │  │ • Gmail      │ • Delete     │ • Update Job         │  │    │
│  │  │ • Logout     │ • Get by ID  │ • Get Metrics        │  │    │
│  │  │              │ • Search     │ • Send Tests         │  │    │
│  │  └──────────────┴──────────────┴──────────────────────┘  │    │
│  │                                                             │    │
│  │  ┌──────────────┬──────────────┬──────────────────────┐  │    │
│  │  │ Matching     │ Interviews   │ HR Agents            │  │    │
│  │  │ Engine       │ & Assessment │ (HCS-11)             │  │    │
│  │  ├──────────────┼──────────────┼──────────────────────┤  │    │
│  │  │ • Algorithm  │ • Skill Test │ • Initialize         │  │    │
│  │  │ • Scoring    │ • Questions  │ • Agent Messaging    │  │    │
│  │  │ • Candidate  │ • Interview  │ • Profiles           │  │    │
│  │  │   Matches    │   Details    │ • HCS-11 Support     │  │    │
│  │  └──────────────┴──────────────┴──────────────────────┘  │    │
│  │                                                             │    │
│  │  ┌──────────────┬──────────────┬──────────────────────┐  │    │
│  │  │ Hedera Tools │ Notification │ Campaigns &          │  │    │
│  │  │              │ System       │ Utilities            │  │    │
│  │  ├──────────────┼──────────────┼──────────────────────┤  │    │
│  │  │ • Tokens     │ • Create     │ • Internal Campaign  │  │    │
│  │  │ • Topics     │ • Get        │ • Participants       │  │    │
│  │  │ • Messages   │ • Mark Read  │ • Tasks              │  │    │
│  │  │ • Balance    │ • Delete     │ • Feedback           │  │    │
│  │  │ • NFTs       │              │ • Payments           │  │    │
│  │  └──────────────┴──────────────┴──────────────────────┘  │    │
│  │                                                             │    │
│  │  ┌────────────────────────────────────────────────────┐  │    │
│  │  │        MIDDLEWARE & SERVICES                       │  │    │
│  │  ├────────────────────────────────────────────────────┤  │    │
│  │  │ • Auth Middleware       • Company Resolution      │  │    │
│  │  │ • Security Logging      • Request Validation      │  │    │
│  │  │ • Rate Limiting         • Error Handling          │  │    │
│  │  │ • CORS Management       • DB Transactions         │  │    │
│  │  └────────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────────┘   │
│                           │                                        │
│       ┌───────────────────┼───────────────────┐                  │
│       │                   │                   │                  │
│  ┌────▼────┐          ┌───▼────┐         ┌──▼──────┐           │
│  │ MongoDB  │          │ Hedera │         │ Stripe  │           │
│  │ Database │          │Network │         │ API     │           │
│  └──────────┘          └────────┘         └─────────┘           │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## 📂 Route Structure

### 1. **AUTHENTICATION & USER MANAGEMENT** (`/auth`)
```
/auth/register              [POST]   - New user registration
/auth/verify-otp            [POST]   - OTP verification
/auth/connect-gmail         [POST]   - Gmail OAuth connection
/auth/logout                [POST]   - User logout
/auth/users                 [GET]    - List all users (admin)
```

### 2. **PROFILE MANAGEMENT** (`/profiles`)
```
/profiles                   [POST]   - Create/update profile
/profiles                   [GET]    - Get all profiles
/profiles                   [DELETE] - Delete own profile
/profiles/me                [GET]    - Get own profile
/profiles/{userId}          [GET]    - Get profile by ID
/profiles/search/skills     [GET]    - Search by skills
```

### 3. **JOB POSTINGS** (`/post`)
```
/post/save-post             [POST]   - Create new posting
/post/get-all-posts         [GET]    - Get all postings
/post/my-posts              [GET]    - Get user's postings
/post/search                [GET]    - Search postings (public)
/post/details/{id}          [GET]    - Get details (public)
/post/getPostById/{id}      [GET]    - Get details (auth)
/post/updatePost/{id}       [PUT]    - Update posting
/post/updatePostStatus/{id} [PATCH]  - Change status
/post/deletePost/{id}       [DELETE] - Delete posting
/post/adsPost               [GET]    - Posts by user skills
/post/metrics               [GET]    - Posting metrics
/post/public-stats          [GET]    - Public statistics
/post/send-technical-test   [POST]   - Send tech test

├─ PAYMENT ROUTES
├─ /post/payment/calculate-price/{postId}  [GET] 
├─ /post/payment/process                   [POST]
├─ /post/payment/history                   [GET]
└─ /post/payment/details/{postId}          [GET]

├─ STEPS & PROGRESS
├─ /post-steps               [POST]   - Create steps
├─ /post-steps               [GET]    - Get steps
└─ /candidate-progress       [GET]    - Candidate progress
```

### 4. **MATCHING ENGINE** (`/matching`)
```
/matching/jobs/{jobPostId}/matches    [GET] - Candidates for job
/matchingConfig             [POST]   - Create config
/matchingConfig             [GET]    - Get configs
```

### 5. **INTERVIEWS & ASSESSMENTS**
```
/api/generate-questions                     [POST]   - Generate questions
/skill-interview-assessments   [POST/GET]            - Skill tests
/post-interview-assessments    [POST/GET]            - Post-interview evals
/api/pipeline-interview                     [GET]    - Pipeline details
```

### 6. **HR AGENTS (HCS-11)** (`/hr-agents`)
```
/hr-agents/initialize              [POST]   - Init all agents (admin)
/hr-agents/initialize-single       [POST]   - Init one agent (admin)
/hr-agents                         [GET]    - List all agents (admin)
/hr-agents/avatar/{name}           [GET]    - Get by avatar
/hr-agents/role/{role}             [GET]    - Get by role
/hr-agents/all                     [DELETE] - Delete all (admin)

├─ MESSAGING & COMMUNICATION
├─ /hr-agents/submit-evaluation-message    [POST]   - HCS-10 messaging
├─ /hr-agents/diagnose/{id}                [GET]    - Diagnose issues
├─ /hr-agents/fix-proof-of-reception       [POST]   - Fix reception
├─ /hr-agents/fix-memo/{id}                [POST]   - Fix HCS-11 memo
├─ /hr-agents/check-all                    [GET]    - Check all config
├─ /hr-agents/profile/{id}                 [GET]    - Get profile
└─ /hr-agents/hcs11-profile/{id}           [GET]    - Get network profile
```

### 7. **HEDERA BLOCKCHAIN TOOLS** (`/hedera-tools` & `/api`)
```
/api/create-agent                           [POST]   - Create agent
/api/create-token                           [POST]   - Create token
/api/create-talentai-token                  [POST]   - Create TALAI
/api/mint-tokens                            [POST]   - Mint tokens

/hedera-tools/create-token                  [POST]   - Create token v2
/hedera-tools/create-topic                  [POST]   - Create topic
/hedera-tools/submit-message                [POST]   - Submit message
/hedera-tools/create-evaluation-topic       [POST]   - Create eval topic
/hedera-tools/submit-evaluation-message     [POST]   - Submit eval
/hedera-tools/balance                       [GET]    - Get balance
/hedera-tools/my-balance                    [GET]    - Get my balance
/hedera-tools/tools                         [GET]    - List tools
```

### 8. **HCS-11 STANDARDS** (`/api/hcs11`)
```
/api/hcs11/status                    [GET]    - Service status
/api/hcs11/validate                  [POST]   - Validate profile
/api/hcs11/create-profile            [POST]   - Create profile
/api/hcs11/create-and-inscribe       [POST]   - Create & inscribe
/api/hcs11/create-company-agent      [POST]   - Create company agent
```

### 9. **NOTIFICATION SYSTEM** (`/notification-system`)
```
/notification-system                [POST]   - Create notification
/notification-system                [GET]    - Get notifications
/notification-system/{id}           [GET]    - Get single
/notification-system/{id}           [DELETE] - Delete
/notification-system/{id}/read      [PATCH]  - Mark as read
```

### 10. **INTERNAL CAMPAIGNS**
```
/internal-campaigns                 [POST]   - Create campaign
/internal-campaigns                 [GET]    - Get campaigns
/internal-campaigns/{id}            [GET]    - Get details
/internal-campaigns/{id}            [PUT]    - Update
/internal-campaigns/{id}            [DELETE] - Delete
/internal-campaigns/{id}/stats      [GET]    - Get stats

/campaign-participants              [POST]   - Create participant
/campaign-participants              [GET]    - Get participants
```

### 11. **COMPANY MANAGEMENT**
```
/permissions                        [GET]    - Get permissions
/admin                              [GET]    - Admin permissions
/plan-limits                        [GET]    - Plan limits
/CompanyInvitation                  [POST/GET] - Invitations
/CompanyMembership                  [POST/GET] - Memberships
/dashboard                          [GET]    - Dashboard
```

### 12. **PAYMENT PROCESSING**
```
/payment                            [POST]   - Process payment
/payment                            [GET]    - Get payments
/api/stripe                         [POST]   - Stripe integration
```

### 13. **UTILITIES**
```
/todo                               [POST/GET]   - To-do items
/feedback                           [POST/GET]   - Feedback
/logs                               [GET]        - System logs (admin)
/task                               [POST/GET]   - Tasks
/tokens                             [GET]        - Tokens
/chat                               [POST/GET]   - Chat
/linkedinPost                       [POST/GET]   - LinkedIn posts
/unlock-candidate                   [POST]       - Unlock candidate
```

### 14. **DOCUMENTATION**
```
/api/docs                           [GET]    - Main Swagger docs
/api/docs/campaigns                 [GET]    - Campaign docs
/                                   [GET]    - Welcome message
```

---

## 🔐 Authentication Flows

### Flow 1: Email + OTP
```
User
  └─> POST /auth/register
       └─> Email OTP sent
            └─> User enters OTP
                 └─> POST /auth/verify-otp
                      └─> JWT Token returned
                           └─> Use for subsequent requests
```

### Flow 2: Gmail OAuth
```
User
  └─> POST /auth/connect-gmail
       └─> Verify with Google
            └─> JWT Token returned
                 └─> Use for subsequent requests
```

---

## 📊 Data Models Overview

### User Model
```javascript
{
  _id: ObjectId,
  email: String,
  username: String,
  role: ['Candidate', 'Recruiter', 'Company', 'Admin'],
  isVerified: Boolean,
  profile: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Profile Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,
  skills: [{ name, proficiencyLevel }],
  bio: String,
  experience: Number,
  education: Array,
  projects: Array,
  socialLinks: Object,
  location: Object,
  languages: Array,
  availability: String,
  hourlyRate: Number,
  createdAt: Date
}
```

### Post Model
```javascript
{
  _id: ObjectId,
  company: ObjectId,
  title: String,
  description: String,
  requirements: Array,
  skills: [{ name, level }],
  salary: Object,
  type: String,
  status: ['draft', 'active', 'closed'],
  steps: Array,
  createdAt: Date,
  expiresAt: Date
}
```

### HRAgent Model (HCS-11)
```javascript
{
  _id: ObjectId,
  name: String,
  avatarName: String,
  role: String,
  hederaAccountId: String,
  hederaPublicKey: String,
  hcs11Profile: Object,
  inboundTopicId: String,
  outboundTopicId: String,
  profileTopicId: String,
  isActive: Boolean,
  createdAt: Date
}
```

---

## 🔄 Integration Points

### External Services
- **Gmail/Google OAuth** - User authentication
- **Hedera Network** - Blockchain transactions
- **Stripe** - Payment processing
- **HCS-11 Standards** - Agent profiles
- **Email Service** - Communications

### Database
- **MongoDB** - Primary data store
- **Collections**: users, profiles, posts, assessments, agents, campaigns, etc.

---

## 📈 Request/Response Patterns

### Success Response (200/201)
```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Operation successful"
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "error": "Error code",
  "details": "Detailed message",
  "timestamp": "2026-03-01T10:30:00Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* ... */ ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 500
  }
}
```

---

## 🛡️ Security Features

1. **JWT Authentication** - All protected routes
2. **CORS** - Cross-origin resource sharing
3. **Rate Limiting** - 100-500 req/min depending on role
4. **Input Validation** - Schema validation on all inputs
5. **SQL Injection Prevention** - MongoDB injection protection
6. **XSS Protection** - Output encoding
7. **HTTPS** - All production traffic encrypted
8. **Role-Based Access Control (RBAC)** - Admin, Company, Recruiter, Candidate
9. **Audit Logging** - Security event logging

---

## 🚀 Performance Optimization

- **Connection Pooling** - MongoDB connection pool
- **Caching** - Redis for session/cache
- **Pagination** - Limit response sizes
- **Indexing** - Database query optimization
- **Compression** - gzip response compression
- **CDN** - Static asset delivery

---

## 📞 Support & Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check JWT token validity
   - Verify token in Authorization header
   - Re-authenticate if token expired

2. **403 Forbidden**
   - Check user role/permissions
   - Verify resource ownership
   - Contact admin if needed

3. **404 Not Found**
   - Verify correct endpoint path
   - Check resource ID exists
   - Review API documentation

4. **500 Server Error**
   - Check server logs
   - Verify database connectivity
   - Contact support team

### Resources
- 📧 Email: support@talentai.com
- 📖 Docs: https://docs.talentai.com
- 🐛 Issues: https://github.com/talentai/issues

---

**Last Updated**: March 2026  
**API Version**: 2.0.0  
**Status**: Production Ready ✅
