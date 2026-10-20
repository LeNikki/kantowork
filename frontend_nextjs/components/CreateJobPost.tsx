"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Banknote,
  FileText,
  Image as ImageIcon,
  MapPin,
  Paperclip,
  Video,
  Wifi,
  X,
} from "lucide-react";
import { JOB_CATEGORIES, type JobArrangement, type JobPost } from "@/lib/jobs";
import type { User } from "@/lib/session";
import Avatar from "./Avatar";

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_FILE_LABEL = "20 MB";
const ALLOWED_EXTENSIONS =
  /\.(pdf|jpe?g|png|gif|webp|avif|svg|mp4|mov|webm|mkv|avi|m4v)$/i;

function isAllowedFileType(file: File) {
  if (file.type) {
    return (
      file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      file.type === "application/pdf"
    );
  }
  // Some OSes hand back an empty MIME type; fall back to the extension.
  return ALLOWED_EXTENSIONS.test(file.name);
}

const inputClass =
  "h-11 w-full rounded-lg border border-black/10 bg-background px-3 text-sm text-foreground placeholder:text-zinc-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 dark:border-white/10";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

type CreateJobPostProps = {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPost: (job: JobPost) => void;
};

export default function CreateJobPost({ user, open, onOpenChange, onPost }: CreateJobPostProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [arrangement, setArrangement] = useState<JobArrangement>("Remote");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  const expand = () => {
    onOpenChange(true);
    requestAnimationFrame(() => titleRef.current?.focus());
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setBudget("");
    setLocation("");
    setArrangement("Remote");
    setFiles([]);
    setFileError("");
  };

  const cancel = () => {
    reset();
    onOpenChange(false);
  };

  const onFilesPicked = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    const accepted: File[] = [];
    let error = "";
    for (const file of picked) {
      if (file.size > MAX_FILE_BYTES) {
        error = `"${file.name}" is larger than the ${MAX_FILE_LABEL} limit.`;
      } else if (!isAllowedFileType(file)) {
        error = `"${file.name}" must be an image, PDF, or video.`;
      } else if (!accepted.some((f) => f.name === file.name && f.size === file.size)) {
        accepted.push(file);
      }
    }
    setFileError(error);
    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setFileError("");
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onPost({
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      category,
      budget: budget.trim(),
      location: location.trim() || "Remote",
      arrangement,
      status: "active",
      applicants: 0,
      postedAt: "Posted just now",
    });
    cancel();
  };

  const fileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return ImageIcon;
    if (file.type.startsWith("video/")) return Video;
    return FileText;
  };

  if (!open) {
    return (
      <section
        id="create-job-post"
        aria-label="Create a job post"
        className="rounded-xl border border-black/10 bg-surface p-4 dark:border-white/10"
      >
        <div className="flex items-center gap-3">
          <Avatar name={user.name} />
          <button
            type="button"
            onClick={expand}
            className="h-11 min-w-0 flex-1 truncate rounded-lg border border-black/10 bg-background px-4 text-left text-sm text-zinc-500 hover:border-primary/60 dark:border-white/10"
          >
            Need a worker? Ask the community...
          </button>
          <button
            type="button"
            onClick={expand}
            aria-label="Create job post with an attachment"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-black/10 bg-background text-zinc-500 hover:border-primary/60 hover:text-primary dark:border-white/10"
          >
            <Paperclip aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      id="create-job-post"
      aria-label="Create a job post"
      className="rounded-xl border border-black/10 bg-surface p-4 dark:border-white/10 sm:p-5"
    >
      <form onSubmit={submit} className="composer-in flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={user.name} />
          <h2 className="text-base font-semibold">Create a job post</h2>
          <button
            type="button"
            onClick={cancel}
            aria-label="Close job post form"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-background hover:text-foreground"
          >
            <X aria-hidden className="h-4 w-4" />
          </button>
        </div>

        <div>
          <label htmlFor="job-title" className={labelClass}>
            Job Title
          </label>
          <input
            id="job-title"
            ref={titleRef}
            required
            minLength={3}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Flutter Developer"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="job-description" className={labelClass}>
            Job Description
          </label>
          <textarea
            id="job-description"
            required
            minLength={3}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the work, skills needed, and how you'll work together..."
            className={`${inputClass} h-auto resize-y py-3 leading-relaxed`}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="job-category" className={labelClass}>
              Category
            </label>
            <select
              id="job-category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select a category
              </option>
              {JOB_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="job-budget" className={labelClass}>
              Budget / Compensation
            </label>
            <div className="relative">
              <Banknote
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              />
              <input
                id="job-budget"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. ₱20,000 – ₱30,000"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="job-location" className={labelClass}>
              Location
            </label>
            <div className="relative">
              <MapPin
                aria-hidden
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              />
              <input
                id="job-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Cebu City"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <div>
            <span className={labelClass}>Remote / On-site</span>
            <div
              role="radiogroup"
              aria-label="Work arrangement"
              className="grid grid-cols-2 gap-2"
            >
              {(["Remote", "On-site"] as const).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={arrangement === opt}
                  onClick={() => setArrangement(opt)}
                  className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors ${
                    arrangement === opt
                      ? "border-primary bg-primary/10 text-primary-strong dark:text-primary"
                      : "border-black/10 bg-background text-zinc-600 hover:border-primary/50 dark:border-white/10 dark:text-zinc-400"
                  }`}
                >
                  {opt === "Remote" ? (
                    <Wifi aria-hidden className="h-4 w-4" />
                  ) : (
                    <MapPin aria-hidden className="h-4 w-4" />
                  )}
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className={labelClass}>
            Attachments{" "}
            <span className="font-normal text-zinc-500">(optional)</span>
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="job-attachments"
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-black/10 bg-background px-3 text-sm font-medium hover:border-primary/60 hover:text-primary dark:border-white/10"
            >
              <Paperclip aria-hidden className="h-4 w-4" />
              Attach files
            </label>
            <input
              id="job-attachments"
              type="file"
              multiple
              accept="image/*,application/pdf,video/*"
              className="sr-only"
              onChange={onFilesPicked}
            />
            <p className="text-xs text-zinc-500">
              Images, PDFs, and videos · Max {MAX_FILE_LABEL}
            </p>
          </div>

          {fileError && <p className="mt-2 text-xs text-red-600">{fileError}</p>}

          {files.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2">
              {files.map((file, i) => {
                const Icon = fileIcon(file);
                return (
                  <li
                    key={`${file.name}-${file.size}-${i}`}
                    className="flex items-center gap-3 rounded-lg border border-black/10 bg-background px-3 py-2 dark:border-white/10"
                  >
                    <Icon aria-hidden className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className="min-w-0 flex-1 truncate text-sm">{file.name}</span>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => removeFile(i)}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-400 hover:bg-surface hover:text-red-600"
                    >
                      <X aria-hidden className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-black/10 pt-4 dark:border-white/10">
          <button
            type="button"
            onClick={cancel}
            className="h-10 rounded-lg border border-black/10 bg-background px-4 text-sm font-medium text-foreground hover:bg-surface dark:border-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-10 rounded-lg bg-primary px-5 text-sm font-semibold text-white hover:bg-primary-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Post Job
          </button>
        </div>
      </form>
    </section>
  );
}
