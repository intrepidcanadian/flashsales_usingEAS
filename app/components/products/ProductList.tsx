'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ImageWithLoading } from '../common/ImageWithLoading';
import { useWishlist } from '../wishlist/WishlistContext';
import { Product } from '@/app/data/products';
import { useCart } from '../cart/CartContext';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { NFTCard } from '../nft/NFTCard';

interface ProductListProps {
  initialProducts: Product[];
  pageSize?: number;
}

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'rating-desc';

export function ProductList({ initialProducts, pageSize = 12 }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('rating-desc');
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const { dispatch: cartDispatch } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Sort products
  const sortProducts = useCallback((products: Product[], sortOption: SortOption) => {
    const sorted = [...products];
    switch (sortOption) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating-desc':
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default:
        return sorted;
    }
  }, []);

  // Load more products
  const loadMore = useCallback(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const newProducts = products.slice(start, end);
    
    if (newProducts.length > 0) {
      setDisplayedProducts(prev => [...prev, ...newProducts]);
      setPage(prev => prev + 1);
    }
    
    setHasMore(end < products.length);
  }, [page, pageSize, products]);

  // Intersection observer for infinite scroll
  const lastProductRef = useCallback((node: HTMLDivElement | null) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [hasMore, loadMore]);

  // Handle sort change
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    const sorted = sortProducts(products, newSort);
    setProducts(sorted);
    setDisplayedProducts(sorted.slice(0, page * pageSize));
  };

  // Initial load
  useEffect(() => {
    const sorted = sortProducts(initialProducts, sortBy);
    setProducts(sorted);
    setDisplayedProducts(sorted.slice(0, pageSize));
  }, [initialProducts, pageSize, sortBy, sortProducts]);

  const handleAddToCart = (product: Product) => {
    cartDispatch({ type: 'ADD_ITEM', payload: { ...product, quantity: 1 } });
  };

  return (
    <div>
      {/* Sorting controls */}
      <div className="mb-6 flex justify-end">
        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as SortOption)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="rating-desc">Top Rated</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
          <option value="name-desc">Name: Z to A</option>
        </select>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {displayedProducts.map((product, index) => {
          const isLast = index === displayedProducts.length - 1;
          const isWishlisted = wishlist.includes(product.id);

          if (product.type === 'nft' && product.contractAddress && product.tokenId) {
            return (
              <NFTCard
                key={product.id}
                contractAddress={product.contractAddress}
                tokenId={product.tokenId}
                price={product.price}
                onAddToCart={() => handleAddToCart(product)}
              />
            );
          }

          return (
            <div
              key={product.id}
              ref={isLast ? lastProductRef : null}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="relative aspect-w-3 aspect-h-2">
                <ImageWithLoading
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48"
                />
                <button
                  onClick={() => isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product.id)}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
                >
                  <Heart
                    className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                  />
                </button>
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
                {/* Rating display */}
                <div className="mt-2 flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (product.rating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    ({product.numReviews || 0} reviews)
                  </span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <p className="text-lg font-medium text-gray-900">
                    {product.type === 'nft'
                      ? `${product.price} ETH`
                      : `$${product.price}`}
                  </p>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading indicator */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}
    </div>
  );
} 