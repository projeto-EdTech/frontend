import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; 
import { google } from "googleapis";
import { NextResponse } from "next/server";
import Holidays from 'date-holidays';

// Paleta oficial de cores de eventos do Google Calendar (Graph API)
const googlePalette = [
  { id: '1', hex: '#7986cb' }, // Lavender
  { id: '2', hex: '#33b679' }, // Sage
  { id: '3', hex: '#8e24aa' }, // Grape
  { id: '4', hex: '#e67c73' }, // Flamingo
  { id: '5', hex: '#f6c026' }, // Banana
  { id: '6', hex: '#f5511d' }, // Tangerine
  { id: '7', hex: '#039be5' }, // Peacock
  { id: '8', hex: '#616161' }, // Graphite
  { id: '9', hex: '#3f51b5' }, // Blueberry
  { id: '10', hex: '#0b8043' }, // Basil
  { id: '11', hex: '#d50000' }  // Tomato
];

// Mapeamento Inverso: ID do Google -> HEX visual para o Front-end (Vestibuline)
// Usado no GET para restaurar a cor correta no planner
const googleIdToHexMap: { [key: string]: string } = {
  '1': '#7986cb',
  '2': '#33b679',
  '3': '#8e24aa',
  '4': '#e67c73',
  '5': '#f6c026',
  '6': '#f5511d',
  '7': '#039be5',
  '8': '#616161',
  '9': '#3f51b5',
  '10': '#0b8043',
  '11': '#d50000'
};

// Função auxiliar para converter HEX para RGB
function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Função que encontra o ID da cor do Google mais próxima da cor do front-end
// Usada no POST para salvar a cor visualmente correta
function findClosestColorId(inputHex: string): string {
  const inputRgb = hexToRgb(inputHex);
  if (!inputRgb) return '1';

  let minDistance = Infinity;
  let closestColorId = '1';

  for (const color of googlePalette) {
    const targetRgb = hexToRgb(color.hex);
    if (!targetRgb) continue;

    // Cálculo simples de distância Euclidiana
    const distance = 
      Math.pow(inputRgb.r - targetRgb.r, 2) +
      Math.pow(inputRgb.g - targetRgb.g, 2) +
      Math.pow(inputRgb.b - targetRgb.b, 2);

    if (distance < minDistance) {
      minDistance = distance;
      closestColorId = color.id;
    }
  }

  return closestColorId;
}

interface StudyEvent {
  id: string;
  title: string;
  subject: string;
  start: Date;
  end: Date;
  priority: 'alta' | 'media' | 'baixa';
  completed?: boolean;
  color: string;
  description?: string;
  isScheduled: boolean;
}

// --- ROTA GET: BUSCAR EVENTOS ---
export async function GET() {
  // Mapa de fallback caso o evento não tenha colorId ou seja antigo
  const subjectColorMap: { [key: string]: string } = {
    'Estudar Matemática': '#ef4444',
    'Revisão de Física': '#3b82f6',
    'Química Orgânica': '#10b981',
    'História do Brasil': '#f59e0b',
    'Literatura Brasileira': '#8b5cf6',
    'Geografia Política': '#f97316',
    'Revisão de Biologia': '#06b6d4',
  };
  const defaultColor = '#64748b';

  try {
    const session = await getServerSession(authOptions);
    const typedSession = session as (import("next-auth").Session & { accessToken?: string });
    if (!typedSession?.accessToken) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: typedSession.accessToken });
    const calendar = google.calendar({ version: "v3", auth });

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
    endOfWeek.setHours(23, 59, 59, 999);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfWeek.toISOString(),
      timeMax: endOfWeek.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const items = response.data.items;
    if (!items || items.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const formattedEvents: StudyEvent[] = items.map((item, index) => {
      const start = new Date(item.start?.dateTime || item.start?.date || Date.now());
      const end = new Date(item.end?.dateTime || item.end?.date || Date.now());
      const title = item.summary || 'Evento sem título';

      // LÓGICA DE COR INTELIGENTE
      // Tenta usar a cor que veio do Google (Sincronia real)
      // Tenta usar o mapa hardcoded (Legado)
      // Usa cinza padrão
      let eventColor = defaultColor;
      
      if (item.colorId && googleIdToHexMap[item.colorId]) {
        eventColor = googleIdToHexMap[item.colorId];
      } else if (subjectColorMap[title]) {
        eventColor = subjectColorMap[title];
      }

      return {
        id: item.id || `google-event-${index}`,
        title: title,
        subject: title, 
        start, end,
        priority: 'media',
        completed: false,
        color: eventColor, 
        description: item.description || '',
        isScheduled: true,
      };
    });

    return NextResponse.json(formattedEvents, { status: 200 });

  } catch (error) {
    console.error("[GET] ERRO:", error);
    return NextResponse.json({ error: "Falha ao buscar eventos do Google Calendar" }, { status: 500 });
  }
}

// --- ROTA POST: SALVAR EVENTOS ---
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const typedSessionPost = session as (import("next-auth").Session & { accessToken?: string });
    if (!typedSessionPost?.accessToken) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const eventsToCreate: StudyEvent[] = await request.json();
    if (!eventsToCreate || eventsToCreate.length === 0) {
      return NextResponse.json({ message: "Nenhum evento para criar." }, { status: 200 });
    }

    // Inicializa feriados do Brasil
    const hd = new Holidays('BR'); 
    
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: typedSessionPost.accessToken });
    const calendar = google.calendar({ version: "v3", auth });

    for (const event of eventsToCreate) {
      // Calcula o ID da cor do Google mais próxima da cor Hex do front-end
      const targetColorId = findClosestColorId(event.color);

      // Loop de repetição por 4 semanas
      for (let week = 0; week < 4; week++) {
        const newStart = new Date(event.start);
        const newEnd = new Date(event.end);
        
        // Adiciona as semanas à data
        newStart.setDate(newStart.getDate() + (week * 7));
        newEnd.setDate(newEnd.getDate() + (week * 7));

        // Pula se for feriado
        if (hd.isHoliday(newStart)) {
          console.log(`Pulando feriado: ${newStart.toLocaleDateString()}`);
          continue; 
        }

        const requestBody = {
          summary: event.title,
          description: `Matéria: ${event.subject}\nPrioridade: ${event.priority}`,
          start: { 
            dateTime: newStart.toISOString(), 
            timeZone: 'America/Sao_Paulo' 
          },
          end: { 
            dateTime: newEnd.toISOString(), 
            timeZone: 'America/Sao_Paulo' 
          },
          colorId: targetColorId 
        };
        
        await calendar.events.insert({
          calendarId: 'primary',
          requestBody: requestBody,
        });
      }
    }

    return NextResponse.json({ message: "Cronograma salvo e sincronizado!" }, { status: 201 });

  } catch (error) {
    console.error("[POST] ERRO CRÍTICO:", error);
    return NextResponse.json({ error: "Falha ao salvar eventos" }, { status: 500 });
  }
}