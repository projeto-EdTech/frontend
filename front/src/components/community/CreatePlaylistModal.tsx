"use client";

import { useState } from "react";
import { X, Lock, Globe, Sparkles, Plus, ListChecks, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTags?: string[];
  existingCategories?: string[];
}

export function CreatePlaylistModal({ isOpen, onClose, existingTags = [], existingCategories = [] }: CreatePlaylistModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Filtra as tags existentes baseado no input
  const filteredTags = tagInput.trim() 
    ? existingTags.filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) && 
        !selectedTags.includes(tag)
      )
    : existingTags.filter(tag => !selectedTags.includes(tag)); // Se vazio, mostra todas as disponíveis como um <select>

  const handleAddTag = (tagToAdd: string) => {
    const finalTag = tagToAdd.trim().replace(/^,+|,+$/g, ""); // remove virgulas no inicio e fim
    if (finalTag && !selectedTags.includes(finalTag)) {
      setSelectedTags([...selectedTags, finalTag]);
    }
    setTagInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Adiciona a tag ao apertar Enter ou Vírgula
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tagToRemove));
  };

  const allCategories = existingCategories.includes("Geral") ? existingCategories : [...existingCategories, "Geral"];
  const filteredCategories = category.trim() 
    ? allCategories.filter(cat => cat.toLowerCase().includes(category.toLowerCase()))
    : allCategories;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          title, 
          description, 
          category: category || "Geral",
          isPublic, 
          tags: selectedTags.length > 0 ? selectedTags : ["Nova"],
          creatorName: session?.user?.name || "Usuário" 
        }),
      });

      if (response.ok) {
        const newPlaylist = await response.json();
        // Redireciona para a página da playlist recém-criada no diretório /blog/playlist
        router.push(`/blog/playlist/${newPlaylist.id}`);
        onClose();
      } else {
        console.error("Erro ao criar playlist");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay fundo borrado style Apple */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Modal Centralizado */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden pointer-events-auto border border-white/50"
            >
              <div className="relative">
                {/* Header Clean/Minimalista */}
                <div className="pt-8 px-8 pb-4 flex flex-col items-center text-center relative">
                  <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-gray-100/80 hover:bg-gray-200 text-gray-500 rounded-full transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div className="w-16 h-16 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-[1.25rem] flex items-center justify-center mb-4 shadow-sm border border-white">
                    <ListChecks className="w-8 h-8 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Nova Playlist</h2>
                  <p className="text-gray-500 text-sm mt-1 font-medium">Crie sua curadoria de estudos</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-500 ml-1">Título</label>
                    <input
                      required
                      type="text"
                      placeholder="Ex: Matemática Master"
                      className="w-full bg-black/[0.03] border border-transparent rounded-[1.25rem] px-5 py-3.5 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-500 ml-1">Descrição</label>
                    <textarea
                      placeholder="Sobre o que é essa playlist?"
                      rows={3}
                      className="w-full bg-black/[0.03] border border-transparent rounded-[1.25rem] px-5 py-3.5 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 font-medium resize-none placeholder:text-gray-400"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[13px] font-semibold text-gray-500 ml-1">Categoria</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Selecione ou digite para criar..."
                        className="w-full bg-black/[0.03] border border-transparent rounded-[1.25rem] px-5 py-3.5 pr-10 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        onFocus={() => setIsCategoryDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsCategoryDropdownOpen(false), 200)}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown className="w-5 h-5 pointer-events-none" />
                      </div>
                      
                      {isCategoryDropdownOpen && (filteredCategories.length > 0 || category.trim()) && (
                        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-48 overflow-y-auto">
                          {filteredCategories.map(cat => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => {
                                setCategory(cat);
                                setIsCategoryDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer font-medium"
                            >
                              {cat}
                            </button>
                          ))}
                          {category.trim() && !filteredCategories.find(c => c.toLowerCase() === category.trim().toLowerCase()) && (
                            <button
                              type="button"
                              onClick={() => {
                                setCategory(category.trim());
                                setIsCategoryDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-indigo-700 hover:bg-indigo-50 font-semibold border-t border-gray-50 cursor-pointer"
                            >
                              + Criar categoria "{category.trim()}"
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-gray-500 ml-1">Tags</label>
                    
                    {/* Input das tags com dropdown de autocomplete simulando Selector */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Selecione ou digite para criar..."
                        className="w-full bg-black/[0.03] border border-transparent rounded-[1.25rem] px-5 py-3.5 pr-10 focus:bg-white focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/10 focus:outline-none transition-all text-gray-900 font-medium placeholder:text-gray-400"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                        <ChevronDown className="w-5 h-5 pointer-events-none" />
                      </div>
                      
                      {/* Autocomplete Dropdown Comportando como um Selector */}
                      {isDropdownOpen && (filteredTags.length > 0 || tagInput.trim()) && (
                        <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden max-h-48 overflow-y-auto">
                          {filteredTags.map(tag => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleAddTag(tag)}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition cursor-pointer font-medium"
                            >
                              {tag}
                            </button>
                          ))}
                          {tagInput.trim() && !filteredTags.includes(tagInput.trim()) && (
                            <button
                              type="button"
                              onClick={() => {
                                handleAddTag(tagInput);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-indigo-700 hover:bg-indigo-50 font-semibold border-t border-gray-50 cursor-pointer"
                            >
                              + Criar tag "{tagInput.trim()}"
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Exibição das Tags Selecionadas */}
                    {selectedTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 p-1">
                        <AnimatePresence>
                          {selectedTags.map(tag => (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              key={tag}
                              className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-bold border border-indigo-100"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-indigo-200 transition-colors text-indigo-600 cursor-pointer"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </motion.span>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/[0.02] rounded-[1.25rem]">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors bg-white shadow-sm border border-gray-100`}>
                        {isPublic ? <Globe className="w-4 h-4 text-blue-500" /> : <Lock className="w-4 h-4 text-gray-500" />}
                      </div>
                      <div>
                        <span className="block font-semibold text-gray-800 text-sm">{isPublic ? 'Pública' : 'Privada'}</span>
                        <span className="text-[11px] text-gray-500 font-medium">{isPublic ? 'Visível para todos' : 'Apenas para você'}</span>
                      </div>
                    </div>
                    {/* Toggle Switch estilo iOS */}
                    <button
                      type="button"
                      onClick={() => setIsPublic(!isPublic)}
                      className={`relative inline-flex h-[28px] w-[50px] items-center rounded-full transition-colors duration-300 focus:outline-none cursor-pointer ${isPublic ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <span
                        className={`${isPublic ? 'translate-x-[24px]' : 'translate-x-0.5'} inline-block h-[24px] w-[24px] transform rounded-full bg-white shadow-sm transition-transform duration-300`}
                      />
                    </button>
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-3.5 px-6 rounded-[1.25rem] font-semibold text-gray-600 bg-black/[0.03] hover:bg-black/[0.06] transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gray-900 hover:bg-black text-white font-semibold py-3.5 px-6 rounded-[1.25rem] shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <span>Criar</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
