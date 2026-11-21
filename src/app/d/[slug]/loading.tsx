import { Bar, RowsSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading deal">
      <header className="pb-10">
        <Bar className="h-3 w-28" />
        <Bar className="mt-5 h-10 w-full max-w-2xl sm:h-12" />
        <Bar className="mt-5 h-4 w-80 max-w-full" />
      </header>
      <section className="section">
        <Bar className="h-5 w-40" />
        <RowsSkeleton rows={3} />
      </section>
    </div>
  );
}
