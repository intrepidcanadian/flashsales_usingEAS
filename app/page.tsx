'use client';

import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Avatar, Name, Identity, Address, EthBalance } from '@coinbase/onchainkit/identity';
import { useState, useEffect } from 'react';
import { useCart } from './components/cart/CartContext';
import { SearchAndFilter } from './components/search/SearchAndFilter';
import { products, Product } from './data/products';
import { PlaceholderImage } from './components/common/PlaceholderImage';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAttestation } from './hooks/useAttestation';
import { useAccount } from 'wagmi';
import { AttestationInfo } from './components/common/AttestationInfo';
import { ProductCard } from './components/product/ProductCard';
import { verifyCoinbaseAttestation, VerificationRequirement } from './utils/coinbaseAttestation';
import { FlashSale } from './components/flashsale/FlashSale';
import { CartModal } from './components/cart/CartModal';

export default function Home() {
  const { state: cart, dispatch, handleCheckout } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'nft' | 'physical'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [scrollSpeed, setScrollSpeed] = useState(3000); // Default 3 seconds
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const { address } = useAccount();
  const attestation = useAttestation({ walletAddress: address });
  const [coinbaseVerification, setCoinbaseVerification] = useState<{ region: string; hasTradingAccess: boolean } | null>(null);

  // Get unique tags from all products
  const availableTags = Array.from(
    new Set(products.flatMap((product) => product.tags))
  );

  useEffect(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(term) ||
          product.description.toLowerCase().includes(term)
      );
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter((product) => product.type === selectedType);
    }

    // Apply price filter
    filtered = filtered.filter(
      (product) => product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Apply tags filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((product) =>
        selectedTags.some((tag) => product.tags.includes(tag))
      );
    }

    setFilteredProducts(filtered);
  }, [searchTerm, selectedType, priceRange, selectedTags]);

  // Auto-scroll functionality
  useEffect(() => {
    if (searchTerm || isAutoScrollPaused) return; // Don't auto-scroll during search or when paused

    const interval = setInterval(() => {
      const container = document.getElementById('products-carousel');
      if (container) {
        const isNearEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth - 100);
        if (isNearEnd) {
          // When near the end, quickly jump back to start without animation
          container.style.scrollBehavior = 'auto';
          container.scrollLeft = 0;
          container.style.scrollBehavior = 'smooth';
        } else {
          // Normal smooth scrolling
          container.scrollBy({
            left: 320,
            behavior: 'smooth'
          });
        }
      }
    }, scrollSpeed);

    return () => clearInterval(interval);
  }, [searchTerm, isAutoScrollPaused, scrollSpeed]);

  // Add effect to check Coinbase verification
  useEffect(() => {
    async function checkCoinbaseVerification() {
      if (!address) return;
      const verification = await verifyCoinbaseAttestation(address);
      setCoinbaseVerification(verification);
    }
    checkCoinbaseVerification();
  }, [address]);

  const addToCart = (product: Product) => {
    // Only check verification if required
    if (product.verificationRequired !== VerificationRequirement.NONE) {
      if (!address) {
        toast.error('Please connect your wallet first', {
          icon: '⚠️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        return;
      }

      // Check if verification is still loading
      if (!coinbaseVerification) {
        toast.loading('Checking verification status...', {
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        return;
      }

      // Check region requirement
      if ((product.verificationRequired === VerificationRequirement.REGION || 
          product.verificationRequired === VerificationRequirement.BOTH) &&
          product.region && coinbaseVerification.region !== product.region) {
        toast.error(`This item is only available in ${product.region}`, {
          icon: '⚠️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          duration: 5000,
        });
        return;
      }

      // Check trading requirement
      if ((product.verificationRequired === VerificationRequirement.TRADING || 
          product.verificationRequired === VerificationRequirement.BOTH) &&
          !coinbaseVerification.hasTradingAccess) {
        toast.error('Trading verification required for this item', {
          icon: '⚠️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
          duration: 5000,
        });
        return;
      }
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        ...product,
        quantity: 1
      }
    });
  };

  const handleCheckoutClick = async () => {
    setIsCartOpen(false);
    handleCheckout(testMode);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const container = document.getElementById('products-carousel');
    if (container) {
      const scrollAmount = 400;
      const newPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  };

  const getPlaceholderType = (product: Product) => {
    if (product.type === 'physical') return 'physical-items';
    return 'nft';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Flash Sales Through On-Chain Verification</h1>
              <nav className="hidden md:flex space-x-4">
                <Link
                  href="/"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
              </nav>
            </div>
            
         
            <div className="flex items-center space-x-4">
            
              {process.env.NODE_ENV === 'development' && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Test Mode</span>
                  <button
                    onClick={() => setTestMode(!testMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      testMode ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        testMode ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  {testMode && (
                    <span className="text-xs text-blue-600 font-medium">
                      Using test prices
                    </span>
                  )}
                </div>
              )}
              
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {cart.items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {cart.items.length}
                  </span>
                )}
              </button>

              {/* Wallet */}
              <Wallet>
                <ConnectWallet>
                  <Avatar className="h-6 w-6" />
                  <Name />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <AttestationInfo />
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation and Filters */}
          <div className="border-b border-gray-200 mt-8">
            <div className="bg-gray-50 rounded-lg mb-4">
              <button
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 group"
              >
                <span className="flex items-center space-x-2">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-gray-500 group-hover:text-gray-700" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <span className="font-semibold">Search & Filters</span>
                  {(searchTerm || selectedType !== 'all' || selectedTags.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 1000) && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                      Filters active
                    </span>
                  )}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 group-hover:text-gray-700">
                    {isSearchVisible ? 'Collapse' : 'Expand'}
                  </span>
                  {isSearchVisible ? (
                    <ChevronUp className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                  )}
                </div>
              </button>
              <div className={`transition-all duration-300 ease-in-out ${isSearchVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-4 py-4 bg-white rounded-b-lg border-t border-gray-200">
                  <SearchAndFilter
                    onSearch={setSearchTerm}
                    onFilterType={setSelectedType}
                    onFilterPrice={setPriceRange}
                    onFilterTags={setSelectedTags}
                    availableTags={availableTags}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="relative">
            <div className="flex items-center justify-end mb-4">
              <button
                onClick={() => setIsAutoScrollPaused(!isAutoScrollPaused)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md border ${
                  isAutoScrollPaused 
                    ? 'border-blue-600 text-blue-600 hover:bg-blue-50' 
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {isAutoScrollPaused ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Play</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Pause</span>
                  </>
                )}
              </button>
            </div>

            {/* Carousel Navigation */}
            <button
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 p-2 rounded-full shadow-lg hover:bg-white"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Products Carousel */}
            <div
              id="products-carousel"
              className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory py-4 px-6 space-x-6"
              onMouseEnter={() => setIsAutoScrollPaused(true)}
              onMouseLeave={() => setIsAutoScrollPaused(false)}
            >
            
              {filteredProducts.map((product) => (
                <div key={product.id} className="flex-none w-80 snap-start">
                  <ProductCard product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price.toString(),
                    image: product.image || `https://picsum.photos/400/${300 + parseInt(product.id)}`,
                    sellerAddress: product.sellerAddress,
                    region: product.region,
                    verificationRequired: product.verificationRequired,
                    type: product.type
                  }} onAddToCart={addToCart} />
                </div>
              ))}
             
              {filteredProducts.map((product) => (
                <div key={`${product.id}-duplicate`} className="flex-none w-80 snap-start">
                  <ProductCard product={{
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price.toString(),
                    image: product.image || `https://picsum.photos/400/${300 + parseInt(product.id)}`,
                    sellerAddress: product.sellerAddress,
                    region: product.region,
                    verificationRequired: product.verificationRequired,
                    type: product.type
                  }} onAddToCart={addToCart} />
                </div>
              ))}
            </div>
          </div>

          <style jsx global>{`
            #products-carousel {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            #products-carousel::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      </main>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={handleCheckoutClick}
      />
    </div>
  );
}