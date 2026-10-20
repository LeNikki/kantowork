export type JobStatus = "active" | "hiring" | "closed" | "expired";

export type JobArrangement = "Remote" | "On-site";

export type JobPost = {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: string;
  location: string;
  arrangement: JobArrangement;
  status: JobStatus;
  applicants: number;
  postedAt: string;
};

export const JOB_CATEGORIES = [
  "Tech & Development",
  "Creative & Design",
  "Sales & Marketing",
  "Admin & Support",
  "Home Services",
  "Transport & Delivery",
  "Education & Training",
  "Other",
] as const;

export const STATUS_META: Record<
  JobStatus,
  { label: string; dot: string; text: string; badge: string }
> = {
  active: {
    label: "Active",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-400",
    badge: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  hiring: {
    label: "Hiring",
    dot: "bg-amber-400",
    text: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-50 dark:bg-amber-400/10",
  },
  closed: {
    label: "Closed",
    dot: "bg-zinc-400",
    text: "text-zinc-500 dark:text-zinc-400",
    badge: "bg-zinc-100 dark:bg-zinc-500/15",
  },
  expired: {
    label: "Expired",
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    badge: "bg-red-50 dark:bg-red-500/10",
  },
};

export const initialJobPosts: JobPost[] = [
  {
    id: 1,
    title: "Flutter Developer",
    description:
      "Looking for a Flutter developer to help build a mobile application for our local delivery service.",
    category: "Tech & Development",
    budget: "₱20,000 – ₱30,000",
    location: "Cebu / Remote",
    arrangement: "Remote",
    status: "active",
    applicants: 12,
    postedAt: "Posted 2 days ago",
  },
  {
    id: 2,
    title: "Social Media Manager",
    description:
      "Manage our daily posts, stories, and community replies for a growing food brand in Quezon City.",
    category: "Sales & Marketing",
    budget: "₱18,000 / month",
    location: "Quezon City",
    arrangement: "On-site",
    status: "hiring",
    applicants: 9,
    postedAt: "Posted 5 days ago",
  },
  {
    id: 3,
    title: "House Painter",
    description:
      "Repaint a two-storey townhouse. Materials provided — just bring your own tools and ladder.",
    category: "Home Services",
    budget: "₱1,500 / day",
    location: "Cebu City",
    arrangement: "On-site",
    status: "active",
    applicants: 4,
    postedAt: "Posted 1 week ago",
  },
  {
    id: 4,
    title: "Content Writer",
    description:
      "Write SEO-friendly articles for a Philippine travel blog. Three articles per week.",
    category: "Creative & Design",
    budget: "₱10,000 – ₱15,000",
    location: "Remote",
    arrangement: "Remote",
    status: "closed",
    applicants: 21,
    postedAt: "Posted 2 weeks ago",
  },
  {
    id: 5,
    title: "Delivery Rider",
    description:
      "Part-time motorcycle rider for same-day parcels around Davao City. Fuel allowance included.",
    category: "Transport & Delivery",
    budget: "₱12,000 / month",
    location: "Davao City",
    arrangement: "On-site",
    status: "expired",
    applicants: 3,
    postedAt: "Posted 3 weeks ago",
  },
];

export type Applicant = {
  id: number;
  name: string;
  headline: string;
  rate: string;
};

const APPLICANT_NAMES = [
  ["Juan Dela Cruz", "Flutter & Dart · 4 yrs", "₱25,000"],
  ["Maria Santos", "Mobile UI/UX · 3 yrs", "₱22,000"],
  ["Jose Ramos", "Full-stack · 5 yrs", "₱28,000"],
  ["Angela Reyes", "Frontend · 2 yrs", "₱18,000"],
  ["Mark Villanueva", "Backend · 6 yrs", "₱30,000"],
  ["Kim Aquino", "QA & Testing · 3 yrs", "₱20,000"],
];

export function applicantsForJob(job: JobPost): Applicant[] {
  const count = Math.min(job.applicants, 3);
  return Array.from({ length: count }, (_, i) => {
    const [name, headline, rate] = APPLICANT_NAMES[(job.id + i) % APPLICANT_NAMES.length];
    return { id: job.id * 100 + i, name, headline, rate };
  });
}
