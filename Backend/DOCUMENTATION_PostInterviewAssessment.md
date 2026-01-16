# PostInterviewAssessment Model - Complete Implementation

## 📋 Overview
The `PostInterviewAssessment` model has been created as a specialized assessment system for interviews related to job posts. It extends the interview assessment functionality with direct relationships to Post and User models.

## 📁 Files Created

### 1. **Model** - `PostInterviewAssessmentModel.js`
Location: `Backend/models/PostInterviewAssessmentModel.js`

**Key Features:**
- Relationships:
  - `post`: Reference to Post model (required)
  - `candidate`: Reference to Profile model (required)
  - `user`: Reference to User model (required)
  - `company`: Reference to Profile model (optional)
- Interview Data:
  - `interviewData.finalReport`: Complete assessment report
  - `interviewData.analytics`: Interview metrics (duration, message count, etc.)
  - `interviewData.sessionId`: Unique session identifier
- Status Tracking:
  - `status`: draft, in-progress, completed, archived
  - `stage`: pending, scheduled, completed, rejected
- Timestamps:
  - `createdAt`, `updatedAt`, `completedAt`

**Methods:**
- `calculateOverallScore()`: Calculates weighted score (technical: 40%, approach: 30%, learning: 20%, experience: 10%)
- `getSummary()`: Returns assessment summary
- `updateStatus(newStatus)`: Updates status and sets completedAt if completed
- `updateStage(newStage)`: Updates stage

### 2. **Service** - `postInterviewAssessmentService.js`
Location: `Backend/services/PostInterviewAssessmentService/postInterviewAssessmentService.js`

**CRUD Operations:**

#### CREATE
- `createPostInterviewAssessment(assessmentData)` - Creates new assessment with validation

#### READ
- `getPostInterviewAssessmentById(assessmentId)` - Get single assessment with populated relations
- `getAssessmentsByPost(postId, filters)` - Get all assessments for a post
- `getAssessmentsByCandidate(candidateId, filters)` - Get all assessments for a candidate
- `getAssessmentsByUser(userId, filters)` - Get all assessments for a user

#### UPDATE
- `updatePostInterviewAssessment(assessmentId, updateData)` - Update entire assessment
- `updateInterviewData(assessmentId, interviewData)` - Update interview data only
- `updateAssessmentStatus(assessmentId, status)` - Update status
- `updateAssessmentStage(assessmentId, stage)` - Update stage

#### DELETE
- `deletePostInterviewAssessment(assessmentId)` - Delete single assessment
- `deleteAssessmentsByPost(postId)` - Delete all assessments for a post

#### ANALYTICS & SEARCH
- `getAssessmentStatistics(postId)` - Get aggregated statistics
- `searchAssessments(searchCriteria)` - Search assessments by multiple criteria

### 3. **Controller** - `postInterviewAssessmentController.js`
Location: `Backend/controllers/PostInterviewAssessmentControllers/postInterviewAssessmentController.js`

**All service methods mapped to HTTP endpoints with:**
- Input validation
- Error handling
- Response formatting
- Status codes (201 for create, 200 for success, 400 for validation, 500 for errors)

### 4. **Router** - `postInterviewAssessmentRouter.js`
Location: `Backend/routes/postInterviewAssessmentRouter.js`

**Routes Structure:**

```
PUBLIC ROUTES (no authentication required):
GET    /postInterviewAssessments/:assessmentId
GET    /postInterviewAssessments/post/:postId
GET    /postInterviewAssessments/candidate/:candidateId
GET    /postInterviewAssessments/post/:postId/statistics

AUTHENTICATED ROUTES (requireAuthUser middleware):
POST   /postInterviewAssessments
GET    /postInterviewAssessments/my/assessments
GET    /postInterviewAssessments/search
PUT    /postInterviewAssessments/:assessmentId
PATCH  /postInterviewAssessments/:assessmentId/status
PATCH  /postInterviewAssessments/:assessmentId/stage
PATCH  /postInterviewAssessments/:assessmentId/interview-data
DELETE /postInterviewAssessments/:assessmentId
DELETE /postInterviewAssessments/post/:postId
```

## 🔗 Relationships

### With User Model
- Direct reference: `user` field (The user conducting or creating the assessment)

### With Post Model
- Direct reference: `post` field (The job posting being assessed)

### With Profile Model
- `candidate`: Profile of the candidate being assessed
- `company`: Profile of the company (optional)

## 📊 Indexes
The following indexes are created for optimal query performance:
- `post + candidate` (composite)
- `post + user` (composite)
- `candidate`
- `user`
- `status`
- `stage`
- `metadata.skill`
- `metadata.proficiency`
- `createdAt` (descending)

## 🚀 Integration

The router is integrated into the application via `Backend/config/routes.js`:
```javascript
app.use('/post-interview-assessment', postInterviewAssessmentRouter);
```

## 📝 Usage Examples

### Create Assessment
```javascript
POST /post-interview-assessment
{
  "post": "post_id",
  "candidate": "candidate_profile_id",
  "user": "user_id",
  "company": "company_profile_id",
  "metadata": {
    "skill": "JavaScript",
    "role": "Frontend Developer",
    "proficiency": "Senior"
  },
  "interviewData": {
    "sessionId": "session_123",
    "interviewType": "TECHNICAL_INTERVIEW"
  }
}
```

### Get Assessment by Post
```javascript
GET /post-interview-assessment/post/:postId?status=completed&stage=pending
```

### Update Status
```javascript
PATCH /post-interview-assessment/:assessmentId/status
{
  "status": "completed"
}
```

### Search Assessments
```javascript
GET /post-interview-assessment/search?postId=...&candidateId=...&skill=JavaScript
```

## ⚙️ Environment & Dependencies

- Framework: Express.js
- Database: MongoDB with Mongoose
- Validation: Built-in schema validation with error handling
- Authentication: requireAuthUser middleware
- Logging: Custom logging middleware

## 🔐 Security Features

- All authenticated routes require valid JWT token via `requireAuthUser` middleware
- Validation of required fields (post, candidate, user)
- Database constraints and relationships enforced
- Proper error handling with appropriate HTTP status codes

## 📈 Future Enhancements

- Implement pagination for list endpoints
- Add filtering by date ranges
- Implement bulk operations
- Add assessment result caching
- Implement real-time updates via WebSocket
