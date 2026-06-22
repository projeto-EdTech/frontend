"use client";

import { useState, useEffect } from "react";
import { X, Plus, ChevronLeft, Search, CheckCircle2, BookmarkPlus, Loader2, ListVideo } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/core/utils";

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: any; // Aceita a questão base
}

export function AddToPlaylistModal({ isOpen, onClose, question }: AddToPlaylistModalProps) {
  const [view, setView] = useState<"list" | "create">("list");
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state para criação rápida
  const [title, setTitle] = useState("");
  const { data: session } = useSession();

  useEffect(() => {
    if (isOpen) {
      setView("list");
      setSuccess(false);
      setSearch("");
      setTitle("");
      fetchPlaylists();
    }
  }, [isOpen]);

  const fetchPlaylists = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/playlist");
      if (res.ok) {
        const data = await res.json();
        setPlaylists(data);
      }
    } catch (e) {
      console.error("Erro ao buscar playlists", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToExisting = async (playlistId: string) => {
    if (!question || isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/playlist/${playlistId}/add-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      }
    } catch (e) {
      console.error("Erro ao salvar", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !title.trim() || isSaving) return;
    setIsSaving(true);
    try {
      // 1. Cria a playlist minimalista rapidamente
      const createRes = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: title.trim(), 
          creatorName: session?.user?.name || "Usuário",
          category: question.materia?.[0] || "Geral", // deduce category based on question automatically
          tags: ["salvos"],
          isPublic: false
        }),
      });

      if (createRes.ok) {
        const newPlaylist = await createRes.json();
        // 2. Imediatamente vincula a questão
        await fetch(`/api/playlist/${newPlaylist.id}/add-question`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });
        setSuccess(true);
        setTimeout(() => onClose(), 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const currentUser = session?.user?.name || "Usuário";
  const filteredPlaylists = playlists.filter(p => 
    p.creatorName === currentUser &&
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSaving ? onClose : undefined}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden pointer-events-auto border border-white/50 flex flex-col relative"
            >
              {success ? (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900">Salvo!</h3>
                  <p className="text-gray-500 font-medium text-sm mt-2">Questão adicionada na playlist.</p>
                </div>
              ) : view === "list" ? (
                <>
                  <div className="p-5 pb-3 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <BookmarkPlus className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-gray-900">Salvar na Playlist</h3>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-5">
                    <div className="relative mb-4">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text"
                        placeholder="Buscar playlist..."
                        className="w-full bg-black/[0.03] border border-transparent rounded-[1rem] pl-9 pr-4 py-2.5 text-sm focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    <div className="max-h-60 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                        </div>
                      ) : filteredPlaylists.length > 0 ? (
                        filteredPlaylists.map((playlist) => (
                          <button
                            key={playlist.id}
                            onClick={() => handleSaveToExisting(playlist.id)}
                            disabled={isSaving}
                            className="w-full flex items-center justify-between p-3 rounded-[1rem] hover:bg-gray-100 transition-colors text-left group cursor-pointer disabled:opacity-50"
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm truncate">{playlist.title}</p>
                                <p className="text-xs text-gray-500 font-medium">{playlist.questions?.length || playlist.questionCount || 0} questões</p>
                              </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                               {isSaving ? <Loader2 className="w-4 h-4 text-blue-500 animate-spin" /> : <Plus className="w-4 h-4 text-gray-500" />}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500 text-sm font-medium">
                          Nenhuma playlist encontrada.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={() => setView("create")}
                      className="w-full py-3 rounded-[1.25rem] flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Criar Nova Playlist
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-5 pb-3 border-b border-gray-100 flex items-center gap-3">
                    <button onClick={() => setView("list")} className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 -ml-2 cursor-pointer">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-bold text-gray-900">Nova Playlist</h3>
                  </div>

                  <form onSubmit={handleCreateAndSave} className="p-5 flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 ml-1 mb-1.5 block">Nome da Playlist</label>
                      <input 
                        type="text"
                        autoFocus
                        required
                        placeholder="Ex: Favoritas Geometria..."
                        className="w-full bg-black/[0.03] border border-transparent rounded-[1rem] px-4 py-3 text-sm focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={isSaving || !title.trim()}
                      className="w-full mt-2 py-3 rounded-[1.25rem] flex items-center justify-center gap-2 text-sm font-bold text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar e Salvar"}
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
