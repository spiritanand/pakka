import { Bar, RowsSkeleton, ScoreSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading profile">
      <header className="flex flex-wrap items-end justify-between gap-8 pb-12">
        <ScoreSkeleton />
        <div className="flex gap-2">
          <Bar className="h-7 w-36" />
          <Bar className="h-7 w-40" />
        </div>
      </header>
      <section className="hairline py-10">
        <Bar className="h-5 w-48" />
        <RowsSkeleton rows={3} />
      </section>
    </div>
  );
}
