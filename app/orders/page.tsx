'use client';

import { OrderHistory } from '../components/orders/OrderHistory';
import Link from 'next/link';

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
              <nav className="hidden md:flex space-x-4">
                <Link
                  href="/"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Back to Store
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main>
        <OrderHistory />
      </main>
    </div>
  );
} 