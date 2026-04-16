# TalentAI API - Quick Start Guide

## 🚀 Quick Start in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or cloud instance
- Hedera testnet credentials (optional)
- Postman or Insomnia installed (optional but recommended)

---

## 1️⃣ Server Setup

### Start API Server
```bash
cd Backend
npm install
npm start
```

Server runs on: `http://localhost:5001`

### Verify Server is Running
```bash
curl http://localhost:5001/
# Expected: {"message":"Bienvenue sur l'API Express!"}
```

---

## 2️⃣ Authentication Flow

### Step 1: Register User
```bash
curl -X POST http://localhost:5001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com"
  }'
```

**Response:**
```json
{
  "message": "Inscription réussie. Veuillez vérifier votre email pour le code OTP.",
  "email": "testuser@example.com",
  "username": "testuser"
}
```

### Step 2: Verify OTP
```bash
curl -X POST http://localhost:5001/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "otp": "123456"
  }'
```

**Response:**
```json
{
  "message": "Email vérifié avec succès",
  "user": {
    "_id": "user_123",
    "username": "testuser",
    "email": "testuser@example.com",
    "isVerified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token!** You'll need it for all subsequent requests.

---

## 3️⃣ Common Requests

### Create Your Profile
```bash
curl -X POST http://localhost:5001/profiles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "Candidate",
    "skills": [
      {"name": "TypeScript", "proficiencyLevel": 4},
      {"name": "React", "proficiencyLevel": 3}
    ],
    "bio": "Full-stack developer",
    "experience": 5,
    "location": {
      "country": "France",
      "city": "Paris"
    },
    "availability": "Available"
  }'
```

### Get Your Profile
```bash
curl -X GET http://localhost:5001/profiles/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Search Job Posts
```bash
curl -X GET "http://localhost:5001/post/search?page=1&limit=10&search=developer" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Job Post (Company Only)
```bash
curl -X POST http://localhost:5001/post/save-post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Senior React Developer",
    "description": "We are looking for...",
    "skills": [
      {"name": "React", "level": 4},
      {"name": "TypeScript", "level": 3}
    ],
    "salary": {
      "min": 50000,
      "max": 80000,
      "currency": "EUR"
    },
    "type": "Full-time",
    "location": "Paris, France"
  }'
```

### Get Candidate Matches for Job
```bash
curl -X GET http://localhost:5001/matching/jobs/{jobPostId}/matches \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Generate Interview Questions
```bash
curl -X POST http://localhost:5001/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "skills": "TypeScript, React, Node.js",
    "experience": "3 years full-stack development"
  }'
```

### Create Notification
```bash
curl -X POST http://localhost:5001/notification-system \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "recipient": "user_id_123",
    "content": "New job post matching your skills!",
    "url": "https://app.talentai.bid/posts/123"
  }'
```

### Create Internal Campaign
```bash
curl -X POST http://localhost:5001/internal-campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Q4 Skills Assessment",
    "type": "SKILLS_MAPPING",
    "description": "Assess employee skills",
    "anonymityMode": "NOMINATIVE",
    "modules": {
      {
        "type": "SKILL_TEST",
        "config": {},
        "order": 1
      }
    ],
    "accessMethod": "LINK",
    "skill": "Leadership, Communication"
  }'
```

---

## 4️⃣ Hedera Blockchain Operations


### Create HCS-11 Profile
```bash
curl -X POST http://localhost:5001/api/hcs11/create-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "companyName": "TechCorp",
    "companyDescription": "Leading AI solutions",
    "agentConfig": {
      "displayName": "TechCorp AI",
      "model": "GPT-4",
      "capabilities": ["RECRUITING", "EVALUATION"]
    }
  }'
```

### Initialize HR Agents (Admin Only)
```bash
curl -X POST http://localhost:5001/hr-agents/initialize-single \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Sinda-SoftSkill-Agent",
    "avatarName": "sinda",
    "role": "Soft Skills Specialist",
    "description": "Validates soft skills and interpersonal abilities"
  }'
```

---

## 5️⃣ Postman Collection Setup

### Import Collection

1. Open Postman
2. Click **Import**
3. Create a new collection: **TalentAI API**
4. Add folders for each category:
   - Authentication
   - Profiles
   - Posts
   - Matching
   - HR Agents
   - Hedera Tools
   - Etc.

### Set Environment Variables in Postman

Create a new environment with these variables:

```json
{
  "base_url": "http://localhost:5001",
  "jwt_token": "your_token_here",
  "user_id": "user_id_here",
  "post_id": "post_id_here",
  "agent_id": "agent_id_here"
}
```

### Example Request in Postman

**Request:**
```
GET {{base_url}}/profiles/me
Headers:
  Authorization: Bearer {{jwt_token}}
```

---

## 6️⃣ Using Insomnia (Alternative)

### Create Workspace

1. Open Insomnia
2. Create new workspace: **TalentAI**
3. Add environment variables:
   ```
   base_url: http://localhost:5001
   jwt_token: your_token
   ```

### Example Request

```
GET http://{{base_url}}/profiles/me
Authorization: Bearer {{jwt_token}}
```

---

## 📚 Complete API Test Sequence

### For Candidates

```bash
# 1. Register
POST /auth/register
Body: { "email": "candidate@example.com" }

# 2. Verify OTP
POST /auth/verify-otp
Body: { "email": "candidate@example.com", "otp": "123456" }
Save JWT Token

# 3. Create Profile
POST /profiles
Body: { type, skills, bio, ... }

# 4. Search Jobs
GET /post/search?search=developer

# 5. View Job Details
GET /post/details/{jobId}

# 6. Check Matches
GET /matching/jobs/{jobId}/matches

# 7. Get Notifications
GET /notification-system
```

### For Companies

```bash
# 1. Register Company
POST /auth/register
Body: { "email": "company@example.com" }

# 2. Verify OTP
POST /auth/verify-otp
Body: { "email": "company@example.com", "otp": "123456" }
Save JWT Token

# 3. Create Job Post
POST /post/save-post
Body: { title, description, skills, salary, ... }

# 4. View Metrics
GET /post/metrics

# 5. Get Candidates
GET /matching/jobs/{postId}/matches

# 6. Process Payment
POST /post/payment/process
Body: { postId, agentId }

# 7. Create Campaign
POST /internal-campaigns
Body: { title, type, modules, ... }
```

### For Admin

```bash
# 1. Admin Login
POST /auth/register & /auth/verify-otp
(Admin account with elevated privileges)

# 2. Initialize HR Agents
POST /hr-agents/initialize-single
Body: { name, avatarName, role, description, ... }

# 3. Check All Agents
GET /hr-agents/check-all

# 4. Get System Logs
GET /logs

# 5. View All Users
GET /auth/users

# 6. Get Permissions
GET /admin
```

---

## 🐛 Debugging Tips

### Enable Verbose Logging
```bash
# Terminal logs
npm start  # Shows all logs

# Check MongoDB logs
mongod --verbose
```

### Use Browser DevTools
```javascript
// In browser console
const token = localStorage.getItem('jwt_token');
fetch('http://localhost:5001/profiles/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log(d));
```

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid/missing token | Re-authenticate |
| 403 Forbidden | Wrong role/permissions | Check user role |
| 404 Not Found | Wrong endpoint/resource | Verify URL & ID |
| 500 Server Error | Server issue | Check logs |
| CORS Error | Cross-origin issue | Check CORS config |

---

## 🔗 Useful Links

- **API Documentation**: [/api/docs](http://localhost:5001/api/docs)
- **Campaign Docs**: [/api/docs/campaigns](http://localhost:5001/api/docs/campaigns)
- **GitHub**: https://github.com/talentai
- **Hedera Explorer**: https://hashscan.io/testnet
- **MongoDB Atlas**: https://www.mongodb.com/cloud/atlas

---

## 💡 Tips & Best Practices

1. **Always save your JWT token** in Postman/Insomnia environment
2. **Use query parameters** for filtering and pagination
3. **Check response status** before processing data
4. **Handle errors gracefully** in your frontend
5. **Use pagination** for large result sets
6. **Cache tokens** securely (never in localStorage for sensitive apps)
7. **Log all API calls** for debugging
8. **Test with both valid and invalid data**
9. **Monitor rate limits** via response headers
10. **Keep API credentials secure** in .env files

---

## 📝 Notes

- All timestamps are in UTC (ISO 8601 format)
- All token-based endpoints require `Authorization: Bearer <token>`
- Passwords are optional with OTP/OAuth flows
- Company users have special `resolveCompanyActor` middleware
- Admin endpoints require explicit Admin role

---

**Ready to start?** Pick a use case above and follow the sequence! 🚀

For more help, check the full documentation at:
- [SWAGGER_API_DOCUMENTATION.md](../SWAGGER_API_DOCUMENTATION.md)
- [API_ARCHITECTURE.md](../API_ARCHITECTURE.md)
- [/api/docs](http://localhost:5001/api/docs)
