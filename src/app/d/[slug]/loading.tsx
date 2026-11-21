import { Bar, RowsSkeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading deal">
      <header className="pb-10">
        <Bar className="h-8 w-full max-w-xl" />
        <Bar className="mt-4 h-4 w-80 max-w-full" />
      </header>
      <section className="section">
        <Bar className="h-5 w-40" />
        <RowsSkeleton rows={3} />
      </section>
    </div>
  );
}
