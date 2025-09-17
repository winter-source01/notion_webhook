const crypto = require("crypto");

exports.handler = async (event) => {
  const secret = process.env.NOTION_WEBHOOK_SECRET;

  const signature = event.headers["notion-webhook-signature"];
  const timestamp = event.headers["notion-webhook-timestamp"];
  const body = event.body;

  if (!signature || !timestamp || !secret) {
    return { statusCode: 400, body: "Missing headers or secret" };
  }

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${timestamp}.${body}`);
  const digest = hmac.digest("hex");

  if (digest !== signature) {
    return { statusCode: 401, body: "Invalid signature" };
  }

  console.log("Received Notion webhook:", body);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Webhook processed successfully" }),
  };
};
