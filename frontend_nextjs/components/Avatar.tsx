type AvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function Avatar({ name, size = "md", className = "" }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-white ${SIZES[size]} ${className}`}
    >
      {initialsOf(name)}
    </span>
  );
}
