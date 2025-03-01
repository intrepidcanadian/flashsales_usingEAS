import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Base Mainnet EAS Contract Address
const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";

// Known attestation UIDs
const REGION_ATTESTATION_UID = "0xa76f5d6269e956f535eb3c295889075a08c740dfc54ee7378390cff58e0a9a26";
const TRADING_ATTESTATION_UID = "0xd323f38fc39e6dfc9e9a01f05e544f3829c5c1c01fb6273353ea59c682e00a7d";

// Initialize the public client for Base
const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

export enum VerificationRequirement {
  NONE = "NONE",
  REGION = "REGION",
  TRADING = "TRADING",
  BOTH = "BOTH"
}

interface CoinbaseAttestationData {
  region: string;
  hasTradingAccess: boolean;
}

async function getAttestationData(uid: string) {
  try {
    const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(provider);
    
    const attestation = await eas.getAttestation(uid);
    
    // Check if attestation exists and has data
    if (!attestation || !attestation.data) {
      return null;
    }
    
    return attestation;
  } catch (error) {
    console.error("Error fetching Metadata:", error);
    return null;
  }
}

export async function verifyCoinbaseAttestation(address: string): Promise<CoinbaseAttestationData | null> {
  try {
    // Get trading attestation
    const tradingAttestation = await getAttestationData(TRADING_ATTESTATION_UID);
    const hasTradingAccess = tradingAttestation !== null;

    // Get region attestation
    const regionAttestation = await getAttestationData(REGION_ATTESTATION_UID);
    if (!regionAttestation || !regionAttestation.data) {
      console.log('Could not fetch region attestation data');
      return {
        region: '',
        hasTradingAccess
      };
    }

    let region = '';
    try {
      // Try to decode the region data
      const schemaEncoder = new SchemaEncoder("string region");
      const decodedData = schemaEncoder.decodeData(regionAttestation.data);
      if (decodedData && decodedData[0] && decodedData[0].value.value) {
        region = decodedData[0].value.value as string;
      }
    } catch (error) {
      console.error('Error decoding region data:', error);
      // Try alternative schema format
      try {
        const altSchemaEncoder = new SchemaEncoder("bytes32 region");
        const decodedData = altSchemaEncoder.decodeData(regionAttestation.data);
        if (decodedData && decodedData[0] && decodedData[0].value.value) {
          const regionBytes = decodedData[0].value.value as string;
          region = ethers.decodeBytes32String(regionBytes).trim().replace(/\0/g, '');
        }
      } catch (altError) {
        console.error('Error decoding region data with alternative schema:', altError);
      }
    }

    console.log('Decoded region:', region);
    console.log('Has trading access:', hasTradingAccess);

    return {
      region,
      hasTradingAccess
    };
  } catch (error) {
    console.error('Error verifying Coinbase attestation:', error);
    return null;
  }
}

export function isRegionAllowed(userRegion: string, productRegion: string): boolean {
  if (!productRegion || !userRegion) return true; // If no region specified, allow access
  return userRegion === productRegion;
}

// Helper function to check if a user can purchase a product based on requirements
export async function canPurchaseProduct(
  userAddress: string,
  productRegion: string,
  verificationRequired: VerificationRequirement
): Promise<{
  canPurchase: boolean;
  reason?: string;
}> {
  // If no verification required, allow purchase
  if (verificationRequired === VerificationRequirement.NONE) {
    return { canPurchase: true };
  }

  const attestation = await verifyCoinbaseAttestation(userAddress);
  
  // If verification required but no attestation found
  if (!attestation) {
    return { 
      canPurchase: false,
      reason: 'Coinbase verification required'
    };
  }

  // Check specific requirements
  switch (verificationRequired) {
    case VerificationRequirement.REGION:
      if (!isRegionAllowed(attestation.region, productRegion)) {
        return {
          canPurchase: false,
          reason: `Region restriction: This product is only available in ${productRegion}`
        };
      }
      return { canPurchase: true };

    case VerificationRequirement.TRADING:
      if (!attestation.hasTradingAccess) {
        return {
          canPurchase: false,
          reason: 'Trading verification required'
        };
      }
      return { canPurchase: true };

    case VerificationRequirement.BOTH:
      if (!attestation.hasTradingAccess) {
        return {
          canPurchase: false,
          reason: 'Trading verification required'
        };
      }
      if (!isRegionAllowed(attestation.region, productRegion)) {
        return {
          canPurchase: false,
          reason: `Region restriction: This product is only available in ${productRegion}`
        };
      }
      return { canPurchase: true };

    default:
      return { canPurchase: true };
  }
} 