import { CartItem } from '../components/cart/CartContext';

interface CoinbaseProduct {
  id: string;
  name: string;
  description: string;
  price: {
    amount: string;
    currency: string;
  };
  type: 'physical' | 'nft';
  image_url?: string;
}

interface CoinbaseChargeRequest {
  name: string;
  description: string;
  local_price: {
    amount: string;
    currency: string;
  };
  pricing_type: 'fixed_price';
  metadata: {
    order_id: string;
    items: CartItem[];
    buyer_address?: string;
    testMode?: boolean;
  };
  redirect_url?: string;
  cancel_url?: string;
}

export async function createCoinbaseProduct(product: {
  name: string;
  description: string;
  price: number;
  type: 'physical' | 'nft';
  image_url?: string;
}) {
  if (!process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY) {
    throw new Error('Coinbase Commerce API key is not configured');
  }

  try {
    const response = await fetch('https://api.commerce.coinbase.com/products', {
      method: 'POST',
      headers: {
        'X-CC-Api-Key': process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        name: product.name,
        description: product.description,
        price: {
          amount: product.price.toString(),
          currency: 'USD'
        },
        type: product.type,
        ...(product.image_url && { image_url: product.image_url })
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create Coinbase Commerce product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating Coinbase product:', error);
    throw error;
  }
}

export async function getCoinbaseProduct(productId: string) {
  if (!process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY) {
    throw new Error('Coinbase Commerce API key is not configured');
  }

  try {
    const response = await fetch(`https://api.commerce.coinbase.com/products/${productId}`, {
      headers: {
        'X-CC-Api-Key': process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch Coinbase Commerce product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Coinbase product:', error);
    throw error;
  }
}

export async function createCoinbaseCheckout(
  items: CartItem[], 
  buyerAddress?: string, 
  testMode: boolean = false,
  orderId?: string
) {
  if (!process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY) {
    throw new Error('Coinbase Commerce API key is not configured');
  }

  try {
    // Calculate total amount with clear test mode pricing
    const totalAmount = items.reduce((sum, item) => {
      const itemPrice = testMode
        ? item.type === 'nft' 
          ? 0.01 // Test mode NFT price: $0.01
          : 0.10 // Test mode physical item price: $0.10
        : item.price; // Regular price for non-test mode
      
      return sum + (itemPrice * item.quantity);
    }, 0).toFixed(2);

    console.log('Checkout details:', {
      items: items.map(item => ({
        name: item.name,
        type: item.type,
        quantity: item.quantity,
        unitPrice: testMode
          ? item.type === 'nft' ? 0.01 : 0.10
          : item.price,
      })),
      totalAmount,
      testMode
    });

    // Create charge request
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY,
        'X-CC-Version': '2018-03-22'
      },
      body: JSON.stringify({
        name: testMode ? '[TEST] OnchainKit Purchase' : 'OnchainKit Purchase',
        description: items.map(item => 
          `${item.quantity}x ${item.name} (${item.type}) @ $${testMode 
            ? (item.type === 'nft' ? '0.01' : '0.10') 
            : item.price} each`
        ).join(', '),
        pricing_type: 'fixed_price',
        local_price: {
          amount: totalAmount,
          currency: 'USD'
        },
        metadata: {
          order_id: orderId,
          buyer_address: buyerAddress,
          test_mode: testMode,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            type: item.type,
            unit_price: testMode
              ? item.type === 'nft' ? 0.01 : 0.10
              : item.price
          }))
        },
        redirect_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/orders/${orderId}`,
        cancel_url: `${typeof window !== 'undefined' ? window.location.origin : ''}/cart`
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Coinbase API error:', error);
      throw new Error(`Error creating Coinbase charge: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Coinbase checkout created:', data);
    return data;
  } catch (error) {
    console.error('Error creating Coinbase checkout:', error);
    throw error;
  }
} 