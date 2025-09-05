# VeriAI Frontend

A Next.js frontend application for VeriAI - On-Chain AI Content Verification platform built on Flare Network.

## Features

- **AI Content Generation**: Generate AI content with verifiable authenticity
- **Content Verification**: Verify AI-generated content on-chain using Flare's Data Connector
- **NFT Collection**: View and manage verification NFTs earned through the platform
- **Analytics Dashboard**: Monitor verification trends and platform statistics
- **User Dashboard**: Personal verification history and account management
- **Wallet Integration**: Seamless Web3 wallet connection via RainbowKit
- **Real-time Updates**: Live status updates for verification processes

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Web3**: wagmi + RainbowKit for wallet integration
- **Blockchain**: Flare Network (Coston2 Testnet)
- **Animations**: Framer Motion
- **TypeScript**: Full type safety

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── analytics/          # Analytics dashboard
│   ├── collection/         # NFT collection viewer
│   ├── dashboard/          # User dashboard
│   ├── generate/           # AI content generation
│   └── verify/             # Content verification
├── components/
│   ├── features/           # Feature-specific components
│   ├── layout/             # Layout components (header, footer)
│   └── ui/                 # Reusable UI components (shadcn/ui)
├── lib/
│   ├── api/                # API client functions
│   ├── contracts/          # Smart contract interfaces
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
└── public/                 # Static assets
```

## Pages Overview

### 🏠 Home (`/`)

Landing page with hero section, features overview, and how-it-works explanation.

### ✨ Generate (`/generate`)

- Generate AI content using various models (GPT-4, Claude, etc.)
- Real-time generation with progress tracking
- Automatic verification option for generated content
- Generation history and management

### 🛡️ Verify (`/verify`)

- Submit content for AI authenticity verification
- Support for text, files, and URLs
- Real-time verification status updates
- Detailed verification results with confidence scores

### 🖼️ Collection (`/collection`)

- View earned verification NFTs
- Browse verification history
- Search and filter functionality
- NFT metadata and verification details

### 📊 Analytics (`/analytics`)

- Platform-wide verification statistics
- Success rate trends and model usage
- Personal verification analytics (when wallet connected)
- Performance metrics and insights

### 👤 Dashboard (`/dashboard`)

- Personal account overview
- Verification history and statistics
- Recent activity timeline
- Account settings and preferences

## API Integration

The frontend connects to the VeriAI backend API with the following endpoints:

### AI Generation

- `POST /api/v1/ai/generate` - Generate AI content
- `GET /api/v1/ai/generation/:id` - Get generation status
- `GET /api/v1/ai/models` - List available models

### Verification

- `POST /api/v1/verification/request` - Request verification
- `GET /api/v1/verification/:id` - Get verification status
- `GET /api/v1/verification/user/:address` - User verification history

### NFTs

- `GET /api/v1/nft/user/:address` - Get user's NFTs
- `POST /api/v1/nft/mint` - Mint verification NFT

## Smart Contract Integration

### VeriAI Contract

- Request verification for AI content
- Query verification status
- Get user statistics

### VeriAI NFT Contract

- View user's verification NFTs
- Get NFT metadata
- Track collection progress

## Setup Instructions

1. **Clone and Install**

   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**

   ```bash
   cp .env.example .env.local
   ```

   Update the environment variables:

   - `NEXT_PUBLIC_API_URL`: Backend API URL
   - `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`: Your WalletConnect project ID
   - Contract addresses for the deployed smart contracts

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm run start
   ```

## Key Features Implementation

### 🔗 Wallet Integration

- RainbowKit for seamless wallet connection
- Support for MetaMask, WalletConnect, and other popular wallets
- Automatic network switching to Coston2 testnet

### 🎨 UI/UX

- Modern, responsive design with Tailwind CSS
- Dark/light theme support
- Smooth animations with Framer Motion
- Accessible components via shadcn/ui

### 📱 Responsive Design

- Mobile-first approach
- Optimized for desktop, tablet, and mobile
- Touch-friendly interactions

### ⚡ Performance

- Next.js App Router for optimal performance
- Image optimization and lazy loading
- Efficient state management
- Real-time updates with polling

## Development Workflow

### Adding New Pages

1. Create page component in `app/[page-name]/page.tsx`
2. Add navigation links in `components/layout/header.tsx`
3. Update routing and metadata as needed

### Adding New Components

1. UI components go in `components/ui/`
2. Feature components go in `components/features/`
3. Use TypeScript interfaces for props

### API Integration

1. Add API functions in `lib/api/client.ts`
2. Create custom hooks in `lib/hooks/useAPI.ts`
3. Handle loading states and error handling

## Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run build verification
npm run build
```

## Deployment

The frontend can be deployed on:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Custom server with Docker**

### Environment Variables for Production

Ensure all environment variables are properly set:

- API URLs pointing to production backend
- Correct smart contract addresses for mainnet
- Analytics and monitoring keys

## Integration with Backend

The frontend is designed to work seamlessly with the VeriAI backend:

1. **Authentication**: Wallet-based authentication with signature verification
2. **Real-time Updates**: Polling for verification status updates
3. **Error Handling**: Comprehensive error handling with user-friendly messages
4. **Data Sync**: Automatic synchronization of on-chain and off-chain data

## Smart Contract Integration

### Contract Interactions

- Reading verification requests from VeriAI contract
- Monitoring NFT minting events
- Displaying real-time contract state

### Transaction Handling

- Gas estimation and optimization
- Transaction status tracking
- Error handling for failed transactions

## Security Considerations

- **No Private Keys**: All wallet interactions via Web3 providers
- **Input Validation**: Client-side validation for all user inputs
- **XSS Protection**: Proper sanitization of user-generated content
- **HTTPS Only**: All API communications over HTTPS

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new code
3. Test on multiple browsers and devices
4. Update documentation for new features

## Browser Support

- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile**: iOS Safari 14+, Chrome Mobile 88+
- **Web3**: MetaMask-compatible browsers

This frontend provides a complete, production-ready interface for the VeriAI platform, offering users an intuitive way to generate, verify, and manage AI content on the blockchain.
