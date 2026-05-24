import React from "react";
import SimulationQuizClient from "@/components/Simula_PRO/SimulationQuizClient";
import { cookies } from "next/headers";

function formatLatexExpressions(text: string | null): string {
    if (typeof text !== 'string') return "";
    const keywords: { [key: string]: string } = {
        'alpha': '\\alpha', 'beta': '\\beta', 'gamma': '\\gamma', 'delta': '\\delta',
        'epsilon': '\\epsilon', 'zeta': '\\zeta', 'eta': '\\eta', 'theta': '\\theta',
        'iota': '\\iota', 'kappa': '\\kappa', 'lambda': '\\lambda', 'mu': '\\mu',
        'nu': '\\nu', 'xi': '\\xi', 'pi': '\\pi', 'rho': '\\rho', 'sigma': '\\sigma',
        'tau': '\\tau', 'upsilon': '\\upsilon', 'phi': '\\phi', 'chi': '\\chi',
        'psi': '\\psi', 'omega': '\\omega',
        'sen': '\\sin', 'cos': '\\cos', 'tg': '\\tan', 'cotg': '\\cot', 'log': '\\log',
    };
    const combinedRegex = new RegExp(
        `\\b(${Object.keys(keywords).join('|')}(_[a-zA-Z0-9]+)?)|([a-zA-Z0-9]+_[a-zA-Z0-9_]+)|([a-zA-Z0-9]+\\^[a-zA-Z0-9_]+)|(\\w+/\\w+)|(\\\\[a-zA-Z]+)`, 'gi'
    );
    return text.replace(combinedRegex, (match) => {
        const index = text.indexOf(match);
        if (index > 0 && text[index - 1] === '$') return match;
        let latexToken = match;
        const lowerCaseMatch = match.toLowerCase();
        for (const key in keywords) {
            if (lowerCaseMatch.startsWith(key)) {
                const restOfToken = match.substring(key.length);
                latexToken = keywords[key] + restOfToken;
                break;
            }
        }
        return `$${latexToken}$`;
    }).replace(/\$\s*\$/g, ' '); 
}

function formatApiData(jsonData: any): any[] {
    const provaData = jsonData.prova || jsonData;
    if (!provaData || !Array.isArray(provaData.questoes)) return [];
    
    const questoesValidas = provaData.questoes.filter((q: any) => q.opcaoCorreta !== null);
    return questoesValidas.map((questao: any) => {
        const correctAnswerIndex = (questao.opcaoCorreta?.toString().toUpperCase().charCodeAt(0) ?? 65) - 65;
        let options: string[] = ["A", "B", "C", "D", "E"];
        if (Array.isArray(questao.alternativas) && questao.alternativas.length > 0) {
            options = questao.alternativas.map((alt: any) => formatLatexExpressions(alt.texto));
        }
        const materias = new Set<string>();
        const conteudos: string[] = [];
        if (Array.isArray(questao.conteudo)) {
            questao.conteudo.forEach((item: any) => {
                if (typeof item === 'string') {
                    const parts = item.split(' – ').map((s: string) => s.trim());
                    if (parts[0]) materias.add(parts[0]);
                    if (parts[1]) conteudos.push(parts[1]);
                }
            });
        }
        
        let images = [];
        if (questao.imageNames && questao.imageNames.length > 0) {
            const uniId = (provaData.siglaUniversidade || "").toUpperCase().replace(/-/g, '');
            const qYear = provaData.ano || new Date().getFullYear();
            const qId = String(questao.numeroEnunciado || 0).padStart(2, '0');
            images = questao.imageNames.map((name: string) => 
                `https://raw.githubusercontent.com/projeto-EdTech/Docs/refs/heads/main/Banco%20de%20Imagens/banco%20de%20Imagens/${uniId}/${qYear}/questao-${qId}/${name}`
            );
        }

        return {
            id: questao.numeroEnunciado || 0,
            university: (provaData.siglaUniversidade || "").toLowerCase(),
            year: provaData.ano || new Date().getFullYear(),
            text: { principal: formatLatexExpressions(questao.enunciado), subItens: [] },
            options,
            correctAnswer: correctAnswerIndex,
            materia: Array.from(materias),
            conteudo: conteudos,
            dia: questao.dia || 1,
            imageNames: questao.imageNames || [],
            images
        };
    });
}

export default async function SimulacaoLoader({
    university, year, day, count
}: {
    university: string; year: string | null; day: string; count: number
}) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 10).toUpperCase();
  const LOG = `[SIMULACAO_LOADER][${requestId}]`;

  console.log(`${LOG} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`${LOG} 🚀 SimulacaoLoader iniciado`);
  console.log(`${LOG}    Timestamp: ${new Date().toISOString()}`);
  console.log(`${LOG}    Params → university: "${university}", year: "${year}", day: "${day}", count: ${count}`);

  const externalApiUrl = process.env.BACKEND_API_URL;
  console.log(`${LOG}    BACKEND_API_URL: ${externalApiUrl ? externalApiUrl : 'NÃO CONFIGURADO'}`);

  if (!externalApiUrl) {
    console.error(`${LOG} ❌ BACKEND_API_URL ausente. Abortando.`);
    return <div className="text-red-500 font-bold p-8">Erro: BACKEND_API_URL não configurado.</div>;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('user_data')?.value;
  console.log(`${LOG}    Cookie user_data presente: ${token ? 'SIM (primeiros 10 chars: ' + token.substring(0, 10) + '...)' : 'NÃO'}`);

  if (!token) {
    console.warn(`${LOG} ❌ Token ausente. Retornando erro de autenticação.`);
    return <div className="text-red-500 font-bold p-8">Erro: Usuário não autenticado. Favor logar.</div>;
  }

  const universitySlug = university.toUpperCase();
  const backendUrl = `${externalApiUrl}/api/prova/instituicao`;
  const payload = { instituicao: universitySlug, ano: year ? Number(year) : undefined, dia: 1 };

  console.log(`${LOG} 📤 Chamando backend diretamente:`);
  console.log(`${LOG}    URL: ${backendUrl}`);
  console.log(`${LOG}    Payload: ${JSON.stringify(payload)}`);

  let result = [];
  try {
    const fetchStart = Date.now();
    const apiRes = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
      next: { revalidate: 60 },
    });
    const fetchDuration = Date.now() - fetchStart;

    console.log(`${LOG} 📥 Resposta recebida (${fetchDuration}ms):`);
    console.log(`${LOG}    Status: ${apiRes.status} ${apiRes.statusText}`);
    const responseHeaders: Record<string, string> = {};
    apiRes.headers.forEach((value, key) => { responseHeaders[key] = value; });
    console.log(`${LOG}    Headers de resposta: ${JSON.stringify(responseHeaders)}`);

    if (!apiRes.ok) {
        let errorBody = '';
        try { errorBody = JSON.stringify(await apiRes.json()); } catch { errorBody = await apiRes.text().catch(() => '(não legível)'); }
        console.error(`${LOG} ❌ Backend retornou erro ${apiRes.status}. Body: ${errorBody}`);
        if (apiRes.status === 404) {
            console.warn(`${LOG}    Motivo: universidade "${universitySlug}" não encontrada.`);
            return <div className="p-8 font-bold text-red-500">Questões não encontradas para esse simulado.</div>;
        }
        return <div className="p-8 font-bold text-red-500">Falha ao buscar simulado no servidor (Erro {apiRes.status}).</div>;
    }

    const rawData = await apiRes.json();
    const rawJson = JSON.stringify(rawData);
    console.log(`${LOG}    Payload raw: ${rawJson.length} bytes`);
    console.log(`${LOG}    Preview raw (300 chars): ${rawJson.substring(0, 300)}...`);

    const provaData = rawData.prova || rawData;
    const totalBruto = Array.isArray(provaData?.questoes) ? provaData.questoes.length : 0;
    const semResposta = Array.isArray(provaData?.questoes)
        ? provaData.questoes.filter((q: any) => q.opcaoCorreta === null).length : 0;
    console.log(`${LOG}    Questões brutas: ${totalBruto} | sem opcaoCorreta (filtradas): ${semResposta} | válidas: ${totalBruto - semResposta}`);

    console.log(`${LOG} 🔄 Formatando dados...`);
    const formatStart = Date.now();
    let formattedQuestions = formatApiData(rawData);
    console.log(`${LOG}    Formatação: ${Date.now() - formatStart}ms → ${formattedQuestions.length} questões`);

    if (year) {
        const yNum = Number(year);
        if (!isNaN(yNum)) {
            const antes = formattedQuestions.length;
            formattedQuestions = formattedQuestions.filter((q: any) => q.year === yNum);
            console.log(`${LOG}    Filtro year=${yNum}: ${antes} → ${formattedQuestions.length} questões`);
        } else {
            console.warn(`${LOG}    year param inválido: "${year}" (NaN). Filtro ignorado.`);
        }
    }

    formattedQuestions.sort((a, b) => a.id - b.id);
    console.log(`${LOG}    Ordenado por ID. Primeiro: ${formattedQuestions[0]?.id ?? 'N/A'}, Último: ${formattedQuestions[formattedQuestions.length - 1]?.id ?? 'N/A'}`);

    if (count > 0 && !isNaN(count)) {
        const antes = formattedQuestions.length;
        formattedQuestions = formattedQuestions.slice(0, count);
        console.log(`${LOG}    Filtro count=${count}: ${antes} → ${formattedQuestions.length} questões`);
    }

    result = formattedQuestions;

  } catch (err) {
      const totalDuration = Date.now() - startTime;
      console.error(`${LOG} ❌ Erro interno após ${totalDuration}ms:`);
      console.error(`${LOG}    Tipo: ${err instanceof Error ? err.constructor.name : typeof err}`);
      console.error(`${LOG}    Mensagem: ${err instanceof Error ? err.message : String(err)}`);
      console.error(`${LOG}    Stack: ${err instanceof Error ? err.stack : 'N/A'}`);
      console.log(`${LOG} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      return <div className="p-8 font-bold text-red-500">Erro interno na montagem do simulado.</div>;
  }

  if (result.length === 0) {
      console.warn(`${LOG} ⚠️ result.length === 0. Simulado vazio ou todos filtrados.`);
      console.log(`${LOG} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      return <div className="p-8 font-bold text-orange-500">O simulado está vazio ou indisponível.</div>;
  }

  const totalDuration = Date.now() - startTime;
  console.log(`${LOG} ✅ Sucesso! ${result.length} questões → renderizando SimulationQuizClient`);
  console.log(`${LOG}    Tempo total: ${totalDuration}ms`);
  console.log(`${LOG} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  return (
    <SimulationQuizClient
        initialQuestions={result}
        universitySlug={university}
        examYear={year}
        day={day}
        numberOfQuestions={count}
    />
  );
}
