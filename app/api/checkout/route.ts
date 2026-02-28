/**
 * POST /api/checkout
 *
 * Rule: Route handler only parses input, validates with Zod, calls service, returns response.
 * No business logic here.
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import { CreateCheckoutService } from "@/src/core/services/checkout/create-checkout.service";
import { OrderRepository } from "@/src/infra/db/repositories/order.repository";
import { PakasirAdapter } from "@/src/infra/payment/pakasir/pakasir.adapter";
import { BullMQQueueAdapter } from "@/src/infra/queue/bullmq/queue";
import { getSession } from "@/lib/session";
import { getPakasirMode } from "@/lib/site-config";
import {
  ValidationError,
  GuestWalletError,
  InsufficientBalanceError,
  NotFoundError,
} from "@/src/core/domain/errors/domain.errors";

export const dynamic = "force-dynamic";

const CheckoutSchema = z.object({
  productId: z.string().min(1),
  targetNumber: z.string().min(1),
  targetData: z.record(z.string(), z.any()).optional(),
  whatsapp: z.string().max(20).optional(),
  paymentMethod: z.enum(["WALLET", "PAYMENT_GATEWAY"]),
  paymentGatewayMethod: z.string().optional(),
  redirectUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    // ── 1. Parse body ──────────────────────────────────────────────────────
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    // ── 2. Validate ────────────────────────────────────────────────────────
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Validation error", details: parsed.error.flatten() },
        { status: 422 }
      );
    }

    // ── 3. Get user session (null for guest) ───────────────────────────────
    const session = await getSession();
    const userId = session.isLoggedIn && session.userId ? session.userId : null;

    // ── 4. Buat Pakasir adapter sesuai mode (sandbox/production, keduanya call API) ──
    const pakasirMode = await getPakasirMode();
    const paymentGateway = new PakasirAdapter(pakasirMode);

    // ── 5. Call service ────────────────────────────────────────────────────
    const checkoutService = new CreateCheckoutService(
      new OrderRepository(),
      paymentGateway,
      new BullMQQueueAdapter()
    );

    const result = await checkoutService.execute({
      ...parsed.data,
      userId,
    });

    return NextResponse.json(
      { success: true, data: result, mode: pakasirMode },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ValidationError || err instanceof GuestWalletError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
    if (err instanceof NotFoundError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 404 });
    }
    if (err instanceof InsufficientBalanceError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 422 });
    }

    console.error("[POST /api/checkout]", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

