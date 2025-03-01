'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { createCoinbaseCheckout } from '@/app/utils/coinbase';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  type: 'physical' | 'nft';
  contractAddress?: string;
  tokenId?: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  isProcessing: boolean;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_PROCESSING'; payload: boolean };

const CartContext = createContext<{
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  handleCheckout: (testMode?: boolean) => Promise<void>;
} | null>(null);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          total: state.total + action.payload.price * action.payload.quantity,
        };
      }
      return {
        ...state,
        items: [...state.items, action.payload],
        total: state.total + action.payload.price * action.payload.quantity,
      };
    }
    case 'REMOVE_ITEM': {
      const item = state.items.find(item => item.id === action.payload);
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (item ? item.price * item.quantity : 0),
      };
    }
    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.id === action.payload.id);
      if (!item) return state;
      const quantityDiff = action.payload.quantity - item.quantity;
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.total + item.price * quantityDiff,
      };
    }
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        total: 0,
      };
    case 'SET_PROCESSING':
      return {
        ...state,
        isProcessing: action.payload,
      };
    default:
      return state;
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    total: 0,
    isProcessing: false,
  });

  const { address } = useAccount();

  const handleCheckout = async (testMode: boolean = false) => {
    if (state.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Check if wallet is connected for NFT purchases
    if (state.items.some(item => item.type === 'nft') && !address) {
      toast.error('Please connect your wallet to purchase NFTs');
      return;
    }

    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });
      const checkout = await createCoinbaseCheckout(state.items, address, testMode);
      
      // Store order details in localStorage for post-purchase verification
      localStorage.setItem('lastOrder', JSON.stringify({
        orderId: checkout.data.metadata.order_id,
        items: state.items,
        timestamp: Date.now(),
        testMode
      }));
      
      // Redirect to Coinbase Commerce checkout
      window.location.href = checkout.data.hosted_url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  };

  return (
    <CartContext.Provider value={{ state, dispatch, handleCheckout }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 