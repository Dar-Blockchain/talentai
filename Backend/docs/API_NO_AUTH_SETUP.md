# ✅ Post Search API - No Authentication Required

## Configuration

The `/post/search` endpoint is **PUBLIC** and does **NOT** require authentication.

## How It's Configured

In `Backend/routes/postRouter.js`, the route is defined **BEFORE** the authentication middleware:

```javascript
// Line 21 - PUBLIC ROUTE (no auth required)
router.get("/search", postController.getAllPostsWithSearch);

// Line 24 - Authentication middleware applied to ALL routes BELOW this line
router.use(requireAuthUser, authLogMiddleware("Post"));

// All other routes require authentication...
```

This means:
- ✅ `/post/search` → **No token needed**
- ❌ `/post/get-all-posts` → **Token required**
- ❌ `/post/my-posts` → **Token required**
- ❌ `/post/save-post` → **Token required**

## Correct API URL

```
http://localhost:5000/post/search
```

**NOT:**
- ❌ `http://localhost:5000post/search` (missing slash)
- ❌ `http://localhost:5000/posts/search` (wrong path)
- ❌ `http://localhost:5000/api/post/search` (no /api prefix)

## Testing the API

### Option 1: Use the Test HTML File
1. Open `test-post-search-api.html` in your browser
2. Click the test buttons
3. View results in real-time

### Option 2: Using cURL
```bash
# Basic test
curl http://localhost:5000/post/search?status=active

# With search
curl "http://localhost:5000/post/search?search=developer&status=active"

# With filters
curl "http://localhost:5000/post/search?location=San%20Francisco&type=Remote&status=active"
```

### Option 3: Using Browser Console
```javascript
fetch('http://localhost:5000/post/search?status=active&limit=3')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

## Common Errors & Solutions

### Error: 401 Unauthorized
**Problem:** The route is hitting the authentication middleware  
**Solution:** Make sure the route is defined BEFORE `router.use(requireAuthUser)` in `postRouter.js`

### Error: CORS Error
**Problem:** Cross-origin request blocked  
**Solution:** Backend already has CORS enabled for all origins in `app.js`:
```javascript
app.use(cors({
  origin: "*",
  methods: "GET, POST, PUT, DELETE, PATCH",
  credentials: true,
}));
```

### Error: 404 Not Found
**Problem:** Wrong URL or backend not running  
**Solutions:**
- ✅ Check backend is running: `cd Backend && npm start`
- ✅ Verify URL is `http://localhost:5000/post/search`
- ✅ Check backend console for route registration

### Error: Cannot read property 'title' of undefined
**Problem:** No jobs in database or wrong data structure  
**Solution:** 
- Create some jobs using the existing post creation flow
- Make sure jobs have `status: "active"`
- Verify job structure includes `jobDetails`, `skillAnalysis`, etc.

### Error: net::ERR_CONNECTION_REFUSED
**Problem:** Backend server is not running  
**Solution:** 
```bash
cd Backend
npm start
# Backend should start on port 5000
```

## Frontend Configuration

The frontend (`src/pages/jobs.tsx`) is configured to call this API:

```typescript
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
const apiUrl = `${baseUrl}/post/search?${params}`;

const response = await fetch(apiUrl); // No auth headers needed!
```

**No Authorization header is sent** because this is a public endpoint.

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

If not set, defaults to `http://localhost:5000`.

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your-database
```

## Verification Checklist

- [ ] Backend server is running on port 5000
- [ ] MongoDB is connected
- [ ] At least one job post with `status: "active"` exists in database
- [ ] Frontend URL is `http://localhost:5000/post/search` (with slash)
- [ ] Route is defined BEFORE authentication middleware
- [ ] CORS is enabled in backend
- [ ] No Authorization header in frontend request

## Quick Debug Commands

### Check if backend is running:
```bash
curl http://localhost:5000/
# Should return: {"message":"Bienvenue sur l'API Express!"}
```

### Test the search endpoint:
```bash
curl http://localhost:5000/post/search?status=active
# Should return JSON with success: true
```

### Check MongoDB connection:
```bash
# Look for this in backend console:
# ✅ MongoDB Connected: ...
```

### View all routes in backend:
Look for this in backend startup logs:
```
GET /post/search
POST /post/save-post
GET /post/get-all-posts
...
```

## Example Success Response

```json
{
  "success": true,
  "results": [
    {
      "_id": "...",
      "jobDetails": {
        "title": "Senior Developer",
        "location": "San Francisco, CA",
        ...
      },
      "user": {
        "companyDetails": {
          "companyName": "TechCorp"
        }
      },
      "status": "active"
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 6,
  "totalPages": 2,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

## Need Help?

1. Check backend console for errors
2. Check browser console for errors
3. Use the `test-post-search-api.html` file to test
4. Verify the route order in `postRouter.js`
5. Make sure no other middleware is intercepting the request

---

**Remember:** This endpoint is PUBLIC by design. No authentication token is needed! 🎉

