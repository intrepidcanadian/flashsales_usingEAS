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
    description: 'A unique digital collectible',
    price: 0.1,
    type: 'nft',
    categoryId: 'nfts',
    tags: ['art', 'digital', 'collectible'],
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
    verificationRequired: VerificationRequirement.BOTH
  },
  {
    id: '2',
    name: 'Exclusive T-Shirt',
    description: 'Limited edition merchandise',
    price: 29.99,
    type: 'physical',
    categoryId: 'merch',
    tags: ['clothing', 'apparel', 'fashion'],
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
    verificationRequired: VerificationRequirement.NONE
  },
  {
    id: '3',
    name: 'Collector NFT',
    price: 0.05,
    image: '/products/nft2.png',
    type: 'nft',
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '2',
    categoryId: '1',
    description: 'Rare collectible NFT from popular series',
    tags: ['collectible', 'rare', 'series'],
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
    price: 0.02,
    image: '/products/game-asset.png',
    type: 'nft',
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '3',
    categoryId: '3',
    description: 'Powerful in-game item with unique properties',
    tags: ['gaming', 'item', 'utility'],
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
    price: 49.99,
    image: '/products/hoodie.png',
    type: 'physical',
    categoryId: '2',
    description: 'Comfortable hoodie with crypto-inspired design',
    tags: ['clothing', 'fashion', 'comfort'],
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
    price: 0.015,
    image: '/products/music.png',
    type: 'nft',
    contractAddress: '0x1234567890123456789012345678901234567890',
    tokenId: '4',
    categoryId: '3',
    description: 'Exclusive digital album with bonus tracks',
    tags: ['music', 'audio', 'entertainment'],
    rating: 4.4,
    numReviews: 18,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'APAC',
    verificationRequired: VerificationRequirement.REGION
  },
]; 