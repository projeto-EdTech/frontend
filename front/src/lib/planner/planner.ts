export interface StudyEvent {
  id: string
  title: string
  subject: string
  start: Date
  end: Date
  priority: 'alta' | 'media' | 'baixa'
  completed?: boolean
  color: string
  description?: string
  userId?: string
  // Granularidade por conteúdo (planner). subject continua sendo a matéria.
  conteudoId?: string
  conteudo?: string
  materia?: string
}



// Cores disponíveis para as matérias
export const subjectColors = [
  '#ef4444', // Vermelho
  '#3b82f6', // Azul
  '#10b981', // Verde
  '#f59e0b', // Amarelo
  '#8b5cf6', // Roxo
  '#f97316', // Laranja
  '#06b6d4', // Ciano
  '#84cc16', // Lima
  '#ec4899', // Rosa
  '#64748b'  // Cinza
]

// Mapa estático matéria → cor (fonte única, usada pela rota /api/planner e pelos
// cards de conteúdo/revisão do Planner). Chaves são raízes em lowercase casadas por
// substring, de modo que "Língua Portuguesa" e "Português" → 'portugu', etc.
export const MATERIA_COLORS: Record<string, string> = {
  'matemát': '#ef4444',
  'físic': '#3b82f6',
  'químic': '#10b981',
  'históri': '#f59e0b',
  'portugu': '#8b5cf6',
  'literatur': '#8b5cf6',
  'geograf': '#f97316',
  'biolog': '#06b6d4',
  'inglês': '#84cc16',
  'filosof': '#ec4899',
  'sociolog': '#ec4899',
}

/**
 * Retorna a cor associada a uma matéria. Faz match por substring no mapa estático
 * `MATERIA_COLORS`; se nenhuma matéria conhecida casar, usa uma cor indexada de
 * `subjectColors` como fallback determinístico.
 */
export const colorForSubject = (name: string, index = 0): string => {
  const normalized = (name || '').toLowerCase().trim()
  if (normalized) {
    for (const key of Object.keys(MATERIA_COLORS)) {
      if (normalized.includes(key)) return MATERIA_COLORS[key]
    }
  }
  return subjectColors[index % subjectColors.length]
}

// Matérias disponíveis
export const availableSubjects = [
  'Matemática',
  'Física',
  'Química',
  'História',
  'Geografia',
  'Português',
  'Literatura',
  'Biologia',
  'Inglês',
  'Filosofia'
]

// Utilitários para conversão de datas
export const parseEventDates = (event: Omit<StudyEvent, 'start' | 'end'> & { start: string; end: string }): StudyEvent => ({
  ...event,
  start: new Date(event.start),
  end: new Date(event.end)
})

export const serializeEvent = (event: StudyEvent) => ({
  ...event,
  start: event.start.toISOString(),
  end: event.end.toISOString()
})
