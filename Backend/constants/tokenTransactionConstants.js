const TOKEN_TRANSACTION_TYPES = Object.freeze({
  PURCHASE: "purchase",
  SPEND: "spend",
  REFUND: "refund",
  BONUS: "bonus",
  ADJUSTMENT: "adjustment",
});

const TOKEN_TRANSACTION_STATUS = Object.freeze({
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
});

const PAYMENT_METHODS = Object.freeze({
  HEDERA: "hedera",
  HASHPACK: "hashpack",
  ADMIN: "admin",
});

module.exports = {
  TOKEN_TRANSACTION_TYPES,
  TOKEN_TRANSACTION_STATUS,
  PAYMENT_METHODS,
};
