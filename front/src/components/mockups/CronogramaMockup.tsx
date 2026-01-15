"use client";

import React, { useState, useCallback } from "react";
// ALTERAÇÃO 1: Adicionado DndProvider
import { useDrag, useDrop, DndProvider } from "react-dnd";
// ALTERAÇÃO 2: Importado o backend HTML5
import { HTML5Backend } from "react-dnd-html5-backend";
import { Edit3, Check, X, GripVertical } from "lucide-react";

interface CronogramaMockupProps {
  isDark: boolean;
}

// Definição do tipo para os eventos de estudo
interface StudyEvent {
  id: string;
  title: string;
  dayIndex: number; // 0 = DOM, 1 = SEG, ...
  hour: number;     // 17, 18, etc.
  duration: number; // em horas
  color: string;    // Classe Tailwind bg-...
}

// Dados iniciais
const INITIAL_EVENTS: StudyEvent[] = [
  { id: "1", title: "Revisão Matemática", dayIndex: 1, hour: 17, duration: 1, color: "bg-cyan-500" },
  { id: "2", title: "Estudar Física", dayIndex: 1, hour: 18, duration: 1, color: "bg-red-500" },
  { id: "3", title: "Geografia Física", dayIndex: 1, hour: 19, duration: 1, color: "bg-orange-500" },
  { id: "4", title: "Geografia Política", dayIndex: 1, hour: 20, duration: 1, color: "bg-orange-500" },
  { id: "5", title: "Estudar Biologia", dayIndex: 2, hour: 18, duration: 1, color: "bg-red-500" },
  { id: "6", title: "Estudar História", dayIndex: 3, hour: 17, duration: 1, color: "bg-red-500" },
  { id: "7", title: "Química Orgânica", dayIndex: 3, hour: 21, duration: 1, color: "bg-teal-500" },
  { id: "8", title: "Revisão Geral", dayIndex: 4, hour: 20, duration: 1, color: "bg-blue-500" },
  { id: "9", title: "Química Inorgânica", dayIndex: 5, hour: 19, duration: 1, color: "bg-teal-500" },
  { id: "10", title: "Química Geral", dayIndex: 6, hour: 19, duration: 1, color: "bg-teal-500" },
];

// Componente do Card Arrastável
const DraggableEventCard = ({ 
  event, 
  isEditing, 
  isDark 
}: { 
  event: StudyEvent; 
  isEditing: boolean; 
  isDark: boolean; 
}) => {
  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: "CRONOGRAMA_CARD",
      item: { id: event.id },
      canDrag: isEditing, // Só permite arrastar se estiver editando
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [event.id, isEditing]
  );

  return (
    <div
      ref={isEditing ? (drag as unknown as React.LegacyRef<HTMLDivElement>) : undefined}
      className={`w-full h-14 rounded text-white text-[10px] p-1 flex flex-col justify-between shadow-md transition-all relative group ${
        event.color
      } ${isDragging ? "opacity-50 scale-95" : "opacity-100"} ${
        isEditing ? "cursor-grab hover:shadow-lg hover:scale-[1.02]" : "cursor-default"
      }`}
    >
      <div className="flex justify-between items-start">
        <span className="font-semibold truncate w-full">{event.title}</span>
        {isEditing && <GripVertical size={10} className="text-white/70" />}
      </div>
      <div className="text-[9px] opacity-90">
        {event.hour}:00 - {event.hour + event.duration}:00
      </div>
    </div>
  );
};

// Componente da Célula do Grid (Alvo do Drop)
const DroppableGridCell = ({
  dayIndex,
  hour,
  children,
  onDrop,
  isEditing,
  isDark,
}: {
  dayIndex: number;
  hour: number;
  children: React.ReactNode;
  onDrop: (item: { id: string }, dayIndex: number, hour: number) => void;
  isEditing: boolean;
  isDark: boolean;
}) => {
  const [{ isOver }, drop] = useDrop(
    () => ({
      accept: "CRONOGRAMA_CARD",
      drop: (item: { id: string }) => onDrop(item, dayIndex, hour),
      canDrop: () => isEditing, // Só aceita drop se estiver editando
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }),
    [dayIndex, hour, onDrop, isEditing]
  );

  return (
    <div
      ref={drop as unknown as React.LegacyRef<HTMLDivElement>}
      className={`border-r p-1 flex items-center justify-center relative transition-all duration-300 min-h-[60px] ${
        isDark ? "border-gray-700" : "border-gray-200"
      } ${
        isEditing && isOver
          ? isDark 
            ? "bg-blue-900/30 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.5)]" 
            : "bg-blue-50 shadow-[inset_0_0_0_2px_rgba(59,130,246,0.3)]"
          : ""
      }`}
    >
      {/* Indicador visual de slot disponível quando arrastando */}
      {isEditing && !children && (
        <div className={`absolute inset-1 rounded border border-dashed border-gray-300/30 pointer-events-none opacity-0 group-hover:opacity-100`} />
      )}
      {children}
    </div>
  );
};

export function CronogramaMockup({ isDark }: CronogramaMockupProps) {
  // Estados
  const [isEditing, setIsEditing] = useState(false);
  const [events, setEvents] = useState<StudyEvent[]>(INITIAL_EVENTS);
  const [preEditEvents, setPreEditEvents] = useState<StudyEvent[]>([]);

  // Configurações do Grid
  const hours = [17, 18, 19, 20, 21];
  const days = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  // Funções de Ação
  const handleEnterEdit = () => {
    setPreEditEvents([...events]); // Backup para cancelar
    setIsEditing(true);
  };

  const handleSave = () => {
    // Aqui você faria a chamada para a API para salvar
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEvents(preEditEvents); // Restaura backup
    setIsEditing(false);
  };

  const moveEvent = useCallback(
    (item: { id: string }, targetDay: number, targetHour: number) => {
      setEvents((prevEvents) => {
        return prevEvents.map((ev) => {
          if (ev.id === item.id) {
            return { ...ev, dayIndex: targetDay, hour: targetHour };
          }
          return ev;
        });
      });
    },
    []
  );

  return (
    // ALTERAÇÃO 3: Envolvendo o conteúdo principal com DndProvider
    <DndProvider backend={HTML5Backend}>
      <div
        className={`rounded-xl h-full flex flex-col overflow-hidden transition-colors duration-300 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* Header com Botões de Ação */}
        <div
          className={`border-b px-4 py-3 flex-shrink-0 transition-colors duration-300 ${
            isDark
              ? "bg-gradient-to-r from-indigo-900/50 to-blue-900/50 border-gray-700"
              : "bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3
                className={`font-bold text-sm transition-colors duration-300 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Cronograma de Estudos
              </h3>
              <p
                className={`text-xs transition-colors duration-300 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {isEditing ? "Modo de edição ativado" : "Semana de 17 a 23 de janeiro"}
              </p>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    className={`hidden sm:flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold shadow-sm hover:shadow-md ${
                      isDark
                        ? "border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Sugerir
                  </button>
                  <button
                    onClick={handleEnterEdit}
                    className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all text-xs font-semibold shadow-md hover:shadow-lg"
                  >
                    <Edit3 size={14} />
                    Editar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className={`cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold shadow-sm ${
                      isDark
                        ? "border-red-800 bg-red-900/30 text-red-300 hover:bg-red-900/50"
                        : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                    }`}
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-all text-xs font-semibold shadow-md"
                  >
                    <Check size={14} />
                    Salvar
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className={`flex-1 overflow-auto relative ${isEditing ? "select-none" : ""}`}>
          {/* Overlay informativo na edição */}
          {isEditing && (
            <div className={`absolute top-0 left-0 w-full h-1 z-20 bg-blue-500 animate-pulse`} />
          )}

          {/* Days Header */}
          <div
            className={`grid grid-cols-8 border-b sticky top-0 z-10 transition-colors duration-300 ${
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`p-2 text-center text-xs font-semibold border-r transition-colors duration-300 ${
                isDark ? "text-gray-400 border-gray-700" : "text-gray-600 border-gray-200"
              }`}
            >
              HORA
            </div>
            {days.map((day, idx) => (
              <div
                key={day}
                className={`p-2 text-center text-xs font-bold border-r transition-colors duration-300 ${
                  idx === 1 // Exemplo de destaque para Segunda-feira
                    ? isDark
                      ? "bg-blue-900/40 text-blue-400 border-gray-700"
                      : "bg-blue-100 text-blue-700 border-gray-200"
                    : isDark
                    ? "text-gray-400 border-gray-700"
                    : "text-gray-600 border-gray-200"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div
            className={`divide-y transition-colors duration-300 ${
              isDark ? "divide-gray-700" : "divide-gray-200"
            }`}
          >
            {hours.map((hour) => (
              <div
                key={hour}
                className={`grid grid-cols-8 transition-colors duration-300 ${
                  isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                }`}
              >
                {/* Coluna da Hora */}
                <div
                  className={`p-2 text-center text-xs font-mono border-r flex items-center justify-center transition-colors duration-300 ${
                    isDark
                      ? "text-gray-400 border-gray-700 bg-gray-800/50"
                      : "text-gray-500 border-gray-200 bg-gray-50"
                  }`}
                >
                  {hour}:00
                </div>

                {/* Colunas dos Dias */}
                {days.map((_, dayIndex) => {
                  // Filtra eventos para esta célula específica
                  const cellEvents = events.filter(
                    (ev) => ev.dayIndex === dayIndex && ev.hour === hour
                  );

                  return (
                    <DroppableGridCell
                      key={`${dayIndex}-${hour}`}
                      dayIndex={dayIndex}
                      hour={hour}
                      onDrop={moveEvent}
                      isEditing={isEditing}
                      isDark={isDark}
                    >
                      {cellEvents.map((event) => (
                        <DraggableEventCard
                          key={event.id}
                          event={event}
                          isEditing={isEditing}
                          isDark={isDark}
                        />
                      ))}
                    </DroppableGridCell>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DndProvider>
  );
}