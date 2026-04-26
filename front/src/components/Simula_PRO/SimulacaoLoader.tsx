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
  const externalApiUrl = process.env.BACKEND_API_URL;
  if (!externalApiUrl) {
    return <div className="text-red-500 font-bold p-8">Erro: BACKEND_API_URL não configurado.</div>;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('user_data')?.value;

  // Em desenvolvimento, se não houver token ou BACKEND_API_URL, tentamos usar dados locais
  const isDev = process.env.NODE_ENV !== 'production';
  
  if (!token && !isDev) {
    return <div className="text-red-500 font-bold p-8">Erro: Usuário não autenticado. Favor logar.</div>;
  }

  const universitySlug = university.toUpperCase();
  const backendUrl = `${externalApiUrl}/api/prova/instituicao`;

  let result = [];
  let useLocalFallback = isDev; // Em dev, sempre tentamos o fallback se a API falhar

  try {
    if (token && externalApiUrl) {
        const apiRes = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ slug: universitySlug, ano: year ? Number(year) : undefined }),
          next: { revalidate: 60 },
        });

        if (apiRes.ok) {
            const rawData = await apiRes.json();
            let formattedQuestions = formatApiData(rawData);

            if (year) {
                const yNum = Number(year);
                if (!isNaN(yNum)) formattedQuestions = formattedQuestions.filter((q: any) => q.year === yNum);
            }

            formattedQuestions.sort((a, b) => a.id - b.id);

            if (count > 0 && !isNaN(count)) {
                formattedQuestions = formattedQuestions.slice(0, count);
            }
            
            result = formattedQuestions;
            useLocalFallback = false; // Sucesso na API, não precisa de fallback
        } else if (!isDev) {
            if (apiRes.status === 404) return <div className="p-8 font-bold text-red-500">Questões não encontradas para esse simulado.</div>;
            return <div className="p-8 font-bold text-red-500">Falha ao buscar simulado no servidor (Erro {apiRes.status}).</div>;
        }
    }

    // Fallback para dados locais em ambiente de desenvolvimento
    if (useLocalFallback && result.length === 0) {
        const { allQuestions } = await import("@/lib/dataUniversity");
        let localQuestions = allQuestions.filter(q => 
            q.university.toLowerCase() === university.toLowerCase()
        );

        if (year) {
            const yNum = Number(year);
            localQuestions = localQuestions.filter(q => q.year === yNum);
        }

        if (count > 0 && !isNaN(count)) {
            localQuestions = localQuestions.slice(0, count);
        }

        result = localQuestions;
    }

  } catch (err) {
      if (!isDev) {
        return <div className="p-8 font-bold text-red-500">Erro interno na montagem do simulado.</div>;
      }
      // Em dev, se deu erro no fetch, o código acima já tentará o fallback
  }

  if (result.length === 0) {
      return (
        <div className="p-8 flex flex-col items-center gap-4">
            <div className="font-bold text-orange-500 text-xl text-center">
                O simulado para {university.toUpperCase()} {year ? `(${year})` : ""} está vazio ou indisponível no momento.
            </div>
            {isDev && (
                <p className="text-gray-500 text-sm">
                    Dica: Verifique se existem questões mapeadas em <code>src/lib/dataUniversity.ts</code> para esta universidade.
                </p>
            )}
        </div>
      );
  }

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
