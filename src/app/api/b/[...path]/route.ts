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

  // Leer el body como arrayBuffer para evitar problemas de decodificación
  const body = await r.arrayBuffer();
  
  // Crear la respuesta con el body decodificado
  const resp = new NextResponse(body, { status: r.status });

  // Copiar headers, pero excluir los de codificación que ya fueron procesados por fetch
  r.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    
    // No copiar headers de codificación (fetch ya los procesó)
    if (lowerKey === "content-encoding" || lowerKey === "content-length") {
      return;
    }
    
    if (lowerKey === "set-cookie") {
      value.split(/,(?=[^;]+=[^;]+)/g).forEach((v) => resp.headers.append("set-cookie", v));
    } else {
      resp.headers.set(key, value);
    }
  });

  return resp;
}
