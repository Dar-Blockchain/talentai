// Integration Guide for Payment Routes
// File: Backend/config/register-routes.js

/**
 * Add this line to register payment routes in your application:
 */

// Inside your route registration (usually in config/register-routes.js or app.js):

const paymentRoutes = require("../routes/payment.routes");
app.use("/api/payments", paymentRoutes);

/**
 * Example of full route registration:
 */

// ============ EXISTING ROUTES ============
app.use("/api/planLimits", require("../routes/planLimits.routes"));
app.use("/api/stripe", require("../routes/Strip.routes"));

// ============ NEW PAYMENT ROUTES ============
app.use("/api/payments", require("../routes/payment.routes"));

/**
 * This will enable all payment endpoints:
 * 
 * POST   /api/payments/verify                          - Verify payment status
 * GET    /api/payments/user/history                    - User payment history
 * GET    /api/payments                                 - All payments (Admin)
 * GET    /api/payments/:paymentId                      - Payment details (Admin)
 * GET    /api/payments/company/:companyProfileId       - Company payments (Admin)
 * GET    /api/payments/stats/dashboard                 - Stats (Admin)
 * DELETE /api/payments/:paymentId                      - Delete payment (Admin)
 */
