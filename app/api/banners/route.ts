/**
 * GET /api/banners
 * Public endpoint — returns banner image URLs for the home carousel.
 */

import { NextResponse } from "next/server";
import { getBannerImages } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const images = await getBannerImages();
  return NextResponse.json({ success: true, data: images });
}
