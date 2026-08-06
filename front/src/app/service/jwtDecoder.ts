import { jwtDecode } from 'jwt-decode';

/**
 * Interface representing the structure of your JWT payload.
 * Adjust this interface according to the actual fields in your JWT.
 */
export interface JWTPayload {
  // Standard claims
  sub?: string;
  iat?: number;
  exp?: number;
  
  // Custom claims from backend
  id?: string;
  nome?: string;
  email?: string;
  tipo?: string;        // Tier do usuário (ex: FREE, SIMULAPRO, TEACHER, ADMIN)
  newsletter?: boolean; // Preferência de newsletter
  [key: string]: any;
}

/**
 * Decodes a JWT token string.
 *
 * @param token The JWT token string to decode.
 * @returns The decoded payload as JWTPayload, or null if decoding fails.
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    if (!token) {
      return null;
    }
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Checks if a JWT token is expired.
 *
 * @param token The JWT token string to check.
 * @returns True if the token is expired or invalid, false otherwise.
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true; // Consider invalid/missing exp as expired for safety
  }

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

/**
 * Tiers de acesso da aplicação. Mora aqui, e não no hook, porque o valor nasce do claim
 * `tipo` do JWT — e a regra do projeto é que leitura de JWT vive só neste arquivo.
 */
export type Tier = 'FREE' | 'SIMULAPRO' | 'TEACHER' | 'ADMIN';

/**
 * Traduz o claim `tipo` do BFF para um `Tier` da aplicação.
 *
 * Existe porque a grafia emitida pelo backend Java **não está confirmada**: o `CLAUDE.md`
 * documenta `"Simula PRO"`, o hook comparava com `"SIMULAPRO"`, e a grafia oficial segue como
 * ponto de decisão em aberto (`docs/Pauta_para_reuniao.md` §9). Uma comparação exata contra a
 * grafia errada faz o aluno pagar e continuar FREE na tela — falha cara e silenciosa.
 *
 * Em vez de apostar numa grafia, normaliza: caixa alta, sem espaço, hífen ou underscore.
 * `"Simula PRO"`, `"simula_pro"` e `"SIMULAPRO"` chegam todos ao mesmo lugar.
 *
 * **Fail safe:** qualquer valor não reconhecido vira `FREE`. Errar para menos nega acesso a
 * quem pagou — corrigível e visível. Errar para mais libera conteúdo pago de graça.
 */
export function normalizeTier(tipo: unknown): Tier {
  if (typeof tipo !== 'string') return 'FREE';

  switch (tipo.toUpperCase().replace(/[\s_-]/g, '')) {
    case 'SIMULAPRO':
      return 'SIMULAPRO';
    case 'TEACHER':
      return 'TEACHER';
    case 'ADMIN':
      return 'ADMIN';
    default:
      return 'FREE';
  }
}

/** Tiers que liberam o conteúdo pago. */
export function isPaidTier(tier: Tier): boolean {
  return tier === 'SIMULAPRO' || tier === 'TEACHER' || tier === 'ADMIN';
}
