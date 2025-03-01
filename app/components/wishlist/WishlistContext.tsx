'use client';

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

type WishlistState = string[];

type WishlistAction =
  | { type: 'ADD_TO_WISHLIST'; payload: string }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'CLEAR_WISHLIST' };

const WishlistContext = createContext<{
  wishlist: WishlistState;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
} | null>(null);

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      if (state.includes(action.payload)) return state;
      return [...state, action.payload];
    case 'REMOVE_FROM_WISHLIST':
      return state.filter(id => id !== action.payload);
    case 'CLEAR_WISHLIST':
      return [];
    default:
      return state;
  }
};

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, dispatch] = useReducer(wishlistReducer, [], (initial) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wishlist');
      return saved ? JSON.parse(saved) : initial;
    }
    return initial;
  });

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (productId: string) => {
    dispatch({ type: 'ADD_TO_WISHLIST', payload: productId });
  };

  const removeFromWishlist = (productId: string) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
} 