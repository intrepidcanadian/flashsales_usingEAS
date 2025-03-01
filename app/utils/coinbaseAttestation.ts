import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';

// Base Mainnet EAS Contract Address
const EAS_CONTRACT_ADDRESS = "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587";

// Coinbase Verification Schema (example - replace with actual schema from Base)
const COINBASE_VERIFICATION_SCHEMA = "0x46726f6d2043422c20776974682076657269666965642074726164696e672061636365737320616e6420726567696f6e";

export enum VerificationRequirement {
  NONE = "NONE",
  REGION = "REGION",
  TRADING = "TRADING",
  BOTH = "BOTH"
}

interface CoinbaseAttestationData {
  hasVerifiedAccount: boolean;
  hasTradingAccess: boolean;
  region: string;
  timestamp: number;
  isActive: boolean;
}

export async function verifyCoinbaseAttestation(address: string): Promise<CoinbaseAttestationData | null> {
  try {
    // Initialize EAS SDK
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    
    // Get attestation for the address
    const attestation = await eas.getAttestation(COINBASE_VERIFICATION_SCHEMA, address);
    
    if (!attestation) {
      return null;
    }

    // Decode the attestation data
    const schemaEncoder = new SchemaEncoder("bool hasVerifiedAccount, bool hasTradingAccess, string region, uint64 timestamp, bool isActive");
    const decodedData = schemaEncoder.decodeData(attestation.data);

    return {
      hasVerifiedAccount: decodedData[0].value.value as boolean,
      hasTradingAccess: decodedData[1].value.value as boolean,
      region: decodedData[2].value.value as string,
      timestamp: Number(decodedData[3].value.value),
      isActive: decodedData[4].value.value as boolean
    };
  } catch (error) {
    console.error('Error verifying Coinbase attestation:', error);
    return null;
  }
}

export function isRegionAllowed(userRegion: string, productRegion: string): boolean {
  if (!productRegion || !userRegion) return false;
  return userRegion === productRegion;
}

export function getRegionFromAttestation(attestationData: CoinbaseAttestationData | null): string {
  if (!attestationData || !attestationData.hasVerifiedAccount || !attestationData.isActive) {
    return '';
  }
  return attestationData.region;
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

  // Check if attestation is valid and active
  if (!attestation.hasVerifiedAccount || !attestation.isActive) {
    return { 
      canPurchase: false,
      reason: 'Invalid or inactive verification'
    };
  }

  // Check specific requirements
  switch (verificationRequired) {
    case VerificationRequirement.REGION:
      if (!isRegionAllowed(attestation.region, productRegion)) {
        return {
          canPurchase: false,
          reason: 'Region restriction: Not available in your region'
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
          reason: 'Region restriction: Not available in your region'
        };
      }
      return { canPurchase: true };

    default:
      return { canPurchase: true };
  }
} 