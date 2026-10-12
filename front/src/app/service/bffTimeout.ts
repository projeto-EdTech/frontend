/**
 * Teto de tempo das chamadas ao BFF Java.
 *
 * Sem ele, uma rota só desiste no connect timeout de 10s do undici — e, se o Java aceitar a
 * conexão e não responder, não desiste nunca: a função serverless fica presa e o aluno olha
 * para um carregamento infinito. Toda chamada ao BFF passa `signal: bffTimeoutSignal()`.
 *
 * `isBffUnreachable` separa "não alcançou o Java" (timeout, DNS, conexão recusada) de bug
 * nosso. É o que decide entre 504 e 500, e o que evita procurar erro de autenticação quando o
 * problema é rede.
 *
 * CACHE STRATEGY: não se aplica — utilitário sem estado
 */

/** Corta antes dos 10s de connect timeout padrão do undici. */
export const BFF_TIMEOUT_MS = 8000;

/** Mensagem única para o navegador quando o BFF não responde a tempo. Sem host, sem stack. */
export const BFF_UNREACHABLE_MESSAGE = 'O servidor demorou para responder. Tente novamente.';

/** Sinal novo a cada chamada: um `AbortSignal.timeout` já disparado não serve para a próxima. */
export function bffTimeoutSignal(ms: number = BFF_TIMEOUT_MS): AbortSignal {
  return AbortSignal.timeout(ms);
}

/** Falha antes de chegar ao Java: timeout nosso, connect timeout do undici, DNS, recusa. */
export function isBffUnreachable(erro: unknown): boolean {
  if (erro instanceof DOMException && erro.name === 'TimeoutError') return true;
  if (erro instanceof Error && erro.name === 'AbortError') return true;
  // O undici embrulha falha de rede em `TypeError: fetch failed` com `cause`. Um TypeError sem
  // `cause` é bug de código ("cannot read properties of undefined"), não rede.
  return erro instanceof TypeError && 'cause' in erro && erro.cause !== undefined;
}
