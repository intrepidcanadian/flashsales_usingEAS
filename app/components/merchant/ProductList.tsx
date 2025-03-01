import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  type: 'nft' | 'physical' | 'digital';
  imageUrl?: string;
  status: 'active' | 'sold' | 'inactive';
  createdAt: string;
}

export function ProductList() {
  // Placeholder products - In a real app, these would come from your backend
  const [products] = useState<Product[]>([
    {
      id: '1',
      name: 'Digital Art #123',
      description: 'Beautiful digital artwork',
      price: 0.5,
      category: 'art',
      type: 'nft',
      imageUrl: 'https://placeholder.com/art1.jpg',
      status: 'active',
      createdAt: '2024-03-15'
    },
    {
      id: '2',
      name: 'NFT Collection #456',
      description: 'Limited edition NFT collection',
      price: 1.2,
      category: 'collectibles',
      type: 'nft',
      imageUrl: 'https://placeholder.com/nft1.jpg',
      status: 'sold',
      createdAt: '2024-03-14'
    }
  ]);

  const handleStatusChange = async (productId: string, newStatus: 'active' | 'inactive') => {
    try {
      // In a real app, you would update the product status in your backend
      toast.success(`Product status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Failed to update product status');
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      // In a real app, you would delete the product from your backend
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Your Products</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price (ETH)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Listed Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.imageUrl && (
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={product.imageUrl}
                          alt={product.name}
                        />
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.category}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{product.type}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{product.price}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : product.status === 'sold'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {product.status !== 'sold' && (
                      <button
                        onClick={() => handleStatusChange(
                          product.id,
                          product.status === 'active' ? 'inactive' : 'active'
                        )}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        {product.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 