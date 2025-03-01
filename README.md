# OnchainKit Store

A Next.js e-commerce application built with OnchainKit, featuring Coinbase Commerce integration and Base attestation verification.

## Features

- Faciitates flash sales by targeting verified Canadian users through Base attestations
- Gates products based on verifications for trading and region
- Successfullly implement payment processing through Coinbase Commerce and payout through Coinbase Wallet
- Coinbase Commerce integration
- Base attestation verification
- Wallet connection
- Test mode for development

https://base.easscan.org/attestation/view/0xd323f38fc39e6dfc9e9a01f05e544f3829c5c1c01fb6273353ea59c682e00a7d

https://base.easscan.org/attestation/view/0xa76f5d6269e956f535eb3c295889075a08c740dfc54ee7378390cff58e0a9a26



## Technologies & SDKs

### OnchainKit Integration
- **@coinbase/onchainkit**: Comprehensive SDK for building onchain applications
- Features used:
  - Identity components for ENS/Base name resolution
  - Wallet connection components
  - Frame components for social integration
  - Transaction handling utilities

### Base Network Integration
- **Base Attestation Service**:
  - Uses `@ethereum-attestation-service/eas-sdk` for attestation verification
  - Verifies user region and trading access attestations
  - Implements schema-based attestation validation
  - Handles attestation UIDs and data decoding

### Coinbase Commerce
- **Coinbase Commerce API Integration**:
  - Direct API integration for payment processing
  - Handles both NFT and physical product sales
  - Supports test mode for development
  - Implements webhook handling for order status updates
  - Manages charge creation and verification

### Web3 Integration
- **wagmi**: Ethereum hooks library
  - Wallet connection management
  - Chain management
  - Transaction handling
- **viem**: Low-level Ethereum interaction
  - Contract interactions
  - RPC provider management
  - Transaction building

### Frontend Framework
- **Next.js 14**
  - App Router for routing
  - Server Components for improved performance
  - API Routes for backend functionality
- **React 18**
  - Hooks for state management
  - Context for global state
  - Server and Client Components

### UI Components
- **@headlessui/react**: Accessible UI components
- **@heroicons/react**: Icon set
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **TypeScript**: Type safety and developer experience
- **ESLint**: Code quality and consistency
- **PostCSS**: CSS processing

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Coinbase Commerce API
NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY=your_api_key_here

# Base Network RPC URL (for attestations)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

## Base Attestation Integration

The project uses Base Attestations for user verification:

1. **Region Attestation**:
   - Schema: `0xa76f5d6269e956f535eb3c295889075a08c740dfc54ee7378390cff58e0a9a26`
   - Verifies user's region eligibility
   - Decodes region data from attestation

2. **Trading Access**:
   - Verifies user's trading permissions
   - Handles multiple attestation types
   - Implements proper error handling

## Coinbase Commerce Integration

Payment processing is handled through Coinbase Commerce:

1. **Test Mode**:
   - NFT items: $0.01 USD each
   - Physical items: $0.10 USD each
   - Simplified testing flow

2. **Production Mode**:
   - Full price implementation
   - Secure payment processing
   - Order tracking and fulfillment

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

## Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## Testing

Use test mode for development:
- NFT items: $0.01 USD each
- Physical items: $0.10 USD each

## Production

Regular pricing applies in production mode.

## Architecture

The project follows a modular architecture:

```
app/
├── components/         # React components
│   ├── cart/          # Cart-related components
│   ├── product/       # Product-related components
│   └── checkout/      # Checkout components
├── utils/             # Utility functions
│   ├── coinbase.ts    # Coinbase Commerce integration
│   └── attestation.ts # Base attestation handling
├── hooks/             # Custom React hooks
└── types/             # TypeScript type definitions
```
