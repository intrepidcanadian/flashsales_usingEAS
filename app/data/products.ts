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

export interface FlashSale {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  salePrice: number;
  image?: string;
  video: string;
  type: 'physical';
  categoryId: string;
  tags: string[];
  rating: number;
  numReviews: number;
  reviews: Review[];
  sellerAddress: string;
  region: string;
  verificationRequired: VerificationRequirement;
  endTime?: number;
}

export const flashSaleProducts: FlashSale[] = [
  {
    id: 'flash-1',
    name: 'Samba OG Shoes - White',
    description: 'Classic Samba OG shoes in white. Limited time flash sale for verified Canadian traders only!',
    originalPrice: 149.99,
    salePrice: 89.99,
    type: 'physical',
    video: '/flashsale/Samba_OG_Shoes_White_B75806_video.webm',
    categoryId: 'shoes',
    tags: ['shoes', 'fashion', 'limited', 'CA'],
    rating: 4.8,
    numReviews: 156,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'CA',
    verificationRequired: VerificationRequirement.REGION
  },
  {
    id: 'flash-2',
    name: 'Samba OG Shoes - Black',
    description: 'Classic Samba OG shoes in black. Limited time flash sale for verified Canadian traders only!',
    originalPrice: 149.99,
    salePrice: 89.99,
    type: 'physical',
    video: '/flashsale/Samba_OG_Shoes_Black_B75807_video.webm',
    categoryId: 'shoes',
    tags: ['shoes', 'fashion', 'limited', 'CA'],
    rating: 4.9,
    numReviews: 142,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'CA',
    verificationRequired: VerificationRequirement.REGION
  },
  {
    id: 'flash-3',
    name: 'Superstar II Shoes - Black',
    description: 'Iconic Superstar II shoes in black. Limited time flash sale for verified Canadian traders only!',
    originalPrice: 129.99,
    salePrice: 79.99,
    type: 'physical',
    video: '/flashsale/Superstar_II_Shoes_Black_JH5470_video.webm',
    categoryId: 'shoes',
    tags: ['shoes', 'fashion', 'limited', 'CA'],
    rating: 4.7,
    numReviews: 98,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'CA',
    verificationRequired: VerificationRequirement.REGION
  }
];

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  type: 'physical';
  categoryId: string;
  tags: string[];
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
    name: 'Limited Edition Art Print',
    description: 'A unique physical art print. Requires US region verification and trading access verification.',
    price: 199.99,
    type: 'physical',
    categoryId: 'art',
    tags: ['art', 'print', 'collectible', 'US', 'trading'],
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
    name: 'Limited Edition Trading Card Set',
    description: 'Premium physical trading card collection. Available only to verified EU residents.',
    price: 49.99,
    image: 'https://picsum.photos/400/302',
    type: 'physical',
    categoryId: '1',
    tags: ['collectible', 'rare', 'cards', 'EU'],
    rating: 4.2,
    numReviews: 8,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'EU',
    verificationRequired: VerificationRequirement.REGION
  },
  {
    id: '4',
    name: 'Premium Gaming Collectible',
    description: 'Limited edition physical gaming collectible. Requires trading verification.',
    price: 299.99,
    image: 'https://picsum.photos/400/303',
    type: 'physical',
    categoryId: '3',
    tags: ['gaming', 'collectible', 'limited', 'trading'],
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
    name: 'Exclusive Vinyl Record Collection',
    description: 'Limited edition vinyl record collection with bonus tracks. Available only to verified APAC residents.',
    price: 149.99,
    image: 'https://picsum.photos/400/305',
    type: 'physical',
    categoryId: '3',
    tags: ['music', 'vinyl', 'entertainment', 'APAC'],
    rating: 4.4,
    numReviews: 18,
    reviews: [],
    sellerAddress: '0x115aBfDa6b101bDC813B90c2780952E89E185F54',
    region: 'APAC',
    verificationRequired: VerificationRequirement.REGION
  },
  {
    id: '7',
    name: 'Canadian Art Print Collection',
    description: 'Exclusive physical art print collection. Available only to verified Canadian residents.',
    price: 299.99,
    image: 'https://picsum.photos/400/306',
    type: 'physical',
    categoryId: '1',
    tags: ['art', 'print', 'regional', 'CA'],
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