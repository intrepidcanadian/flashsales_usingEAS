import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from 'ethers';
// @ts-ignore
import attestationABI from '../abi/attestation.js';
const ABI = attestationABI;
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

// Base Mainnet EAS Contract Address
const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021";
// Coinbase Indexer Contract Address
const COINBASE_INDEXER_ADDRESS = "0x2c7eE1E5f416dfF40054c27A62f7B357C4E8619C";
// Coinbase RPC URL
const COINBASE_RPC_URL = "https://api.developer.coinbase.com/rpc/v1/base/liSnUM_Ngr62kqupe50h6QDZPje8i1zg";

// Coinbase Attestation Schema IDs
const COINBASE_REGION_SCHEMA = "0x1801901fabd0e6189356b4fb52bb0ab855276d84f7ec140839fbd1f6801ca065";
const COINBASE_TRADING_SCHEMA = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";

// Initialize the provider
const provider = new ethers.JsonRpcProvider(COINBASE_RPC_URL);

// Initialize contracts
const indexerContract = new ethers.Contract(
  COINBASE_INDEXER_ADDRESS,
  ABI,
  provider
);

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

async function getAttestationUID(walletAddress: string, schemaId: string): Promise<string | null> {
  try {
    const attestationUID = await indexerContract.getAttestationUid(walletAddress, schemaId);
    return attestationUID !== ethers.ZeroHash ? attestationUID : null;
  } catch (error) {
    console.error("Error fetching Attestation UID:", error);
    return null;
  }
}

async function getAttestationData(uid: string) {
  try {
    const eas = new EAS(EAS_CONTRACT_ADDRESS);
    eas.connect(provider);
    
    const attestation = await eas.getAttestation(uid);
    if (!attestation) {
      console.log('No attestation found for UID:', uid);
      return null;
    }
    
    return attestation;
  } catch (error) {
    console.error("Error fetching Metadata:", error);
    return null;
  }
}

export async function verifyCoinbaseAttestation(
  address: string,
  testRegionUID?: string,
  testTradingUID?: string
): Promise<CoinbaseAttestationData | null> {
  try {
    // Get trading attestation - either from test UID or lookup
    const tradingUID = testTradingUID || await getAttestationUID(address, COINBASE_TRADING_SCHEMA);
    console.log('Trading UID:', tradingUID);
    const tradingAttestation = tradingUID ? await getAttestationData(tradingUID) : null;
    console.log('Trading attestation:', tradingAttestation);
    
    // Get region attestation - either from test UID or lookup
    const regionUID = testRegionUID || await getAttestationUID(address, COINBASE_REGION_SCHEMA);
    console.log('Region UID:', regionUID);
    const regionAttestation = regionUID ? await getAttestationData(regionUID) : null;
    console.log('Region attestation:', regionAttestation);

    // Check trading access
    const hasTradingAccess = tradingAttestation !== null && 
                            !tradingAttestation.revocationTime &&
                            tradingAttestation.data === '0x0000000000000000000000000000000000000000000000000000000000000001';

    // Get region from attestation
    let region = '';
    if (regionAttestation && 
        regionAttestation.data && 
        !regionAttestation.revocationTime) {
      try {
        // For region attestation, data is directly the region code
        const schemaEncoder = new SchemaEncoder("string region");
        const decodedData = schemaEncoder.decodeData(regionAttestation.data);
        if (decodedData && decodedData[0]) {
          region = decodedData[0].value.value as string;
        }
      } catch (error) {
        console.error('Error decoding region data:', error);
        console.log('Raw region data:', regionAttestation.data);
      }
    }

    const isVerified = !!(regionAttestation || tradingAttestation);
    console.log('Is verified:', isVerified);
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
      if (!attestation.region) {
        return {
          canPurchase: false,
          reason: 'Region verification required'
        };
      }
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
      if (!attestation.region || !attestation.hasTradingAccess) {
        return {
          canPurchase: false,
          reason: 'Both region and trading verification required'
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

// Test function for direct UID verification
export async function testVerificationWithUIDs() {
  const result = await verifyCoinbaseAttestation(
    "0x0000000000000000000000000000000000000000", // dummy address since we're using direct UIDs
    "0xa76f5d6269e956f535eb3c295889075a08c740dfc54ee7378390cff58e0a9a26", // region UID
    "0xd323f38fc39e6dfc9e9a01f05e544f3829c5c1c01fb6273353ea59c682e00a7d"  // trading UID
  );
  
  console.log("Direct UID verification result:", result);
  return result;
}

// Coinbase Commerce API functions
interface CreateChargeParams {
  name: string;
  description: string;
  amount: string;
  currency: string;
}

export async function createCoinbaseCharge({
  name,
  description,
  amount,
  currency
}: CreateChargeParams) {
  try {
    const response = await fetch('https://api.commerce.coinbase.com/charges/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY || '',
      },
      body: JSON.stringify({
        name,
        description,
        pricing_type: 'fixed_price',
        local_price: {
          amount,
          currency
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating charge:', errorData);
      throw new Error(`Failed to create charge: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Charge created:', data);
    return data;
  } catch (error) {
    console.error('Error creating Coinbase charge:', error);
    throw error;
  }
}

export async function retrieveCoinbaseCharge(chargeId: string) {
  try {
    const response = await fetch(`https://api.commerce.coinbase.com/charges/${chargeId}`, {
      headers: {
        'X-CC-Api-Key': process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY || '',
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error retrieving charge:', errorData);
      throw new Error(`Failed to retrieve charge: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Charge retrieved:', data);
    return data;
  } catch (error) {
    console.error('Error retrieving Coinbase charge:', error);
    throw error;
  }
} 