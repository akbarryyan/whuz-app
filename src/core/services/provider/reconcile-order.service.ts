import { OrderRepository } from "@/src/infra/db/repositories/order.repository";
import { IQueuePort } from "@/src/core/ports/queue.port";
import { ProviderFactory } from "@/src/infra/providers/provider.factory";
import { ProviderType } from "@/src/core/domain/enums/provider.enum";
import { OrderStatus } from "@/src/core/domain/enums/order.enum";

/**
 * ReconcileOrderService
 *
 * Used by:
 *  - Worker job RECONCILE_ORDER (scheduled after PENDING provider response)
 *  - Admin "Reconcile" button via POST /api/admin/transactions/:id/reconcile
 *  - Optional cron job
 *
 * Checks current provider status and transitions order accordingly.
 */
export class ReconcileOrderService {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly queue: IQueuePort
  ) {}

  async reconcile(orderId: string): Promise<{ status: string; message: string }> {
    const order = await this.orderRepo.findById(orderId);

    if (!order) {
      return { status: "error", message: `Order ${orderId} not found` };
    }

    // Only reconcile orders that are still in flight
    if (
      order.status !== OrderStatus.PROCESSING_PROVIDER &&
      order.status !== OrderStatus.PAID
    ) {
      return { status: "skip", message: `Order already in terminal state: ${order.status}` };
    }

    const providerType = (order.provider ?? "DIGIFLAZZ") as ProviderType;
    const provider = ProviderFactory.create(providerType);

    // The provider port's checkStatus method doesn't exist in current port definition.
    // We re-use purchase() in idempotent fashion only if providerRef is missing.
    // For mock/real providers that support status check, call provider.purchase
    // with idempotency (provider won't double-charge if ref exists).

    // If no providerRef yet → re-enqueue execute
    if (!order.providerRef) {
      await this.queue.enqueueProviderPurchase(orderId, 0);
      return { status: "requeued", message: "No providerRef — re-enqueued execute job" };
    }

    // Log reconcile attempt
    await this.orderRepo.logProviderAction({
      orderId,
      provider: providerType,
      action: "reconcile:checkStatus",
      request: { providerRef: order.providerRef },
      success: true,
    });

    // Call provider.checkStatus — no re-purchase, read-only status query
    let checkResult;
    try {
      checkResult = await provider.checkStatus(order.providerRef);
    } catch (err: any) {
      console.error(`[Reconcile] checkStatus failed for order ${orderId}:`, err.message);
      await this.queue.enqueueReconcile(orderId, 5 * 60 * 1000);
      return { status: "error", message: `checkStatus error: ${err.message}` };
    }

    await this.orderRepo.logProviderAction({
      orderId,
      provider: providerType,
      action: "reconcile:response",
      response: checkResult.rawResponse,
      success: checkResult.success,
    });

    if (checkResult.status === "success") {
      await this.orderRepo.updateStatus(orderId, OrderStatus.SUCCESS, {
        serialNumber: checkResult.serialNumber,
        providerRef: checkResult.transactionId,
      });

      if (order.paymentMethod === "WALLET" && order.userId) {
        await this.orderRepo.finalizeDebitLedger(order.userId, Number(order.amount), orderId);
      }

      console.log(`[Reconcile] Order ${orderId} → SUCCESS. SN: ${checkResult.serialNumber}`);
      return { status: "success", message: "Order reconciled to SUCCESS" };

    } else if (checkResult.status === "failed") {
      await this.orderRepo.updateStatus(orderId, OrderStatus.FAILED, {
        notes: `Reconcile: provider FAILED — ${checkResult.message}`,
      });

      if (order.paymentMethod === "WALLET" && order.userId) {
        await this.orderRepo.releaseWalletHold(order.userId, Number(order.amount), orderId);
      }

      console.log(`[Reconcile] Order ${orderId} → FAILED.`);
      return { status: "failed", message: "Order reconciled to FAILED" };

    } else {
      // Still pending — schedule another check in 5 minutes
      await this.queue.enqueueReconcile(orderId, 5 * 60 * 1000);
      console.log(`[Reconcile] Order ${orderId} still PENDING. Re-scheduled in 5 min.`);
      return { status: "pending", message: "Still pending — reconcile re-scheduled in 5 minutes" };
    }
  }

  /** Bulk reconcile all stale orders (called by admin or cron) */
  async reconcileStaleOrders(): Promise<{ processed: number; errors: number }> {
    const staleOrders = await this.orderRepo.findPendingProviderOrders(5);

    let processed = 0;
    let errors = 0;

    for (const order of staleOrders) {
      try {
        await this.reconcile(order.id);
        processed++;
      } catch (err) {
        console.error(`[Reconcile] Failed for order ${order.id}:`, err);
        errors++;
      }
    }

    return { processed, errors };
  }
}
