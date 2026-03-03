import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { verifySignature } from "./verify-signature.ts";
import { handleSubscriptionCreated } from "./handle-sub-created.ts";
import { handleSubscriptionUpdated } from "./handle-sub-updated.ts";
const WEBHOOK_SECRET = Deno.env.get("LS_WEBHOOK_SIGNING_SECRET");
if (!WEBHOOK_SECRET) {
  throw new Error("LS_WEBHOOK_SIGNING_SECRET environment variable not set.");
}
serve(async (req)=>{
  console.log('invocated')
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", {
        status: 405
      });
    }
    const signature = req.headers.get("X-Signature");
    if (!signature) {
      console.error("Missing X-Signature header");
      return new Response("Missing Signature", {
        status: 401
      });
    }
    const body = await req.text();
    const ok = await verifySignature(signature, body, WEBHOOK_SECRET);
    if (!ok) {
      console.error("Invalid signature");
      return new Response("Invalid signature", {
        status: 403
      });
    }
    const payload = JSON.parse(body);
    const event = payload.meta?.event_name;
    switch(event){
      case "subscription_created":
        await handleSubscriptionCreated(payload);
        break;
      case "subscription_updated":
        await handleSubscriptionUpdated(payload);
        break;
      default:
        console.error("Unhandled event:", event);
        break;
    }
    return new Response("OK", {
      status: 200
    });
  } catch (err) {
    console.error("Unhandled error in webhook handler:", err);
    return new Response("Internal Server Error", {
      status: 500
    });
  }
});
