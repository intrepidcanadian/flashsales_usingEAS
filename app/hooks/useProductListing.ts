import { useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { verifyCoinbaseAttestation, VerificationRequirement } from '../utils/coinbaseAttestation';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface ProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  type: 'nft' | 'physical';
  verificationRequired: VerificationRequirement;
  tags?: string[];
}

interface StoredProduct extends ProductData {
  id: string;
  sellerAddress: string;
  region: string;
  createdAt: string;
  rating: number;
  numReviews: number;
  reviews: any[];
  contractAddress?: string;
  tokenId?: string;
}

export function useProductListing() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);

  const listProduct = async (productData: ProductData) => {
    if (!address || !publicClient) {
      toast.error('Please connect your wallet');
      return null;
    }

    setIsLoading(true);
    try {
      // Check merchant verification first
      const attestation = await verifyCoinbaseAttestation(address);
      
      if (!attestation) {
        toast.error('Could not verify merchant status');
        return null;
      }

      // Check for both trading and region verification
      if (!attestation.hasTradingAccess) {
        toast.error('Trading verification required to create products');
        return null;
      }

      if (attestation.region !== 'CA') {
        toast.error('Canadian region verification required to create products');
        return null;
      }

      // Generate a unique ID for the product
      const productId = uuidv4();

      // Add the merchant's region and address to the product data
      const enrichedProductData: StoredProduct = {
        id: productId,
        ...productData,
        sellerAddress: address,
        region: attestation.region,
        createdAt: new Date().toISOString(),
        rating: 0,
        numReviews: 0,
        reviews: [],
        tags: productData.tags || [],
        // For NFTs, generate a unique contract address and token ID
        ...(productData.type === 'nft' ? {
          contractAddress: '0x' + Array(40).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
          tokenId: Math.floor(Math.random() * 1000000).toString()
        } : {})
      };

      // Store the product data
      // In a real app, this would be stored in a database or on-chain
      const existingProducts = JSON.parse(localStorage.getItem('products') || '[]');
      localStorage.setItem('products', JSON.stringify([...existingProducts, enrichedProductData]));

      // Emit an event for product creation
      const event = new CustomEvent('productCreated', { detail: enrichedProductData });
      window.dispatchEvent(event);

      toast.success('Product listed successfully!');
      return enrichedProductData;
    } catch (error) {
      console.error('Error listing product:', error);
      toast.error('Failed to list product. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    listProduct,
    isLoading
  };
} 