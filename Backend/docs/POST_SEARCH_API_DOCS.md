# Post Search API Documentation

## ✅ Implementation Complete

A new public API endpoint has been created to fetch job posts with advanced search, filtering, and pagination from MongoDB.

## 🔌 API Endpoint

**URL:** `GET /post/search`  
**Base URL:** `http://localhost:5000/post/search`  
**Authentication:** None (Public endpoint)

## 📋 Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number for pagination |
| `limit` | number | 6 | Number of items per page |
| `search` | string | - | Search in title, description, requirements, and skills |
| `location` | string | - | Filter by job location (e.g., "San Francisco, CA") |
| `category` | string | - | Filter by job category |
| `type` | string | - | Filter by job type (Remote, On-Site, Hybrid) |
| `employmentType` | string | - | Filter by employment type (Full-Time, Part-Time, Contract) |
| `status` | string | active | Filter by post status |
| `sortBy` | string | createdAt | Sort field (createdAt, title, salary) |
| `sortOrder` | string | desc | Sort order (asc or desc) |

## 📊 Response Format

```json
{
  "success": true,
  "results": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "jobDetails": {
        "title": "Senior Software Engineer",
        "description": "We are looking for...",
        "location": "San Francisco, CA",
        "workType": "Remote",
        "employmentType": "Full-Time",
        "salary": {
          "min": 120000,
          "max": 180000,
          "currency": "USD"
        },
        "requirements": "5+ years experience...",
        "experienceLevel": "Senior"
      },
      "skillAnalysis": {
        "requiredSkills": [
          { "name": "JavaScript", "level": "Expert" },
          { "name": "React", "level": "Advanced" }
        ]
      },
      "user": {
        "_id": "507f191e810c19729de860ea",
        "companyDetails": {
          "companyName": "TechCorp Inc.",
          "logo": "https://..."
        },
        "email": "hr@techcorp.com",
        "username": "techcorp"
      },
      "status": "active",
      "createdAt": "2025-01-09T10:00:00.000Z",
      "category": "Software Development"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 6,
  "totalPages": 8,
  "hasNextPage": true,
  "hasPrevPage": false,
  "filters": {
    "search": null,
    "location": null,
    "type": null,
    "employmentType": null,
    "status": "active",
    "category": null,
    "sortBy": "createdAt",
    "sortOrder": "desc"
  }
}
```

## 🧪 Example API Calls

### 1. Get all active jobs (first page)
```bash
GET http://localhost:5000/post/search?status=active&page=1&limit=6
```

### 2. Search for "developer" jobs
```bash
GET http://localhost:5000/post/search?search=developer&status=active
```

### 3. Filter by location
```bash
GET http://localhost:5000/post/search?location=San Francisco&status=active
```

### 4. Filter by job type
```bash
GET http://localhost:5000/post/search?type=Remote&status=active
```

### 5. Combined filters
```bash
GET http://localhost:5000/post/search?search=javascript&location=New York&type=Remote&employmentType=Full-Time&page=1&limit=10
```

### 6. Sort by salary (highest first)
```bash
GET http://localhost:5000/post/search?sortBy=salary&sortOrder=desc&status=active
```

## 🎯 Frontend Implementation

The frontend (`src/pages/jobs.tsx`) has been updated to consume this API:

### Data Transformation
The frontend transforms the backend response to match its interface:
```typescript
const transformedJobs = data.results.map((job) => ({
  id: job._id,
  title: job.jobDetails?.title,
  company: job.user?.companyDetails?.companyName,
  location: job.jobDetails?.location,
  type: job.jobDetails?.workType,
  employmentType: job.jobDetails?.employmentType,
  salary: {
    min: job.jobDetails?.salary?.min,
    max: job.jobDetails?.salary?.max,
    currency: job.jobDetails?.salary?.currency,
  },
  description: job.jobDetails?.description,
  datePosted: job.createdAt,
  skills: job.skillAnalysis?.requiredSkills.map(skill => skill.name),
  logo: job.user?.companyDetails?.logo,
}));
```

### Features
- ✅ Real-time search as you type
- ✅ Location dropdown filter
- ✅ Category dropdown filter
- ✅ Pagination with page numbers
- ✅ Total results count
- ✅ Loading states
- ✅ Error handling

## 🔧 Backend Implementation

### Service Layer (`Backend/services/postService.js`)
```javascript
module.exports.getAllPostsWithSearch = async (filters = {}, page = 1, limit = 6) => {
  // Build MongoDB query based on filters
  // Apply search regex for title, description, requirements, skills
  // Apply location, type, employmentType filters
  // Execute query with pagination and sorting
  // Return posts with pagination metadata
};
```

### Controller Layer (`Backend/controllers/postController.js`)
```javascript
exports.getAllPostsWithSearch = async (req, res) => {
  // Extract query parameters
  // Parse pagination parameters
  // Call service method
  // Return formatted JSON response
};
```

### Route Layer (`Backend/routes/postRouter.js`)
```javascript
// Public route - no authentication required
router.get("/search", postController.getAllPostsWithSearch);
```

## 🚀 How to Test

### 1. Using the Browser
1. Start the backend server: `cd Backend && npm start`
2. Start the frontend: `npm run dev`
3. Visit: `http://localhost:3000/jobs`
4. Try searching, filtering, and pagination

### 2. Using cURL
```bash
# Get all active jobs
curl "http://localhost:5000/post/search?status=active"

# Search for jobs
curl "http://localhost:5000/post/search?search=developer"

# With filters
curl "http://localhost:5000/post/search?search=javascript&location=San%20Francisco&type=Remote"
```

### 3. Using Postman/Thunder Client
- Method: GET
- URL: `http://localhost:5000/post/search`
- Query Params:
  - status: active
  - search: developer
  - page: 1
  - limit: 6

## 📝 Database Requirements

Make sure you have:
1. MongoDB running
2. Posts in the database with `status: "active"`
3. Posts with the following structure:
   - `jobDetails.title`
   - `jobDetails.description`
   - `jobDetails.location`
   - `jobDetails.workType` or `jobDetails.type`
   - `jobDetails.employmentType`
   - `jobDetails.salary.min/max/currency`
   - `skillAnalysis.requiredSkills[]`
   - `user` (populated with companyDetails)

## ✨ Features

### Search Functionality
- Searches across:
  - Job title
  - Job description
  - Job requirements
  - Required skills names

### Filtering
- **Location**: Partial match (case-insensitive)
- **Type**: Remote, On-Site, Hybrid
- **Employment Type**: Full-Time, Part-Time, Contract
- **Category**: Job category
- **Status**: active, draft, closed, etc.

### Sorting
- By creation date (newest first by default)
- By salary (ascending or descending)
- By title (alphabetical)

### Pagination
- Configurable page size
- Page navigation metadata
- Total count and pages

## 🔒 Security Notes

- This endpoint is public (no authentication required)
- Only returns posts with `status: "active"` by default
- Sensitive user data is limited via `.select()` in populate
- Input sanitization through MongoDB regex options

## 🐛 Troubleshooting

### No jobs returned?
- Check if you have posts with `status: "active"` in your database
- Verify your MongoDB connection
- Check backend console for errors

### Search not working?
- Make sure your posts have the required fields
- Check that fields are not empty
- Verify the search parameter is being passed correctly

### Pagination issues?
- Ensure `page` and `limit` are positive integers
- Check that `totalPages` is calculated correctly
- Verify the database has enough records

## 📚 Related Files

**Backend:**
- `Backend/services/postService.js` - Service layer with search logic
- `Backend/controllers/postController.js` - Controller handling requests
- `Backend/routes/postRouter.js` - Route definition
- `Backend/app.js` - Routes registered here

**Frontend:**
- `src/pages/jobs.tsx` - Job search page consuming the API
- `src/components/Header.tsx` - Navigation with "Find Jobs" link
- `src/components/home-page/ModernFooter.tsx` - Footer component

## 🎉 Success!

Your job search page is now powered by real database data with full search, filtering, and pagination capabilities!

