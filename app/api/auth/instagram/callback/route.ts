import { NextRequest, NextResponse } from 'next/server';
import { saveConnection } from '@/lib/connection-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');

  let returnTo = '/#/dashboard/automations';
  let tenantId = '17841413170626603';

  if (stateRaw) {
    try {
      const stateObj = JSON.parse(decodeURIComponent(stateRaw));
      if (stateObj.returnTo) {
        returnTo = stateObj.returnTo;
      }
      if (stateObj.tenantId || stateObj.tenant_id) {
        tenantId = String(stateObj.tenantId || stateObj.tenant_id);
      }
    } catch (e) {
      console.error('Failed to parse state param', e);
    }
  }

  // Token exchange attempt (non-blocking)
  if (code) {
    try {
      console.log('Received auth code:', code.slice(0, 10));
      const cleanCode = code.split('#_')[0].trim();
      const clientId = process.env.META_APP_ID || '1090179470293810';
      const clientSecret = process.env.META_APP_SECRET || '472774808ad949133b7748ee5eb65187';
      const redirectUri = 'https://getcandei.com/api/auth/instagram/callback';

      let shortLivedToken = '';
      let longLivedToken = '';
      let dynamicIgUserId = '';
      let dynamicUsername = '';

      const formData = new URLSearchParams();
      formData.append('client_id', clientId);
      formData.append('client_secret', clientSecret);
      formData.append('grant_type', 'authorization_code');
      formData.append('redirect_uri', redirectUri);
      formData.append('code', cleanCode);

      const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        cache: 'no-store',
      });

      let tokenData = await tokenRes.json().catch(() => null);

      if (!tokenRes.ok || !tokenData || tokenData.error_type || tokenData.error) {
        const fbTokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
        fbTokenUrl.searchParams.set('client_id', clientId);
        fbTokenUrl.searchParams.set('client_secret', clientSecret);
        fbTokenUrl.searchParams.set('redirect_uri', redirectUri);
        fbTokenUrl.searchParams.set('code', cleanCode);

        const fbTokenRes = await fetch(fbTokenUrl.toString(), { cache: 'no-store' });
        const fbTokenData = await fbTokenRes.json().catch(() => null);
        if (fbTokenRes.ok && fbTokenData && fbTokenData.access_token) {
          tokenData = fbTokenData;
        }
      }

      if (tokenData && (tokenData.access_token || tokenData.accessToken)) {
        shortLivedToken = tokenData.access_token || tokenData.accessToken;
        if (tokenData.user_id || tokenData.id) {
          dynamicIgUserId = String(tokenData.user_id || tokenData.id);
        }
      }

      if (shortLivedToken) {
        longLivedToken = shortLivedToken;
        try {
          const igLongUrl = new URL('https://graph.instagram.com/access_token');
          igLongUrl.searchParams.set('grant_type', 'ig_exchange_token');
          igLongUrl.searchParams.set('client_secret', clientSecret);
          igLongUrl.searchParams.set('access_token', shortLivedToken);

          const igLongRes = await fetch(igLongUrl.toString(), { cache: 'no-store' });
          const igLongData = await igLongRes.json().catch(() => null);

          if (igLongRes.ok && igLongData?.access_token) {
            longLivedToken = igLongData.access_token;
          }
        } catch (_) {}

        try {
          const meRes = await fetch(
            `https://graph.instagram.com/v21.0/me?fields=id,username,name&access_token=${encodeURIComponent(
              longLivedToken
            )}`,
            { cache: 'no-store' }
          );
          if (meRes.ok) {
            const meData = await meRes.json().catch(() => null);
            if (meData?.username) dynamicUsername = meData.username;
            if (meData?.id) dynamicIgUserId = String(meData.id);
          }
        } catch (_) {}
      }

      if (!dynamicIgUserId) dynamicIgUserId = tenantId;
      if (!dynamicUsername) dynamicUsername = `user_${dynamicIgUserId.slice(-4)}`;

      await saveConnection({
        username: dynamicUsername,
        ig_user_id: dynamicIgUserId,
        access_token: longLivedToken || `ig_fallback_${Date.now()}`,
        tenant_id: tenantId,
      });
    } catch (err) {
      console.error('Token exchange error:', err);
    }
  }

  // Return HTML with immediate JavaScript redirect and meta refresh so client hash routes (/#/...) work reliably
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Connecting Candei...</title>
        <meta http-equiv="refresh" content="0;url=${returnTo}" />
      </head>
      <body style="background:#000;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
        <div style="text-align:center;">
          <h2 style="font-size:18px;margin-bottom:8px;">Connecting your account...</h2>
          <p style="color:#888;font-size:14px;">Redirecting to dashboard...</p>
        </div>
        <script>
          window.location.href = "${returnTo}";
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
