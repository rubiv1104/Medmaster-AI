import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const cookieNames = (await cookies())
    .getAll()
    .map((cookie) => cookie.name)
    .filter((name) => name.includes("sb-"));

  return NextResponse.json({
    signedIn: Boolean(user),
    userEmail: user?.email ?? null,
    authError: error?.message ?? null,
    supabaseCookieNames: cookieNames,
  });
}
