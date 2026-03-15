import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/infra/db/prisma";
import {
  sendWhatsAppMessage,
  generateOTP,
  normalizePhone,
  isValidPhone,
} from "@/lib/fonnte";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, purpose } = body;

    // --- Validasi input ---
    if (!phone || !purpose) {
      return NextResponse.json(
        { success: false, message: "Nomor WhatsApp dan tujuan wajib diisi." },
        { status: 400 }
      );
    }

    if (!["LOGIN", "REGISTER"].includes(purpose)) {
      return NextResponse.json(
        { success: false, message: "Tujuan tidak valid." },
        { status: 400 }
      );
    }

    // --- Normalisasi & validasi nomor ---
    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      return NextResponse.json(
        { success: false, message: "Format nomor WhatsApp tidak valid. Gunakan format 08xxxxxxxxx." },
        { status: 400 }
      );
    }

    // --- Rate limit: max 5 OTP per nomor per jam ---
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.otpCode.count({
      where: {
        phone: normalizedPhone,
        createdAt: { gte: oneHourAgo },
      },
    });

    if (recentCount >= 5) {
      return NextResponse.json(
        { success: false, message: "Terlalu banyak percobaan. Coba lagi dalam 1 jam." },
        { status: 429 }
      );
    }

    // --- Cooldown: minimal 60 detik antar OTP ---
    const lastOtp = await prisma.otpCode.findFirst({
      where: { phone: normalizedPhone },
      orderBy: { createdAt: "desc" },
    });

    if (lastOtp && Date.now() - lastOtp.createdAt.getTime() < 60000) {
      const remaining = Math.ceil(
        (60000 - (Date.now() - lastOtp.createdAt.getTime())) / 1000
      );
      return NextResponse.json(
        {
          success: false,
          message: `Tunggu ${remaining} detik sebelum mengirim OTP baru.`,
        },
        { status: 429 }
      );
    }

    // --- Cek berdasarkan purpose ---
    if (purpose === "LOGIN") {
      const user = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
        select: { id: true, isActive: true },
      });

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "Nomor WhatsApp belum terdaftar. Silakan daftar terlebih dahulu.",
          },
          { status: 404 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, message: "Akun dinonaktifkan. Hubungi admin." },
          { status: 403 }
        );
      }
    } else {
      // REGISTER — pastikan nomor belum terdaftar
      const existing = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json(
          {
            success: false,
            message: "Nomor WhatsApp sudah terdaftar. Silakan login.",
          },
          { status: 409 }
        );
      }
    }

    // --- Generate & simpan OTP ---
    const code = generateOTP();

    await prisma.otpCode.create({
      data: {
        phone: normalizedPhone,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // expired 5 menit
      },
    });

    // --- Kirim via Fonnte ---
    const actionLabel = purpose === "LOGIN" ? "masuk" : "mendaftar";
    const message = `*[Whuzpay]* Kode OTP Anda untuk ${actionLabel}:\n\n*${code}*\n\nJangan bagikan kode ini kepada siapapun.\nKode berlaku 5 menit.`;

    const result = await sendWhatsAppMessage(normalizedPhone, message);

    if (!result.success) {
      console.error("[OTP SEND] Fonnte gagal:", result.detail);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengirim OTP. Coba lagi nanti.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Kode OTP berhasil dikirim ke WhatsApp Anda.",
    });
  } catch (error) {
    console.error("[OTP SEND ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 }
    );
  }
}
