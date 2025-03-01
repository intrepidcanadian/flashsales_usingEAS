'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useCart } from '../cart/CartContext';
import { FlashSale as FlashSaleType, flashSaleProducts } from '@/app/data/products';
import { verifyCoinbaseAttestation } from '@/app/utils/coinbaseAttestation';
import toast from 'react-hot-toast';

const FLASH_SALE_DURATION = 30; // seconds
const FLASH_SALE_INTERVAL = 5; // seconds between sales

export function FlashSale() {
  const [currentSale, setCurrentSale] = useState<FlashSaleType | null>(null);
  const [timeLeft, setTimeLeft] = useState(FLASH_SALE_DURATION);
  const [isVisible, setIsVisible] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const { address } = useAccount();
  const { dispatch } = useCart();

  // Verify Canadian user
  useEffect(() => {
    const verifyUser = async () => {
      if (!address) {
        setIsVerified(false);
        return;
      }

      try {
        const attestation = await verifyCoinbaseAttestation(address);
        setIsVerified(attestation?.region === 'CA');
      } catch (error) {
        console.error('Error verifying user:', error);
        setIsVerified(false);
      }
    };

    verifyUser();
  }, [address]);

  // Handle flash sale rotation
  useEffect(() => {
    if (!isVerified) return;

    const rotateFlashSale = () => {
      const randomIndex = Math.floor(Math.random() * flashSaleProducts.length);
      const newSale = {
        ...flashSaleProducts[randomIndex],
        endTime: Date.now() + FLASH_SALE_DURATION * 1000
      };
      setCurrentSale(newSale);
      setTimeLeft(FLASH_SALE_DURATION);
      setIsVisible(true);
    };

    // Initial flash sale
    rotateFlashSale();

    // Set up interval for rotating flash sales
    const rotationInterval = setInterval(() => {
      rotateFlashSale();
    }, (FLASH_SALE_DURATION + FLASH_SALE_INTERVAL) * 1000);

    return () => clearInterval(rotationInterval);
  }, [isVerified]);

  // Handle countdown
  useEffect(() => {
    if (!isVisible || !currentSale) return;

    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsVisible(false);
          return FLASH_SALE_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    // Clear countdown when component unmounts or sale changes
    return () => clearInterval(countdownInterval);
  }, [isVisible, currentSale]);

  const handlePurchase = () => {
    if (!currentSale) return;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: currentSale.id,
        name: currentSale.name,
        price: currentSale.salePrice,
        quantity: 1,
        type: 'physical',
        image: currentSale.image,
        video: currentSale.video
      }
    });
  };

  if (!isVerified || !isVisible || !currentSale) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 border-2 border-yellow-400">
      <div className="relative">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          className="w-full h-48 object-cover"
        >
          <source src={currentSale.video} type="video/webm" />
        </video>

        {/* Countdown Overlay */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm font-medium">
          {timeLeft}s
        </div>

        {/* Flash Sale Badge */}
        <div className="absolute top-2 left-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center">
          <span className="mr-1">⚡</span> Flash Sale
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900">{currentSale.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{currentSale.description}</p>
        
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-green-600">${currentSale.salePrice}</span>
            <span className="text-sm text-gray-500 line-through">${currentSale.originalPrice}</span>
            <span className="text-sm font-medium text-green-600">
              {Math.round((1 - currentSale.salePrice / currentSale.originalPrice) * 100)}% OFF
            </span>
          </div>
          <button
            onClick={handlePurchase}
            className="px-4 py-2 bg-yellow-400 text-black rounded-md font-medium hover:bg-yellow-500 transition-colors"
          >
            Add to Cart
          </button>
        </div>

        <div className="mt-2 flex items-center text-sm text-gray-500">
          <span className="flex items-center">
            ⭐ {currentSale.rating} ({currentSale.numReviews} reviews)
          </span>
          <span className="mx-2">•</span>
          <span>🇨🇦 CA Exclusive</span>
        </div>
      </div>
    </div>
  );
} 