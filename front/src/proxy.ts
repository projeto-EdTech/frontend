import { NextResponse, type NextRequest } from 'next/server';

import { parseAllowlist, isAllowed } from '@/lib/core/ip-allowlist';

// Lido em escopo de módulo: mudar ALLOWED_IPS exige redeploy.
const RAW_ALLOWED_IPS = process.env.ALLOWED_IPS?.trim() ?? '';
const RULES = parseAllowlist(RAW_ALLOWED_IPS);

// O gate liga pela PRESENÇA da env, não pelo tamanho da lista: se todas as
// regras forem inválidas (typo), tudo vira 404 em vez de abrir o site.
const GATE_ENABLED = RAW_ALLOWED_IPS.length > 0;

function getClientIp(req: NextRequest): string | null {
  // x-vercel-forwarded-for é escrito pela borda do Vercel e não pode ser forjado
  // pelo cliente; os outros são fallback para self-host / outro proxy na frente.
  return (
    req.headers.get('x-vercel-forwarded-for') ??
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    null
  );
}

export function proxy(req: NextRequest) {
  if (!GATE_ENABLED) return NextResponse.next();
  if (isAllowed(getClientIp(req), RULES)) return NextResponse.next();

  // 404 sem corpo: o domínio precisa parecer deploy inexistente, não site protegido.
  return new NextResponse(null, { status: 404 });
}

export const config = {
  // Cobre tudo — inclusive /_next/static, /_next/image, favicon e public/ — para
  // que nem os chunks provem que o app existe.
  // Exceção: /api/webhooks/* chega dos servidores da Stripe/Mercado Pago, que
  // nunca estarão na allowlist; bloquear ali quebraria a cadeia de pagamento.
  matcher: ['/((?!api/webhooks/).*)'],
};
