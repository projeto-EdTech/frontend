/**
 * Constantes da cota de explicação por IA que a tela também precisa.
 *
 * Mora separado de `src/app/service/aiExplanationQuota.ts` porque aquele arquivo importa
 * `node:crypto` — importá-lo num componente cliente levaria o módulo do Node para o bundle do
 * navegador e quebraria o build.
 */

/** Explicações por dia do aluno FREE (a especificação da feature fixa 5). PRO não tem cota. */
export const FREE_DAILY_EXPLANATIONS = 5;

/** Header em que `/api/generate-explanation` devolve o saldo: número ou `unlimited`. */
export const AI_QUOTA_HEADER = 'X-AI-Quota-Remaining';
