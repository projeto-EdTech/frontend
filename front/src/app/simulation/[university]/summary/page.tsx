"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { universities } from "@/lib/dataUniversity"
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";
import 'katex/dist/katex.min.css' // Importa os estilos do KaTeX

interface SummaryData {
    university: string
    phase: string
    day: string
    totalQuestions: number
    timeSpent: number
    correctAnswers?: number
    wrongAnswers?: number
}

export default function SummaryPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const examYear = searchParams.get('year');
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null)
    const [errosQuestoes, setErrosQuestoes] = useState<{
        numero: number,
        enunciado: string,
        alternativaCorreta: string,
        alternativaEscolhida: string,
        tempoGasto: number,
        materia: string,
        conteudo: string,
        indiceAlternativaEscolhida: number | null,
        indiceAlternativaCorreta: number,
    }[]>([])
    const [currentPage, setCurrentPage] = useState(1);

    // Crie a referência para a seção de erros e um controle para o primeiro carregamento
    const errosSectionRef = useRef<HTMLDivElement>(null);
    const isInitialMount = useRef(true);

    useEffect(() => {
        // Recuperar dados do sessionStorage
        const data = sessionStorage.getItem('simulationSummary')
        if (data) {
            const parsedData = JSON.parse(data)
            setSummaryData(parsedData)
        } else {
            router.push('/')
        }
        
        // Recuperar erros detalhados
        const erros = sessionStorage.getItem('simulationErrors')
        if (erros) {
            try {
                const errosParseados = JSON.parse(erros)
                setErrosQuestoes(errosParseados)
            } catch (error) {
                console.error('Erro ao parsear erros:', error)
            }
        }
    }, [router])

    useEffect(() => {
        // Verifica se os dados do sumário já foram carregados
        if (summaryData) {
            // Cria um novo objeto de áudio
            const fanfareSound = new Audio('/fanfare-trumpets.mp3');
            fanfareSound.volume = 0.7; // Opcional: ajuste o volume (de 0.0 a 1.0)
            
            // Toca o som e captura possíveis erros (políticas de autoplay do navegador)
            fanfareSound.play().catch(error => {
                console.error("Erro ao tocar o som de fanfarra:", error);
            });
        }
    }, [summaryData]); // Este efeito depende do 'summaryData'. Ele roda quando o estado muda de null para os dados carregados.
    // --- FIM DO NOVO CÓDIGO ---

    // Adicione o useEffect para observar mudanças em 'currentPage' e fazer o scroll
    useEffect(() => {
        // Impede o scroll no carregamento inicial da página
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        // Se a referência existir, role suavemente para o início da seção
        if (errosSectionRef.current) {
            errosSectionRef.current.scrollIntoView({
                behavior: 'smooth', // Animação de rolagem suave
                block: 'start',     // Alinha o topo da seção com o topo da tela
            });
        }
    }, [currentPage]); // A mágica acontece aqui: o efeito roda sempre que 'currentPage' muda

    const currentUniversity = useMemo(() => {
        if (!summaryData) return null;

        // A busca agora é feita no array 'universities' importado, usando o 'slug'
        return universities.find(u => u.slug === summaryData.university) || { name: "Unknown", year: "2023", logo: "/placeholder.svg" };
    }, [summaryData])

    // Memoizar função de formatação de tempo
    const formatTimeSpent = useCallback((seconds: number) => {
        if (seconds < 3600) {
            const mins = Math.floor(seconds / 60)
            const secs = seconds % 60
            return `${mins}:${secs.toString().padStart(2, "0")} min`
        } else {
            const totalMinutes = Math.floor(seconds / 60)
            const hours = Math.floor(totalMinutes / 60)
            const mins = totalMinutes % 60
            return `${hours}:${mins.toString().padStart(2, "0")} h`
        }
    }, [])

    // Memoizar cálculos de estatísticas
    const statistics = useMemo(() => {
        if (!summaryData) return null
        
        const correctAnswers = summaryData.correctAnswers || 0
        const wrongAnswers = summaryData.wrongAnswers || 0
        const totalQuestions = summaryData.totalQuestions
        const successRate = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
        const avgTimePerQuestion = Math.floor(summaryData.timeSpent / totalQuestions)
        const formattedTotalTime = formatTimeSpent(summaryData.timeSpent)
        const formattedAvgTime = formatTimeSpent(avgTimePerQuestion)
        
        return {
            correctAnswers,
            wrongAnswers,
            totalQuestions,
            successRate,
            avgTimePerQuestion,
            formattedTotalTime,
            formattedAvgTime
        }
    }, [summaryData, formatTimeSpent])

    // Display phase and day information
    const phaseDisplay = summaryData ? (summaryData.phase === "fase1" ? "1ª Fase" : `1ª Fase - Dia ${summaryData.day}`) : ""
    const indexToLetter = (index: number | null) => {
    if (index === null || index < 0) return '';
    return String.fromCharCode(65 + index); // 65 é o código ASCII para 'A'
};

    const QUESTIONS_PER_PAGE = 10;
    const { paginatedErros, totalPages } = useMemo(() => {
        console.log('Total de erros recebidos:', errosQuestoes.length);
        const totalPages = Math.ceil(errosQuestoes.length / QUESTIONS_PER_PAGE);
        const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
        const endIndex = startIndex + QUESTIONS_PER_PAGE;
        console.log(`Página: ${currentPage}, Start: ${startIndex}, End: ${endIndex}`);
        const paginatedErros = errosQuestoes.slice(startIndex, endIndex);
        console.log('Erros paginados calculados:', paginatedErros.length);
        return { paginatedErros, totalPages };
    }, [currentPage, errosQuestoes]);

    if (!summaryData || !currentUniversity) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                    <p className="mt-6 text-gray-600 font-medium">Carregando seu resultado...</p>
                </div>
            </div>
        )
    }

    return (
    <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
                
                {/* Header do Sumário */}
                <div className="card-container relative overflow-hidden">
                    {/* Background Pattern Melhorado */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500"></div>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]"></div>
                    </div>

                    {/* Mascote Comemorando - Canto Superior Direito */}
                    <div className="absolute top-4 right-4 md:top-6 md:right-6 z-10 hidden sm:block">
                        <Image 
                            src="/Mascote/banners/Camaleão_1.png" 
                            alt="Mascote Vestibuline comemorando" 
                            width={140}
                            height={140}
                            className="w-24 h-24 md:w-32 md:h-32 lg:w-36 lg:h-36 object-contain drop-shadow-2xl animate-bounce"
                        />
                    </div>

                    <div className="relative text-center">
                        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-8">
                            {/* Logo da universidade com efeito especial */}
                            <div className="relative group">
                                <div className="relative w-24 h-24 flex items-center justify-center bg-white rounded-3xl shadow-2xl group-hover:scale-105 transition-transform duration-300">
                                    <img src={currentUniversity.logo} alt={currentUniversity.name} width={64} height={64} className="object-contain rounded-2xl" loading="lazy" />
                                </div>
                                {/* Badge de conquista */}
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                </div>
                            </div>
                            
                            <div className="text-center md:text-left">
                                {/* Título principal com gradiente */}
                                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 leading-tight">
                                    Simulado Concluído com Sucesso
                                </h1>
                                <p className="text-lg text-gray-600 font-medium">
                                    {currentUniversity.name} {examYear} • {phaseDisplay}
                                </p>
                            </div>
                        </div>
                        
                        {/* Badge de conquista melhorado */}
                        <div className="inline-flex items-center gap-4 bg-gradient-to-r from-green-500 to-emerald-600 text-green-800 px-8 py-4 rounded-3xl font-bold text-lg border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
                            {/* Ícone animado */}
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-green-100 font-bold">Missão Cumprida!</p>
                                <p className="text-green-100 text-sm">Você demonstrou dedicação e foco</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Estatísticas do Simulado - Mobile Optimized */}
                <div className="card-container relative">
                    
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">📊 Resumo do Simulado</h2>
                    
                    {/* Mobile: Grid 2x3, Desktop: Grid 1x5 */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
                        {/* Total de Questões */}
                        <div className="stat-card stat-card-blue group hover:scale-105 hover:shadow-lg relative overflow-hidden">
                            {/* Mascote melhor posicionado e mais visível */}
                            <div className="absolute -bottom-2 -right-2 opacity-50 group-hover:opacity-70 transition-all duration-300 group-hover:scale-110">
                                <Image 
                                    src="/Mascote/banners/Camaleão_5.png" 
                                    alt="Mascote" 
                                    width={90}
                                    height={90}
                                    className="w-20 h-20 md:w-[90px] md:h-[90px] object-contain drop-shadow-xl"
                                />
                            </div>
                            <div className="stat-icon stat-icon-blue group-hover:rotate-6 transition-transform duration-300">
                                <svg className="w-4 md:w-6 h-4 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-2xl font-bold text-blue-900 mb-1 relative z-10">{statistics?.totalQuestions}</h3>
                            <p className="text-blue-700 font-semibold text-xs md:text-sm relative z-10">Total de Questões</p>
                        </div>

                        {/* Respostas Corretas */}
                        <div className="stat-card stat-card-green group hover:scale-105 hover:shadow-lg relative overflow-hidden">
                            {/* Mascote feliz - mais visível e melhor posicionado */}
                            <div className="absolute -bottom-2 -right-2 opacity-50 group-hover:opacity-70 transition-all duration-300 group-hover:scale-110">
                                <Image 
                                    src="/Mascote/banners/Camaleão_2.png" 
                                    alt="Mascote feliz" 
                                    width={90}
                                    height={90}
                                    className="w-20 h-20 md:w-[90px] md:h-[90px] object-contain drop-shadow-xl"
                                />
                            </div>
                            <div className="stat-icon stat-icon-green group-hover:rotate-6 transition-transform duration-300">
                                <svg className="w-4 md:w-6 h-4 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-2xl font-bold text-green-900 mb-1 relative z-10">{statistics?.correctAnswers}</h3>
                            <p className="text-green-700 font-semibold text-xs md:text-sm relative z-10">Respostas Corretas</p>
                        </div>

                        {/* Respostas Incorretas */}
                        <div className="stat-card stat-card-red group hover:scale-105 hover:shadow-lg relative overflow-hidden">
                            {/* Mascote triste - melhor visibilidade */}
                            <div className="absolute -bottom-2 -right-2 opacity-50 group-hover:opacity-70 transition-all duration-300 group-hover:scale-110">
                                <Image 
                                    src="/Mascote/banners/Camaleão_triste/Camaleão_1.png" 
                                    alt="Mascote triste" 
                                    width={90}
                                    height={90}
                                    className="w-20 h-20 md:w-[90px] md:h-[90px] object-contain drop-shadow-xl"
                                />
                            </div>
                            <div className="stat-icon stat-icon-red group-hover:rotate-6 transition-transform duration-300">
                                <svg className="w-4 md:w-6 h-4 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-2xl font-bold text-red-900 mb-1 relative z-10">{statistics?.wrongAnswers}</h3>
                            <p className="text-red-700 font-semibold text-xs md:text-sm relative z-10">Respostas Incorretas</p>
                        </div>

                        {/* Tempo Gasto */}
                        <div className="stat-card stat-card-purple group hover:scale-105 hover:shadow-lg relative overflow-hidden">
                            {/* Mascote com melhor posicionamento */}
                            <div className="absolute -bottom-2 -right-2 opacity-50 group-hover:opacity-70 transition-all duration-300 group-hover:scale-110">
                                <Image 
                                    src="/Mascote/banners/Camaleão_9.png" 
                                    alt="Mascote" 
                                    width={90}
                                    height={90}
                                    className="w-20 h-20 md:w-[90px] md:h-[90px] object-contain drop-shadow-xl"
                                />
                            </div>
                            <div className="stat-icon stat-icon-purple group-hover:rotate-6 transition-transform duration-300">
                                <svg className="w-4 md:w-6 h-4 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-sm md:text-xl font-bold text-purple-900 mb-1 relative z-10">{statistics?.formattedTotalTime}</h3>
                            <p className="text-purple-700 font-semibold text-xs md:text-sm relative z-10">Tempo Utilizado</p>
                        </div>

                        {/* Porcentagem de Acertos - Mobile: col-span-2 para centralizar */}
                        <div className="stat-card stat-card-orange group hover:scale-105 hover:shadow-lg col-span-2 md:col-span-1 relative overflow-hidden">
                            {/* Mascote comemorando - maior destaque */}
                            <div className="absolute -bottom-2 -right-2 opacity-50 group-hover:opacity-70 transition-all duration-300 group-hover:scale-110">
                                <Image 
                                    src="/Mascote/banners/Camaleão_1.png" 
                                    alt="Mascote comemorando" 
                                    width={90}
                                    height={90}
                                    className="w-20 h-20 md:w-[90px] md:h-[90px] object-contain drop-shadow-xl"
                                />
                            </div>
                            <div className="stat-icon stat-icon-orange group-hover:rotate-6 transition-transform duration-300">
                                <svg className="w-4 md:w-6 h-4 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-lg md:text-2xl font-bold text-orange-900 mb-1 relative z-10">{statistics?.successRate}%</h3>
                            <p className="text-orange-700 font-semibold text-xs md:text-sm relative z-10">Taxa de Acerto</p>
                        </div>
                    </div>
                </div>

                {/* Tabela de Detalhes - Responsive */}
                <div className="card-container">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center">📋 Detalhes do Simulado</h2>
                    
                    {/* Mobile: Cards, Desktop: Table */}
                    <div className="md:hidden space-y-3">
                        {/* Cards para Mobile */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium text-sm">Vestibular</span>
                                <span className="text-gray-900 font-bold">{currentUniversity.name}</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium text-sm">Ano</span>
                                <span className="text-gray-900 font-bold">{examYear}</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium text-sm">Fase e dia</span>
                                <span className="text-gray-900 font-bold">{phaseDisplay}</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium text-sm">Total de Questões</span>
                                <span className="text-gray-900 font-bold">{statistics?.totalQuestions} questões</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium text-sm">Respostas Corretas</span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                    <span className="text-gray-900 font-bold">{statistics?.correctAnswers} questões</span>
                                </span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium text-sm">Respostas Incorretas</span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                    <span className="text-gray-900 font-bold">{statistics?.wrongAnswers} questões</span>
                                </span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium text-sm">Taxa de Acerto</span>
                                <span className="font-bold text-lg text-orange-600">{statistics?.successRate}%</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium text-sm">Tempo Total</span>
                                <span className="text-gray-900 font-bold">{statistics?.formattedTotalTime}</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium text-sm">Tempo Médio/Questão</span>
                                <span className="text-gray-900 font-bold">{statistics?.formattedAvgTime}</span>
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 font-medium text-sm">Data de Realização</span>
                                <span className="text-gray-900 font-bold">{new Date().toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop: Tabela original */}
                    <div className="hidden md:block overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-4 px-6 font-bold text-gray-900 text-lg">Informação</th>
                                    <th className="text-left py-4 px-6 font-bold text-gray-900 text-lg">Dados</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6 text-gray-700 font-semibold">Vestibular</td>
                                    <td className="py-4 px-6 text-gray-900 font-semibold">{currentUniversity.name}</td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6 text-gray-700 font-semibold">Ano da prova</td>
                                    <td className="py-4 px-6 text-gray-900 font-semibold">{examYear}</td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6 text-gray-700 font-semibold">Fase e dia</td>
                                    <td className="py-4 px-6 text-gray-900 font-semibold">{phaseDisplay}</td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6 text-gray-700 font-semibold">Total de Questões</td>
                                    <td className="py-4 px-6 text-gray-900 font-semibold">{statistics?.totalQuestions} questões</td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6 text-gray-700 font-semibold">Respostas Corretas</td>
                                    <td className="py-4 px-6 text-gray-900 font-semibold">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                            {statistics?.correctAnswers} questões
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6 text-gray-700 font-semibold">Respostas Incorretas</td>
                                    <td className="py-4 px-6 text-gray-900 font-semibold">
                                        <span className="inline-flex items-center gap-2">
                                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                            {statistics?.wrongAnswers} questões
                                        </span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6 text-gray-700 font-semibold">Taxa de Acerto</td>
                                    <td className="py-4 px-6 text-gray-900">
                                        <span className="font-bold text-xl text-orange-600">{statistics?.successRate}%</span>
                                    </td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6 text-gray-700 font-semibold">Tempo Total Utilizado</td>
                                    <td className="py-4 px-6 text-gray-900 font-semibold">{statistics?.formattedTotalTime}</td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6 text-gray-700 font-semibold">Tempo Médio por Questão</td>
                                    <td className="py-4 px-6 text-gray-900 font-semibold">{statistics?.formattedAvgTime}</td>
                                </tr>
                                <tr className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="py-4 px-6 text-gray-700 font-semibold">Data de Realização</td>
                                    <td className="py-4 px-6 text-gray-900 font-semibold">{new Date().toLocaleDateString('pt-BR')}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Análise de Erros - Mobile Optimized */}
                <div className="card-container relative" ref={errosSectionRef}>
                    {/* Mascote Pensativo - Canto Superior Direito */}
                    {errosQuestoes.length > 0 && (
                        <div className="absolute top-4 right-4 z-10 hidden md:block">
                            <Image 
                                src="/Mascote/banners/Camaleão_Confuso/Camaleão_1.png" 
                                alt="Mascote Vestibuline pensativo" 
                                width={100}
                                height={100}
                                className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain drop-shadow-2xl"
                            />
                        </div>
                    )}
                    
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 md:mb-8 text-center flex items-center justify-center gap-3">
                        <div className="w-8 md:w-10 h-8 md:h-10 bg-red-500 rounded-xl flex items-center justify-center">
                            <svg className="w-4 md:w-6 h-4 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        Análise de Erros
                    </h2>

                    {errosQuestoes.length > 0 ? (
                        <>
                            {/* Resumo dos erros em cards - mobile: stack vertical */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
                                {/* Card de resumo */}
                                <div className="bg-gradient-to-r from-red-500 to-red-600 border-2 border-red-800 rounded-2xl p-4 md:p-6 shadow-lg">
                                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                        <div className="w-10 md:w-12 h-10 md:h-12 bg-red-400 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 md:w-6 h-5 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-base md:text-lg font-bold text-red-100">Questões Erradas</h3>
                                            <p className="text-xl md:text-2xl font-extrabold text-red-100">{statistics?.wrongAnswers}</p>
                                        </div>
                                    </div>
                                    <p className="text-red-100 text-xs md:text-sm font-medium">
                                        Questões que necessitam revisão
                                    </p>
                                </div>

                                {/* Card de dicas */}
                                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 border-2 border-blue-800 rounded-2xl p-4 md:p-6 shadow-lg">
                                    <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                                        <div className="w-10 md:w-12 h-10 md:h-12 bg-blue-400 rounded-xl flex items-center justify-center">
                                            <svg className="w-5 md:w-6 h-5 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-base md:text-lg font-bold text-blue-100">Dica de Estudo</h3>
                                            <p className="text-blue-100 text-xs md:text-sm font-medium">Foque nos tópicos em que errou</p>
                                        </div>
                                    </div>
                                    <p className="text-blue-100 text-xs md:text-sm">
                                        Revise os conteúdos das questões erradas para identificar padrões e fortalecer seu conhecimento.
                                    </p>
                                </div>
                            </div>

                            {/* Lista detalhada de erros - só mostrar se houver dados detalhados */}
                            {errosQuestoes.length > 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                                    <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Questões para Revisar
                                        </h3>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {paginatedErros.slice(0, QUESTIONS_PER_PAGE).map((erro, idx) => (
                                            <div key={erro.numero ?? idx} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <span className="text-red-600 font-bold text-sm">{erro.numero}</span>
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div>
                                                            <h4 className="font-bold text-gray-900 text-lg mb-2">Questão {erro.numero}</h4>
                                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{erro.enunciado}</ReactMarkdown>
                                                        </div>

                                                    {/* Sua resposta (se houver e não for "Não respondida") */}
                                                    {erro.alternativaEscolhida && erro.alternativaEscolhida !== "Não respondida" && (
                                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                                                                </svg>
                                                                <span className="text-red-800 font-semibold text-sm">Sua Resposta: {indexToLetter(erro.indiceAlternativaEscolhida)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-red-800 font-medium">{erro.alternativaEscolhida}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Questão não respondida */}
                                                    {erro.alternativaEscolhida === "Não respondida" && (
                                                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <p className="text-gray-800 font-semibold text-sm">Status:</p>
                                                            </div>
                                                            <p className="text-gray-800 font-bold">Questão não respondida</p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Resposta correta */}
                                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span className="text-green-800 font-semibold text-sm">Resposta Correta: {indexToLetter(erro.indiceAlternativaCorreta)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-green-800 font-medium">{erro.alternativaCorreta}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Tempo gasto (se disponível) */}
                                                    {erro.tempoGasto != null && (
                                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span className="text-blue-800 font-semibold text-sm">Tempo Gasto:</span>
                                                            </div>
                                                            <span className="text-blue-800 font-bold">
                                                              {erro.tempoGasto < 60
                                                                ? "menos que 1 minuto"
                                                                : formatTimeSpent(erro.tempoGasto)}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {erro.materia && erro.conteudo && (
                                                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                                                </svg>
                                                                <span className="text-purple-800 font-semibold text-sm">Tópico da Questão:</span>
                                                            </div>
                                                            <span className="text-purple-800 font-bold">{erro.materia} - {erro.conteudo}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    </div>

                                    {totalPages > 1 && (
                                        <div className="flex justify-between items-center p-4 bg-white rounded-b-lg border-t border-gray-500">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                disabled={currentPage === 1}
                                                className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                Anterior
                                            </button>
                                            <span className="text-sm font-semibold text-black">
                                                Página {currentPage} de {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                disabled={currentPage === totalPages}
                                                className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                Próxima
                                            </button>
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-8 text-center shadow-lg">
                                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-orange-900 mb-2">Questões para Revisar</h3>
                                    <p className="text-orange-700 font-medium">
                                        Você teve {statistics?.wrongAnswers} {statistics?.wrongAnswers === 1 ? 'erro' : 'erros'} neste simulado.
                                    </p>
                                    <p className="text-orange-600 text-sm mt-2">
                                        Os detalhes das questões não estão disponíveis no momento.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-green-400 border-2 border-green-500 rounded-2xl p-8 text-center shadow-lg relative">
                            {/* Mascote Feliz para Perfeição - maior e mais visível */}
                            <div className="flex justify-center mb-4">
                                <Image 
                                    src="/Mascote/banners/Camaleão_2.png" 
                                    alt="Mascote Vestibuline feliz" 
                                    width={180}
                                    height={180}
                                    className="w-36 h-36 md:w-44 md:h-44 lg:w-48 lg:h-48 object-contain drop-shadow-2xl"
                                />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">Perfeito!</h3>
                            <p className="text-gray-800 font-medium">
                                Parabéns! Você não errou nenhuma questão neste simulado. 🎉
                            </p>
                        </div>
                    )}
                </div>

                {/* Botões de Ação - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4 md:px-0 items-center">
                    {/* Mascote Motivacional - maior e melhor */}
                    <div className="hidden lg:block">
                        <Image 
                            src="/Mascote/banners/Camaleão_4.png" 
                            alt="Mascote Vestibuline motivacional" 
                            width={140}
                            height={140}
                            className="w-32 h-32 lg:w-36 lg:h-36 object-contain drop-shadow-2xl"
                        />
                    </div>
                    
                    <button
                        onClick={() => router.push('/')}
                        className="action-button action-button-blue group relative transform hover:scale-105 hover:shadow-xl w-full sm:w-auto"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Voltar ao Início
                        </span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </button>
                    
                    <button
                        onClick={() => router.push(`/library`)}
                        className="action-button action-button-green group relative transform hover:scale-105 hover:shadow-xl w-full sm:w-auto"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            <svg className="w-4 md:w-5 h-4 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Fazer Outro Simulado
                        </span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </button>
                </div>
            </div>
        </div>
        
        {/* Footer */}
        <Footer />
    </div>
    )
}