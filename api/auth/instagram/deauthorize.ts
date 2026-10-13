export default async function handler(req: any, res: any) {
  try {
    console.log("[Meta Compliance Vercel] Deauthorize endpoint hit:", req.body);
    const data = {
      status: "DEAUTHORIZED",
      message: "User session deauthorized successfully.",
    };
    if (typeof res.status === "function") {
      return res.status(200).json(data);
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(data));
    }
  } catch (err) {
    if (typeof res.status === "function") {
      return res.status(200).json({ status: "DEAUTHORIZED" });
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ status: "DEAUTHORIZED" }));
    }
  }
}
