import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

const fontPath = path.join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff");

export type MarkVariant = "ink" | "light" | "emerald";

const PALETTE: Record<MarkVariant, { bg: string; fg: string; dot: string }> = {
  ink: { bg: "#0b0f0d", fg: "#ffffff", dot: "#10b981" },
  light: { bg: "#ffffff", fg: "#0b0f0d", dot: "#059669" },
  emerald: { bg: "#047857", fg: "#ffffff", dot: "#a7f3d0" },
};

export function Mark({ px, variant, dx = 0, dy = 0 }: { px: number; variant: MarkVariant; dx?: number; dy?: number }) {
  const s = px / 64;
  const c = PALETTE[variant];
  return (
    <div
      style={{
        width: px,
        height: px,
        display: "flex",
        position: "relative",
        background: c.bg,
        borderRadius: 15 * s,
        border: variant === "light" ? `${Math.max(1, 1.5 * s)}px solid #e5e7eb` : "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: (11.5 + dx) * s,
          top: (-8 + dy) * s,
          fontFamily: "Plex",
          fontWeight: 700,
          fontSize: 56 * s,
          lineHeight: 1,
          letterSpacing: 0,
          color: c.fg,
        }}
      >
        p
      </div>
      <div
        style={{
          position: "absolute",
          left: (42.8 + dx) * s,
          top: (31.6 + dy) * s,
          width: 10 * s,
          height: 10 * s,
          borderRadius: 999,
          background: c.dot,
        }}
      />
    </div>
  );
}

async function fonts() {
  return [{ name: "Plex", data: await readFile(fontPath), weight: 700 as const, style: "normal" as const }];
}

export async function renderMark(px: number, variant: MarkVariant = "ink") {
  return new ImageResponse(<Mark px={px} variant={variant} />, { width: px, height: px, fonts: await fonts() });
}

export async function renderSheet() {
  const variants: MarkVariant[] = ["ink", "light", "emerald"];
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24, background: "#f3f4f6", width: "100%", height: "100%" }}>
        <div style={{ display: "flex", gap: 24 }}>
          {variants.map((v) => <Mark key={v} px={180} variant={v} />)}
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
          {variants.map((v) => (
            <div key={v} style={{ display: "flex", gap: 12, alignItems: "flex-end", width: 180 }}>
              <Mark px={64} variant={v} />
              <Mark px={32} variant={v} />
              <Mark px={16} variant={v} />
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 636, height: 340, fonts: await fonts() },
  );
}
