import { NextResponse } from "next/server";
import { prisma } from "@/src/infra/db/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/catalog/brands
 * Return distinct brands with product count (public, no auth)
 * Only active products with stock
 */
export async function GET() {
  try {
    const brands = await prisma.product.groupBy({
      by: ["brand"],
      where: {
        isActive: true,
        stock: true,
      },
      _count: { id: true },
      orderBy: { brand: "asc" },
    });

    const data = brands.map((b) => ({
      brand: b.brand,
      slug: b.brand
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
      productCount: b._count.id,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[CATALOG BRANDS ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat data brand." },
      { status: 500 }
    );
  }
}
