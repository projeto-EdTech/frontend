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
  
  if (!token?.email) {
    console.log("[sync-user][ABORT] Email ausente no token");
    return NextResponse.json(
      { message: "Não autorizado: e-mail não encontrado" },
      { status: 401 }
    );
  }

  const displayName = token.name ?? token.email.split("@")[0];

  if (!process.env.BACKEND_API_URL) {
    console.log("[sync-user][ERROR] BACKEND_API_URL ausente");
    return NextResponse.json(
      { message: "BACKEND_API_URL não configurada" },
      { status: 500 }
    );
  }

  try {
    // Monta o payload conforme solicitado: nome e email
    const payload = {
      nome: displayName,
      email: token.email,
    };

    console.log("[sync-user][FETCH] Enviando para backend (/usuarios/login):", payload);

    // Faz a chamada ao backend na rota especificada
    const response = await fetch(`${process.env.BACKEND_API_URL}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });

    // Tenta ler o corpo da resposta
    const contentType = response.headers.get("content-type") || "";
    let backendData;

    if (contentType.includes("application/json")) {
      backendData = await response.json();
    } else {
      backendData = await response.text();
    }

    console.log("[sync-user][BACKEND RESPONSE]", {
      status: response.status,
      data: backendData
    });

    if (!response.ok) {
       return NextResponse.json(
        {
          message: "Erro no backend ao sincronizar usuário",
          details: backendData,
        },
        { status: response.status }
      );
    }

    // Retorna a resposta exata do backend (id, tipoUsuario, newsLetter)
    return NextResponse.json(backendData, { status: 200 });

  } catch (e) {
    console.error("[sync-user][EXCEPTION]", e);
    return NextResponse.json(
      { message: "Erro interno ao conectar com backend", error: String(e) },
      { status: 500 }
    );
  }
}