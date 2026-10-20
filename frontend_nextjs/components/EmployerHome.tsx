"use client";

import { useEffect, useMemo, useState } from "react";
import ActivityCard from "./ActivityCard";
import CreateJobPost from "./CreateJobPost";
import JobPostList, { type JobPostFilter } from "./JobPostList";
import Navbar from "./Navbar";
import { initialJobPosts, type JobPost } from "@/lib/jobs";
import type { User } from "@/lib/session";

const UNREAD_MESSAGES = 5;
const UNREAD_NOTIFICATIONS = 3;

export default function EmployerHome({ user }: { user: User }) {
  const [posts, setPosts] = useState<JobPost[]>(initialJobPosts);
  const [filter, setFilter] = useState<JobPostFilter>("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(
    () => ({
      activePosts: posts.filter((p) => p.status === "active" || p.status === "hiring").length,
      totalApplicants: posts.reduce((sum, p) => sum + p.applicants, 0),
      unreadMessages: UNREAD_MESSAGES,
    }),
    [posts],
  );

  const addPost = (job: JobPost) => {
    setPosts((prev) => [job, ...prev]);
    // A new post is always Active — leave whatever filter is active so it
    // can't be hidden from the employer the moment it goes live.
    setFilter("all");
    setToast("Your job post is live.");
  };

  const openComposer = () => {
    setComposerOpen(true);
    requestAnimationFrame(() =>
      document.getElementById("create-job-post")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }),
    );
  };

  const handleMessage = (job: JobPost, applicantName?: string) => {
    setToast(
      applicantName
        ? `Messaging ${applicantName} is coming soon.`
        : `Messaging about "${job.title}" is coming soon.`,
    );
  };

  return (
    <div className="min-h-dvh">
      <Navbar
        user={user}
        unreadMessages={UNREAD_MESSAGES}
        unreadNotifications={UNREAD_NOTIFICATIONS}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,1fr)_260px] lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex min-w-0 flex-col gap-6">
            <CreateJobPost
              user={user}
              open={composerOpen}
              onOpenChange={setComposerOpen}
              onPost={addPost}
            />
            <JobPostList
              posts={posts}
              filter={filter}
              onFilterChange={setFilter}
              onCreateFirst={openComposer}
              onMessage={handleMessage}
            />
          </div>

          <aside aria-label="Hiring activity" className="hidden md:block">
            <div className="sticky top-24">
              <ActivityCard stats={stats} />
            </div>
          </aside>
        </div>
      </main>

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        {toast && (
          <p className="composer-in rounded-lg border border-black/10 bg-background px-4 py-2.5 text-sm font-medium shadow-lg dark:border-white/10">
            {toast}
          </p>
        )}
      </div>
    </div>
  );
}
