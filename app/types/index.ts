import { CartItem } from '../components/cart/CartContext';

export type ProductCategory = {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
};

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  transactionHash?: string;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
};

// Sample categories data
export const categories: ProductCategory[] = [
  {
    id: '1',
    name: 'NFT Collections',
    description: 'Exclusive digital collectibles and artwork',
    image: '/categories/nft.png',
    slug: 'nft-collections',
  },
  {
    id: '2',
    name: 'Apparel',
    description: 'Limited edition clothing and accessories',
    image: '/categories/apparel.png',
    slug: 'apparel',
  },
  {
    id: '3',
    name: 'Digital Assets',
    description: 'Digital goods and virtual items',
    image: '/categories/digital.png',
    slug: 'digital-assets',
  },
];

// Sample order history data
export const sampleOrders: Order[] = [
  {
    id: '1',
    items: [
      {
        id: '1',
        name: 'Limited Edition NFT',
        price: 0.1,
        quantity: 1,
        image: '/products/nft1.png',
        type: 'nft',
        contractAddress: '0x1234567890123456789012345678901234567890',
        tokenId: '1',
      },
    ],
    total: 0.1,
    status: 'completed',
    createdAt: '2024-03-01T12:00:00Z',
    transactionHash: '0xabcdef1234567890',
  },
  {
    id: '2',
    items: [
      {
        id: '2',
        name: 'Exclusive T-Shirt',
        price: 29.99,
        quantity: 2,
        image: '/products/tshirt.png',
        type: 'physical',
      },
    ],
    total: 59.98,
    status: 'processing',
    createdAt: '2024-03-01T13:00:00Z',
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'USA',
    },
  },
]; 