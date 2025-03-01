import { useNFT } from '@coinbase/onchainkit/hooks';
import { Transaction } from '@coinbase/onchainkit/transaction';
import { useAccount } from 'wagmi';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface NFTCardProps {
  contractAddress: string;
  tokenId: string;
  price: number;
  onAddToCart: () => void;
}

interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

export function NFTCard({ contractAddress, tokenId, price, onAddToCart }: NFTCardProps) {
  const { address } = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const { data, loading, error } = useNFT({ contractAddress, tokenId, chain: 'base' });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-w-1 aspect-h-1">
        {loading ? (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        ) : error ? (
          <img
            src="/images/nft-placeholder.png"
            alt="NFT placeholder"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={data?.imageUri || '/images/nft-placeholder.png'}
            alt={data?.name || 'NFT'}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="p-4">
        {loading ? (
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        ) : error ? (
          <div className="text-red-500">Error loading NFT data</div>
        ) : (
          <>
            <h3 className="text-lg font-medium text-gray-900">{data?.name}</h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{data?.description}</p>
            {data?.attributes && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(data.attributes as NFTAttribute[]).map((attr, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600"
                  >
                    {attr.trait_type}: {attr.value}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Owner:</span>
            <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
              {loading ? (
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
              ) : data?.ownerAddress === address ? (
                'You'
              ) : (
                data?.ownerAddress || 'Unknown'
              )}
            </span>
          </div>
          <p className="text-lg font-medium text-gray-900">{price} ETH</p>
        </div>

        <button
          onClick={onAddToCart}
          disabled={isLoading || loading}
          className={`mt-4 w-full px-4 py-2 rounded-md text-sm font-medium text-white 
            ${isLoading || loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
            transition-colors duration-200`}
        >
          {isLoading ? 'Processing...' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
} 