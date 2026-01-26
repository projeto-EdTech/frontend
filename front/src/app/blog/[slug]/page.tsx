import { PostCard } from "@/components/community/PostCard";
import Link from "next/link";
import { Post } from "@/types";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Eye,
  TrendingUp,
  ThumbsUp,
  BookOpen,
  Zap,
  Star,
  Users,
  Trophy,
  User,
  Heart,
} from "lucide-react";
import ShareModal from "@/components/community/ShareModal";
import SubscribeButton from "@/components/community/SubscribeButton";
import Image from "next/image";
import { getAllPosts, getPostBySlug } from "@/lib/post";
import NavigationLink from "@/components/community/NavigationLink";

// Busca diretamente do módulo do servidor (sem chamadas HTTP)
async function getPostData(slug: string): Promise<Post | null> {
  const post = getPostBySlug(slug);
  return post ?? null;
}

async function getRelatedPosts(currentSlug: string): Promise<Post[]> {
  const posts = getAllPosts();
  return posts.filter((p) => p.slug !== currentSlug).slice(0, 3);
}

// Geração de Metadados Dinâmicos - CORRIGIDA
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  // CORREÇÃO: Aguardar a resolução dos params
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    return { title: "Post não encontrado" };
  }

  return {
    title: `${post.title} | Blog Vestibuline`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

// Geração de Rotas Estáticas - CORRIGIDA
export async function generateStaticParams() {
  try {
    const posts = getAllPosts();
    return posts.map((post) => ({ slug: post.slug }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// O Componente da Página - CORRIGIDO
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // CORREÇÃO: Aguardar a resolução dos params antes de usar
  const { slug } = await params;

  // Agora usar a variável 'slug' nas chamadas de API
  const [post, relatedPosts] = await Promise.all([
    getPostData(slug),
    getRelatedPosts(slug),
  ]);

  // A validação continua a mesma
  if (!post) {
    notFound();
  }

  // Garante que métricas existam mesmo se ausentes na fonte
  const stats = post.stats ?? { views: 0.0, likes: 0.0 };

  return (
    <div className="themed-main-container min-h-screen force-themed-bg flex flex-col bg-[#f5f5f7]">
      <Header />
      <main className="flex-1 relative overflow-hidden">
        {/* Hero Section do Artigo */}
        <div className="relative py-12 md:py-20 overflow-hidden backdrop-blur-xl">
          {/* Background decorativo */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-10 left-10 w-2.5 h-2.5 bg-blue-400/60 rounded-full animate-bounce"
              style={{ animationDelay: "0s", animationDuration: "3s" }}
            ></div>
            <div
              className="absolute top-20 right-16 w-1.5 h-1.5 bg-purple-400/50 rounded-full animate-bounce"
              style={{ animationDelay: "1s", animationDuration: "4s" }}
            ></div>
            <div
              className="absolute bottom-16 left-20 w-2 h-2 bg-indigo-400/40 rounded-full animate-bounce"
              style={{ animationDelay: "2s", animationDuration: "3.5s" }}
            ></div>
          </div>

          <div className="container mx-auto px-4 md:px-6 relative z-10">
            {/* Navegação breadcrumb */}
            <nav className="mb-10 animate-fade-in-up">
              <div className="flex items-center gap-2.5 text-sm themed-text-secondary">
                <Link
                  href="/blog"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/80 hover:text-blue-600 transition-all duration-300 backdrop-blur-xl"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">Voltar ao Blog</span>
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-blue-600 font-semibold">Artigo</span>
              </div>
            </nav>

            {/* Header do artigo */}
            <div className="max-w-4xl mx-auto text-center mb-12 relative">
              {/* Mascote decorativo - lado esquerdo */}
              <div
                className="hidden lg:block absolute -left-50 top-10 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <Image
                  src="/Mascote/banners/Camaleão_5.png"
                  alt="Mascote Vestibuline"
                  width={200}
                  height={200}
                  className="drop-shadow-2xl hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Mascote decorativo - lado direito */}
              <div
                className="hidden lg:block absolute -right-50 top-10 animate-fade-in-up"
                style={{ animationDelay: "0.1s" }}
              >
                <Image
                  src="/Mascote/banners/Camaleão_15.png"
                  alt="Mascote Vestibuline"
                  width={200}
                  height={200}
                  className="drop-shadow-2xl hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Categoria/Tag */}
              <div
                className="inline-flex items-center gap-2.5 bg-white/90 backdrop-blur-xl border border-gray-200/50 text-blue-700 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 animate-fade-in-up shadow-md hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: "0.2s" }}
              >
                <BookOpen className="w-4 h-4" />
                <span>{post.category}</span>
              </div>

              {/* Título principal */}
              <h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-8 animate-fade-in-up leading-[0.95] tracking-tight"
                style={{ animationDelay: "0.4s" }}
              >
                <span className="bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  {post.title}
                </span>
              </h1>

              {/* Métricas e metadados */}
              <div
                className="flex flex-wrap items-center justify-center gap-8 mb-10 animate-fade-in-up"
                style={{ animationDelay: "0.6s" }}
              >
                <div className="flex items-center gap-2.5 px-4 py-2 bg-white backdrop-blur-xl rounded-full shadow-sm border border-gray-200/50">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {post.readingTime} min de leitura
                  </span>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 bg-white backdrop-blur-xl rounded-full shadow-sm border border-gray-200/50">
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {stats.views.toLocaleString()} visualizações
                  </span>
                </div>

                <div className="flex items-center gap-2.5 px-4 py-2 bg-white backdrop-blur-xl rounded-full shadow-sm border border-gray-200/50">
                  <ThumbsUp className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {stats.likes} curtidas
                  </span>
                </div>
              </div>

              {/* Ações do artigo */}
              <div
                className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up"
                style={{ animationDelay: "0.8s" }}
              >
                <ShareModal title={post.title} />

                <button className="flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold cursor-pointer">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">Curtir</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="themed-section py-16 bg-[#f5f5f7]">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Artigo principal */}
              <article className="flex-1 max-w-6xl min-w-0 -y-10">
                {/* Card do conteúdo */}
                <div className="bg-transparent backdrop-blur-xl rounded-3xl p-8 md:p-12">
                  <PostCard
                    viewMode="full"
                    title={post.title}
                    date={post.publishedAt}
                    excerpt={post.excerpt}
                    content={post.content}
                    readTime={post.readingTime}
                    views={stats.views}
                    likes={stats.likes}
                  />
                </div>

                {/* Seção de autor */}
                <div className="mt-12 bg-white backdrop-blur-xl rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                  {/* Mascote decorativo no fundo */}
                  <div className="absolute right-4 bottom-0 opacity-60 pointer-events-none">
                    <Image
                      src="/Mascote/banners/Camaleão_24.png"
                      alt="Mascote Vestibuline"
                      width={150}
                      height={150}
                      className="drop-shadow-lg"
                    />
                  </div>

                  <div className="flex items-start gap-4 relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        Equipe Vestibuline
                      </h4>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        Especialistas em vestibulares com mais de 10 anos de
                        experiência em aprovações nas melhores universidades do
                        país.
                      </p>
                      <div className="flex items-center gap-6 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="font-medium">1000+ aprovados</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span className="font-medium">50+ artigos</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              {/* Sidebar */}
              <aside className="w-full lg:w-80 space-y-8">
                {/* Widget de métricas rápidas */}
                <div className="bg-white backdrop-blur-xl rounded-3xl p-6 sticky top-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Estatísticas do Artigo
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">
                            Visualizações
                          </p>
                          <p className="text-xl font-bold text-white">
                            {stats.views.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center shadow-md">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">
                            Curtidas
                          </p>
                          <p className="text-xl font-bold text-white">
                            {stats.likes}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Linha de Comentários removida */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-white font-medium">
                            Tempo de Leitura
                          </p>
                          <p className="text-xl font-bold text-white">
                            {post.readingTime} min
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Widget de newsletter */}
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-xl border border-white/20 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden">
                  <div className="text-center relative z-10">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">
                      Não perca nenhuma dica
                    </h3>
                    <p className="text-white/90 mb-6 text-sm leading-relaxed">
                      Receba atualizações sobre a plataforma diretamente no seu
                      e-mail
                    </p>
                    <div className="space-y-3">
                      <SubscribeButton />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>

        {/* Artigos relacionados */}
        {relatedPosts.length > 0 && (
          <div className="themed-section py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4 md:px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Continue Aprendendo
                </h2>
                <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto">
                  Outros artigos que podem te interessar
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost, index) => (
                  <NavigationLink
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="h-full bg-white backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-2 hover:border-blue-500 hover:shadow-blue-500/30">
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-blue-400 group-hover:text-blue-600 transition-colors duration-300" />
                        </div>
                        <div className="absolute top-4 left-4">
                          <div className="px-3 py-1.5 bg-white/95 backdrop-blur-xl text-xs font-bold rounded-full text-blue-600 shadow-md">
                            RELACIONADO
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">
                            {new Date(
                              relatedPost.publishedAt
                            ).toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2 leading-tight">
                          {relatedPost.title}
                        </h3>

                        <p className="text-gray-600 line-clamp-3 leading-relaxed">
                          {relatedPost.excerpt}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-200/70">
                          <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-3 transition-all duration-300">
                            <span className="text-sm">Ler artigo</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>

                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="w-4 h-4 text-yellow-400 fill-current drop-shadow-sm"
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </NavigationLink>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA Final */}
        <div className="themed-section py-20 bg-gradient-to-br from-blue-600 to-indigo-600 text-white relative overflow-hidden">
          {/* Decorative particles */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div
              className="absolute top-20 right-20 w-2 h-2 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute bottom-20 left-1/4 w-2.5 h-2.5 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute bottom-10 right-1/3 w-2 h-2 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "1.5s" }}
            ></div>
          </div>

          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="max-w-3xl mx-auto">
              {/* Mascote principal de comemoração */}
              <div className="mb-8 flex justify-center">
                <div className="relative animate-bounce-slow">
                  <div className="absolute inset-0 bg-white rounded-full blur-3xl"></div>
                  <Image
                    src="/Mascote/banners/Camaleão_18.png"
                    alt="Mascote Vestibuline Comemorando"
                    width={180}
                    height={180}
                    className="drop-shadow-2xl relative z-10"
                  />
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight text-gray-800">
                Transforme o Conhecimento em Aprovação
              </h2>
              <p className="text-xl md:text-2xl mb-10 text-gray-800 leading-relaxed">
                Agora que você aprendeu essas estratégias, é hora de colocá-las
                em prática com nossos simulados personalizados
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <NavigationLink
                  href="/library"
                  className="group relative bg-white text-blue-600 font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 overflow-hidden shadow-lg hover:shadow-blue-500/30 hover:border-blue-500"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-100/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <Zap className="w-5 h-5 relative z-10" />
                  <span className="relative z-10 text-lg">
                    Começar Simulados
                  </span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                </NavigationLink>

                <NavigationLink
                  href="/blog"
                  className="font-bold py-4 px-10 rounded-2xl border-2 border-gray-200 hover:bg-white backdrop-blur-xl transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 text-white"
                >
                  <BookOpen className="w-5 h-5 text-gray-600" />
                  <span className="text-lg text-gray-600">
                    Ver Mais Artigos
                  </span>
                </NavigationLink>
              </div>

              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>50k+ estudantes aprovados</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span>98% de satisfação</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
