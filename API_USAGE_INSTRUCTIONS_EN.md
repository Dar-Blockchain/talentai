# 📋 API Inventory - Usage Instructions

**Generated for:** Frontend API Verification  
**Date:** May 5, 2026

---

## 📌 Available Files

### 1. **API_ENDPOINTS_INVENTORY.json** 📊
Structured JSON format with all endpoints, HTTP methods, descriptions and parameters.

**Usefulness:** 
- Programmatic verification
- Integration with analysis scripts
- Detailed parameter consultation

**Example structure:**
```json
{
  "authentication": {
    "baseUrl": "/auth",
    "endpoints": [
      {
        "method": "POST",
        "path": "/auth/register",
        "description": "Create new user account",
        "auth": "public",
        "body": { ... }
      }
    ]
  }
}
```

---

### 2. **API_ENDPOINTS_GUIDE.md** 📖
Readable Markdown format with tables for each module.

**Usefulness:**
- Quick reading
- Consultation in GitHub/GitLab
- Easy team sharing

**Content:**
- 30 API modules with descriptions
- Detailed tables per endpoint
- Visual color codes (✓, ✗, etc.)

---

### 3. **API_ENDPOINTS.csv** 
CSV table format importable into Excel/Google Sheets.

**Usefulness:**
- Easy filtering and sorting
- Direct import to Excel/Sheets
- Report generation

---

### 4. **analyze-api-usage.js** 🔍
Automated Node.js script to detect used APIs.

**Usefulness:**
- Automatic frontend code analysis
- Generates JSON report
- Identifies unused APIs

**How to use:**
```bash
# In the root folder of your frontend project
node analyze-api-usage.js

# Generates: api-usage-report.json
```

---

## 🎯 How to Verify Used APIs

### **Method 1: Manual (More Precise)**

1. Open `API_ENDPOINTS_GUIDE.md`
2. For each endpoint (e.g., `/auth/register`):
   - Search in your frontend code: `Ctrl+F` → `/auth/register`
   - Note if it's used or not
3. Create a document with your results

**Advantage:** Complete understanding  
**Disadvantage:** Long and tedious

---

### **Method 2: Automated Script (Recommended)**

1. Place `analyze-api-usage.js` at the root of your frontend project
2. Execute:
```bash
node analyze-api-usage.js
```
3. Consult the generated file: `api-usage-report.json`

**Example generated report:**
```json
{
  "used": [
    "/auth/register",
    "/auth/login",
    "/auth/verify-otp",
    "/job-applications/post/:postId",
    ...
  ],
  "unused": [
    "/admin/backups/restore/:backupName",
    "/subscriptions/:companyProfileId/check-limit/:limitType",
    ...
  ],
  "patterns": {
    "/auth/login": [
      "src/pages/auth/login.tsx",
      "src/hooks/useAuth.ts"
    ]
  }
}
```

---

### **Method 3: Grep Search (For Advanced Searchers)**

```bash
# Search all API calls
grep -r "\/auth\/" src/
grep -r "\/post\/" src/
grep -r "fetch\|axios" src/ | grep "http"

# Create a list
grep -r "\/api\/" src/ | awk -F: '{print $1}' | sort -u > used-apis.txt
```

---

## 📊 Endpoints Structure by Module

| Module | Endpoints | Type |
|--------|-----------|------|
| **Authentication** | 8 | Public + Protected |
| **Profile** | 17 | Protected |
| **Posts/Jobs** | 12 | Public + Protected |
| **Job Applications** | 18 | Mixed |
| **Chat** | 23 | Protected |
| **Assessments** | 14 | Mixed |
| **Dashboard** | 11 | Protected |
| **Subscriptions** | 5 | Protected |
| **CV Analysis** | 10 | Optional |
| **Departments** | 6 | Protected |
| **API Keys** | 7 | Protected |
| **Backups** | 5 | Admin only |
| **Others** | 20+ | Various |

---

## 🔐 Authentication Types

```
┌─────────────────────────────────────────┐
│ AUTHENTICATION TYPES                    │
├─────────────────────────────────────────┤
│ 🟢 public     - No auth (15 endpoints)  │
│ 🔴 required   - JWT Token (141 endpoints)│
│ 🟡 optional   - Auth recommended (few)  │
└─────────────────────────────────────────┘
```

---

## ⚠️ Critical Endpoints to Know

### 🚨 **Special Attention**

| Endpoint | Risk | Action |
|----------|------|--------|
| `/admin/backups/restore/:backupName` | Database overwrite | Do not use in prod |
| `/api/api-keys` | Security | Manage keys carefully |
| `/subscriptions/*/check-limit` | Critical | Verify before actions |
| `/post/deletePost/:id` | Data loss | No recovery |

---

## 🚀 Recommended Optimizations

### 1. **Remove unused APIs from frontend**
```javascript
// ❌ Before (imported but never used)
import * as backupApi from './api/backup';

// ✅ After
// Deleted
```

### 2. **Consolidate similar calls**
```javascript
// ❌ Before (3 calls)
const users = await getUsers();
const posts = await getPosts();
const stats = await getStats();

// ✅ After (1 bulk call)
const data = await getDashboardData();
```

### 3. **Cache static data**
```javascript
// ❌ Before
const plans = await planLimitsApi.getAll(); // On every page

// ✅ After
const plans = useStaticData('plans', () => planLimitsApi.getAll());
```

---

## 📋 Checklist for Your Colleague

- [ ] Download files in Backend/ folder
- [ ] Read `API_ENDPOINTS_GUIDE.md` for overview
- [ ] Run `analyze-api-usage.js` for automatic report
- [ ] Compare with `API_ENDPOINTS_INVENTORY.json`
- [ ] Identify unused APIs
- [ ] Document usage for each endpoint
- [ ] Propose optimizations
- [ ] Discuss with backend team

---

## 💡 Common Use Cases

### **Case 1: Verify a specific API**
```bash
grep -r "interview" . --include="*.ts" --include="*.tsx" --include="*.js"
```

### **Case 2: List all used endpoints**
```bash
node analyze-api-usage.js | grep "✓" > used-endpoints.txt
```

### **Case 3: Document usage**
Create an Excel/Sheets table:
```
| Endpoint | Used? | Module | Files | Notes |
|----------|-------|--------|-------|-------|
| /auth/register | YES | Auth | auth.ts | Initial login |
| /admin/backups | NO | Admin | - | Not used |
```

### **Case 4: Find redundant APIs**
```
1. Check the JSON report
2. Find similar endpoints
3. Document duplicates
4. Propose consolidation
```

---

## 📞 Frequently Asked Questions

### Q: How to differentiate endpoints?
**A:** By the **path** (route) - ex: `/auth/register` vs `/auth/login`

### Q: Can APIs be called without authentication?
**A:** Only those marked **public** (15 endpoints)

### Q: Which endpoints are critical?
**A:** Those marked **Admin** or with **data destruction**

### Q: How to add a new endpoint?
**A:** 
1. Create the route in Backend
2. Add to `API_ENDPOINTS_INVENTORY.json`
3. Update `API_ENDPOINTS_GUIDE.md`
4. Re-run `analyze-api-usage.js`

---

## 📚 Additional Resources

- **Frontend API Client:** See `src/services/api/`
- **Backend Routes:** See `Backend/config/register-routes.js`
- **API Documentation:** See `Backend/routes/*.routes.js`

---

## 🎯 Next Steps

1. **Analysis (1-2 days)**
   - Run the script
   - Review the files
   - Identify patterns

2. **Documentation (1-2 days)**
   - Document each usage
   - Create notes

3. **Optimization (Based on Results)**
   - Remove unused imports
   - Consolidate calls
   - Improve performance

---

## 📞 Support

If you have questions:
1. Check comments in routes: `Backend/routes/*.routes.js`
2. Review controllers: `Backend/controllers/`
3. Check models: `Backend/models/`

---

**Created with ❤️ to optimize your API architecture**

Last updated: **May 5, 2026**
