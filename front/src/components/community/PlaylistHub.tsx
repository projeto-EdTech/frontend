"use client";

import { useMemo, useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { PlaylistCard, PlaylistCardSkeleton } from "./PlaylistCard";
import { 
  Flame, 
  Sparkles,
  Filter,
  X,
  Search,
  Calculator,
  BookOpen,
  Beaker,
  Globe,
  Languages,
  GraduationCap,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlaylistFilters } from "./PlaylistFilters";
import { type Playlist } from "@/lib/data/playlists";
import { CreatePlaylistModal } from "./CreatePlaylistModal";

interface PlaylistHubProps {
  searchQuery?: string;
}

// Mapeamento de ícones para quando os dados vêm da API
const iconMap: Record<string, React.ReactNode> = {
  "Matemática": <Calculator className="w-10 h-10 text-white/90" />,
  "Redação": <BookOpen className="w-10 h-10 text-white/90" />,
  "Química": <Beaker className="w-10 h-10 text-white/90" />,
  "História": <Globe className="w-10 h-10 text-white/90" />,
  "Inglês": <Languages className="w-10 h-10 text-white/90" />,
  "Física": <GraduationCap className="w-10 h-10 text-white/90" />,
};

export function PlaylistHub({ searchQuery = "" }: PlaylistHubProps) {
  const router = useRouter();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);

  // Filter States
  const [showFilters, setShowFilters] = useState(false);
  const [titleFilter, setTitleFilter] = useState("");
  const [creatorFilter, setCreatorFilter] = useState("");
  const [minQuestions, setMinQuestions] = useState([0]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [tagFilter, setTagFilter] = useState("");

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/playlist');
        const data = await response.json();
        
        // Reconstrói o objeto Playlist com o ícone correto
        const playlistsWithIcons = data.map((p: any) => ({
          ...p,
          icon: iconMap[p.category] || <BookOpen className="w-10 h-10 text-white/90" />
        }));
        
        setPlaylists(playlistsWithIcons);
      } catch (error) {
        console.error("Erro ao carregar playlists:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchPlaylists();
  }, []);

  const [emblaRefTrending] = useEmblaCarousel({ 
    align: "start", 
    containScroll: "trimSnaps",
    dragFree: true
  });
  
  const [emblaRefSubjects] = useEmblaCarousel({ 
    align: "start", 
    containScroll: "trimSnaps", 
    dragFree: true
  });

  const categories = useMemo(() => {
    const cats = Array.from(new Set(playlists.map(p => p.category)));
    return ["all", ...cats];
  }, [playlists]);

  const uniqueTitles = useMemo(() => Array.from(new Set(playlists.map(p => p.title))), [playlists]);
  const uniqueCreators = useMemo(() => Array.from(new Set(playlists.map(p => p.creatorName))), [playlists]);
  const uniqueTags = useMemo(() => Array.from(new Set(playlists.flatMap(p => p.tags))), [playlists]);

  const filteredPlaylists = useMemo(() => {
    if (isLoading) return [];
    
    let result = [...playlists];

    // Global Search Query (from props)
    const normalizedSearch = searchQuery?.trim().toLowerCase();
    if (normalizedSearch) {
      result = result.filter(p => 
        (p.title && p.title.toLowerCase().includes(normalizedSearch)) || 
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(normalizedSearch))) ||
        (p.creatorName && p.creatorName.toLowerCase().includes(normalizedSearch))
      );
    }

    // Specific Filters
    if (titleFilter.trim()) {
      result = result.filter(p => p.title && p.title.toLowerCase().includes(titleFilter.toLowerCase().trim()));
    }

    if (creatorFilter.trim()) {
      result = result.filter(p => p.creatorName && p.creatorName.toLowerCase().includes(creatorFilter.toLowerCase().trim()));
    }

    if (minQuestions[0] > 0) {
      result = result.filter(p => (p.questionCount || 0) >= minQuestions[0]);
    }

    if (selectedCategory && selectedCategory !== "all") {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (tagFilter.trim()) {
      result = result.filter(p => p.tags && p.tags.some(t => t.toLowerCase().includes(tagFilter.toLowerCase().trim())));
    }

    return result;
  }, [searchQuery, titleFilter, creatorFilter, minQuestions, selectedCategory, tagFilter, playlists, isLoading]);
  
  const trendingPlaylists = useMemo(() => filteredPlaylists.filter(p => p.likesCount >= 0), [filteredPlaylists]);
  const subjectPlaylists = filteredPlaylists; 

  const handleNavigation = (id: string) => {
     router.push(`/blog/playlist/${id}`);
  };
  
  const clearFilters = () => {
    setTitleFilter("");
    setCreatorFilter("");
    setMinQuestions([0]);
    setSelectedCategory("all");
    setTagFilter("");
  };

  const activeFiltersCount = [
    titleFilter, 
    creatorFilter, 
    minQuestions[0] > 0, 
    selectedCategory !== "all", 
    tagFilter
  ].filter(Boolean).length;

  return (
    <div className="py-8 space-y-8 border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-6">

        {/* Filters Header/Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="bg-indigo-50 p-2 rounded-lg">
                <Filter className="w-5 h-5 text-indigo-600" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900">Filtros Avançados</h2>
                <p className="text-xs text-gray-500 font-medium">Encontre a playlist ideal para você</p>
             </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => setIsPlaylistModalOpen(true)}
              className="gap-2 relative cursor-pointer hover:bg-gray-100/50 h-[42px] px-5 rounded-xl font-bold border-gray-200 text-gray-700 bg-white shadow-sm transition-all"
            >
              <div className="bg-transparent border border-gray-500 rounded-lg p-1 mr-1 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-gray-700" />
              </div>
              Nova Playlist
            </Button>

            <Button 
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 relative cursor-pointer hover:bg-gray-100/50 h-[42px] px-5 rounded-xl font-bold border-gray-200 text-gray-700 bg-white shadow-sm transition-all"
            >
              {showFilters ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
              {showFilters ? "Ocultar" : "Filtrar"}
              {activeFiltersCount > 0 && !showFilters && (
                <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Modal de Criação de Playlist */}
        <CreatePlaylistModal 
          isOpen={isPlaylistModalOpen} 
          onClose={() => setIsPlaylistModalOpen(false)}
          existingTags={uniqueTags}
          existingCategories={categories.filter(c => c !== "all")}
        />

        {/* Filter Section */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="relative z-50"
              style={{ overflow: "visible" }}
            >
              <PlaylistFilters 
                titleFilter={titleFilter}
                setTitleFilter={setTitleFilter}
                creatorFilter={creatorFilter}
                setCreatorFilter={setCreatorFilter}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                tagFilter={tagFilter}
                setTagFilter={setTagFilter}
                minQuestions={minQuestions}
                setMinQuestions={setMinQuestions}
                clearFilters={clearFilters}
                activeFiltersCount={activeFiltersCount}
                categories={categories}
                uniqueTitles={uniqueTitles}
                uniqueCreators={uniqueCreators}
                uniqueTags={uniqueTags}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <PlaylistCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredPlaylists.length === 0 ? (
           <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Nenhuma playlist encontrada</h3>
              <p className="text-gray-500">Tente ajustar seus filtros de busca.</p>
              <Button variant="link" onClick={clearFilters} className="text-indigo-600 mt-2 cursor-pointer">
                Limpar filtros
              </Button>
           </div>
        ) : (
          <>
            {/* Section 1: Trending */}
            {trendingPlaylists.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-orange-100 p-2 rounded-xl">
                     <Flame className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900">Playlists em Alta</h2>
                    <p className="text-gray-500 text-sm font-medium">As queridinhas da comunidade</p>
                  </div>
                </div>
                
                <div className="overflow-hidden py-3 px-1 -mx-1 -my-3" ref={emblaRefTrending}>
                  <div className="flex gap-4 md:gap-6 cursor-grab active:cursor-grabbing">
                    {trendingPlaylists.map((playlist) => (
                      <div 
                        key={playlist.id} 
                        className="flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_25%] lg:flex-[0_0_20%] min-w-0"
                      >
                        <PlaylistCard
                          title={playlist.title}
                          creatorName={playlist.creatorName}
                          questionCount={playlist.questionCount}
                          likesCount={playlist.likesCount}
                          gradient={playlist.gradient}
                          subjectIcons={playlist.icon}
                          onClick={() => handleNavigation(playlist.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Section 2: Playlists por Matéria */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-2 rounded-xl">
                    <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Playlists por Matéria</h2>
                  <p className="text-gray-500 text-sm font-medium">Listas organizadas por especialistas</p>
                </div>
              </div>

              <div className="overflow-hidden py-3 px-1 -mx-1 -my-3" ref={emblaRefSubjects}>
                <div className="flex gap-4 md:gap-6 cursor-grab active:cursor-grabbing">
                   {subjectPlaylists.map((playlist) => (
                      <div 
                        key={playlist.id} 
                        className="flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_25%] lg:flex-[0_0_20%] min-w-0"
                      >
                        <PlaylistCard
                          title={playlist.title}
                          creatorName={playlist.creatorName}
                          questionCount={playlist.questionCount}
                          likesCount={playlist.likesCount}
                          gradient={playlist.gradient}
                          subjectIcons={playlist.icon}
                          onClick={() => handleNavigation(playlist.id)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
