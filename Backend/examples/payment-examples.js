/**
 * Payment Model - Testing & Usage Examples
 * File: Backend/examples/payment-examples.js
 */

/**
 * ============================================
 * 1. CREATING A CHECKOUT SESSION
 * ============================================
 */

// Request to create a payment session
POST /api/stripe/create-checkout-session
Content-Type: application/json

{
  "planId": "507f1f77bcf86cd799439011"
}

// Response (Success):
{
  "url": "https://checkout.stripe.com/pay/cs_...",
  "sessionId": "cs_...",
  "planId": "507f1f77bcf86cd799439011",
  "paymentId": "507f1f77bcf86cd799439012"  // NEW!
}

// ✅ Payment record created in DB with status: "pending"

/**
 * ============================================
 * 2. VERIFY PAYMENT AFTER CHECKOUT
 * ============================================
 */

// After user completes payment on Stripe, verify and update status
POST /api/payments/verify
Content-Type: application/json

{
  "sessionId": "cs_..."
}

// Response:
{
  "success": true,
  "message": "Payment status verified and updated",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439001",
    "planId": "507f1f77bcf86cd799439011",
    "planName": "Premium",
    "status": "completed",  // Updated from "pending"
    "completedAt": "2026-04-21T10:30:00Z",
    "stripePaymentIntentId": "pi_...",
    ...
  }
}

/**
 * ============================================
 * 3. GET USER'S PAYMENT HISTORY
 * ============================================
 */

GET /api/payments/user/history
Authorization: Bearer <token>

// Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "planId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Premium",
        "priceUsd": 99,
        "postsLimit": 100,
        "monthlyInterviewLimit": 50
      },
      "status": "completed",
      "planPrice": 99,
      "amountCents": 9900,
      "completedAt": "2026-04-21T10:30:00Z",
      "createdAt": "2026-04-21T10:00:00Z"
    }
  ],
  "stats": {
    "totalPayments": 3,
    "completedPayments": 3,
    "totalSpent": 297,
    "lastPayment": {...}
  }
}

/**
 * ============================================
 * 4. GET ALL PAYMENTS (ADMIN)
 * ============================================
 */

// Get all payments with optional filters
GET /api/payments?status=completed&planId=507f1f77bcf86cd799439011
Authorization: Bearer <admin_token>

// Query Parameters:
// - status: pending, completed, failed, cancelled
// - userId: filter by user
// - companyProfileId: filter by company
// - planId: filter by plan

// Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {...},
      "companyProfileId": {...},
      "planId": {...},
      "status": "completed",
      ...
    }
  ],
  "count": 150
}

/**
 * ============================================
 * 5. GET COMPANY PAYMENT HISTORY (ADMIN)
 * ============================================
 */

GET /api/payments/company/507f1f77bcf86cd799439020
Authorization: Bearer <admin_token>

// Response:
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "userId": {
        "_id": "507f1f77bcf86cd799439001",
        "email": "user@company.com"
      },
      "planName": "Premium",
      "status": "completed",
      "planPrice": 99,
      ...
    }
  ],
  "stats": {
    "totalPayments": 12,
    "completedPayments": 11,
    "totalSpent": 1089,
    "lastPayment": {...}
  }
}

/**
 * ============================================
 * 6. GET PAYMENT STATISTICS (ADMIN)
 * ============================================
 */

GET /api/payments/stats/dashboard?startDate=2026-01-01&endDate=2026-04-30&companyProfileId=507f1f77bcf86cd799439020
Authorization: Bearer <admin_token>

// Response:
{
  "success": true,
  "data": {
    "totalPayments": 150,
    "completedPayments": 145,
    "failedPayments": 3,
    "pendingPayments": 2,
    "totalRevenue": 14500.50,
    "averagePaymentValue": "96.67"
  },
  "dateRange": {
    "startDate": "2026-01-01",
    "endDate": "2026-04-30"
  }
}

/**
 * ============================================
 * 7. GET SPECIFIC PAYMENT DETAILS (ADMIN)
 * ============================================
 */

GET /api/payments/507f1f77bcf86cd799439012
Authorization: Bearer <admin_token>

// Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439001",
      "email": "user@company.com"
    },
    "companyProfileId": {
      "_id": "507f1f77bcf86cd799439020",
      "companyName": "Tech Corp"
    },
    "planId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Premium",
      "priceUsd": 99,
      "postsLimit": 100,
      "monthlyInterviewLimit": 50
    },
    "stripeSessionId": "cs_...",
    "stripePaymentIntentId": "pi_...",
    "status": "completed",
    "planPrice": 99,
    "amountCents": 9900,
    "currency": "usd",
    "completedAt": "2026-04-21T10:30:00Z",
    "metadata": {
      "planDescription": "Premium features",
      "postsLimit": 100,
      "monthlyInterviewLimit": 50
    },
    "createdAt": "2026-04-21T10:00:00Z",
    "updatedAt": "2026-04-21T10:30:00Z"
  }
}

/**
 * ============================================
 * 8. DELETE PAYMENT (ADMIN - PENDING ONLY)
 * ============================================
 */

DELETE /api/payments/507f1f77bcf86cd799439012
Authorization: Bearer <admin_token>

// Response (Success):
{
  "success": true,
  "message": "Payment deleted successfully"
}

// Response (Error - not pending):
{
  "message": "Failed to delete payment",
  "error": "Can only delete pending payments"
}

/**
 * ============================================
 * 9. PAYMENT MODEL STRUCTURE
 * ============================================
 */

{
  "_id": ObjectId,
  
  // User & Company
  "userId": ObjectId,                    // ref: User
  "companyProfileId": ObjectId,          // ref: Profile
  
  // Plan Information
  "planId": ObjectId,                    // ref: PlanLimits
  "planName": String,                    // e.g., "Premium"
  "planPrice": Number,                   // e.g., 99 (USD)
  
  // Stripe Details
  "stripeSessionId": String,             // UNIQUE
  "stripePaymentIntentId": String,       // Optional
  "stripePriceData": Object,             // Optional
  
  // Payment Status
  "status": String,                      // "pending" | "completed" | "failed" | "cancelled"
  "paymentMethod": String,               // e.g., "card"
  
  // Amount Info
  "amountCents": Number,                 // e.g., 9900 (= $99.00)
  "currency": String,                    // "usd"
  
  // Dates
  "completedAt": Date,                   // Set when status = "completed"
  "expiresAt": Date,                     // Optional
  
  // Metadata & Notes
  "metadata": Object,                    // Custom data
  "notes": String,                       // Internal notes
  
  // Timestamps
  "createdAt": Date,
  "updatedAt": Date
}

/**
 * ============================================
 * 10. COMMON QUERIES / AGGREGATIONS
 * ============================================
 */

// Total revenue from completed payments
db.payments.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: null, total: { $sum: "$planPrice" } } }
])

// Payments by status
db.payments.aggregate([
  { $group: { _id: "$status", count: { $sum: 1 } } }
])

// Top selling plans
db.payments.aggregate([
  { $match: { status: "completed" } },
  { $group: { _id: "$planName", count: { $sum: 1 }, revenue: { $sum: "$planPrice" } } },
  { $sort: { revenue: -1 } }
])

// Pending payments older than 24 hours
db.payments.find({
  status: "pending",
  createdAt: { $lt: new Date(Date.now() - 24*3600*1000) }
})
