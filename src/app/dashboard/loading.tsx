import { Bar, RowsSkeleton, ScoreSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <header className="flex flex-wrap items-end justify-between gap-8 pb-12">
        <ScoreSkeleton />
        <Bar className="h-10 w-48" />
      </header>
      <section className="section">
        <Bar className="h-5 w-32" />
        <RowsSkeleton rows={4} />
      </section>
    </div>
  );
}
