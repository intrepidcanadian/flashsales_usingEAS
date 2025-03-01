'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { getMerchantAttestation, MerchantLevel, MerchantCategory } from '../../utils/attestation';
import { ProductListingForm } from './ProductListingForm';
import { ProductList } from './ProductList';
import { toast } from 'react-hot-toast';
import { AttestationDisplay } from '../attestation/AttestationDisplay';

interface MerchantStats {
  totalProducts: number;
  totalSales: number;
  averageRating: number;
  activeListings: number;
}

export function MerchantDashboard() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(true);
  const [showListingForm, setShowListingForm] = useState(false);
  const [merchantData, setMerchantData] = useState<{
    level: MerchantLevel;
    category: MerchantCategory;
    reviewScore: number;
    isActive: boolean;
  } | null>(null);

  // Placeholder stats - In a real app, these would come from your backend
  const [stats, setStats] = useState<MerchantStats>({
    totalProducts: 0,
    totalSales: 0,
    averageRating: 0,
    activeListings: 0,
  });

  useEffect(() => {
    const loadMerchantData = async () => {
      if (!address || !publicClient) return;

      try {
        const data = await getMerchantAttestation(publicClient, address);
        if (data) {
          setMerchantData(data);
          // In a real app, you would fetch actual stats here
          setStats({
            totalProducts: 5,
            totalSales: 12,
            averageRating: 4.5,
            activeListings: 3,
          });
        }
      } catch (error) {
        console.error('Error loading merchant data:', error);
        toast.error('Failed to load merchant data');
      } finally {
        setIsLoading(false);
      }
    };

    loadMerchantData();
  }, [address, publicClient]);

  if (!address) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-gray-600">Please connect your wallet to access the merchant dashboard.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (!merchantData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-gray-600">You are not registered as a merchant.</p>
        <button
          onClick={() => window.location.href = '/merchant/onboarding'}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Become a Merchant
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Merchant Dashboard</h1>
        
        {/* Attestation Status Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Attestation Status</h2>
          <AttestationDisplay />
        </div>

        {/* Other Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Stats</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Products Listed: {stats.totalProducts}</p>
              <p className="text-sm text-gray-600">Total Sales: {stats.totalSales} ETH</p>
              <p className="text-sm text-gray-600">Customer Rating: {stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Recent Activity</h3>
            <p className="text-sm text-gray-600">No recent activity</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={() => setShowListingForm(!showListingForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            List New Product
          </button>
          <button
            onClick={() => toast.success('Coming soon!')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            View Sales History
          </button>
        </div>
      </div>

      {/* Product Listing Form */}
      {showListingForm && (
        <div className="bg-white rounded-lg shadow-sm">
          <ProductListingForm />
        </div>
      )}

      {/* Product List */}
      <ProductList />
    </div>
  );
} 