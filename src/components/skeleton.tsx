export function Bar({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block rounded-sm bg-wash ${className}`} />;
}

export function ScoreSkeleton() {
  return (
    <div className="flex items-baseline gap-5">
      <Bar className="h-14 w-36 sm:h-16" />
      <div className="space-y-2">
        <Bar className="h-3 w-20" />
        <Bar className="h-4 w-28" />
      </div>
    </div>
  );
}

export function RowsSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="mt-6 border-t border-line">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center justify-between gap-6 border-b border-line py-5">
          <Bar className="h-4 w-56 max-w-[60%]" />
          <Bar className="h-3 w-24" />
        </li>
      ))}
    </ul>
  );
}
