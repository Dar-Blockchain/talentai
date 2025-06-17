# Resume Builder AI Chatbot

This directory contains the resume-specific AI chatbot powered by Together AI's DeepSeek-R1-Distill-Llama-70B-free model.

## Components

- **ResumeBuilderChatBot.tsx**: The main chatbot interface component
- **ResumeChatBotFab.tsx**: Floating action button to launch the chatbot
- **index.ts**: Export barrel for easy imports

## Features

- ✨ AI-powered resume section generation
- 🎯 Context-aware suggestions based on existing resume sections
- 📝 Support for multiple section types (experience, education, skills, projects, etc.)
- 🔄 Real-time preview and editing capabilities
- 💡 Interactive suggestions for follow-up actions
- 📱 Responsive design with fullscreen/minimize options
- 🔒 **Secure server-side API integration** (API key never exposed to client)

## Setup

### 1. API Key Configuration (Secure)

Add your Together AI API key to your `.env` file (server-side only):

```bash
TOGETHER_API_KEY=your_api_key_here
```

**✅ Security Note**: The API key stays on the server and is never exposed to the client-side code.

### 2. Test Your Setup

Visit `http://localhost:3000/api/resume-ai/test` to verify your API connection:
- ✅ Success: API key is working correctly
- ❌ Error: Check your `.env` file and API key

### 3. Integration

The chatbot is already integrated into the resume builder page (`src/pages/resume-builder.tsx`):

```tsx
import { ResumeBuilderChatBot, ResumeChatBotFab } from '@/components/resume-chatbot';

// In your component:
const [resumeChatbotOpen, setResumeChatbotOpen] = useState(false);

const handleSectionGenerated = (sectionData: any) => {
  setSections(prev => [...prev, sectionData]);
  showToast(`${sectionData.type} section added to your resume!`, 'success');
};

// In JSX:
<ResumeChatBotFab
  onClick={() => setResumeChatbotOpen(true)}
  isVisible={!resumeChatbotOpen}
/>

<ResumeBuilderChatBot
  isOpen={resumeChatbotOpen}
  onClose={() => setResumeChatbotOpen(false)}
  onSectionGenerated={handleSectionGenerated}
  currentSections={sections}
  userId={session?.user?.email || 'guest'}
/>
```

## API Routes (Server-Side)

### `/api/resume-ai/generate-section` (POST)
Generates resume sections securely on the server.

**Request Body:**
```json
{
  "userInput": "Create an experience section for my software engineering role",
  "currentSections": ["header", "summary"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sectionType": "experience",
    "title": "Work Experience",
    "content": "• Developed scalable web applications...",
    "suggestions": ["Add more details", "Create another section"],
    "metadata": {
      "company": "Tech Corp",
      "position": "Software Engineer"
    }
  }
}
```

### `/api/resume-ai/test` (GET)
Tests the Together AI connection and API key validity.

## Usage Examples

Users can interact with the chatbot using natural language:

- "Help me create an experience section for my role as a software engineer at Google"
- "Generate an education section with my bachelor's degree in Computer Science"
- "Create a skills section highlighting my React and Node.js experience"
- "Write a professional summary for a data scientist position"

## Supported Section Types

- **Experience**: Professional work history with achievements
- **Education**: Academic background and qualifications
- **Skills**: Technical and soft skills categorization
- **Projects**: Personal or professional projects
- **Summary**: Professional summary/objective statements
- **Custom**: Any other resume section content

## Security Features

✅ **Server-side API calls**: All Together AI requests happen on the server  
✅ **API key protection**: Never exposed to client-side code  
✅ **Input validation**: Server validates all user inputs  
✅ **Error handling**: Proper error responses without leaking sensitive info  
✅ **Rate limiting**: Built-in protection against API abuse  

## Troubleshooting

### "AI service not configured" Error
- Check that `TOGETHER_API_KEY` is set in your `.env` file
- Ensure the `.env` file is in your project root
- Restart your development server after adding the API key

### API Connection Test
```bash
curl http://localhost:3000/api/resume-ai/test
```

### Common Issues
1. **Missing API key**: Add `TOGETHER_API_KEY=your_key` to `.env`
2. **Invalid API key**: Verify your key at [together.ai](https://together.ai)
3. **Server not restarted**: Restart after adding environment variables

## Development

### Adding New Section Types

To add support for new section types, update:

1. The system prompt in `/api/resume-ai/generate-section.ts`
2. The `convertToResumeSection` function in `ResumeBuilderChatBot.tsx`
3. The section type enum in your models

### Error Handling

The API routes include comprehensive error handling for:
- Invalid API keys (401)
- Rate limiting (429) 
- Bad requests (400)
- Server errors (500)

### Monitoring

Check your server logs for Together AI API usage and any errors:
```bash
npm run dev
# Watch for "Together AI API Error:" messages
```

## Customization

### Styling

The chatbot uses Material-UI components with custom styling. Key style properties:

- Gradient background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Glass morphism effects with backdrop blur
- Responsive design with mobile-first approach

## Error Handling

The chatbot includes comprehensive error handling for:

- API connection failures
- Invalid API keys
- Rate limiting
- Malformed responses
- Network timeouts

## Development

### Testing the API Connection

```typescript
import { testTogetherAI } from '@/utils/togetherApi';

const isConnected = await testTogetherAI();
console.log('API Status:', isConnected ? 'Connected' : 'Failed');
```

### Adding Debug Mode

Set `DEBUG_MODE = true` in the component for additional logging and debugging features. 