import { useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { BrowserProvider } from 'ethers';
import { MerchantCategory, MerchantLevel, createMerchantAttestation } from '../../utils/attestation';
import { toast } from 'react-hot-toast';

export function MerchantVerification() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    category: MerchantCategory.GENERAL,
    agreedToTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !publicClient) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!formData.agreedToTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);
    try {
      // Convert publicClient to ethers signer
      const provider = new BrowserProvider(publicClient as any);
      const signer = await provider.getSigner();
      
      // Create merchant attestation
      const receipt = await createMerchantAttestation(
        signer,
        address,
        MerchantLevel.BASIC, // Start with basic level
        formData.category,
        0, // Initial review score
        true // Active
      );

      toast.success('Merchant verification successful!');
      setStep(3); // Move to success step
    } catch (error) {
      console.error('Merchant verification failed:', error);
      toast.error('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      {/* Step 1: Introduction */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Become a Verified Merchant</h2>
          <p className="text-gray-600">
            Get verified as a merchant to start selling products on our platform. Verification is done through Base's attestation service.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Benefits of Verification:</h3>
            <ul className="list-disc pl-5 text-blue-800 space-y-1">
              <li>Build trust with buyers</li>
              <li>Access to merchant dashboard</li>
              <li>Ability to list products</li>
              <li>Earn reputation and level up</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Requirements:</h3>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Connected wallet address ✓</li>
              <li>Choose merchant category</li>
              <li>Agree to platform terms</li>
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

      {/* Step 2: Verification Form */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Merchant Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <input
                  type="text"
                  value={address}
                  disabled
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Merchant Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as MerchantCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.values(MerchantCategory).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Choose the primary category for your products
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Merchant Levels</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">BASIC</span>
                    <span className="text-sm text-gray-600">- Starting level for new merchants</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">TRUSTED</span>
                    <span className="text-sm text-gray-600">- Earned after successful sales</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">PREMIUM</span>
                    <span className="text-sm text-gray-600">- High volume sellers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">EXPERT</span>
                    <span className="text-sm text-gray-600">- Top rated merchants</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Terms & Conditions
                </label>
                <div className="border border-gray-300 rounded-md p-4 h-32 overflow-y-auto text-sm text-gray-600">
                  <p>By becoming a verified merchant, you agree to:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Maintain accurate product listings</li>
                    <li>Respond to customer inquiries promptly</li>
                    <li>Follow platform guidelines and policies</li>
                    <li>Accept the platform's fee structure</li>
                    <li>Allow attestation of your merchant status on Base</li>
                  </ul>
                </div>
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, agreedToTerms: e.target.checked }))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    I agree to the terms and conditions
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.agreedToTerms}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isLoading ? 'Verifying...' : 'Complete Verification'}
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Success */}
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
            Congratulations! You are now a verified merchant on our platform.
            You can start listing products and building your reputation.
          </p>

          <div className="bg-blue-50 rounded-lg p-4 text-left">
            <h3 className="font-medium text-blue-900 mb-2">Next Steps:</h3>
            <ul className="list-disc pl-5 text-blue-800 space-y-1">
              <li>Visit your merchant dashboard</li>
              <li>Create your first product listing</li>
              <li>Set up your merchant profile</li>
              <li>Review the merchant guidelines</li>
            </ul>
          </div>

          <div className="pt-6">
            <button
              onClick={() => window.location.href = '/merchant/dashboard'}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go to Merchant Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 