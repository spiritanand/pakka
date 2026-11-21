import type { Metadata } from "next";
import Link from "next/link";
import { landingMarkdown } from "@/lib/agent-content";
import { Markdown } from "@/components/markdown";
import { CopyMarkdown } from "./copy-markdown";

export const metadata: Metadata = {
  title: "Pakka · machine view",
  alternates: { canonical: "/", types: { "text/markdown": "/index.md" } },
};

export default async function MachinePage() {
  const markdown = await landingMarkdown();
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-[#0b0f0d] font-mono text-[13.5px] leading-[1.75] text-white/65">
      <article className="mx-auto max-w-3xl px-6 pt-16 pb-32">
        <nav className="mb-10 flex flex-wrap items-center gap-2 text-[12px]">
          <Link href="/" className="rounded-md bg-white px-2.5 py-1 font-medium text-ink">Human view</Link>
          <a href="/index.md" className="rounded-md bg-white/[0.06] px-2.5 py-1 text-white/80 ring-1 ring-white/10 hover:bg-white/10">/index.md</a>
          <a href="/llms.txt" className="rounded-md bg-white/[0.06] px-2.5 py-1 text-white/80 ring-1 ring-white/10 hover:bg-white/10">/llms.txt</a>
          <CopyMarkdown markdown={markdown} />
          <span className="text-white/35">
            or <code className="text-emerald-300">curl -H &quot;Accept: text/markdown&quot; pakka.zwala.dev</code>
          </span>
        </nav>
        <Markdown source={markdown} />
      </article>
    </div>
  );
}
