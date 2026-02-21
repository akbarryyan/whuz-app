/**
 * POST /api/webhooks/payment
 *
 * Receives Pakasir payment completion webhook.
 *
 * Rules:
 * - Always return 200 OK to the gateway (otherwise gateway will retry indefinitely).
 * - Idempotency is handled inside HandlePakasirWebhookService.
 * - No business logic here.
 */

import { NextResponse } from "next/server";
import { HandlePakasirWebhookService } from "@/src/core/services/payment/handle-pakasir-webhook.service";
import { OrderRepository } from "@/src/infra/db/repositories/order.repository";
import { PakasirAdapter } from "@/src/infra/payment/pakasir/pakasir.adapter";
import { BullMQQueueAdapter } from "@/src/infra/queue/bullmq/queue";

export const dynamic = "force-dynamic";

const webhookService = new HandlePakasirWebhookService(
  new OrderRepository(),
  new PakasirAdapter(),
  new BullMQQueueAdapter()
);

export async function POST(request: Request) {
  let rawBody = "";
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ received: false, error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await webhookService.handle(payload, rawBody);
    console.log("[POST /api/webhooks/payment]", result);
    // Always acknowledge to gateway
    return NextResponse.json({ received: true, action: result.action });
  } catch (err: any) {
    // Log but still return 200 so gateway doesn't retry indefinitely
    console.error("[POST /api/webhooks/payment] Error:", err.message);
    return NextResponse.json({ received: true, error: "Processing error" }, { status: 200 });
  }
}
