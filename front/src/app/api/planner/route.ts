import { NextResponse } from 'next/server';
import { colorForSubject, availableSubjects } from '@/lib/utils/planner';

// Estrutura de um "material de estudo" no NÍVEL DE CONTEÚDO, que vira card no frontend.
// `subject` continua sendo a MATÉRIA (compat com filtros/stats/cores do Planner);
// os campos de conteúdo dão a granularidade nova.
interface StudyMaterial {
  materiaId: string;
  materia: string;
  conteudoId: string;
  conteudo: string;
  subject: string; // = materia
  title: string;   // Ex: "Estudar Física Moderna"
  priority: 'alta' | 'media' | 'baixa';
  color: string;
  taxaErro: number;
}

// Deriva a prioridade do card a partir da taxa de erro (conteúdo ou matéria).
function priorityFromTaxa(taxa: unknown): 'alta' | 'media' | 'baixa' {
  const t = typeof taxa === 'number' ? taxa : Number(taxa);
  if (!Number.isFinite(t)) return 'media';
  if (t >= 70) return 'alta';
  if (t >= 40) return 'media';
  return 'baixa';
}

// Função para extrair o ID do usuário a partir do token JWT
function extractUserId(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return payload.id ?? payload.sub ?? payload.email ?? null;
  } catch {
    return null;
  }
}

// Normaliza strings removendo acentos e convertendo para lowercase para evitar duplicatas de matérias
function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * @api {get} /api/planner
 * @description Rota para buscar uma lista única de matérias de estudo.
 * * Esta API serve como um "fornecedor de matérias" para o modo de edição do planner.
 * * Realiza consulta no backend pelo endpoint /planner/piores-materias/{id-usuario}
 * * O frontend usará esses dados para gerar os "Cards de Estudos" arrastáveis.
 */
export async function GET(request: Request) {
  console.log("\n--- [GET /api/planner] INÍCIO DA REQUISIÇÃO ---");
  
  const backendApiUrl = process.env.BACKEND_API_URL;
  if (!backendApiUrl) {
    console.error("[GET /api/planner] ❌ BACKEND_API_URL não está configurado nas variáveis de ambiente.");
    return NextResponse.json({ error: "Erro de configuração do servidor." }, { status: 500 });
  }

  try {
    // 1. Obter o token JWT da requisição (do Header ou do Cookie user_data)
    const authHeader = request.headers.get('Authorization');
    let userToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    if (!userToken) {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      userToken = cookieStore.get('user_data')?.value || null;
      if (userToken) {
        console.log("[GET /api/planner] Token JWT encontrado no cookie 'user_data'.");
      }
    } else {
      console.log("[GET /api/planner] Token JWT encontrado no cabeçalho 'Authorization'.");
    }

    if (!userToken) {
      console.warn("[GET /api/planner] ❌ Token de autenticação não fornecido.");
      return NextResponse.json({ error: "Não autorizado: Token não fornecido." }, { status: 401 });
    }

    // 2. Extrair o ID do usuário
    const userId = extractUserId(userToken);
    if (!userId) {
      console.warn("[GET /api/planner] ❌ Não foi possível extrair o ID do usuário do token.");
      return NextResponse.json({ error: "Não autorizado: ID do usuário inválido no token." }, { status: 401 });
    }
    console.log(`[GET /api/planner] ID do usuário extraído com sucesso: ${userId}`);

    // 3. Montar a URL de requisição ao backend
    const backendUrl = `${backendApiUrl}/planner/piores-materias/${userId}`;
    console.log("[GET /api/planner] 📤 Enviando requisição ao backend:");
    console.log(`[GET /api/planner]    URL: ${backendUrl}`);
    console.log(`[GET /api/planner]    Método: GET`);
    console.log(`[GET /api/planner]    Payload/Params: (Nenhum corpo necessário para GET. ID do usuário na URL)`);
    console.log(`[GET /api/planner]    Authorization: Bearer ${userToken.substring(0, 15)}...`);

    // 4. Executar a chamada ao backend
    const apiResponse = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${userToken}`,
      },
      cache: 'no-store',
    });

    console.log("[GET /api/planner] 📥 Resposta recebida do backend:");
    console.log(`[GET /api/planner]    Status: ${apiResponse.status} ${apiResponse.statusText}`);

    const contentType = apiResponse.headers.get('content-type');
    let rawData: any;

    if (contentType && contentType.includes('application/json')) {
      rawData = await apiResponse.json();
      console.log(`[GET /api/planner]    Dados recebidos (JSON):`, JSON.stringify(rawData));
    } else {
      rawData = await apiResponse.text();
      console.log(`[GET /api/planner]    Dados recebidos (Texto):`, rawData);
    }

    if (!apiResponse.ok) {
      console.error(`[GET /api/planner] ❌ Erro retornado pelo backend. Status: ${apiResponse.status}`);
      return NextResponse.json(
        { error: typeof rawData === 'string' ? rawData : (rawData?.message || 'Erro no servidor de destino.') },
        { status: apiResponse.status }
      );
    }

    // 5. Converter a resposta do backend (matérias + pioresConteudos) em cards no
    //    NÍVEL DE CONTEÚDO e anexar um card "Revisão {materia}" por matéria.
    if (!Array.isArray(rawData)) {
      console.warn("[GET /api/planner] ⚠️ O formato recebido do backend não é um array. Convertendo para array vazio.");
      return NextResponse.json([]);
    }

    // Chave: `${materiaId}:${conteudoId}` — evita colisão de conteúdos homônimos entre matérias.
    const cardsMap = new Map<string, StudyMaterial>();

    rawData.forEach((materiaItem: any, materiaIndex: number) => {
      if (!materiaItem || typeof materiaItem !== 'object') return;

      const materia: string =
        materiaItem.materiaNome || materiaItem.materia || materiaItem.nome || materiaItem.name || "Matéria";
      const materiaId: string = String(materiaItem.materiaId ?? materiaItem.id ?? materia);
      const color = colorForSubject(materia, materiaIndex);

      // Conteúdos "piores" ordenados pela maior taxa de erro primeiro.
      const piores: any[] = Array.isArray(materiaItem.pioresConteudos)
        ? [...materiaItem.pioresConteudos].sort(
            (a, b) => (Number(b?.taxaErro ?? 0) - Number(a?.taxaErro ?? 0)),
          )
        : [];

      // 5a. Um card por conteúdo da matéria.
      piores.forEach((conteudoItem: any) => {
        if (!conteudoItem || typeof conteudoItem !== 'object') return;
        const conteudo: string =
          conteudoItem.conteudoNome || conteudoItem.conteudo || conteudoItem.nome || conteudoItem.name || "Conteúdo";
        const conteudoId: string = String(conteudoItem.conteudoId ?? conteudoItem.id ?? conteudo);
        const key = `${materiaId}:${conteudoId}`;
        if (cardsMap.has(key)) return;

        cardsMap.set(key, {
          materiaId,
          materia,
          conteudoId,
          conteudo,
          subject: materia,
          title: `Estudar ${conteudo}`,
          priority: priorityFromTaxa(conteudoItem.taxaErro),
          color,
          taxaErro: Number(conteudoItem.taxaErro ?? 0),
        });
      });

      // 5b. Fallback: matéria sem conteúdos detalhados → 1 card da própria matéria.
      if (piores.length === 0) {
        const key = `${materiaId}:${materiaId}`;
        if (!cardsMap.has(key)) {
          cardsMap.set(key, {
            materiaId,
            materia,
            conteudoId: materiaId,
            conteudo: materia,
            subject: materia,
            title: `Estudar ${materia}`,
            priority: priorityFromTaxa(materiaItem.taxaErro),
            color,
            taxaErro: Number(materiaItem.taxaErro ?? 0),
          });
        }
      }

      // 5c. Card de revisão (sempre 1 por matéria), mesma cor da matéria.
      const revisaoConteudoId = `revisao:${materiaId}`;
      const revisaoKey = `${materiaId}:${revisaoConteudoId}`;
      if (!cardsMap.has(revisaoKey)) {
        cardsMap.set(revisaoKey, {
          materiaId,
          materia,
          conteudoId: revisaoConteudoId,
          conteudo: `Revisão ${materia}`,
          subject: materia,
          title: `Revisão ${materia}`,
          priority: 'baixa',
          color,
          taxaErro: Number(materiaItem.taxaErro ?? 0),
        });
      }
    });

    // 5d. Garantir que todas as matérias do availableSubjects tenham um card de revisão estático
    availableSubjects.forEach((subName, subIdx) => {
      const normSubName = normalizeStr(subName);
      // Evita duplicatas se a matéria já tem card de revisão vindo do backend
      const alreadyHasRevisao = Array.from(cardsMap.values()).some((card) => {
        if (!card.conteudoId?.startsWith("revisao:")) return false;
        const normCardMateria = normalizeStr(card.materia);
        return normCardMateria.includes(normSubName) || normSubName.includes(normCardMateria);
      });

      if (!alreadyHasRevisao) {
        const subId = subName.toLowerCase().replace(/\s+/g, '-');
        const revisaoConteudoId = `revisao:${subId}`;
        const revisaoKey = `${subId}:${revisaoConteudoId}`;
        const color = colorForSubject(subName, subIdx);
        cardsMap.set(revisaoKey, {
          materiaId: subId,
          materia: subName,
          conteudoId: revisaoConteudoId,
          conteudo: `Revisão ${subName}`,
          subject: subName,
          title: `Revisão ${subName}`,
          priority: 'baixa', // revisões são sempre prioridade baixa (1 card)
          color,
          taxaErro: 0,
        });
      }
    });

    const studyMaterials = Array.from(cardsMap.values());
    console.log(`[GET /api/planner] ✅ Sucesso! Retornando ${studyMaterials.length} cards de estudo (conteúdos + revisões) para o frontend.`);
    return NextResponse.json(studyMaterials);

  } catch (error) {
    console.warn('[GET /api/planner] ⚠️ O backend está offline/indisponível. Retornando dados mockados para testes locais.', error);
    
    // Dados mockados simulando a resposta do backend
    const mockBackendData = [
      {
        materiaId: "1",
        materiaNome: "Física",
        totalRespostas: 8,
        totalErros: 4,
        taxaErro: 50,
        pioresConteudos: [
          { conteudoId: "101", conteudoNome: "Física Moderna", taxaErro: 100 },
        ]
      },
      {
        materiaId: "2",
        materiaNome: "Matemática",
        totalRespostas: 10,
        totalErros: 7,
        taxaErro: 70,
        pioresConteudos: [
          { conteudoId: "201", conteudoNome: "Funções Quadráticas", taxaErro: 90 },
        ]
      },
      {
        materiaId: "3",
        materiaNome: "Química",
        totalRespostas: 6,
        totalErros: 3,
        taxaErro: 50,
        pioresConteudos: [
          { conteudoId: "301", conteudoNome: "Química Orgânica", taxaErro: 85 }
        ]
      },
      {
        materiaId: "4",
        materiaNome: "Biologia",
        totalRespostas: 12,
        totalErros: 3,
        taxaErro: 25,
        pioresConteudos: [
          { conteudoId: "401", conteudoNome: "Citologia", taxaErro: 30 }
        ]
      }
    ];

    const cardsMap = new Map<string, StudyMaterial>();

    mockBackendData.forEach((materiaItem: any, materiaIndex: number) => {
      const materia: string = materiaItem.materiaNome || "Matéria";
      const materiaId: string = String(materiaItem.materiaId ?? materia);
      const color = colorForSubject(materia, materiaIndex);

      const piores: any[] = Array.isArray(materiaItem.pioresConteudos)
        ? [...materiaItem.pioresConteudos].sort(
            (a, b) => (Number(b?.taxaErro ?? 0) - Number(a?.taxaErro ?? 0)),
          )
        : [];

      // 1. Um card por conteúdo da matéria.
      piores.forEach((conteudoItem: any) => {
        const conteudo: string = conteudoItem.conteudoNome || "Conteúdo";
        const conteudoId: string = String(conteudoItem.conteudoId ?? conteudo);
        const key = `${materiaId}:${conteudoId}`;
        if (cardsMap.has(key)) return;

        cardsMap.set(key, {
          materiaId,
          materia,
          conteudoId,
          conteudo,
          subject: materia,
          title: `Estudar ${conteudo}`,
          priority: priorityFromTaxa(conteudoItem.taxaErro),
          color,
          taxaErro: Number(conteudoItem.taxaErro ?? 0),
        });
      });

      // 2. Fallback: matéria sem conteúdos detalhados → 1 card da própria matéria.
      if (piores.length === 0) {
        const key = `${materiaId}:${materiaId}`;
        if (!cardsMap.has(key)) {
          cardsMap.set(key, {
            materiaId,
            materia,
            conteudoId: materiaId,
            conteudo: materia,
            subject: materia,
            title: `Estudar ${materia}`,
            priority: priorityFromTaxa(materiaItem.taxaErro),
            color,
            taxaErro: Number(materiaItem.taxaErro ?? 0),
          });
        }
      }

      // 3. Card de revisão (sempre 1 por matéria), mesma cor da matéria.
      const revisaoConteudoId = `revisao:${materiaId}`;
      const revisaoKey = `${materiaId}:${revisaoConteudoId}`;
      if (!cardsMap.has(revisaoKey)) {
        cardsMap.set(revisaoKey, {
          materiaId,
          materia,
          conteudoId: revisaoConteudoId,
          conteudo: `Revisão ${materia}`,
          subject: materia,
          title: `Revisão ${materia}`,
          priority: 'baixa',
          color,
          taxaErro: Number(materiaItem.taxaErro ?? 0),
        });
      }
    });

    // 4. Garantir que todas as matérias do availableSubjects tenham um card de revisão estático
    availableSubjects.forEach((subName, subIdx) => {
      const normSubName = normalizeStr(subName);
      // Evita duplicatas se a matéria já tem card de revisão vindo do mock
      const alreadyHasRevisao = Array.from(cardsMap.values()).some((card) => {
        if (!card.conteudoId?.startsWith("revisao:")) return false;
        const normCardMateria = normalizeStr(card.materia);
        return normCardMateria.includes(normSubName) || normSubName.includes(normCardMateria);
      });

      if (!alreadyHasRevisao) {
        const subId = subName.toLowerCase().replace(/\s+/g, '-');
        const revisaoConteudoId = `revisao:${subId}`;
        const revisaoKey = `${subId}:${revisaoConteudoId}`;
        const color = colorForSubject(subName, subIdx);
        cardsMap.set(revisaoKey, {
          materiaId: subId,
          materia: subName,
          conteudoId: revisaoConteudoId,
          conteudo: `Revisão ${subName}`,
          subject: subName,
          title: `Revisão ${subName}`,
          priority: 'baixa',
          color,
          taxaErro: 0,
        });
      }
    });

    const studyMaterials = Array.from(cardsMap.values());
    console.log(`[GET /api/planner] ⚠️ Retornando ${studyMaterials.length} cards de estudo mockados com sucesso para testes locais.`);
    return NextResponse.json(studyMaterials);
  }
}