import posthog from 'posthog-js';

/**
 * analytics.ts — Serviço centralizado de eventos Google Analytics 4 (GA4)
 *
 * Por que este arquivo existe?
 *   - Garante que nenhum componente chame window.gtag() diretamente,
 *     evitando erros em SSR (Server Side Rendering) do Next.js onde
 *     `window` não existe.
 *   - Centraliza a lógica de guard (canTrack) e naming dos eventos,
 *     facilitando manutenção e testes futuros.
 *   - O GA4 só é carregado em produção (NODE_ENV === 'production'), então
 *     todas as funções aqui são no-ops seguros em desenvolvimento.
 *
 * Como usar:
 *   import { setUserId, trackLogin } from '@/lib/analytics';
 *   setUserId(decoded.id);
 *   trackLogin('google');
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

/**
 * Guard interno — retorna true somente quando window.gtag está disponível.
 * Protege contra: ambiente SSR, dev sem GA4 carregado, e ad-blockers.
 */
const canTrack = (): boolean =>
  typeof window !== 'undefined' && typeof window.gtag === 'function';

/**
 * Guard para Microsoft Clarity
 */
const canTrackClarity = (): boolean =>
  typeof window !== 'undefined' && typeof window.clarity === 'function';

// ─────────────────────────────────────────────────────────────────────────────
// Identidade do usuário
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Identifica o usuário em todas as plataformas de analytics.
 *
 * @param userId UUID do usuário retornado pelo backend (campo `id` do JWT)
 * @param tier Plano do usuário (campo `tipo` do JWT)
 */
export const setUserId = (userId: string, tier?: string): void => {
  // 1. Google Analytics 4
  if (canTrack()) {
    window.gtag('set', { user_id: userId });
  }

  // 2. Microsoft Clarity (Custom Identification)
  if (canTrackClarity()) {
    window.clarity?.('identify', userId, {
      tier: tier || 'unknown',
      origin: 'vestibuline_app'
    });
  }

  // 3. PostHog
  if (typeof window !== 'undefined') {
    posthog.identify(userId, {
      tier: tier || 'unknown',
      $set: { tier: tier || 'unknown' }
    });
  }
};

/**
 * Remove a identificação do usuário (usado no logout).
 */
export const resetAnalytics = (): void => {
  if (typeof window !== 'undefined') {
    posthog.reset();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Eventos de autenticação
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dispara o evento padrão `login` do GA4 após autenticação bem-sucedida.
 *
 * @param method Provedor utilizado: 'google' | 'azure-ad' | 'facebook' | 'discord' | 'oauth'
 */
export const trackLogin = (method: string): void => {
  if (canTrack()) {
    window.gtag('event', 'login', { method });
  }

  // PostHog
  if (typeof window !== 'undefined') {
    posthog.capture('user_login', { method });
  }
};
