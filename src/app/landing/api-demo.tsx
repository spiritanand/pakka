import { ensureMigrated } from "@/lib/auth";
import { trustReport } from "@/lib/trust-report";
import { Terminal, type Token } from "./terminal";

const DEMO_PAN = "CHVPP4321L";

const FALLBACK = {
  name: "Priya (design studio)",
  pan: "CHVXXXX21L",
  score: 695,
  band: "Reliable",
  breakdown: { identity: 150, track: 328, reliability: 217, penalties: 0, cascade: 0, vouches: 0 },
  vouched_by: [],
  last_outcome: { type: "DELIVERED", rupees: 18000 },
};

function tokenize(json: string): Token[][] {
  return json.split("\n").map((line) => {
    const out: Token[] = [];
    const re = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?)|(true|false|null)|([{}[\],:])|(\s+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(line))) {
      if (m[1] && m[2]) out.push({ t: m[1], k: "key" }, { t: m[2], k: "punct" });
      else if (m[1]) out.push({ t: m[1], k: "string" });
      else if (m[3]) out.push({ t: m[3], k: "number" });
      else if (m[4]) out.push({ t: m[4], k: "literal" });
      else if (m[5]) out.push({ t: m[5], k: "punct" });
      else if (m[6]) out.push({ t: m[6], k: "space" });
    }
    return out;
  });
}

function compactJson(obj: Record<string, unknown>) {
  const inner = Object.entries(obj).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v).replace(/,"/g, ', "').replace(/":/g, '": ')}`);
  return `{\n${inner.join(",\n")}\n}`;
}

export async function ApiDemo() {
  await ensureMigrated();
  const live = trustReport(DEMO_PAN, 2);
  const body = live
    ? {
        name: live.subject.name,
        pan: live.subject.pan,
        score: live.score,
        band: live.band,
        breakdown: live.breakdown,
        vouched_by: live.vouched_by,
        last_outcome: live.recent_outcomes.slice(0, 1).map(({ type, rupees }) => ({ type, rupees }))[0] ?? null,
      }
    : FALLBACK;
  return (
    <Terminal
      command={`curl pakka.zwala.dev/api/trust/${DEMO_PAN}`}
      copy={`curl https://pakka.zwala.dev/api/trust/${DEMO_PAN}`}
      lines={tokenize(compactJson(body))}
      live={!!live}
    />
  );
}
