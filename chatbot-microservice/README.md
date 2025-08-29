# TalentAI Chatbot Microservice

A sophisticated NLP-powered chatbot microservice for TalentAI, a recruitment platform that uses AI and blockchain for skill evaluation, certification, and talent matching.

## Features

- **Intent Classification**: Advanced NLP to understand user intentions
- **Context-Aware Responses**: Intelligent response generation based on user context
- **RESTful API**: Fast and scalable API built with FastAPI
- **Extensible Architecture**: Easy to add new intents, entities, and features
- **Multi-Model Support**: Supports both rule-based and transformer-based NLP
- **Comprehensive Logging**: Full request/response logging for debugging and analytics

## Architecture

```
chatbot-microservice/
├── app/
│   ├── main.py              # FastAPI application entry point
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py        # API endpoints
│   │   └── models.py        # Pydantic models
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Configuration settings
│   │   ├── intent_classifier.py  # Intent classification logic
│   │   └── response_generator.py # Response generation
│   ├── data/
│   │   ├── __init__.py
│   │   ├── intents.py       # Intent definitions and training data
│   │   └── responses.py     # Response templates
│   └── utils/
│       ├── __init__.py
│       ├── logger.py        # Logging configuration
│       └── helpers.py       # Utility functions
├── tests/
│   ├── __init__.py
│   ├── test_api.py          # API endpoint tests
│   └── test_nlp.py          # NLP functionality tests
├── requirements.txt         # Python dependencies
├── .env.example            # Environment variables template
├── Dockerfile              # Docker configuration
└── README.md               # This file
```

## Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy language model
python -m spacy download en_core_web_sm
```

### 2. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
```

### 3. Run the Service

```bash
# Development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

The API will be available at `http://localhost:8001`

Interactive API documentation: `http://localhost:8001/docs`

## API Usage

### Chat Endpoint

**POST** `/api/chat`

```json
{
  "message": "Hello, what is TalentAI?",
  "user_id": "user123",
  "session_id": "session456"
}
```

**Response:**
```json
{
  "response": "Hello! Welcome to TalentAI. TalentAI is an AI-powered recruitment and certification platform using blockchain.",
  "intent": "platform_overview",
  "confidence": 0.95,
  "session_id": "session456"
}
```

### Health Check

**GET** `/health`

Returns service health status and version information.

## Supported Intents

| Intent | Description | Example Utterances |
|--------|-------------|-------------------|
| `greet` | Greeting messages | "Hi", "Hello", "Hey there" |
| `platform_overview` | Questions about TalentAI | "What is TalentAI?", "Tell me about this platform" |
| `how_to_start` | Getting started guidance | "How do I start?", "How do I choose skills?" |
| `scoring` | Score calculation questions | "How is the score calculated?", "Explain the tests" |
| `certification` | Certification process | "Where is my certificate?", "How does certification work?" |
| `fallback` | Unmatched inputs | Any unrecognized message |

## Development

### Adding New Intents

1. Add intent definition in `app/data/intents.py`
2. Add response templates in `app/data/responses.py`
3. Test the new intent
4. Retrain the model if needed

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/
```

### Code Quality

```bash
# Format code
black app/ tests/

# Lint code
flake8 app/ tests/

# Type checking
mypy app/
```

## Deployment

### Docker

```bash
# Build image
docker build -t talentai-chatbot .

# Run container
docker run -p 8001:8001 talentai-chatbot
```

### Production Considerations

- Use a production ASGI server like Gunicorn with Uvicorn workers
- Set up proper logging and monitoring
- Configure environment variables for production
- Use a reverse proxy like Nginx
- Set up SSL/TLS termination
- Consider using a container orchestration platform

## Integration with Node.js Backend

The Node.js backend can integrate with this chatbot service using HTTP requests:

```javascript
const axios = require('axios');

async function getChatbotResponse(message, userId, sessionId) {
  try {
    const response = await axios.post('http://localhost:8001/api/chat', {
      message: message,
      user_id: userId,
      session_id: sessionId
    });
    return response.data;
  } catch (error) {
    console.error('Chatbot service error:', error);
    return { 
      response: "Sorry, I'm having trouble right now. Please try again later.",
      intent: "error",
      confidence: 0.0
    };
  }
}
```

## Future Enhancements

- [ ] Multi-language support
- [ ] Entity extraction (skills, dates, scores)
- [ ] Context persistence across sessions
- [ ] Integration with TalentAI database
- [ ] Advanced conversation flows
- [ ] Analytics and user behavior tracking
- [ ] Voice interface support
- [ ] Real-time chat via WebSockets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## License

This project is part of TalentAI and follows the main project's license. 