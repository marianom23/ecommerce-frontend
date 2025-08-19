// app/api/p/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs"; // opcional, explícito

type Params = Promise<{ path: string[] }>;

const API_BASE = (process.env.API_BASE ?? "").replace(/\/+$/, "");
if (!API_BASE) {
  throw new Error("🚨 API_BASE no está definida. Usá API_BASE=http://localhost:8080 en .env.local");
}
if (/^https?:\/\/(localhost|127\.0\.0\.1):3000/.test(API_BASE)) {
  throw new Error("🚨 API_BASE no puede ser 3000. Debe apuntar al BACKEND (p.ej. 8080).");
}

export async function GET   (req: NextRequest, { params }: { params: Params }) { const { path } = await params; return forward(req, path); }
export async function HEAD  (req: NextRequest, { params }: { params: Params }) { const { path } = await params; return forward(req, path); }
export async function POST  (req: NextRequest, { params }: { params: Params }) { const { path } = await params; return forward(req, path); }
export async function PUT   (req: NextRequest, { params }: { params: Params }) { const { path } = await params; return forward(req, path); }
export async function PATCH (req: NextRequest, { params }: { params: Params }) { const { path } = await params; return forward(req, path); }
export async function DELETE(req: NextRequest, { params }: { params: Params }) { const { path } = await params; return forward(req, path); }
export async function OPTIONS() { return NextResponse.json({}, { status: 204 }); }

async function forward(req: NextRequest, path: string[]) {
  const qs = req.nextUrl.searchParams.toString();
  const target = `${API_BASE}/api/${path.map(encodeURIComponent).join("/")}${qs ? `?${qs}` : ""}`;

  // clonar/limpiar headers
  const headers = new Headers(req.headers);
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("authorization");
  if (!headers.get("content-type")) headers.delete("content-type");

  const init: RequestInit & { duplex?: "half" } = {
    method: req.method,
    headers,
    cache: "no-store",
    redirect: "manual",
  };

  // ⚠️ Node 18: si pasás stream como body, agregá duplex: 'half'
  if (!["GET", "HEAD"].includes(req.method)) {
    init.body = req.body as any; // stream
    init.duplex = "half";
  }

  try {
    const r = await fetch(target, init);
    const resp = new NextResponse(r.body, { status: r.status });
    r.headers.forEach((v, k) => resp.headers.set(k, v));
    resp.headers.set("x-proxy-target", target); // para debug en Network
    return resp;
  } catch (e: any) {
    console.error("[/api/p proxy error]", { target, error: e?.message });
    return NextResponse.json(
      { error: "Proxy error", target, detail: e?.message ?? "unknown" },
      { status: 502 }
    );
  }
}
