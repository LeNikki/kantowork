"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { api, type AuthResponse } from "@/lib/api";
import { setSession } from "@/lib/auth";

const ROLES = [
  {
    value: "employer",
    label: "Employer",
    description: "Post jobs and hire independent talent.",
  },
  {
    value: "freelancer",
    label: "Freelancer",
    description: "Find projects and get paid for your work.",
  },
] as const;

const inputClass =
  "rounded-md border border-black/10 px-3 py-2 dark:border-white/15";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    userRole: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update =
    (field: keyof typeof form) =>
    (e: { target: { value: string } }) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!form.userRole) {
      setError("Choose how you'll use KantoWork");
      return;
    }

    setBusy(true);
    try {
      const d = await api<AuthResponse>("/api/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        userRole: form.userRole,
      });
      setSession(d.token, d.user);
      router.replace("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Sign up</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Create your KantoWork account.
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
            name="name"
            value={form.name}
            onChange={update("name")}
            placeholder="Full name"
            autoComplete="name"
            required
            className={inputClass}
          />
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={update("email")}
            placeholder="Email"
            autoComplete="email"
            required
            className={inputClass}
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={update("password")}
            placeholder="Password (min 8 characters)"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />
          <input
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={update("confirmPassword")}
            placeholder="Confirm password"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClass}
          />

          <fieldset className="mt-2">
            <legend className="text-sm font-medium">How will you use KantoWork?</legend>
            <div className="mt-3 grid gap-3">
              {ROLES.map((role) => {
                const selected = form.userRole === role.value;
                return (
                  <label
                    key={role.value}
                    className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
                      selected
                        ? "border-foreground bg-zinc-50 ring-1 ring-foreground dark:bg-zinc-900"
                        : "border-black/10 hover:bg-zinc-50 dark:border-white/15 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <input
                      type="radio"
                      name="userRole"
                      value={role.value}
                      checked={selected}
                      onChange={update("userRole")}
                      className="mt-1 accent-foreground"
                    />
                    <span>
                      <span className="block text-sm font-medium">{role.label}</span>
                      <span className="block text-sm text-zinc-600 dark:text-zinc-400">
                        {role.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            disabled={busy}
            className="mt-2 rounded-md bg-foreground px-3 py-2 font-medium text-background disabled:opacity-50"
          >
            {busy ? "Creating account…" : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-400">
          Have an account?{" "}
          <Link href="/login" className="underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}