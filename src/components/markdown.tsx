import type { ReactNode } from "react";
import Link from "next/link";
import { SITE } from "@/lib/agent-content";

const linkClass = "text-white underline decoration-white/30 underline-offset-4 hover:decoration-emerald-400";

function MdLink({ href, children }: { href: string; children: ReactNode }) {
  const path = href.startsWith(SITE) ? href.slice(SITE.length) || "/" : href;
  const page = path.startsWith("/") && !/^\/(api\/|index\.md|llms\.txt)/.test(path);
  if (page) return <Link href={path} className={linkClass}>{children}</Link>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>{children}</a>;
}

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      out.push(
        <MdLink key={m.index} href={m[2]}>
          {m[1]}
        </MdLink>,
        <span key={`${m.index}u`} className="text-white/40"> {m[2]}</span>,
      );
    } else if (m[3]) out.push(<b key={m.index} className="font-medium text-white">{m[3]}</b>);
    else if (m[4]) out.push(<code key={m.index} className="text-emerald-300">{m[4]}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks: ReactNode[] = [];
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const body: string[] = [];
      while (++i < lines.length && !lines[i].startsWith("```")) body.push(lines[i]);
      blocks.push(
        <pre key={i} className="my-4 overflow-x-auto rounded-lg bg-white/[0.04] p-4 text-[12.5px] leading-relaxed text-emerald-200/90 ring-1 ring-white/10">
          {body.join("\n")}
        </pre>,
      );
    } else if (line.startsWith("# ")) blocks.push(<h1 key={i} className="mb-6 text-lg font-semibold text-white">{line.slice(2)}</h1>);
    else if (line.startsWith("## ")) blocks.push(<h2 key={i} className="mt-10 mb-3 font-semibold text-white">{line.slice(3)}</h2>);
    else if (line.startsWith("> ")) blocks.push(<p key={i} className="my-3 border-l border-emerald-400/50 pl-4 text-white/80">{inline(line.slice(2))}</p>);
    else if (/^(- |\d+\. )/.test(line)) blocks.push(<p key={i} className="my-1.5 pl-5 -indent-5">{inline(line)}</p>);
    else if (line.startsWith("|")) {
      if (!/^\|[-| ]+\|$/.test(line)) blocks.push(<p key={i} className="whitespace-pre text-white/70">{line}</p>);
    } else if (line.trim()) blocks.push(<p key={i} className="my-3">{inline(line)}</p>);
  }
  return <>{blocks}</>;
}
