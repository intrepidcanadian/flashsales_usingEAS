import { useState, useEffect } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { canPurchaseProduct, VerificationRequirement, verifyCoinbaseAttestation } from '../../utils/coinbaseAttestation';
import { toast } from 'react-hot-toast';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: string;
    image: string;
    sellerAddress: string;
    region: string;
    verificationRequired: VerificationRequirement;
    type: 'physical' | 'nft';
  };
  onAddToCart?: (product: any) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { address } = useAccount();
  const [loading, setLoading] = useState(false);
  const publicClient = usePublicClient();
  const [purchaseStatus, setPurchaseStatus] = useState<{
    canPurchase: boolean;
    reason?: string;
  }>({ canPurchase: false, reason: 'Checking verification...' });
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const checkPurchaseEligibility = async () => {
      if (!address) {
        setPurchaseStatus({ canPurchase: false, reason: 'Please connect your wallet' });
        setIsChecking(false);
        return;
      }

      if (product.verificationRequired === VerificationRequirement.NONE) {
        setPurchaseStatus({ canPurchase: true });
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      try {
        const status = await canPurchaseProduct(
          address,
          product.region,
          product.verificationRequired
        );
        console.log('Purchase status for product:', product.name, status);
        setPurchaseStatus(status);
      } catch (error) {
        console.error('Error checking purchase eligibility:', error);
        setPurchaseStatus({
          canPurchase: false,
          reason: 'Error checking eligibility'
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkPurchaseEligibility();
  }, [address, product.region, product.verificationRequired, product.name]);

  const handleAddToCart = () => {
    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!purchaseStatus.canPurchase) {
      toast.error(purchaseStatus.reason || 'Unable to add to cart');
      return;
    }

    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const getVerificationBadge = () => {
    if (isChecking) {
      return (
        <span className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 bg-gray-100 text-gray-600">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Checking Verification
        </span>
      );
    }

    const baseClasses = "px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2";
    
    if (product.verificationRequired === VerificationRequirement.NONE) {
      return (
        <span className={`${baseClasses} bg-green-100 text-green-800`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          No Verification Required
        </span>
      );
    }

    if (!address) {
      return (
        <span className={`${baseClasses} bg-gray-100 text-gray-600`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-6a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          Connect Wallet to Check
        </span>
      );
    }

    const icon = purchaseStatus.canPurchase ? (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-6a6 6 0 11-12 0 6 6 0 0112 0z" />
      </svg>
    );

    switch (product.verificationRequired) {
      case VerificationRequirement.REGION:
        return (
          <span className={`${baseClasses} ${purchaseStatus.canPurchase ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {icon}
            {purchaseStatus.canPurchase ? `${product.region} Verified` : `${product.region} Region Required`}
          </span>
        );
      case VerificationRequirement.TRADING:
        return (
          <span className={`${baseClasses} ${purchaseStatus.canPurchase ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
            {icon}
            {purchaseStatus.canPurchase ? 'Trading Verified' : 'Trading Verification Required'}
          </span>
        );
      case VerificationRequirement.BOTH:
        return (
          <span className={`${baseClasses} ${purchaseStatus.canPurchase ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {icon}
            {purchaseStatus.canPurchase ? `${product.region} & Trading Verified` : `${product.region} Region & Trading Required`}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${!purchaseStatus.canPurchase && !isChecking ? 'opacity-75' : ''}`}>
      {/* Product Image */}
      <div className="aspect-w-16 aspect-h-9 relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {/* Eligibility Overlay */}
        {!purchaseStatus.canPurchase && !isChecking && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-3 text-center max-w-xs mx-4">
              <p className="text-sm font-medium text-gray-900">Verification Required</p>
              <p className="text-xs text-gray-600 mt-1">{purchaseStatus.reason}</p>
              <a
                href="https://www.coinbase.com/onchain-verify"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center justify-center"
              >
                Get Verified
                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        </div>
        <div className="mb-3">
          {getVerificationBadge()}
        </div>
        <p className="mt-1 text-sm text-gray-500">{product.description}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">
            {product.type === 'physical' ? `$${Number(product.price).toFixed(2)}` : `${product.price} ETH`}
          </span>
        </div>

        {/* Purchase Section */}
        <div className="mt-4">
          {isChecking ? (
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={!purchaseStatus.canPurchase || !address}
              className={`w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 ${
                purchaseStatus.canPurchase && address
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              } transition-colors`}
            >
              {!address ? (
                <>
                  <span>Connect Wallet</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-6a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                </>
              ) : purchaseStatus.canPurchase ? (
                <>
                  <span>Add to Cart</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Not Available</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H8m10-6a6 6 0 11-12 0 6 6 0 0112 0z" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 