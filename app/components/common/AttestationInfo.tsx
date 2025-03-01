import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { verifyCoinbaseAttestation } from '../../utils/coinbaseAttestation';

export function AttestationInfo() {
  const { address } = useAccount();
  const [verificationState, setVerificationState] = useState({
    isVerified: false,
    isLoading: false,
    error: null as string | null,
    region: '',
    hasTradingAccess: false
  });

  useEffect(() => {
    async function checkVerification() {
      if (!address) return;

      setVerificationState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const verification = await verifyCoinbaseAttestation(address);
        
        // Consider verified if either region or trading access is present
        const isVerified = verification !== null && (!!verification.region || verification.hasTradingAccess);
        
        setVerificationState({
          isVerified,
          isLoading: false,
          error: null,
          region: verification?.region || '',
          hasTradingAccess: verification?.hasTradingAccess || false
        });
      } catch (error) {
        setVerificationState({
          isVerified: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to verify attestation',
          region: '',
          hasTradingAccess: false
        });
      }
    }

    checkVerification();
  }, [address]);

  if (verificationState.isLoading) {
    return (
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (verificationState.error) {
    return (
      <div className="px-4 py-2 border-t border-gray-200">
        <p className="text-sm text-red-500">Error checking verification status</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-2 border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${verificationState.isVerified ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className="text-sm font-medium">
          {verificationState.isVerified ? 'Coinbase Verified' : 'Not Verified'}
        </span>
      </div>
      {verificationState.isVerified ? (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-500">Verification Details:</p>
          <div className="text-xs">
            <p>Wallet Address: {address}</p>
            {verificationState.region && <p>Region: {verificationState.region}</p>}
            <p>Trading Access: {verificationState.hasTradingAccess ? 'Enabled' : 'Disabled'}</p>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            {verificationState.region && <p>✓ Region Verified ({verificationState.region})</p>}
            {verificationState.hasTradingAccess && <p>✓ Trading Access Enabled</p>}
          </div>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <p className="text-xs text-gray-500">
            Verify your Coinbase account to access trading features.
          </p>
          <a
            href="https://www.coinbase.com/onchain-verify"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            Get Coinbase Verification
            <svg
              className="w-3 h-3 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <p className="text-xs text-gray-400 mt-1">
            Coinbase verification enables secure trading and region-specific access.
          </p>
          <div className="mt-3 text-xs text-gray-500">
            Benefits of verification:
            <ul className="list-disc ml-4 mt-1">
              <li>Access to trading features</li>
              <li>Region-specific marketplace access</li>
              <li>Enhanced security features</li>
              <li>Verified status badge</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 