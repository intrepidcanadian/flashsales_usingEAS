# OnchainKit Store

A Next.js e-commerce application built with OnchainKit, featuring Coinbase Commerce integration and Base attestation verification.

## Features

- NFT and physical product sales
- Coinbase Commerce integration
- Base attestation verification
- Wallet connection
- Test mode for development
- Order tracking

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
# Coinbase Commerce API
NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY=your_api_key_here

# Base Network RPC URL (for attestations)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

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
