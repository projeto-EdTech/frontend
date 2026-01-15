"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react"; // 1. Importa o hook para gerenciar a sessão
import Header from "@/components/Header"
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import Footer from "@/components/Footer";
import Gemini from "@/components/Simula_PRO/Questoes_Gemini";
import Planner from '@/components/Simula_PRO/Planner/Planner';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { universities } from "@/lib/dataUniversity";
import { mockRankingsByUniversity, type RawUserData } from "@/lib/DataRanking";
import GeneralStats, { SkeletonCard, type ProfileStats } from "@/components/profile/GeneralStats";
import StatsUser from "@/components/profile/StatsUser";
import UserRanking, { UserRankingData } from "@/components/profile/UserRanking";
import SimulationHistoric from "@/components/profile/SimulationHistoric";
import NavigationBar from "@/components/profile/NavigationBar";
import NotaCorteConsulta from "@/components/Simula_PRO/NotaCorteConsulta";
import UserConfig from "@/components/profile/UserConfig";

// --- TIPAGENS PARA RANKING ---
// Removido UserRanking type duplicado, usando UserRankingData importado

// Componente Card Estatística (Sem alterações)
// REMOVIDO: StatCardProps, StatTrend, ProfileStats, StatCard, StatusBadge, SkeletonCard
// Essas interfaces e componentes foram movidos para GeneralStats.tsx

interface RecentExam {
  name: string;
  date: string;
  score: number;
}

interface SubjectPerformance {
  subject: string;
  percentage: number;
  icon: string;
}

interface MonthlyProgressPoint {
  label: string;
  value: number;
}

interface ReviewableQuestion {
  id: string;
  enunciado: string;
  suaResposta: string;
  gabarito: string;
  displayLabel: string;
  displaySubject: string;
}

// Interface principal que une todas as outras
interface ProfileData {
  stats: ProfileStats;
  recentExams: RecentExam[];
  subjectPerformance: SubjectPerformance[];
  monthlyProgress: MonthlyProgressPoint[];
  reviewableQuestions: ReviewableQuestion[];
}

const initialProfileData: ProfileData = {
    stats: { 
      simulados: 0, 
      questoes: 0, 
      acertos: 0, 
      percentagem: 0,
      trend_simulados: { value: 0, type: 'up'},
      trend_questoes: { value: 0, type: 'up'},
      trend_acertos: { value: 0, type: 'up'},
      trend_percentagem: { value: 0, type: 'up'},
    },
    recentExams: [],
    subjectPerformance: [],
    monthlyProgress: [],
    reviewableQuestions: [],
};

// Função para determinar o rank baseado na pontuação
const determineRank = (score: number): UserRankingData['rank'] => {
  if (score >= 5000) return 'Diamante';
  if (score >= 2500) return 'Ouro';
  if (score >= 1000) return 'Prata';
  return 'Bronze';
};

// Função para buscar dados do ranking do usuário logado
const getCurrentUserRanking = (userName: string): UserRankingData | null => {
  try {
    // Busca no ranking geral mensal
    const generalRanking = mockRankingsByUniversity['geral']?.mensal || [];
    
    // Encontra o usuário pela comparação do nome
    const userIndex = generalRanking.findIndex((user: RawUserData) => 
      user.usuario.toLowerCase() === userName.toLowerCase()
    );
    
    if (userIndex === -1) return null;
    
    const userData = generalRanking[userIndex];
    const rank = determineRank(userData.pontos);
    
    return {
      position: userIndex + 1, // Posição é o índice + 1
      name: userData.usuario,
      score: userData.pontos,
      rank: rank,
      isCurrentUser: true
    };
  } catch (error) {
    console.error('Erro ao buscar dados do ranking:', error);
    return null;
  }
};

export default function ProfilePage() {
  // 2. Chama o hook para obter os dados da sessão e o status de autenticação
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [explanation, setExplanation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(initialProfileData); // <- Sem <any>
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupedQuestions, setGroupedQuestions] = useState<Map<string, ReviewableQuestion[]>>(new Map());
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
  // Estados para dados do ranking
  const [rankingData, setRankingData] = useState<UserRankingData | null>(null);
  const [isLoadingRanking, setIsLoadingRanking] = useState(true);
  const currentUniversityLogo = useMemo(() => {
    const currentGroup = groupedQuestions.get(selectedSubject);
    const currentQuestion = currentGroup ? currentGroup[currentQuestionIndex] : null;

    if (!currentQuestion) {
      return null;
    }

    const universityName = currentQuestion.displayLabel.split(' ')[0].toLowerCase();
    const universityData = universities.find(u => u.slug.toLowerCase() === universityName);
    
    return universityData ? universityData.logo : null;
  }, [groupedQuestions, selectedSubject, currentQuestionIndex]);

  useEffect(() => {
    if (status === 'authenticated') {
    const fetchProfileData = async () => {
        setIsDataLoading(true);
        setIsLoadingRanking(true);
        setError(null);

        try {
          // Buscar apenas dados do perfil da API
          const profileResponse = await fetch('/api/user/stats');

        if (!profileResponse.ok) {
            throw new Error('Falha ao carregar os dados do perfil.');
        }

        const profileData = await profileResponse.json();
        setProfileData(profileData);

        // Buscar dados do ranking usando os dados mockados do DataRanking.ts
        if (session?.user?.name) {
          const currentUserRanking = getCurrentUserRanking(session.user.name);
          setRankingData(currentUserRanking);
        }

        if (profileData.reviewableQuestions && profileData.reviewableQuestions.length > 0) {
          const groups = profileData.reviewableQuestions.reduce((acc: Map<string, ReviewableQuestion[]>, question: ReviewableQuestion) => {
            const subject = question.displaySubject;
            if (!acc.has(subject)) {
              acc.set(subject, []);
            }
            acc.get(subject)!.push(question);
            return acc;
          }, new Map<string, ReviewableQuestion[]>());

          setGroupedQuestions(groups);

          const firstSubject = Array.from(groups.keys())[0] || "";

          setSelectedSubject(firstSubject as string);
        }

        } catch (err: unknown) {
        console.error("Erro ao buscar dados do perfil:", err);
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError("Ocorreu um erro desconhecido.");
          }
        } finally {
          setIsDataLoading(false);
          setIsLoadingRanking(false);
        }
    };

    fetchProfileData();
    }
}, [status, session?.user?.name]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    institution: "",
    targetExam: "",
    targetCourse: "",
    profileIcon: "Avatar/Camaleão_1.png",
    useInitialAvatar: true, // true = usa inicial (PADRÃO), false = usa mascote
  });
  
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
          ...prev,
          fullName: session.user?.name ?? '',
          email: session.user?.email ?? '',
      }));
    }
  }, [session]);

  // useEffect para carregar configurações salvas do sessionStorage
  useEffect(() => {
    try {
      const savedSettings = sessionStorage.getItem('userProfileSettings');
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setFormData(prev => ({
          ...prev,
          profileIcon: settings.profileIcon || "Avatar/Camaleão_1.png",
          useInitialAvatar: settings.useInitialAvatar ?? true,
          institution: settings.institution || prev.institution,
          targetExam: settings.targetExam || prev.targetExam,
          targetCourse: settings.targetCourse || prev.targetCourse,
        }));
        
        console.log('Configurações carregadas do sessionStorage:', settings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do sessionStorage:', error);
    }
  }, []); // Executa apenas uma vez ao montar o componente

  useEffect(() => {
    const { targetExam, targetCourse } = formData;

    // 1. Se os campos estiverem vazios, reseta o estado da meta
    if (!targetExam || !targetCourse) {
      // setMetaAlvo(null);
      // setMetaLabel("");
      // setIsMetaLoading(false);
      return; // Para a execução
    }

    // 2. Define o estado de carregamento
    // setIsMetaLoading(true);

    // 3. Lógica de "Debounce":
    // Espera 1 segundo (1000ms) após o usuário parar de digitar
    const handler = setTimeout(() => {
      
      const fetchCutoff = async () => {
        try {
          const response = await fetch('/api/Nota-corte', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ targetExam, targetCourse }),
          });

          if (!response.ok) {
            throw new Error('Falha ao buscar nota de corte');
          }

          // Espera-se { cutoffScore: 82 | null }
          // const data = await response.json(); 
          await response.json(); // Consumindo a resposta para evitar erro de variável não usada, se necessário futuramente descomentar
          
          // 4. Atualiza o estado com o resultado da API
          // setMetaAlvo(data.cutoffScore); // Será um número (ex: 82) ou null
          
          // Cria um rótulo amigável (ex: "FUVEST - Medicina")
          // setMetaLabel(`${targetExam.trim()} - ${targetCourse.trim()}`);
          
        } catch (error) {
          console.error("Erro ao buscar meta de corte:", error);
          // setMetaAlvo(null); // Reseta em caso de erro
          // setMetaLabel("");
        } finally {
          // 5. Para o carregamento, independente de sucesso ou falha
          // setIsMetaLoading(false);
        }
      };

      fetchCutoff();

    }, 1000); // 1000ms = 1 segundo de espera

    // Função de "limpeza":
    // Se o usuário digitar novamente antes de 1s, o timeout anterior é cancelado.
    return () => {
      clearTimeout(handler);
    };
  }, [formData]); // Dependências: monitora o objeto formData completo ou os campos específicos se preferir, mas o linter pediu formData

  // Função para salvar o perfil no sessionStorage
  const handleSaveProfile = () => {
    try {
      // Salva os dados do perfil no sessionStorage
      const profileSettings = {
        profileIcon: formData.profileIcon,
        useInitialAvatar: formData.useInitialAvatar,
        institution: formData.institution,
        targetExam: formData.targetExam,
        targetCourse: formData.targetCourse,
      };
      
      sessionStorage.setItem('userProfileSettings', JSON.stringify(profileSettings));
      
      // Dispara evento customizado para notificar outros componentes (como o Header)
      const event = new CustomEvent('profileSettingsUpdated', { 
        detail: profileSettings 
      });
      window.dispatchEvent(event);
      
      // Feedback visual de sucesso (você pode adicionar um toast/notificação aqui)
      alert('Configurações salvas com sucesso!');
      
      console.log('Perfil salvo no sessionStorage:', profileSettings);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações. Tente novamente.');
    }
  };

  // Função para cancelar e restaurar os dados originais
  const handleCancelProfile = () => {
    try {
      // Restaura os dados do sessionStorage ou volta aos valores iniciais
      const savedSettings = sessionStorage.getItem('userProfileSettings');
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setFormData(prev => ({
          ...prev,
          profileIcon: settings.profileIcon || "Avatar/Camaleão_1.png",
          useInitialAvatar: settings.useInitialAvatar ?? true,
          institution: settings.institution || "",
          targetExam: settings.targetExam || "",
          targetCourse: settings.targetCourse || "",
        }));
      } else {
        // Se não houver dados salvos, volta aos valores padrão
        setFormData(prev => ({
          ...prev,
          institution: "",
          targetExam: "",
          targetCourse: "",
          profileIcon: "Avatar/Camaleão_1.png",
          useInitialAvatar: true,
        }));
      }
      
      console.log('Alterações canceladas');
    } catch (error) {
      console.error('Erro ao cancelar alterações:', error);
    }
  };

  const handleSubmit = async () => {
    const currentGroup = groupedQuestions.get(selectedSubject);
    const questionToSubmit = currentGroup ? currentGroup[currentQuestionIndex] : null;

    if (!questionToSubmit) {
        console.error("Nenhuma questão selecionada para gerar explicação.");
        return;
    }

    setIsGenerating(true);
    setExplanation('');

    try {
        const response = await fetch('/api/generate-explanation', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ 
                enunciado: questionToSubmit.enunciado, 
                gabarito: questionToSubmit.gabarito 
            }) 
        });

    if (!response.ok || !response.body) {
      throw new Error('A resposta da rede não foi bem-sucedida ou não continha um corpo.');
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      setExplanation((prev) => prev + chunk);
    }
    
  } catch (error) {
    console.error('Erro ao buscar explicação:', error);
    setExplanation('Ocorreu um erro ao gerar a explicação. Tente novamente.');
  } finally {
    setIsGenerating(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header />

      <div className="container mx-auto px-4 py-8 relative z-10 max-w-7xl">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                    Seu Perfil
                  </h1>
                  <p className="text-base text-gray-600">
                    Acompanhe seu progresso e gerencie suas configurações
                  </p>
                </div>
              </div>
            </div>
            
            <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className="mb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="profile" className="mt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Estatísticas Gerais */}
                  <GeneralStats 
                    session={session}
                    status={status}
                    formData={formData}
                    profileData={profileData}
                    isDataLoading={isDataLoading}
                    error={error}
                    setActiveTab={setActiveTab}
                  />
                  {/* Card de Ranking - Destaque Principal */}
                  {!isDataLoading && !error && (
                    <div className="mb-8">
                      <UserRanking rankingData={rankingData} isLoading={isLoadingRanking} />
                    </div>
                  )}
                </TabsContent>

                {/* Simulados Tab Content */}
                <TabsContent value="simulados" className="mt-6">
                  <SimulationHistoric recentExams={profileData.recentExams} />
                </TabsContent>

                {/* Estatisticas Tab Content */}
                <TabsContent value="estatisticas" className="mt-6">
                  {/* Estatisticas Tab Content - AGORA USANDO O NOVO COMPONENTE */}
                  <StatsUser 
                    stats={profileData.stats}
                    subjectPerformance={profileData.subjectPerformance}
                    monthlyProgress={profileData.monthlyProgress}
                  />
                </TabsContent>

                <TabsContent value="planner" className="mt-6">
                  {/* O container abaixo ajuda a dar o fundo escuro */}
                  <div className="backdrop-blur-md">
                      <DndProvider backend={HTML5Backend}>
                        <Planner />
                      </DndProvider>
                  </div>
                </TabsContent>

                {/* Configuracoes Tab Content */}
                <TabsContent value="configuracoes" className="mt-6">
                  <UserConfig 
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSaveProfile}
                    onCancel={handleCancelProfile}
                  />
                </TabsContent>
                <TabsContent value="questoesNaoResolvidas" className="mt-6">
                  <Gemini
                    groupedQuestions={groupedQuestions}
                    selectedSubject={selectedSubject}
                    setSelectedSubject={setSelectedSubject}
                    currentQuestionIndex={currentQuestionIndex}
                    setCurrentQuestionIndex={setCurrentQuestionIndex}
                    explanation={explanation}
                    setExplanation={setExplanation}
                    isGenerating={isGenerating}
                    handleSubmit={handleSubmit}
                    universityLogoUrl={currentUniversityLogo}
                  />
                </TabsContent>
                <TabsContent value="notasDeCorte" className="mt-6">
                  {isDataLoading ? (
                    // Reutiliza o SkeletonCard enquanto os dados do perfil carregam
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SkeletonCard />
                      <SkeletonCard />
                    </div>
                  ) : error ? (
                    // Exibe erro se os dados do perfil falharem
                    <div className="p-8 text-center text-red-500 bg-red-50/50 rounded-2xl border border-red-200/20">
                      <AlertCircle className="h-10 w-10 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">Erro ao carregar dados</h3>
                      <p className="text-sm">Não foi possível carregar seu desempenho. Tente atualizar a página.</p>
                    </div>
                  ) : (
                    // Passa os dados necessários para o novo componente
                    <NotaCorteConsulta
                      // Usamos a porcentagem de acertos como 'nota geral'
                      userScore={profileData.stats.percentagem} 
                      // Pré-enche o curso alvo com o que está salvo nas configurações
                      defaultTargetCourse={formData.targetCourse}
                    />
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
    <Footer />
  </div>
);
};
