import { useState, useCallback } from 'react';
import { createCoinbaseProduct, getCoinbaseProduct } from '@/app/utils/coinbase';
import type { CartItem } from '@/app/components/cart/CartContext';

interface UseProductsReturn {
  createProduct: (product: {
    name: string;
    description: string;
    price: number;
    type: 'physical' | 'nft';
    image_url?: string;
  }) => Promise<void>;
  getProduct: (productId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useProducts(): UseProductsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = useCallback(async (product: {
    name: string;
    description: string;
    price: number;
    type: 'physical' | 'nft';
    image_url?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      await createCoinbaseProduct(product);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProduct = useCallback(async (productId: string) => {
    setLoading(true);
    setError(null);
    try {
      await getCoinbaseProduct(productId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createProduct,
    getProduct,
    loading,
    error
  };
} 