"use client";

import { useState, useEffect } from "react";
import { Plus, Search, MessageSquare, Trash2, Edit2, Check, X } from "lucide-react";

interface ChatHistory {
  id: string;
  title: string;
  timestamp: Date;
  preview: string;
}

interface ChatSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentChatId?: string;
  onNewChat: () => void;
  onSelectChat?: (chatId: string) => void;
}

export default function ChatSidebar({ 
  isOpen, 
  onToggle, 
  currentChatId, 
  onNewChat,
  onSelectChat 
}: ChatSidebarProps) {
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Carregar histórico do localStorage
  useEffect(() => {
    const loadHistory = () => {
      try {
        const saved = localStorage.getItem("chatHistory");
        if (saved) {
          const parsed = JSON.parse(saved) as ChatHistory[];
          setChatHistory(
            parsed.map((chat) => ({
              ...chat,
              timestamp: new Date(chat.timestamp),
            }))
          );
        }
      } catch (error) {
        console.error("Erro ao carregar histórico:", error);
      }
    };

    loadHistory();
  }, []);

  // Salvar histórico no localStorage
  const saveHistory = (history: ChatHistory[]) => {
    try {
      localStorage.setItem("chatHistory", JSON.stringify(history));
      setChatHistory(history);
    } catch (error) {
      console.error("Erro ao salvar histórico:", error);
    }
  };

  // Deletar conversa
  const handleDelete = (id: string) => {
    const updated = chatHistory.filter((chat) => chat.id !== id);
    saveHistory(updated);
  };

  // Iniciar edição
  const startEdit = (chat: ChatHistory) => {
    setEditingId(chat.id);
    setEditTitle(chat.title);
  };

  // Salvar edição
  const saveEdit = (id: string) => {
    const updated = chatHistory.map((chat) =>
      chat.id === id ? { ...chat, title: editTitle } : chat
    );
    saveHistory(updated);
    setEditingId(null);
    setEditTitle("");
  };

  // Cancelar edição
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  // Filtrar histórico por busca
  const filteredHistory = chatHistory.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Agrupar por data
  const groupedHistory = () => {
    const today: ChatHistory[] = [];
    const yesterday: ChatHistory[] = [];
    const lastWeek: ChatHistory[] = [];
    const older: ChatHistory[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const lastWeekStart = new Date(todayStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    filteredHistory.forEach((chat) => {
      if (chat.timestamp >= todayStart) {
        today.push(chat);
      } else if (chat.timestamp >= yesterdayStart) {
        yesterday.push(chat);
      } else if (chat.timestamp >= lastWeekStart) {
        lastWeek.push(chat);
      } else {
        older.push(chat);
      }
    });

    return { today, yesterday, lastWeek, older };
  };

  const { today, yesterday, lastWeek, older } = groupedHistory();

  const renderChatItem = (chat: ChatHistory) => (
    <div
      key={chat.id}
      className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
        currentChatId === chat.id
          ? "bg-white border border-blue-200/50 shadow-sm"
          : "hover:bg-gray-50/80 border border-transparent hover:shadow-sm"
      }`}
    >
      {editingId === chat.id ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 bg-white border border-blue-400 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-400/30 shadow-sm transition-all duration-200"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") saveEdit(chat.id);
              if (e.key === "Escape") cancelEdit();
            }}
          />
          <button
            onClick={() => saveEdit(chat.id)}
            className="p-2 hover:bg-green-50 rounded-lg transition-all duration-200 hover:shadow-sm"
            title="Salvar"
          >
            <Check className="w-4 h-4 text-green-600" />
          </button>
          <button
            onClick={cancelEdit}
            className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-sm"
            title="Cancelar"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </>
      ) : (
        <>
          <div className={`p-2 rounded-lg transition-all duration-300 ${
            currentChatId === chat.id 
              ? "bg-blue-100/80" 
              : "bg-gray-100/80 group-hover:bg-gray-200/80"
          }`}>
            <MessageSquare className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
              currentChatId === chat.id ? "text-blue-600" : "text-gray-500"
            }`} />
          </div>
          <button
            onClick={() => onSelectChat?.(chat.id)}
            className={`flex-1 text-left text-sm truncate font-medium transition-colors duration-300 ${
              currentChatId === chat.id ? "text-blue-700" : "text-gray-700"
            }`}
          >
            {chat.title}
          </button>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                startEdit(chat);
              }}
              className="p-2 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5 text-gray-500 hover:text-blue-600 transition-colors" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(chat.id);
              }}
              className="p-2 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Deletar"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500 hover:text-red-600 transition-colors" />
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderGroup = (title: string, chats: ChatHistory[]) => {
    if (chats.length === 0) return null;
    return (
      <div className="mb-7">
        <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
          {title}
        </h3>
        <div className="space-y-1.5">
          {chats.map(renderChatItem)}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen transition-all duration-300 ease-in-out z-50 lg:z-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isOpen ? "w-72" : "lg:w-72 w-0"} bg-white border-r border-gray-200 backdrop-blur-xl shadow-xl lg:shadow-none`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Botão Nova Conversa */}
          <div className="p-4 bg-white border-b border-gray-200 backdrop-blur-xl">
            <button
              onClick={onNewChat}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 text-white rounded-xl transition-all duration-300 shadow-lg hover:scale-[1.02] active:scale-[0.98] font-semibold text-[15px] group cursor-pointer"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              Nova Conversa
            </button>
          </div>

          {/* Campo de Busca */}
          <div className="p-4 bg-white border-b border-gray-200/50 backdrop-blur-xl">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200/50 rounded-xl text-sm text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all duration-200 shadow-sm"
              />
            </div>
          </div>

          {/* Lista de Conversas */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-5 shadow-sm">
                  <MessageSquare className="w-9 h-9 text-gray-400" />
                </div>
                <p className="text-[15px] text-gray-700 font-semibold mb-2">
                  {searchQuery ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
                </p>
                <p className="text-sm text-gray-500">
                  {searchQuery ? "Tente outro termo" : "Comece uma nova conversa"}
                </p>
              </div>
            ) : (
              <>
                {renderGroup("Hoje", today)}
                {renderGroup("Ontem", yesterday)}
                {renderGroup("Últimos 7 dias", lastWeek)}
                {renderGroup("Mais antigas", older)}
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}