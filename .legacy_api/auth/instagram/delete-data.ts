import crypto from "crypto";

export default async function handler(req: any, res: any) {
  try {
    const confirmationCode = "candei_del_" + crypto.randomBytes(8).toString("hex");
    console.log("[Meta Compliance Vercel] Data deletion endpoint hit:", req.body);
    const data = {
      url: `https://getcandei.com/deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    };
    if (typeof res.status === "function") {
      return res.status(200).json(data);
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(data));
    }
  } catch (err) {
    const fallbackCode = "candei_del_" + Date.now();
    const data = {
      url: `https://getcandei.com/deletion-status?code=${fallbackCode}`,
      confirmation_code: fallbackCode,
    };
    if (typeof res.status === "function") {
      return res.status(200).json(data);
    } else {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(data));
    }
  }
}
