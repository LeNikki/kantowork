"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";

const inputClass =
  "rounded-md border border-black/10 px-3 py-2 dark:border-white/15";

export default function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // A link opened without its token (someone typed the URL by hand, or the
  // query string was stripped) cannot possibly succeed, so say so instead of
  // showing a form that is guaranteed to fail.
  if (!token) {
    return (
      <main className="flex min-h-dvh w-full items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold">Reset link missing</h1>
          <p
            role="alert"
            className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            This page needs the link from your reset email. Request a new one.
          </p>
          <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/forgotpassword" className="underline">
              Request a new link
            </Link>
          </p>
        </div>
      </main>
    );
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setBusy(true);
    try {
      await api("/api/forgotpassword/reset", {
        token,
        password: form.password,
      });
      // No session is created here on purpose: a reset proves control of the
      // mailbox, not of this browser session. Send them to log in with the
      // password they just chose.
      router.replace("/login");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Choose a new password</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          This link can only be used once.
        </p>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
          >
            {error}
          </p>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="New password (min 8 characters)"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm((p) => ({ ...p, confirmPassword: e.target.value }))
            }
            placeholder="Confirm new password"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />

          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-50"
          >
            {busy ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </main>
  );
}