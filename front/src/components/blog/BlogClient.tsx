"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { PostPreview } from "@/types";
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
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/Footer";
import { useState, useMemo, useEffect, useCallback } from "react";
import { SubscribeButton } from "@/components/blog/SubscribeButton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import useEmblaCarousel from "embla-carousel-react";

export default function BlogClient({ initialPosts }: { initialPosts: PostPreview[] }) {
  const [posts] = useState<PostPreview[]>(initialPosts);
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

  // Fetch logic removida, posts alimentados via initialPosts

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

      {/* CSS personalizado para animações */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes spin-reverse {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(-360deg);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-x {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-spin-reverse {
          animation: spin-reverse 25s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-scale-x {
          animation: scale-x 0.8s ease-out forwards;
          transform-origin: left;
        }

        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }

        /* Estilos do carrossel */
        .embla {
          overflow: visible;
          padding: 1rem 0;
        }

        .embla__container {
          display: flex;
          gap: 2rem;
        }

        .embla__slide {
          flex: 0 0 100%;
          min-width: 0;
          padding: 0.25rem;
        }

        @media (min-width: 640px) {
          .embla__slide {
            flex: 0 0 calc(50% - 1rem);
          }
        }

        @media (min-width: 1024px) {
          .embla__slide {
            flex: 0 0 calc(33.333% - 1.333rem);
          }
        }

        /* Prevenir overflow horizontal desnecessário */
        .carousel-wrapper {
          overflow-x: clip;
        }
      `}</style>

      <main className="flex-1 relative overflow-hidden">
        {/* Hero Section Premium com Background Dinâmico */}
        <div className="relative py-20 md:py-32 overflow-hidden backdrop-blur-xl">
          {/* Background com mesh gradient animado */}
          <div className="absolute inset-0 bg-white"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-purple-100/10"></div>

          {/* Elementos flutuantes premium */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Partículas grandes */}
            <div className="absolute top-20 left-16 w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-float opacity-40"></div>
            <div
              className="absolute top-32 right-20 w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-float opacity-30"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-24 left-24 w-2.5 h-2.5 bg-gradient-to-r from-indigo-400 to-blue-500 rounded-full animate-float opacity-25"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/2 right-16 w-1.5 h-1.5 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full animate-float opacity-35"
              style={{ animationDelay: "3s" }}
            ></div>
          </div>

          {/* Blur shapes de fundo */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-200/20 to-cyan-200/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-l from-purple-200/10 to-indigo-200/20 rounded-full blur-3xl animate-pulse-slow"
            style={{ animationDelay: "2s" }}
          ></div>

          {/* Mascote Hero - Desktop */}
          <div className="hidden lg:block absolute left-[5%] top-1/2 -translate-y-1/2 z-10 animate-float pointer-events-none">
            <Image
              src="/Mascote/banners/Camaleão_15.png"
              alt="Mascote Vestibuline"
              width={160}
              height={160}
              className="drop-shadow-2xl"
            />
          </div>

          {/* Mascote Hero - Desktop Right */}
          <div
            className="hidden lg:block absolute right-[5%] top-1/2 -translate-y-1/2 z-10 animate-float pointer-events-none"
            style={{ animationDelay: "1.5s" }}
          >
            <Image
              src="/Mascote/banners/Camaleão_23.png"
              alt="Mascote Vestibuline"
              width={180}
              height={180}
              className="drop-shadow-2xl"
            />
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="text-center mb-16">
              {/* Badge premium com animação */}
              <div className="inline-flex items-center gap-3 bg-white backdrop-blur-xl border border-gray-200/50 shadow-lg text-indigo-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 animate-fade-in-up group hover:scale-105 transition-transform duration-300">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center group-hover:rotate-12 transition-transform shadow-md">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span>Central de Conhecimento Premium</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
              </div>

              {/* Título com typography melhorada */}
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 animate-fade-in-up leading-[0.9]"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="relative">
                  <h1 className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent block mb-5">
                    Vestibuline News
                  </h1>
                  <h1 className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent block relative pb-3">
                    Artigos e Matérias que Aprovam
                    {/* Sublinhado sofisticado */}
                    <div
                      className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full transform scale-x-0 animate-scale-x opacity-70"
                      style={{ animationDelay: "1.2s" }}
                    ></div>
                  </h1>
                </div>
              </h1>

              {/* Subtítulo premium */}
              <p
                className="text-base sm:text-lg md:text-xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed font-normal animate-fade-in-up px-4 sm:px-0"
                style={{ animationDelay: "0.4s" }}
              >
                <span className="font-semibold">Conteúdo exclusivo</span> de
                especialistas,
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-bold">
                  {" "}
                  metodologias comprovadas
                </span>{" "}
                e<span className="font-semibold"> insights únicos</span> para
                sua aprovação
              </p>

              {/* Stats cards premium */}
              <div
                className="flex flex-wrap items-center justify-center gap-8 mb-12 animate-fade-in-up"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="group bg-white backdrop-blur-xl border border-gray-200/50 shadow-xl px-8 py-6 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block text-3xl font-black text-gray-900">
                        {posts.length}
                      </span>
                      <span className="block text-sm font-semibold text-gray-600">
                        Artigos Exclusivos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group bg-white backdrop-blur-xl border border-gray-200/50 shadow-xl px-8 py-6 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block text-3xl font-black text-gray-900">
                        XXX
                      </span>
                      <span className="block text-sm font-semibold text-gray-600">
                        Estudantes Ativos
                      </span>
                    </div>
                  </div>
                </div>

                <div className="group bg-white backdrop-blur-xl border border-gray-200/50 shadow-xl px-8 py-6 rounded-2xl hover:shadow-2xl transition-all duration-500 hover:scale-105">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block text-3xl font-black text-gray-900">
                        XXX
                      </span>
                      <span className="block text-sm font-semibold text-gray-600">
                        Taxa de Aprovação
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Section Premium */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-in-up"
                style={{ animationDelay: "0.8s" }}
              >
                <Link
                  href="/library"
                  onClick={(e) => handleNavigation(e, "/library")}
                  className="group relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-2xl flex items-center gap-4 overflow-hidden shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center relative z-10">
                    <Zap className="w-4 h-4" />
                  </div>
                  <span className="relative z-10 text-lg">
                    Começar Prática Agora
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform relative z-10" />
                </Link>

                <Link
                  href="#articles"
                  className="group bg-white backdrop-blur-xl border border-gray-200 text-gray-800 font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105 flex items-center gap-3"
                >
                  <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Explorar Artigos</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros Section Premium */}
        <div className="bg-white backdrop-blur-xl border-y border-gray-200 shadow-lg sticky top-0 z-40">
          <div className="container mx-auto px-4 md:px-6 py-8">
            {/* Desktop Layout */}
            <div className="hidden md:flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Search Bar Premium */}
              <div className="relative flex-1 max-w-lg group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <input
                  type="text"
                  placeholder="Pesquisar artigos, dicas, estratégias..."
                  className="block w-full pl-12 pr-4 py-4 bg-white backdrop-blur-xl border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md text-gray-900 placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filters Premium */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <Filter className="w-5 h-5" />
                  <p>Categorias:</p>
                </div>

                <div className="flex gap-2">
                  {filterCategories.map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                        activeFilter === filter
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                          : "bg-white backdrop-blur-xl border border-gray-200/50 text-gray-700 hover:bg-white hover:border-blue-300 hover:text-blue-600 hover:shadow-lg hover:shadow-blue-300/20"
                      }`}
                    >
                      {filter}
                    </button>
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
        </div>

        {/* Articles Section Premium */}
        <div id="articles" className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
              {/* Fallback caso não haja posts ou pesquisa sem resultados */}
              {filteredPosts.length > 0 ? (
              <>
                {/* Featured Article Premium */}
                {featuredPost && (
                  <div className="mb-20">
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
                      {/* Mascote pequeno no título */}
                      <div className="ml-auto hidden md:block">
                        <Image
                          src="/Mascote/banners/Camaleão_3.png"
                          alt="Mascote"
                          width={130}
                          height={130}
                          className="drop-shadow-lg"
                        />
                      </div>
                    </div>

                    <div
                      className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-blue-500 hover:shadow-blue-500/30 cursor-pointer"
                      onClick={(e) =>
                        handleNavigation(e, `/blog/${featuredPost.slug}?id=${featuredPost.id}`)
                      }
                    >
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative p-8 md:p-12">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full">
                            <span className="text-sm font-bold text-blue-700">
                              ✨ Em Destaque
                            </span>
                          </div>
                          <div className="bg-slate-100 px-3 py-1 rounded-full">
                            <span className="text-xs font-medium text-slate-600">
                              Leitura Premium
                            </span>
                          </div>
                        </div>
                        <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 group-hover:text-blue-600 transition-colors duration-300 leading-tight mb-4">
                          {featuredPost.title}
                        </h3>
                        <div className="flex items-center gap-6 mt-8">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Publicado hoje
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              8 min de leitura
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              2.4k visualizações
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Regular Articles Grid Premium */}
                {regularPosts.length > 0 && (
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
                        <p className="text-slate-600 font-medium">
                          Conteúdo selecionado para acelerar seu aprendizado
                        </p>
                      </div>
                      {/* Mascote pequeno no título */}
                      <div className="ml-auto hidden md:block">
                        <Image
                          src="/Mascote/banners/Camaleão_6.png"
                          alt="Mascote"
                          width={140}
                          height={140}
                          className="drop-shadow-lg"
                        />
                      </div>
                    </div>

                    {/* Carrossel Container */}
                    <div className="relative group/carousel -mx-4 px-4">
                      {/* Botão Anterior */}
                      <button
                        onClick={scrollPrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-12 h-12 !bg-white backdrop-blur-xl rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-200/50 opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
                        aria-label="Anterior"
                      >
                        <ChevronLeft className="w-6 h-6 text-slate-700" />
                      </button>

                      {/* Carrossel Embla - Container com overflow apenas horizontal */}
                      <div
                        className="overflow-x-hidden overflow-y-visible py-6"
                        ref={emblaRef}
                      >
                        <div className="flex gap-8 -mx-1">
                          {regularPosts.map((post, index) => (
                            <div
                              key={post.slug}
                              className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-1rem)] lg:flex-[0_0_calc(33.333%-1.33rem)] min-w-0 px-1 cursor-pointer animate-fade-in-up"
                              onClick={(e) =>
                                handleNavigation(e, `/blog/${post.slug}?id=${post.id}`)
                              }
                              style={{ animationDelay: `${index * 0.1}s` }}
                            >
                              <div className="group bg-white backdrop-blur-xl rounded-3xl shadow-lg transition-all duration-500 border border-gray-200 hover:border-blue-400/50 overflow-hidden hover:scale-[1.03] hover:-translate-y-3 h-full hover:shadow-xl hover:shadow-blue-400/10">
                                <div className="h-48 bg-gradient-to-br from-blue-100 via-purple-50 to-indigo-100 relative overflow-hidden">
                                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-all duration-500"></div>
                                  <div className="absolute bottom-4 left-4">
                                    <div className="bg-white backdrop-blur-xl px-4 py-1.5 rounded-full shadow-sm border border-gray-200">
                                      <span className="text-xs font-semibold text-gray-700">
                                        {post.category || "Artigo"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="p-6">
                                  <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-tight mb-4">
                                    {post.title}
                                  </h3>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-gray-500">
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span className="text-xs font-medium">
                                          5 min
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <Eye className="w-4 h-4" />
                                        <span className="text-xs font-medium">
                                          1.2k
                                        </span>
                                      </div>
                                    </div>

                                    <Link
                                      href={`/blog/${post.slug}`}
                                      onClick={(e) =>
                                        handleNavigation(
                                          e,
                                          `/blog/${post.slug}?id=${post.id}`
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm group-hover:gap-2.5 transition-all duration-300"
                                    >
                                      Ler mais
                                      <ArrowRight className="w-4 h-4" />
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Botão Próximo */}
                      <button
                        onClick={scrollNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-12 h-12 !bg-white backdrop-blur-xl rounded-full shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 border border-gray-200/50 opacity-0 group-hover/carousel:opacity-100"
                        aria-label="Próximo"
                      >
                        <ChevronRight className="w-6 h-6 text-slate-700" />
                      </button>
                    </div>
                  </div>
                )}
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

          {/* Elementos decorativos */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-12 left-12 w-4 h-4 bg-white/20 rounded-full animate-float"></div>
            <div
              className="absolute top-24 right-16 w-2 h-2 bg-blue-300/40 rounded-full animate-float"
              style={{ animationDelay: "2s" }}
            ></div>
            <div
              className="absolute bottom-16 left-20 w-3 h-3 bg-purple-300/30 rounded-full animate-float"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-24 right-24 w-2 h-2 bg-white/30 rounded-full animate-float"
              style={{ animationDelay: "3s" }}
            ></div>
          </div>

          {/* Mascote Newsletter - Desktop Left */}
          <div className="hidden lg:block absolute left-[5%] top-1/2 -translate-y-1/2 z-10 animate-float pointer-events-none">
            <Image
              src="/Mascote/banners/Camaleão_11.png"
              alt="Mascote Vestibuline Newsletter"
              width={260}
              height={260}
              className="drop-shadow-2xl"
            />
          </div>

          {/* Mascote Newsletter - Desktop Right */}
          <div
            className="hidden lg:block absolute right-[5%] top-1/2 -translate-y-1/2 z-10 animate-float pointer-events-none"
            style={{ animationDelay: "2s" }}
          >
            <Image
              src="/Mascote/banners/Camaleão_8.png"
              alt="Mascote Vestibuline Newsletter"
              width={260}
              height={260}
              className="drop-shadow-2xl"
            />
          </div>

          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold mb-8">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <span>Newsletter Exclusiva</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>

              {/* Título */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Não Perca Nenhuma
                <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Estratégia Vencedora
                </span>
              </h2>

              {/* Subtítulo */}
              <p className="text-xl md:text-2xl text-blue-100 mb-4 leading-relaxed">
                Receba todas as atualizações, dicas de especialistas e
                <span className="font-bold text-white">
                  {" "}
                  metodologias que realmente funcionam
                </span>
              </p>

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
            </div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Confiado por milhares de estudantes
              </h3>
              <p className="text-slate-600">
                Junte-se à comunidade que mais aprova no Brasil
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-black text-slate-800 mb-2">XXX</h4>
                <p className="text-slate-600 font-medium">Taxa de Aprovação</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-black text-slate-800 mb-2">XXX</h4>
                <p className="text-slate-600 font-medium">Estudantes Ativos</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-2xl font-black text-slate-800 mb-2">XXX</h4>
                <p className="text-slate-600 font-medium">
                  Avaliação dos Alunos
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
