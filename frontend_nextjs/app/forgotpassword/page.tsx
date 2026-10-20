"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";

const inputClass =
  "rounded-md border border-black/10 px-3 py-2 dark:border-white/15";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Flip on success and swap the form out, so the confirmation stays put even
  // if the visitor reloads while still wondering whether the email arrived.
  const [sent, setSent] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api<{ message: string }>("/api/forgotpassword", { email });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Forgot password</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Enter your email and we&apos;ll send you a link to choose a new
          password.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}

        {sent ? (
          <p
            role="status"
            className="mt-6 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-300"
          >
            If an account exists for that email, a reset link is on its way. It
            expires in 60 minutes.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            <input
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              required
              className={inputClass}
            />

            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className="underline">
            Back to log in
          </Link>
        </p>
      </div>
    </main>
  );
}