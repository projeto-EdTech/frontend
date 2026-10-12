/**
 * Renderização da aba "Revisão" do perfil (`src/components/profile/RevisaoIA.tsx`).
 *
 * O componente anterior (`Simula_PRO/Questoes_Gemini.tsx`) existia, mas nenhuma tela o montava:
 * a explicação de gabarito por IA não tinha como ser disparada. Estes testes renderizam a tela
 * no servidor (`renderToStaticMarkup`, sem DOM) e conferem o que o aluno vê em cada estado.
 *
 * Vitest, ambiente node.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import RevisaoIA, { type ReviewableQuestion } from '../src/components/profile/RevisaoIA';
import { FREE_DAILY_EXPLANATIONS } from '../src/lib/core/aiQuota';

const tier = vi.hoisted(() => ({ isPro: false, loading: false }));

vi.mock('@/hooks/useUserTier', () => ({
    useUserTier: () => ({ tier: tier.isPro ? 'SIMULAPRO' : 'FREE', ...tier }),
}));

// O real importa o CSS do KaTeX, que o Vitest mandaria para o PostCSS do Tailwind.
vi.mock('@/components/Simula_PRO/DynamicMarkdown', () => ({
    default: ({ children }: { children: string }) => <div>{children}</div>,
}));

vi.mock('next/image', () => ({
    // eslint-disable-next-line @next/next/no-img-element -- dublê de teste, fora do Next
    default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));

const QUESTAO: ReviewableQuestion = {
    id: 'q1',
    enunciado: 'Um fio condutor é percorrido por uma corrente...',
    suaResposta: '1 A',
    gabarito: '2×10⁻⁸ A',
    displayLabel: 'FUVEST 2025',
    displaySubject: 'Física — Eletromagnetismo',
};

function renderizar(questoes: ReviewableQuestion[] = [QUESTAO]) {
    const grupos = new Map<string, ReviewableQuestion[]>();
    for (const q of questoes) grupos.set(q.displaySubject, [...(grupos.get(q.displaySubject) ?? []), q]);

    return renderToStaticMarkup(
        <RevisaoIA
            groupedQuestions={grupos}
            selectedSubject={questoes[0]?.displaySubject ?? ''}
            setSelectedSubject={() => {}}
            currentQuestionIndex={0}
            setCurrentQuestionIndex={() => {}}
            universityLogoUrl="logos/fuvest.png"
        />,
    );
}

beforeEach(() => {
    tier.isPro = false;
    tier.loading = false;
});

describe('RevisaoIA', () => {
    it('1. sem questões erradas, mostra o estado vazio em vez de uma tela quebrada', () => {
        const html = renderizar([]);

        expect(html).toContain('Nenhuma questão para revisar');
        expect(html).not.toContain('Explicar o gabarito com IA');
    });

    it('2. mostra enunciado, resposta do aluno e gabarito lado a lado', () => {
        const html = renderizar();

        expect(html).toContain(QUESTAO.enunciado);
        expect(html).toContain('Sua resposta');
        expect(html).toContain(QUESTAO.suaResposta);
        expect(html).toContain('Gabarito');
        expect(html).toContain(QUESTAO.gabarito);
    });

    it('3. o botão de gerar explicação está na tela e habilitado', () => {
        const html = renderizar();

        expect(html).toMatch(/<button[^>]*type="button"[^>]*>Explicar o gabarito com IA<\/button>/);
        expect(html).not.toMatch(/<button[^>]*disabled=""[^>]*>Explicar o gabarito com IA/);
    });

    it('4. FREE vê o limite diário antes do primeiro uso', () => {
        const html = renderizar();

        expect(html).toContain(`Plano gratuito: ${FREE_DAILY_EXPLANATIONS} explicações por dia`);
    });

    it('5. PRO vê que não tem limite', () => {
        tier.isPro = true;

        const html = renderizar();

        expect(html).toContain('Simula PRO: sem limite');
        expect(html).not.toContain('Plano gratuito');
    });

    it('6. logo sem barra inicial é normalizado para o next/image', () => {
        const html = renderizar();

        expect(html).toContain('src="/logos/fuvest.png"');
    });
});
