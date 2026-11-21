import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Landing } from "../landing/landing";

export const metadata: Metadata = {
  title: { absolute: "Pakka: pay a freelancer up front, safely" },
  description:
    "Your money goes to Razorpay, not the freelancer. It's released when you accept the work, and you get all of it back if nothing is delivered by the deadline.",
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
