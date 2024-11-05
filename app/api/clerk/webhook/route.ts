import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { syncUserWithDatabase } from '@/lib/auth-utils';

async function validateWebhookRequest() {
  const headersList = await headers();
  const svix_id = headersList.get('svix-id');
  const svix_timestamp = headersList.get('svix-timestamp');
  const svix_signature = headersList.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    throw new Error('Missing svix headers');
  }

  return {
    svix_id,
    svix_timestamp,
    svix_signature,
  };
}

export async function POST(req: Request) {
  try {
    // Validate headers
    const { svix_id, svix_timestamp, svix_signature } =
      await validateWebhookRequest();

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Verify webhook
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error verifying webhook', { status: 400 });
    }

    // Process the webhook
    const eventType = evt.type;
    const { id, ...attributes } = evt.data;

    switch (eventType) {
      case 'user.created':
      case 'user.updated':
        await syncUserWithDatabase(id as string, attributes);
        break;

      case 'user.deleted':
        // Handle user deletion if needed
        break;

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      `Webhook error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
      { status: 500 }
    );
  }
}
