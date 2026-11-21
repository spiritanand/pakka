import { ArrowUpRight } from "lucide-react";

const PROMPT = encodeURIComponent(
  "Read https://pakka.zwala.dev/llms.txt and tell me what Pakka does and whether I should use it for my next freelance deal.",
);

const TOOLS = [
  { name: "ChatGPT", href: `https://chatgpt.com/?q=${PROMPT}` },
  { name: "Claude", href: `https://claude.ai/new?q=${PROMPT}` },
  { name: "Perplexity", href: `https://www.perplexity.ai/search?q=${PROMPT}` },
];

export function AskAi() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-meta">
      <span className="text-muted">Ask AI about Pakka</span>
      <ul className="flex flex-wrap gap-x-5">
        {TOOLS.map((t) => (
          <li key={t.name}>
            <a
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-8 items-center gap-0.5 text-ink-2 transition-colors hover:text-ink"
            >
              {t.name}
              <ArrowUpRight size={13} strokeWidth={1.75} aria-hidden className="text-muted" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
