# TalentAI Backend

This is the backend service for the TalentAI platform, built with Express.js and Node.js.

## Features

- RESTful API endpoints
- Integration with Hedera Hashgraph blockchain
- OpenAI integration
- MongoDB database
- JWT authentication
- Swagger API documentation
- Email service integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Hedera Hashgraph account
- OpenAI API key

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd Backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   HEDERA_ACCOUNT_ID=your_hedera_account_id
   HEDERA_PRIVATE_KEY=your_hedera_private_key
   OPENAI_API_KEY=your_openai_api_key
   EMAIL_SERVICE=your_email_service
   EMAIL_USER=your_email_user
   EMAIL_PASSWORD=your_email_password
   ```

## Project Structure

```
Backend/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── app.js          # Main application file
└── swagger.json    # API documentation
```

## Available Scripts

- `npm start`: Start the server in production mode
- `npm run dev`: Start the server in development mode with hot reload

## API Documentation

The API documentation is available at `/api-docs` when the server is running. It's built using Swagger UI.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 