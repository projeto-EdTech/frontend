import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { decodeJWT } from "@/app/service/jwtDecoder";

export async function POST(req: Request) {
  // Obtém o token da sessão (JWT decodificado pelo next-auth)
  // getToken typing expects NextRequest/NextApiRequest; cast via unknown -> NextRequest to avoid 'any'
  const token = await getToken({ req: req as unknown as NextRequest, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token?.googleAccount) {
    console.log("[sync-user][ABORT] googleAccount ausente no token");
    return NextResponse.json(
      { message: "Não autorizado: token de acesso não encontrado" },
      { status: 401 }
    );
  }

  if (!process.env.BACKEND_API_URL) {
    console.log("[sync-user][ERROR] BACKEND_API_URL ausente");
    return NextResponse.json(
      { message: "BACKEND_API_URL não configurada" },
      { status: 500 }
    );
  }

  try {
    const idToken = (token.googleAccount as any)?.id_token;

    if (!idToken) {
      console.log("[sync-user][ABORT] id_token ausente no googleAccount");
      return NextResponse.json(
        { message: "Não autorizado: id_token não encontrado" },
        { status: 401 }
      );
    }

    // Monta o payload enviando apenas o id_token conforme solicitado
    const payload = {
      token: idToken
    };

    // Faz a chamada ao backend na rota especificada
    const response = await fetch(`${process.env.BACKEND_API_URL}/auth/google`, {
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

    if (!response.ok) {
      // Sem repassar `backendData`: o corpo do Java pode carregar host, stack ou nome de
      // classe interna, e esta é a única barreira entre ele e a tela do aluno.
      console.error("[sync-user][ERROR] Backend respondeu", response.status, backendData);
      return NextResponse.json(
        { message: "Não foi possível sincronizar sua conta. Tente novamente." },
        { status: response.status }
      );
    }

    // O backend envia o JWT como string crua ou como { token: "..." }.
    const tokenFromBackend = typeof backendData === "string" ? backendData : backendData?.token;

    // O JWT **não volta no corpo**. Ele vai só para o cookie HttpOnly, que o JavaScript não
    // consegue ler — é o que impede o navegador de guardar uma segunda cópia no localStorage.
    // Quem precisa dos claims na tela pergunta a `GET /api/user/me`.
    const decoded = tokenFromBackend ? decodeJWT(tokenFromBackend) : null;

    const responseNext = NextResponse.json(
      { ok: Boolean(tokenFromBackend), id: decoded?.id ?? null, tipo: decoded?.tipo ?? null },
      { status: 200 }
    );

    if (tokenFromBackend) {
      responseNext.cookies.set("user_data", tokenFromBackend, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 // 30 dias
      });
    }

    return responseNext;

  } catch (e) {
    console.error("[sync-user][EXCEPTION]", e);
    return NextResponse.json(
      { message: "Erro interno ao conectar com backend" },
      { status: 500 }
    );
  }
}