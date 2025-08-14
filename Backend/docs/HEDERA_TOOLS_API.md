# Hedera Tools API

This API provides direct access to Hedera Agent Kit tools without LLM or prompts. All endpoints call the tools directly.

## Base URL
All endpoints are prefixed with `/hedera-tools`

## Authentication
All endpoints require JWT authentication via the `Authorization` header.

## Available Endpoints

### 1. Create Fungible Token
**POST** `/hedera-tools/create-token`

Creates a new fungible token on Hedera using direct tool calls.

**Request Body:**
```json
{
  "name": "My Token",
  "symbol": "MTK",
  "decimals": 2,
  "initialSupply": 1000,
  "treasuryAccount": "0.0.123456" // Optional, defaults to configured account
}
```

**Response:**
```json
{
  "success": true,
  "tokenId": "0.0.789012",
  "transactionId": "0.0.123456@1234567890.123456789",
  "message": "Fungible token MTK created successfully"
}
```

### 2. Create Consensus Topic
**POST** `/hedera-tools/create-topic`

Creates a new consensus topic on Hedera using direct tool calls.

**Request Body:**
```json
{
  "memo": "My topic for messages", // Optional
  "adminKey": "admin_key_here", // Optional
  "submitKey": "submit_key_here" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "topicId": "0.0.345678",
  "transactionId": "0.0.123456@1234567890.123456789",
  "message": "Consensus topic created successfully"
}
```

### 3. Submit Topic Message
**POST** `/hedera-tools/submit-message`

Submits a message to an existing consensus topic using direct tool calls.

**Request Body:**
```json
{
  "topicId": "0.0.345678",
  "message": "Hello, Hedera!"
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "0.0.123456@1234567890.123456789",
  "topicId": "0.0.345678",
  "message": "Message submitted to topic successfully"
}
```

### 4. Get HBAR Balance
**GET** `/hedera-tools/balance?accountId=0.0.123456`

Gets the HBAR balance for a specific account using direct tool calls.

**Query Parameters:**
- `accountId`: The Hedera account ID to check

**Response:**
```json
{
  "success": true,
  "accountId": "0.0.123456",
  "balance": "100.50",
  "unit": "HBAR",
  "message": "Balance retrieved successfully"
}
```

### 5. Get My Balance
**GET** `/hedera-tools/my-balance`

Gets the HBAR balance for the configured account using direct tool calls.

**Response:**
```json
{
  "success": true,
  "accountId": "0.0.123456",
  "balance": "100.50",
  "unit": "HBAR",
  "message": "Your balance retrieved successfully"
}
```

### 6. Get Available Tools
**GET** `/hedera-tools/tools`

Returns information about available Hedera Agent Kit tools.

**Response:**
```json
{
  "success": true,
  "tools": [
    {
      "name": "create_fungible_token",
      "description": "Creates a fungible token",
      "parameters": {...}
    },
    {
      "name": "create_topic",
      "description": "Creates a consensus topic",
      "parameters": {...}
    },
    {
      "name": "submit_topic_message",
      "description": "Submits a message to a topic",
      "parameters": {...}
    },
    {
      "name": "get_hbar_balance",
      "description": "Gets HBAR balance for an account",
      "parameters": {...}
    }
  ],
  "count": 4,
  "message": "Available Hedera tools retrieved successfully"
}
```

## Environment Variables Required

Make sure these environment variables are set in your `.env` file:

```env
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=your_private_key_here
```

## Key Features

- **Direct tool calls** - No LLM, no prompts, just direct function execution
- **Four core tools** - CREATE_FUNGIBLE_TOKEN_TOOL, CREATE_TOPIC_TOOL, SUBMIT_TOPIC_MESSAGE_TOOL, GET_HBAR_BALANCE_QUERY_TOOL
- **JWT Authentication** - All endpoints protected
- **Compatible with Together AI** - Uses Hedera Agent Kit without OpenAI dependency
- **Error handling** - Comprehensive error responses
- **Logging** - Request logging via middleware

## Error Responses

All endpoints return error responses in this format:

```json
{
  "error": "Error description",
  "details": "Detailed error message"
}
```

Common HTTP status codes:
- `400`: Bad Request (missing required parameters)
- `401`: Unauthorized (missing or invalid JWT token)
- `500`: Internal Server Error (Hedera operation failed)