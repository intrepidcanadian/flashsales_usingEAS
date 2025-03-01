'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect, useState, useCallback } from 'react';
import { createCoinbaseCheckout, createCoinbaseProduct } from '../../utils/coinbase';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';
import { supabase } from '../../../lib/supabase';
import type { Database, Json } from '../../../types/database';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  video?: string;
  type: 'physical' | 'nft';
  contractAddress?: string;
  tokenId?: string;
  coinbaseProductId?: string;
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

const CART_STORAGE_KEY = 'onchainkit-cart';

const initialCartState: CartState = {
  items: [],
  total: 0,
  isProcessing: false,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newState: CartState;
  
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        newState = {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
          total: state.total + action.payload.price * action.payload.quantity,
        };
      } else {
        newState = {
          ...state,
          items: [...state.items, action.payload],
          total: state.total + action.payload.price * action.payload.quantity,
        };
      }
      break;
    }
    case 'REMOVE_ITEM': {
      const item = state.items.find(item => item.id === action.payload);
      newState = {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        total: state.total - (item ? item.price * item.quantity : 0),
      };
      break;
    }
    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.id === action.payload.id);
      if (!item) return state;
      const quantityDiff = action.payload.quantity - item.quantity;
      newState = {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
        total: state.total + item.price * quantityDiff,
      };
      break;
    }
    case 'CLEAR_CART':
      newState = {
        ...state,
        items: [],
        total: 0,
      };
      break;
    case 'SET_PROCESSING':
      newState = {
        ...state,
        isProcessing: action.payload,
      };
      break;
    default:
      newState = state;
  }
  
  return newState;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const { address } = useAccount();

  // Wrap dispatch in useCallback to prevent unnecessary re-renders
  const safeDispatch = useCallback((action: CartAction) => {
    if (mounted) {
      dispatch(action);
      // Show toast notifications only after component is mounted
      if (action.type === 'ADD_ITEM') {
        const message = state.items.some(item => item.id === action.payload.id)
          ? `${action.payload.name} quantity updated in cart!`
          : `${action.payload.name} added to cart!`;
        toast.success(message, {
          icon: '🛍️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      }
    }
  }, [mounted, state.items]);

  // Handle initial mount and localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (parsedCart.items) {
          parsedCart.items.forEach((item: CartItem) => {
            dispatch({ type: 'ADD_ITEM', payload: item });
          });
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
    return () => setMounted(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, mounted]);

  const handleCheckout = useCallback(async (testMode: boolean = false) => {
    if (!mounted || state.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      dispatch({ type: 'SET_PROCESSING', payload: true });

      // Create products in Coinbase Commerce if they don't exist
      for (const item of state.items) {
        if (!item.coinbaseProductId) {
          const product = await createCoinbaseProduct({
            name: item.name,
            description: `${item.name} (${item.type === 'nft' ? 'NFT' : 'Physical'})`,
            price: item.price,
            type: item.type,
            image_url: item.image
          });
          item.coinbaseProductId = product.data.id;
        }
      }

      const checkout = await createCoinbaseCheckout(state.items, address, testMode);
      
      // Create order in Supabase
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: checkout.data.metadata.order_id,
          user_address: address,
          items: state.items as unknown as Json,
          total: state.items.reduce((sum, item) => 
            sum + (testMode ? 
              (item.type === 'nft' ? 0.0000001 : 0.01) : 
              item.price) * item.quantity, 
            0
          ),
          status: 'pending',
          charge_id: checkout.data.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['orders']['Insert']);

      if (orderError) {
        throw orderError;
      }
      
      // Clear the cart before redirecting
      dispatch({ type: 'CLEAR_CART' });
      
      // Redirect to Coinbase Commerce checkout
      window.location.href = checkout.data.hosted_url;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout. Please try again.');
    } finally {
      dispatch({ type: 'SET_PROCESSING', payload: false });
    }
  }, [mounted, state.items, address]);

  // Prevent rendering until after hydration
  if (!mounted) {
    return null;
  }

  return (
    <CartContext.Provider value={{ state, dispatch: safeDispatch, handleCheckout }}>
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