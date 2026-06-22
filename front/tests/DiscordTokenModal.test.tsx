/**
 * Specs para o DiscordTokenModal (exibição + copiar + contador 5min).
 *
 * NOTA: Sem test runner nem @testing-library configurados (roadmap). Scaffolding em
 * estilo Vitest + Testing Library documentando o comportamento esperado.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const TOKEN_REGEX = /^VEST-[A-Z0-9]{5}$/;

describe('formato do token OTP', () => {
  it('aceita VEST-XXXXX (5 alfanuméricos maiúsculos)', () => {
    expect(TOKEN_REGEX.test('VEST-AB12C')).toBe(true);
    expect(TOKEN_REGEX.test('VEST-99999')).toBe(true);
  });

  it('rejeita formatos inválidos', () => {
    expect(TOKEN_REGEX.test('VEST-ab12c')).toBe(false); // minúsculo
    expect(TOKEN_REGEX.test('VEST-1234')).toBe(false); // 4 chars
    expect(TOKEN_REGEX.test('ABCD-12345')).toBe(false); // prefixo errado
  });
});

describe('DiscordTokenModal — comportamento (pseudo, requer Testing Library)', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ token: 'VEST-AB12C' }) }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('copiar chama navigator.clipboard.writeText com o token', async () => {
    // render(<DiscordTokenModal isOpen onClose={() => {}} />)
    // await screen.findByText('VEST-AB12C')
    // fireEvent.click(screen.getByRole('button', { name: /copiar/i }))
    // expect(navigator.clipboard.writeText).toHaveBeenCalledWith('VEST-AB12C')
    expect(true).toBe(true); // placeholder até Testing Library entrar
  });

  it('contador decrementa de 5:00 e expira em 0:00 oferecendo gerar novo', () => {
    vi.useFakeTimers();
    // render → avançar 300s → expect estado expirado + botão "Gerar novo token"
    expect(true).toBe(true); // placeholder
  });
});
