'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/app/data/products';

interface Props {
  onSearch: (searchTerm: string) => void;
  onFilterType: (type: 'all' | 'nft' | 'physical') => void;
  onFilterPrice: (range: [number, number]) => void;
  onFilterTags: (tags: string[]) => void;
  availableTags: string[];
}

export function SearchAndFilter({
  onSearch,
  onFilterType,
  onFilterPrice,
  onFilterTags,
  availableTags,
}: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'nft' | 'physical'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, onSearch]);

  const handleTypeChange = (type: 'all' | 'nft' | 'physical') => {
    setSelectedType(type);
    onFilterType(type);
  };

  const handlePriceChange = (range: [number, number]) => {
    setPriceRange(range);
    onFilterPrice(range);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newTags);
    onFilterTags(newTags);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="space-y-4">
        {/* Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">
            Search Products
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="search"
              id="search"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Search by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Type</label>
          <div className="mt-2 flex space-x-2">
            {['all', 'nft', 'physical'].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type as 'all' | 'nft' | 'physical')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Price Range</label>
          <div className="mt-2 flex items-center space-x-4">
            <input
              type="number"
              min="0"
              value={priceRange[0]}
              onChange={(e) => handlePriceChange([Number(e.target.value), priceRange[1]])}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
            />
            <span>to</span>
            <input
              type="number"
              min="0"
              value={priceRange[1]}
              onChange={(e) => handlePriceChange([priceRange[0], Number(e.target.value)])}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Tags Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 