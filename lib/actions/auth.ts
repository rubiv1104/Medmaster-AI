"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  validateEmail,
  validatePassword,
  validateFullName,
} from "@/lib/validations/auth";

function normalizeRedirect(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) return "/home";
  if (value.startsWith("/login") || value.startsWith("/register"))
    return "/home";
  return value;
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  const redirectTo = normalizeRedirect(
    String(formData.get("redirect") ?? "/home"),
  );

  const emailError = validateEmail(email);
  if (emailError) {
    return { error: emailError };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  return {
    success: true,
    redirectTo,};
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(formData.get("password") ?? "");

  const full_name = String(formData.get("full_name") ?? "").trim();

  const nameError = validateFullName(full_name);
  if (nameError) {
    return { error: nameError };
  }

  const emailError = validateEmail(email);
  if (emailError) {
    return { error: emailError };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name },
      emailRedirectTo: `${appUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) return { error: error.message };

  if (!data.session) {
    return {
      success: true,
      message: "Account created. Please check email.",
    };
  }

  revalidatePath("/", "layout");
  return {
  success: true,
  message:
    'Account created successfully. Please sign in.',
};
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  redirect("/login");
}
