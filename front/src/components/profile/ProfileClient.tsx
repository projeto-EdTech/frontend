"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react"; // 1. Importa o hook para gerenciar a sessão
import Header from "@/components/Header";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";
import Footer from "@/components/Footer";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useUniversityStorage } from "@/contexts/UniversityStorage";
import GeneralStats, {
  SkeletonCard,
  type ProfileStats,
} from "@/components/profile/GeneralStats";
import StatsUser from "@/components/profile/StatsUser";

import NavigationBar from "@/components/profile/NavigationBar";
import useSWR from "swr";
import NotaCorteConsulta from "@/components/Simula_PRO/NotaCorteConsulta";
import UserConfig from "@/components/profile/UserConfig";
import Gemini from "@/components/Simula_PRO/Questoes_Gemini";
import Planner from "@/components/Simula_PRO/Planner/Planner";

import { getRankingData } from "@/app/service/ranking.service";
import { type UserRankingData, getRankFromScore } from "@/lib/utils/rankUtils";
import { mockProfileData, DEV_CONFIG } from "@/lib/data/profile";
import { decodeJWT } from "@/app/service/jwtDecoder";

const MOCK_EMAIL = "fegrolla0210@gmail.com";

const fetcher = async (url: string) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("user_data") : "";
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Falha ao carregar os dados do perfil.");
  return res.json();
};

// --- TIPAGENS PARA RANKING ---
// Removido UserRanking type duplicado, usando UserRankingData importado

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Interface principal que une todas as outras
interface ProfileData {
  stats: ProfileStats;
  recentExams: RecentExam[];
  subjectPerformance: SubjectPerformance[];
  monthlyProgress: MonthlyProgressPoint[];
  reviewableQuestions: ReviewableQuestion[];
  pagination?: Pagination;
}

const initialProfileData: ProfileData = {
  stats: {
    simulados: 0,
    questoes: 0,
    acertos: 0,
    percentagem: 0,
    trend_simulados: { value: 0, type: "up" },
    trend_questoes: { value: 0, type: "up" },
    trend_acertos: { value: 0, type: "up" },
    trend_percentagem: { value: 0, type: "up" },
  },
  recentExams: [],
  subjectPerformance: [],
  monthlyProgress: [],
  reviewableQuestions: [],
};

export default function ProfileClient({
  initialProfileDataProps,
}: {
  initialProfileDataProps: ProfileData | null;
}) {
  // 2. Chama o hook para obter os dados da sessão e o status de autenticação
  const { data: session, status } = useSession();
  const { universities } = useUniversityStorage();
  const [activeTab, setActiveTab] = useState("profile");
  const [explanation, setExplanation] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>(
    initialProfileDataProps || initialProfileData,
  ); // <- Sem <any>
  const [isDataLoading, setIsDataLoading] = useState(!initialProfileDataProps); // se tiver prop, n carrega
  const [error, setError] = useState<string | null>(null);
  const [groupedQuestions, setGroupedQuestions] = useState<
    Map<string, ReviewableQuestion[]>
  >(new Map());
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const currentUniversityLogo = useMemo(() => {
    const currentGroup = groupedQuestions.get(selectedSubject);
    const currentQuestion = currentGroup
      ? currentGroup[currentQuestionIndex]
      : null;

    if (!currentQuestion) {
      return null;
    }

    const universityName = currentQuestion.displayLabel
      .split(" ")[0]
      .toLowerCase();
    const universityData = universities.find(
      (u) => u.slug.toLowerCase() === universityName,
    );

    return universityData ? universityData.logo : null;
  }, [groupedQuestions, selectedSubject, currentQuestionIndex]);

  const isMockUser =
    status === "authenticated" &&
    (session?.user?.email === MOCK_EMAIL ||
      session?.user?.email === "fegrolla0210@gmail.com");

  // Mock user: load static data, skip all API calls
  useEffect(() => {
    if (!isMockUser) return;
    setProfileData(mockProfileData as ProfileData);
    setIsDataLoading(false);
    if (mockProfileData.reviewableQuestions.length > 0) {
      const groups = mockProfileData.reviewableQuestions.reduce(
        (acc: Map<string, ReviewableQuestion[]>, q: ReviewableQuestion) => {
          if (!acc.has(q.displaySubject)) acc.set(q.displaySubject, []);
          acc.get(q.displaySubject)!.push(q);
          return acc;
        },
        new Map<string, ReviewableQuestion[]>(),
      );
      setGroupedQuestions(groups);
      setSelectedSubject(Array.from(groups.keys())[0] || "");
    }
  }, [isMockUser]);

  // Real user: fetch via SWR
  const {
    data: profileDataResponse,
    error: swrError,
    isLoading: isSwrLoading,
  } = useSWR(
    status === "authenticated" && !isMockUser
      ? "/api/user/stats?page=1&limit=3"
      : null,
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 120000,
      fallbackData: initialProfileDataProps || undefined,
    },
  );

  useEffect(() => {
    if (profileDataResponse) {
      setProfileData(profileDataResponse);
      setIsDataLoading(false);

      if (
        profileDataResponse.reviewableQuestions &&
        profileDataResponse.reviewableQuestions.length > 0
      ) {
        const groups = profileDataResponse.reviewableQuestions.reduce(
          (
            acc: Map<string, ReviewableQuestion[]>,
            question: ReviewableQuestion,
          ) => {
            const subject = question.displaySubject;
            if (!acc.has(subject)) {
              acc.set(subject, []);
            }
            acc.get(subject)!.push(question);
            return acc;
          },
          new Map<string, ReviewableQuestion[]>(),
        );

        setGroupedQuestions(groups);
        const firstSubject = Array.from(groups.keys())[0] || "";
        setSelectedSubject(firstSubject as string);
      }
    }
  }, [profileDataResponse]);

  useEffect(() => {
    if (swrError) {
      console.error("Erro ao buscar dados do perfil:", swrError);
      setError(swrError.message || "Ocorreu um erro desconhecido.");
      setIsDataLoading(false);
    }
  }, [swrError]);

  useEffect(() => {
    if (isSwrLoading) setIsDataLoading(true);
  }, [isSwrLoading]);

  const [rankingData, setRankingData] = useState<UserRankingData | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    const loadRanking = async () => {
      if (DEV_CONFIG.enabled) {
        setRankingData({
          position: 1,
          name: session?.user?.name || "Usuário",
          score: DEV_CONFIG.devScore,
          rank: getRankFromScore(DEV_CONFIG.devScore),
          isCurrentUser: true,
        });
        return;
      }

      try {
        if (isMockUser) {
          const data = await getRankingData("geral", "mensal");
          const current = data.find((u) => u.isCurrentUser) ?? null;
          setRankingData(current as UserRankingData | null);
        } else {
          const token = localStorage.getItem("user_data");
          const res = await fetch(
            "/api/ranking?universidade=geral&periodo=mensal",
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          if (!res.ok) return;
          const data: UserRankingData[] = await res.json();
          const current = data.find((u) => u.isCurrentUser) ?? null;
          setRankingData(current);
        }
      } catch {
        // ranking is non-critical, silently ignore
      }
    };

    loadRanking();
  }, [status, isMockUser]);

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
      setFormData((prev) => ({
        ...prev,
        fullName: session.user?.name ?? "",
        email: session.user?.email ?? "",
      }));
    }
  }, [session]);

  // useEffect para carregar configurações salvas do sessionStorage ou do JWT no localStorage
  useEffect(() => {
    try {
      let settingsObj: any = null;
      const savedSettings = sessionStorage.getItem("userProfileSettings");

      if (savedSettings) {
        settingsObj = JSON.parse(savedSettings);
        console.log("Configurações carregadas do sessionStorage:", settingsObj);
      } else {
        // Se não houver dados no sessionStorage, tenta obter do JWT salvo no localStorage
        const token = localStorage.getItem("user_data");
        if (token) {
          const decoded = decodeJWT(token);
          if (decoded) {
            // --- OBSERVAÇÃO SOBRE MAPEAMENTO DO JWT / RETORNO DO BACKEND ---
            // Se o backend enviar os dados de destino com outras chaves no payload do JWT,
            // certifique-se de ajustar este mapeamento abaixo.
            // Suporta chaves snake_case (prova_alvo, curso_alvo, instituicao) ou camelCase.
            settingsObj = {
              profileIcon: decoded.profileIcon || "Avatar/Camaleão_1.png",
              useInitialAvatar: decoded.useInitialAvatar ?? true,
              institution: decoded.instituicao || decoded.institution || "",
              targetExam: decoded.prova_alvo || decoded.targetExam || "",
              targetCourse: decoded.curso_alvo || decoded.targetCourse || "",
            };
            // Salva no sessionStorage para manter o cache local atualizado
            sessionStorage.setItem("userProfileSettings", JSON.stringify(settingsObj));
            sessionStorage.setItem("user_profile_data", JSON.stringify(settingsObj));
            console.log("Configurações iniciais carregadas a partir do JWT decodificado:", settingsObj);
          }
        }
      }

      if (settingsObj) {
        setFormData((prev) => ({
          ...prev,
          profileIcon: settingsObj.profileIcon || "Avatar/Camaleão_1.png",
          useInitialAvatar: settingsObj.useInitialAvatar ?? true,
          institution: settingsObj.institution || prev.institution,
          targetExam: settingsObj.targetExam || prev.targetExam,
          targetCourse: settingsObj.targetCourse || prev.targetCourse,
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações do perfil:", error);
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

    // Mock user uses static data — skip backend fetch
    if (isMockUser) return;

    // 2. Define o estado de carregamento
    // setIsMetaLoading(true);

    // 3. Lógica de "Debounce":
    // Espera 1 segundo (1000ms) após o usuário parar de digitar
    const handler = setTimeout(() => {
      const fetchCutoff = async () => {
        try {
          const storedToken = localStorage.getItem("user_data");
          const response = await fetch("/api/Nota-corte", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${storedToken}`,
            },
            body: JSON.stringify({
              userScore: profileData.stats.percentagem,
              targetCourse,
              targetInstitution: targetExam,
            }),
          });

          if (!response.ok) {
            throw new Error("Falha ao buscar nota de corte");
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
  }, [formData, isMockUser]); // Dependências: formData + isMockUser para o guard de mock

  // Função para salvar o perfil no sessionStorage e no backend via BFF
  const handleSaveProfile = async () => {
    try {
      // Salva os dados do perfil no sessionStorage
      const profileSettings = {
        profileIcon: formData.profileIcon,
        useInitialAvatar: formData.useInitialAvatar,
        institution: formData.institution,
        targetExam: formData.targetExam,
        targetCourse: formData.targetCourse,
      };

      sessionStorage.setItem(
        "userProfileSettings",
        JSON.stringify(profileSettings),
      );
      sessionStorage.setItem(
        "user_profile_data",
        JSON.stringify(profileSettings),
      );

      // Dispara evento customizado para notificar outros componentes (como o Header)
      const event = new CustomEvent("profileSettingsUpdated", {
        detail: profileSettings,
      });
      window.dispatchEvent(event);

      // Envia os dados para o backend se não for usuário Mock
      if (!isMockUser) {
        const token = localStorage.getItem("user_data") || "";
        
        // --- OBSERVAÇÃO SOBRE RETORNO DO BACKEND ---
        // A rota /api/user/profile envia o payload no formato:
        // { targetExam, targetCourse, institution }
        // Se o backend esperar chaves diferentes no JSON, altere no arquivo
        // src/app/api/user/profile/route.ts.
        const res = await fetch("/api/user/profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            targetExam: formData.targetExam,
            targetCourse: formData.targetCourse,
            institution: formData.institution,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Erro ao salvar perfil no servidor.");
        }
      }

      // Feedback visual de sucesso (você pode adicionar um toast/notificação aqui)
      alert("Configurações salvas com sucesso!");
      console.log("Perfil salvo no sessionStorage e backend:", profileSettings);
    } catch (error: any) {
      console.error("Erro ao salvar configurações:", error);
      alert(error.message || "Erro ao salvar configurações. Tente novamente.");
    }
  };

  // Função para cancelar e restaurar os dados originais
  const handleCancelProfile = () => {
    try {
      // Restaura os dados do sessionStorage ou volta aos valores iniciais
      const savedSettings = sessionStorage.getItem("userProfileSettings");

      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setFormData((prev) => ({
          ...prev,
          profileIcon: settings.profileIcon || "Avatar/Camaleão_1.png",
          useInitialAvatar: settings.useInitialAvatar ?? true,
          institution: settings.institution || "",
          targetExam: settings.targetExam || "",
          targetCourse: settings.targetCourse || "",
        }));
      } else {
        // Se não houver dados salvos, volta aos valores padrão
        setFormData((prev) => ({
          ...prev,
          institution: "",
          targetExam: "",
          targetCourse: "",
          profileIcon: "Avatar/Camaleão_1.png",
          useInitialAvatar: true,
        }));
      }

      console.log("Alterações canceladas");
    } catch (error) {
      console.error("Erro ao cancelar alterações:", error);
    }
  };

  const handleSubmit = async () => {
    const currentGroup = groupedQuestions.get(selectedSubject);
    const questionToSubmit = currentGroup
      ? currentGroup[currentQuestionIndex]
      : null;

    if (!questionToSubmit) {
      console.error("Nenhuma questão selecionada para gerar explicação.");
      return;
    }

    setIsGenerating(true);
    setExplanation("");

    try {
      const response = await fetch("/api/generate-explanation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enunciado: questionToSubmit.enunciado,
          gabarito: questionToSubmit.gabarito,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(
          "A resposta da rede não foi bem-sucedida ou não continha um corpo.",
        );
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
      console.error("Erro ao buscar explicação:", error);
      setExplanation("Ocorreu um erro ao gerar a explicação. Tente novamente.");
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
                <TabsContent
                  value="profile"
                  className="mt-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  {/* Estatísticas Gerais */}
                  <GeneralStats
                    session={session}
                    status={status}
                    formData={formData}
                    profileData={profileData}
                    isDataLoading={isDataLoading}
                    error={error}
                    setActiveTab={setActiveTab}
                    rankingData={rankingData}
                    recentExams={profileData.recentExams}
                    pagination={profileData.pagination}
                  />
                </TabsContent>

                {/* Questões não resolvidas Tab Content */}
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

                {/* Planner de estudos Tab Content */}
                <TabsContent value="planner" className="mt-6">
                  <DndProvider backend={HTML5Backend}>
                    <Planner />
                  </DndProvider>
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

                {/* Configuracoes Tab Content */}
                <TabsContent value="configuracoes" className="mt-6">
                  <UserConfig
                    formData={formData}
                    setFormData={setFormData}
                    onSave={handleSaveProfile}
                    onCancel={handleCancelProfile}
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
                      <h3 className="text-lg font-semibold">
                        Erro ao carregar dados
                      </h3>
                      <p className="text-sm">
                        Não foi possível carregar seu desempenho. Tente
                        atualizar a página.
                      </p>
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
}
