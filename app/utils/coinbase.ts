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

export async function createCoinbaseCheckout(items: CartItem[], buyerAddress?: string, testMode: boolean = false) {
  if (!process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY) {
    console.error('Coinbase Commerce API key is missing');
    throw new Error('Coinbase Commerce API key is not configured');
  }

  try {
    // Calculate total for physical items in USD
    const physicalTotal = items
      .filter(item => item.type === 'physical')
      .reduce((sum, item) => sum + (testMode ? 0.01 : item.price) * item.quantity, 0);
    console.log('Physical items total:', physicalTotal);

    // Get NFT items
    const nftItems = items.filter(item => item.type === 'nft');
    console.log('NFT items:', nftItems);
    
    // Use minimal ETH amount for testing
    const nftTotal = nftItems
      .reduce((sum, item) => sum + (testMode ? 0.0000001 : item.price) * item.quantity, 0);
    console.log('NFT total:', nftTotal);
    
    // For testing, use a very low ETH to USD rate
    const ETH_TO_USD = testMode ? 1 : 3000; // In test mode, 1 ETH = 1 USD for simplicity
    const totalInUSD = physicalTotal + (nftTotal * ETH_TO_USD);
    console.log('Total in USD:', totalInUSD);

    // Ensure minimum charge amount (Coinbase minimum is typically 0.01 USD)
    const finalAmount = Math.max(totalInUSD, 0.01).toFixed(2);
    console.log('Final amount:', finalAmount);

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    console.log('Generated order ID:', orderId);

    // Create a descriptive name and description based on items
    const itemNames = items.map(item => `${item.quantity}x ${item.name}`);
    const chargeName = itemNames.length === 1 
      ? itemNames[0] 
      : `${itemNames[0]} and ${itemNames.length - 1} more item${itemNames.length > 2 ? 's' : ''}`;
    console.log('Charge name:', chargeName);

    const description = items.map(item => 
      `${item.quantity}x ${item.name} (${item.type === 'nft' ? 'NFT' : 'Physical'})${
        item.type === 'nft' ? ' - Includes automatic transfer on purchase' : ''
      }`
    ).join('\n');
    console.log('Charge description:', description);

    // Create charge request
    const chargeRequest: CoinbaseChargeRequest = {
      name: testMode ? `[TEST] ${chargeName}` : chargeName,
      description: testMode ? `[TEST MODE] ${description}` : description,
      local_price: {
        amount: finalAmount,
        currency: 'USD'
      },
      pricing_type: 'fixed_price',
      metadata: {
        order_id: orderId,
        items: items,
        buyer_address: buyerAddress,
        testMode
      },
      redirect_url: `${window.location.origin}/orders?order_id=${orderId}`,
      cancel_url: `${window.location.origin}/cart`
    };
    console.log('Charge request:', chargeRequest);

    console.log('Making request to Coinbase Commerce API...');
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'X-CC-Api-Key': process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(chargeRequest)
    });

    console.log('Response status:', response.status);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Coinbase Commerce API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to create Coinbase Commerce charge');
    }

    const charge = await response.json();
    console.log('Charge created successfully:', charge);
    
    // Store charge details in localStorage for webhook verification
    const pendingCharge = {
      chargeId: charge.data.id,
      orderId: orderId,
      items: items,
      timestamp: Date.now(),
      testMode
    };
    console.log('Storing pending charge:', pendingCharge);
    localStorage.setItem('pendingCharge', JSON.stringify(pendingCharge));

    return {
      data: {
        ...charge.data,
        metadata: chargeRequest.metadata,
        hosted_url: charge.data.hosted_url
      }
    };
  } catch (error) {
    console.error('Error creating Coinbase charge:', error);
    throw error;
  }
} 