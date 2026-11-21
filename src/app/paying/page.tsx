import type { Metadata } from "next";
import { Landing } from "../landing/landing";

export const metadata: Metadata = {
  title: "Pakka: pay a freelancer up front, safely",
  description:
    "Your money goes to Razorpay, not the freelancer. It's released when you accept the work, and you get all of it back if nothing is delivered by the deadline.",
};

export default function Paying() {
  return <Landing audience="paying" />;
}
