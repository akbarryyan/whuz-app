import crypto from "crypto";
import { prisma } from "@/src/infra/db/prisma";
import { OrderRepository } from "@/src/infra/db/repositories/order.repository";
import { IPaymentGatewayPort } from "@/src/core/ports/payment-gateway.port";
import { IQueuePort } from "@/src/core/ports/queue.port";
import { OrderStatus, PaymentMethod } from "@/src/core/domain/enums/order.enum";
import {
  ValidationError,
  NotFoundError,
  GuestWalletError,
  InsufficientBalanceError,
} from "@/src/core/domain/errors/domain.errors";

export interface CheckoutInput {
  productId: string;
  targetNumber: string;            // phone / game ID / etc.
  targetData?: Record<string, any>; // zone, server, etc.
  paymentMethod: "WALLET" | "PAYMENT_GATEWAY";
  paymentGatewayMethod?: string;   // QRIS, VA_BCA, etc. (PG only)
  redirectUrl?: string;            // PG redirect after payment
  /** Authenticated user id — null for guest */
  userId?: string | null;
}

export interface CheckoutResult {
  orderCode: string;
  status: string;
  amount: number;
  paymentUrl?: string;
  /** Only returned for guest (never stored in DB) */
  viewToken?: string;
  invoiceId?: string;
}

/**
 * CreateCheckoutService
 *
 * Rules (constitution):
 * - Guest can only use PAYMENT_GATEWAY.
 * - Provider purchase is NEVER executed inside this request (enqueued only).
 * - view_token raw value returned to guest but NEVER stored; only hash stored.
 * - Pricing snapshot (basePrice, markup, fee, amount) frozen at creation time.
 */
export class CreateCheckoutService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly paymentGateway: IPaymentGatewayPort,
    private readonly queue: IQueuePort
  ) {}

  async execute(input: CheckoutInput): Promise<CheckoutResult> {
    // ── 1. Validate input ──────────────────────────────────────────────────
    if (!input.productId) throw new ValidationError("productId is required");
    if (!input.targetNumber) throw new ValidationError("targetNumber is required");
    if (!["WALLET", "PAYMENT_GATEWAY"].includes(input.paymentMethod)) {
      throw new ValidationError("Invalid paymentMethod");
    }

    // Guest cannot use wallet
    if (!input.userId && input.paymentMethod === "WALLET") {
      throw new GuestWalletError();
    }

    // ── 2. Fetch & validate product ────────────────────────────────────────
    const product = await prisma.product.findUnique({
      where: { id: input.productId },
    });

    if (!product) throw new NotFoundError("Product");
    if (!product.isActive) throw new ValidationError("Product is not active");
    if (!product.stock) throw new ValidationError("Product is out of stock");

    // ── 3. Compute pricing snapshot ────────────────────────────────────────
    const basePrice = Number(product.providerPrice);
    const markup = Number(product.margin);
    const fee = 0; // Gateway fee added after we know method — update after PG call
    const amount = basePrice + markup; // Customer pays: basePrice + markup (fee added below)

    // ── 4. Generate order code ─────────────────────────────────────────────
    const orderCode = this.generateOrderCode();

    // ── 5. Guest token ─────────────────────────────────────────────────────
    let viewToken: string | undefined;
    let viewTokenHash: string | undefined;

    if (!input.userId) {
      viewToken = crypto.randomBytes(32).toString("hex");
      viewTokenHash = crypto.createHash("sha256").update(viewToken).digest("hex");
    }

    // ── 6. Wallet quick-read balance check (before order creation) ─────────
    if (input.paymentMethod === PaymentMethod.WALLET) {
      const wallet = await this.orderRepo.getWalletByUserId(input.userId!);
      if (!wallet || Number(wallet.balance) < amount) {
        throw new InsufficientBalanceError();
      }
    }

    // ── 7. Create order ────────────────────────────────────────────────────
    const order = await this.orderRepo.create({
      orderCode,
      userId: input.userId ?? undefined,
      productId: product.id,
      provider: product.provider,
      targetNumber: input.targetNumber,
      targetData: input.targetData,
      basePrice,
      markup,
      fee,
      amount,
      status:
        input.paymentMethod === PaymentMethod.WALLET
          ? OrderStatus.CREATED
          : OrderStatus.WAITING_PAYMENT,
      paymentMethod: input.paymentMethod,
      viewTokenHash,
    });

    // ── 8. Wallet: actual HOLD + enqueue ────────────────────────────────────
    if (input.paymentMethod === PaymentMethod.WALLET) {
      const holdResult = await this.orderRepo.holdWalletBalance(
        input.userId!,
        amount,
        order.id
      );

      if (holdResult === null) {
        // Race condition — release and fail
        await this.orderRepo.updateStatus(order.id, OrderStatus.FAILED, {
          notes: "Insufficient balance at hold time",
        });
        throw new InsufficientBalanceError();
      }

      // Wallet orders go straight to queue
      await this.orderRepo.updateStatus(order.id, OrderStatus.PAID);
      await this.queue.enqueueProviderPurchase(order.id);

      return {
        orderCode,
        status: OrderStatus.PAID,
        amount,
        viewToken,
      };
    }

    // ── 9. Payment Gateway path ────────────────────────────────────────────
    const pgResult = await this.paymentGateway.createPayment({
      orderId: orderCode,
      amount,
      method: input.paymentGatewayMethod,
      redirectUrl: input.redirectUrl,
      description: `${product.name} — ${input.targetNumber}`,
    });

    // Update order fee with actual gateway fee
    const totalWithFee = pgResult.amount + pgResult.fee;
    await prisma.order.update({
      where: { id: order.id },
      data: {
        fee: pgResult.fee,
        amount: totalWithFee,
      },
    });

    // Create payment invoice
    await this.orderRepo.createInvoice({
      orderId: order.id,
      gatewayName: "PAKASIR",
      invoiceId: pgResult.invoiceId,
      amount: pgResult.amount,
      fee: pgResult.fee,
      totalPayment: pgResult.totalPayment,
      method: pgResult.method,
      paymentNumber: pgResult.paymentNumber,
      paymentUrl: pgResult.paymentUrl,
      expiredAt: pgResult.expiredAt,
    });

    return {
      orderCode,
      status: OrderStatus.WAITING_PAYMENT,
      amount: totalWithFee,
      paymentUrl: pgResult.paymentUrl,
      viewToken,
      invoiceId: pgResult.invoiceId,
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private generateOrderCode(): string {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const rand = crypto.randomBytes(3).toString("hex").toUpperCase();
    return `WP-${yy}${mm}${dd}-${rand}`;
  }
}
