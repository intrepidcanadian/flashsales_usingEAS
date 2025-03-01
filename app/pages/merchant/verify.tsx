import { MerchantVerification } from '../../components/merchant/MerchantVerification';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function VerifyPage() {
  const { address } = useAccount();
  const router = useRouter();

  // Redirect to home if not connected
  useEffect(() => {
    if (!address) {
      router.push('/');
    }
  }, [address, router]);

  if (!address) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <MerchantVerification />
    </div>
  );
} 