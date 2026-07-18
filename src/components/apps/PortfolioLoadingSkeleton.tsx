function Pulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-slate-700/70 ${className}`} />
  );
}

export default function PortfolioLoadingSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading portfolio"
      className="h-full overflow-hidden bg-[#030814] text-slate-100"
    >
      <div className="flex h-16 items-end gap-8 border-b border-slate-700 px-4 sm:px-8">
        {["w-20", "w-24", "w-20"].map((width) => (
          <Pulse className={`mb-4 h-4 ${width}`} key={width} />
        ))}
      </div>
      <div className="flex gap-3 overflow-hidden border-b border-slate-700 px-4 py-3 sm:px-8">
        <Pulse className="h-9 w-28 shrink-0 rounded-lg" />
        <Pulse className="h-7 w-24 shrink-0 rounded-full" />
        <Pulse className="h-7 w-20 shrink-0 rounded-full" />
        <Pulse className="h-7 w-28 shrink-0 rounded-full" />
      </div>
      <div className="space-y-5 p-4 sm:p-7">
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950">
          <div className="border-b border-slate-800 px-5 py-3">
            <Pulse className="h-3 w-36" />
          </div>
          <div className="aspect-[16/7] min-h-52 animate-pulse bg-linear-to-br from-slate-800 via-slate-700 to-slate-900" />
          <div className="space-y-2 border-t border-slate-800 p-5">
            <Pulse className="h-5 w-56" />
            <Pulse className="h-3 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="space-y-2" key={index}>
              <div className="aspect-square animate-pulse rounded-xl bg-slate-800" />
              <Pulse className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
