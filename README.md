# TalentAI - AI-Powered Talent Matching Platform

TalentAI is an innovative talent matching platform that leverages artificial intelligence and blockchain technology (Hedera) to connect companies with skilled professionals. The platform uses advanced AI algorithms for skill matching and Hedera's secure infrastructure for credential verification and smart contracts.

## 🚀 Features

- AI-powered job post generation
- Smart skill matching algorithm
- Blockchain-verified credentials using Hedera
- Real-time candidate matching
- LinkedIn-ready job post formatting
- Company profile management
- Interactive dashboard

## 🛠 Tech Stack

- **Frontend**: Next.js, React, TypeScript
- **UI Framework**: Material-UI (MUI)
- **State Management**: Redux
- **Blockchain**: Hedera
- **Authentication**: JWT
- **API**: RESTful API
- **Styling**: Styled Components, CSS-in-JS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)
- Git

## 🔧 Installation & Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/talentai-frontend.git
cd talentai-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add the following environment variables:
```env
NEXT_PUBLIC_API_BASE_URL=your_api_url
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_OPERATOR_ID=your_operator_id
NEXT_PUBLIC_HEDERA_OPERATOR_KEY=your_operator_key
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗 Build for Production

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## 🔐 Hedera Integration

Our platform utilizes Hedera's secure and efficient blockchain infrastructure for various features. Here are the key integrations:

### 1. Credential Verification
We use Hedera's HCS (Hedera Consensus Service) to store and verify professional credentials. This ensures that all qualifications and certifications are tamper-proof and easily verifiable.

```typescript
// Example Hedera credential verification code
const verifyCredential = async (credentialId: string) => {
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);

  const transaction = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(credentialId);

  const response = await transaction.execute(client);
  const receipt = await response.getReceipt(client);
  
  return receipt.status === Status.Success;
};
```

### 2. Smart Contracts for Job Agreements
We implement Hedera smart contracts for job offers and agreements, ensuring transparent and secure terms between companies and candidates.

```typescript
// Example Hedera smart contract deployment
const deployJobContract = async (jobDetails: JobContract) => {
  const client = Client.forTestnet();
  client.setOperator(operatorId, operatorKey);

  const contractBytes = await ContractHelper.getBytecode();
  const transaction = new ContractCreateTransaction()
    .setGas(100000)
    .setBytecode(contractBytes)
    .setConstructorParameters(
      new ContractFunctionParameters()
        .addString(jobDetails.title)
        .addUint256(jobDetails.salary)
    );

  const response = await transaction.execute(client);
  const receipt = await response.getReceipt(client);
  
  return receipt.contractId;
};
```

### 3. Token System for Platform Rewards
We utilize Hedera Token Service (HTS) to manage our platform's reward system, incentivizing active participation and successful matches.

## 🔄 CI/CD Pipeline

Our project uses GitHub Actions for continuous integration and deployment. The pipeline includes:

1. Automated testing
2. Code quality checks
3. Build verification
4. Deployment to staging/production

## 📚 Documentation

For detailed documentation about the platform's features and API endpoints, please visit our [documentation site](docs/index.md).

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and queries, please create an issue in the repository or contact our support team at support@talentai.com.

## 🌟 Acknowledgments

- Hedera team for their excellent blockchain infrastructure
- Material-UI team for the comprehensive UI framework
- All contributors who have helped shape this project
