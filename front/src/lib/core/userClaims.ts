/**
 * Claims do aluno logado, buscados no servidor.
 *
 * O JWT vive só no cookie `user_data` HttpOnly, que o JavaScript não consegue ler — é o que
 * impede um script na página de levar a sessão embora. Então o cliente não decodifica nada:
 * pergunta a `GET /api/user/me`, e o servidor devolve apenas os campos de exibição.
 *
 * O tipo é declarado aqui, e não importado da rota, para não arrastar código de servidor para
 * dentro do bundle do navegador. Precisa acompanhar `src/app/api/user/me/route.ts`.
 *
 * CACHE STRATEGY: no-store — dado de sessão, muda com login, logout e ativação de tier
 */

export interface UserClaims {
    id: string | null;
    nome: string | null;
    email: string | null;
    /** Já normalizado pelo servidor: `FREE` | `SIMULAPRO` | `TEACHER` | `ADMIN`. */
    tier: string;
    newsletter: boolean;
}

/**
 * Devolve os claims, ou `null` quando não há sessão (401) ou a rota falhou.
 *
 * Não lança: quem chama é efeito de tela, e uma falha aqui significa "trate como deslogado",
 * nunca "quebre a página".
 */
export async function fetchUserClaims(signal?: AbortSignal): Promise<UserClaims | null> {
    try {
        const response = await fetch('/api/user/me', { cache: 'no-store', signal });

        if (!response.ok) return null;

        return (await response.json()) as UserClaims;
    } catch {
        return null;
    }
}

/**
 * Avisa a aba inteira que a sessão mudou.
 *
 * `storage` só dispara em OUTRAS abas; na mesma aba — caso da ativação de assinatura em
 * `/paidPlan` — quem avisa é este evento.
 */
export const USER_SYNCED_EVENT = 'user_synced';

export function notifyUserSynced(): void {
    window.dispatchEvent(new CustomEvent(USER_SYNCED_EVENT));
}
