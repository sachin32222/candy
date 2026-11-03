import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');

  let returnTo = '/dashboard/automations';

  if (stateRaw) {
    try {
      const stateObj = JSON.parse(decodeURIComponent(stateRaw));
      if (stateObj.returnTo) {
        returnTo = stateObj.returnTo;
      }
    } catch (e) {
      console.error('State parse error', e);
    }
  }

  // HTML client-side instant redirect
  const html = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirecting...</title>
    <meta http-equiv="refresh" content="0;url=${returnTo}" />
  </head>
  <body style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;">
    <p>Redirecting to dashboard...</p>
    <script>
      window.location.replace("${returnTo}");
    </script>
  </body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}
