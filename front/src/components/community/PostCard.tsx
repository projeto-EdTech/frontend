"use client";

import React from 'react';
import { Calendar, Clock, Eye, TrendingUp, ArrowRight, BookOpen, ThumbsUp, MessageCircle, Bookmark, Target, Award } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { seededInt } from '@/lib/core/seededRandom';

type PostCardProps = {
  title: string;
  date: string;
  excerpt: string;
  category?: string;
  readTime?: number;
  views?: number;
  likes?: number;
  isFeature?: boolean;
  trending?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  viewMode?: 'summary' | 'full';
  content?: string;
};

export function PostCard({ 
  title, 
  date, 
  excerpt, 
  category = "Estratégias",
  readTime,
  views,
  likes,
  isFeature = false,
  trending = false,
  difficulty = 'medium',
  viewMode = 'summary',
  content = ''
}: PostCardProps) {
  
  // Função para formatar a data para o padrão brasileiro
  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const isFullView = viewMode === 'full';
  
  // Solução 2: normalizar (remover indentação comum) antes de enviar ao parser Markdown
  const stripIndent = React.useCallback((md: string) => {
    if (!md) return md;
    // Substitui tabs por 4 espaços para uniformizar
    const lines = md.replace(/\t/g, '    ').split(/\r?\n/);
    // Remove linhas vazias do início e do fim
    while (lines.length && lines[0].trim() === '') lines.shift();
    while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
    // Calcula menor indentação comum (>0) entre linhas não vazias
    const indents = lines
      .filter(l => l.trim().length)
      .map(l => {
        const m = l.match(/^ +/);
        return m ? m[0].length : 0;
      })
      .filter(n => n > 0);
    const min = indents.length ? Math.min(...indents) : 0;
    if (!min) return lines.join('\n');
    return lines.map(l => (l.startsWith(' '.repeat(min)) ? l.slice(min) : l)).join('\n');
  }, []);

  // CORREÇÃO: Melhor tratamento da conversão Markdown para HTML
  const sanitizedHtmlContent = React.useMemo(() => {
    if (!isFullView || !content) return '';
    
    try {
      const normalized = stripIndent(content);
      const htmlContent = marked.parse(normalized) as string;
      return DOMPurify.sanitize(htmlContent);
    } catch (error) {
      console.error('Erro ao processar markdown:', error);
      return DOMPurify.sanitize(`<p>${content}</p>`);
    }
  }, [isFullView, content, stripIndent]);

  // Log apenas em desenvolvimento e quando necessário
  React.useEffect(() => {
    if (isFullView && process.env.NODE_ENV === 'development') {
      console.log("Conteúdo Markdown Original:", content);
      console.log("HTML Convertido e Sanitizado:", sanitizedHtmlContent);
    }
  }, [isFullView, content, sanitizedHtmlContent]);
  
  // Dados mockados se não fornecidos. Derivados do título em vez de sorteados:
  // Math.random() no render dá um valor no SSR e outro na hidratação.
  const mockReadTime = readTime || seededInt(`${title}:readTime`, 3, 10);
  const mockViews = views || seededInt(`${title}:views`, 500, 2499);
  const mockLikes = likes || seededInt(`${title}:likes`, 20, 119);

  // Função para obter cor da dificuldade
  const getDifficultyConfig = (diff: string) => {
    const configs = {
      easy: { color: 'bg-green-100 text-green-700', label: 'Fácil', dots: 2 },
      medium: { color: 'bg-yellow-100 text-yellow-700', label: 'Médio', dots: 3 },
      hard: { color: 'bg-red-100 text-red-700', label: 'Avançado', dots: 4 }
    };
    return configs[diff as keyof typeof configs] || configs.medium;
  };

  const difficultyConfig = getDifficultyConfig(difficulty);

  return (
    <article className={`${!isFullView ? 'group' : ''} relative h-full flex flex-col overflow-hidden`}>
      {/* Card principal estilo macOS */}
      <div className={`
        relative h-full bg-white backdrop-blur-xl rounded-xl shadow-sm border border-gray-200 overflow-hidden
        ${!isFullView ? 'hover:shadow-md transition-all duration-300 hover:border-gray-300' : 'p-4 md:p-8'}
      `}>
        
        {/* Efeito sutil no hover estilo macOS */}
        {!isFullView && (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        )}
        
        {/* Header visual do card estilo macOS (apenas no modo summary) */}
        {!isFullView && (
          <div className="relative aspect-video bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 overflow-hidden border-b border-gray-200">
            {/* Pattern sutil de fundo */}
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.03) 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>

            {/* Ícone central minimalista */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-white backdrop-blur-md rounded-2xl flex items-center justify-center shadow-sm border border-gray-200 group-hover:scale-105 transition-transform duration-300">
                <BookOpen className="w-10 h-10 text-gray-700" strokeWidth={1.5} />
              </div>
            </div>

            {/* Badges de status estilo macOS */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              {trending && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/90 backdrop-blur-md text-white text-xs font-semibold rounded-md shadow-sm">
                  <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>TRENDING</span>
                </div>
              )}
              
              {isFeature && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/90 backdrop-blur-md text-white text-xs font-semibold rounded-md shadow-sm">
                  <Award className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>DESTAQUE</span>
                </div>
              )}
            </div>

            {/* Badge de categoria estilo macOS */}
            <div className="absolute top-3 right-3">
              <div className="px-3 py-1.5 bg-white backdrop-blur-md text-gray-700 text-xs font-semibold rounded-md shadow-sm border border-gray-200">
                {category}
              </div>
            </div>

            {/* Indicador de dificuldade estilo macOS */}
            <div className="absolute bottom-3 right-3">
              <div className="px-3 py-1.5 bg-white backdrop-blur-md text-gray-700 text-xs font-semibold rounded-md shadow-sm border border-gray-200 flex items-center gap-2">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div 
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${
                        i < difficultyConfig.dots 
                          ? 'bg-gray-600' 
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span>{difficultyConfig.label}</span>
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo do card estilo macOS */}
        <div className="relative z-10 flex-1 flex flex-col p-5 space-y-3">
          {/* Metadados minimalistas */}
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" strokeWidth={2} />
              <time dateTime={date}>{formattedDate}</time>
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" strokeWidth={2} />
              <span>{mockReadTime} min</span>
            </div>
          </div>
          
          {/* Título estilo macOS */}
          <h3 className={`font-semibold leading-tight text-gray-900 transition-colors duration-200 ${isFullView ? 'text-3xl md:text-5xl my-4' : 'text-base md:text-lg group-hover:text-gray-700 line-clamp-2'}`}>
            {title}
          </h3>
          
          {/* Renderização condicional: excerpt ou conteúdo completo */}
          {isFullView ? (
            <article
              className="prose prose-lg max-w-none prose-headings:font-semibold prose-p:text-gray-700"
              dangerouslySetInnerHTML={{ __html: sanitizedHtmlContent }}
            />
          ) : (
            <p className="flex-1 text-sm text-gray-700 leading-relaxed line-clamp-3 transition-colors duration-200">
              {excerpt}
            </p>
          )}

          {/* Estatísticas de engajamento estilo macOS */}
          <div className={`flex items-center justify-between pt-3 border-t border-gray-200/60 ${isFullView ? 'mt-8' : ''}`}>
            <div className="flex items-center gap-4 text-xs text-gray-700 font-medium">
              <div className="flex items-center gap-1.5 hover:text-gray-700 transition-colors cursor-pointer">
                <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{mockViews.toLocaleString('pt-BR')}</span>
              </div>
              
              <div className="flex items-center gap-1.5 hover:text-gray-700 transition-colors cursor-pointer">
                <ThumbsUp className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{mockLikes}</span>
              </div>
              
              <div className="flex items-center gap-1.5 hover:text-gray-700 transition-colors cursor-pointer">
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{Math.floor(mockLikes / 5)}</span>
              </div>
            </div>

            {/* Ação de leitura estilo macOS (apenas no modo summary) */}
            {!isFullView && (
              <div className="flex items-center gap-1.5 text-blue-600 text-sm font-medium group-hover:gap-2 transition-all duration-200 cursor-pointer">
                <span>Ler mais</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={2} />
              </div>
            )}
          </div>

          {/* Elementos extras estilo macOS (apenas no modo summary) */}
          {!isFullView && (
            <>
              {/* Barra de progresso minimalista */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                  <span>Popularidade</span>
                  <span>{Math.floor((mockLikes / 100) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200/60 rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${Math.min((mockLikes / 100) * 100, 100)}%`,
                      transform: 'translateX(-100%)',
                      animation: 'slideIn 1s ease-out 0.5s forwards'
                    }}
                  ></div>
                </div>
              </div>

              {/* Botões de ação rápida estilo macOS */}
              <div className="flex items-center justify-between pt-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <div className="flex items-center gap-1.5">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group/btn">
                    <Bookmark className="w-4 h-4 text-gray-500 group-hover/btn:text-gray-700" strokeWidth={2} />
                  </button>

                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 group/btn">
                    <ThumbsUp className="w-4 h-4 text-gray-500 group-hover/btn:text-gray-700" strokeWidth={2} />
                  </button>
                </div>

                {/* CTA estilo macOS */}
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all duration-200 shadow-sm">
                  <Target className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Praticar</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0%);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </article>
  );
}

export default PostCard;