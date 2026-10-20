"use client";

import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";
import type { User } from "@/lib/session";
import Logo from "./Logo";
import ProfileMenu from "./ProfileMenu";
import SearchBar from "./SearchBar";

type NavbarProps = {
  user: User;
  unreadMessages?: number;
  unreadNotifications?: number;
};

function IconButton({
  label,
  count,
  children,
}: {
  label: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={count ? `${label} (${count} unread)` : label}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 hover:bg-surface hover:text-foreground dark:text-zinc-400 dark:hover:bg-surface"
    >
      {children}
      {count ? (
        <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </button>
  );
}

export default function Navbar({ user, unreadMessages = 5, unreadNotifications = 3 }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-background/95 backdrop-blur dark:border-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="KantoWork home" className="shrink-0">
          <Logo />
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <SearchBar className="w-full max-w-xl" />
        </div>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <IconButton label="Messages" count={unreadMessages}>
            <MessageCircle aria-hidden className="h-5 w-5" />
          </IconButton>
          <IconButton label="Notifications" count={unreadNotifications}>
            <Bell aria-hidden className="h-5 w-5" />
          </IconButton>
          <div className="ml-1">
            <ProfileMenu user={user} />
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchBar className="w-full" />
      </div>
    </header>
  );
}
