import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest, ctx: { params: { path: string[] } })  { return forward(req, ctx.params.path); }
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) { return forward(req, ctx.params.path); }
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } })  { return forward(req, ctx.params.path); }
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }){ return forward(req, ctx.params.path); }

async function forward(req: NextRequest, path: string[]) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const jwt = (token as any)?.backendJwt;
  if (!jwt) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const qs = url.searchParams.toString();
  const target = `${process.env.API_BASE}/api/${path.join("/")}${qs ? `?${qs}` : ""}`;

  const r = await fetch(target, {
    method: req.method,
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": req.headers.get("content-type") ?? "",
    },
    body: ["GET","HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
    cache: "no-store",
  });

  const text = await r.text();
  return new NextResponse(text, {
    status: r.status,
    headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
  });
}
