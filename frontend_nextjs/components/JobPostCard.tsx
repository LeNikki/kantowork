"use client";

import { useState } from "react";
import { Banknote, MapPin, Users } from "lucide-react";
import { applicantsForJob, STATUS_META, type JobPost } from "@/lib/jobs";
import Avatar from "./Avatar";

type JobPostCardProps = {
  job: JobPost;
  onMessage?: (job: JobPost) => void;
  onMessageApplicant?: (job: JobPost, name: string) => void;
};

export default function JobPostCard({
  job,
  onMessage,
  onMessageApplicant,
}: JobPostCardProps) {
  const [showApplicants, setShowApplicants] = useState(false);
  const meta = STATUS_META[job.status];
  const applicants = showApplicants ? applicantsForJob(job) : [];

  const toggleApplicants = () => {
    setShowApplicants((v) => !v);
  };

  return (
    <article className="rounded-xl border border-black/10 bg-surface p-5 dark:border-white/10">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-snug">{job.title}</h3>
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${meta.badge} ${meta.text}`}
        >
          <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
          {meta.label}
        </span>
      </div>

      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {job.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="inline-flex items-center gap-1.5">
          <MapPin aria-hidden className="h-4 w-4 text-zinc-400" />
          {job.location} · {job.arrangement}
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
          <Banknote aria-hidden className="h-4 w-4 text-primary" />
          {job.budget}
        </span>
        <span className="hidden text-zinc-400 sm:inline">· {job.category}</span>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-black/10 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5 font-semibold text-foreground">
            <Users aria-hidden className="h-4 w-4 text-primary" />
            {job.applicants} {job.applicants === 1 ? "Applicant" : "Applicants"}
          </span>
          <span aria-hidden className="text-zinc-300 dark:text-zinc-600">
            ·
          </span>
          <span>{job.postedAt}</span>
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleApplicants}
            aria-expanded={showApplicants}
            className="h-10 flex-1 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:flex-none"
          >
            {showApplicants ? "Hide Applicants" : "View Applicants"}
          </button>
          <button
            type="button"
            onClick={() => onMessage?.(job)}
            className="h-10 flex-1 rounded-lg border border-black/10 bg-background px-4 text-sm font-medium hover:border-primary/60 hover:text-primary dark:border-white/10 sm:flex-none"
          >
            Message
          </button>
        </div>
      </div>

      {showApplicants && (
        <div className="composer-in mt-4 border-t border-black/10 pt-4 dark:border-white/10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Applicants
          </p>
          {job.applicants === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              No applicants yet — they&apos;ll show up here as people apply.
            </p>
          ) : (
            <>
              <ul className="flex flex-col gap-3">
                {applicants.map((person) => (
                  <li key={person.id} className="flex items-center gap-3">
                    <Avatar name={person.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{person.name}</p>
                      <p className="truncate text-xs text-zinc-500">
                        {person.headline} · {person.rate}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onMessageApplicant?.(job, person.name)}
                      className="h-8 shrink-0 rounded-lg border border-black/10 bg-background px-3 text-xs font-medium hover:border-primary/60 hover:text-primary dark:border-white/10"
                    >
                      Message
                    </button>
                  </li>
                ))}
              </ul>
              {job.applicants > applicants.length && (
                <p className="mt-3 text-xs text-zinc-500">
                  Showing {applicants.length} of {job.applicants} applicants
                </p>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}
