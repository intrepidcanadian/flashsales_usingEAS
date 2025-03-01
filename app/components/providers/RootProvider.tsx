'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface RootProviderProps {
  children: ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
} 