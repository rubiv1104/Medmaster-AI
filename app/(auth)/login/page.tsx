"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/actions/auth";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") ?? "/home";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
  e: React.FormEvent<HTMLFormElement>
) {
  e.preventDefault();

  setError(null);
  setLoading(true);

  const formData = new FormData(e.currentTarget);

  const email = String(
    formData.get("email") ?? ""
  )
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") ?? ""
  );

  try {
    const result = await signIn(formData);

    if (result?.error) {
      setError(
        result.error ===
          "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : result.error
      );
      return;
    }

    window.location.replace(result?.redirectTo ?? redirectTo);
  } catch {
    setError(
      "Something went wrong. Please try again."
    );
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: "Fraunces, Georgia, serif",
            fontSize: 26,
            fontWeight: 400,
            color: "var(--text)",
            marginBottom: 8,
          }}
        >
          Welcome back
        </h2>

        <p style={{ color: "var(--text-2)", fontSize: 15 }}>
          Sign in to continue your revision journey.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <input type="hidden" name="redirect" value={redirectTo} />

        <div className="field-group">
          <label className="label" htmlFor="email">
            Email address
          </label>

          <input
            className="input"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="field-group">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <label
              className="label"
              htmlFor="password"
              style={{ marginBottom: 0 }}
            >
              Password
            </label>

            <Link
              href="/forgot-password"
              style={{ fontSize: 13, color: "var(--green-800)" }}
            >
              Forgot password?
            </Link>
          </div>

          <input
            className="input"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error === "Invalid login credentials"
              ? "Incorrect email or password. Please try again."
              : error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={loading}
          style={{ marginTop: 4 }}
        >
          {loading ? (
            <>
              <Spinner />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <p
        style={{
          textAlign: "center",
          marginTop: 24,
          fontSize: 14,
          color: "var(--text-2)",
        }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          style={{ color: "var(--green-800)", fontWeight: 500 }}
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
