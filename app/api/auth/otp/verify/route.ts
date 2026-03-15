import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/src/infra/db/prisma";
import { normalizePhone, isValidPhone } from "@/lib/fonnte";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code, purpose, name } = body;

    // --- Validasi input ---
    if (!phone || !code || !purpose) {
      return NextResponse.json(
        { success: false, message: "Data tidak lengkap." },
        { status: 400 }
      );
    }

    if (!["LOGIN", "REGISTER"].includes(purpose)) {
      return NextResponse.json(
        { success: false, message: "Tujuan tidak valid." },
        { status: 400 }
      );
    }

    if (purpose === "REGISTER" && (!name || typeof name !== "string" || name.trim().length < 2)) {
      return NextResponse.json(
        { success: false, message: "Nama minimal 2 karakter." },
        { status: 400 }
      );
    }

    if (typeof code !== "string" || code.length !== 6 || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: "Kode OTP harus 6 digit angka." },
        { status: 400 }
      );
    }

    // --- Normalisasi nomor ---
    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      return NextResponse.json(
        { success: false, message: "Format nomor WhatsApp tidak valid." },
        { status: 400 }
      );
    }

    // --- Cari OTP terbaru yang belum diverifikasi ---
    const otp = await prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        purpose,
        verified: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode OTP sudah expired atau tidak ditemukan. Kirim ulang OTP.",
        },
        { status: 400 }
      );
    }

    // --- Cek batas percobaan ---
    if (otp.attempts >= 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Terlalu banyak percobaan salah. Kirim OTP baru.",
        },
        { status: 429 }
      );
    }

    // --- Cocokkan kode OTP ---
    if (otp.code !== code) {
      await prisma.otpCode.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });

      const remaining = 4 - otp.attempts;
      return NextResponse.json(
        {
          success: false,
          message: `Kode OTP salah. ${remaining > 0 ? `Sisa ${remaining} percobaan.` : "Kirim OTP baru."}`,
        },
        { status: 401 }
      );
    }

    // --- OTP valid! Tandai sebagai verified ---
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let user: any;

    if (purpose === "LOGIN") {
      // --- Login: cari user berdasarkan phone ---
      user = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { success: false, message: "Nomor WhatsApp belum terdaftar." },
          { status: 401 }
        );
      }

      if (!user.isActive) {
        return NextResponse.json(
          { success: false, message: "Akun dinonaktifkan. Hubungi admin." },
          { status: 403 }
        );
      }
    } else {
      // --- Register: buat user baru ---
      // Double-check nomor belum terdaftar
      const existing = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
        select: { id: true },
      });

      if (existing) {
        return NextResponse.json(
          { success: false, message: "Nomor WhatsApp sudah terdaftar. Silakan login." },
          { status: 409 }
        );
      }

      user = await prisma.user.create({
        data: {
          name: name.trim(),
          phone: normalizedPhone,
          role: "MEMBER",
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          phone: true,
          name: true,
          role: true,
        },
      });
    }

    // --- Set session (auto-login) ---
    const session = await getSession();
    session.isLoggedIn = true;
    session.userId = user.id;
    session.email = user.email ?? "";
    session.phone = user.phone ?? "";
    session.name = user.name ?? "";
    session.role = user.role;
    await session.save();

    return NextResponse.json({
      success: true,
      message:
        purpose === "LOGIN"
          ? "Login berhasil! Selamat datang kembali."
          : "Akun berhasil dibuat! Selamat datang di Whuzpay.",
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[OTP VERIFY ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 }
    );
  }
}
