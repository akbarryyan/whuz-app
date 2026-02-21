import { NextResponse } from "next/server";
import { prisma } from "@/src/infra/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/transactions
 * Get all transactions/orders with filters and stats
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse filters
    const status = searchParams.get("status");
    const paymentMethod = searchParams.get("paymentMethod");
    const userType = searchParams.get("userType"); // guest or member
    const search = searchParams.get("search");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build where clause
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (userType === "guest") {
      where.userId = null;
    } else if (userType === "member") {
      where.userId = { not: null };
    }

    if (search) {
      where.OR = [
        { orderCode: { contains: search } },
        { targetNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { user: { phone: { contains: search } } },
      ];
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo);
      }
    }

    // Get orders
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            category: true,
            brand: true,
            provider: true,
          },
        },
        paymentInvoice: {
          select: {
            id: true,
            invoiceId: true,
            gatewayName: true,
            status: true,
            paidAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Convert Decimal to number
    const ordersData = orders.map((order) => ({
      id: order.id,
      orderCode: order.orderCode,
      userId: order.userId,
      user: order.user,
      product: order.product,
      targetNumber: order.targetNumber,
      targetData: order.targetData,
      amount: Number(order.amount),
      status: order.status,
      paymentMethod: order.paymentMethod,
      serialNumber: order.serialNumber,
      providerRef: order.providerRef,
      notes: order.notes,
      paymentInvoice: order.paymentInvoice,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }));

    // Calculate stats
    const stats = {
      total: ordersData.length,
      success: ordersData.filter((o) => o.status === "SUCCESS").length,
      failed: ordersData.filter((o) => o.status === "FAILED").length,
      pending: ordersData.filter((o) => 
        ["CREATED", "WAITING_PAYMENT", "PAID", "PROCESSING_PROVIDER"].includes(o.status)
      ).length,
      totalRevenue: ordersData
        .filter((o) => o.status === "SUCCESS")
        .reduce((sum, o) => sum + o.amount, 0),
      byPaymentMethod: {
        wallet: ordersData.filter((o) => o.paymentMethod === "WALLET").length,
        gateway: ordersData.filter((o) => o.paymentMethod === "PAYMENT_GATEWAY").length,
      },
      byUserType: {
        guest: ordersData.filter((o) => !o.userId).length,
        member: ordersData.filter((o) => o.userId).length,
      },
    };

    return NextResponse.json({
      success: true,
      data: ordersData,
      stats,
    });
  } catch (error) {
    console.error("Failed to get transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
      },
      { status: 500 }
    );
  }
}
