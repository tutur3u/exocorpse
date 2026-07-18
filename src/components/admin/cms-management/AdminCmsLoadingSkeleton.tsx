function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-zinc-200/80 dark:bg-zinc-800 ${className}`}
    />
  );
}

export default function AdminCmsLoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading content library"
      className="space-y-5"
    >
      <div className="overflow-hidden rounded-[1.75rem] border border-zinc-800 bg-zinc-950 px-5 py-7 shadow-[0_24px_80px_rgba(9,9,11,0.18)] sm:px-8">
        <SkeletonBar className="h-2.5 w-28 bg-cyan-900/70 dark:bg-cyan-900/70" />
        <SkeletonBar className="mt-4 h-9 w-52 bg-zinc-700 dark:bg-zinc-700" />
        <SkeletonBar className="mt-4 h-3 w-full max-w-2xl bg-zinc-800 dark:bg-zinc-800" />
        <SkeletonBar className="mt-2 h-3 w-3/4 max-w-xl bg-zinc-800 dark:bg-zinc-800" />
      </div>

      <div className="flex gap-2 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/80 p-2 dark:border-zinc-800 dark:bg-zinc-950/70">
        {["w-28", "w-24", "w-32", "w-20"].map((width) => (
          <SkeletonBar className={`h-9 shrink-0 ${width}`} key={width} />
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white/80 p-4 dark:border-zinc-800 dark:bg-zinc-950/70">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <SkeletonBar className="h-6 w-40" />
            <SkeletonBar className="mt-2 h-3 w-20" />
          </div>
          <SkeletonBar className="h-10 w-full rounded-xl sm:w-72" />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            key={index}
          >
            <div className="aspect-[16/10] animate-pulse bg-zinc-200/80 dark:bg-zinc-800" />
            <div className="space-y-3 p-4">
              <SkeletonBar className="h-5 w-2/3" />
              <SkeletonBar className="h-3 w-full" />
              <SkeletonBar className="h-3 w-4/5" />
              <div className="grid grid-cols-2 gap-2 pt-3">
                <SkeletonBar className="h-9 rounded-xl" />
                <SkeletonBar className="h-9 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
