import React from 'react';
import { cookies } from 'next/headers';
import NotaCorteResultadosClient from './NotaCorteResultadosClient';
import { type CourseResult, type CourseStatus } from '@/types/nota-corte';

// Curso como vem de GET /nota-corte/cursos (nomes variam entre versões do BFF)
interface CursoBackend {
  id?: string | number;
  curso?: string;
  nomeCurso?: string;
  sigla?: string;
  instituicao?: string;
  notaCorte?: number;
  area?: string;
}

interface Props {
  course: string;
  score: number;
  institution: string;
}

export default async function NotaCorteResultados({ course, score, institution }: Props) {
  if (!course) return null; // Não busca se não houver curso 

  const externalApiUrl = process.env.BACKEND_API_URL;
  if (!externalApiUrl) {
     return <div className="p-9 text-center text-red-700 bg-red-50 backdrop-blur-md rounded-xl border">Erro: BACKEND_API_URL não definido.</div>;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get('user_data')?.value;

  if (!token) {
    return <div className="p-9 text-center text-red-700 bg-red-50 backdrop-blur-md rounded-xl border">Não autorizado. Faça o login.</div>;
  }

  // Promise array para lidar com promises em paralelo (media e cursos paralelos)
  const headers = { 'Authorization': `Bearer ${token}` };

  const urlMedia = new URL(`${externalApiUrl}/nota-corte/media`);
  urlMedia.searchParams.append('curso', course);
  if (institution && institution.trim() !== '') {
    urlMedia.searchParams.append('sigla', institution);
  }

  // O JSX fica fora do try/catch: erro de render não é capturado por ele
  // (React Compiler — react-hooks/error-boundaries).
  let resultados: { targetCourseResult: CourseResult | null; filteredAndSorted: CourseResult[] } | null = null;
  try {
    resultados = await buscarResultados();
  } catch {
    resultados = null;
  }

  if (!resultados) {
    return <div className="p-9 text-center text-red-700 bg-red-50 backdrop-blur-md rounded-xl border">Erro de conexão ao servidor de Notas.</div>;
  }

  return (
      <NotaCorteResultadosClient
        course={course}
        score={score}
        institution={institution}
        initialTargetResult={resultados.targetCourseResult}
        filteredAndSorted={resultados.filteredAndSorted}
      />
  );

  async function buscarResultados() {
    const [resMedia, resCursos] = await Promise.all([
      fetch(urlMedia.toString(), { headers, cache: 'no-store' }),
      fetch(`${externalApiUrl}/nota-corte/cursos`, { headers, next: { revalidate: 60 } })
    ]);

    let targetCourseResult: CourseResult | null = null;
    if (resMedia.ok) {
        const backendData = await resMedia.json();
        const cutoffScore = backendData.medianNotaCorte || 0;
        const difference = score - cutoffScore;

        let status: CourseStatus;
        if (difference >= 0) status = 'approved';
        else if (difference >= -5) status = 'borderline';
        else status = 'reproved';

        targetCourseResult = {
            // id determinístico: Date.now() em render é impuro (React Compiler)
            id: `api-result-${course}-${institution || 'todas'}`,
            courseName: backendData.curso || course,
            institution: backendData.instituicao || institution || "Instituição não informada",
            cutoffScore: cutoffScore,
            userScore: score,
            difference: difference,
            status: status,
            area: "Geral"
        };
    }

    let allResults: CourseResult[] = [];
    let availableAreas = ["todas"];

    if (resCursos.ok) {
        const data = await resCursos.json();
        if (Array.isArray(data)) {
            allResults = (data as CursoBackend[]).map((item, index) => {
                const diff = score - (item.notaCorte || 0);
                let st: CourseStatus;
                if (diff >= 0) st = 'approved';
                else if (diff >= -5) st = 'borderline';
                else st = 'reproved';

                return {
                    // fallback determinístico: Math.random() em render é impuro (React Compiler)
                    id: item.id ? String(item.id) : `curso-${index}`,
                    courseName: item.curso || item.nomeCurso || "Curso Desconhecido",
                    institution: item.sigla || item.instituicao || "Instituição",
                    cutoffScore: item.notaCorte || 0,
                    userScore: score,
                    difference: diff,
                    status: st,
                    area: item.area || "Geral"
                };
            });
            const areas = new Set(allResults.map(r => r.area));
            availableAreas = ["todas", ...Array.from(areas)];
        }
    }

    const filteredAndSorted = allResults
        .filter(r => r.status === 'approved')
        .sort((a, b) => b.difference - a.difference);

    return { targetCourseResult, filteredAndSorted };
  }
}
