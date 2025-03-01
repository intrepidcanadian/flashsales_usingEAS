'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { MerchantDashboard } from '../components/merchant/MerchantDashboard';
import { verifyCoinbaseAttestation } from '../utils/coinbaseAttestation';
import { toast } from 'react-hot-toast';
import { ProductListingForm } from '../components/merchant/ProductListingForm';

export default function DashboardPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      if (!address) {
        toast.error('Please connect your wallet');
        router.push('/');
        return;
      }

      try {
        const verification = await verifyCoinbaseAttestation(address);
        if (!verification || !verification.hasTradingAccess || verification.region !== 'CA') {
          toast.error('Access restricted to verified Canadian traders');
          router.push('/');
          return;
        }
        setIsVerified(true);
      } catch (error) {
        console.error('Error checking verification:', error);
        toast.error('Error checking merchant status');
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    }

    checkAccess();
  }, [address, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isVerified) {
    return null; // Router will handle the redirect
  }

  return (
  
   <div className="dashboard-section">
   <ProductListingForm />
 </div>
  );
} 