import '@coinbase/onchainkit/styles.css';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { FlashSale } from './components/flashsale/FlashSale';
import { Inter } from 'next/font/google';
import { RootProvider } from './components/providers/RootProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
  description: 'Generated by `create-onchain`, a Next.js template for OnchainKit',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootProvider>
          <Providers>
            {children}
            <FlashSale />
          </Providers>
        </RootProvider>
      </body>
    </html>
  );
}
