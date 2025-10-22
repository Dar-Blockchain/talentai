# HashConnect Integration Setup Guide

## Overview
This guide explains how to set up and test the HashPack wallet integration using HashConnect for the TalentAI token purchase system.

## Prerequisites

1. **HashPack Browser Extension**: Install the HashPack wallet extension from [https://www.hashpack.app/](https://www.hashpack.app/)
2. **WalletConnect Project ID**: Get a project ID from [https://cloud.walletconnect.com/](https://cloud.walletconnect.com/)

## Setup Instructions

### 1. Configure WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Create a new project
3. Copy your Project ID
4. Update `.env.local`:

```env
# Replace 'your_project_id_here' with your actual Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
```

### 2. Environment Configuration

The following environment variables are configured in `.env.local`:

```env
# WalletConnect Configuration for HashConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# HashConnect Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_TARGET_ACCOUNT_ID=0.0.1378
```

- `NEXT_PUBLIC_HEDERA_NETWORK`: Set to `testnet` for testing or `mainnet` for production
- `NEXT_PUBLIC_TARGET_ACCOUNT_ID`: The account that will receive HBAR payments (currently set to 0.0.1378)

## How to Test

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Navigate to Token Purchase

1. Go to the company dashboard: `http://localhost:3000/dashboard/company/`
2. Find the Token Balance card
3. Click the "Buy" button to open the Payment Gateway modal

### 3. Test HashPack Connection

1. In the Payment Gateway modal, select a token package
2. Choose "HashPack Wallet" as the payment method
3. Click "Connect HashPack"

**Expected Behaviors:**

- **With HashPack Extension**: A HashConnect pairing modal should appear
- **Without HashPack Extension**: Warning message about HashPack not being detected
- **Without Project ID**: Error message about WalletConnect Project ID not configured

### 4. Complete Transaction Flow

1. **Connect Wallet**: Accept the pairing in HashPack extension
2. **Review Transaction**: Check the transaction details
3. **Send Payment**: Confirm the HBAR transfer in HashPack
4. **Complete**: Receive confirmation and tokens

## Features Implemented

### HashConnect Service (`src/services/hashConnectService.ts`)

- ✅ HashConnect v3 initialization
- ✅ WalletConnect integration
- ✅ Event handling (pairing, disconnection, connection status)
- ✅ Wallet connection/disconnection
- ✅ HBAR transaction sending
- ✅ Account balance checking (mock implementation)
- ✅ Error handling and logging

### WalletConnect Component (`src/components/dashboard-company/WalletConnect.tsx`)

- ✅ Real HashConnect integration (replaced mock implementation)
- ✅ Proper wallet detection
- ✅ Connection status management
- ✅ Transaction flow with real HBAR sending
- ✅ Enhanced error handling and user feedback
- ✅ Responsive UI with loading states

## Architecture

```
PaymentGateway Component
    ↓
WalletConnect Component
    ↓
HashConnect Service
    ↓
HashConnect Library
    ↓
HashPack Wallet Extension
```

## Important Notes

### Security Considerations

1. **Testnet vs Mainnet**: Currently configured for testnet. Change `NEXT_PUBLIC_HEDERA_NETWORK` to `mainnet` for production
2. **Environment Variables**: Keep your WalletConnect Project ID secure
3. **Transaction Validation**: Always validate transactions before sending

### Limitations

1. **Account Balance**: Currently using mock balance. Implement real balance checking with Hedera SDK for production
2. **Transaction Fees**: Not calculated in current implementation
3. **Network Switching**: Wallet must be on the correct network (testnet/mainnet)

### Troubleshooting

#### "HashPack wallet not detected"
- Install HashPack browser extension
- Ensure WalletConnect Project ID is configured
- Check browser console for initialization errors

#### "WalletConnect Project ID not configured"
- Obtain Project ID from WalletConnect Cloud
- Update `.env.local` with correct Project ID
- Restart development server

#### Connection Timeout
- Check internet connection
- Verify HashPack extension is enabled
- Try refreshing the page

## Migration Path (Future)

HashConnect is deprecated and will be shut down by 2026. Future migration should consider:

1. **Direct WalletConnect Integration**: Using official WalletConnect SDK
2. **Hedera Wallet Connect**: Official Hedera wallet integration
3. **Multi-Wallet Support**: Supporting multiple wallet providers

## Testing Checklist

- [ ] HashPack extension installed
- [ ] WalletConnect Project ID configured
- [ ] Development server running
- [ ] Payment Gateway modal opens
- [ ] HashConnect pairing modal appears
- [ ] Wallet connection successful
- [ ] Transaction details displayed correctly
- [ ] HBAR transaction sent successfully
- [ ] Token purchase completes
- [ ] Error handling works for edge cases

## Support

For issues with:
- **HashConnect**: Check [HashConnect GitHub](https://github.com/Hashpack/hashconnect)
- **HashPack Wallet**: Visit [HashPack Support](https://www.hashpack.app/)
- **WalletConnect**: Check [WalletConnect Docs](https://docs.walletconnect.com/)