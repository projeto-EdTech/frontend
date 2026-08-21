import { describe, it, expect, vi, afterEach } from "vitest";
import {
  normalizeIp,
  ipToBits,
  matchesRule,
  parseAllowlist,
  isAllowed,
} from "../src/lib/core/ip-allowlist";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("normalizeIp", () => {
  it("tira espaço, caixa e porta do IPv4", () => {
    expect(normalizeIp("  203.0.113.10:5678 ")).toBe("203.0.113.10");
  });

  it("tira colchete e porta do IPv6", () => {
    expect(normalizeIp("[2001:DB8::1]:443")).toBe("2001:db8::1");
  });

  it("desfaz o prefixo IPv4-mapeado", () => {
    expect(normalizeIp("::ffff:203.0.113.10")).toBe("203.0.113.10");
  });

  it("não confunde IPv6 puro com IPv4 + porta", () => {
    expect(normalizeIp("2001:db8::1")).toBe("2001:db8::1");
  });
});

describe("ipToBits", () => {
  it("classifica família pelo tamanho da string de bits", () => {
    expect(ipToBits("10.0.0.1")).toHaveLength(32);
    expect(ipToBits("::1")).toHaveLength(128);
  });

  it("converte IPv4 octeto a octeto", () => {
    expect(ipToBits("192.168.0.1")).toBe(
      "11000000" + "10101000" + "00000000" + "00000001",
    );
  });

  it("expande '::' para o endereço cheio", () => {
    expect(ipToBits("::1")).toBe("0".repeat(127) + "1");
    expect(ipToBits("::")).toBe("0".repeat(128));
    expect(ipToBits("2001:db8::1")).toBe(
      ipToBits("2001:0db8:0000:0000:0000:0000:0000:0001"),
    );
  });

  it("aceita IPv4 embutido no fim do IPv6", () => {
    expect(ipToBits("2001:db8::1.2.3.4")).toBe(ipToBits("2001:db8::102:304"));
  });

  it("rejeita endereço inválido", () => {
    expect(ipToBits("256.0.0.1")).toBeNull();
    expect(ipToBits("1.2.3")).toBeNull();
    expect(ipToBits("abc")).toBeNull();
    expect(ipToBits("2001:db8::1::2")).toBeNull();
    expect(ipToBits("2001:db8:0:0:0:0:0:0:1")).toBeNull();
    expect(ipToBits("2001:db8::12345")).toBeNull();
    expect(ipToBits("")).toBeNull();
  });
});

describe("matchesRule", () => {
  it("casa IPv4 exato", () => {
    expect(matchesRule("203.0.113.10", "203.0.113.10")).toBe(true);
    expect(matchesRule("203.0.113.11", "203.0.113.10")).toBe(false);
  });

  it("respeita a fronteira do /24", () => {
    expect(matchesRule("198.51.100.7", "198.51.100.0/24")).toBe(true);
    expect(matchesRule("198.51.101.7", "198.51.100.0/24")).toBe(false);
  });

  it("trata /32 como IP exato e /0 como tudo", () => {
    expect(matchesRule("198.51.100.7", "198.51.100.7/32")).toBe(true);
    expect(matchesRule("198.51.100.8", "198.51.100.7/32")).toBe(false);
    expect(matchesRule("1.2.3.4", "0.0.0.0/0")).toBe(true);
  });

  it("casa IPv6 exato e CIDR", () => {
    expect(matchesRule("::1", "::1")).toBe(true);
    expect(matchesRule("2001:db8::abcd", "2001:db8::/32")).toBe(true);
    expect(matchesRule("2001:db9::abcd", "2001:db8::/32")).toBe(false);
  });

  it("IPv4-mapeado casa com regra IPv4", () => {
    expect(matchesRule("::ffff:203.0.113.10", "203.0.113.10")).toBe(true);
    expect(matchesRule("::ffff:198.51.100.7", "198.51.100.0/24")).toBe(true);
  });

  it("IP com porta é normalizado antes de comparar", () => {
    expect(matchesRule("203.0.113.10:5678", "203.0.113.10")).toBe(true);
  });

  it("famílias diferentes nunca casam", () => {
    expect(matchesRule("10.0.0.1", "::/0")).toBe(false);
    expect(matchesRule("::1", "0.0.0.0/0")).toBe(false);
  });

  it("regra malformada não libera ninguém", () => {
    expect(matchesRule("1.2.3.4", "abc")).toBe(false);
    expect(matchesRule("1.2.3.4", "1.2.3.4/99")).toBe(false);
    expect(matchesRule("1.2.3.4", "1.2.3.4/")).toBe(false);
    expect(matchesRule("1.2.3.4", "/24")).toBe(false);
  });
});

describe("parseAllowlist", () => {
  it("aceita vírgula, ponto-e-vírgula, espaço e quebra de linha", () => {
    expect(parseAllowlist("1.2.3.4, 5.6.7.0/24;::1\n10.0.0.1")).toEqual([
      "1.2.3.4",
      "5.6.7.0/24",
      "::1",
      "10.0.0.1",
    ]);
  });

  it("descarta entrada inválida com aviso, mantendo as válidas", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(parseAllowlist("1.2.3.4,abc,1.2.3.4/99")).toEqual(["1.2.3.4"]);
    expect(warn).toHaveBeenCalledOnce();
  });

  it("env ausente ou vazia vira lista vazia (gate desligado)", () => {
    expect(parseAllowlist(undefined)).toEqual([]);
    expect(parseAllowlist("")).toEqual([]);
    expect(parseAllowlist("   ")).toEqual([]);
  });
});

describe("isAllowed", () => {
  const rules = ["203.0.113.10", "198.51.100.0/24", "2001:db8::/32"];

  it("libera IP coberto por qualquer regra", () => {
    expect(isAllowed("203.0.113.10", rules)).toBe(true);
    expect(isAllowed("198.51.100.200", rules)).toBe(true);
    expect(isAllowed("2001:db8::99", rules)).toBe(true);
  });

  it("bloqueia IP fora da lista", () => {
    expect(isAllowed("9.9.9.9", rules)).toBe(false);
  });

  it("bloqueia quando o IP é desconhecido", () => {
    expect(isAllowed(null, rules)).toBe(false);
    expect(isAllowed(undefined, rules)).toBe(false);
    expect(isAllowed("", rules)).toBe(false);
  });

  it("lista vazia não libera — quem decide ligar o gate é o proxy", () => {
    expect(isAllowed("203.0.113.10", [])).toBe(false);
  });
});
