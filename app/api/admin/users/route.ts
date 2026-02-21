import { NextResponse } from "next/server";
import { prisma } from "@/src/infra/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/users
 * Daftar user ringkas untuk keperluan admin (test transaksi, dll.)
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        wallet: { select: { balance: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        balance: u.wallet ? Number(u.wallet.balance) : 0,
      })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Gagal mengambil data user" }, { status: 500 });
  }
}
