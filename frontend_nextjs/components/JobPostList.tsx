"use client";

import { Briefcase } from "lucide-react";
import type { JobPost } from "@/lib/jobs";
import JobPostCard from "./JobPostCard";

export type JobPostFilter = "all" | "active" | "closed";

const FILTERS: { key: JobPostFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "closed", label: "Closed" },
];

type JobPostListProps = {
  posts: JobPost[];
  filter: JobPostFilter;
  onFilterChange: (filter: JobPostFilter) => void;
  onCreateFirst: () => void;
  onMessage?: (job: JobPost, applicantName?: string) => void;
};

function EmptyState({ onCreateFirst }: { onCreateFirst: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-black/15 bg-surface px-6 py-12 text-center dark:border-white/15">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Briefcase aria-hidden className="h-8 w-8" />
      </span>
      <h3 className="mt-4 text-lg font-semibold">You haven&apos;t posted a job yet.</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        Find the right person for your next project by creating your first job post.
      </p>
      <button
        type="button"
        onClick={onCreateFirst}
        className="mt-5 h-11 rounded-lg bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      >
        Post Your First Job
      </button>
    </div>
  );
}

export default function JobPostList({
  posts,
  filter,
  onFilterChange,
  onCreateFirst,
  onMessage,
}: JobPostListProps) {
  if (posts.length === 0) {
    return (
      <section id="my-job-posts" className="scroll-mt-24">
        <h2 className="mb-4 text-xl font-semibold">My Job Posts</h2>
        <EmptyState onCreateFirst={onCreateFirst} />
      </section>
    );
  }

  const filtered = posts.filter((post) => {
    if (filter === "active") return post.status === "active" || post.status === "hiring";
    if (filter === "closed") return post.status === "closed" || post.status === "expired";
    return true;
  });

  return (
    <section id="my-job-posts" className="scroll-mt-24">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">My Job Posts</h2>
        <div
          role="group"
          aria-label="Filter job posts"
          className="flex items-center gap-1 rounded-lg border border-black/10 bg-surface p-1 dark:border-white/10"
        >
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => onFilterChange(key)}
              className={`h-8 rounded-md px-3 text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-primary text-white"
                  : "text-zinc-600 hover:text-foreground dark:text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-black/10 bg-surface px-5 py-8 text-center text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
          No {filter === "active" ? "active" : "closed"} posts right now.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((post) => (
            <JobPostCard
              key={post.id}
              job={post}
              onMessage={onMessage ? (job) => onMessage(job) : undefined}
              onMessageApplicant={
                onMessage ? (job, name) => onMessage(job, name) : undefined
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
