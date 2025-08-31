import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest, ctx: { params: { path: string[] } })  { return forward(req, ctx.params.path); }
export async function POST(req: NextRequest, ctx: { params: { path: string[] } }) { return forward(req, ctx.params.path); }
export async function PUT(req: NextRequest, ctx: { params: { path: string[] } })  { return forward(req, ctx.params.path); }
export async function DELETE(req: NextRequest, ctx: { params: { path: string[] } }){ return forward(req, ctx.params.path); }
export async function PATCH(req: NextRequest, ctx: { params: { path: string[] } }) { return forward(req, ctx.params.path); }

export async function OPTIONS(req: NextRequest, ctx: { params: { path: string[] } }) { return forward(req, ctx.params.path); }


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
      Cookie: req.headers.get("cookie") ?? "",           // 👈 reenviá cookies del usuario al backend
    },
    body: ["GET","HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
    cache: "no-store",
  });

  // devolvé el body en streaming y TODOS los headers, incluyendo Set-Cookie
  const resp = new NextResponse(r.body, { status: r.status });

  // ⚠️ Set-Cookie puede venir múltiple. Usá append, no set.
  r.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      // Algunos runtimes agrupan varios Set-Cookie en una sola línea separada por coma.
      // Esto los separa de forma segura: cada cookie tiene un "name=value" sin coma después del '='
      value.split(/,(?=[^;]+=[^;]+)/g).forEach(v => resp.headers.append("set-cookie", v));
    } else {
      resp.headers.set(key, value);
    }
  });

  return resp;
}
