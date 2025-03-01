import { CartItem } from '../components/cart/CartContext';

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

export async function createCoinbaseCheckout(items: CartItem[], buyerAddress?: string, testMode: boolean = false) {
  if (!process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY) {
    throw new Error('Coinbase Commerce API key is not configured');
  }

  try {
    // Calculate total for physical items in USD
    const physicalTotal = items
      .filter(item => item.type === 'physical')
      .reduce((sum, item) => sum + (testMode ? 0.01 : item.price) * item.quantity, 0);

    // Get NFT items
    const nftItems = items.filter(item => item.type === 'nft');
    
    // Use minimal ETH amount for testing
    const nftTotal = nftItems
      .reduce((sum, item) => sum + (testMode ? 0.0000001 : item.price) * item.quantity, 0);
    
    // For testing, use a very low ETH to USD rate
    const ETH_TO_USD = testMode ? 1 : 3000; // In test mode, 1 ETH = 1 USD for simplicity
    const totalInUSD = physicalTotal + (nftTotal * ETH_TO_USD);

    // Ensure minimum charge amount (Coinbase minimum is typically 0.01 USD)
    const finalAmount = Math.max(totalInUSD, 0.01).toFixed(2);

    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    // Create charge request
    const chargeRequest: CoinbaseChargeRequest = {
      name: testMode ? 'OnchainKit Store Test Purchase' : 'OnchainKit Store Purchase',
      description: `${testMode ? 'Test purchase' : 'Purchase'} of ${items.length} items (${nftItems.length} NFTs, ${items.length - nftItems.length} physical items)`,
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

    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'X-CC-Api-Key': process.env.NEXT_PUBLIC_COINBASE_COMMERCE_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(chargeRequest)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to create Coinbase Commerce charge');
    }

    const charge = await response.json();
    
    // Store charge details in localStorage for webhook verification
    localStorage.setItem('pendingCharge', JSON.stringify({
      chargeId: charge.data.id,
      orderId: orderId,
      items: items,
      timestamp: Date.now(),
      testMode
    }));

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