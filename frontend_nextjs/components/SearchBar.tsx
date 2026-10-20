"use client";

import { useId } from "react";
import { Search } from "lucide-react";

type SearchBarProps = {
  className?: string;
  onQuery?: (query: string) => void;
};

export default function SearchBar({ className = "", onQuery }: SearchBarProps) {
  // The navbar renders a desktop and a mobile search bar; useId keeps their
  // ids unique so the sr-only labels don't both point at the same input.
  const id = useId();

  return (
    <form
      role="search"
      onSubmit={(e) => e.preventDefault()}
      className={`relative ${className}`}
    >
      <label htmlFor={id} className="sr-only">
        Search workers, skills, or services
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
      />
      <input
        id={id}
        type="search"
        placeholder="Search workers, skills, or services..."
        onChange={(e) => onQuery?.(e.target.value)}
        className="h-10 w-full rounded-lg border border-black/10 bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-white/10"
      />
    </form>
  );
}
