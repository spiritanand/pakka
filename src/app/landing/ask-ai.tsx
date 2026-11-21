import { Sparkles } from "lucide-react";

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
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-[13px] text-muted">Ask AI about Pakka</span>
      <ul className="flex flex-wrap gap-2">
        {TOOLS.map((t) => (
          <li key={t.name}>
            <a
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line-strong bg-paper px-3.5 text-[13px] font-medium text-ink-2 transition-colors hover:border-ink/30 hover:text-ink sm:h-8"
            >
              <Sparkles size={14} strokeWidth={1.75} aria-hidden className="text-emerald-600" />
              {t.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
