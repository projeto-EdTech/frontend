import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, type Variants, AnimatePresence } from "framer-motion";
import { Calendar, ChevronRight, ChevronLeft, Trophy } from "lucide-react";

interface RecentExam {
  name: string;
  date: string;
  score: number;
  logo?: string;
}

interface SimulationHistoricProps {
  recentExams: RecentExam[];
}

const SimulationHistoric: React.FC<SimulationHistoricProps> = ({
  recentExams,
}) => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  // Lógica de paginação
  const totalPages = Math.ceil(recentExams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentExams = recentExams.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6 px-2">
        <div className="p-2 bg-blue-500/10 rounded-xl">
          <Calendar size={20} className="text-blue-600" />
        </div>
        <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          Histórico de Simulados
        </h3>
      </div>

      {recentExams.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--card-bg)]/60 backdrop-blur-md border border-[var(--border-color)] rounded-3xl p-12 text-center shadow-sm"
        >
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
            <Image
              src="/Mascote/banners/Camaleão_10.png"
              alt="Sem simulados"
              width={128}
              height={128}
              className="relative mx-auto object-contain drop-shadow-xl"
            />
          </div>
          <p className="text-[var(--text-secondary)] font-medium text-lg mb-8">
            Você ainda não desbravou nenhum simulado
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/library")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl shadow-lg shadow-blue-500/25 font-semibold text-base transition-all hover:shadow-xl hover:shadow-blue-500/30 active:shadow-inner"
          >
            Começar Minha Jornada
          </motion.button>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={currentPage}
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {currentExams.map((exam, index) => (
                <motion.div
                  key={`${exam.name}-${index}`}
                  variants={itemVariants}
                  layout
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="group p-5 bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--border-color)] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_var(--shadow-hover)] hover:border-blue-500/30 transition-all duration-300 cursor-pointer overflow-hidden relative"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-transparent group-hover:bg-blue-500 transition-colors" />

                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-300 overflow-hidden">
                        {exam.logo ? (
                          <Image
                            src={`/Logo_universidades/${exam.logo}`}
                            alt={exam.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <Trophy
                            size={22}
                            className="text-[var(--text-secondary)] opacity-60 group-hover:text-blue-500 transition-colors"
                          />
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-[var(--text-primary)] group-hover:text-blue-500 transition-colors tracking-tight">
                          {exam.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar
                            size={14}
                            className="text-[var(--text-secondary)] opacity-60"
                          />
                          <p className="text-sm text-[var(--text-secondary)] font-medium">
                            {exam.date}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[10px] text-[var(--text-secondary)] opacity-70 font-bold uppercase tracking-[0.1em] mb-0.5">
                          Score
                        </p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-black text-green-500 tabular-nums">
                            {exam.score}
                          </p>
                          <p className="text-xs text-[var(--text-secondary)] opacity-80 font-semibold">
                            pts
                          </p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <ChevronRight size={18} className="text-blue-500" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Paginação Estilo Library */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-600">
              <div className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                Página {currentPage} de {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft size={16} />
                  Anterior
                </motion.button>

                <div className="hidden sm:flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Mostrar primeira, última, e páginas ao redor da atual
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);
                      if (!showPage) {
                        // Adicionar elipses se houver gap
                        if (page === 2 || page === totalPages - 1) {
                          return (
                            <span
                              key={page}
                              className="text-[var(--text-secondary)]"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <motion.button
                          key={page}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => goToPage(page)}
                          className={`min-w-[40px] h-10 rounded-xl font-bold transition-all duration-300 text-sm ${
                            currentPage === page
                              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20"
                              : "bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-blue-500"
                          }`}
                        >
                          {page}
                        </motion.button>
                      );
                    },
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm transition-all hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Próximo
                  <ChevronRight size={16} />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimulationHistoric;
