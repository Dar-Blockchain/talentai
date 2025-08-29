# TalentAI Backend

This project is the backend for TalentAI, a talent and skills management platform leveraging **Hedera Hashgraph** for decentralization and security.

## 🚀 Features

- User profile management
- Company profile management
- Technical skills (hard skills) management
- Behavioral skills (soft skills) management
- Search and matching system
- Decentralized matching via **Hedera Consensus Service (HCS)**
- Token-based auction system (HIP-991)
- Event logging on HCS-10

## 📋 Prerequisites

- Node.js (version 14 or higher)
- MongoDB
- npm or yarn
- Hedera account (testnet/mainnet)
- Hedera API keys (`HEDERA_ACCOUNT_ID`, `HEDERA_PRIVATE_KEY`)

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Dar-Blockchain/talentai
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/talentai
   JWT_SECRET=your_jwt_secret
   HEDERA_ACCOUNT_ID=0.0.1234
   HEDERA_PRIVATE_KEY=302e...
   HEDERA_NETWORK=testnet
   TALENTAI_TOKEN_ID=0.0.5678
   ```

4. Start the server:
   ```bash
   npm start
   ```

## 🖥️ Frontend Setup

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend  # Assuming frontend is in a sibling directory
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (create `.env` file):
   ```env
   REACT_APP_API_URL=http://localhost:3000  # Backend API URL
   REACT_APP_HEDERA_NETWORK=testnet
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## 🚀 Deployment

### Backend (Production)
1. Build the project:
   ```bash
   npm run build
   ```

2. Use PM2 for process management:
   ```bash
   pm2 start server.js --name talentai-backend
   ```

### Frontend (Production)
1. Build the React app:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to:
   - **Vercel**: Drag-and-drop the folder
   - **Netlify**: Link your GitHub repository
   - **Static Hosting**: Upload to AWS S3/Cloudflare Pages

3. Configure environment variables in your hosting provider matching your `.env` file.

## 📚 Project Structure

```
Backend/
├── controllers/     # Contrôleurs pour gérer les requêtes HTTP
├── models/          # Modèles Mongoose
├── routes/          # Routes API
├── services/        # Logique métier
├── middleware/      # Middleware personnalisés
├── config/          # Configuration
└── utils/           # Utilitaires
```

## 🔌 API Endpoints

### Profiles

#### User Profiles
- `POST /api/profiles` - Create or update a user profile
- `GET /api/profiles/me` - Get your own profile
- `GET /api/profiles/:userId` - Get a profile by ID
- `GET /api/profiles` - Get all profiles
- `DELETE /api/profiles` - Delete your profile

#### Company Profiles
- `POST /api/profiles/company` - Create or update a company profile
- `GET /api/profiles/company/:companyId` - Get a company profile

### Skills

#### Soft Skills
- `POST /api/profiles/soft-skills` - Add soft skills
- `GET /api/profiles/soft-skills` - Get your soft skills
- `PUT /api/profiles/soft-skills` - Update soft skills
- `DELETE /api/profiles/soft-skills` - Remove soft skills

#### Hard Skills
- `POST /api/profiles/skills` - Add technical skills
- `GET /api/profiles/skills` - Get your technical skills
- `PUT /api/profiles/skills` - Update technical skills
- `DELETE /api/profiles/skills` - Remove technical skills

### Search
- `GET /api/profiles/search?skills=skill1` - Decentralized search

### Auctions
- `POST /api/bids` - Submit a bid (HCS-10)
- `GET /api/bids/:postId` - View active bids

## 🔒 Security

- **JWT** for authentication
- **Hedera private keys** securely stored
- **HCS messages** encrypted and immutable

## 🛠 Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Bcrypt
- Hedera SDK (`@hashgraph/sdk`)
- Hedera Agent Kit (HIP-991)
- HCS-10 for consensus

## 🌐 Hedera Integration

### Hedera SDK
Used for core Hedera interactions:
- **Client Initialization**  
  ```javascript
  const { Client, PrivateKey } = require('@hashgraph/sdk');
  const client = Client.forName(NETWORK).setOperator(OP_ID, OP_KEY);
  ```
  [View Code](postMatchingAgenda.js#L5-L7)

- **Token Transfers**  
  Handles refunds and rewards:
  ```javascript
  await mainAgentKit.airdropToken(process.env.TALENTAI_TOKEN_ID, recipients);
  ```
  [View Code](postMatchingAgenda.js#L240-L242)

### HIP-991 (Hedera Agent Kit)
Simplifies agent and HCS topic management:
- **Agent Creation**  
  ```javascript
  const postAgentKit = new HederaAgentKit(accountId, privKey, pubKey, NETWORK);
  ```
  [View Code](postMatchingAgenda.js#L8-L9)

- **Topic Creation**  
  ```javascript
  const topic = await postAgentKit.createTopic(`Auction-${postId}`, false);
  ```
  [View Code](postMatchingAgenda.js#L40-L42)

### HCS-10 (Hedera Consensus Service)
For decentralized event logging:
- **Message Submission**  
  ```javascript
  await postAgentKit.submitTopicMessage(topicId, JSON.stringify(msg));
  ```
  [View Code](postMatchingAgenda.js#L150-L152)

- **Message Structure**  
  Example for a new bid:
  ```javascript
  const msg = { 
    type: 'new.bid', 
    postId, 
    bidId: bid._id 
  };
  ```
  [View Code](postMatchingAgenda.js#L140-L146)

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add Hedera feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT. See `LICENSE` for details. 