import { NextResponse, NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function POST(req: Request) {
  // Obtém o token da sessão (JWT decodificado pelo next-auth)
  // getToken typing expects NextRequest/NextApiRequest; cast via unknown -> NextRequest to avoid 'any'
  const token = await getToken({ req: req as unknown as NextRequest, secret: process.env.NEXTAUTH_SECRET });

  console.log("[sync-user][TOKEN] token completo (decodificado):", JSON.stringify(token, null, 2));
  console.log("[sync-user][TOKEN] googleAccount:", JSON.stringify(token?.googleAccount, null, 2));

  // JWT bruto completo (string assinada), sem decodificar
  const rawToken = await getToken({
    req: req as unknown as NextRequest,
    secret: process.env.NEXTAUTH_SECRET,
    raw: true,
  });
  console.log("[sync-user][TOKEN] JWT bruto completo:", rawToken);

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
    console.log("[sync-user][GOOGLE] id_token extraído:", idToken);
    console.log("[sync-user][GOOGLE] access_token:", (token.googleAccount as any)?.access_token);
    console.log("[sync-user][GOOGLE] refresh_token:", (token.googleAccount as any)?.refresh_token);

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

    console.log("[sync-user][BFF] enviando payload:", JSON.stringify(payload, null, 2));
    console.log("[sync-user][BFF] URL destino:", `${process.env.BACKEND_API_URL}/auth/google`);

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

    console.log("[sync-user][BFF] status:", response.status);
    console.log("[sync-user][BFF] resposta:", JSON.stringify(backendData, null, 2));

    if (!response.ok) {
       return NextResponse.json(
        {
          message: "Erro no backend ao sincronizar usuário",
          details: backendData,
        },
        { status: response.status }
      );
    }

    // Retorna a resposta exata do backend. 
    // Se o backend envia uma string (JWT), backendData será essa string.
    // Se o backend envia um objeto { token: "..." }, retornamos o objeto.
    const responseNext = NextResponse.json(backendData, { status: 200 });

    const tokenFromBackend = typeof backendData === "string" ? backendData : backendData?.token;
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
      { message: "Erro interno ao conectar com backend", error: String(e) },
      { status: 500 }
    );
  }
}