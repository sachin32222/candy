import crypto from "crypto";

/**
 * Meta Instagram Data Compliance: Data Deletion Callback
 * Called by Meta when a user requests deletion of their data.
 * Must return a JSON with a URL and confirmation code.
 */

export async function POST(request: Request) {
  try {
    let payload = {};
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else {
      const text = await request.text();
      payload = { raw: text };
    }

    const confirmationCode = "candei_del_" + crypto.randomBytes(8).toString("hex");
    console.log("[Meta Compliance] Data deletion requested:", { payload, confirmationCode });

    return Response.json({
      url: `https://getcandei.com/deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    }, { status: 200 });
  } catch (err) {
    console.error("[Meta Compliance] Error in delete-data handler:", err);
    const fallbackCode = "candei_del_" + Date.now();
    return Response.json({
      url: `https://getcandei.com/deletion-status?code=${fallbackCode}`,
      confirmation_code: fallbackCode,
    }, { status: 200 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code") || ("candei_del_" + Date.now());

  return Response.json({
    url: `https://getcandei.com/deletion-status?code=${code}`,
    confirmation_code: code,
  }, { status: 200 });
}
