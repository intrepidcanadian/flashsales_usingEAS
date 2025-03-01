'use client';

import { Order, sampleOrders } from '@/app/types';
import { formatDistanceToNow } from 'date-fns';

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        statusStyles[status]
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export function OrderHistory() {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-8">
          Order History
        </h2>
        <div className="space-y-8">
          {sampleOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white border rounded-lg shadow-sm overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{order.id}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Placed{' '}
                      {formatDistanceToNow(new Date(order.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <li key={item.id} className="py-6 flex">
                        <div className="flex-shrink-0 w-24 h-24 rounded-md overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-center object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-900">
                              {item.name}
                            </h4>
                            <p className="ml-4 text-sm font-medium text-gray-900">
                              {item.type === 'nft'
                                ? `${item.price} ETH`
                                : `$${item.price}`}
                            </p>
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                          {item.type === 'nft' && order.transactionHash && (
                            <a
                              href={`https://etherscan.io/tx/${order.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 text-sm text-blue-600 hover:text-blue-500 inline-flex items-center"
                            >
                              View on Etherscan
                              <svg
                                className="ml-1 h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {order.shippingAddress && (
                  <div className="mt-6 border-t border-gray-200 pt-6">
                    <h4 className="text-sm font-medium text-gray-900">
                      Shipping Address
                    </h4>
                    <p className="mt-2 text-sm text-gray-500">
                      {order.shippingAddress.name}
                      <br />
                      {order.shippingAddress.street}
                      <br />
                      {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                      {order.shippingAddress.zip}
                      <br />
                      {order.shippingAddress.country}
                    </p>
                  </div>
                )}

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Total</p>
                    <p>
                      {order.items.some((item) => item.type === 'nft')
                        ? `${order.total} ETH`
                        : `$${order.total.toFixed(2)}`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 