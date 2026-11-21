import { NextResponse, type NextRequest } from "next/server";

function prefersMarkdown(accept: string) {
  const types = accept.split(",").map((t) => t.trim().split(";")[0]);
  const md = types.indexOf("text/markdown");
  const html = types.indexOf("text/html");
  return md !== -1 && (html === -1 || md < html);
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.searchParams.get("view") === "machine") {
    return NextResponse.rewrite(new URL("/machine", request.url));
  }
  if (prefersMarkdown(request.headers.get("accept") ?? "")) {
    return NextResponse.rewrite(new URL("/index.md", request.url));
  }
  const res = NextResponse.next();
  res.headers.set("Link", '</index.md>; rel="alternate"; type="text/markdown", </llms.txt>; rel="describedby"; type="text/plain"');
  return res;
}

export const config = { matcher: "/" };
