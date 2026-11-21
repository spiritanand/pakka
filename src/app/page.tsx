import Link from "next/link";

export default function Landing() {
  return (
    <section className="py-16">
      <h1 className="text-5xl font-bold tracking-tight">Whoever moves first is exposed.</h1>
      <p className="mt-4 text-lg text-black/70">Pakka holds the money on Razorpay until the work lands.</p>
      <Link href="/login" className="btn mt-8">Get started</Link>
    </section>
  );
}
