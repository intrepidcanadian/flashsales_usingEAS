import { CartItem } from '../components/cart/CartContext';
import { VerificationRequirement } from '../utils/coinbaseAttestation';

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  type: 'physical' | 'nft';
  categoryId: string;
  tags: string[];
  contractAddress?: string;
  tokenId?: string;
  rating: number;
  numReviews: number;
  reviews: Review[];
  sellerAddress: string;
  region: string;
  verificationRequired: VerificationRequirement;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Limited Edition NFT',
    description: 'A unique digital collectible. Requires US region verification and trading access verification.',
    price: 0.1,
    type: 'nft',
    categoryId: 'nfts',
    tags: ['art', 'digital', 'collectible', 'US', 'trading'],
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '1',
    rating: 4.5,
    numReviews: 12,
    reviews: [
      {
        id: '1',
        userId: 'user1',
        userName: 'John Doe',
        rating: 5,
        comment: 'Amazing artwork!',
        createdAt: '2024-03-01T12:00:00Z',
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Jane Smith',
        rating: 4,
        comment: 'Great collectible, unique design',
        createdAt: '2024-03-02T14:30:00Z',
      },
    ],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'US',
    verificationRequired: VerificationRequirement.BOTH,
    image: 'https://picsum.photos/400/300'
  },
  {
    id: '2',
    name: 'Exclusive T-Shirt',
    description: 'Limited edition merchandise. Available worldwide, no verification required.',
    price: 29.99,
    type: 'physical',
    categoryId: 'merch',
    tags: ['clothing', 'apparel', 'fashion', 'worldwide'],
    rating: 4.8,
    numReviews: 45,
    reviews: [
      {
        id: '3',
        userId: 'user3',
        userName: 'Mike Johnson',
        rating: 5,
        comment: 'Perfect fit and great quality!',
        createdAt: '2024-03-03T09:15:00Z',
      },
    ],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: '',
    verificationRequired: VerificationRequirement.NONE,
    image: 'https://picsum.photos/400/301'
  },
  {
    id: '3',
    name: 'Collector NFT',
    description: 'Rare collectible NFT from popular series. Available only to verified EU residents.',
    price: 0.05,
    image: 'https://picsum.photos/400/302',
    type: 'nft',
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '2',
    categoryId: '1',
    tags: ['collectible', 'rare', 'series', 'EU'],
    rating: 4.2,
    numReviews: 8,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'EU',
    verificationRequired: VerificationRequirement.REGION
  },
  {
    id: '4',
    name: 'Digital Game Asset',
    description: 'Powerful in-game item with unique properties. Requires trading verification.',
    price: 0.02,
    image: 'https://picsum.photos/400/303',
    type: 'nft',
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '3',
    categoryId: '3',
    tags: ['gaming', 'item', 'utility', 'trading'],
    rating: 4.0,
    numReviews: 15,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: '',
    verificationRequired: VerificationRequirement.TRADING
  },
  {
    id: '5',
    name: 'Crypto Hoodie',
    description: 'Comfortable hoodie with crypto-inspired design. Available worldwide, no verification required.',
    price: 49.99,
    image: 'https://picsum.photos/400/304',
    type: 'physical',
    categoryId: '2',
    tags: ['clothing', 'fashion', 'comfort', 'worldwide'],
    rating: 4.7,
    numReviews: 25,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: '',
    verificationRequired: VerificationRequirement.NONE
  },
  {
    id: '6',
    name: 'Digital Music Album',
    description: 'Exclusive digital album with bonus tracks. Available only to verified APAC residents.',
    price: 0.015,
    image: 'https://picsum.photos/400/305',
    type: 'nft',
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '4',
    categoryId: '3',
    tags: ['music', 'audio', 'entertainment', 'APAC'],
    rating: 4.4,
    numReviews: 18,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'APAC',
    verificationRequired: VerificationRequirement.REGION
  },
  {
    id: '7',
    name: 'Canadian Crypto Art',
    description: 'Exclusive digital art collection. Available only to verified Canadian residents.',
    price: 1.5,
    image: 'https://picsum.photos/400/306',
    type: 'nft',
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '5',
    categoryId: '1',
    tags: ['art', 'digital', 'regional', 'CA'],
    rating: 4.6,
    numReviews: 0,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'CA',
    verificationRequired: VerificationRequirement.REGION
  },
  {
    id: '8',
    name: 'Premium Canadian Trading Gear',
    description: 'Exclusive high-quality trading setup including dual monitors, mechanical keyboard, and ergonomic chair. Available only to verified Canadian traders.',
    price: 2499.99,
    type: 'physical',
    categoryId: 'equipment',
    tags: ['hardware', 'trading', 'premium', 'CA', 'equipment'],
    rating: 0,
    numReviews: 0,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'CA',
    verificationRequired: VerificationRequirement.BOTH,
    image: 'https://picsum.photos/400/307'
  },
  {
    id: '9',
    name: 'Trading Desk Setup - US Edition',
    description: 'Complete trading desk setup with cable management and LED lighting. Available only to verified US traders.',
    price: 1999.99,
    type: 'physical',
    categoryId: 'equipment',
    tags: ['hardware', 'trading', 'desk', 'US', 'equipment'],
    rating: 0,
    numReviews: 0,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'US',
    verificationRequired: VerificationRequirement.BOTH,
    image: 'https://picsum.photos/400/308'
  },
  {
    id: '10',
    name: 'Pro Trader Backpack',
    description: 'Premium laptop backpack with built-in power bank and secure compartments. Requires trading verification.',
    price: 299.99,
    type: 'physical',
    categoryId: 'accessories',
    tags: ['accessories', 'trading', 'travel', 'worldwide'],
    rating: 0,
    numReviews: 0,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: '',
    verificationRequired: VerificationRequirement.TRADING,
    image: 'https://picsum.photos/400/309'
  },
  {
    id: '11',
    name: 'EU Exclusive Trading Journal',
    description: 'Handcrafted leather trading journal with custom analytics pages. Available only to verified EU residents.',
    price: 149.99,
    type: 'physical',
    categoryId: 'accessories',
    tags: ['accessories', 'stationery', 'EU', 'premium'],
    rating: 0,
    numReviews: 0,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'EU',
    verificationRequired: VerificationRequirement.REGION,
    image: 'https://picsum.photos/400/310'
  }
]; 