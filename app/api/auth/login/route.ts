import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";
import { prisma } from "@/src/infra/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // --- Validasi input ---
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Format email tidak valid." },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    // --- Cari user di database ---
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
        isActive: true,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: "Akun Anda dinonaktifkan. Hubungi admin." },
        { status: 403 }
      );
    }

    // --- Verifikasi password ---
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Email atau password salah." },
        { status: 401 }
      );
    }

    // --- Set session ---
    const session = await getSession();
    session.isLoggedIn = true;
    session.userId = user.id;
    session.email = user.email ?? "";
    session.name = user.name ?? "";
    session.role = user.role;
    await session.save();

    return NextResponse.json({
      success: true,
      message: "Login berhasil! Selamat datang kembali.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[AUTH LOGIN ERROR]", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan server. Coba lagi." },
      { status: 500 }
    );
  }
}
