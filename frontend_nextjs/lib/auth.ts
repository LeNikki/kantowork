"use client";

import { useSyncExternalStore } from "react";
import {
  buildExpiredUserCookie,
  buildUserCookie,
  type User,
} from "@/lib/session";

const TOKEN_KEY = "kantowork.token";
const USER_KEY = "kantowork.user";

// The token lives in localStorage *and* a cookie. localStorage is what the
// client reads, but it is invisible to the server, so proxy.ts could never
// redirect on the initial request and every cold visit flashed a blank page
// before the client-side redirect ran. The cookie is the readable half.
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

/**
 * Store the token and the user the login endpoint just handed back, in both
 * localStorage and cookies. The user cookie is what app/page.tsx reads on the
 * server to render the greeting.
 */
export function setSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  document.cookie = buildUserCookie(user);
  emit();
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = buildExpiredUserCookie();
  emit();
}

// localStorage sits outside React, so read it as an external store rather than
// copying it into state from an effect. The server snapshot is null, which makes
// the first paint identical on both sides; React re-reads the real value right
// after hydration.
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Other tabs mutate localStorage directly, which React never hears about.
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useToken() {
  return useSyncExternalStore(subscribe, getToken, () => null);
}

// useSyncExternalStore compares snapshots with Object.is, so the snapshot has
// to be a stable primitive - handing it a freshly parsed object each call
// would loop forever. Snapshot the raw string and parse it above.
function getUserSnapshot() {
  return localStorage.getItem(USER_KEY);
}

export function useUser(): User | null {
  const raw = useSyncExternalStore(subscribe, getUserSnapshot, () => null);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}