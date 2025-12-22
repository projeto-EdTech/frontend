import { NextResponse, NextRequest } from "next/server";

// BFF proxy – roda na Edge para menor latência
export const runtime = "edge";
export const dynamic = "force-dynamic"; // não cachear

function sanitizeText(t: unknown): string {
	return typeof t === "string" ? t.slice(0, 8000).trim() : "";
}

export async function POST(req: NextRequest) {
	try {
		const formData = await req.formData();
		const message = sanitizeText(formData.get("message"));
		const historyRaw = formData.get("history");
		const history = historyRaw && typeof historyRaw === 'string' ? JSON.parse(historyRaw) : [];
		const files = formData.getAll("files") as File[];

		// Log para depuração
		console.log("Dados recebidos na API:", {
			message,
			fileCount: files.length,
			fileNames: files.map(f => f.name),
		});

		if (!message && files.length === 0) {
			return NextResponse.json({ error: "É necessário enviar uma mensagem ou um arquivo." }, { status: 400 });
		}

		// Repasse de headers importantes (auth/cookies) para o backend
		const headers: Record<string, string> = {};
		const auth = req.headers.get("authorization") || req.headers.get("Authorization");
		if (auth) headers["Authorization"] = auth;
		const cookie = req.headers.get("cookie");
		if (cookie) headers["cookie"] = cookie;

		const backendFormData = new FormData();
		backendFormData.append("message", message);
		backendFormData.append("history", JSON.stringify(history));
		files.forEach(file => {
			backendFormData.append("files", file);
		});

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 60_000); // Aumentado para 60s
		let backendRes: Response;
		try {
			backendRes = await fetch(process.env.BACKEND_API_URL + "/api/v1/ai/chat", {
				method: "POST",
				headers,
				body: backendFormData,
				signal: controller.signal,
			});
		} finally {
			clearTimeout(timeout);
		}

		// Repassa status e conteúdo exatamente como veio do backend
		const contentType = backendRes.headers.get("content-type") || "application/json";
		const status = backendRes.status;

		if (contentType.includes("application/json")) {
			const json = (await backendRes.json()) as unknown;
			return NextResponse.json(json, { status });
		}

		const text = await backendRes.text();
		return new NextResponse(text, { status, headers: { "content-type": contentType } });
	} catch (err) {
		console.error("/api/ai/chat proxy error:", err);
		return NextResponse.json(
			{ error: "Não foi possível contatar o serviço de IA (BFF)." },
			{ status: 502 }
		);
	}
}

