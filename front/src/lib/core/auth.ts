import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import FacebookProvider from "next-auth/providers/facebook";
import DiscordProvider from "next-auth/providers/discord";
import { normalizeTier } from "@/app/service/jwtDecoder";
import { bffTimeoutSignal } from "@/app/service/bffTimeout";

/**
 * Função responsável por usar o refresh_token para obter um novo access_token do Google.
 * @param token O token JWT atual que contém o refreshToken.
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        // Ensure refreshToken is a string (or empty string) to satisfy URLSearchParams typing
        refresh_token: String(token.refreshToken ?? ""),
      }),
      // Mesmo teto do BFF: um Google lento não pode prender toda requisição autenticada.
      signal: bffTimeoutSignal(),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    // Atualiza o token com os novos valores recebidos do Google
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      // A API do Google retorna expires_in em segundos (ex: 3600), calculamos o novo timestamp de expiração
      expires_at: Math.floor(Date.now() / 1000 + refreshedTokens.expires_in),
      // O Google pode ou não retornar um novo refresh_token; mantenha o antigo se não vier um novo
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
      // O Google só devolve `id_token` no refresh quando o escopo inclui `openid`.
      googleIdToken: refreshedTokens.id_token ?? token.googleIdToken,
    };
  } catch (error) {
    console.error("Erro ao renovar o access token", error);
    // Se a renovação falhar, retorna o token com um erro para que a sessão possa ser invalidada
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          // 'access_type: "offline"' é ESSENCIAL para receber o refresh_token no primeiro login
          access_type: "offline",
          response_type: "code",
          scope:
            "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        },
      },
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/",
  },
  callbacks: {
    // Garantir um tipo consistente de retorno (JWT) em todos os caminhos
    async jwt({ token, account, user }): Promise<JWT> {
      // 1. No primeiro login (quando 'account' está presente)
      if (account && user) {
        console.log("[JWT] Primeiro login. Salvando tokens e dados do usuário.");
        // Calcula expiracao com fallback de 1h quando não fornecida
        const expiresAt =
          typeof account.expires_at === "number"
            ? account.expires_at
            : Math.floor(Date.now() / 1000 + 3600);

        const userEmail = user?.email || token.user?.email || "";
        const userTier = (userEmail === "fegrolla0210@gmail.com" || userEmail === "fegrolla0210@gmail.com") ? "Simula PRO" : "FREE";
        console.log(`[JWT] Definindo tier do usuário (${userEmail}): ${userTier}`);

        // Só o que alguém lê. Guardar o `account` inteiro do Google (id_token, access_token,
        // refresh_token, scope, token_type…) e repetir o access_token em mais dois campos
        // estourava os ~3.9KB por cookie: o NextAuth fatiava a sessão em
        // `next-auth.session-token.0`, `.1`, … e quem lia o cookie inteiro recebia lixo.
        //
        // - `googleIdToken`: o `/api/sync-user` troca pelo JWT do BFF Java. Só o Google emite.
        // - `accessToken` / `refreshToken` / `expires_at`: renovação em `refreshAccessToken`.
        return {
          ...token,
          ...(account.id_token ? { googleIdToken: account.id_token } : {}),
          accessToken: account.access_token,
          expires_at: expiresAt,
          refreshToken: account.refresh_token ?? (token as JWT).refreshToken,
          // Sempre um valor do tipo `Tier`: grafia livre ("Simula PRO") fazia uma tela comparar
          // com 'SIMULAPRO' e outra com "Simula PRO", e o mesmo aluno mudava de plano entre elas.
          tier: normalizeTier(userTier),
          user,
        } as JWT;
      }

      // 2. Em requisições futuras, verifique se o token ainda é válido
      // A expiração é em segundos, então comparamos com o timestamp atual em segundos
      const currentExpiresAt = (token as JWT).expires_at;
      if (typeof currentExpiresAt === "number" && Date.now() < currentExpiresAt * 1000) {
        return token;
      }

      // 3. Se o token expirou, chame a função para renová-lo
      console.log("[JWT] Access token expirado. Tentando renovar...");
      return refreshAccessToken(token);
    },
    
    async session({ session, token }) {
      // 4. Passa os dados do token (que agora está sempre válido) para a sessão
      // Copia campos relevantes do JWT para a sessão. Os tipos personalizados
      // são fornecidos via `src/types/next-auth.d.ts`.
      session.user = token.user as User | undefined;
      if (token.accessToken) session.accessToken = token.accessToken;
      if (token.error) session.error = token.error as string;

      // Se user existir, assegure que tem o campo `tier` (definido na declaração)
      if (session.user) {
        // atribuição segura: cria um objeto novo com o tier quando disponível
        // Normaliza de novo: sessões emitidas antes desta versão ainda carregam "Simula PRO".
        session.user = { ...(session.user as User), tier: normalizeTier(token.tier) } as typeof session.user;
      }
      return session;
    },
  },
};
