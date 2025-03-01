'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect, useState, useCallback } from 'react';
import { createCoinbaseCheckout } from '../../utils/coinbase';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

// Function to generate a UUID using the crypto API
function generateUUID() {
  const template = '10000000-1000-4000-8000-100000000000';
  return template.replace(/[018]/g, c => 
    (parseInt(c) ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> parseInt(c) / 4).toString(16)
  );
}

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

      // Generate a UUID for the order
      const orderId = generateUUID();
      
      const checkoutResponse = await createCoinbaseCheckout(state.items, address, testMode, orderId);
      console.log('Checkout response:', checkoutResponse);
      
      if (!checkoutResponse?.data?.hosted_url) {
        throw new Error('Invalid checkout response from Coinbase');
      }

      // Store order details in localStorage
      const order = {
        id: orderId,
        userAddress: address.toLowerCase(),
        items: state.items,
        total: state.items.reduce((sum, item) => 
          sum + (testMode ? 
            (item.type === 'nft' ? 0.0000001 : 0.01) : 
            item.price) * item.quantity, 
          0
        ),
        status: 'pending',
        chargeId: checkoutResponse.data.id,
        createdAt: new Date().toISOString(),
        testMode,
        metadata: checkoutResponse.data.metadata
      };

      // Store in localStorage
      localStorage.setItem(`order_${orderId}`, JSON.stringify(order));
      
      // Store pending charge info
      const pendingCharge = {
        chargeId: checkoutResponse.data.id,
        orderId,
        items: state.items,
        timestamp: Date.now(),
        testMode
      };
      localStorage.setItem('pendingCharge', JSON.stringify(pendingCharge));
      
      // Clear the cart before redirecting
      dispatch({ type: 'CLEAR_CART' });
      
      // Redirect to Coinbase Commerce checkout
      window.location.href = checkoutResponse.data.hosted_url;
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