import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const demoEmail = process.env.DEMO_EMAIL || "zumarramadhan@gmail.com";
    const demoPassword = process.env.DEMO_PASSWORD || "zumar123";
    const authSecret =
      process.env.AUTH_SECRET || "nara_super_secret_auth_token_key_2026_fase1_random_hmac";

    // Pengecekan kredensial di sisi server
    if (
      !email ||
      !password ||
      email.trim().toLowerCase() !== demoEmail.toLowerCase() ||
      password !== demoPassword
    ) {
      return NextResponse.json(
        { error: "Email atau kata sandi salah." },
        { status: 401 }
      );
    }

    // Buat token bertanda tangan HMAC-SHA256
    const token = await createSessionToken(
      { email: demoEmail, name: "Zumar" },
      authSecret
    );

    const response = NextResponse.json({
      success: true,
      user: { name: "Zumar", email: demoEmail },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
