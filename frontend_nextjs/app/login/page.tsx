"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, type AuthResponse } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const d = await api<AuthResponse>("/api/auth/login", { email, password });
      // d.user comes straight from the login response - no extra fetch needed.
      // Writes the cookies proxy.ts and app/page.tsx read.
      setSession(d.token, d.user);
      router.replace("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    // min-h-dvh sits on the page itself rather than relying on the body's
    // flex child growing into it, and items-stretch lets the grid fill that
    // height. No h-full anywhere: a percentage height against a flex item
    // sized by flex-grow is not reliably resolved across browsers.
    <main className="flex min-h-dvh w-full items-stretch justify-center">
      <div className="grid w-full grid-cols-1 md:grid-cols-2">
        <div className="w-full bg-black p-6 text-white items-center flex justify-center">
          <h1 className="font-druk font-bold text-8xl pt-10">Kanto Work</h1>
        </div>

      <div className="flex w-full justify-center items-center p-6">
        <div className = "max-w-sm">
        <h1 className="text-2xl font-semibold">Log in</h1>
        {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}
        <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15"
          />
          <button
            type="submit"
            disabled={busy}
            className="rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-50"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          No account?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
        </p>

         <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/forgotpassword" className="underline">
            Forgot password?
          </Link>
        </p>
        </div>
      </div>
      </div>
    </main>
  );
}