import { clearToken, getToken } from "@/lib/auth";
import type { User } from "@/lib/session";

export type { User };
export type AuthResponse = {
  message: string;
  user: User;
  token: string;
  expiresIn: string;
};

export async function api<T>(path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (body) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, {
    method: body ? "POST" : "GET",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // A rejected token is never going to start working - drop it so we stop
  // sending a dead credential on every subsequent request.
  if (res.status === 401 && token) clearToken();

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(errorMessage(data, res.status));
  }

  return res.status === 204 ? (undefined as T) : res.json();
}

// Two failure shapes come out of the backend: {error} for a single problem
// (401, 409) and {errors: [{msg}]} from the express-validator chain on
// signup. Collapsing them to "Request failed (400)" would hide every actual
// validation message, so surface them instead.
function errorMessage(data: { error?: string; errors?: { msg?: string }[] }, status: number) {
  if (data?.error) return data.error;

  const messages = data?.errors?.map((e) => e.msg).filter(Boolean) ?? [];
  if (messages.length) return messages.join(". ");

  return `Request failed (${status})`;
}