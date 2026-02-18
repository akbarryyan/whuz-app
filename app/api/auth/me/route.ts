import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/src/infra/db/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ isLoggedIn: false, user: null });
    }

    // Ambil data user + wallet + stats transaksi secara paralel
    const [user, wallet, totalOrders, successOrders] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      }),
      prisma.wallet.findUnique({
        where: { userId: session.userId },
        select: { balance: true },
      }),
      prisma.order.count({
        where: { userId: session.userId },
      }),
      prisma.order.count({
        where: { userId: session.userId, status: "SUCCESS" },
      }),
    ]);

    if (!user || !user.isActive) {
      return NextResponse.json({ isLoggedIn: false, user: null });
    }

    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
      wallet: {
        balance: wallet ? Number(wallet.balance) : 0,
      },
      stats: {
        totalOrders,
        successOrders,
      },
    });
  } catch (error) {
    console.error("[AUTH ME ERROR]", error);
    return NextResponse.json({ isLoggedIn: false, user: null });
  }
}
