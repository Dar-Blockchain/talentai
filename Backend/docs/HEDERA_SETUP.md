# Hedera Blockchain Resume Verification Setup

This guide will help you set up the Hedera blockchain NFT functionality for resume verification in your CV builder.

## Prerequisites

1. **Hedera Testnet Account**: You need a Hedera testnet account with some HBAR for transactions
2. **Environment Variables**: Configure the required environment variables

## Setup Steps

### 1. Create a Hedera Testnet Account

1. Go to [Hedera Portal](https://portal.hedera.com/)
2. Create a testnet account
3. Note down your Account ID and Private Key
4. Fund your account with testnet HBAR from the [Hedera Faucet](https://portal.hedera.com/faucet)

### 2. Configure Environment Variables

Create a `.env` file in your `Backend` directory with the following variables:

```env
# Hedera Configuration
HEDERA_ACCOUNT_ID=0.0.xxxxx
HEDERA_PRIVATE_KEY=your_hedera_private_key_here
RESUME_TOKEN_ID=0.0.xxxxx

# Other existing environment variables...
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

### 3. Frontend Environment Variables

Add to your frontend `.env.local` file:

```env
NEXT_PUBLIC_HEDERA_ACCOUNT_ID=0.0.xxxxx
NEXT_PUBLIC_HEDERA_PRIVATE_KEY=your_hedera_private_key_here
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**⚠️ Security Note**: In production, never expose private keys in frontend environment variables. The frontend Hedera service is included for completeness but should only be used for read operations.

### 4. How It Works

1. **Resume Creation**: When a user clicks the "Verify" button in the resume builder, the system:
   - Collects the resume data and user information
   - Creates a hash of the resume content
   - Mints an NFT on the Hedera blockchain with metadata containing:
     - User's name and profession
     - Resume hash for integrity verification
     - Verification date
     - Platform information

2. **QR Code Generation**: After NFT creation:
   - A verification URL is generated pointing to the Hedera explorer
   - A QR code is created containing this URL
   - Users can download or share the QR code

3. **Verification**: When someone scans the QR code:
   - They're directed to the Hedera blockchain explorer
   - They can view the NFT metadata to verify the resume's authenticity
   - The blockchain provides immutable proof of when the resume was verified

### 5. API Endpoints

The following endpoints are available:

- `POST /api/resume/create-nft` - Create a new resume NFT
- `GET /api/resume/verify-nft/:nftId` - Verify an existing NFT
- `GET /api/resume/nfts/:resumeId` - Get all NFTs for a resume

### 6. Testing

1. Start your backend server: `npm run dev` (in Backend directory)
2. Start your frontend: `npm run dev` (in root directory)
3. Create a resume in the CV builder
4. Click the "Verify" button to create an NFT
5. Scan the generated QR code to verify on Hedera blockchain

### 7. Production Considerations

1. **Security**: 
   - Never expose private keys in frontend code
   - Use server-side signing for all transactions
   - Implement proper authentication and authorization

2. **Cost Optimization**:
   - Create one token collection and reuse it for all resumes
   - Consider batching operations if creating many NFTs

3. **Error Handling**:
   - Implement retry logic for failed transactions
   - Provide clear error messages to users
   - Log all blockchain interactions for debugging

4. **Scalability**:
   - Consider using Hedera's consensus service for high-volume applications
   - Implement caching for frequently accessed NFT data

### 8. Troubleshooting

**Common Issues:**

1. **"Insufficient account balance"**: Fund your testnet account with HBAR
2. **"Invalid account ID"**: Check your account ID format (should be 0.0.xxxxx)
3. **"Transaction failed"**: Verify your private key and network connectivity

**Useful Links:**

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera SDK for JavaScript](https://github.com/hashgraph/hedera-sdk-js)
- [Hedera Testnet Explorer](https://hashscan.io/testnet)
- [Hedera Portal](https://portal.hedera.com/)

### 9. Features Implemented

✅ **NFT Creation**: Mint resume verification NFTs on Hedera blockchain  
✅ **QR Code Generation**: Generate QR codes for easy verification  
✅ **Enhanced Metadata Storage**: Store resume fingerprint, attributes, and comprehensive user info  
✅ **Multiple Verification URLs**: Custom verification page + Hedera explorer + Mirror Node API  
✅ **Mirror Node Integration**: Real-time verification using Hedera Mirror Node API  
✅ **Cryptographic Fingerprinting**: Enhanced resume hashing with user info and date stamps  
✅ **Professional Verification Page**: Beautiful, comprehensive verification display  
✅ **Error Handling**: Comprehensive error handling and user feedback  
✅ **UI Integration**: Seamless integration with existing CV builder  

### 10. Advanced Features

🔒 **Enhanced Security**:
- Resume fingerprinting combines content + user info + date for uniqueness
- Cryptographic SHA-256 hashing for tamper detection
- Immutable blockchain storage on Hedera network

🌐 **Multiple Verification Methods**:
- Custom verification page with detailed metadata display
- Direct Hedera blockchain explorer links
- Mirror Node API access for developers
- QR codes for mobile-friendly verification

📊 **Rich Metadata**:
- NFT standard-compliant metadata structure
- Verification attributes and traits
- Professional information and credentials
- Platform verification stamps

🎨 **Professional Presentation**:
- Responsive verification page design
- Comprehensive blockchain details display
- Multiple verification proof points
- Professional UI/UX for trust building

### 11. API Enhancements

The system now includes advanced API features:

**Enhanced NFT Creation**:
```javascript
POST /resume/create-nft
// Returns enhanced response with multiple URLs and metadata
{
  "success": true,
  "nftId": "0.0.12345/1",
  "verificationUrl": "https://yourapp.com/verify/0.0.12345/1",
  "verificationUrls": {
    "custom": "https://yourapp.com/verify/0.0.12345/1",
    "hedera": "https://hashscan.io/testnet/token/0.0.12345/1",
    "mirror": "https://testnet.mirrornode.hedera.com/api/v1/tokens/0.0.12345/nfts/1"
  },
  "metadata": { /* Enhanced metadata with attributes */ }
}
```

**Real Verification via Mirror Node**:
```javascript
GET /resume/verify-nft/:nftId
// Returns real blockchain data
{
  "success": true,
  "verified": true,
  "metadata": { /* Decoded NFT metadata */ },
  "nftData": {
    "tokenId": "0.0.12345",
    "serial": "1",
    "accountId": "0.0.98765",
    "createdTimestamp": "1234567890.123456789"
  },
  "explorerUrls": { /* Multiple verification URLs */ }
}
```

### 10. Future Enhancements

- **Resume Templates**: Different NFT designs for different resume templates
- **Batch Verification**: Verify multiple resumes at once
- **Analytics**: Track verification statistics
- **Integration**: Connect with job platforms for automatic verification
- **Mobile App**: Dedicated mobile app for QR code scanning 