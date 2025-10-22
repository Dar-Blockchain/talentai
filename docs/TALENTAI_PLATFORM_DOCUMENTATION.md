# TalentAI Platform - Complete Documentation

## 📋 Table of Contents
1. [Platform Overview](#platform-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Core Features](#core-features)
5. [Getting Started](#getting-started)
6. [Project Structure](#project-structure)
7. [Environment Configuration](#environment-configuration)
8. [Deployment](#deployment)

---

## 🎯 Platform Overview

**TalentAI** is an advanced AI-powered talent acquisition and management platform that combines:
- 🤖 **Artificial Intelligence** for intelligent interviews and skill matching
- 🔗 **Blockchain Technology** (Hedera) for secure transactions and credential verification
- 💰 **Token Economy** (TAI Token) for platform payments and rewards
- 🎯 **Smart Matching** algorithms connecting companies with candidates

### Key Value Propositions

**For Companies:**
- AI-generated job posts optimized for LinkedIn
- Automated technical and soft skills evaluation
- Multi-agent HR system for comprehensive candidate assessment
- Blockchain-verified credentials
- TAI token payment system with transparent pricing

**For Candidates:**
- AI-powered resume builder
- Intelligent interview preparation
- Real-time skill assessment
- Blockchain-backed certifications
- Job matching based on skills and preferences

---

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Company    │  │  Candidate   │  │    Admin     │      │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │
                    │  (Express.js)   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼────┐         ┌────▼────┐        ┌────▼────┐
    │   AI    │         │ Hedera  │        │Database │
    │Services │         │Services │        │(MongoDB)│
    └─────────┘         └─────────┘        └─────────┘
         │                   │
    ┌────▼────┐         ┌────▼────────────────┐
    │Together │         │  Hedera Network     │
    │   AI    │         │  ┌──────────────┐   │
    │ OpenAI  │         │  │ HCS Topics   │   │
    └─────────┘         │  │ TAI Token    │   │
                        │  │   NFTs       │   │
                        │  │Agent Kit     │   │
                        │  └──────────────┘   │
                        └─────────────────────┘
```

### Component Architecture

#### **Frontend Layer**
- **Framework**: Next.js 15.3.0 with React 19
- **State Management**: Redux Toolkit with Redux Persist
- **UI Library**: Material-UI (MUI) v7
- **Styling**: Emotion (CSS-in-JS)
- **Blockchain**: HashConnect for HashPack wallet integration

#### **Backend Layer**
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with httpOnly cookies
- **Real-time**: Socket.io for live updates
- **Job Scheduling**: Agenda.js for background tasks

#### **Blockchain Layer**
- **Network**: Hedera Hashgraph (Testnet/Mainnet)
- **SDK**: @hashgraph/sdk v2.65.1
- **Standards**: HCS-10 (messaging), HCS-11 (agent communication)
- **Agent Kit**: Hedera Agent Kit v3.0.5 for AI blockchain operations

#### **AI Layer**
- **Primary**: Together AI (Meta-Llama models)
- **Secondary**: OpenAI GPT-4
- **Features**: Conversational agents, intelligent interviews, evaluation

---

## 🛠️ Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 15.3.0 | React framework with SSR |
| React | 19.1.0 | UI library |
| TypeScript | 5.8.3 | Type safety |
| Redux Toolkit | 2.6.1 | State management |
| Material-UI | 7.2.0 | UI components |
| @hashgraph/sdk | 2.65.1 | Hedera integration |
| HashConnect | 3.0.14 | Wallet connectivity |
| Socket.io-client | 4.8.1 | Real-time communication |
| Axios | 1.8.4 | HTTP client |
| Recharts | 2.15.2 | Data visualization |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime environment |
| Express.js | 4.18.2 | Web framework |
| MongoDB | Latest | Database |
| Mongoose | 8.0.3 | ODM for MongoDB |
| @hashgraph/sdk | 2.63.0 | Hedera operations |
| Hedera Agent Kit | 3.0.5 | AI blockchain integration |
| Together AI | 0.16.0 | LLM provider |
| OpenAI | 4.94.0 | AI services |
| Agenda | 5.0.0 | Job scheduling |
| Socket.io | 4.8.1 | WebSocket server |
| JWT | 9.0.2 | Authentication |
| Nodemailer | 6.9.7 | Email service |
| Redis | 5.1.0 | Caching & sessions |
| Puppeteer | 24.12.1 | PDF generation |

### Blockchain & Web3

| Technology | Purpose |
|------------|---------|
| Hedera Consensus Service (HCS) | Decentralized messaging |
| Hedera Token Service (HTS) | TAI token management |
| Hedera Smart Contracts | Job agreements |
| HCS-10 Standard | Message formatting |
| HCS-11 Standard | Agent communication |
| Hedera Agent Kit | AI-blockchain bridge |

---

## ✨ Core Features

### 1. 🤖 AI-Powered Recruitment

#### Intelligent Interview System
- **Adaptive questioning** based on candidate responses
- **Multi-stage interviews**: Technical, soft skills, managerial
- **Real-time AI evaluation** with scoring
- **Personality assessment** integrated
- **Context-aware** follow-up questions
- **Audio transcription** support with AssemblyAI

#### HR Agent Network
- **Multi-agent system** for comprehensive evaluation
- **Specialized agents**:
  - Yuka (Coordinator) - Overall management
  - Sinda (Soft Skills) - Communication assessment
  - Olga (Technical Skills) - Technical evaluation
- **Agent-to-agent communication** via HCS-11 standard
- **Blockchain-recorded** evaluation process
- **AI-generated** professional feedback

#### Job Post Generation
- **AI-created** job descriptions from simple inputs
- **LinkedIn-optimized** formatting
- **Skills extraction** and categorization
- **Automatic** company culture integration

### 2. 💰 Token Economy (TAI Token)

#### Token Information
- **Token ID**: 0.0.6955317 (Hedera Testnet)
- **Symbol**: TAI
- **Decimals**: 8
- **Total Supply**: 1,000,000,000 TAI
- **Network**: Hedera Token Service (HTS)

#### Pricing Plans
| Plan | Price (USD) | TAI Tokens | Features |
|------|-------------|------------|----------|
| Starter | $199 | 199,000 | Basic recruitment |
| Professional | $299 | 299,000 | Advanced features (Popular) |
| Enterprise | $499 | 499,000 | Full platform access |

#### Payment Features
- **1% platform fee** automatically added
- **HBAR price** real-time conversion (CoinGecko API)
- **HashPack wallet** integration
- **Gas fee distribution** (1% HBAR returned to user)
- **Automatic token distribution** after payment
- **Transaction history** tracking
- **Balance management** in-app

### 3. 🔗 Hedera Blockchain Integration

#### Hedera Consensus Service (HCS)
- **Decentralized messaging** for agent communication
- **Topic management** for each evaluation
- **HCS-10 compliant** message structure
- **Immutable audit trail** of all evaluations
- **Real-time** message streaming

#### Hedera Token Service (HTS)
- **TAI token** creation and management
- **Token association** with user accounts
- **Atomic transfers** via operator account
- **Balance queries** on-chain
- **Gas fee** HBAR transfers

#### Smart Contracts & NFTs
- **Job agreements** as smart contracts
- **Credential verification** NFTs
- **Achievement badges** as NFTs

#### HashConnect Integration
- **HashPack wallet** support
- **WalletConnect v2** protocol
- **Real-time balance** display
- **Transaction signing** flow
- **Multi-account** support

### 4. 👥 User Management

#### User Roles
- **Candidate**: Job seekers, skill assessment
- **Company**: Recruiters, job posting
- **Admin**: Platform management
- **Jury**: Evaluation oversight

#### Authentication
- **JWT tokens** with httpOnly cookies
- **OTP email** verification
- **Google OAuth** integration
- **Session management** with Redis
- **Login history** tracking
- **IP geolocation** logging

#### Profile System
- **Candidate profiles**:
  - Skills (hard & soft)
  - Experience level
  - Overall score
  - Resume management
  - Interview history
- **Company profiles**:
  - Company details
  - Industry & size
  - Required skills
  - Job postings
  - Hedera account auto-creation
  - Token balance

### 5. 📊 Matching & Evaluation

#### Skill Matching Algorithm
- **Multi-factor matching**:
  - Hard skills compatibility
  - Soft skills alignment
  - Experience level
  - Industry fit
- **AI-powered scoring**
- **Bidding system** for top candidates
- **Real-time notifications**

#### Evaluation Pipeline
```
Job Post Created
    ↓
Candidate Applies
    ↓
AI Pre-screening Interview
    ↓
Technical Skills Test (Olga Agent)
    ↓
Soft Skills Assessment (Sinda Agent)
    ↓
Coordinator Review (Yuka Agent)
    ↓
Company Decision
    ↓
Blockchain Certificate (if hired)
```

### 6. 📱 Real-time Features

#### WebSocket Events
- **Interview progress** updates
- **Agent responses** streaming
- **Notification** delivery
- **Candidate status** changes
- **Payment confirmations**

#### Live Components
- **Chat interface** for interviews
- **Real-time scoring** display
- **Progress indicators**
- **Token balance** updates

### 7. 📈 Analytics & Reporting

#### Company Dashboard
- **Recruitment metrics**
- **Candidate pipeline** visualization
- **Agent performance** stats
- **Token usage** tracking
- **Cost analysis**

#### Candidate Dashboard
- **Application status** tracking
- **Interview scores**
- **Skill improvement** suggestions
- **Job matches** display

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20.x or later
- MongoDB 6.x or later
- npm or yarn
- Git
- Hedera testnet account (for development)

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/Dar-Blockchain/talentai
cd talentai
```

#### 2. Install Frontend Dependencies
```bash
npm install
```

#### 3. Install Backend Dependencies
```bash
cd Backend
npm install
cd ..
```

#### 4. Configure Environment Variables

**Frontend (.env.local)**
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Hedera Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_TARGET_ACCOUNT_ID=0.0.1378

# WalletConnect (for HashPack)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

**Backend (.env)**
```env
# Server
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/talentai

# Authentication
JWT_SECRET=your_jwt_secret_here

# Hedera
HEDERA_ACCOUNT_ID=0.0.1378
HEDERA_PRIVATE_KEY=your_private_key_here
HEDERA_NETWORK=testnet

# AI Services
TOGETHER_AI_API_KEY=your_together_ai_key
OPENAI_API_KEY=your_openai_key

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

#### 5. Start Services

**Start MongoDB**
```bash
mongod --dbpath /path/to/data
```

**Start Redis** (optional)
```bash
redis-server
```

**Start Backend**
```bash
cd Backend
npm run dev
```

**Start Frontend**
```bash
npm run dev
```

#### 6. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

---

## 📁 Project Structure

```
talentai/
├── docs/                           # Documentation
│   ├── TALENTAI_PLATFORM_DOCUMENTATION.md
│   ├── BACKEND_API_DOCUMENTATION.md
│   ├── HEDERA_BLOCKCHAIN_INTEGRATION.md
│   ├── AI_FEATURES_DOCUMENTATION.md
│   ├── FRONTEND_ARCHITECTURE.md
│   └── DATABASE_MODELS.md
│
├── Backend/                        # Backend Application
│   ├── controllers/               # Route controllers
│   │   ├── authController.js
│   │   ├── paymentController.js
│   │   ├── hrAgentController.js
│   │   └── ...
│   ├── models/                    # MongoDB models
│   │   ├── UserModel.js
│   │   ├── ProfileModel.js
│   │   ├── PostModel.js
│   │   └── ...
│   ├── routes/                    # API routes
│   ├── services/                  # Business logic
│   │   ├── intelligentInterviewService.js
│   │   ├── tokenService.js
│   │   ├── hederaService.js
│   │   └── ...
│   ├── middleware/                # Express middleware
│   ├── config/                    # Configuration files
│   ├── utils/                     # Utility functions
│   ├── scripts/                   # Utility scripts
│   └── app.js                     # Express app entry
│
├── src/                           # Frontend Application
│   ├── components/               # React components
│   │   ├── dashboard-company/
│   │   ├── dashboard-candidate/
│   │   ├── dashboard-admin/
│   │   └── ...
│   ├── pages/                    # Next.js pages
│   │   ├── dashboard/
│   │   │   ├── company.tsx
│   │   │   ├── candidate.tsx
│   │   │   └── admin.tsx
│   │   ├── signin.tsx
│   │   └── ...
│   ├── store/                    # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── tokenSlice.ts
│   │   │   └── ...
│   │   └── store.ts
│   ├── services/                 # API services
│   │   └── hashConnectService.ts
│   └── constants/                # Constants
│
├── public/                        # Static assets
├── .env.local                     # Frontend environment
├── Backend/.env                   # Backend environment
├── next.config.ts                 # Next.js configuration
├── package.json                   # Frontend dependencies
└── Backend/package.json           # Backend dependencies
```

---

## 🔧 Environment Configuration

### Critical Environment Variables

#### Backend Environment (.env)

**Required for Basic Functionality:**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/talentai
JWT_SECRET=your_super_secret_jwt_key_here
```

**Required for Hedera Integration:**
```env
HEDERA_ACCOUNT_ID=0.0.1378
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_PUBLIC_KEY=302a300506032b6570032100...
HEDERA_NETWORK=testnet
```

**Required for AI Features:**
```env
TOGETHER_AI_API_KEY=your_together_ai_key
OPENAI_API_KEY=sk-your_openai_key
```

**Required for Email:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
```

#### Frontend Environment (.env.local)

```env
# API Base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Hedera Network
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_TARGET_ACCOUNT_ID=0.0.1378

# WalletConnect Project ID (from cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

---

## 🚢 Deployment

### Production Checklist

#### Backend Deployment
- [ ] Set `NODE_ENV=production`
- [ ] Use production MongoDB URI
- [ ] Change `HEDERA_NETWORK=mainnet`
- [ ] Secure JWT_SECRET (32+ characters)
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Enable rate limiting
- [ ] Configure logging (PM2, Winston)
- [ ] Set up monitoring (Datadog, New Relic)

#### Frontend Deployment
- [ ] Update API base URL
- [ ] Build optimized production bundle
- [ ] Configure CDN for static assets
- [ ] Set up domain and SSL
- [ ] Enable caching headers
- [ ] Configure analytics

#### Hedera Mainnet Migration
- [ ] Obtain mainnet account and keys
- [ ] Update environment to mainnet
- [ ] Create mainnet TAI token
- [ ] Update token ID in code
- [ ] Test all Hedera operations
- [ ] Monitor transaction costs

### Deployment Options

#### Option 1: AWS Elastic Beanstalk
```bash
# Backend
cd Backend
eb init
eb create production
eb deploy

# Frontend (via Vercel)
vercel --prod
```

#### Option 2: Docker Containers
```bash
# Build images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

#### Option 3: Kubernetes (EKS)
- Use provided YAML configurations in root
- Configure load balancer
- Set up auto-scaling

---

## 📚 Additional Documentation

For detailed information on specific subsystems:

1. **[Backend API Documentation](./BACKEND_API_DOCUMENTATION.md)** - Complete API reference
2. **[Hedera Blockchain Integration](./HEDERA_BLOCKCHAIN_INTEGRATION.md)** - Blockchain features
3. **[AI Features Documentation](./AI_FEATURES_DOCUMENTATION.md)** - AI system details
4. **[Frontend Architecture](./FRONTEND_ARCHITECTURE.md)** - Frontend structure
5. **[Database Models](./DATABASE_MODELS.md)** - Data schemas

---

## 🤝 Contributing

We welcome contributions! Please see CONTRIBUTING.md for guidelines.

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🆘 Support

For support:
- **GitHub Issues**: Report bugs and feature requests
- **Email**: support@talentai.bid
- **Documentation**: Check all docs in /docs folder

---

## 🌟 Acknowledgments

- Hedera Hashgraph for blockchain infrastructure
- Together AI and OpenAI for AI services
- Material-UI team for UI components
- Next.js and React teams
- All contributors to this project

---

**Last Updated**: October 2025
**Version**: 1.0.0
**Status**: Production Ready
