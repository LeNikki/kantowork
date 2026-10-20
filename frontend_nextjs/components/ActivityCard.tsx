import { Lightbulb } from "lucide-react";

export type ActivityStats = {
  activePosts: number;
  totalApplicants: number;
  unreadMessages: number;
};

function StatRow({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="w-9 text-right text-3xl font-semibold leading-none tracking-tight">
        {value}
      </span>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
    </div>
  );
}

export default function ActivityCard({ stats }: { stats: ActivityStats }) {
  return (
    <div className="flex flex-col gap-4">
      <section
        aria-label="Your activity"
        className="rounded-xl border border-black/10 bg-surface p-5 dark:border-white/10"
      >
        <h2 className="mb-4 text-base font-semibold">Your Activity</h2>
        <div className="flex flex-col gap-4">
          <StatRow value={stats.activePosts} label="Active Job Posts" />
          <div className="border-t border-black/10 dark:border-white/10" />
          <StatRow value={stats.totalApplicants} label="Total Applicants" />
          <div className="border-t border-black/10 dark:border-white/10" />
          <StatRow value={stats.unreadMessages} label="Unread Messages" />
        </div>
      </section>

      <section
        aria-label="Hiring tip"
        className="rounded-xl border border-black/10 bg-surface p-5 dark:border-white/10"
      >
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Lightbulb aria-hidden className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Hiring Tip
          </h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Add a clear budget and detailed job description to attract better applicants.
        </p>
      </section>
    </div>
  );
}
