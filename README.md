# VeriAI - AI Content Verification on Flare Network

<div align="center">
  <img src="https://img.shields.io/badge/Blockchain-Flare-orange" alt="Flare Network" />
  <img src="https://img.shields.io/badge/AI-Verification-blue" alt="AI Verification" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-18+-green" alt="Node.js" />
</div>

## 🚀 Overview

VeriAI is a decentralized platform that provides verifiable AI content generation and authentication using the Flare Network's Data Connector (FDC) infrastructure. The platform enables users to generate AI content, verify its authenticity, and mint NFTs representing verified AI outputs.

### Key Features

- **🤖 AI Content Generation**: Support for multiple AI models (GPT-4, Gemini, Claude)
- **🔐 Blockchain Verification**: Cryptographic proof of AI-generated content using Flare FDC
- **🎨 NFT Minting**: Convert verified AI outputs into tradeable NFTs
- **📊 Analytics Dashboard**: Comprehensive statistics and user insights
- **🌐 Web3 Integration**: Seamless wallet connection and blockchain interaction
- **⚡ Real-time Updates**: Live status tracking for generation and verification processes

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Frontend     │◄──►│     Backend     │◄──►│  Smart Contracts│
│   (Next.js)     │    │   (Express)     │    │    (Solidity)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Wallet   │    │   MongoDB       │    │ Flare Network   │
│  (RainbowKit)   │    │   Database      │    │      FDC        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 Project Structure

```
VeriAI/
├── frontend/           # Next.js 15 frontend application
│   ├── app/           # App router pages
│   ├── components/    # Reusable UI components
│   ├── lib/           # Utilities, hooks, and configurations
│   └── public/        # Static assets
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   └── dist/          # Compiled JavaScript
├── contracts/         # Solidity smart contracts
│   ├── contracts/     # Contract source files
│   ├── scripts/       # Deployment scripts
│   ├── test/          # Contract tests
│   └── typechain-types/ # Generated TypeScript types
└── resources/         # Documentation and specifications
```

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Web3**: wagmi v2 + RainbowKit for wallet integration
- **State Management**: React hooks and context
- **Type Safety**: TypeScript with strict configuration

### Backend

- **Runtime**: Node.js 18+ with Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: OpenAI GPT, Google Gemini APIs
- **Blockchain**: Ethers.js for smart contract interaction
- **Authentication**: Wallet-based authentication
- **Rate Limiting**: In-memory rate limiter

### Smart Contracts

- **Language**: Solidity ^0.8.19
- **Framework**: Hardhat with TypeScript
- **Network**: Flare Coston2 Testnet
- **Standards**: ERC-721 for NFTs, ERC-165 for interfaces
- **Testing**: Comprehensive test suite with Chai

### Infrastructure

- **Blockchain**: Flare Network with FDC integration
- **Database**: MongoDB Atlas (cloud)
- **Deployment**: Render (backend), Vercel (frontend)
- **Version Control**: Git with conventional commits

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask or compatible Web3 wallet
- MongoDB Atlas account (or local MongoDB)

### 1. Clone the Repository

```bash
git clone https://github.com/TheSoftNode/VeriAi.git
cd VeriAI
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
# Required: MONGODB_URI, GEMINI_API_KEY, OPENAI_API_KEY, PRIVATE_KEY
nano .env

# Start development server
npm run dev
```

The backend will be available at `http://localhost:3001`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Edit .env.local with your configuration
# Required: NEXT_PUBLIC_API_URL, contract addresses
nano .env.local

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Smart Contracts Setup

```bash
cd contracts

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env with your configuration
nano .env

# Compile contracts
npx hardhat compile

# Deploy to Coston2 testnet
npx hardhat run scripts/deploy.ts --network coston2
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/veriai

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key

# Blockchain
PRIVATE_KEY=your_private_key
RPC_URL=https://coston2-api.flare.network/ext/bc/C/rpc
VERI_AI_CONTRACT_ADDRESS=deployed_contract_address
VERI_AI_NFT_CONTRACT_ADDRESS=deployed_nft_contract_address
FDC_RELAYER_CONTRACT_ADDRESS=deployed_fdc_contract_address

# Security
CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env.local)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Smart Contracts
NEXT_PUBLIC_VERI_AI_CONTRACT_ADDRESS=deployed_contract_address
NEXT_PUBLIC_VERI_AI_NFT_CONTRACT_ADDRESS=deployed_nft_contract_address
NEXT_PUBLIC_FDC_RELAYER_CONTRACT_ADDRESS=deployed_fdc_contract_address

# Network
NEXT_PUBLIC_CHAIN_ID=114
```

#### Contracts (.env)

```bash
# Deployment
PRIVATE_KEY=your_deployment_private_key
COSTON2_RPC_URL=https://coston2-api.flare.network/ext/bc/C/rpc

# Contract Configuration
TREASURY_ADDRESS=your_treasury_address
FDC_HUB_ADDRESS=0x1c78A073E3BD2aCa4cc327d55FB0cD4f0549B55b
```

## 📡 API Documentation

### Core Endpoints

#### AI Generation

```bash
POST /api/v1/ai/generate
GET /api/v1/ai/generation/:requestId
GET /api/v1/ai/models
POST /api/v1/ai/validate
```

#### Verification

```bash
POST /api/v1/verification/request
GET /api/v1/verification/:requestId
GET /api/v1/verification/user/:address
GET /api/v1/verification/stats
```

#### NFT Operations

```bash
POST /api/v1/nft/mint
GET /api/v1/nft/:tokenId
GET /api/v1/nft/user/:userAddress
GET /api/v1/nft/stats
```

#### User Management

```bash
GET /api/v1/user/:userAddress/generations
GET /api/v1/user/:userAddress/verifications
GET /api/v1/user/:userAddress/nfts
GET /api/v1/user/:userAddress/stats
```

### Example Usage

```javascript
// Generate AI content
const response = await fetch("/api/v1/ai/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Write a short story about AI",
    model: "gpt-4",
    userAddress: "0x742d35Cc6327C0532B44F8e2f51Bd773C10F90E0",
  }),
});

// Request verification
const verifyResponse = await fetch("/api/v1/verification/request", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Write a short story about AI",
    output: "Generated story content...",
    model: "gpt-4",
    userAddress: "0x742d35Cc6327C0532B44F8e2f51Bd773C10F90E0",
  }),
});
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
npm run test:watch
```

### Frontend Tests

```bash
cd frontend
npm test
npm run test:e2e
```

### Smart Contract Tests

```bash
cd contracts
npx hardhat test
npx hardhat coverage
```

## 🚀 Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`

### Frontend (Vercel)

1. Connect repository to Vercel
2. Set framework preset to Next.js
3. Add environment variables from `.env.example`
4. Deploy automatically on git push

### Smart Contracts (Coston2)

```bash
cd contracts
npx hardhat run scripts/deploy.ts --network coston2
npx hardhat verify --network coston2 <contract_address> <constructor_args>
```

## 🔐 Security

### Smart Contract Security

- OpenZeppelin battle-tested contracts
- Comprehensive test coverage (>90%)
- Access control with role-based permissions
- Reentrancy protection
- Safe math operations

### Backend Security

- Input validation with express-validator
- Rate limiting to prevent abuse
- CORS configuration
- Helmet.js for security headers
- Environment variable protection

### Frontend Security

- Type-safe API calls
- Wallet signature verification
- Secure environment variable handling
- Content Security Policy (CSP)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- TypeScript strict mode
- ESLint + Prettier configuration
- Conventional commit messages
- Comprehensive test coverage
- Documentation for public APIs

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Flare Network** for the FDC infrastructure
- **OpenZeppelin** for secure smart contract templates
- **OpenAI & Google** for AI model APIs
- **Next.js & Vercel** for the frontend framework and hosting
- **MongoDB** for database services

## 📞 Support

- **Documentation**: [docs.veriai.app](https://docs.veriai.app)
- **Issues**: [GitHub Issues](https://github.com/TheSoftNode/VeriAi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/TheSoftNode/VeriAi/discussions)
- **Email**: support@veriai.app

## 🗺️ Roadmap

### Phase 1 (Current) - MVP

- ✅ AI content generation
- ✅ Blockchain verification
- ✅ NFT minting
- ✅ Basic analytics

### Phase 2 - Enhanced Features

- 🔄 Challenge system for disputed content
- 🔄 Advanced AI model integration
- 🔄 Marketplace for verified AI content
- 🔄 Mobile application

### Phase 3 - Enterprise

- 📋 API for enterprise clients
- 📋 Custom AI model training
- 📋 Advanced analytics and reporting
- 📋 Multi-chain support

---

<div align="center">
  <p>Built with ❤️ by the VeriAI Team</p>
  <p>Powered by Flare Network 🔥</p>
</div>
