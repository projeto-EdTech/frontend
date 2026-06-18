/**
 * Service de geração de token OTP para vinculação com o Discord.
 *
 * Camada de serviço pura (sem React/hooks). Chama o BFF Java que gera um token
 * de uso único no formato `VEST-XXXXX` (validade 5 min). Ver fluxo "Sync-User"
 * (Abordagem 1 do Token_Validation.md).
 */

export interface GenerateTokenResponse {
  token: string;
}

/**
 * Solicita ao BFF a geração de um token OTP para o usuário informado.
 *
 * @param userId ID do usuário extraído do JWT da sessão.
 * @param jwt    Token JWT da sessão, repassado como Bearer ao BFF.
 * @returns      Objeto `{ token }` com o token no formato `VEST-XXXXX`.
 * @throws       Erro descritivo (sem detalhes internos) em falha de configuração ou resposta não-ok.
 */
export async function generateDiscordToken(
  userId: string,
  jwt: string,
): Promise<GenerateTokenResponse> {
  const backendApiUrl = process.env.BACKEND_API_URL;
  if (!backendApiUrl) {
    throw new Error('BACKEND_API_URL não configurado.');
  }

  const response = await fetch(`${backendApiUrl}/api/users/generate-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ userId }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao gerar token do Discord (status ${response.status}).`,
    );
  }

  const data = (await response.json()) as Partial<GenerateTokenResponse>;
  if (!data?.token) {
    throw new Error('Resposta do backend não contém um token válido.');
  }

  return { token: data.token };
}
