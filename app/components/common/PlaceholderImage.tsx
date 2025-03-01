'use client';

interface PlaceholderImageProps {
  type: 'nft' | 'physical-items';
  className?: string;
}

export function PlaceholderImage({ type, className = '' }: PlaceholderImageProps) {
  return (
    <div className={`w-full h-full bg-gray-200 border-2 border-gray-300 ${className}`}>
      <svg
        className="w-full h-full p-4"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ minHeight: '200px' }}
      >
        <rect width="100" height="100" fill="#E2E8F0" />
        <circle cx="50" cy="50" r="30" fill="#94A3B8" className="animate-pulse" />
        <text
          x="50"
          y="85"
          fontFamily="system-ui"
          fontSize="14"
          fill="#475569"
          textAnchor="middle"
          className="font-bold"
        >
          {type === 'nft' ? 'NFT' : 'Product'}
        </text>
      </svg>
    </div>
  );
} 