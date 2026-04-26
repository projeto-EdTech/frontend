"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Play, 
  Heart, 
  MoreHorizontal, 
  Clock, 
  ArrowLeft,
  Download,
  ListFilter,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { type Playlist } from "@/lib/Playlist_data";

interface PlaylistDetailProps {
  playlist: Playlist;
}

export function PlaylistDetail({ playlist }: PlaylistDetailProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [sortConfigs, setSortConfigs] = useState<Array<{ key: string; direction: 'asc' | 'desc' }>>([]);
  const [showPlaylistTitle, setShowPlaylistTitle] = useState(false);

  const handlePlayPlaylist = async () => {
    try {
      setIsPlaying(true);
      const res = await fetch(`/api/playlist/${playlist.id}/play`, { 
        method: "POST" 
      });

      const data = await res.json();

      if (res.ok && data.id) {
        // Redireciona o usuário para a página de realizar o simulado usando as questões dessa playlist
        // Pega a primeira instituição da playlist que parece válida, ou um default se não existir
        const university = playlist.questions?.[0]?.institution || "enem";
        router.push(`/simulation/${university}?simId=${data.id}`);
      } else {
        alert(data.error || "Houve um problema ao iniciar a playlist.");
      }
    } catch (err) {
      console.error(err);
      alert("Houve um erro interno ao tentar iniciar o simulado.");
    } finally {
      setIsPlaying(false);
    }
  };

  // Detectar quando o título sai da tela durante scroll
  useEffect(() => {
    const handleScroll = () => {
      // A Hero Section tem pt-24, então aproximadamente 96px (pt-24 = 6rem = 96px)
      // Quando o scroll é maior que isso, o título saiu de vista
      const scrollPosition = window.scrollY;
      setShowPlaylistTitle(scrollPosition > 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Função para ordenar questões com múltiplos filtros
  const getSortedQuestions = () => {
    if (!playlist.questions || sortConfigs.length === 0) {
      return playlist.questions || [];
    }

    const sortedQuestions = [...playlist.questions].sort((a, b) => {
      for (const sortConfig of sortConfigs) {
        let aValue: string | number = '';
        let bValue: string | number = '';

        switch (sortConfig.key) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'subject':
            aValue = a.subject.toLowerCase();
            bValue = b.subject.toLowerCase();
            break;
          case 'topic':
            aValue = a.topic.toLowerCase();
            bValue = b.topic.toLowerCase();
            break;
          case 'institution':
            aValue = a.institution.toLowerCase();
            bValue = b.institution.toLowerCase();
            break;
          case 'difficulty':
            const difficultyOrder = { 'Fácil': 1, 'Médio': 2, 'Difícil': 3 };
            aValue = difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0;
            bValue = difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0;
            break;
          case 'year':
            aValue = a.year;
            bValue = b.year;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
      }
      return 0;
    });

    return sortedQuestions;
  };

  // Função para lidar com o clique nas colunas com 3 estados
  const handleColumnClick = (columnKey: string) => {
    setSortConfigs(prev => {
      const existingIndex = prev.findIndex(config => config.key === columnKey);
      
      if (existingIndex === -1) {
        // Adicionar novo filtro em ordem crescente
        return [...prev, { key: columnKey, direction: 'asc' }];
      } else {
        const existingConfig = prev[existingIndex];
        
        if (existingConfig.direction === 'asc') {
          // Alterar para ordem decrescente
          return prev.map((config, index) =>
            index === existingIndex ? { ...config, direction: 'desc' } : config
          );
        } else {
          // Remover filtro (estado desligado)
          return prev.filter((_, index) => index !== existingIndex);
        }
      }
    });
  };

  // Função para obter o estado do filtro
  const getFilterState = (columnKey: string): 'off' | 'asc' | 'desc' => {
    const config = sortConfigs.find(c => c.key === columnKey);
    if (!config) return 'off';
    return config.direction;
  };

  // Função para obter o índice do filtro (ordem)
  const getFilterIndex = (columnKey: string): number | null => {
    const index = sortConfigs.findIndex(c => c.key === columnKey);
    return index === -1 ? null : index + 1;
  };

  return (
    <div className={cn(
      "min-h-screen selection:bg-green-500/30",
      theme === 'dark' 
        ? "bg-[#121212] text-white" 
        : "bg-white text-gray-900"
    )}>

      {/* Hero Section */}
      <div className={cn(
        "relative pt-24 pb-12 px-6 md:px-10 flex flex-col md:flex-row items-end gap-8",
        `bg-gradient-to-b ${playlist.coverGradient || playlist.gradient} to-${theme === 'dark' ? '[#121212]' : '[#ffffff]'}`
      )}>
        {/* Cover Art */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-52 h-52 md:w-64 md:h-64 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] shrink-0 group"
        >
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br rounded-lg flex items-center justify-center border border-white/10",
            playlist.gradient
          )}>
            <span className="text-6xl">
              {playlist.category === "Matemática" && "📐"}
              {playlist.category === "Redação" && "✍️"}
              {playlist.category === "Química" && "⚗️"}
              {playlist.category === "História" && "🌍"}
              {playlist.category === "Inglês" && "🗣️"}
              {playlist.category === "Física" && "⚛️"}
            </span> 
          </div>
          {/* Hover shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg pointer-events-none" />
        </motion.div>

        {/* Playlist Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-2 w-full"
        >
          <span className={cn(
            "text-xs uppercase font-bold tracking-wider",
            theme === 'dark' ? "text-white/80" : "text-gray-600"
          )}>Public Playlist</span>
          <h1 className={cn(
            "text-4xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-2 leading-none",
            theme === 'dark' ? "text-white" : "text-gray-800"
          )}>
            {playlist.title}
          </h1>
          <p className={cn(
            "text-sm md:text-base font-medium max-w-2xl",
            theme === 'dark' ? "text-white/70" : "text-gray-700"
          )}>
            {playlist.description}
          </p>
          
          <div className={cn(
            "flex items-center gap-2 mt-2 text-sm font-medium",
            theme === 'dark' ? "text-white" : "text-gray-700"
          )}>
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs",
              theme === 'dark' ? "bg-indigo-500 text-white" : "bg-indigo-600 text-white"
            )}>
              {playlist.creatorName.charAt(0)}
            </div>
            <span className={cn(
              "hover:underline cursor-pointer",
              theme === 'dark' ? "" : ""
            )}>
              {playlist.creatorName}
            </span>
            <span className={cn(
              "w-1 h-1 rounded-full",
              theme === 'dark' ? "bg-white/50" : "bg-gray-400"
            )} />
            <span>{playlist.likesCount} likes</span>
            <span className={cn(
              "w-1 h-1 rounded-full",
              theme === 'dark' ? "bg-white/50" : "bg-gray-400"
            )} />
            <span>{playlist.questionCount} questões</span>
            <span className={cn(
              "w-1 h-1 rounded-full",
              theme === 'dark' ? "bg-white/50" : "bg-gray-400"
            )} />
            <span className={theme === 'dark' ? "text-white/70" : "text-gray-600"}>
              {playlist.duration}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Content Section */}
      <div className={cn(
        "relative min-h-[50vh] bg-gradient-to-b",
        theme === 'dark'
          ? "bg-[#121212] from-black/20 to-[#121212]"
          : "bg-gray-50 from-gray-100 to-gray-50"
      )}>
        {/* Action Bar */}
        <div className={cn(
          "sticky top-16 z-40 px-6 md:px-10 py-6 backdrop-blur-xl border-b flex items-center justify-between cursor-pointer",
          theme === 'dark'
            ? "bg-[#121212]/95 border-white/5"
            : "bg-white/95 border-gray-200"
        )}>
          <div className="flex items-center gap-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePlayPlaylist}
              className="w-14 h-14 bg-green-500 hover:bg-green-400 rounded-full flex items-center justify-center shadow-lg transition-colors group cursor-pointer"
              disabled={isPlaying}
            >
              {isPlaying ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent animate-spin rounded-full" />
              ) : (
                <Play className="w-6 h-6 fill-black text-black ml-1" />
              )}
            </motion.button>
            
            {/* Playlist Title - Aparece quando scrollado */}
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ 
                opacity: showPlaylistTitle ? 1 : 0, 
                width: showPlaylistTitle ? 'auto' : 0 
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <span className={cn(
                "text-sm md:text-base font-bold whitespace-nowrap",
                theme === 'dark' ? "text-white" : "text-gray-900"
              )}>
                {playlist.title}
              </span>
            </motion.div>
            
            <button className={cn(
              "transition-colors cursor-pointer",
              theme === 'dark'
                ? "text-white/70 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            )}>
              <Heart className="w-8 h-8" />
            </button>
            <button className={cn(
              "transition-colors cursor-pointer",
              theme === 'dark'
                ? "text-white/70 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            )}>
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          <div className={cn(
            "flex items-center gap-4",
            theme === 'dark' ? "text-white/60" : "text-gray-600"
          )}>
            <div className={cn(
              "hidden md:flex items-center gap-2 cursor-pointer group transition-colors",
              theme === 'dark' ? "hover:text-white" : "hover:text-gray-900"
            )}>
              <span className="text-sm font-semibold">List</span>
              <ListFilter className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className={cn(
          "px-6 md:px-10 pt-4 pb-2 text-sm border-b grid grid-cols-[16px_3fr_1fr_1fr_1fr_1fr_1fr_minmax(60px,1fr)] gap-4 items-center sticky top-[136px] z-30 font-medium",
          theme === 'dark'
            ? "text-white/50 bg-[#121212] border-white/10"
            : "text-gray-600 bg-gray-50 border-gray-200"
        )}>
          <span className="text-center">#</span>
          <button 
            onClick={() => handleColumnClick('title')}
            className={cn(
              "text-left hover:text-white transition-colors cursor-pointer flex items-center gap-2 group",
              getFilterState('title') !== 'off' && "text-green-400",
              theme === 'light' && "hover:text-gray-900"
            )}
          >
            Título
            {getFilterState('title') !== 'off' && (
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-70">
                  {getFilterState('title') === 'asc' ? '↑' : '↓'}
                </span>
                {getFilterIndex('title') !== null && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    theme === 'dark'
                      ? "bg-green-500/30 text-green-300"
                      : "bg-green-100 text-green-700"
                  )}>
                    {getFilterIndex('title')}
                  </span>
                )}
              </div>
            )}
          </button>
          <button 
            onClick={() => handleColumnClick('subject')}
            className={cn(
              "hidden md:flex text-left hover:text-white transition-colors cursor-pointer items-center gap-2",
              getFilterState('subject') !== 'off' && "text-green-400",
              theme === 'light' && "hover:text-gray-900"
            )}
          >
            Matéria
            {getFilterState('subject') !== 'off' && (
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-70">
                  {getFilterState('subject') === 'asc' ? '↑' : '↓'}
                </span>
                {getFilterIndex('subject') !== null && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    theme === 'dark'
                      ? "bg-green-500/30 text-green-300"
                      : "bg-green-100 text-green-700"
                  )}>
                    {getFilterIndex('subject')}
                  </span>
                )}
              </div>
            )}
          </button>
          <button 
            onClick={() => handleColumnClick('topic')}
            className={cn(
              "hidden lg:flex text-left hover:text-white transition-colors cursor-pointer items-center gap-2",
              getFilterState('topic') !== 'off' && "text-green-400",
              theme === 'light' && "hover:text-gray-900"
            )}
          >
            Conteúdo
            {getFilterState('topic') !== 'off' && (
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-70">
                  {getFilterState('topic') === 'asc' ? '↑' : '↓'}
                </span>
                {getFilterIndex('topic') !== null && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    theme === 'dark'
                      ? "bg-green-500/30 text-green-300"
                      : "bg-green-100 text-green-700"
                  )}>
                    {getFilterIndex('topic')}
                  </span>
                )}
              </div>
            )}
          </button>
          <button 
            onClick={() => handleColumnClick('difficulty')}
            className={cn(
              "hidden md:flex text-left hover:text-white transition-colors cursor-pointer items-center gap-2",
              getFilterState('difficulty') !== 'off' && "text-green-400",
              theme === 'light' && "hover:text-gray-900"
            )}
          >
            Dificuldade
            {getFilterState('difficulty') !== 'off' && (
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-70">
                  {getFilterState('difficulty') === 'asc' ? '↑' : '↓'}
                </span>
                {getFilterIndex('difficulty') !== null && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    theme === 'dark'
                      ? "bg-green-500/30 text-green-300"
                      : "bg-green-100 text-green-700"
                  )}>
                    {getFilterIndex('difficulty')}
                  </span>
                )}
              </div>
            )}
          </button>
          <button 
            onClick={() => handleColumnClick('institution')}
            className={cn(
              "hidden lg:flex text-left hover:text-white transition-colors cursor-pointer items-center gap-2",
              getFilterState('institution') !== 'off' && "text-green-400",
              theme === 'light' && "hover:text-gray-900"
            )}
          >
            Instituição
            {getFilterState('institution') !== 'off' && (
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-70">
                  {getFilterState('institution') === 'asc' ? '↑' : '↓'}
                </span>
                {getFilterIndex('institution') !== null && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    theme === 'dark'
                      ? "bg-green-500/30 text-green-300"
                      : "bg-green-100 text-green-700"
                  )}>
                    {getFilterIndex('institution')}
                  </span>
                )}
              </div>
            )}
          </button>
          <button 
            onClick={() => handleColumnClick('year')}
            className={cn(
              "hidden lg:flex text-left hover:text-white transition-colors cursor-pointer items-center gap-2",
              getFilterState('year') !== 'off' && "text-green-400",
              theme === 'light' && "hover:text-gray-900"
            )}
          >
            Ano
            {getFilterState('year') !== 'off' && (
              <div className="flex items-center gap-1">
                <span className="text-xs opacity-70">
                  {getFilterState('year') === 'asc' ? '↑' : '↓'}
                </span>
                {getFilterIndex('year') !== null && (
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    theme === 'dark'
                      ? "bg-green-500/30 text-green-300"
                      : "bg-green-100 text-green-700"
                  )}>
                    {getFilterIndex('year')}
                  </span>
                )}
              </div>
            )}
          </button>
          <div className={cn(
            "flex justify-end pr-4",
            theme === 'dark' ? "text-white/50" : "text-gray-600"
          )}>
            <Clock className="w-4 h-4" />
          </div>
        </div>

        {/* Tracks (Questions) List */}
        <div className="px-6 md:px-10 pb-20 mt-4 space-y-2">
          {getSortedQuestions().length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col items-center justify-center py-20 text-center rounded-2xl border border-dashed",
                theme === 'dark' 
                  ? "bg-white/5 border-white/20" 
                  : "bg-gray-50 border-gray-300"
              )}
            >
              <div className={cn(
                "w-20 h-20 mb-6 rounded-full flex items-center justify-center",
                theme === 'dark' ? "bg-white/10 text-white/50" : "bg-gray-200 text-gray-500"
              )}>
                <BookOpen className="w-10 h-10" />
              </div>
              <h3 className={cn(
                "text-2xl font-bold mb-3",
                theme === 'dark' ? "text-white" : "text-gray-900"
              )}>
                Playlist Vazia
              </h3>
              <p className={cn(
                "max-w-sm mb-8",
                theme === 'dark' ? "text-white/60" : "text-gray-600"
              )}>
                Você ainda não adicionou nenhuma questão a esta playlist. Explore as bibliotecas e comece a praticar!
              </p>
              <button 
                onClick={() => router.push('/library')}
                className={cn(
                  "px-8 py-3.5 rounded-full font-bold shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2",
                  theme === 'dark'
                    ? "bg-white text-black hover:bg-gray-200"
                    : "bg-black text-white hover:bg-gray-800"
                )}
              >
                Adicionar Questões <span>→</span>
              </button>
            </motion.div>
          ) : (
            getSortedQuestions().map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  "group grid grid-cols-[16px_3fr_1fr_1fr_1fr_1fr_1fr_minmax(60px,1fr)] gap-4 items-center p-3 rounded-lg transition-colors cursor-pointer border",
                  theme === 'dark'
                    ? "hover:bg-white/10 border-transparent hover:border-white/5"
                    : "hover:bg-gray-100 border-transparent hover:border-gray-300"
                )}
              >
                <div className={cn(
                  "text-sm text-center font-medium relative",
                  theme === 'dark'
                    ? "text-white/50 group-hover:text-white"
                    : "text-gray-600 group-hover:text-gray-900"
                )}>
                  <span className="group-hover:hidden">{index + 1}</span>
                  <Play className="w-3 h-3 fill-current text-current absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100" />
                </div>
                
                <div className="flex flex-col">
                  <span className={cn(
                    "font-medium text-base truncate pr-4",
                    question.completed && "text-green-500",
                    !question.completed && (theme === 'dark' ? "text-white" : "text-gray-900")
                  )}>
                    {question.title}
                  </span>
                  <span className={cn(
                    "text-xs md:hidden",
                    theme === 'dark' ? "text-white/50" : "text-gray-600"
                  )}>
                    {question.subject} • {question.topic} • {question.difficulty} • {question.institution} {question.year}
                  </span>
                </div>
                
                <div className={cn(
                  "hidden md:flex items-center text-sm transition-colors",
                  theme === 'dark'
                    ? "text-white/50 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                )}>
                  {question.subject}
                </div>

                <div className={cn(
                  "hidden lg:flex items-center text-sm",
                  theme === 'dark' ? "text-white/50" : "text-gray-600"
                )}>
                  <span className={cn(
                    "px-2 py-1 rounded-md text-xs font-medium truncate",
                    theme === 'dark'
                      ? "bg-white/5 border border-white/10"
                      : "bg-gray-200 border border-gray-300"
                  )}>
                    {question.topic}
                  </span>
                </div>

                <div className="hidden md:flex items-center">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-bold border",
                    question.difficulty === "Fácil" && (theme === 'dark'
                      ? "border-green-500/30 text-green-400 bg-green-500/10"
                      : "border-green-300 text-green-700 bg-green-100"
                    ),
                    question.difficulty === "Médio" && (theme === 'dark'
                      ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
                      : "border-yellow-300 text-yellow-700 bg-yellow-100"
                    ),
                    question.difficulty === "Difícil" && (theme === 'dark'
                      ? "border-red-500/30 text-red-400 bg-red-500/10"
                      : "border-red-300 text-red-700 bg-red-100"
                    ),
                  )}>
                    {question.difficulty}
                  </span>
                </div>

                <div className="hidden lg:flex items-center">
                  <span className={cn(
                    "px-2 py-1 rounded-md text-xs font-semibold truncate",
                    theme === 'dark'
                      ? "bg-blue-500/10 border border-blue-500/30 text-blue-400"
                      : "bg-blue-100 border border-blue-300 text-blue-700"
                  )}>
                    {question.institution}
                  </span>
                </div>

                <div className={cn(
                  "hidden lg:flex items-center text-sm font-medium",
                  theme === 'dark' ? "text-white/50" : "text-gray-600"
                )}>
                  {question.year}
                </div>
                
                <div className={cn(
                  "flex items-center justify-end pr-4 text-sm font-medium",
                  theme === 'dark' ? "text-white/50" : "text-gray-600"
                )}>
                  {question.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                  ) : null}
                  {question.duration}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


export function PlaylistDetailError({ error, onBack }: { error: string; onBack: () => void }) {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center",
      theme === 'dark' ? "bg-[#121212] text-white" : "bg-white text-gray-900"
    )}>
      <div className="text-center">
        <h2 className={cn(
          "text-2xl font-bold mb-2",
          theme === 'dark' ? "text-white" : "text-gray-900"
        )}>
          Ops! Algo deu errado
        </h2>
        <p className={cn(
          "mb-4",
          theme === 'dark' ? "text-white/70" : "text-gray-600"
        )}>
          {error}
        </p>
        <button 
          onClick={onBack}
          className={cn(
            "px-6 py-3 rounded-full font-semibold transition-colors cursor-pointer",
            theme === 'dark'
              ? "bg-green-500 hover:bg-green-400 text-black"
              : "bg-green-600 hover:bg-green-700 text-white"
          )}
        >
          Voltar
        </button>
      </div>
    </div>
  );
}
