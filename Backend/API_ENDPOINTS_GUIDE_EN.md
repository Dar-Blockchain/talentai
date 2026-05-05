# API Endpoints Inventory - TalentAI Backend

**Generated:** May 5, 2026  
**Purpose:** Verify which APIs are used and which ones are not

---

## 📊 Global Statistics

- **Total Endpoints:** 156
- **Total Modules:** 33
- **Public Endpoints:** 15
- **Protected Endpoints:** 141
- **Authentication Types:** JWT Token, API Key

---

## 🔐 Authentication

### Required authentication types:
- **public** - No authentication
- **required** - JWT Token authentication required
- **optional** - Authentication recommended but optional

### Roles:
- Candidate
- Company
- Employee
- Admin

---

## 📝 Endpoints by Module

### 1. 🔑 Authentication (`/auth`)

| Method | Endpoint | Description | Auth | Notes |
|--------|----------|-------------|------|-------|
| POST | `/auth/register` | Create new user account | public | OTP sent; CV analyzed for candidates |
| POST | `/auth/login` | Login with email | public | OTP sent |
| POST | `/auth/verify-otp` | Verify OTP code | public | - |
| POST | `/auth/resend-otp` | Resend OTP (valid 5 min) | public | - |
| POST | `/auth/analyze` | Analyze CV via Bedrock | public | - |
| GET | `/auth/warnUser` | Notify logged-in user | required | Internal use |
| POST | `/auth/logout` | Invalidate session/token | required | - |
| GET | `/auth/check-role?email=...` | Get user role by email | public | - |

---

### 2. 👤 Profile (`/profiles`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/profiles/me` | Get current user profile | required |
| POST | `/profiles/createOrUpdateProfile` | Create or update user profile | required |
| PUT | `/profiles/updateProfileVisibility` | Change profile visibility (public/private) | required |
| PUT | `/profiles/:userId` | Update profile (fields; image; type) | required |
| POST | `/profiles/createOrUpdateCompanyProfile` | Create or update company profile | required |
| GET | `/profiles/search/skills` | Search profiles by skills | required |
| POST | `/profiles/addSoftSkills` | Add soft skills to profile | required |
| GET | `/profiles/getSoftSkills` | Get current user soft skills | required |
| GET | `/profiles/getSoftSkillsById/:userId` | Get soft skills for specific user | required |
| DELETE | `/profiles/deleteHardSkill` | Delete hard skill | required |
| DELETE | `/profiles/deleteSoftSkills` | Delete soft skill | required |
| GET | `/profiles/getCompanyWithAssessments` | Get company with assessments | required |
| GET | `/profiles/:profileId/payments` | Get all payments for profile | required |
| GET | `/profiles/:profileId/payments/active` | Get active payment for profile | required |
| POST | `/profiles/:profileId/payments/add` | Add payment to profile | required |
| PUT | `/profiles/updateFinalBid` | Update final bid | optional |
| GET | `/profiles/:userId` | Get public profile by ID | public |

---

### 3. 📋 Posts (Job Offers) (`/post`)

| Method | Endpoint | Description | Auth | Scope |
|--------|----------|-------------|------|-------|
| GET | `/post/search` | Get all posts with search/filters | public | - |
| GET | `/post/details/:id` | Get post details by ID | public | - |
| GET | `/post/public-stats` | Get public statistics | public | - |
| POST | `/post/save-post` | Create new post | required | write:posts |
| GET | `/post/get-all-posts` | Get all posts | required | read:posts |
| GET | `/post/my-posts` | Get current user posts | required | read:posts |
| GET | `/post/metrics` | Get post metrics | required | - |
| GET | `/post/getPostById/:id` | Get post details | required | read:posts |
| PUT | `/post/updatePost/:id` | Update post | required | write:posts |
| PATCH | `/post/updatePostStatus/:id` | Update post status | required | write:posts |
| DELETE | `/post/deletePost/:id` | Delete post | required | delete:posts |
| POST | `/post/generate-job-post` | Generate job post using AI | required | - |

---

### 4. 💼 Job Applications (`/job-applications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/job-applications/post/:postId` | Get applications for post | public |
| POST | `/job-applications` | Create new application | required |
| GET | `/job-applications` | Get all applications | required |
| GET | `/job-applications/candidate/my` | Get applications for candidate | required |
| GET | `/job-applications/candidate/my/stats` | Get candidate dashboard stats | required |
| GET | `/job-applications/company/my` | Get company applications | required |
| POST | `/job-applications/contact-candidate` | Send direct email to candidate | required |
| GET | `/job-applications/post/:postId/summary` | Get flat summary for post | required |
| GET | `/job-applications/company/my/summary` | Get flat summary for company | required |
| GET | `/job-applications/company/my/metrics` | Get application metrics | required |
| GET | `/job-applications/company/my/cvs/download` | Download matching CVs as ZIP | required |
| POST | `/job-applications/auto-invite/trigger` | Trigger auto-invite (nudge #1) | required |
| POST | `/job-applications/reminder/trigger` | Trigger reminder (nudge #2/#3) | required |
| GET | `/job-applications/:applicationId` | Get application by ID | required |
| PATCH | `/job-applications/:applicationId` | Update application | required |
| POST | `/job-applications/:applicationId/withdraw` | Withdraw application | required |
| POST | `/job-applications/:applicationId/archive` | Archive application | required |
| POST | `/job-applications/:applicationId/invite-to-interview` | Send interview invitation email | required |

---

### 5. 📊 Skill Interview Assessments (`/skill-interview-assessments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/skill-interview-assessments` | Create assessment | required |
| GET | `/skill-interview-assessments/my` | Get current user assessments | required |
| GET | `/skill-interview-assessments/:id` | Get assessment by ID | required |
| GET | `/skill-interview-assessments` | Get all assessments | required |

---

### 6. 🎯 Post Interview Assessments (`/post-interview-assessments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/post-interview-assessments/post/:postId` | Get assessments for post | public |
| GET | `/post-interview-assessments/post/:postId/candidate/:candidateUserId` | Get assessment for candidate | public |
| GET | `/post-interview-assessments/check/:postId` | Check if candidate has assessment | required |
| GET | `/post-interview-assessments/matching/:postId` | Get matching details | required |
| GET | `/post-interview-assessments` | Get all assessments | required |
| GET | `/post-interview-assessments/company/mine` | Get company assessments | required |
| GET | `/post-interview-assessments/company/mine/metrics` | Get interview metrics | required |
| GET | `/post-interview-assessments/candidate/my` | Get candidate assessments | required |
| POST | `/post-interview-assessments` | Create new assessment | required |
| GET | `/post-interview-assessments/:assessmentId` | Get assessment by ID | required |

---

### 7. 💬 Chat (`/chat`)

**23 endpoints** - Conversations and messages
- Conversation management (create, read, archive, block, delete)
- Message management (send, read, delete, search)
- Message reactions

---

### 8. 👥 Candidate Progress (`/candidate-progress`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/candidate-progress/getUserProgress` | Get current user progress | required |
| POST | `/candidate-progress` | Create progress record | required |
| GET | `/candidate-progress` | Get all progress records | required |
| GET | `/candidate-progress/:id` | Get progress by ID | required |
| PUT | `/candidate-progress/:id` | Update progress | required |
| DELETE | `/candidate-progress/:id` | Delete progress | required |
| GET | `/candidate-progress/candidate/:candidateId` | Get progress by candidate | required |
| GET | `/candidate-progress/post/:postId` | Get progress by post | required |
| GET | `/candidate-progress/status/:status` | Get progress by status | required |

---

### 9. 🎬 Pipeline Interview (`/api/pipeline-interview`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/pipeline-interview/params/:jobId/:stepNumber` | Get interview parameters | optional |
| GET | `/api/pipeline-interview/steps/:jobId` | Get interview steps | optional |
| POST | `/api/pipeline-interview/progress/initialize` | Initialize candidate progress | optional |
| GET | `/api/pipeline-interview/progress/:candidateId/:jobId` | Get candidate progress | optional |
| PUT | `/api/pipeline-interview/progress/update-step` | Update step after interview | optional |
| POST | `/api/pipeline-interview/progress/next-step` | Move to next step | optional |

---

### 10. 📬 Post Steps (`/post-steps`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/post-steps/post/:postId/steps` | Add steps to post | required |
| PUT | `/post-steps/node/:nodeId/submit-task` | Submit task with GitHub link | required |

---

### 11. 🏢 Company Invitations (`/company-invitations`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/company-invitations/details/:invitationId` | Get invitation details | public |
| POST | `/company-invitations/respondInvitation/:invitationId` | Accept or reject invitation | public |
| POST | `/company-invitations/sentInvitation` | Send employee invitation | required |
| POST | `/company-invitations/resendInvitation/:invitationId` | Resend invitation | required |
| DELETE | `/company-invitations/deleteInvitation/:invitationId` | Delete/revoke invitation | required |
| GET | `/company-invitations/myInvitations` | Get company invitations | required |

---

### 12. 👨‍💼 Company Memberships (`/company-memberships`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/company-memberships/memberships/stats` | Get membership statistics | required |
| GET | `/company-memberships/memberships` | Get company memberships | required |
| GET | `/company-memberships/user/:userId` | Get membership by user ID | required |
| DELETE | `/company-memberships/:membershipId` | Delete membership | required |
| PATCH | `/company-memberships/:membershipId` | Update membership | required |
| PATCH | `/company-memberships/:membershipId/role` | Update membership role | required |
| PATCH | `/company-memberships/:membershipId/department` | Update membership department | required |

---

### 13. 📈 Dashboard (`/dashboard`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/dashboard/getAllUsers` | Get all users | required |
| GET | `/dashboard/getCounts` | Get global counters | required |
| GET | `/dashboard/statsCards` | Get dashboard statistics | required |
| GET | `/dashboard/richStats` | Get detailed statistics | required |
| GET | `/dashboard/getUserCountsByDay` | Get daily user count evolution | required |
| GET | `/dashboard/getUserCountsByLocation` | Get statistics by location | required |
| GET | `/dashboard/job-assessment-results-grouped` | Get assessment results grouped | required |
| POST | `/dashboard/getJobAssessmentsBySkill` | Get assessments by skill | required |
| GET | `/dashboard/downloadUserExcel` | Download users Excel export | required |
| GET | `/dashboard/download-users-with-assessment-zero` | Download without assessment | required |
| GET | `/dashboard/download-users-with-assessment-Above50` | Download score > 50 | required |

---

### 14. 📑 Plan Limits (`/plan-limits`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/plan-limits` | Create plan | required | Admin |
| GET | `/plan-limits` | Get all plans | public | - |
| GET | `/plan-limits/:id` | Get plan by ID | public | - |
| PUT | `/plan-limits` | Update plan | required | Admin |

---

### 15. 💳 Subscriptions (`/subscriptions`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/subscriptions/active` | Get active subscription | required |
| GET | `/subscriptions/combined` | Get combined active details | required |
| GET | `/subscriptions` | Get company subscriptions | required |
| GET | `/subscriptions/:subscriptionId/details` | Get subscription details | required |
| GET | `/subscriptions/:companyProfileId/check-limit/:limitType` | Check subscription limit | required |

---

### 16. 🧪 CV Analysis (`/cv-analysis`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/cv-analysis` | Create CV analysis | optional |
| GET | `/cv-analysis` | Get all analyses | optional |
| GET | `/cv-analysis/stats` | Get statistics | optional |
| GET | `/cv-analysis/search` | Search analyses | optional |
| GET | `/cv-analysis/:id` | Get analysis by ID | optional |
| PUT | `/cv-analysis/:id` | Update analysis | optional |
| DELETE | `/cv-analysis/:id` | Delete analysis | optional |
| GET | `/cv-analysis/user/:userId` | Get analyses for user | optional |
| GET | `/cv-analysis/company/:companyId` | Get analyses for company | optional |
| GET | `/cv-analysis/seniority/:seniority` | Get analyses by seniority | optional |

---

### 17. 🏭 Departments (`/departments`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/departments` | Create department | required | Company/Employee |
| GET | `/departments` | Get company departments | required | - |
| GET | `/departments/stats` | Get statistics | required | - |
| GET | `/departments/:id` | Get department by ID | required | - |
| PUT | `/departments/:id` | Update department | required | - |
| DELETE | `/departments/:id` | Delete department | required | - |

---

### 18. ✉️ Contact (`/contact`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/contact` | Submit contact form | public |
| POST | `/contact/enterprise` | Submit enterprise inquiry | public |
| GET | `/contact/status` | Check service status | required |

---

### 19. 🔑 API Keys (`/api/api-keys`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/api-keys` | Create API key | required |
| GET | `/api/api-keys` | List API keys | required |
| GET | `/api/api-keys/:id` | Get API key details | required |
| PUT | `/api/api-keys/:id` | Update API key | required |
| PATCH | `/api/api-keys/:id/toggle` | Toggle API key status | required |
| POST | `/api/api-keys/:id/regenerate` | Regenerate API key | required |
| DELETE | `/api/api-keys/:id` | Delete API key | required |

---

### 20. 👥 Campaign Participants (`/campaign-participants`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/campaign-participants/:campaignId/participants` | Add participant | required |
| GET | `/campaign-participants/:campaignId/participants` | Get campaign participants | required |
| GET | `/campaign-participants/:participantId` | Get participant by ID | required |
| GET | `/campaign-participants/token/:token` | Get participant by token | public |
| PUT | `/campaign-participants/:participantId` | Update participant | required |
| DELETE | `/campaign-participants/:participantId` | Delete participant | required |
| PATCH | `/campaign-participants/:participantId/drop` | Mark as dropped | required |

---

### 21. 📋 Todo (`/todo`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/todo/profile` | Generate profile todo list | required | Candidate |
| GET | `/todo/profile` | Get profile todo list | required | Candidate |

---

### 22. 💬 Feedback (`/feedback`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/feedback/addFeedback` | Add feedback | required | Any |
| GET | `/feedback/getAllFeedback` | Get all feedback | required | Admin |

---

### 23. 📋 Tasks (`/task`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/task/send-task` | Send technical test | required |
| GET | `/task/test-email` | Test email config | required |

---

### 24. 💳 Stripe (`/stripe`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/stripe/create-checkout-session` | Create payment session | required |

---

### 25. ⚙️ Backup (`/admin/backups`)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/admin/backups/perform` | Trigger database backup | required | Admin |
| GET | `/admin/backups/list` | List available backups | required | Admin |
| POST | `/admin/backups/restore/:backupName` | Restore from backup | required | Admin |
| DELETE | `/admin/backups/delete/:backupName` | Delete specific backup | required | Admin |
| GET | `/admin/backups/info` | Get backup info | required | Admin |

---

### 26. 🛡️ Permissions (`/permissions`)

**Admin:** `/admin/companies/:companyId/permissions`  
**Employee:** `/employee-permissions/:userId`

---

### 27. 📜 Logs (`/logs`)

System logging management - See `log.routes.js`

---

### 28. 🎪 Internal Campaigns (`/internal-campaigns`)

Internal campaign management - See `internalCampaign.routes.js`

---

### 29. 💰 Payments (`/payments`)

Payment management - See `payment.routes.js`

---

### 30. 📢 Notifications (`/notification-system`)

Notification system - See `notificationSystem.routes.js`

---

## 🎯 Guide for Frontend

### How to verify usage?

1. **Search in your frontend code:**
   - Use `Ctrl+F` to search endpoints (e.g., `/auth/register`)
   - Search for URLs with fetch/axios/http requests

2. **Create a report:**
   - For each endpoint in this file, note if you use it
   - Mark unused endpoints for optimization

3. **Optimize:**
   - Remove unused endpoints from frontend
   - Reduce redundant API calls
   - Consolidate similar endpoints

---

## 📊 Statistics by Authentication Type

- **Public (15):** Register, Login, OTP, Public Profile, Post Search, etc.
- **Required (141):** All other operations (CRUD, management, analytics)
- **Optional (few):** CV Analysis, Pipeline Interview (for certain cases)

---

## 🚨 Important Points

- ⚠️ **Backup Restore:** Overwrites the current database
- 🔒 **API Keys:** Required for third-party integration
- 📅 **Plan Limits:** Manages quotas per plan
- 💳 **Subscriptions:** Tracks plan usage
- 🎯 **Job Applications:** Has scoring logic

---

**Last updated:** May 5, 2026
