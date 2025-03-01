import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { getAttestationUID, getAttestationData } from '../../utils/attestation';

const COINBASE_SCHEMA_ID = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";

export function AttestationInfo() {
  const { address } = useAccount();
  const [verificationState, setVerificationState] = useState({
    isVerified: false,
    isLoading: false,
    error: null as string | null,
    metadata: null as any
  });

  useEffect(() => {
    async function checkVerification() {
      if (!address) return;

      setVerificationState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const uid = await getAttestationUID(address, COINBASE_SCHEMA_ID);
        if (!uid) {
          setVerificationState({
            isVerified: false,
            isLoading: false,
            error: null,
            metadata: null
          });
          return;
        }

        const metadata = await getAttestationData(uid);
        setVerificationState({
          isVerified: true,
          isLoading: false,
          error: null,
          metadata
        });
      } catch (error) {
        setVerificationState({
          isVerified: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to verify attestation',
          metadata: null
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
      {verificationState.isVerified && verificationState.metadata ? (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-gray-500">Verification Details:</p>
          <div className="text-xs">
            <p>Verified By: {verificationState.metadata.attester}</p>
            <p>Wallet Address: {verificationState.metadata.recipient}</p>
            <p>Verification Date: {new Date(verificationState.metadata.time * 1000).toLocaleString()}</p>
            <p>Valid Until: {verificationState.metadata.expirationTime ? new Date(verificationState.metadata.expirationTime * 1000).toLocaleString() : 'No Expiration'}</p>
            {verificationState.metadata.revocationTime ? (
              <p className="text-red-500">Verification Revoked: {new Date(verificationState.metadata.revocationTime * 1000).toLocaleString()}</p>
            ) : null}
          </div>
          <div className="mt-3 text-xs text-gray-500">
            <p>✓ Coinbase Identity Verified</p>
            <p>✓ Eligible for Trading</p>
            <p>✓ Region Verified</p>
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