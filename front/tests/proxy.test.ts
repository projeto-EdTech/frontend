import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

// O proxy lê ALLOWED_IPS em escopo de módulo, então cada cenário precisa
// re-importar o módulo depois de trocar a env.
async function loadProxy(allowedIps?: string) {
  vi.resetModules();
  if (allowedIps === undefined) vi.stubEnv("ALLOWED_IPS", "");
  else vi.stubEnv("ALLOWED_IPS", allowedIps);
  return (await import("../src/proxy")).proxy;
}

function req(headers: Record<string, string> = {}, path = "/") {
  return new NextRequest(`http://localhost:3000${path}`, { headers });
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("proxy — gate de IP", () => {
  it("sem ALLOWED_IPS o gate fica desligado e tudo passa", async () => {
    const proxy = await loadProxy();
    const res = proxy(req({ "x-vercel-forwarded-for": "9.9.9.9" }));

    expect(res.status).toBe(200);
    expect(res.headers.get("x-middleware-next")).toBe("1");
  });

  it("IP fora da lista recebe 404 sem corpo", async () => {
    const proxy = await loadProxy("1.2.3.4");
    const res = proxy(req({ "x-vercel-forwarded-for": "9.9.9.9" }));

    expect(res.status).toBe(404);
    expect(await res.text()).toBe("");
  });

  it("IP exato da lista passa", async () => {
    const proxy = await loadProxy("1.2.3.4");
    const res = proxy(req({ "x-vercel-forwarded-for": "1.2.3.4" }));

    expect(res.status).toBe(200);
  });

  it("IP dentro do CIDR passa", async () => {
    const proxy = await loadProxy("198.51.100.0/24");
    const res = proxy(req({ "x-vercel-forwarded-for": "198.51.100.77" }));

    expect(res.status).toBe(200);
  });

  it("forma IPv4-mapeada do IP autorizado passa", async () => {
    const proxy = await loadProxy("1.2.3.4");
    const res = proxy(req({ "x-vercel-forwarded-for": "::ffff:1.2.3.4" }));

    expect(res.status).toBe(200);
  });

  it("request sem header de IP toma 404 (falha fechado)", async () => {
    const proxy = await loadProxy("1.2.3.4");
    const res = proxy(req());

    expect(res.status).toBe(404);
  });

  it("x-forwarded-for forjado não vence o header da borda do Vercel", async () => {
    const proxy = await loadProxy("1.2.3.4");
    const res = proxy(
      req({
        "x-vercel-forwarded-for": "9.9.9.9",
        "x-forwarded-for": "1.2.3.4",
      }),
    );

    expect(res.status).toBe(404);
  });

  it("usa o primeiro IP da cadeia de x-forwarded-for quando é o único header", async () => {
    const proxy = await loadProxy("1.2.3.4");
    const res = proxy(req({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }));

    expect(res.status).toBe(200);
  });

  it("lista só com lixo bloqueia todo mundo em vez de abrir o site", async () => {
    const proxy = await loadProxy("abc,1.2.3.4/99");
    const res = proxy(req({ "x-vercel-forwarded-for": "1.2.3.4" }));

    expect(res.status).toBe(404);
  });

  it("regra válida convive com entrada inválida na mesma lista", async () => {
    const proxy = await loadProxy("abc,1.2.3.4");

    expect(proxy(req({ "x-vercel-forwarded-for": "1.2.3.4" })).status).toBe(200);
    expect(proxy(req({ "x-vercel-forwarded-for": "9.9.9.9" })).status).toBe(404);
  });
});

describe("proxy — matcher", () => {
  it("cobre página, rota de API e asset estático, mas não os webhooks", async () => {
    const { config } = await import("../src/proxy");
    const pattern = new RegExp(`^${config.matcher[0]}$`);

    expect(pattern.test("/")).toBe(true);
    expect(pattern.test("/paidPlan")).toBe(true);
    expect(pattern.test("/_next/static/chunks/main.js")).toBe(true);
    expect(pattern.test("/favicon.ico")).toBe(true);
    expect(pattern.test("/api/user/me")).toBe(true);
    expect(pattern.test("/api/auth/callback/google")).toBe(true);

    expect(pattern.test("/api/webhooks/stripe")).toBe(false);
    expect(pattern.test("/api/webhooks/mercadopago")).toBe(false);
  });
});
