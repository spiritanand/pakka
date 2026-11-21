import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

const fontPath = path.join(process.cwd(), "node_modules/@fontsource/ibm-plex-sans/files/ibm-plex-sans-latin-700-normal.woff");

export async function renderMark(px: number) {
  const font = await readFile(fontPath);
  const s = px / 64;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          borderRadius: 14 * s,
        }}
      >
        <div style={{ display: "flex", position: "relative", width: 40 * s, height: 56 * s }}>
          <div
            style={{
              position: "absolute",
              left: 2 * s,
              top: -12 * s,
              fontFamily: "Plex",
              fontWeight: 700,
              fontSize: 60 * s,
              lineHeight: 1,
              color: "#0a0a0a",
            }}
          >
            p
          </div>
          <div
            style={{
              position: "absolute",
              left: 16.5 * s,
              top: 47.5 * s,
              width: 11 * s,
              height: 11 * s,
              borderRadius: 999,
              background: "#059669",
            }}
          />
        </div>
      </div>
    ),
    { width: px, height: px, fonts: [{ name: "Plex", data: font, weight: 700, style: "normal" }] },
  );
}
