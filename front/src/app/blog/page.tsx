"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { Post } from "@/types";
import {
  Search,
  BookOpen,
  TrendingUp,
  Users,
  Filter,
  Star,
  ArrowRight,
  Zap,
  Calendar,
  Clock,
  Eye,
  Award,
  Target,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ListMusic,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { useState, useMemo, useEffect, useCallback } from "react";
import { SubscribeButton } from "@/components/community/SubscribeButton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { PlaylistHub } from "@/components/community/PlaylistHub";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";

// Variantes de animação estilo Apple (suaves e precisas)
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const floatEffect = {
  animate: {
    y: [0, -15, 0],
    rotate: [0, 3, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

const pulseEffect = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale: [1, 1.05, 1],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [playlistCount, setPlaylistCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const filterCategories = [
    "Todos",
    "Mais Recentes",
    "Populares",
    "Matemática",
    "Redação",
  ];
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  // Embla Carousel setup
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    async function getPostsFromApi(): Promise<Post[]> {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      try {
        const res = await fetch(`${apiUrl}/api/blog`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Falha ao buscar os posts da API");
        }
        return res.json();
      } catch (error) {
        console.error(error);
        return [];
      }
    }

    getPostsFromApi().then((data) => {
      setPosts(data);
      setIsLoading(false);
    });
  }, []);

  // Buscar contagem de playlists
  useEffect(() => {
    async function getPlaylistCount(): Promise<number> {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      try {
        const res = await fetch(`${apiUrl}/api/playlist`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Falha ao buscar playlists");
        }
        const data = await res.json();
        // Se receber um array, retorna o comprimento; se receber um objeto com count, retorna count
        return Array.isArray(data) ? data.length : data.count || 0;
      } catch (error) {
        console.error(error);
        return 0;
      }
    }

    getPlaylistCount().then((count) => {
      setPlaylistCount(count);
    });
  }, []);

  const filteredPosts = useMemo(() => {
    let tempPosts = posts;
    if (activeFilter !== "Todos" && activeFilter !== "Mais Recentes") {
      tempPosts = tempPosts.filter((post) => post.category === activeFilter);
    }

    if (searchQuery.trim() !== "") {
      const lowercasedQuery = searchQuery.toLowerCase();
      tempPosts = tempPosts.filter((post) =>
        post.title.toLowerCase().includes(lowercasedQuery)
      );
    }

    return tempPosts;
  }, [activeFilter, posts, searchQuery]);

  const featuredPost = filteredPosts.length > 0 ? filteredPosts[0] : null;
  const regularPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : [];

  const handleNavigation = (
    e: React.MouseEvent<HTMLElement>,
    href: string
  ) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(href);
  };

  if (isNavigating) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden">
        {/* Hero Section Premium com Background Dinâmico */}
        <div className="relative py-20 md:py-32 overflow-hidden backdrop-blur-xl">
          {/* Background com mesh gradient animado */}
          <div className="absolute inset-0 bg-white"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/10"></div>

          {/* Elementos flutuantes premium com motion */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Partículas grandes */}
            <motion.div
              {...floatEffect}
              className="absolute top-20 left-16 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full opacity-40"
            />
            <motion.div
              {...floatEffect}
              transition={{ ...floatEffect.animate.transition, delay: 2 }}
              className="absolute top-32 right-20 w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-30"
            />
            <motion.div
              {...floatEffect}
              transition={{ ...floatEffect.animate.transition, delay: 1 }}
              className="absolute bottom-24 left-24 w-2.5 h-2.5 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full opacity-25"
            />
          </div>

          {/* Blur shapes de fundo com pulse motion */}
          <motion.div
            {...pulseEffect}
            className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-200/20 to-cyan-200/10 rounded-full blur-3xl"
          />
          <motion.div
            {...pulseEffect}
            transition={{ ...pulseEffect.animate.transition, delay: 2 }}
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-200/10 to-indigo-200/20 rounded-full blur-3xl"
          />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <motion.div
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="text-center mb-16"
            >
              {/* Badge premium */}
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 bg-white backdrop-blur-xl border border-gray-200 shadow-lg text-indigo-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 group hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span>Central de Conhecimento Premium</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              </motion.div>

              {/* Título com animação framer motion */}
              <motion.div variants={fadeInUp} className="relative mb-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block mb-5">
                  Central de Comunidade
                </h1>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.9] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent block relative pb-3">
                  Artigos e Playlists que Aprovam
                </h1>
              </motion.div>

              <motion.p
                variants={fadeInUp}
                className="text-base sm:text-lg md:text-xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed font-normal px-4 sm:px-0"
              >
                <span className="font-semibold">Conteúdo exclusivo</span> de
                especialistas,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                  {" "}
                  metodologias comprovadas
                </span>{" "}
                e<span className="font-semibold"> insights únicos</span> para
                sua aprovação e playlist de estudos feitas pela própria comunidade
              </motion.p>

              {/* Stats cards com stagger */}
              <motion.div
                variants={staggerContainer}
                className="flex flex-wrap items-center justify-center gap-8 mb-12"
              >
                {[
                  { icon: BookOpen, color: "from-blue-500 to-indigo-600", label: "Artigos Exclusivos", value: posts.length },
                  { icon: ListMusic, color: "from-yellow-500 to-orange-600", label: "Playlists", value: playlistCount ?? "XXX" },
                  { icon: Users, color: "from-purple-500 to-pink-600", label: "Estudantes Ativos", value: "XXX" },
                  { icon: Award, color: "from-green-500 to-emerald-600", label: "Taxa de Aprovação", value: "XXX" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    variants={fadeInUp}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="group bg-white backdrop-blur-xl border border-gray-200/50 shadow-xl px-8 py-6 rounded-2xl hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-gradient-to-r ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                        <stat.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-left">
                        <span className="block text-3xl font-black text-gray-900">{stat.value}</span>
                        <span className="block text-sm font-semibold text-gray-600">{stat.label}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Section */}
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row items-center justify-center gap-6"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/library"
                    onClick={(e) => handleNavigation(e, "/library")}
                    className="group relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-500 flex items-center gap-4 overflow-hidden shadow-xl"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    <Zap className="w-5 h-5" />
                    <span className="relative z-10 text-lg">Começar Prática Agora</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    href="#articles"
                    className="group bg-white backdrop-blur-xl border border-gray-200 text-gray-800 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-xl flex items-center gap-3"
                  >
                    <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Explorar Artigos</span>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Playlist Hub Section */}
        <PlaylistHub searchQuery={searchQuery} />

        {/* Filtros Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white backdrop-blur-xl border-y border-gray-200 shadow-lg sticky top-0 z-40"
        >
          <div className="container mx-auto px-4 md:px-6 py-8">
            {/* Desktop Layout */}
            <div className="hidden md:flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="relative flex-1 max-w-lg group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Pesquisar artigos, dicas, estratégias..."
                  className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm hover:shadow-md text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <Filter className="w-5 h-5" />
                  <p>Categorias:</p>
                </div>
                <div className="flex gap-2">
                  {filterCategories.map((filter) => (
                    <motion.button
                      key={filter}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 cursor-pointer ${
                        activeFilter === filter
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                          : "bg-white border border-gray-200/50 text-gray-700 hover:border-blue-300 hover:text-blue-600"
                      }`}
                    >
                      {filter}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Layout Premium */}
            <div className="md:hidden space-y-6">
              {/* Mobile Search */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar artigos..."
                  className="block w-full pl-12 pr-4 py-4 bg-white backdrop-blur-xl border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 shadow-sm text-gray-900"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Mobile Filter Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="block font-bold text-gray-900">
                      Filtrar Conteúdo
                    </span>
                    <span className="block text-sm text-gray-600">
                      Escolha sua categoria
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-sm font-bold text-gray-700">
                      {filteredPosts.length} artigo
                      {filteredPosts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {/* Mascote pequeno no mobile */}
                  <Image
                    src="/Mascote/banners/Camaleão_1.png"
                    alt="Mascote"
                    width={40}
                    height={40}
                    className="animate-float drop-shadow-md"
                  />
                </div>
              </div>

              {/* Mobile Filter Grid */}
              <div className="grid grid-cols-2 gap-3">
                {filterCategories.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`py-4 px-4 text-sm font-bold rounded-xl transition-all duration-300 transform active:scale-95 ${
                      activeFilter === filter
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-105"
                        : "bg-white backdrop-blur-xl border border-gray-200/50 text-gray-700 hover:border-blue-300 hover:text-blue-600 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {filter === "Todos" && <BookOpen className="w-4 h-4" />}
                      {filter === "Mais Recentes" && (
                        <Clock className="w-4 h-4" />
                      )}
                      {filter === "Populares" && <Star className="w-4 h-4" />}
                      {filter === "Matemática" && (
                        <Target className="w-4 h-4" />
                      )}
                      {filter === "Redação" && <Award className="w-4 h-4" />}
                      <span className="truncate">{filter}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Filter Indicator */}
              {activeFilter !== "Todos" && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-blue-900">
                        Filtrando por:{" "}
                        <span className="font-black">{activeFilter}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveFilter("Todos")}
                      className="text-sm text-blue-600 hover:text-blue-800 font-bold underline"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Articles Section */}
        <div id="articles" className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            {isLoading ? (
              <div className="text-center">
                <div className="flex justify-center mb-8">
                  <Skeleton className="h-12 w-64 rounded-2xl" />
                </div>
                <Skeleton className="h-80 w-full rounded-3xl mb-16" />
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-96 w-full rounded-3xl" />
                  <Skeleton className="h-96 w-full rounded-3xl" />
                  <Skeleton className="h-96 w-full rounded-3xl" />
                </div>
              </div>
            ) : filteredPosts.length > 0 ? (
              <>
                {/* Featured Article */}
                {featuredPost && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                  >
                    <div className="flex items-center gap-4 mb-10">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Star className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate-800">
                          Artigo em Destaque
                        </h2>
                        <p className="text-slate-600 font-medium">
                          O conteúdo mais relevante da semana
                        </p>
                      </div>
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="ml-auto hidden md:block"
                      >
                        <Image
                          src="/Mascote/banners/Camaleão_3.png"
                          alt="Mascote"
                          width={130}
                          height={130}
                          className="drop-shadow-lg"
                        />
                      </motion.div>
                    </div>

                    <motion.div
                      whileHover={{ y: -8, boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.25)" }}
                      className="group relative bg-white rounded-3xl shadow-xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-blue-500 cursor-pointer"
                      onClick={(e) => handleNavigation(e, `/blog/${featuredPost.slug}`)}
                    >
                      <div className="relative p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-6">
                          <span className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full text-sm font-bold text-blue-700">
                            ✨ Em Destaque
                          </span>
                        </div>
                        <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 group-hover:text-blue-600 transition-colors duration-300 leading-tight mb-4">
                          {featuredPost.title}
                        </h3>
                        <div className="flex items-center gap-6 mt-8 text-slate-500">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Publicado hoje
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              8 min de leitura
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              2.4k visualizações
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}

                {/* Grid com Carrossel */}
                <div>
                  <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-slate-800">
                        {activeFilter === "Todos"
                          ? "Biblioteca de Conhecimento"
                          : `Categoria: ${activeFilter}`}
                      </h2>
                    </div>
                  </div>

                  <div className="relative group/carousel">
                    <div className="overflow-x-hidden py-6" ref={emblaRef}>
                      <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="flex gap-8"
                      >
                        {regularPosts.map((post, index) => (
                          <motion.div
                            key={post.slug}
                            variants={fadeInUp}
                            className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-1rem)] lg:flex-[0_0_calc(33.333%-1.33rem)]"
                          >
                            <motion.div
                              whileHover={{ y: -10, scale: 1.02 }}
                              className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden h-full cursor-pointer hover:shadow-2xl transition-all"
                              onClick={(e) => handleNavigation(e, `/blog/${post.slug}`)}
                            >
                              <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 relative">
                                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold">
                                  {post.category}
                                </div>
                              </div>
                              <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">
                                  {post.title}
                                </h3>
                                <div className="flex items-center justify-between text-gray-500 text-xs">
                                  <div className="flex gap-3">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> 5 min
                                    </span>
                                  </div>
                                  <span className="text-blue-600 font-bold flex items-center gap-1">
                                    Ler mais{" "}
                                    <ArrowRight className="w-3 h-3" />
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-32">
                <div className="max-w-2xl mx-auto">
                  {/* Mascote na seção vazia */}
                  <div className="relative w-64 h-64 mx-auto mb-8">
                    <Image
                      src="/Mascote/banners/Camaleão_18.png"
                      alt="Mascote Vestibuline preparando conteúdo"
                      width={256}
                      height={256}
                      className="drop-shadow-2xl animate-float"
                    />
                  </div>

                  <h3 className="text-4xl font-black text-slate-800 mb-6">
                    Conteúdo Incrível em Produção!
                  </h3>

                  <p className="text-xl text-slate-600 mb-12 leading-relaxed">
                    Nossa equipe de especialistas está preparando artigos
                    exclusivos e estratégias únicas. Enquanto isso, aproveite
                    nossos simulados para acelerar sua preparação.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                      href="/library"
                      onClick={(e) => handleNavigation(e, "/library")}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                    >
                      <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                        <Zap className="w-4 h-4" />
                      </div>
                      <span>Começar Simulados</span>
                    </Link>

                    <Link
                      href="/contact"
                      onClick={(e) => handleNavigation(e, "/contact")}
                      className="inline-flex items-center gap-3 bg-white border-2 border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg"
                    >
                      <Users className="w-5 h-5" />
                      <span>Falar com Especialista</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Newsletter Section Premium */}
        <div className="relative py-24 overflow-hidden">
          {/* Background premium */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-800/30 via-transparent to-purple-800/20"></div>

          {/* Elementos decorativos com motion */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 left-12 w-4 h-4 bg-white/20 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -15, 0], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-24 right-16 w-2 h-2 bg-blue-300/40 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -25, 0], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-16 left-20 w-3 h-3 bg-purple-300/30 rounded-full"
            />
          </div>

          {/* Mascote Newsletter - Desktop Left */}
          <motion.div 
            className="hidden lg:block absolute left-[5%] top-1/2 -translate-y-1/2 z-10 pointer-events-none"
            animate={{ y: ["-50%", "-55%", "-50%"], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Image
              src="/Mascote/banners/Camaleão_11.png"
              alt="Mascote Vestibuline Newsletter"
              width={260}
              height={260}
              className="drop-shadow-2xl"
            />
          </motion.div>

          {/* Mascote Newsletter - Desktop Right */}
          <motion.div
            className="hidden lg:block absolute right-[5%] top-1/2 -translate-y-1/2 z-10 pointer-events-none"
            animate={{ y: ["-50%", "-45%", "-50%"], rotate: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <Image
              src="/Mascote/banners/Camaleão_8.png"
              alt="Mascote Vestibuline Newsletter"
              width={260}
              height={260}
              className="drop-shadow-2xl"
            />
          </motion.div>

          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <motion.div 
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="max-w-4xl mx-auto"
            >
              {/* Badge */}
              <motion.div 
                variants={fadeInUp}
                className="inline-flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8"
              >
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span>Newsletter Exclusiva</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </motion.div>

              {/* Título */}
              <motion.h2 
                variants={fadeInUp}
                className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight"
              >
                Não Perca Nenhuma
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Estratégia Vencedora
                </span>
              </motion.h2>

              {/* Subtítulo */}
              <motion.p 
                variants={fadeInUp}
                className="text-xl md:text-2xl text-blue-100 mb-4 leading-relaxed"
              >
                Receba todas as atualizações, dicas de especialistas e
                <span className="font-bold text-white"> metodologias que realmente funcionam</span>
              </motion.p>

              {/* Features */}
              <div className="flex flex-wrap justify-center gap-6 mb-12 text-blue-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="font-medium">Seja o primeiro a saber</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <span className="font-medium">Estratégias Exclusivas</span>
                </div>
              </div>

              {/* Form Premium */}
              <div className="max-w-2xl mx-auto">
                <div className="justify-center backdrop-blur rounded-2xl">
                  <SubscribeButton />
                </div>

                {/* Disclaimer */}
                <p className="text-sm text-blue-200 mt-4">
                  📧 Vários <strong>estudantes</strong> já recebem nossas
                  estratégias constantemente.
                  <br />
                  Sem spam, apenas conteúdo de qualidade.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Confiado por milhares de estudantes
              </h3>
              <p className="text-slate-600">
                Junte-se à comunidade que mais aprova no Brasil
              </p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              {[{ icon: Award, color: "from-green-500 to-emerald-600", label: "Taxa de Aprovação", value: "XXX" },
                { icon: Users, color: "from-blue-500 to-indigo-600", label: "Estudantes Ativos", value: "XXX" },
                { icon: Star, color: "from-purple-500 to-pink-600", label: "Avaliação dos Alunos", value: "XXX" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  variants={fadeInUp}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="text-center"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:rotate-6 transition-transform duration-300`}>
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-800 mb-2">{item.value}</h4>
                  <p className="text-slate-600 font-medium">{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
