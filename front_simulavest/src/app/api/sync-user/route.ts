import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  // Debug inicial: loga o método, URL e alguns headers úteis
  console.log("[sync-user][START]", {
    method: req.method,
    url: req.url,
    ua: req.headers.get("user-agent"),
    time: new Date().toISOString(),
  });

  // Obtém o token da sessão (JWT decodificado pelo next-auth)
  // getToken typing expects NextRequest/NextApiRequest; cast via unknown -> NextRequest to avoid 'any'
  const token = await getToken({ req: req as unknown as NextRequest, secret: process.env.NEXTAUTH_SECRET });

  // Logs detalhados do token (não use em produção se contiver info sensível)
  console.log("[sync-user][TOKEN RAW]", token);
  console.log("[sync-user][TOKEN FIELDS]", {
    email: token?.email,
    name: token?.name,
    sub: token?.sub,
    // Use unknown-based assertion to avoid 'any' lint error
    picture: (token as unknown as { picture?: string })?.picture,
  });

  if (!token?.email) {
    console.log("[sync-user][ABORT] Email ausente no token");
    return NextResponse.json(
      { message: "Não autorizado: e-mail não encontrado" },
      { status: 401 }
    );
  }

  const displayName = token.name ?? token.email.split("@")[0];

  const backendUrl = process.env.BACKEND_API_URL;
  if (!backendUrl) {
    console.log("[sync-user][ERROR] BACKEND_API_URL ausente");
    return NextResponse.json(
      { message: "BACKEND_API_URL não configurada" },
      { status: 500 }
    );
  }

  // Tenta ler um body JSON opcional que pode conter `profileIcon`.
  // Não falha se o body estiver ausente ou não for JSON.
  let profileIcon: string | undefined = undefined;
  try {
    const body = await req.json();
    console.log("[sync-user][REQ BODY]", body);
    if (body && typeof body.profileIcon === "string") {
      profileIcon = body.profileIcon;
    }
  } catch (err) {
    // Se não for JSON ou houver erro, apenas logamos e continuamos.
    console.log("[sync-user][REQ BODY PARSE ERROR]", String(err));
  }

  try {
    console.log("[sync-user][FETCH] Enviando para backend", {
      backendUrl,
      name: displayName,
      email: token.email,
      profileIcon,
    });

    const payload: Record<string, unknown> = {
      nome: displayName,
      email: token.email,
    };
    if (profileIcon) payload.profileIcon = profileIcon;

    const response = await fetch(`${backendUrl}/api/auth`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BACKEND_API_KEY ?? ""}`,
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type") || "";
    const hasBody =
      (response.headers.get("content-length") ?? "0") !== "0" ||
      contentType.includes("application/json");

    if (!response.ok) {
      let errorData: unknown = null;
      if (hasBody) {
        try {
          errorData = contentType.includes("application/json")
            ? await response.json()
            : await response.text();
        } catch { /* ignore */ }
      }
      console.log("[sync-user][BACKEND ERROR]", response.status, errorData);
      return NextResponse.json(
        {
          message: "Erro no backend",
          status: response.status,
          details: errorData,
        },
        { status: response.status }
      );
    }

    let backendData: unknown = null;
    if (hasBody) {
      try {
        backendData = contentType.includes("application/json")
          ? await response.json()
          : await response.text();
      } catch { /* ignore */ }
    }

    console.log("[sync-user][SUCCESS]");
    return NextResponse.json(
      { message: "Usuário sincronizado!", data: backendData },
      { status: 200 }
    );
  } catch (e) {
    console.log("[sync-user][EXCEPTION]", e);
    return NextResponse.json(
      { message: "Erro interno", error: String(e) },
      { status: 500 }
    );
  }
}