# Frontend Integration for Coding Technical Tests

## Overview
The frontend is now fully integrated with the coding technical test API. The system automatically detects task steps and provides a seamless experience for sending coding tests to candidates.

## Key Features

### 1. Automatic Task Detection
- The system automatically detects when a step is a "task" type
- Shows "Send Coding Test" button instead of "Continue Interview"
- Uses appropriate icons (Email icon for tasks, Assignment icon for interviews)

### 2. Enhanced User Experience
- **Loading States**: Button shows "Sending Coding Test..." while processing
- **Notifications**: Professional snackbar notifications instead of basic alerts
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Auto-refresh**: Progress data refreshes after successful task sending

### 3. API Integration
- **Endpoint**: `POST /task/send-task`
- **Authentication**: Uses JWT token from localStorage
- **Data Flow**: Sends postId, candidate details, and step information

## Usage in PostInterviewTab Component

### Button Behavior
```typescript
// For task steps
if (isTaskStep) {
  return `Send Coding Test: ${stepLabel}`;
}

// For interview steps  
return `Continue: ${stepLabel}`;
```

### API Call
```typescript
const response = await fetch('/task/send-task', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    postId: progress.idPost?._id,
    stepId: step?.stepId?._id || step?._id,
    candidateId: progress.idCandidate?._id,
    candidateEmail: progress.idCandidate?.email,
    candidateName: `${progress.idCandidate?.FirstName || ''} ${progress.idCandidate?.LastName || ''}`.trim(),
    jobTitle: progress.idPost?.jobDetails?.title,
    stepLabel: step?.stepId?.data?.label || step?.data?.label || 'Task'
  }),
});
```

## Test Component

A test component `TestCodingTask.tsx` is available for testing the API:

```typescript
import TestCodingTask from './components/TestCodingTask';

// Use in any page
<TestCodingTask onTestComplete={(result) => console.log('Test sent:', result)} />
```

## State Management

### Loading States
```typescript
const [sendingTask, setSendingTask] = useState<string | null>(null);
```

### Notifications
```typescript
const [notification, setNotification] = useState<{
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}>({
  open: false,
  message: '',
  severity: 'info'
});
```

## Error Handling

The system handles various error scenarios:

1. **Authentication Errors**: "No authentication token found"
2. **API Errors**: Displays server error messages
3. **Network Errors**: "Unknown error" fallback
4. **Validation Errors**: "Please fill in all required fields"

## Success Flow

1. User clicks "Send Coding Test" button
2. Button shows loading state and becomes disabled
3. API call is made to `/task/send-task`
4. AI generates coding test based on post technologies
5. PDF is created and attached to email
6. Email is sent to candidate
7. Success notification is shown
8. Progress data is refreshed
9. Button returns to normal state

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/
```

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "success": true,
    "testData": {
      "postId": "...",
      "testContent": "...",
      "technologies": ["React", "Node.js"],
      "jobTitle": "Software Developer",
      "experienceLevel": "Intermediate"
    },
    "emailResult": {
      "messageId": "..."
    },
    "message": "Technical test created and sent successfully"
  },
  "message": "Technical test sent successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Integration Checklist

- ✅ Task detection logic implemented
- ✅ API integration with proper error handling
- ✅ Loading states and user feedback
- ✅ Professional notifications system
- ✅ Auto-refresh after successful operations
- ✅ Test component for development
- ✅ TypeScript types and interfaces
- ✅ Responsive design and accessibility

## Next Steps

1. **Test the integration** using the TestCodingTask component
2. **Configure email settings** in the backend environment
3. **Customize the AI prompts** if needed for specific requirements
4. **Add analytics** to track test sending success rates
5. **Implement test result tracking** when candidates submit solutions

