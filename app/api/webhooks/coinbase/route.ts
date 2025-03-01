import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.COINBASE_COMMERCE_WEBHOOK_SECRET;
const MAX_TIMESTAMP_AGE = 300000; // 5 minutes in milliseconds

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Get timestamp and signatures from the signature header
    const [timestamp, signatures] = signature.split(',');
    const timestampValue = timestamp.split('=')[1];
    const signaturesValue = signatures.split('=')[1];

    // Create the message to sign
    const message = `${timestampValue}.${payload}`;

    // Compute expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    // Compare signatures using timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signaturesValue),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
}

function validateWebhookTimestamp(signature: string): boolean {
  try {
    // Extract timestamp from signature
    const timestamp = parseInt(signature.split(',')[0].split('=')[1]);
    const now = Date.now();

    // Check if webhook is not older than MAX_TIMESTAMP_AGE
    return (now - timestamp) <= MAX_TIMESTAMP_AGE;
  } catch (error) {
    console.error('Webhook timestamp validation failed:', error);
    return false;
  }
}

async function handleChargeSuccess(event: any) {
  const { code: chargeCode, metadata } = event.data;
  
  try {
    // Log the successful charge
    console.log('Processing successful charge:', chargeCode);

    // Handle physical items
    const physicalItems = metadata.items.filter((item: any) => item.type === 'physical');
    if (physicalItems.length > 0) {
      // Update order status in your database
      await updateOrderStatus(metadata.order_id, 'confirmed');
      
      // Send shipping notification
      await sendShippingNotification(metadata.email, metadata.order_id);
    }

    // Handle NFT items
    const nftItems = metadata.items.filter((item: any) => item.type === 'nft');
    if (nftItems.length > 0 && metadata.buyer_address) {
      // Transfer NFTs to the buyer
      for (const nft of nftItems) {
        await transferNFT(nft, metadata.buyer_address);
      }
    }

    // Send confirmation email
    await sendOrderConfirmation(metadata.email, {
      orderId: metadata.order_id,
      items: metadata.items,
      chargeCode
    });

    console.log('Successfully processed charge:', chargeCode);
  } catch (error) {
    console.error('Error processing successful charge:', error);
    // Important: Don't throw here, we want to return 200 to acknowledge receipt
    // Log to monitoring service for manual investigation
    await logError('charge_success_processing_error', {
      chargeCode,
      error,
      metadata
    });
  }
}

async function handleChargeFailed(event: any) {
  const { code: chargeCode, metadata } = event.data;
  
  try {
    console.log('Processing failed charge:', chargeCode);

    // Update order status
    await updateOrderStatus(metadata.order_id, 'failed');

    // Send failure notification
    await sendFailureNotification(metadata.email, {
      orderId: metadata.order_id,
      chargeCode,
      reason: event.data.failure_reason
    });

    console.log('Successfully processed failed charge:', chargeCode);
  } catch (error) {
    console.error('Error processing failed charge:', error);
    await logError('charge_failure_processing_error', {
      chargeCode,
      error,
      metadata
    });
  }
}

async function handleChargePending(event: any) {
  const { code: chargeCode, metadata } = event.data;
  
  try {
    console.log('Processing pending charge:', chargeCode);

    // Update order status
    await updateOrderStatus(metadata.order_id, 'pending');

    // Send pending notification
    await sendPendingNotification(metadata.email, {
      orderId: metadata.order_id,
      chargeCode
    });

    console.log('Successfully processed pending charge:', chargeCode);
  } catch (error) {
    console.error('Error processing pending charge:', error);
    await logError('charge_pending_processing_error', {
      chargeCode,
      error,
      metadata
    });
  }
}

// Helper functions (implement these based on your needs)
async function updateOrderStatus(orderId: string, status: string) {
  // TODO: Implement order status update in your database
  console.log(`Updating order ${orderId} status to ${status}`);
}

async function sendShippingNotification(email: string, orderId: string) {
  // TODO: Implement shipping notification
  console.log(`Sending shipping notification for order ${orderId} to ${email}`);
}

async function transferNFT(nft: any, buyerAddress: string) {
  // TODO: Implement NFT transfer using ethers.js or web3.js
  console.log(`Transferring NFT ${nft.tokenId} to ${buyerAddress}`);
}

async function sendOrderConfirmation(email: string, orderDetails: any) {
  // TODO: Implement order confirmation email
  console.log(`Sending order confirmation to ${email}`, orderDetails);
}

async function sendFailureNotification(email: string, details: any) {
  // TODO: Implement failure notification
  console.log(`Sending failure notification to ${email}`, details);
}

async function sendPendingNotification(email: string, details: any) {
  // TODO: Implement pending notification
  console.log(`Sending pending notification to ${email}`, details);
}

async function logError(type: string, details: any) {
  // TODO: Implement error logging to your monitoring service
  console.error(`Error of type ${type}:`, details);
}

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const headersList = headers();
    const signature = headersList.get('x-cc-webhook-signature');

    // Verify required headers
    if (!signature) {
      return new NextResponse('Missing signature', { status: 400 });
    }

    if (!WEBHOOK_SECRET) {
      console.error('COINBASE_COMMERCE_WEBHOOK_SECRET is not configured');
      return new NextResponse('Configuration error', { status: 500 });
    }

    // Validate webhook timestamp
    if (!validateWebhookTimestamp(signature)) {
      return new NextResponse('Webhook timestamp expired', { status: 400 });
    }

    // Verify webhook signature
    if (!verifyWebhookSignature(payload, signature, WEBHOOK_SECRET)) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const event = JSON.parse(payload);

    // Handle different webhook events
    switch (event.type) {
      case 'charge:confirmed':
        await handleChargeSuccess(event);
        break;
      case 'charge:failed':
        await handleChargeFailed(event);
        break;
      case 'charge:pending':
        await handleChargePending(event);
        break;
      default:
        console.log('Unhandled webhook event type:', event.type);
    }

    // Always return 200 to acknowledge receipt
    return new NextResponse('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    // Still return 200 to acknowledge receipt, even if processing failed
    return new NextResponse('Webhook received', { status: 200 });
  }
} 