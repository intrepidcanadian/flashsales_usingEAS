import { useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { MerchantCategory, MerchantLevel, createMerchantAttestation, getEASExplorerURL } from '../../utils/attestation';
import { toast } from 'react-hot-toast';
import { BrowserProvider, TransactionReceipt } from 'ethers';

export function MerchantOnboarding() {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MerchantCategory>(MerchantCategory.GENERAL);
  const [step, setStep] = useState(1);
  const [attestationUID, setAttestationUID] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !walletClient) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsLoading(true);
    try {
      // Convert walletClient to ethers signer
      const provider = new BrowserProvider(walletClient as any);
      const signer = await provider.getSigner();
      
      // Create merchant attestation
      const receipt = await createMerchantAttestation(
        signer,
        address,
        MerchantLevel.BASIC, // Start with basic level
        selectedCategory,
        0, // Initial review score
        true // Active
      );

      // The receipt should include the attestation UID in the event logs
      if (receipt && typeof receipt === 'object' && 'logs' in receipt) {
        const txReceipt = receipt as TransactionReceipt;
        if (txReceipt.logs && txReceipt.logs.length > 0 && txReceipt.logs[0].topics.length > 1) {
          setAttestationUID(txReceipt.logs[0].topics[1]);
        }
      }

      toast.success('Merchant verification successful!');
      setStep(3); // Move to success step
    } catch (error) {
      console.error('Merchant verification failed:', error);
      toast.error('Merchant verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-gray-600">Please connect your wallet to become a merchant.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Become a Merchant</h2>
          <p className="text-gray-600">
            Join our global marketplace and start selling your products.
          </p>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Requirements:</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Valid wallet address (✓)</li>
              <li>Agreement to marketplace terms</li>
              <li>Complete merchant profile</li>
            </ul>
          </div>
          <button
            onClick={() => setStep(2)}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Start Verification
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Merchant Details</h2>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Wallet Address
              </label>
              <input
                type="text"
                value={address}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Merchant Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as MerchantCategory)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {Object.values(MerchantCategory).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Terms & Conditions
              </label>
              <div className="border border-gray-300 rounded-md p-4 h-32 overflow-y-auto text-sm text-gray-600">
                <p>By becoming a merchant, you agree to:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Maintain accurate product listings</li>
                  <li>Respond to customer inquiries promptly</li>
                  <li>Follow marketplace guidelines</li>
                  <li>Accept the platform's fee structure</li>
                </ul>
              </div>
              <label className="flex items-center mt-2">
                <input type="checkbox" required className="rounded text-blue-600" />
                <span className="ml-2 text-sm text-gray-600">
                  I agree to the terms and conditions
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {isLoading ? 'Verifying...' : 'Complete Verification'}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Verification Complete!</h2>
          <p className="text-gray-600">
            You are now a verified merchant. You can start listing products in the marketplace.
          </p>
          
          {attestationUID && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">View your attestation on EAS Explorer:</p>
              <a
                href={getEASExplorerURL(attestationUID)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 flex items-center justify-center mt-2"
              >
                View Attestation
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Merchant Dashboard
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 