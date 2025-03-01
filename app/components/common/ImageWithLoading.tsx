'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithLoadingProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export function ImageWithLoading({ src, alt, className, width, height }: ImageWithLoadingProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-md" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width || 400}
        height={height || 400}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } rounded-md`}
        onLoadingComplete={() => setIsLoading(false)}
      />
    </div>
  );
} 