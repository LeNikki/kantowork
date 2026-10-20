"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogOut, Settings, User as UserIcon, FileText } from "lucide-react";
import { clearToken } from "@/lib/auth";
import type { User } from "@/lib/session";
import Avatar from "./Avatar";

export default function ProfileMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const logout = () => {
    clearToken();
    router.replace("/login");
    router.refresh();
  };

  const itemClass =
    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-surface";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        <Avatar name={user.name} size="md" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Profile"
          className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-lg border border-black/10 bg-background py-1 shadow-lg dark:border-white/10"
        >
          <div className="border-b border-black/10 px-3 py-2 dark:border-white/10">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
          </div>
          <button type="button" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <UserIcon aria-hidden className="h-4 w-4 text-zinc-400" />
            My Profile
          </button>
          <Link href="/#my-job-posts" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <FileText aria-hidden className="h-4 w-4 text-zinc-400" />
            My Job Posts
          </Link>
          <button type="button" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            <Settings aria-hidden className="h-4 w-4 text-zinc-400" />
            Settings
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${itemClass} border-t border-black/10 text-red-600 hover:bg-red-50 dark:border-white/10 dark:text-red-400 dark:hover:bg-red-500/10`}
            onClick={logout}
          >
            <LogOut aria-hidden className="h-4 w-4" />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
