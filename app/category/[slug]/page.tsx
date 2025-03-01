'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { products, Product } from '@/app/data/products';
import { SearchAndFilter } from '@/app/components/search/SearchAndFilter';
import { useCart } from '@/app/components/cart/CartContext';
import { PlaceholderImage } from '@/app/components/common/PlaceholderImage';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';

const categories = [
  {
    id: '1',
    name: 'NFT Art',
    description: 'Digital art collectibles',
    slug: 'nft-art',
  },
  {
    id: '2',
    name: 'Physical Art',
    description: 'Traditional artwork',
    image: '/images/categories/physical-art.jpg',
    slug: 'physical-art',
  },
  {
    id: '3',
    name: 'Physical Items',
    description: 'Merchandise and collectibles',
    slug: 'physical-items',
  },
];

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { dispatch } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'nft' | 'physical'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(true);

  const category = categories.find(cat => cat.slug === params.slug);
  
  // Get products for this category
  const categoryProducts = products.filter(product => {
    if (params.slug === 'nft-art') return product.type === 'nft';
    if (params.slug === 'physical-art') return product.type === 'physical' && product.tags.includes('art');
    if (params.slug === 'physical-items') return product.type === 'physical' && !product.tags.includes('art');
    return true;
  });

  // Get unique tags from category products
  const availableTags = Array.from(
    new Set(categoryProducts.flatMap((product) => product.tags))
  );

  useEffect(() => {
    let filtered = [...categoryProducts];

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
  }, [categoryProducts, searchTerm, selectedType, priceRange, selectedTags]);

  const addToCart = (product: Product) => {
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

  const getPlaceholderType = (product: Product) => {
    if (product.type === 'nft') return 'nft';
    if (product.tags.includes('art')) return 'physical-art';
    return 'physical-items';
  };

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-100 pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Category not found</h2>
            <p className="mt-2 text-gray-600">The category you're looking for doesn't exist.</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-4 inline-block px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-48 w-48 rounded-lg overflow-hidden bg-gray-200">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <PlaceholderImage
                    type={category.slug === 'nft-art' ? 'nft' : category.slug === 'physical-art' ? 'physical-art' : 'physical-items'}
                    className="h-full w-full"
                  />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
                <p className="mt-1 text-gray-500">{category.description}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Back to Store</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => setIsSearchVisible(!isSearchVisible)}
            className="w-full py-3 flex items-center justify-between text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <span className="flex items-center">
              <span>Search & Filters</span>
              {(searchTerm || selectedType !== 'all' || selectedTags.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 1000) && (
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Filters active
                </span>
              )}
            </span>
            {isSearchVisible ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <div className={`transition-all duration-300 ease-in-out ${isSearchVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="py-4">
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

        {/* Products Grid */}
        <div className="py-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="h-64 bg-gray-200">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PlaceholderImage
                      type={getPlaceholderType(product)}
                      className="w-full h-full"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">{product.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <p className="text-lg font-medium text-gray-900">
                      {product.type === 'nft'
                        ? `${product.price} ETH`
                        : `$${product.price}`}
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 