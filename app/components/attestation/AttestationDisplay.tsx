import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { verifyAttestation, TEST_SCHEMA_ID, MerchantLevel } from '../../utils/attestation';

interface AttestationData {
  isVerified: boolean;
  attestationData: {
    uid: string;
    schema: string;
    time: number;
    expirationTime: number;
    revocationTime: number;
    recipient: string;
    attester: string;
    revocable: boolean;
    data: {
      merchantAddress: string;
      merchantLevel: number;
      merchantCategory: string;
      reviewScore: number;
      isActive: boolean;
    };
  };
  explorerURL: string;
}

export function AttestationDisplay() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [attestations, setAttestations] = useState<AttestationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttestations = async () => {
    if (!address || !publicClient) return;

    setLoading(true);
    setError(null);
    try {
      // Check if we're on Base network
      const chainId = await publicClient.getChainId();
      if (chainId !== 8453) { // Base mainnet chain ID
        throw new Error('Please switch to Base network to view attestations');
      }

      const attestation = await verifyAttestation(address, TEST_SCHEMA_ID);
      if (attestation) {
        setAttestations([attestation]);
      } else {
        setError('No attestations found for this address');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attestations');
      console.error('Error fetching attestations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttestations();
  }, [address, publicClient]);

  const getMerchantLevelLabel = (level: number) => {
    return MerchantLevel[level] || 'Unknown';
  };

  if (!address) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-700">Please connect your wallet to view attestations</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchAttestations}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Merchant Attestations</h2>
      
      {attestations.length === 0 ? (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-gray-600">No attestations found for this address</p>
        </div>
      ) : (
        attestations.map((attestation, index) => (
          <div key={attestation.attestationData.uid} className="bg-white rounded-lg shadow p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Attestation {index + 1}</span>
              <div className={`flex items-center ${attestation.attestationData.data.isActive ? 'text-green-600' : 'text-red-600'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${attestation.attestationData.data.isActive ? 'bg-green-600' : 'bg-red-600'}`}></span>
                {attestation.attestationData.data.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Merchant Level</p>
                <p className="font-medium">{getMerchantLevelLabel(attestation.attestationData.data.merchantLevel)}</p>
              </div>
              <div>
                <p className="text-gray-500">Category</p>
                <p className="font-medium">{attestation.attestationData.data.merchantCategory}</p>
              </div>
              <div>
                <p className="text-gray-500">Review Score</p>
                <p className="font-medium">{attestation.attestationData.data.reviewScore}</p>
              </div>
              <div>
                <p className="text-gray-500">Attested On</p>
                <p className="font-medium">{new Date(attestation.attestationData.time * 1000).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="text-sm">
              <p className="text-gray-500">Attester</p>
              <p className="font-mono text-xs break-all">{attestation.attestationData.attester}</p>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <a
                href={attestation.explorerURL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                View on Base Explorer
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        ))
      )}

      <button
        onClick={fetchAttestations}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Refresh Attestations
      </button>
    </div>
  );
} 