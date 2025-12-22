import { NextResponse, NextRequest } from "next/server";

// BFF proxy – histórico de conversas
export const runtime = "edge";
export const dynamic = "force-dynamic"; // evitar cache

function toPositiveInt(val: string | null, def: number, max: number): number {
	if (!val) return def;
	const n = parseInt(val, 10);
	if (isNaN(n) || n < 1) return def;
	return Math.min(n, max);
}

export async function GET(req: NextRequest) {
	try {
		const url = new URL(req.url);
		const page = toPositiveInt(url.searchParams.get("page"), 1, 500); // limite defensivo
		const limit = toPositiveInt(url.searchParams.get("limit"), 50, 200); // máximo 200 por requisição
		const chatIdRaw = url.searchParams.get("chatId");
		const chatId = chatIdRaw ? chatIdRaw.trim().slice(0, 128) : undefined;

		// Monta URL do backend
		const backendBase = process.env.BACKEND_API_URL || "";
		if (!backendBase) {
			return NextResponse.json({ error: "BACKEND_API_URL não configurada" }, { status: 500 });
		}

		const backendUrl = new URL(backendBase + "/api/v1/ai/history");
		backendUrl.searchParams.set("page", String(page));
		backendUrl.searchParams.set("limit", String(limit));
		if (chatId) backendUrl.searchParams.set("chatId", chatId);

		// Repasse de headers relevantes
		const headers: Record<string, string> = {};
		const auth = req.headers.get("authorization") || req.headers.get("Authorization");
		if (auth) headers["Authorization"] = auth;
		const cookie = req.headers.get("cookie");
		if (cookie) headers["cookie"] = cookie;

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 30_000); // 30s para histórico
		let backendRes: Response;
		try {
			backendRes = await fetch(backendUrl.toString(), {
				method: "GET",
				headers,
				signal: controller.signal,
			});
		} finally {
			clearTimeout(timeout);
		}

		const contentType = backendRes.headers.get("content-type") || "application/json";
		const status = backendRes.status;

		// Repassa resposta como veio
		if (contentType.includes("application/json")) {
			const json = await backendRes.json();
			// Extrai apenas os campos necessários para o ChatSidebar
			const chats = Array.isArray(json?.history)
				? json.history.map((item: any) => ({
					id: item.chatId || "",
					title: item.title || "",
					timestamp: item.timestamp || item.date || item.createdAt || null,
				}))
				: [];

			return NextResponse.json(chats, {
				status,
				headers: {
					"cache-control": "no-store",
				},
			});
		}

		const text = await backendRes.text();
		return new NextResponse(text, {
			status,
			headers: {
				"content-type": contentType,
				"cache-control": "no-store",
			},
		});
		} catch (err) {
			const aborted = (err instanceof Error) && err.name === "AbortError";
			console.error("/api/ai/historico proxy error:", err);
			return NextResponse.json(
				{ error: aborted ? "Timeout ao buscar histórico" : "Falha ao contatar serviço de histórico" },
				{ status: 502 }
			);
		}
}

