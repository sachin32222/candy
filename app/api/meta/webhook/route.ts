import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'candei_secret_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('--- META WEBHOOK EVENT RECEIVED ---', JSON.stringify(body, null, 2));

    if (body.object === 'instagram' || body.object === 'page') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];

      // Detect comment changes
      if (changes?.field === 'comments') {
        const commentData = changes.value;
        const commentId = commentData?.id;
        const commentText = (commentData?.text || '').toUpperCase();
        const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

        // Auto trigger DM for keywords like PRICE, BOOK, INFO
        if (commentId && PAGE_ACCESS_TOKEN) {
          try {
            await fetch(`https://graph.facebook.com/v21.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipient: { comment_id: commentId },
                message: {
                  text: `Hey! Thanks for your comment "${commentData?.text}". Candei automation starts at Rs 999/mo. Explore more here: https://www.getcandei.com`
                }
              })
            });
            console.log(`Auto-DM triggered successfully for comment ${commentId}`);
          } catch (apiErr) {
            console.error('Error dispatching Instagram DM:', apiErr);
          }
        }
      }

      return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  } catch (error) {
    console.error('Webhook POST Handler Error:', error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
