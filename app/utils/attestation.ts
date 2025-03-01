import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import { ethers, Log, ContractTransactionResponse, TransactionReceipt } from 'ethers';
import ABI from '../abi/attestation';

// Define interface for the indexer contract
interface BaseIndexer extends ethers.BaseContract {
  registerSchema(
    schema: string,
    contractAddress: string,
    revocable: boolean,
    indexed: boolean
  ): Promise<ContractTransactionResponse>;
  getAttestationUid(
    walletAddress: string,
    schemaId: string
  ): Promise<string>;
}

// Base configuration
const RPC_URL = "https://api.developer.coinbase.com/rpc/v1/base/liSnUM_Ngr62kqupe50h6QDZPje8i1zg";
export const EAS_CONTRACT_ADDRESS = "0x4200000000000000000000000000000000000021"; // Base EAS Contract
export const INDEXER_CONTRACT_ADDRESS = "0x2c7eE1E5f416dfF40054c27A62f7B357C4E8619C"; // Base Indexer Contract

// Initialize provider and contract
const provider = new ethers.JsonRpcProvider(RPC_URL);
const indexerContract = new ethers.Contract(
  INDEXER_CONTRACT_ADDRESS, 
  ABI, 
  provider
) as unknown as BaseIndexer;

// Initialize EAS
const eas = new EAS(EAS_CONTRACT_ADDRESS);
eas.connect(provider);

// Merchant verification levels
export enum MerchantLevel {
  BASIC = 0,
  TRUSTED = 1,
  PREMIUM = 2,
  EXPERT = 3
}

// Merchant categories
export enum MerchantCategory {
  GENERAL = "GENERAL",
  NFT = "NFT",
  PHYSICAL = "PHYSICAL",
  DIGITAL = "DIGITAL"
}

// Schema: address merchantAddress, uint8 merchantLevel, string merchantCategory, uint32 reviewScore, bool isActive
export const MERCHANT_SCHEMA = "address merchantAddress,uint8 merchantLevel,string merchantCategory,uint32 reviewScore,bool isActive";

export const registerMerchantSchema = async (signer: ethers.Signer) => {
  try {
    // Connect indexer contract with signer
    const indexerWithSigner = indexerContract.connect(signer) as BaseIndexer;
    
    // Register the schema with the indexer using custom method
    const tx = await indexerWithSigner.registerSchema(
      MERCHANT_SCHEMA,
      EAS_CONTRACT_ADDRESS,
      true, // revocable
      true  // indexed
    );

    const receipt = await tx.wait();
    if (typeof receipt === 'string') {
      throw new Error('Invalid transaction receipt');
    }
    
    // Get the schema ID from the event logs
    const schemaRegisteredEvent = receipt.logs.find(
      (log: Log) => log.topics[0] === ethers.id("SchemaRegistered(bytes32,string,address,bool,bool)")
    );

    if (!schemaRegisteredEvent) {
      throw new Error('Schema registration event not found');
    }

    const schemaUID = schemaRegisteredEvent.topics[1];
    console.log('Registered schema UID:', schemaUID);
    return schemaUID;
  } catch (error) {
    console.error('Error registering schema:', error);
    throw error;
  }
};

export const createMerchantSchema = () => {
  const schemaEncoder = new SchemaEncoder(MERCHANT_SCHEMA);
  return schemaEncoder;
};

export const createMerchantAttestation = async (
  signer: ethers.Signer,
  merchantAddress: string,
  level: MerchantLevel,
  category: MerchantCategory,
  reviewScore: number = 0,
  isActive: boolean = true
) => {
  try {
    // First, check if we have a registered schema
    let schemaUID = await getSchemaUID();
    if (!schemaUID) {
      // Register the schema if it doesn't exist
      schemaUID = await registerMerchantSchema(signer);
      if (!schemaUID) throw new Error('Failed to register schema');
      console.log('New schema registered:', schemaUID);
    }

    // Connect EAS with signer
    const easWithSigner = eas.connect(signer);

    const schemaEncoder = createMerchantSchema();
    const encodedData = schemaEncoder.encodeData([
      { name: "merchantAddress", value: merchantAddress, type: "address" },
      { name: "merchantLevel", value: BigInt(level), type: "uint8" },
      { name: "merchantCategory", value: category, type: "string" },
      { name: "reviewScore", value: BigInt(reviewScore), type: "uint32" },
      { name: "isActive", value: isActive, type: "bool" }
    ]);

    const tx = await easWithSigner.attest({
      schema: schemaUID,
      data: {
        recipient: merchantAddress,
        expirationTime: BigInt(0), // No expiration
        revocable: true,
        data: encodedData,
      },
    });

    const receipt = await tx.wait();
    if (typeof receipt === 'string') {
      throw new Error('Invalid transaction receipt');
    }
    
    // Get attestation UID from event logs
    const attestEvent = receipt.logs.find(
      (log: Log) => log.topics[0] === ethers.id("Attested(bytes32,address,address,bytes32,bool)")
    );
    
    const attestationUID = attestEvent?.topics[1];
    if (attestationUID) {
      console.log('View attestation on EAS Explorer:', `https://easscan.org/attestation/${attestationUID}`);
    }
    
    return receipt;
  } catch (error) {
    console.error('Error creating merchant attestation:', error);
    throw error;
  }
};

// Get the schema UID from the indexer
export const getSchemaUID = async (): Promise<string | null> => {
  try {
    const filter = indexerContract.filters.SchemaRegistered();
    const events = await indexerContract.queryFilter(filter);
    
    // Find our merchant schema using event topics
    const merchantSchemaEvent = events.find(
      (event) => event.topics[0] === ethers.id("SchemaRegistered(bytes32,string,address,bool,bool)")
    );

    return merchantSchemaEvent ? merchantSchemaEvent.topics[1] : null;
  } catch (error) {
    console.error('Error getting schema UID:', error);
    return null;
  }
};

export const getMerchantAttestation = async (
  provider: ethers.Provider,
  merchantAddress: string
): Promise<{
  isVerified: boolean;
  level: MerchantLevel;
  category: MerchantCategory;
  reviewScore: number;
  isActive: boolean;
  attestationUID?: string; // Added to store the attestation UID
} | null> => {
  try {
    const schemaUID = await getSchemaUID();
    if (!schemaUID) {
      console.error('No schema registered');
      return null;
    }

    const easContract = new EAS(EAS_CONTRACT_ADDRESS);
    easContract.connect(provider);

    const attestation = await easContract.getAttestation(schemaUID);
    if (!attestation) {
      return null;
    }

    const schemaEncoder = createMerchantSchema();
    const decodedData = schemaEncoder.decodeData(attestation.data);

    return {
      isVerified: true,
      level: Number(decodedData[1].value) as MerchantLevel,
      category: decodedData[2].value.toString() as MerchantCategory,
      reviewScore: Number(decodedData[3].value),
      isActive: Boolean(decodedData[4].value),
      attestationUID: attestation.uid
    };
  } catch (error) {
    console.error('Error getting merchant attestation:', error);
    return null;
  }
};

// Verify if an address is an active merchant
export const isMerchantVerified = async (provider: ethers.Provider, address: string): Promise<boolean> => {
  const attestation = await getMerchantAttestation(provider, address);
  return attestation !== null && attestation.isActive;
};

// Helper function to get EAS Explorer URL for an attestation
export const getEASExplorerURL = (attestationUID: string): string => {
  return `https://base.easscan.org/attestation/${attestationUID}`;
};

// Example schema ID from tutorial
export const TEST_SCHEMA_ID = "0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9";

// Simplified attestation verification functions matching the tutorial
export async function getAttestationUID(walletAddress: string, schemaID: string) {
  try {
    const attestationUID = await indexerContract.getAttestationUid(walletAddress, schemaID);
    return attestationUID;
  } catch (error) {
    console.error("Error fetching Attestation UID:", error);
    return null;
  }
}

export async function getAttestationData(uid: string) {
  try {
    // Initialize EAS with Base configuration
    const easContract = new EAS(EAS_CONTRACT_ADDRESS);
    easContract.connect(provider);
    
    const attestation = await easContract.getAttestation(uid);
    if (!attestation) {
      console.log('No attestation found for UID:', uid);
      return null;
    }

    // Return the raw attestation data without decoding
    // The decoding will be handled by the specific verification functions
    return {
      uid: attestation.uid,
      schema: attestation.schema,
      time: Number(attestation.time),
      expirationTime: Number(attestation.expirationTime),
      revocationTime: Number(attestation.revocationTime),
      refUID: attestation.refUID,
      recipient: attestation.recipient,
      attester: attestation.attester,
      revocable: attestation.revocable,
      data: attestation.data
    };
  } catch (error) {
    console.error("Error fetching Metadata:", error);
    return null;
  }
}

export async function verifyAttestation(walletAddress: string, schemaID: string) {
  try {
    const uid = await getAttestationUID(walletAddress, schemaID);
    if (!uid) {
      console.log('No attestation UID found for wallet:', walletAddress);
      return null;
    }
    
    const metadata = await getAttestationData(uid);
    if (!metadata) {
      console.log('No attestation data found for UID:', uid);
      return null;
    }

    return {
      isVerified: true,
      attestationData: metadata,
      explorerURL: getEASExplorerURL(uid)
    };
  } catch (error) {
    console.error("Error verifying attestation:", error);
    return null;
  }
} 