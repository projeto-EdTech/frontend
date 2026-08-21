/**
 * Allowlist de IPs — usado pelo gate em `src/proxy.ts`.
 *
 * Sem dependências externas: o proxy roda antes de qualquer rota e não deve
 * arrastar pacote nenhum. Suporta IPv4, IPv6 e CIDR nas duas famílias.
 *
 * O endereço vira uma string de bits ("0"/"1") de 32 ou 128 caracteres: dá para
 * comparar CIDR com um `slice` de prefixo, sem BigInt (o tsconfig mira ES2017).
 */

const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

const IPV4_BITS = 32;
const IPV6_BITS = 128;

function ipv4ToBits(ip: string): string | null {
  const m = IPV4_RE.exec(ip);
  if (!m) return null;

  let bits = "";
  for (let i = 1; i <= 4; i++) {
    const octet = Number(m[i]);
    // "01" e "1" valem o mesmo, mas 256 não existe
    if (octet > 255) return null;
    bits += octet.toString(2).padStart(8, "0");
  }
  return bits;
}

/** Converte os grupos de um lado do IPv6 em bits. Grupo em notação IPv4 só vale no fim. */
function groupsToBits(groups: string[]): string | null {
  let bits = "";

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];

    if (group.includes(".")) {
      if (i !== groups.length - 1) return null;
      const embedded = ipv4ToBits(group);
      if (!embedded) return null;
      bits += embedded;
      continue;
    }

    if (!/^[0-9a-f]{1,4}$/.test(group)) return null;
    bits += parseInt(group, 16).toString(2).padStart(16, "0");
  }

  return bits;
}

function ipv6ToBits(ip: string): string | null {
  if (!ip.includes(":")) return null;
  // "::" só pode aparecer uma vez
  if (ip.indexOf("::") !== ip.lastIndexOf("::")) return null;

  const compressed = ip.includes("::");
  let head: string[];
  let tail: string[] = [];

  if (compressed) {
    const [h, t] = ip.split("::");
    head = h ? h.split(":") : [];
    tail = t ? t.split(":") : [];
  } else {
    head = ip.split(":");
  }

  // IPv4 embutido só é válido no fim do endereço inteiro
  if (tail.length > 0 && head.some((group) => group.includes("."))) return null;

  const headBits = groupsToBits(head);
  const tailBits = groupsToBits(tail);
  if (headBits === null || tailBits === null) return null;

  const used = headBits.length + tailBits.length;
  if (used > IPV6_BITS) return null;
  if (!compressed && used !== IPV6_BITS) return null;

  return headBits + "0".repeat(IPV6_BITS - used) + tailBits;
}

/**
 * Normaliza o IP cru vindo de header: tira espaço, caixa, porta e o prefixo
 * IPv4-mapeado que o Node costuma anexar em socket dual-stack.
 */
export function normalizeIp(raw: string): string {
  let ip = raw.trim().toLowerCase();
  if (!ip) return "";

  // [::1]:443 → ::1
  const bracketed = /^\[([^\]]+)\](?::\d+)?$/.exec(ip);
  if (bracketed) {
    ip = bracketed[1];
  } else if (ip.split(":").length === 2 && IPV4_RE.test(ip.split(":")[0])) {
    // 1.2.3.4:5678 → 1.2.3.4 (um ':' só, senão é IPv6)
    ip = ip.split(":")[0];
  }

  // ::ffff:203.0.113.10 → 203.0.113.10
  if (ip.startsWith("::ffff:") && IPV4_RE.test(ip.slice(7))) {
    ip = ip.slice(7);
  }

  return ip;
}

/**
 * Converte IPv4 ou IPv6 em string de bits (32 ou 128 chars).
 * `null` quando não é endereço válido.
 */
export function ipToBits(ip: string): string | null {
  const normalized = normalizeIp(ip);
  if (!normalized) return null;

  return normalized.includes(":")
    ? ipv6ToBits(normalized)
    : ipv4ToBits(normalized);
}

/** `true` se a regra (IP exato ou CIDR) cobre o IP. Famílias diferentes nunca casam. */
export function matchesRule(ip: string, rule: string): boolean {
  const target = ipToBits(ip);
  if (!target) return false;

  const slash = rule.indexOf("/");

  if (slash === -1) {
    const exact = ipToBits(rule);
    return exact !== null && exact === target;
  }

  const base = ipToBits(rule.slice(0, slash));
  const prefixRaw = rule.slice(slash + 1);
  if (base === null || base.length !== target.length) return false;
  if (!/^\d{1,3}$/.test(prefixRaw)) return false;

  const prefix = Number(prefixRaw);
  if (prefix > base.length) return false;

  return base.slice(0, prefix) === target.slice(0, prefix);
}

function isValidRule(rule: string): boolean {
  const slash = rule.indexOf("/");
  if (slash === -1) return ipToBits(rule) !== null;

  const base = ipToBits(rule.slice(0, slash));
  const prefixRaw = rule.slice(slash + 1);
  if (base === null || !/^\d{1,3}$/.test(prefixRaw)) return false;

  return Number(prefixRaw) <= base.length;
}

/**
 * Lê a env `ALLOWED_IPS` (vírgula, ponto-e-vírgula ou espaço como separador).
 * Regra inválida é descartada com aviso — nunca derruba o build nem libera acesso.
 */
export function parseAllowlist(raw?: string | null): string[] {
  if (!raw) return [];

  const entries = raw
    .split(/[\s,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

  const valid: string[] = [];
  const invalid: string[] = [];

  for (const entry of entries) {
    if (isValidRule(entry)) valid.push(entry);
    else invalid.push(entry);
  }

  if (invalid.length > 0) {
    console.warn(
      `[ip-allowlist] entradas ignoradas em ALLOWED_IPS: ${invalid.join(", ")}`,
    );
  }

  return valid;
}

/** `false` quando o IP é desconhecido — o gate falha fechado por request. */
export function isAllowed(
  ip: string | null | undefined,
  rules: string[],
): boolean {
  if (!ip || rules.length === 0) return false;
  return rules.some((rule) => matchesRule(ip, rule));
}

export { IPV4_BITS, IPV6_BITS };
