import { OrderRepository } from "@/src/infra/db/repositories/order.repository";
import { IQueuePort } from "@/src/core/ports/queue.port";
import { ProviderFactory } from "@/src/infra/providers/provider.factory";
import { ProviderType } from "@/src/core/domain/enums/provider.enum";
import { OrderStatus } from "@/src/core/domain/enums/order.enum";
import { checkAndUpgradeUserTier } from "@/lib/pricing";

/**
 * ExecuteProviderPurchaseService
 *
 * Non-negotiables (constitution §2.2, §2.1):
 * - Must be idempotent: if order already SUCCESS/FAILED, exits early.
 * - If providerRef already set (job retry scenario), skip re-purchase.
 * - Always logs request/response to OrderProviderLog.
 * - On PENDING result: schedules a reconcile job.
 * - On FAILED with wallet: releases the hold.
 */
export class ExecuteProviderPurchaseService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly queue: IQueuePort
  ) {}

  async execute(orderId: string): Promise<void> {
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      console.error(`[Execute] Order ${orderId} not found`);
      return;
    }

    // ── Idempotency guard ─────────────────────────────────────────────────
    if (order.status === OrderStatus.SUCCESS || order.status === OrderStatus.FAILED) {
      console.log(`[Execute] Order ${orderId} already ${order.status}. Skipping.`);
      return;
    }

    // If providerRef already exists this job was already started — reconcile instead
    if (order.providerRef && order.status === OrderStatus.PROCESSING_PROVIDER) {
      console.log(`[Execute] Order ${orderId} already has providerRef. Scheduling reconcile.`);
      await this.queue.enqueueReconcile(orderId, 10_000);
      return;
    }

    // ── Mark PROCESSING_PROVIDER ──────────────────────────────────────────
    await this.orderRepo.updateStatus(orderId, OrderStatus.PROCESSING_PROVIDER);

    // ── Resolve provider ──────────────────────────────────────────────────
    const providerType = (order.provider ?? "DIGIFLAZZ") as ProviderType;
    const provider = ProviderFactory.create(providerType);

    // Build purchase request
    const purchaseReq = {
      productCode: order.product.providerCode,
      target: order.targetNumber,
      additionalData: (order.targetData as Record<string, any>) ?? undefined,
    };

    await this.orderRepo.logProviderAction({
      orderId,
      provider: providerType,
      action: "purchase:request",
      request: purchaseReq,
      success: true,
    });

    // ── Execute purchase ──────────────────────────────────────────────────
    let result;
    try {
      result = await provider.purchase(purchaseReq);
    } catch (err: any) {
      await this.orderRepo.logProviderAction({
        orderId,
        provider: providerType,
        action: "purchase:response",
        response: { error: err.message },
        success: false,
        errorMessage: err.message,
      });

      await this.orderRepo.updateStatus(orderId, OrderStatus.FAILED, {
        notes: `Provider error: ${err.message}`,
      });

      // Release wallet hold if applicable
      if (order.paymentMethod === "WALLET" && order.userId) {
        await this.orderRepo.releaseWalletHold(order.userId, Number(order.amount), orderId);
      }

      return;
    }

    await this.orderRepo.logProviderAction({
      orderId,
      provider: providerType,
      action: "purchase:response",
      response: result.rawResponse,
      success: result.success,
      errorMessage: result.success ? undefined : result.message,
    });

    // ── Update order based on result ──────────────────────────────────────
    if (result.success) {
      await this.orderRepo.updateStatus(orderId, OrderStatus.SUCCESS, {
        serialNumber: result.serialNumber,
        providerRef: result.transactionId,
      });

      // Finalize wallet debit ledger (balance was already reduced by HOLD)
      if (order.paymentMethod === "WALLET" && order.userId) {
        await this.orderRepo.finalizeDebitLedger(order.userId, Number(order.amount), orderId);
      }

      // Auto-upgrade tier based on accumulated success orders
      if (order.userId) {
        await checkAndUpgradeUserTier(order.userId);
      }

      console.log(`[Execute] Order ${orderId} SUCCESS — SN: ${result.serialNumber}`);
    } else if (result.status === "pending") {
      // Provider returned pending → save ref and schedule reconcile
      await this.orderRepo.updateStatus(orderId, OrderStatus.PROCESSING_PROVIDER, {
        providerRef: result.transactionId,
      });

      await this.queue.enqueueReconcile(orderId, 60_000);
      console.log(`[Execute] Order ${orderId} PENDING. Reconcile scheduled.`);
    } else {
      await this.orderRepo.updateStatus(orderId, OrderStatus.FAILED, {
        providerRef: result.transactionId,
        notes: result.message,
      });

      if (order.paymentMethod === "WALLET" && order.userId) {
        await this.orderRepo.releaseWalletHold(order.userId, Number(order.amount), orderId);
      }

      console.log(`[Execute] Order ${orderId} FAILED — ${result.message}`);
    }
  }
}
