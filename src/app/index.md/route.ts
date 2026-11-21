import { landingMarkdown } from "@/lib/agent-content";

export async function GET() {
  return new Response(await landingMarkdown(), {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=300" },
  });
}
