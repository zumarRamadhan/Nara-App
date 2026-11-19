import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authSecret =
    process.env.AUTH_SECRET || "nara_super_secret_auth_token_key_2026_fase1_random_hmac";

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const { valid, payload } = await verifySessionToken(token, authSecret);
  if (!valid || !payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      name: payload.name,
      email: payload.email,
    },
  });
}
