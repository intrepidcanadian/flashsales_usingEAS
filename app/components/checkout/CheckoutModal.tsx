'use client';

import { useAccount, useWriteContract, useSimulateContract } from 'wagmi';
import { useState, useEffect } from 'react';
import { useCart } from '../cart/CartContext';
import type { CartItem } from '../cart/CartContext';
import toast from 'react-hot-toast';
import type { ReactNode } from 'react';
import { parseEther } from 'viem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NFT_ABI = [{
  name: 'purchase',
  type: 'function',
  stateMutability: 'payable',
  inputs: [{ name: 'tokenId', type: 'uint256' }],
  outputs: [],
}] as const;

export function CheckoutModal({ isOpen, onClose }: Props) {
  const { state: cart, dispatch } = useCart();
  const { address } = useAccount();
  const [processingItem, setProcessingItem] = useState<string | null>(null);
  const [currentNFT, setCurrentNFT] = useState<CartItem | null>(null);
  const [purchaseQueue, setPurchaseQueue] = useState<CartItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  const { writeContract } = useWriteContract();

  const { data: simulateData, error: simulateError } = useSimulateContract({
    abi: NFT_ABI,
    address: currentNFT?.contractAddress as `0x${string}`,
    functionName: 'purchase',
    args: currentNFT ? [BigInt(currentNFT.tokenId!)] : undefined,
    value: currentNFT ? parseEther(currentNFT.price.toString()) : undefined,
    query: {
      enabled: !!currentNFT && !isProcessingQueue,
    },
  });

  useEffect(() => {
    if (simulateError) {
      toast.error(`Failed to simulate NFT purchase: ${currentNFT?.name}. Please try again.`);
      setProcessingItem(null);
      setCurrentNFT(null);
      if (isProcessingQueue) {
        setPurchaseQueue(prev => prev.slice(1));
      }
    }
  }, [simulateError, currentNFT?.name, isProcessingQueue]);

  useEffect(() => {
    const purchaseNFT = async () => {
      if (!simulateData || !currentNFT) return;

      try {
        await writeContract({
          abi: NFT_ABI,
          address: currentNFT.contractAddress as `0x${string}`,
          functionName: 'purchase',
          args: [BigInt(currentNFT.tokenId!)],
          value: parseEther(currentNFT.price.toString()),
        });

        dispatch({ type: 'REMOVE_ITEM', payload: currentNFT.id });
        toast.success(`Successfully purchased ${currentNFT.name}!`);
      } catch (error) {
        console.error('NFT purchase failed:', error);
        toast.error(`Failed to purchase ${currentNFT.name}. Please try again.`);
      } finally {
        setProcessingItem(null);
        setCurrentNFT(null);
        if (isProcessingQueue) {
          setPurchaseQueue(prev => prev.slice(1));
        }
      }
    };

    if (simulateData && currentNFT) {
      purchaseNFT();
    }
  }, [simulateData, currentNFT, writeContract, dispatch, isProcessingQueue]);

  useEffect(() => {
    if (isProcessingQueue && purchaseQueue.length > 0 && !currentNFT) {
      const nextItem = purchaseQueue[0];
      setProcessingItem(nextItem.id);
      setCurrentNFT(nextItem);
    } else if (isProcessingQueue && purchaseQueue.length === 0) {
      setIsProcessingQueue(false);
      const physicalItems = cart.items.filter(item => item.type === 'physical');
      if (physicalItems.length > 0) {
        handlePhysicalPurchase(physicalItems);
      }
      if (cart.items.length === 0) {
        onClose();
      }
    }
  }, [isProcessingQueue, purchaseQueue, currentNFT, cart.items]);

  const handleNFTPurchase = (item: CartItem) => {
    if (!item.contractAddress || !item.tokenId) return;
    setProcessingItem(item.id);
    setCurrentNFT(item);
  };

  const handlePhysicalPurchase = async (items: CartItem[]) => {
    // Implement your physical item checkout logic here
    toast.success('Physical items checkout - Implementation pending');
  };

  const handleCheckout = () => {
    const nftItems = cart.items.filter(item => item.type === 'nft');
    const physicalItems = cart.items.filter(item => item.type === 'physical');

    if (nftItems.length > 0) {
      setPurchaseQueue(nftItems);
      setIsProcessingQueue(true);
    } else if (physicalItems.length > 0) {
      handlePhysicalPurchase(physicalItems);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="w-screen max-w-md">
            <div className="h-full flex flex-col bg-white shadow-xl">
              <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                  <button
                    onClick={onClose}
                    className="ml-3 h-7 flex items-center"
                  >
                    <span className="sr-only">Close panel</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="mt-8">
                  {cart.items.length === 0 ? (
                    <p className="text-gray-500">Your cart is empty</p>
                  ) : (
                    <div className="flow-root">
                      <ul className="-my-6 divide-y divide-gray-200">
                        {cart.items.map((item) => (
                          <li key={item.id} className="py-6 flex">
                            <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex justify-between">
                                <h4 className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </h4>
                                <p className="ml-4 text-sm font-medium text-gray-900">
                                  {item.type === 'nft'
                                    ? `${item.price} ETH`
                                    : `$${item.price}`}
                                </p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                              {item.type === 'nft' && (
                                <button
                                  onClick={() => handleNFTPurchase(item)}
                                  disabled={processingItem === item.id}
                                  className={`mt-2 px-3 py-1 text-sm font-medium rounded-md 
                                    ${processingItem === item.id ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} 
                                    text-white`}
                                >
                                  {processingItem === item.id ? 'Processing...' : 'Purchase NFT'}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  dispatch({
                                    type: 'REMOVE_ITEM',
                                    payload: item.id,
                                  })
                                }
                                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                              >
                                Remove
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {cart.items.length > 0 && (
                <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <p>
                      {cart.items.some((item) => item.type === 'nft')
                        ? 'Mixed currencies'
                        : `$${cart.total.toFixed(2)}`}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleCheckout}
                      disabled={!!processingItem}
                      className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 ${
                        processingItem ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {processingItem ? 'Processing...' : 'Complete Purchase'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 