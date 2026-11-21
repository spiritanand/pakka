import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Landing } from "../landing/landing";

export const metadata: Metadata = {
  title: { absolute: "Pakka: pay a freelancer up front, safely" },
  description:
    "Your money waits with Razorpay until you accept the work. Nothing delivered by the deadline? You get all of it back.",
};

export default function Paying() {
  const demo = db
    .prepare(
      `select d.slug from deals d join user f on f.id = d.freelancer_id
       where f.email = 'rohan@pakka.demo' and d.client_id is null order by d.created_at asc limit 1`,
    )
    .get() as { slug: string } | undefined;
  return <Landing audience="paying" demoHref={demo ? `/d/${demo.slug}` : "#how"} />;
}
