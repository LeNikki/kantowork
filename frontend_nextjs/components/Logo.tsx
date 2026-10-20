export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-druk text-xl leading-none text-white">
        K
      </span>
      <span className="font-druk text-xl leading-none tracking-tight text-foreground">
        KantoWork
      </span>
    </span>
  );
}
