"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { useSession, signIn } from "next-auth/react";
import { useDrag, useDrop } from "react-dnd";
import Image from "next/image";
import {
  Clock,
  BookOpen,
  Filter,
  X,
  LogIn,
  Award,
  Wand2,
  Edit3,
  BarChart3,
  CheckCircle,
  Package,
  Trash2,
  CalendarDays,
  CheckCircle2,
  Check,
  Calendar,
  Rocket,
  Library,
  Activity,
  Cpu,
  GraduationCap,
  Headset,
  Lightbulb
} from "lucide-react";

interface StudyEvent {
  id: string;
  title: string;
  subject: string;
  start: Date;
  end: Date;
  priority: "alta" | "media" | "baixa";
  completed?: boolean;
  color: string;
  description?: string;
  isScheduled: boolean;
}

interface StudyCardState {
  subject: string;
  count: number;
  color: string;
  priority: Priority;
  title?: string;
}

interface WeeklyStats {
  hoursStudied: number;
  goalsCompleted: number;
  totalGoals: number;
  subjects: number;
}

type Priority = "alta" | "media" | "baixa";
type CompletedFilter = "" | "completed" | "pending";
interface Filters {
  subject: string;
  priority: "" | Priority;
  completed: CompletedFilter;
  dateRange: { start: string; end: string };
}

const Planner: React.FC = () => {
  const { status, data: session } = useSession();
  const [events, setEvents] = useState<StudyEvent[]>([]);
  const [allEvents, setAllEvents] = useState<StudyEvent[]>([]); // Para manter todos os eventos
  const [initialEvents, setInitialEvents] = useState<StudyEvent[]>([]); // Cópia original para restaurar
  const [studyCards, setStudyCards] = useState<StudyCardState[]>([]);
  const [preEditEvents, setPreEditEvents] = useState<StudyEvent[]>([]);
  const [isPreviewingSuggestion, setIsPreviewingSuggestion] = useState(false);
  const [preSuggestionEvents, setPreSuggestionEvents] = useState<StudyEvent[]>(
    []
  );
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats: WeeklyStats = useMemo(() => {
    const eventsToCount = events;
    const totalDurationMs = eventsToCount.reduce(
      (sum, event) => sum + (event.end.getTime() - event.start.getTime()),
      0
    );
    const hoursStudied = Math.round(totalDurationMs / (1000 * 60 * 60));
    const goalsCompleted = eventsToCount.filter((e) => e.completed).length;
    const totalGoals = eventsToCount.length;
    const subjects = new Set(eventsToCount.map((e) => e.subject)).size;
    return { hoursStudied, goalsCompleted, totalGoals, subjects };
  }, [events]);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<StudyEvent | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulePref, setSchedulePref] = useState<
    "full" | "morning" | "afternoon" | "evening"
  >("full");
  const [isEditing, setIsEditing] = useState(false);
  const [isFetchingSchedule, setIsFetchingSchedule] = useState(true);
  const timeConfig = { startHour: 8, endHour: 22 };

  const priorityCardCount: { [key in Priority]: number } = useMemo(
    () => ({
      baixa: 1,
      media: 2,
      alta: 4,
    }),
    []
  );

  const handleDecrementCardCount = useCallback((subject: string) => {
    setStudyCards((prevCards) =>
      prevCards.map((card) =>
        card.subject === subject
          ? { ...card, count: Math.max(0, card.count - 1) }
          : card
      )
    );
  }, []);

  const handleIncrementCardCount = useCallback(
    (subject: string) => {
      setStudyCards((prevCards) => {
        let cardToMove: StudyCardState | undefined;
        const otherCards = prevCards.filter((card) => {
          if (card.subject === subject) {
            cardToMove = { ...card, count: card.count + 1 };
            return false;
          }
          return true;
        });

        if (cardToMove) {
          return [cardToMove, ...otherCards];
        } else {
          const originalEvent = initialEvents.find(
            (e) => e.subject === subject
          );
          if (originalEvent) {
            const newCard: StudyCardState = {
              subject: originalEvent.subject,
              color: originalEvent.color,
              priority: originalEvent.priority,
              count: 1,
            };
            return [newCard, ...otherCards];
          }
        }
        return prevCards;
      });
    },
    [initialEvents]
  );

  const [filters, setFilters] = useState<Filters>({
    subject: "",
    priority: "",
    completed: "",
    dateRange: {
      start: "",
      end: "",
    },
  });

  useEffect(() => {
    // 1. Define a função que buscará os dados na nossa API
    const fetchGoogleCalendarEvents = async () => {
      setIsFetchingSchedule(true); // Ativa o indicador de carregamento
      try {
        const response = await fetch("/api/planner/Google");

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || errorData?.details || "Falha ao carregar o cronograma do Google Agenda";
          setError(errorMessage);
          setIsFetchingSchedule(false);
          return;
        }

        const googleEvents: StudyEvent[] = await response.json();

        // 2. "Hidrata" os dados: converte as strings de data recebidas em objetos Date
        const formattedEvents = googleEvents.map((event) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));

        console.log("Eventos carregados do Google Calendar:", formattedEvents);

        // 3. Atualiza os estados do planner com os eventos da agenda
        setAllEvents(formattedEvents);
        setEvents(formattedEvents);
        setInitialEvents(formattedEvents);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error
            ? err.message
            : "Um erro desconhecido ocorreu ao buscar a agenda."
        );
      } finally {
        setIsFetchingSchedule(false); // Desativa o indicador de carregamento, mesmo se der erro
      }
    };

    // 4. A busca só é executada se o usuário estiver autenticado
    if (status === "authenticated") {
      fetchGoogleCalendarEvents();
    } else if (status === "unauthenticated") {
      setIsFetchingSchedule(false); // Garante que o loading pare se o usuário não estiver logado
    }
  }, [status]);

  // Mostrar o modal de upgrade quando usuário FREE tentar acessar
  useEffect(() => {
    if (status === "authenticated" && session) {
      interface ExtendedSession {
        user?: {
          tier?: "FREE" | "Simula PRO";
        };
      }
      const userTier = (session as ExtendedSession)?.user?.tier;
      if (userTier === "FREE") {
        setShowUpgradeModal(true);
      }
    }
  }, [status, session]);

  const hasActiveFilters = React.useMemo(() => {
    return Boolean(
      filters.subject ||
        filters.priority ||
        filters.completed ||
        (filters.dateRange.start && filters.dateRange.end)
    );
  }, [filters]);

  const filterEvents = useCallback(
    (source: StudyEvent[]) => {
      let filtered = [...source];

      if (filters.subject) {
        filtered = filtered.filter((e) =>
          e.subject.toLowerCase().includes(filters.subject.toLowerCase())
        );
      }

      if (filters.priority) {
        const p = filters.priority as Priority;
        filtered = filtered.filter((e) => e.priority === p);
      }

      if (filters.completed) {
        const isCompleted = filters.completed === "completed";
        filtered = filtered.filter((e) => e.completed === isCompleted);
      }

      if (filters.dateRange.start && filters.dateRange.end) {
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(
          (e) => e.start >= startDate && e.start <= endDate
        );
      }

      filtered.sort((a, b) => a.start.getTime() - b.start.getTime());
      return filtered;
    },
    [filters]
  );

  const nextSubjects = React.useMemo(() => {
    const today = new Date().toDateString();
    return Array.from(
      new Set(
        events
          .filter((e) => !e.completed && e.start.toDateString() === today)
          .sort((a, b) => a.start.getTime() - b.start.getTime())
          .map((e) => e.subject)
      )
    );
  }, [events]);
  const todayDateString = new Date().toDateString();
  const todayEvents = events.filter(
    (e) => e.start.toDateString() === todayDateString
  );
  const allTodayCompleted =
    todayEvents.length > 0 && todayEvents.every((e) => e.completed);

  const daysOfWeek = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  const computeSlots = () => {
    const { startHour, endHour } = timeConfig;
    const fullSlots = Array.from(
      { length: endHour - startHour },
      (_, i) => startHour + i
    );

    if (events.length > 0) {
      const hours = events.map((ev) => ev.start.getHours());
      const minH = Math.max(startHour, Math.min(...hours));
      const maxH = Math.min(endHour, Math.max(...hours) + 1);
      return Array.from({ length: maxH - minH }, (_, i) => minH + i);
    }
    return fullSlots;
  };
  const timeSlots = computeSlots();

  // Nota: 'loading' removido porque 'status' do next-auth já fornece estado de carregamento.

  const handleUnscheduleEvent = useCallback(
    (eventId: string) => {
      let eventToUnschedule: StudyEvent | undefined;

      const remainingEvents = allEvents.filter((event) => {
        if (event.id === eventId) {
          eventToUnschedule = event;
          return false;
        }
        return true;
      });

      if (eventToUnschedule) {
        const updatedAllEvents = [
          { ...eventToUnschedule, isScheduled: false },
          ...remainingEvents,
        ];
        setAllEvents(updatedAllEvents);
        const scheduled = updatedAllEvents.filter((e) => e.isScheduled);
        setEvents(hasActiveFilters ? filterEvents(scheduled) : scheduled);
      }
      setSelectedEvent(null);
    },
    [allEvents, hasActiveFilters, filterEvents]
  );

  const handleCompleteEvent = (eventId: string, completed: boolean) => {
    // A lógica agora é apenas uma atualização de estado local.
    // Usamos .map() para criar um novo array com o evento modificado.
    const updatedAllEvents = allEvents.map((event) =>
      event.id === eventId
        ? { ...event, completed: completed } // Encontra o evento pelo ID e altera seu status 'completed'
        : event
    );

    // Atualiza a "fonte da verdade" com o novo array de eventos.
    setAllEvents(updatedAllEvents);

    // Atualiza também os eventos visíveis na tela.
    const scheduled = updatedAllEvents.filter((e) => e.isScheduled);
    setEvents(hasActiveFilters ? filterEvents(scheduled) : scheduled);

    // Fecha o modal após a alteração.
    setSelectedEvent(null);
  };

  const applyFilters = () => {
    setEvents(filterEvents(allEvents));
    setShowFilterModal(false);
  };

  const clearFilters = useCallback(() => {
    setFilters({
      subject: "",
      priority: "",
      completed: "",
      dateRange: {
        start: "",
        end: "",
      },
    });
    const restored = [...allEvents].sort(
      (a, b) => a.start.getTime() - b.start.getTime()
    );
    setEvents(restored);
    setShowFilterModal(false);
  }, [allEvents]);

  const shuffleEvents = useCallback(
    async (pref: "full" | "morning" | "afternoon" | "evening" = "full") => {
      clearFilters();
      try {
        // 1. BUSCA OS MATERIAIS DE ESTUDO DIRETAMENTE DA API
        const response = await fetch("/api/planner");
        if (!response.ok) {
          throw new Error("Falha ao carregar materiais para sugestão");
        }
        const subjectMaterials: {
          subject: string;
          color: string;
          priority: Priority;
          title: string;
        }[] = await response.json();

        // 2. CRIA UMA LISTA "CRUA" DE EVENTOS PARA EMBARALHAR, BASEADO NA PRIORIDADE
        // Ex: prioridade 'alta' (count 4) adiciona a matéria 4x na lista.
        const eventsToShuffle: Omit<
          StudyEvent,
          "id" | "start" | "end" | "isScheduled"
        >[] = [];
        subjectMaterials.forEach((material) => {
          const count = priorityCardCount[material.priority];
          for (let i = 0; i < count; i++) {
            eventsToShuffle.push({
              title: material.title,
              subject: material.subject,
              color: material.color,
              priority: material.priority,
              completed: false,
            });
          }
        });

        // 3. O RESTANTE DA LÓGICA PERMANECE, MAS USANDO "eventsToShuffle"
        let slots: { day: number; hour: number; minute: number }[] = [];
        const startHour = 8,
          endHour = 22,
          interval = 60;
        for (let day = 0; day < 7; day++) {
          for (let hour = startHour; hour < endHour; hour++) {
            for (let minute = 0; minute < 60; minute += interval) {
              slots.push({ day, hour, minute });
            }
          }
        }

        if (pref === "morning")
          slots = slots.filter((s) => s.hour >= 8 && s.hour < 12);
        if (pref === "afternoon")
          slots = slots.filter((s) => s.hour >= 12 && s.hour < 17);
        if (pref === "evening")
          slots = slots.filter((s) => s.hour >= 17 && s.hour < 22);

        // Embaralha a nova lista
        for (let i = eventsToShuffle.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [eventsToShuffle[i], eventsToShuffle[j]] = [
            eventsToShuffle[j],
            eventsToShuffle[i],
          ];
        }

        const newEvents: StudyEvent[] = [];
        for (const evt of eventsToShuffle) {
          if (slots.length === 0) {
            console.warn("Slots insuficientes para todos os eventos.");
            break;
          }
          const idx = Math.floor(Math.random() * slots.length);
          const slot = slots.splice(idx, 1)[0];
          const base = new Date();
          const currentWeekday = base.getDay();
          const diff = slot.day - currentWeekday;
          const newStart = new Date(base);
          newStart.setDate(base.getDate() + diff);
          newStart.setHours(slot.hour, slot.minute, 0, 0);
          const oneHour = 60 * 60 * 1000;
          const newEnd = new Date(newStart.getTime() + oneHour);

          newEvents.push({
            ...evt,
            id: `event-${Date.now()}-${evt.subject}-${Math.random()}`,
            start: newStart,
            end: newEnd,
            isScheduled: true,
          });
        }

        setAllEvents(newEvents);
        setInitialEvents(newEvents);
        setEvents(hasActiveFilters ? filterEvents(newEvents) : newEvents);
      } catch (error) {
        console.error("Erro ao gerar sugestão:", error);
        setError("Não foi possível gerar a sugestão. Tente novamente.");
      }
    },
    [clearFilters, filterEvents, hasActiveFilters, priorityCardCount]
  ); // Remova 'initialEvents' das dependências

  const handleEnterEditMode = async () => {
    // 1. Mantém o backup para caso o usuário cancele
    setPreEditEvents(allEvents);

    try {
      // 2. Busca as definições de matéria (metas) da API
      const response = await fetch("/api/planner");
      if (!response.ok) {
        throw new Error("Falha ao carregar as matérias para edição");
      }
      
      // Tipagem do retorno da API
      const subjectMaterials: {
        subject: string;
        color: string;
        priority: Priority;
        title: string;
      }[] = await response.json();

      // 3. Lógica de Reconciliação: Conta o que JÁ está no Google Agenda
      // Isso evita que o planner peça para você agendar algo que já está lá
      const currentCounts: Record<string, number> = {};
      
      allEvents.forEach(event => {
        // Consideramos apenas eventos ativos/agendados para a contagem
        if (event.isScheduled) {
           const key = event.subject; 
           currentCounts[key] = (currentCounts[key] || 0) + 1;
        }
      });

      // 4. Gera os Cards da Sidebar (Apenas o que falta agendar)
      const newStudyCards = subjectMaterials.map((material) => {
        const totalNeeded = priorityCardCount[material.priority]; // Ex: Alta = 4
        const alreadyScheduled = currentCounts[material.subject] || 0; // Ex: Já tem 3 no Google
        
        // Calcula o restante (Ex: 4 - 3 = 1 card restante na sidebar)
        const remaining = Math.max(0, totalNeeded - alreadyScheduled);

        return {
          subject: material.subject,
          color: material.color,
          priority: material.priority,
          title: material.title,
          count: remaining, // Usa o saldo restante
        };
      });

      setStudyCards(newStudyCards);

      // 5. MUDANÇA CRUCIAL: Não limpamos mais os eventos!
      // Mantemos o 'allEvents' como está e apenas ativamos a flag de edição.
      // Isso torna os eventos atuais "arrastáveis" imediatamente.
      setIsEditing(true);

    } catch (error) {
      console.error("Erro ao entrar no modo de edição:", error);
      setError("Não foi possível carregar as matérias. Tente novamente.");
    }
  };

  const handleSaveChanges = async () => {
    const scheduledEvents = allEvents.filter((event) => event.isScheduled);

    // Adicione o console.log aqui para ver o pacote JSON
    console.log(
      "Enviando o seguinte pacote JSON para a API:",
      JSON.stringify(scheduledEvents, null, 2)
    );

    try {
      const response = await fetch("/api/planner/Google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduledEvents),
      });

      if (!response.ok) {
        throw new Error("Falha ao salvar o cronograma no Google Agenda");
      }

      console.log("Cronograma salvo com sucesso no Google Agenda!");
      const finalEvents = hasActiveFilters
        ? filterEvents(scheduledEvents)
        : scheduledEvents;
      setEvents(finalEvents);
      setIsEditing(false);
    } catch (error) {
      console.error("Erro ao salvar o cronograma:", error);
      setError("Não foi possível salvar as alterações. Tente novamente.");
    }
  };

  const handleCancelEdit = () => {
    setAllEvents(preEditEvents);
    const scheduledEvents = preEditEvents.filter((e) => e.isScheduled);
    setEvents(
      hasActiveFilters ? filterEvents(scheduledEvents) : scheduledEvents
    );
    setIsEditing(false);
  };

  const handleGenerateSuggestion = async () => {
    // 1. Torna-se async
    setPreSuggestionEvents(allEvents);
    await shuffleEvents(schedulePref); // 2. Usa await para esperar a sugestão ser gerada
    setShowScheduleModal(false);
    setIsPreviewingSuggestion(true);
  };

  const handleSaveSuggestionPreview = async () => {
    const scheduledEvents = allEvents.filter((event) => event.isScheduled);

    try {
      const response = await fetch("/api/planner/Google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduledEvents),
      });
      if (!response.ok) {
        throw new Error("Falha ao salvar a sugestão no Google Agenda");
      }
      console.log("Sugestão de cronograma salva com sucesso no Google Agenda!");
      setIsPreviewingSuggestion(false);
      setPreSuggestionEvents([]);
    } catch (error) {
      console.error("Erro ao salvar a sugestão de cronograma:", error);
      setError("Não foi possível salvar a sugestão. Tente novamente.");
    }
  };

  const handleCancelSuggestionPreview = () => {
    setAllEvents(preSuggestionEvents);
    const scheduledEvents = preSuggestionEvents.filter((e) => e.isScheduled);
    setEvents(
      hasActiveFilters ? filterEvents(scheduledEvents) : scheduledEvents
    );

    setIsPreviewingSuggestion(false);
    setPreSuggestionEvents([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const todayWeekday = new Date().getDay();

  const priorityColors = {
    alta: "bg-red-500",
    media: "bg-yellow-500",
    baixa: "bg-green-500",
  };

  const StudyCard: React.FC<{
    subject: string;
    color: string;
    priority: Priority;
    count: number;
    title?: string;
    onClick: () => void;
  }> = ({ subject, color, priority, count, title, onClick }) => {
    const [{ isDragging }, drag] = useDrag(
      () => ({
        type: "study-card",
        item: { subject, color, priority, title },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      }),
      [subject, color, priority, title]
    );

    return (
      <div
        ref={drag as unknown as React.LegacyRef<HTMLDivElement>}
        onClick={onClick}
        className={`p-2.5 rounded-[10px] cursor-grab active:cursor-grabbing transition-all duration-150 flex items-center justify-between shadow-sm hover:shadow-md ${isDragging ? "opacity-40 scale-95" : "opacity-100"}`}
        style={{ backgroundColor: color }}
      >
        <span className="text-white font-medium text-[13px] truncate drop-shadow-sm">
          {subject}
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center text-[11px] font-bold text-white bg-black/20 w-5 h-5 rounded-full">
            {count}
          </span>
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 border-[1.5px] border-white/60 ${priorityColors[priority]}`}
          />
        </div>
      </div>
    );
  };

  const PlannerEventCard: React.FC<{ event: StudyEvent }> = ({ event }) => {
    const [{ isDragging }, drag] = useDrag(
      () => ({
        type: "planner-card",
        item: { id: event.id },
        collect: (monitor) => ({ isDragging: monitor.isDragging() }),
      }),
      [event.id]
    );

    return (
      <div
        ref={
          isEditing
            ? (drag as unknown as React.LegacyRef<HTMLDivElement>)
            : undefined
        }
        key={event.id}
        className={`mb-1.5 p-2.5 rounded-[10px] cursor-pointer transition-all duration-150 group relative shadow-sm hover:shadow-md ${
          event.completed ? "opacity-60" : ""
        } ${isDragging ? "opacity-30" : ""}`}
        style={{
          backgroundColor: event.color,
        }}
        onClick={() => !isEditing && setSelectedEvent(event)}
      >
        {event.completed && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-[10px] font-bold">✓</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-1">
          <span className="text-white text-[13px] font-medium truncate flex-1 drop-shadow-sm">
            {event.title}
          </span>
          <div
            className={`w-2 h-2 rounded-full ${priorityColors[event.priority]} ml-2 flex-shrink-0 border-[1.5px] border-white/60 shadow-sm`}
          />
        </div>

        <div className="text-white/90 text-[11px] font-normal drop-shadow-sm">
          {formatTime(event.start)} - {formatTime(event.end)}
        </div>
      </div>
    );
  };

  const GridCell: React.FC<{
    weekdayIndex: number;
    hour: number;
    cellEvents: StudyEvent[];
  }> = ({ weekdayIndex, hour, cellEvents }) => {
    const oneHour = 60 * 60 * 1000;
    const [{ isOver }, drop] = useDrop<unknown, void, { isOver: boolean }>(
      () => ({
        accept: ["study-card", "planner-card"],
        drop: (item, monitor) => {
          const type = monitor.getItemType();
          const base = new Date();
          const diff = weekdayIndex - base.getDay();
          const newStart = new Date(base);
          newStart.setDate(base.getDate() + diff);
          newStart.setHours(hour, 0, 0, 0);

          if (type === "study-card") {
            // 1. Extraia também o 'title' do item arrastado
            const { subject, color, priority, title } = item as {
              subject: string;
              color: string;
              priority: Priority;
              title?: string;
            };
            const newEnd = new Date(newStart.getTime() + oneHour);
            const newEvent: StudyEvent = {
              id: `event-${Date.now()}-${subject}`,
              title: title || subject,
              subject,
              color,
              priority,
              start: newStart,
              end: newEnd,
              completed: false,
              isScheduled: true,
            };
            setAllEvents((prev) => {
              const updated = [...prev, newEvent];
              return updated;
            });
            handleDecrementCardCount(subject);
          } else if (type === "planner-card") {
            const { id } = item as { id: string };
            setAllEvents((prev) => {
              const updated = prev.map((e) => {
                if (e.id === id) {
                  const duration = e.end.getTime() - e.start.getTime();
                  const newEnd = new Date(newStart.getTime() + duration);
                  return { ...e, start: newStart, end: newEnd };
                }
                return e;
              });
              return updated;
            });
          }
        },
        collect: (monitor) => ({ isOver: monitor.isOver() }),
      }),
      [weekdayIndex, hour, handleDecrementCardCount]
    );

    const scheduledEvents = isEditing
      ? allEvents.filter(
          (ev) =>
            ev.isScheduled &&
            ev.start.getDay() === weekdayIndex &&
            ev.start.getHours() === hour
        )
      : cellEvents;

    return (
      <div
        ref={
          isEditing
            ? (drop as unknown as React.LegacyRef<HTMLDivElement>)
            : undefined
        }
        className={`p-1 min-h-[60px] relative border-r border-b border-gray-100/80 transition-all duration-150 ${
          isEditing && isOver
            ? "bg-blue-500/10 ring-1 ring-inset ring-blue-400/40"
            : ""
        }`}
      >
        {isEditing && isOver && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
            <span className="text-2xl">📌</span>
          </div>
        )}
        {scheduledEvents.map((event) => (
          <PlannerEventCard key={event.id} event={event} />
        ))}
      </div>
    );
  };

  const [{ isOverRemoveArea }, dropRemove] = useDrop(
    () => ({
      accept: "planner-card",
      drop: (item: { id: string }) => {
        if (item.id) {
          const eventToUnschedule = allEvents.find((e) => e.id === item.id);
          if (eventToUnschedule) {
            handleUnscheduleEvent(item.id);
            handleIncrementCardCount(eventToUnschedule.subject);
          }
        }
      },
      collect: (monitor) => ({ isOverRemoveArea: monitor.isOver() }),
    }),
    [allEvents, handleUnscheduleEvent, handleIncrementCardCount]
  );

  if (status === "loading") {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 p-6 rounded-[20px] shadow-xl border border-gray-200">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/Mascote/banners/Camaleão_13.png"
              alt="Carregando"
              width={140}
              height={140}
              className="animate-pulse drop-shadow-2xl"
            />
          </div>
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-transparent border-t-blue-600 border-r-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-[13px]">
            Verificando autenticação...
          </p>
        </div>
      </div>
    );
  }

  if (isFetchingSchedule) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-white p-6 rounded-[20px] shadow-xl border border-gray-200">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/Mascote/banners/Camaleão_13.png"
              alt="Carregando"
              width={140}
              height={140}
              className="animate-pulse drop-shadow-2xl"
            />
          </div>
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-transparent border-t-purple-600 border-r-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-[13px]">
            Sincronizando com sua agenda do Google...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="w-full bg-white p-6 rounded-[20px] shadow-xl border border-gray-200">
        <div className="max-w-md mx-auto text-center py-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/Mascote/banners/Camaleão_1.png"
              alt="Mascote Vestibuline"
              width={170}
              height={170}
              className="drop-shadow-2xl"
            />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-gray-900 tracking-[-0.5px]">
            Acesse seu Planner de Estudos
          </h1>
          <p className="mt-3 text-gray-600 text-[14px]">
            Faça login com o Google para acessar o planner e organizar sua
            rotina
          </p>
          <button
            onClick={() => signIn("google")}
            className="mt-8 inline-flex items-center gap-3 bg-gradient-to-b from-blue-500 to-blue-600 text-white font-medium px-8 py-3 rounded-[10px] shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-150 active:scale-[0.98] text-[14px] cursor-pointer"
          >
            <LogIn size={18} />
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  // Nota: A verificação de tier agora é feita via modal, não bloqueia a renderização

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center p-6">
        <div className="text-center bg-white/95 backdrop-blur-2xl rounded-[20px] p-8 border border-red-200/60 shadow-2xl max-w-md">
          <div className="flex justify-center mb-5">
            <Image
              src="/Mascote/banners/Camaleão_19.png"
              alt="Erro"
              width={130}
              height={130}
              className="drop-shadow-2xl"
            />
          </div>
          <h2 className="text-2xl font-semibold text-red-600 mb-3 tracking-[-0.5px]">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-700 mb-2 font-medium text-[14px]">
            Erro ao carregar dados
          </p>
          <p className="text-gray-600 mb-6 text-[13px]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-[10px] transition-all duration-150 font-medium shadow-md hover:shadow-lg active:scale-[0.98] text-[13px] cursor-pointer"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white p-5 md:p-7 rounded-xl shadow-xl border border-gray-200">
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-7">
              <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                    <Image
                      src="/Mascote/banners/Camaleão_3.png"
                      alt="Mascote Vestibuline"
                      width={70}
                      height={70}
                      className="drop-shadow-2xl"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <h1 className="text-[28px] font-semibold text-gray-700 tracking-[-0.5px]">
                      Planner de Estudos
                    </h1>
                    <p className="text-gray-500 text-[13px] font-normal">
                      Organize sua rotina e acompanhe seu progresso
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  {!isEditing && !isPreviewingSuggestion && (
                    <>
                      <button
                        onClick={() => setShowFilterModal(true)}
                        className="relative bg-white backdrop-blur-2xl text-gray-700 px-3.5 py-2 rounded-[10px] flex items-center gap-2 border border-gray-200 shadow-sm hover:shadow-md hover:bg-white hover:border-gray-300/60 transition-all duration-150 cursor-pointer font-medium text-[13px]"
                      >
                        <Filter size={15} />
                        <span className="hidden sm:inline">Filtros</span>
                        {hasActiveFilters && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full border-[1.5px] border-white shadow-sm animate-pulse"></div>
                        )}
                      </button>
                      <button
                        onClick={() => setShowScheduleModal(true)}
                        className="bg-white backdrop-blur-2xl text-gray-700 px-3.5 py-2 rounded-[10px] flex items-center gap-2 border border-gray-200 shadow-sm hover:shadow-md hover:bg-white hover:border-gray-300/60 transition-all duration-150 cursor-pointer font-medium text-[13px]"
                      >
                        <Wand2 size={15} />
                        <span className="hidden sm:inline">Sugerir</span>
                      </button>
                      <button
                        onClick={handleEnterEditMode}
                        className="bg-gradient-to-b from-blue-500 to-blue-600 text-white px-4 py-2 rounded-[10px] flex items-center gap-2 shadow-lg hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all duration-150 cursor-pointer font-medium text-[13px]"
                      >
                        <Edit3 size={15} />
                        <span className="hidden sm:inline">Editar</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
              <div className="lg:col-span-1 space-y-5">
                <div className="bg-white backdrop-blur-2xl rounded-[16px] p-5 border border-gray-200 shadow-lg">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-[15px] font-semibold text-gray-700 flex items-center gap-2 tracking-[-0.3px]">
                      <BarChart3 size={18} className="text-gray-700" />
                      Resumo Semanal
                    </h3>
                    <Image
                      src="/Mascote/banners/Camaleão_5.png"
                      alt="Mascote"
                      width={55}
                      height={55}
                      className="opacity-80"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-[10px] transition-all hover:shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-blue-500/10 rounded-[8px]">
                          <Clock size={16} className="text-blue-600" />
                        </div>
                        <span className="font-medium text-gray-700 text-[13px]">
                          Horas de Estudo
                        </span>
                      </div>
                      <span className="font-bold text-gray-700 text-[14px]">
                        {stats.hoursStudied}h
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-[10px] transition-all hover:shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-green-500/10 rounded-[8px]">
                          <CheckCircle size={16} className="text-green-600" />
                        </div>
                        <span className="font-medium text-gray-700 text-[13px]">
                          Metas Concluídas
                        </span>
                      </div>
                      <span className="font-bold text-gray-700 text-[14px]">
                        {stats.goalsCompleted}/{stats.totalGoals}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-[10px] transition-all hover:shadow-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-purple-500/10 rounded-[8px]">
                          <BookOpen size={16} className="text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-700 text-[13px]">
                          Matérias
                        </span>
                      </div>
                      <span className="font-bold text-gray-700 text-[14px]">
                        {stats.subjects}
                      </span>
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div
                    ref={
                      dropRemove as unknown as React.LegacyRef<HTMLDivElement>
                    }
                    className={`bg-white/95 backdrop-blur-2xl rounded-[16px] p-5 border transition-all relative overflow-hidden shadow-lg ${
                      isOverRemoveArea
                        ? "border-red-400 bg-red-50/80"
                        : "border-gray-200/60"
                    }`}
                  >
                    <h3 className="text-[15px] font-semibold text-gray-800 mb-4 flex items-center gap-2 tracking-[-0.3px]">
                      <Package size={18} className="text-gray-500" />
                      Cards de Estudo
                    </h3>

                    {isOverRemoveArea && (
                      <div className="absolute inset-0 bg-red-500/10 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                        <Trash2 size={30} className="text-red-500" />
                        <span className="font-semibold text-red-600 text-[13px]">
                          Remover do cronograma
                        </span>
                      </div>
                    )}

                    <div
                      className={`space-y-2.5 transition-opacity ${isOverRemoveArea ? "opacity-0" : "opacity-100"}`}
                    >
                      {studyCards
                        .filter((card) => card.count > 0)
                        .map((card) => (
                          <StudyCard
                            key={card.subject}
                            subject={card.subject}
                            color={card.color}
                            priority={card.priority}
                            count={card.count}
                            title={card.title}
                            onClick={() => {}}
                          />
                        ))}
                      {studyCards.filter((card) => card.count > 0).length ===
                        0 && (
                        <p className="text-center text-gray-500 text-[12px] py-6">
                          Arraste os cards para o calendário
                        </p>
                      )}
                    </div>
                  </div>
                ) : !isPreviewingSuggestion ? (
                  <div className="bg-white backdrop-blur-2xl rounded-[16px] p-5 border border-gray-200 shadow-lg">
                    <h3 className="text-[15px] font-semibold text-gray-700 mb-4 flex items-center gap-2 tracking-[-0.3px]">
                      <CalendarDays size={18} className="text-gray-700" />
                      Próximas Matérias (Hoje)
                    </h3>
                    {allTodayCompleted ? (
                      <div className="text-center py-6">
                        <CheckCircle2
                          size={36}
                          className="mx-auto text-green-500 mb-2"
                        />
                        <p className="font-semibold text-green-600 text-[14px]">
                          Parabéns!
                        </p>
                        <p className="text-gray-500 text-[12px] mt-1">
                          Você completou todas as metas de hoje
                        </p>
                      </div>
                    ) : nextSubjects.length > 0 ? (
                      <div className="space-y-2">
                        {nextSubjects.slice(0, 4).map((subject) => (
                          <div
                            key={subject}
                            className="bg-gradient-to-r from-gray-50 to-gray-100/50 p-2.5 rounded-[10px] text-gray-700 font-medium text-[13px] border border-gray-100/60 hover:shadow-sm transition-all"
                          >
                            {subject}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 text-[12px] py-6">
                        Nenhuma matéria agendada para hoje
                      </p>
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>

              <div className="lg:col-span-3">
                <div className="bg-white backdrop-blur-2xl rounded-[16px] border border-gray-200 overflow-hidden shadow-lg">
                  <div className="grid grid-cols-8 border-b border-gray-200 bg-white">
                    <div className="p-3 text-center font-semibold text-[11px] text-gray-700 tracking-wide">
                      HORA
                    </div>
                    {daysOfWeek.map((day, index) => (
                      <div key={day} className="p-3 text-center relative">
                        <span
                          className={`inline-block px-3 py-1 rounded-md font-semibold text-[11px] tracking-wide ${
                            index === todayWeekday
                              ? "text-blue-600 bg-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="max-h-[600px] overflow-y-auto custom-scrollbar-modern">
                    <div className="grid grid-cols-8">
                      {timeSlots.map((hour) => (
                        <React.Fragment key={hour}>
                          <div className="p-3 text-center font-mono text-[11px] text-gray-400 border-r border-gray-200 bg-white">
                            {`${hour}:00`}
                          </div>
                          {daysOfWeek.map((_, weekdayIndex) => {
                            const cellEvents = events.filter(
                              (ev) =>
                                ev.start.getDay() === weekdayIndex &&
                                ev.start.getHours() === hour
                            );
                            return (
                              <GridCell
                                key={`${weekdayIndex}-${hour}`}
                                weekdayIndex={weekdayIndex}
                                hour={hour}
                                cellEvents={cellEvents}
                              />
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-center gap-4 items-center">
                <button
                  onClick={handleCancelEdit}
                  className="bg-white text-gray-700 px-6 py-2.5 rounded-[10px] flex items-center gap-2 transition-all duration-150 font-medium border border-gray-200 shadow-sm hover:bg-red-100 hover:text-red-500 hover:shadow-md active:scale-[0.98] text-[13px] cursor-pointer"
                >
                  <X size={16} />
                  Cancelar
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-[10px] flex items-center gap-2 transition-all duration-150 font-medium shadow-md hover:shadow-lg active:scale-[0.98] text-[13px] cursor-pointer"
                >
                  <Check size={16} />
                  Salvar Cronograma
                </button>
                <div className="hidden md:block">
                  <Image
                    src="/Mascote/banners/Camaleão_23.png"
                    alt="Salvar"
                    width={70}
                    height={70}
                  />
                </div>
              </div>
            )}

            {isPreviewingSuggestion && (
              <div className="mt-6 flex justify-center gap-4 items-center">
                <button
                  onClick={handleCancelSuggestionPreview}
                  className="bg-white/90 text-gray-800 px-6 py-2.5 rounded-[10px] flex items-center gap-2 transition-all duration-150 font-medium border border-gray-300/60 shadow-sm hover:bg-red-100 hover:text-red-500 hover:shadow-md active:scale-[0.98] text-[13px] cursor-pointer"
                >
                  <X size={16} />
                  Cancelar Sugestão
                </button>
                <div className="hidden md:block">
                  <Image
                    src="/Mascote/banners/Camaleão_30.png"
                    alt="Aprovar sugestão"
                    width={65}
                    height={65}
                  />
                </div>
                <button
                  onClick={handleSaveSuggestionPreview}
                  className="bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-[10px] flex items-center gap-2 transition-all duration-150 font-medium shadow-md hover:shadow-lg active:scale-[0.98] text-[13px] cursor-pointer"
                >
                  <Check size={16} />
                  Aprovar e Salvar
                </button>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Modais Rendereizados via Portal na Raiz do body para evitar Clipping de Blur e Z-Index issues */}
      {mounted && createPortal(
        <>
          {selectedEvent && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[10000] animate-fadeIn"
              onClick={() => setSelectedEvent(null)}
            >
              <div
                className="bg-white/90 backdrop-blur-xl rounded-[20px] p-7 max-w-md w-full mx-4 shadow-2xl transform animate-slideUp border border-gray-200/60 relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute top-4 right-4 opacity-15">
                  <Image
                    src={
                      selectedEvent.completed
                        ? "/Mascote/banners/Camaleão_21.png"
                        : "/Mascote/banners/Camaleão_14.png"
                    }
                    alt="Evento"
                    width={75}
                    height={75}
                  />
                </div>

                <div className="flex items-start justify-between mb-5 relative z-10">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 tracking-[-0.5px]">
                      {selectedEvent.title}
                    </h2>
                    <p className="text-gray-500 text-[13px] mt-0.5">
                      {selectedEvent.subject}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors active:scale-95 cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100/50 p-3 rounded-[10px] border border-gray-100/60">
                    <Calendar size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-700 text-[13px]">
                      {new Date(selectedEvent.start).toLocaleDateString(
                        "pt-BR",
                        { weekday: "long", day: "2-digit", month: "long" }
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100/50 p-3 rounded-[10px] border border-gray-100/60">
                    <Clock size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-700 text-[13px]">
                      {formatTime(selectedEvent.start)} -{" "}
                      {formatTime(selectedEvent.end)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-gray-100/50 p-3 rounded-[10px] border border-gray-100/60">
                    <div
                      className={`w-3.5 h-3.5 rounded-full ${priorityColors[selectedEvent.priority]}`}
                    />
                    <span className="font-medium text-gray-700 capitalize text-[13px]">
                      Prioridade {selectedEvent.priority}
                    </span>
                  </div>

                  <div className="flex gap-3 pt-4 mt-5 border-t border-gray-200/60">
                    {(() => {
                      const eventDay = selectedEvent.start.getDay();
                      const canComplete = eventDay <= todayWeekday;
                      return (
                        <button
                          onClick={() => {
                            if (!canComplete) return;
                            setSelectedEvent(null);
                            const newStatus = !selectedEvent.completed;
                            handleCompleteEvent(selectedEvent.id, newStatus);
                          }}
                          disabled={!canComplete}
                          title={
                            !canComplete
                              ? "Só pode concluir no dia ou depois do evento"
                              : undefined
                          }
                          className={`flex-1 py-3 rounded-[10px] transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg font-medium text-[13px] cursor-pointer ${
                            !canComplete
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : selectedEvent.completed
                                ? "bg-gradient-to-b from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                                : "bg-gradient-to-b from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                          }`}
                        >
                          {selectedEvent.completed
                            ? "Marcar como Pendente"
                            : "Marcar como Concluído"}
                        </button>
                      );
                    })()}
                    {isEditing && (
                      <button
                        onClick={() => {
                          const id = selectedEvent.id;
                          setSelectedEvent(null);
                          handleUnscheduleEvent(id);
                        }}
                        className="flex-1 bg-gradient-to-b from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-[10px] transition-all duration-200 transform active:scale-95 shadow-md hover:shadow-lg font-medium text-[13px] cursor-pointer"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showFilterModal && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[10000] animate-fadeIn"
              onClick={() => setShowFilterModal(false)}
            >
              <div
                className="bg-white/90 backdrop-blur-xl rounded-[20px] p-7 max-w-md w-full mx-4 shadow-2xl transform animate-slideUp border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-700 tracking-[-0.5px]">
                    Filtros
                  </h2>
                  <button
                    onClick={() => setShowFilterModal(false)}
                    className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors active:scale-95 cursor-pointer"
                  >
                    <X size={18} className="text-gray-700" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-2">
                      Matéria
                    </label>
                    <input
                      type="text"
                      placeholder="Filtrar por matéria..."
                      value={filters.subject}
                      onChange={(e) =>
                        setFilters((f) => ({ ...f, subject: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[13px] focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-2">
                      Prioridade
                    </label>
                    <div className="flex gap-2">
                      {(["alta", "media", "baixa"] as Priority[]).map(
                        (p) => (
                          <button
                            key={p}
                            onClick={() =>
                              setFilters((f) => ({
                                ...f,
                                priority: f.priority === p ? "" : p,
                              }))
                            }
                            className={`flex-1 px-3 py-2 rounded-[10px] text-[12px] font-medium border transition-all cursor-pointer ${
                              filters.priority === p
                                ? `${priorityColors[p]} text-white border-transparent shadow-md`
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {p.charAt(0).toUpperCase() + p.slice(1)}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters.completed}
                      onChange={(e) =>
                        setFilters((f) => ({
                          ...f,
                          completed: e.target.value as CompletedFilter,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-[10px] text-[13px] focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition outline-none"
                    >
                      <option value="">Todos</option>
                      <option value="completed">Concluído</option>
                      <option value="pending">Pendente</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-7">
                  <button
                    onClick={clearFilters}
                    className="w-full bg-white text-gray-700 px-4 py-2.5 rounded-[10px] font-medium border border-gray-200 shadow-sm hover:!border-blue-500 hover:shadow-md transition-all active:scale-[0.98] text-[13px] cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                  <button
                    onClick={applyFilters}
                    className="w-full bg-gradient-to-b from-blue-500 to-blue-600 text-white px-4 py-2.5 rounded-[10px] font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all active:scale-[0.98] text-[13px] cursor-pointer"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          )}

          {showScheduleModal && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[10000] animate-fadeIn"
              onClick={() => setShowScheduleModal(false)}
            >
              <div
                className="bg-white/90 backdrop-blur-xl rounded-[20px] p-7 max-w-md w-full mx-4 shadow-2xl transform animate-slideUp border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-700 tracking-[-0.5px]">
                    Gerar Sugestão
                  </h2>
                  <button
                    onClick={() => setShowScheduleModal(false)}
                    className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors active:scale-95 cursor-pointer"
                  >
                    <X size={18} className="text-gray-600" />
                  </button>
                </div>

                <>
                  <p className="text-gray-600 mb-5 text-[13px]">
                    Selecione sua disponibilidade e nós criaremos um
                    cronograma otimizado para você.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {(
                      ["full", "morning", "afternoon", "evening"] as const
                    ).map((pref) => (
                      <button
                        key={pref}
                        onClick={() => setSchedulePref(pref)}
                        className={`p-4 rounded-[12px] text-left transition-all duration-150 border-2 cursor-pointer ${
                          schedulePref === pref
                            ? "!bg-blue-100 border-blue-500 shadow-md"
                            : "!bg-gray-200 border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                      >
                        <span className="font-semibold !text-gray-700 capitalize text-[13px] block">
                          {
                            {
                              full: "Dia Inteiro",
                              morning: "Manhã",
                              afternoon: "Tarde",
                              evening: "Noite",
                            }[pref]
                          }
                        </span>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {
                            {
                              full: "8h - 22h",
                              morning: "8h - 12h",
                              afternoon: "12h - 17h",
                              evening: "17h - 22h",
                            }[pref]
                          }
                        </p>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerateSuggestion}
                    className="w-full bg-gradient-to-b from-blue-500 to-blue-600 text-white px-4 py-3 rounded-[10px] font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[13px] cursor-pointer"
                  >
                    <Wand2 size={16} />
                    Gerar Cronograma Mágico
                  </button>
                </>
              </div>
            </div>
          )}

          {showUpgradeModal && (
            <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/10 backdrop-blur-[1px] transition-opacity duration-300 animate-in fade-in"
              onClick={() => setShowUpgradeModal(false)}
            >
              <div
                className="relative w-full max-w-[580px] bg-white/90 backdrop-blur-3xl rounded-[32px] p-[48px] shadow-[0_32px_80px_rgba(0,0,0,0.15)] border border-white/50 animate-[macOS-fade-in_0.3s_cubic-bezier(0.4,0,0.2,1)_forwards]"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Arial, sans-serif' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative z-10 text-center mx-auto">
                  <div className="inline-flex items-center gap-2 bg-[#5856D6]/10 text-[#5856D6] px-4 py-1.5 rounded-full text-[12px] font-bold mb-5 border border-purple-200/30 tracking-[0.3px] uppercase">
                    <Award size={14} className="opacity-80" />
                    Recurso Premium
                  </div>

                  <h2 className="text-[28px] font-bold text-[#1d1d1f] mb-3 tracking-tight leading-tight">
                    Desbloqueie o Planner
                  </h2>

                  <p className="text-[15px] text-black/60 mb-8 leading-relaxed max-w-[340px] mx-auto">
                    Organize seus estudos com inteligência e maximize sua produtividade com o{" "}
                    <span className="font-bold text-[#5856D6]">
                      Simula PRO
                    </span>.
                  </p>

                  {/* Lista de benefícios (8 tópicos com ícones coloridos) */}
                  <div className="mb-8 text-left max-w-2xl mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {[
                        { icon: <Rocket className="w-5 h-5" />, color: '#5856D6', text: "Acesso ilimitado a simulados" },
                        { icon: <Library className="w-5 h-5" />, color: '#007AFF', text: "Biblioteca de provas" },
                        { icon: <Activity className="w-5 h-5" />, color: '#34C759', text: "Estatística em tempo real" },
                        { icon: <Cpu className="w-5 h-5" />, color: '#FF2D55', text: "Resolução com IA (PRO)" },
                        { icon: <Lightbulb className="w-5 h-5" />, color: '#FFCC00', text: "Plano de estudos otimizado" },
                        { icon: <GraduationCap className="w-5 h-5" />, color: '#FF3B30', text: "Consulta de notas de corte" },
                        { icon: <BarChart3 className="w-5 h-5" />, color: '#5E5CE6', text: "Estatísticas avançadas" },
                        { icon: <Headset className="w-5 h-5" />, color: '#FF9500', text: "Suporte prioritário 24/7" }
                      ].map((benefit, index) => (
                        <div key={index} className="flex items-center gap-3 group">
                          <div 
                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                            style={{ backgroundColor: `${benefit.color}15`, color: benefit.color }}
                          >
                            {benefit.icon}
                          </div>
                          <span className={`text-[14.5px] font-medium leading-[1.3] text-black/85`} style={{ fontFamily: 'SF Pro Text, -apple-system, BlinkMacSystemFont, sans-serif' }}>
                            {benefit.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-3">
                      <button
                        onClick={() => (window.location.href = "/paidPlan")}
                        className="w-full bg-gradient-to-b from-blue-500 to-blue-600 text-white font-bold text-[14px] px-8 py-3.5 rounded-[12px] shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transform active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:ring-offset-2 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-blue-500/20"
                      >
                        Garantir meu Simula PRO agora
                      </button>
                      
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center gap-3 text-[13px] text-black/50 font-medium">
                          <span className="bg-black/5 px-2 py-0.5 rounded-md text-black/70">R$ 41,50/mês</span>
                          <div className="w-[1px] h-3 bg-black/10" />
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-[#34C759]" />
                            <span>Sem fidelidade</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-black/30">Pagamento 100% seguro via Mercado Pago ou PIX</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowUpgradeModal(false)}
                      className="w-full text-black/40 font-semibold py-1 hover:text-black/70 transition-all duration-200 text-[14px] cursor-pointer focus:outline-none focus:underline"
                    >
                      Continuar no plano FREE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )}    </>
  );
};

export default Planner;
