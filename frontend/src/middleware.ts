import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authSecret =
    process.env.AUTH_SECRET || "nara_super_secret_auth_token_key_2026_fase1_random_hmac";

  // Verifikasi keabsahan tanda tangan token dan masa berlaku
  let isValidSession = false;
  if (token) {
    const { valid } = await verifySessionToken(token, authSecret);
    isValidSession = valid;
  }

  const isLoginPage = pathname === "/login";

  // 1. Sudah login tapi mencoba membuka halaman /login -> arahkan ke dashboard "/"
  if (isLoginPage) {
    if (isValidSession) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 2. Belum login / sesi tidak valid -> arahkan ke /login
  if (!isValidSession) {
    // Jika endpoint API selain /api/auth/login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 3. Sesi valid -> teruskan permintaan dengan header Cache-Control: no-store
  // agar tombol Back setelah logout tidak menampilkan dashboard dari memori cache
  const response = NextResponse.next();
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  return response;
}

export const config = {
  matcher: [
    /*
     * Cocokkan semua rute kecuali:
     * - _next/static (file statis bundel)
     * - _next/image (optimasi gambar Next.js)
     * - favicon.ico, file icon
     * - /api/auth/login (login endpoint)
     * - /templates/* (file template publik seperti CSV)
     * - file publik dengan ekstensi (.png, .jpg, .svg, .csv, dst.)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth/login|templates/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|csv|xlsx)$).*)",
  ],
};
