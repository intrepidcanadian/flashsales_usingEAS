import { useState, useEffect } from 'react';
import { verifyAttestation, TEST_SCHEMA_ID } from '../utils/attestation';

interface UseAttestationProps {
  walletAddress?: string;
  schemaId?: string;
}

interface AttestationState {
  isVerified: boolean;
  isLoading: boolean;
  error: string | null;
  metadata: any | null;
}

export function useAttestation({ walletAddress, schemaId = TEST_SCHEMA_ID }: UseAttestationProps) {
  const [state, setState] = useState<AttestationState>({
    isVerified: false,
    isLoading: false,
    error: null,
    metadata: null
  });

  useEffect(() => {
    async function checkAttestation() {
      if (!walletAddress) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const metadata = await verifyAttestation(walletAddress, schemaId);
        setState({
          isVerified: !!metadata,
          isLoading: false,
          error: null,
          metadata
        });
      } catch (error) {
        setState({
          isVerified: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to verify attestation',
          metadata: null
        });
      }
    }

    checkAttestation();
  }, [walletAddress, schemaId]);

  return state;
} 