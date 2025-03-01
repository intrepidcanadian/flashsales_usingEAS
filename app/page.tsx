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
  const [isAutoScrollPaused, setIsAutoScrollPaused] = useState(false);
  const { address } = useAccount();
  const attestation = useAttestation({ walletAddress: address });

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
        const isAtEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth);
        if (isAtEnd) {
          // Reset to start when reaching the end
          container.scrollTo({
            left: 0,
            behavior: 'smooth'
          });
        } else {
          // Scroll by one card width
          container.scrollBy({
            left: 320,
            behavior: 'smooth'
          });
        }
      }
    }, 3000); // Scroll every 3 seconds

    return () => clearInterval(interval);
  }, [searchTerm, isAutoScrollPaused]);

  const addToCart = (product: Product) => {
    // Check attestation for NFT products
    if (product.type === 'nft' && !attestation.isVerified) {
      toast.error('Verification required to purchase NFTs', {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        ...product,
        quantity: 1
      }
    });
    toast.success(`${product.name} added to cart!`, {
      icon: '🛍️',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const handleCheckoutClick = async () => {
    try {
      await handleCheckout(testMode);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout');
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const container = document.getElementById('products-carousel');
    if (container) {
      const scrollAmount = 400; // Adjust this value to control scroll distance
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
    if (product.type === 'nft') return 'nft';
    return 'physical-items';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">OnchainKit Store</h1>
              <nav className="hidden md:flex space-x-4">
                <Link
                  href="/"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/orders"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Orders
                </Link>
              </nav>
            </div>
            
            {/* Right side header items */}
            <div className="flex items-center space-x-4">
              {/* Test Mode Toggle */}
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
              
              {/* Cart Button */}
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
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navigation and Filters */}
          <div className="border-b border-gray-200">
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

          {/* Products Carousel */}
          <div className="py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900">
                {searchTerm ? 'Search Results' : 'Featured Products'}
              </h2>
              {!searchTerm && (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsAutoScrollPaused(!isAutoScrollPaused)}
                    className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-2"
                  >
                    {isAutoScrollPaused ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <span>Resume</span>
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Pause</span>
                      </>
                    )}
                  </button>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => scrollCarousel('left')}
                      className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors duration-200"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <button
                      onClick={() => scrollCarousel('right')}
                      className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors duration-200"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div 
              id="products-carousel"
              className={`
                ${searchTerm ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3' : 'flex overflow-x-auto hide-scrollbar'}
                pb-4 -mx-4 px-4
              `}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
              onMouseEnter={() => setIsAutoScrollPaused(true)}
              onMouseLeave={() => setIsAutoScrollPaused(false)}
            >
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className={`
                    ${searchTerm ? '' : 'flex-none w-80 mr-4'}
                  `}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your criteria.</p>
              </div>
            )}
          </div>

          {/* Add this CSS to hide scrollbar but keep functionality */}
          <style jsx global>{`
            .hide-scrollbar::-webkit-scrollbar {
              display: none;
            }
            .hide-scrollbar {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </div>
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 overflow-hidden z-50">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
              <div className="w-screen max-w-md">
                <div className="h-full flex flex-col bg-white shadow-xl">
                  <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
                    <div className="flex items-start justify-between">
                      <h2 className="text-lg font-medium text-gray-900">
                        Shopping Cart
                      </h2>
                      <button
                        onClick={() => setIsCartOpen(false)}
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
                                <div className="ml-4 flex-1 flex flex-col">
                                  <div>
                                    <div className="flex justify-between text-base font-medium text-gray-900">
                                      <h3>{item.name}</h3>
                                      <p className="ml-4">
                                        {item.type === 'nft'
                                          ? `${item.price} ETH`
                                          : `$${item.price}`}
                                      </p>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">
                                      {item.type}
                                    </p>
                                  </div>
                                  <div className="flex-1 flex items-end justify-between text-sm">
                                    <div className="flex items-center">
                                      <label className="mr-2">Qty</label>
                                      <input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) =>
                                          dispatch({
                                            type: 'UPDATE_QUANTITY',
                                            payload: {
                                              id: item.id,
                                              quantity: parseInt(e.target.value),
                                            },
                                          })
                                        }
                                        className="w-16 rounded-md border-gray-300"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        dispatch({
                                          type: 'REMOVE_ITEM',
                                          payload: item.id,
                                        })
                                      }
                                      className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                      Remove
                                    </button>
                                  </div>
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
                        <p>Subtotal</p>
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
                          onClick={handleCheckoutClick}
                          disabled={cart.isProcessing}
                          className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 ${
                            cart.isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {cart.isProcessing ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              Checkout with Coinbase
                              {testMode && ' (Test Mode)'}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
