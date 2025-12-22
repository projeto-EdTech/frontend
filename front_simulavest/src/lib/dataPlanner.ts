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
}

export interface WeeklyStats {
  hoursStudied: number
  goalsCompleted: number
  totalGoals: number
  subjects: number
}

// Dados mockados para desenvolvimento
// Semana fixa (Domingo a Sábado) relativa à data atual
const startOfCurrentWeek = () => {
  const now = new Date()
  const sunday = new Date(now)
  sunday.setHours(0, 0, 0, 0)
  const diff = sunday.getDate() - sunday.getDay()
  sunday.setDate(diff)
  return sunday
}

const sow = startOfCurrentWeek()

// Helper para criar datas dentro da semana atual, sempre com 1 hora de duração e início em hora cheia
const wDate = (weekdayOffset: number, hStart: number) => {
  const dStart = new Date(sow)
  dStart.setDate(sow.getDate() + weekdayOffset)
  dStart.setHours(hStart, 0, 0, 0) // minutos sempre zero
  const dEnd = new Date(dStart.getTime() + 60 * 60 * 1000) // 1 hora depois
  return { start: dStart, end: dEnd }
}

export const mockEvents: StudyEvent[] = [
  {
    id: '1',
    title: 'Estudar Matemática',
    subject: 'Matemática',
    ...wDate(1, 14), // Segunda 14:00-15:00
    priority: 'alta',
    color: '#ef4444',
    description: 'Álgebra linear e cálculo integral',
    completed: false
  },
  {
    id: '10',
    title: 'Revisão de Física',
    subject: 'Física',
    ...wDate(2, 10), // Terça 10:00-11:00
    priority: 'media',
    color: '#3b82f6',
    description: 'Mecânica e termodinâmica',
    completed: false
  },
  {
    id: '20',
    title: 'Química Orgânica',
    subject: 'Química',
    ...wDate(3, 15), // Quarta 15:00-16:00
    priority: 'alta',
    color: '#10b981',
    description: 'Reações e nomenclatura',
    completed: false
  },
  {
    id: '30',
    title: 'História do Brasil',
    subject: 'História',
    ...wDate(4, 9), // Quinta 09:00-10:00
    priority: 'baixa',
    color: '#f59e0b',
    description: 'República Velha e Era Vargas',
    completed: false
  },
  {
    id: '40',
    title: 'Literatura Brasileira',
    subject: 'Português',
    ...wDate(5, 16), // Sexta 16:00-17:00
    priority: 'media',
    color: '#8b5cf6',
    description: 'Modernismo e análise literária',
    completed: false
  },
  {
    id: '50',
    title: 'Geografia Política',
    subject: 'Geografia',
    ...wDate(6, 8), // Sábado 08:00-09:00
    priority: 'media',
    color: '#f97316',
    description: 'Geopolítica e blocos econômicos',
    completed: true
  },
  {
    id: '60',
    title: 'Revisão de Biologia',
    subject: 'Biologia',
    ...wDate(0, 11), // Domingo 11:00-12:00
    priority: 'baixa',
    color: '#06b6d4',
    description: 'Citologia e genética',
    completed: false
  }
]

// Estatísticas derivadas dos eventos da semana atual
export const mockStats: WeeklyStats = (() => {
  const hoursStudied = mockEvents.reduce((acc, ev) => acc + (ev.end.getTime() - ev.start.getTime()) / 3600000, 0)
  const goalsCompleted = mockEvents.filter(e => e.completed).length
  const totalGoals = mockEvents.length
  const subjects = new Set(mockEvents.map(e => e.subject)).size
  return {
    hoursStudied: Math.round(hoursStudied),
    goalsCompleted,
    totalGoals,
    subjects
  }
})()

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
