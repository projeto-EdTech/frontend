/**
 * Encaminhamento das rotas de pagamento para o BFF Java.
 *
 * A cadeia de pagamento vive inteira no Java (`docs/Pauta_para_reuniao.md` §2): é ele que
 * resolve o preço, cria a cobrança na gateway, consulta se o pagamento aconteceu, confere a
 * titularidade contra a sessão e ativa o tier no banco. O Next é o proxy fino que o `CLAUDE.md`
 * sempre definiu — recebe, encaminha, devolve.
 *
 * Este módulo existe para que as cinco rotas de pagamento não repitam o mesmo `BACKEND_API_URL`
 * + `Authorization: Bearer` + tratamento de erro à mão.
 *
 * **Nada de erro do BFF é repassado ao navegador.** Acima de 2xx a resposta é substituída por
 * uma mensagem genérica do próprio status: o corpo do Java pode carregar host, stack ou nome de
 * classe interna, e essa é a única barreira entre ele e a tela do aluno.
 *
 * CACHE STRATEGY: no-store — dados financeiros, sem cache (exceto o catálogo, ver `revalidate`)
 */

/** Endpoints do BFF que compõem a cadeia de pagamento. */
export const BFF_PAYMENT_PATHS = {
    plans: '/plans',
    checkoutCard: '/subscriptions/checkout/card',
    checkoutPix: '/subscriptions/checkout/pix',
    checkoutBoleto: '/subscriptions/checkout/boleto',
    activate: '/subscriptions/activate',
} as const;

export interface BffCallOptions {
    method?: 'GET' | 'POST';
    /** Serializado como JSON. Ausente em `GET`. */
    body?: unknown;
    /** JWT do aluno (cookie `user_data`). Ausente no catálogo, que é público. */
    userToken?: string | null;
    /** Segundos de cache. Sem isto, `no-store` — o padrão para dado financeiro. */
    revalidate?: number;
}

export interface BffCallResult {
    status: number;
    data: unknown;
}

/**
 * Mensagens por status. Genéricas de propósito: quem lê a resposta é o navegador do aluno.
 *
 * `error` e `message` andam juntas porque as telas atuais leem chaves diferentes — o cartão e a
 * ativação leem `error`, PIX e boleto leem `message`.
 */
const MENSAGEM_POR_STATUS: Record<number, string> = {
    400: 'Dados inválidos para o pagamento.',
    401: 'Não autorizado.',
    403: 'Não autorizado.',
    404: 'Pagamento não encontrado.',
    409: 'Pagamento não concluído.',
    503: 'Serviço de pagamento indisponível. Tente novamente.',
};

const MENSAGEM_PADRAO = 'Não foi possível processar o pagamento. Tente novamente.';

function erroGenerico(status: number): BffCallResult {
    const mensagem = MENSAGEM_POR_STATUS[status] ?? MENSAGEM_PADRAO;

    return { status, data: { error: mensagem, message: mensagem } };
}

/**
 * Chama o BFF e devolve status e corpo já sanitizados.
 *
 * Sucesso (2xx) passa inteiro: é o `clientSecret`, o QR code ou o resultado da ativação, e o
 * cliente depende do formato exato. Qualquer outra coisa vira mensagem genérica.
 *
 * Nunca lança: falha de rede e `BACKEND_API_URL` ausente viram 503, porque uma rota de pagamento
 * derrubando com exceção não diz nada útil a quem está com o cartão na mão.
 */
export async function callBff(path: string, options: BffCallOptions = {}): Promise<BffCallResult> {
    const { method = 'POST', body, userToken, revalidate } = options;

    const baseUrl = process.env.BACKEND_API_URL;

    if (!baseUrl) {
        console.error('[BFF_PAYMENTS] BACKEND_API_URL não configurada.');
        return erroGenerico(503);
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (userToken) {
        headers.Authorization = `Bearer ${userToken}`;
    }

    const init: RequestInit & { next?: { revalidate: number } } = {
        method,
        headers,
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        ...(revalidate === undefined ? { cache: 'no-store' } : { next: { revalidate } }),
    };

    let response: Response;

    try {
        response = await fetch(`${baseUrl}${path}`, init);
    } catch (error: unknown) {
        // Sem repassar a mensagem: ela costuma trazer host e porta do BFF.
        console.error(`[BFF_PAYMENTS] Falha de comunicação em ${path}`, error);
        return erroGenerico(503);
    }

    if (!response.ok) {
        console.error(`[BFF_PAYMENTS] BFF respondeu HTTP ${response.status} em ${path}`);
        return erroGenerico(response.status);
    }

    const data = await response.json().catch(() => null);

    return { status: response.status, data };
}

/**
 * Saneamento do corpo de uma criação de cobrança — por **allowlist**.
 *
 * A regra que sustenta o fluxo inteiro é essa: o cliente identifica (`planId`), o servidor
 * decide (preço, status, titularidade). Uma lista de campos proibidos aplicaria a regra só aos
 * nomes que alguém lembrou de prever — `valor`, `preco` ou `desconto` passariam por não estarem
 * nela. Aqui o corpo é **remontado do zero** com o que o contrato prevê, e tudo que não estiver
 * previsto é descartado por não ter sido pedido.
 *
 * O e-mail do pagador fica de fora de propósito: ele precisa ser o da sessão, e quem tem a sessão
 * autenticada é o Java. Deixar o navegador escolher esse campo é o que fazia um aluno digitar um
 * e-mail diferente do da conta, pagar, e ser barrado na ativação por titularidade divergente.
 */

const CAMPOS_DO_PAGADOR = ['first_name', 'last_name'] as const;

const CAMPOS_DA_IDENTIFICACAO = ['type', 'number'] as const;

/** Só o boleto manda endereço — o Mercado Pago exige para boleto registrado. */
const CAMPOS_DO_ENDERECO = [
    'zip_code',
    'street_name',
    'street_number',
    'neighborhood',
    'city',
    'federal_unit',
] as const;

/** Objeto simples ou `{}`. Array e `null` não são corpo de requisição válido aqui. */
function objeto(valor: unknown): Record<string, unknown> {
    if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) return {};

    return valor as Record<string, unknown>;
}

/** Copia apenas as chaves previstas que existem na origem. Ausente continua ausente. */
function apenas(
    origem: Record<string, unknown>,
    chaves: readonly string[]
): Record<string, unknown> {
    const saida: Record<string, unknown> = {};

    for (const chave of chaves) {
        if (chave in origem) saida[chave] = origem[chave];
    }

    return saida;
}

export function sanitizeCheckoutBody(body: unknown): unknown {
    const corpo = objeto(body);
    const saneado: Record<string, unknown> = {};

    if (typeof corpo.planId === 'string') saneado.planId = corpo.planId;

    if ('payer' in corpo) {
        const origem = objeto(corpo.payer);
        const payer = apenas(origem, CAMPOS_DO_PAGADOR);

        if ('identification' in origem) {
            payer.identification = apenas(objeto(origem.identification), CAMPOS_DA_IDENTIFICACAO);
        }

        if ('address' in origem) {
            payer.address = apenas(objeto(origem.address), CAMPOS_DO_ENDERECO);
        }

        saneado.payer = payer;
    }

    return saneado;
}
