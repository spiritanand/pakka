const CHECKLIST = [
  { text: "3 logo directions, PNG + SVG", done: true },
  { text: "Colour palette with hex codes", done: true },
  { text: "Editable Figma source shared", done: false },
];

function Check({ done }: { done: boolean }) {
  return done ? (
    <span className="grid size-4 shrink-0 place-items-center rounded-xs bg-emerald-700 text-white">
      <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M2.5 6.2 5 8.5l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  ) : (
    <span className="size-4 shrink-0 rounded-xs border border-line-strong bg-paper" />
  );
}

function Score({ name, role, score }: { name: string; role: string; score: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 px-5 py-4">
      <div>
        <div className="text-sm font-medium text-ink">{name}</div>
        <div className="text-xs text-muted">{role}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight tabular-nums text-ink">{score}</span>
        <span className="chip-amber">Building</span>
      </div>
    </div>
  );
}

export function DealMock() {
  return (
    <div
      aria-label="Example deal: ₹15,000 held by Razorpay"
      role="img"
      className="w-full max-w-[420px] rounded-lg border border-line bg-paper text-left shadow-[0_1px_0_rgba(11,23,18,0.04),0_24px_48px_-24px_rgba(11,23,18,0.28)]"
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
        <span className="text-[13px] font-medium text-ink">Logo for Kettle &amp; Co. café</span>
        <span className="font-mono text-[11px] text-faint">deal_8f2k</span>
      </div>

      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted">Milestone 1 of 2</div>
            <div className="mt-0.5 font-medium text-ink">Brand identity drafts</div>
          </div>
          <span className="chip-emerald">
            <span className="dot" />
            Held by Razorpay
          </span>
        </div>
        <div className="mt-4 text-[32px] leading-none font-semibold tracking-tight tabular-nums text-ink">₹15,000</div>

        <div className="mt-5 text-xs text-muted">Delivered means</div>
        <ul className="mt-2 space-y-2">
          {CHECKLIST.map((c) => (
            <li key={c.text} className="flex items-center gap-2.5 text-[13px] text-ink-2">
              <Check done={c.done} />
              <span className={c.done ? "" : "text-muted"}>{c.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center gap-2 rounded-md bg-wash px-3 py-2 text-xs text-ink-2">
          <span className="size-1.5 rounded-full bg-amber-500" />
          Due 28 Nov. If the client goes quiet for 72h, Rohan is paid.
        </div>
      </div>

      <div className="divide-y divide-line border-t border-line">
        <Score name="Rohan" role="Freelancer, designer" score={323} />
        <Score name="Meera" role="Client, café owner" score={438} />
      </div>
    </div>
  );
}
