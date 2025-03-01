import { useState } from 'react';
import { ProductCard } from './ProductCard';
import { VerificationRequirement } from '../../utils/coinbaseAttestation';

// Example products - In a real app, these would come from your backend
const EXAMPLE_PRODUCTS = [
  {
    id: '1',
    name: 'Digital Art Collection #1',
    description: 'A unique collection of digital art pieces. No verification required.',
    price: '0.5',
    image: 'https://picsum.photos/400/300',
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'US',
    verificationRequired: VerificationRequirement.NONE
  },
  {
    id: '2',
    name: 'NFT Character - US Only',
    description: 'Limited edition game character NFT. Available only in the US region.',
    price: '0.8',
    image: 'https://picsum.photos/400/301',
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'US',
    verificationRequired: VerificationRequirement.REGION
  },
  {
    id: '3',
    name: 'Premium Trading Card - Verified Traders',
    description: 'Exclusive trading card. Requires Coinbase trading verification.',
    price: '1.2',
    image: 'https://picsum.photos/400/302',
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: '',
    verificationRequired: VerificationRequirement.TRADING
  },
  {
    id: '4',
    name: 'Exclusive EU Collection',
    description: 'Premium collection for verified EU traders only.',
    price: '2.0',
    image: 'https://picsum.photos/400/303',
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'EU',
    verificationRequired: VerificationRequirement.BOTH
  },
  {
    id: '5',
    name: 'Canadian Crypto Art',
    description: 'Exclusive digital art collection for Canadian residents.',
    price: '1.5',
    image: 'https://picsum.photos/400/304',
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'CA',
    verificationRequired: VerificationRequirement.REGION
  }
];

export function ProductList() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Products</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {EXAMPLE_PRODUCTS.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
} 