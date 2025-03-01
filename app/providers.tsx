'use client';

import { OnchainKitProvider } from '@coinbase/onchainkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { base } from 'wagmi/chains';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { coinbaseWallet } from 'wagmi/connectors';
import type { ReactNode } from 'react';
import { CartProvider } from './components/cart/CartContext';
import { WishlistProvider } from './components/wishlist/WishlistContext';
import { Toaster } from 'react-hot-toast';

const queryClient = new QueryClient();

const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: 'OnchainKit Store',
    }),
  ],
  ssr: true,
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: { mode: 'auto' }
          }}
        >
          <WishlistProvider>
            <CartProvider>
              <Toaster position="top-right" />
              {children}
            </CartProvider>
          </WishlistProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

