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

  // Fallback target URL
  const redirectUrl = new URL(returnTo, request.url);

  if (!code) {
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const cleanCode = code.split('#_')[0].trim();
    const clientId = process.env.META_APP_ID || '1090179470293810';
    const clientSecret = process.env.META_APP_SECRET || '472774808ad949133b7748ee5eb65187';
    const redirectUri = 'https://getcandei.com/api/auth/instagram/callback';

    let shortLivedToken = '';
    let longLivedToken = '';
    let dynamicIgUserId = '';
    let dynamicUsername = '';

    // 1. Exchange code for short-lived access token
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

    // 2. Upgrade short-lived access token to long-lived access token
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
        } else {
          const fbLongUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
          fbLongUrl.searchParams.set('grant_type', 'fb_exchange_token');
          fbLongUrl.searchParams.set('client_id', clientId);
          fbLongUrl.searchParams.set('client_secret', clientSecret);
          fbLongUrl.searchParams.set('fb_exchange_token', shortLivedToken);

          const fbLongRes = await fetch(fbLongUrl.toString(), { cache: 'no-store' });
          const fbLongData = await fbLongRes.json().catch(() => null);
          if (fbLongRes.ok && fbLongData?.access_token) {
            longLivedToken = fbLongData.access_token;
          }
        }
      } catch (longErr) {
        console.warn('Long-lived token upgrade warning:', longErr);
      }
    }

    // 3. Resolve Instagram account profile details
    if (longLivedToken) {
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

      if (!dynamicUsername) {
        try {
          const accountsRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?fields=instagram_business_account{id,username,name},access_token&access_token=${encodeURIComponent(
              longLivedToken
            )}`,
            { cache: 'no-store' }
          );
          if (accountsRes.ok) {
            const accountsData = await accountsRes.json().catch(() => null);
            if (accountsData?.data && Array.isArray(accountsData.data)) {
              const pageWithIg = accountsData.data.find(
                (p: any) => p.instagram_business_account?.id
              );
              if (pageWithIg?.instagram_business_account) {
                const igAccount = pageWithIg.instagram_business_account;
                dynamicUsername = igAccount.username || igAccount.name || '';
                dynamicIgUserId = String(igAccount.id);
                if (pageWithIg.access_token) {
                  longLivedToken = pageWithIg.access_token;
                }
              }
            }
          }
        } catch (_) {}
      }
    }

    if (!dynamicIgUserId) {
      dynamicIgUserId = tenantId;
    }
    if (!dynamicUsername) {
      dynamicUsername = `user_${dynamicIgUserId.slice(-4)}`;
    }

    await saveConnection({
      username: dynamicUsername,
      ig_user_id: dynamicIgUserId,
      access_token: longLivedToken || `ig_fallback_${Date.now()}`,
      tenant_id: tenantId,
    });
  } catch (err) {
    console.error('Error during token exchange:', err);
  }

  // Always redirect the user back to the dashboard/automations page
  return NextResponse.redirect(redirectUrl);
}
