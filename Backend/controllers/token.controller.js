const tokenService = require("../services/token.service");
const hederaMirrorNodeService = require("../services/hederaMirrorNode.service");
const User = require("../models/User.model");

// Get user's token balance (fetched from Hedera Mirror Node in real-time)
module.exports.getBalance = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's Hedera account ID
    const user = await User.findById(userId);

    if (!user || !user.hederaAccountId) {
      console.log(`⚠️  User ${userId} has no Hedera account`);
      return res.status(200).json({
        balance: 0,
        hederaAccountId: null,
        source: "no_hedera_account",
        message: "User has no Hedera account. Balance is 0.",
      });
    }

    console.log(
      `🔍 Fetching real-time TAI balance for user ${userId}, Hedera account: ${user.hederaAccountId}`,
    );

    // Fetch real-time balance from Hedera Mirror Node
    const mirrorNodeResult = await hederaMirrorNodeService.getAccountTaiBalance(
      user.hederaAccountId,
    );

    res.status(200).json({
      balance: mirrorNodeResult.balance,
      hederaAccountId: user.hederaAccountId,
      decimals: mirrorNodeResult.decimals,
      tokenId: mirrorNodeResult.tokenId,
      found: mirrorNodeResult.found,
      source: "hedera_mirror_node",
      freezeStatus: mirrorNodeResult.freezeStatus,
      kycStatus: mirrorNodeResult.kycStatus,
      lastUpdated: new Date().toISOString(),
      message: "Token balance retrieved successfully from Hedera Mirror Node",
    });
  } catch (error) {
    console.error("Error getting token balance:", error);

    // Fallback to database balance if Mirror Node fails
    try {
      console.log(
        "⚠️  Mirror Node failed, falling back to database balance...",
      );
      const userId = req.user._id;
      const result = await tokenService.getUserBalance(userId);

      res.status(200).json({
        balance: result.balance,
        lastUpdated: result.lastUpdated,
        source: "database_fallback",
        message:
          "Token balance retrieved from database (Mirror Node unavailable)",
        error: error.message,
      });
    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError);
      res.status(500).json({
        message: "Failed to get token balance",
        error: error.message,
      });
    }
  }
};

// Purchase tokens
module.exports.purchaseTokens = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, paymentMethod, walletAddress } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!paymentMethod || !["hedera", "hashpack"].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method" });
    }

    const result = await tokenService.initiatePurchase(userId, {
      amount,
      paymentMethod,
      walletAddress,
    });

    res.status(200).json({
      message: "Purchase initiated successfully",
      transaction: result.transaction,
      paymentDetails: result.paymentDetails,
    });
  } catch (error) {
    console.error("Error purchasing tokens:", error);
    res.status(500).json({
      message: "Failed to initiate token purchase",
      error: error.message,
    });
  }
};

// Verify payment and update balance
module.exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { transactionHash } = req.body;

    if (!transactionHash) {
      return res.status(400).json({ message: "Transaction hash is required" });
    }

    const result = await tokenService.verifyPayment(userId, transactionHash);

    if (result.verified) {
      res.status(200).json({
        message: "Payment verified successfully",
        verified: true,
        newBalance: result.newBalance,
        transactionHash,
      });
    } else {
      res.status(400).json({
        message: "Payment verification failed",
        verified: false,
        reason: result.reason,
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      message: "Failed to verify payment",
      error: error.message,
    });
  }
};

// Get user's transaction history
module.exports.getTransactions = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 50 } = req.query;

    const result = await tokenService.getUserTransactions(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.status(200).json({
      transactions: result.transactions,
      totalCount: result.totalCount,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      message: "Transactions retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting transactions:", error);
    res.status(500).json({
      message: "Failed to get transactions",
      error: error.message,
    });
  }
};

// Spend tokens for services
module.exports.spendTokens = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount, service, description, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!service) {
      return res.status(400).json({ message: "Service is required" });
    }

    const result = await tokenService.spendTokens(userId, {
      amount,
      service,
      description,
      metadata,
    });

    res.status(200).json({
      message: "Tokens spent successfully",
      transaction: result.transaction,
      newBalance: result.newBalance,
    });
  } catch (error) {
    console.error("Error spending tokens:", error);
    if (error.message === "Insufficient token balance") {
      res.status(400).json({
        message: "Insufficient token balance",
        error: error.message,
      });
    } else {
      res.status(500).json({
        message: "Failed to spend tokens",
        error: error.message,
      });
    }
  }
};

// Get available token packages
module.exports.getTokenPackages = async (req, res) => {
  try {
    const packages = await tokenService.getTokenPackages();

    res.status(200).json({
      packages,
      message: "Token packages retrieved successfully",
    });
  } catch (error) {
    console.error("Error getting token packages:", error);
    res.status(500).json({
      message: "Failed to get token packages",
      error: error.message,
    });
  }
};
