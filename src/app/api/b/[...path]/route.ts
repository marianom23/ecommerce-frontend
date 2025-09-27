import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function POST(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function PUT(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function DELETE(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return forward(req, path);
}
export async function OPTIONS(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return forward(req, path);
}

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
      Cookie: req.headers.get("cookie") ?? "",
    },
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
    cache: "no-store",
  });

  const resp = new NextResponse(r.body, { status: r.status });

  r.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      value.split(/,(?=[^;]+=[^;]+)/g).forEach((v) => resp.headers.append("set-cookie", v));
    } else {
      resp.headers.set(key, value);
    }
  });

  return resp;
}
