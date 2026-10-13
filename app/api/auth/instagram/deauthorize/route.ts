/**
 * Meta Instagram Data Compliance: Deauthorize Callback
 * Called by Meta when a user removes Candei from their Instagram / Facebook settings.
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

    console.log("[Meta Compliance] User deauthorized application:", payload);

    return Response.json({
      status: "DEAUTHORIZED",
      message: "User session deauthorized successfully.",
    }, { status: 200 });
  } catch (err) {
    console.error("[Meta Compliance] Error in deauthorize handler:", err);
    return Response.json({ status: "DEAUTHORIZED" }, { status: 200 });
  }
}

export async function GET() {
  return Response.json({
    status: "OK",
    message: "Deauthorize compliance endpoint active.",
  }, { status: 200 });
}
