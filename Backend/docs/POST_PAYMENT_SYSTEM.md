# TAI Token Payment System for Agent Creation

## Overview

This system implements a simplified TAI token payment flow where companies pay the admin wallet when they create an agent/post. The payment amount is calculated based on the number of pipeline steps.

## Payment Flow

```
1. Company creates Post + Pipeline (with multiple steps)
2. Company creates Agent for the Post
3. System counts number of steps in pipeline
4. System calculates price: BASE_FEE + (steps × STEP_RATE)
5. Payment initiated: Company Wallet → Admin Wallet (TAI tokens)
6. Transaction recorded in database
7. Post payment status updated
```

## Pricing Formula

```javascript
Total TAI = BASE_FEE + (number_of_steps × STEP_RATE)

Example:
- Base Fee: 1000 TAI
- Number of Steps: 5
- Step Rate: 100 TAI
- Total: 1000 + (5 × 100) = 1500 TAI
```

## Configuration

### Environment Variables (.env)

```bash
# Admin Hedera Account (receives payments)
HEDERA_ACCOUNT_ID=0.0.1378
HEDERA_PRIVATE_KEY=<your_admin_private_key>
HEDERA_NETWORK=testnet

# Pricing Configuration
TAI_BASE_FEE=1000          # Base fee in TAI tokens
TAI_STEP_RATE=100          # Cost per pipeline step in TAI tokens
```

### TAI Token Information

- **Token ID**: `0.0.6955317` (Hedera Testnet)
- **Decimals**: 8
- **Network**: Hedera Testnet

## API Endpoints

### 1. Calculate Price (Preview)

**GET** `/api/posts/payment/calculate-price/:postId`

Get the payment price for a post before processing payment.

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "676...",
    "numberOfSteps": 5,
    "baseFee": 1000,
    "stepRate": 100,
    "totalPrice": 1500,
    "breakdown": {
      "baseFee": "1000 TAI",
      "stepsCharge": "5 steps × 100 TAI = 500 TAI",
      "total": "1500 TAI"
    }
  }
}
```

### 2. Process Payment

**POST** `/api/posts/payment/process`

Process payment after agent creation is complete.

**Request Body:**
```json
{
  "postId": "676...",
  "agentId": "676..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "postId": "676...",
    "agentId": "676...",
    "payment": {
      "amount": 1500,
      "transactionId": "POST_676..._1234567890",
      "hederaTransactionId": "0.0.1378@1234567890.123456789",
      "status": "completed",
      "timestamp": "2025-01-19T..."
    },
    "breakdown": {
      "baseFee": 1000,
      "numberOfSteps": 5,
      "stepRate": 100,
      "total": 1500
    }
  }
}
```

### 3. Payment History

**GET** `/api/posts/payment/history?page=1&limit=20`

Get payment history for user's posts.

**Response:**
```json
{
  "success": true,
  "data": {
    "transactions": [...],
    "totalCount": 10,
    "currentPage": 1,
    "totalPages": 1
  }
}
```

### 4. Payment Details

**GET** `/api/posts/payment/details/:postId`

Get payment details for a specific post.

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": "676...",
    "paymentStatus": "completed",
    "transactionId": "POST_676..._1234567890",
    "amount": 1500,
    "completedAt": "2025-01-19T...",
    "numberOfSteps": 5,
    "canPay": false
  }
}
```

## Database Schema

### Post Model (Extended)

```javascript
{
  // ... existing fields ...

  // Payment fields
  paymentStatus: {
    type: String,
    enum: ['not_paid', 'pending', 'completed', 'failed'],
    default: 'not_paid'
  },
  paymentTransactionId: String,
  pricePaid: Number,
  paymentCompletedAt: Date,
  paymentError: String
}
```

### TokenTransaction Model

```javascript
{
  userId: ObjectId,
  transactionId: String,
  type: 'spend',              // For post creation payments
  amount: Number,             // Negative for spending
  status: 'pending' | 'completed' | 'failed',
  hederaTransactionHash: String,
  description: String,
  metadata: {
    postId: String,
    numberOfSteps: Number,
    baseFee: Number,
    stepRate: Number
  },
  completedAt: Date,
  failureReason: String
}
```

## Usage Example

### Frontend Integration

```typescript
// 1. After creating agent, calculate price
const priceResponse = await fetch(`/api/posts/payment/calculate-price/${postId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { data: { totalPrice, breakdown } } = await priceResponse.json();

// 2. Show user the price and confirm
console.log(`Payment required: ${totalPrice} TAI`);
console.log(`Breakdown: ${breakdown.baseFee} base + ${breakdown.stepsCharge}`);

// 3. Process payment
const paymentResponse = await fetch('/api/posts/payment/process', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ postId, agentId })
});

const result = await paymentResponse.json();
if (result.success) {
  console.log('Payment successful!');
  console.log('Transaction ID:', result.data.payment.hederaTransactionId);
}
```

### Backend Integration (Alternative - Automatic Payment)

You can also trigger payment automatically after agent creation by calling the service function directly:

```javascript
const agentConfigService = require('../services/agentConfigService');

// After creating agent config
const agentConfig = await agentConfigService.createAgentConfig({ agentId, postId });

// Automatically process payment
try {
  const paymentResult = await agentConfigService.processAgentCreationPayment(
    postId,
    userId
  );
  console.log('Payment processed:', paymentResult);
} catch (error) {
  console.error('Payment failed:', error.message);
  // Handle payment failure (e.g., disable agent, notify user)
}
```

## Error Handling

### Common Errors

1. **Missing Hedera Account**
```json
{
  "success": false,
  "error": "User Hedera account not configured. Please set up your wallet first."
}
```

2. **Payment Already Completed**
```json
{
  "success": false,
  "error": "Payment already completed for this post"
}
```

3. **Insufficient Balance** (from Hedera)
```json
{
  "success": false,
  "error": "Payment processing failed: Insufficient token balance"
}
```

4. **Unauthorized Access**
```json
{
  "success": false,
  "error": "Not authorized to process payment for this post"
}
```

## Security Considerations

1. **Private Key Storage**: Company's Hedera private key is stored encrypted in database
2. **Transaction Signing**: All transactions are signed on backend (never expose keys to frontend)
3. **Ownership Verification**: System verifies user owns the post before processing payment
4. **Idempotency**: Payment status prevents duplicate payments for same post
5. **Audit Trail**: All transactions logged in TokenTransaction collection

## Testing

### Test Flow (Testnet)

1. **Setup Test Account**
   - User must have Hedera account with TAI tokens
   - Store hederaAccountId and hederaPrivateKey in User document

2. **Create Post with Steps**
   ```javascript
   POST /api/posts/save-post
   // Create post with 5 steps
   ```

3. **Calculate Price**
   ```javascript
   GET /api/posts/payment/calculate-price/{postId}
   // Should return: 1000 + (5 × 100) = 1500 TAI
   ```

4. **Process Payment**
   ```javascript
   POST /api/posts/payment/process
   {
     "postId": "...",
     "agentId": "..."
   }
   ```

5. **Verify Transaction**
   - Check TokenTransaction collection
   - Check Post.paymentStatus = 'completed'
   - Verify on Hedera Explorer: https://hashscan.io/testnet

## Monitoring

### Backend Logs

The system logs all payment operations:

```
💳 Processing agent creation payment for Post 676...
📊 Payment calculation:
   Steps: 5
   Price: 1500 TAI
💰 Processing payment for Post 676...
   Company: 0.0.12345
   Amount: 1500 TAI
📝 Database transaction created: POST_676..._1234567890
✅ Payment successful: 1500 TAI from 0.0.12345 to Admin
   Hedera TX: 0.0.1378@1234567890.123456789
✅ Agent creation payment completed for Post 676...
```

### Database Queries

```javascript
// Check payment status for a post
db.posts.findOne({ _id: ObjectId("676...") }, { paymentStatus: 1, pricePaid: 1 })

// Get all pending payments
db.tokentransactions.find({ type: 'spend', status: 'pending' })

// Get payment history for a user
db.tokentransactions.find({ userId: ObjectId("..."), type: 'spend' }).sort({ createdAt: -1 })
```

## Future Enhancements

1. **Dynamic Pricing Model**: Implement the full litepaper pricing (AI tier, verification level, etc.)
2. **Payment Plans**: Allow installment payments
3. **Refunds**: Implement refund logic if agent creation fails
4. **Gas Fee Handling**: Auto-calculate and add HBAR gas fees
5. **Payment Webhooks**: Real-time notifications for payment events
6. **Multi-token Support**: Accept other tokens besides TAI
