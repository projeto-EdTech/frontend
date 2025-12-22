"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { HelpCircle, X, Gamepad2, Heart } from "lucide-react";

import "./NexoStyle.css";

type Categoria = { titulo: string; palavras: string[]; cor: string };
type ResultadoJogo = {
  vitoria: boolean;
  categorias: Categoria[];
};

export default function Nexo() {
  const gameRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  // Referencia para armazenar a instância da classe de lógica (ConnectionsGame)
  const logicRef = useRef<unknown>(null);
  const [resultado, setResultado] = useState<ResultadoJogo | null>(null);
  // Estado para controlar a visibilidade do modal de ajuda
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [gameId, setGameId] = useState(0);
  // Estado para o contador regressivo até a meia-noite
  const [tempoRestante, setTempoRestante] = useState<string>("");
  // Atualiza o contador regressivo até a meia-noite quando o modal de resultado aparece
  useEffect(() => {
    if (!resultado) return;
    // Toca o som de vitória ou derrota e dispara confetes se o usuário ganhou
    if (resultado.vitoria) {
      const audio = new Audio("/fanfare-trumpets.mp3");
      audio.volume = 0.7;
      audio.play().catch(() => {});
      // Confetti
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
        // Efeito extra: dois lados
        confetti.default({
          particleCount: 80,
          angle: 60,
          spread: 100,
          origin: { x: 0, y: 0.7 },
          zIndex: 9999,
        });
        confetti.default({
          particleCount: 80,
          angle: 120,
          spread: 100,
          origin: { x: 1, y: 0.7 },
          zIndex: 9999,
        });
      });
    } else if (resultado.vitoria === false) {
      const audio = new Audio("/Game-Over.mp3");
      audio.volume = 0.7;
      audio.play().catch(() => {});
    }
    function calcularTempoRestante() {
      const agora = new Date();
      const amanha = new Date(agora);
      amanha.setHours(24, 0, 0, 0); // meia-noite do próximo dia
      const diff = amanha.getTime() - agora.getTime();
      if (diff <= 0) return "00:00:00";
      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff / (1000 * 60)) % 60);
      const segundos = Math.floor((diff / 1000) % 60);
      return `${horas.toString().padStart(2, "0")}:${minutos
        .toString()
        .padStart(2, "0")}:${segundos.toString().padStart(2, "0")}`;
    }

    setTempoRestante(calcularTempoRestante());
    const interval = setInterval(() => {
      setTempoRestante(calcularTempoRestante());
    }, 1000);
    return () => clearInterval(interval);
  }, [resultado]);

  // Descobre o tier do usuário sem usar 'any'
  type UserWithTier = {
    tier?: string;
  };
  const tier = (session?.user && (session.user as UserWithTier).tier) || "FREE";

  useEffect(() => {
    let mounted = true;
    import("./functions/NexoLogic").then((mod) => {
      setTimeout(() => {
        if (mounted && gameRef.current) {
          // Garante que o botão de dica comece oculto
          const btn = document.getElementById("nexo-dica-btn");
          if (btn) btn.classList.add("hidden");

          const instance = new mod.ConnectionsGame();
          logicRef.current = instance;

          // Define o tipo do callback corretamente
          (
            instance as {
              onGameOver?: (
                vitoria: boolean,
                todasCategorias: Categoria[]
              ) => void;
            }
          ).onGameOver = (vitoria: boolean, todasCategorias: Categoria[]) => {
            setResultado({
              vitoria,
              categorias: todasCategorias,
            });
          };
        }
      }, 0);
    });
    return () => {
      mounted = false;
    };
  }, [gameId]);

  // Funções que o React chama ao clicar nos botões
  const handleDesmarcar = () => {
    // O '?' garante que só chama se a lógica já estiver carregada
    (logicRef.current as { desmarcarTudo?: () => void })?.desmarcarTudo?.();
  };

  const handleEmbaralhar = () => {
    (logicRef.current as { embaralhar?: () => void })?.embaralhar?.();
  };

  return (
    <div className="flex flex-col items-center justify-start bg-transparent pb-33 px-4 relative w-full font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif] antialiased">
      {/* --- MODAL DE AJUDA (Estilo LEXOO Dark) --- */}
      {mostrarAjuda && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Overlay Escuro com Blur */}
          <div
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMostrarAjuda(false)}
          />

          {/* Card do Modal */}
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden animate-[popIn_0.3s_ease-out]">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Gamepad2 className="text-purple-500" size={24} />
                <h2 className="text-lg font-bold text-gray-800 tracking-wide">
                  Como Jogar Nexo?
                </h2>
              </div>
              <button
                onClick={() => setMostrarAjuda(false)}
                className="p-1 rounded-full text-gray-700 hover:!bg-red-100 transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-700 hover:!text-red-500" />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-6 space-y-6 text-slate-300 text-sm max-h-[80vh] overflow-y-auto">
              {/* Seção Objetivo */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-pink-500 font-bold text-base">
                  <span>🎯</span> <h3>Objetivo</h3>
                </div>
                <p className="leading-relaxed text-gray-700">
                  Agrupe as 16 palavras em{" "}
                  <strong className="text-gray-700">4 grupos de 4 itens</strong>{" "}
                  que compartilham uma conexão oculta.
                </p>
              </div>

              {/* Seção Exemplos */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-yellow-400 font-bold text-base">
                  <span>💡</span> <h3>Exemplos</h3>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-300">
                  <p className="mb-2 text-xs uppercase tracking-wider font-semibold text-gray-700">
                    Categoria: Cores em Inglês
                  </p>
                  <div className="flex gap-2">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      BLUE
                    </span>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      RED
                    </span>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      GREEN
                    </span>
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">
                      YELLOW
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-700">
                    Estas 4 palavras formam um grupo.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-lg border border-gray-300">
                  <p className="mb-2 text-xs uppercase tracking-wider font-semibold text-gray-700">
                    Categoria: Planetas
                  </p>
                  <div className="flex gap-2">
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-bold">
                      TERRA
                    </span>
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-bold">
                      MARTE
                    </span>
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-bold">
                      JÚPITER
                    </span>
                    <span className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs font-bold">
                      VÊNUS
                    </span>
                  </div>
                </div>
              </div>

              {/* Seção Dicas */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                  <span>✨</span> <h3>Dicas</h3>
                </div>
                <ul className="list-disc pl-5 space-y-2 marker:text-indigo-500">
                  <li className="text-gray-700">
                    Você pode selecionar até 4 palavras por vez para verificar.
                  </li>
                  <li className="text-gray-700">
                    Se você errar 5 vezes, um botão de{" "}
                    <strong className="text-blue-400">DICA</strong> aparecerá
                    para ajudar.
                  </li>
                  <li className="text-gray-700">
                    As categorias variam de muito fáceis a difíceis
                    (conhecimentos gerais, trocadilhos, etc).
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE RESULTADO (GAME OVER / WIN) --- */}
      {resultado && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
          {/* Overlay Escuro */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs animate-[fadeIn_0.5s_ease-out]" />

          {/* Card do Modal */}
          <div className="relative w-full max-w-sm bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden animate-[popIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]">
            {/* Cabeçalho Visual */}
            <div
              className={`px-6 py-6 text-center ${resultado.vitoria ? "!bg-green-50" : "!bg-red-50"}`}
            >
              <div className="mx-auto w-12 h-12 mb-3 flex items-center justify-center rounded-full bg-transparent text-2xl">
                {resultado.vitoria ? "🏆" : "💀"}
              </div>
              <h2
                className={`text-2xl font-black uppercase tracking-wide ${resultado.vitoria ? "!text-green-600" : "!text-red-600"}`}
              >
                {resultado.vitoria ? "Genial!" : "Fim de Jogo"}
              </h2>
              <p className="text-gray-700 text-sm mt-1 font-medium">
                {resultado.vitoria
                  ? "Você desvendou todas as conexões."
                  : "Não foi dessa vez. Veja as respostas abaixo:"}
              </p>
            </div>

            {/* Lista das Respostas (Gabarito) */}
            <div className="p-4 space-y-3 bg-white max-h-[50vh] overflow-y-auto">
              {resultado.categorias.map((cat, i) => (
                <div
                  key={i}
                  className="rounded-xl p-3 shadow-sm border border-gray-200 overflow-hidden relative"
                  style={{ background: cat.cor }}
                >
                  <div className="relative z-10 text-center">
                    <h3 className="text-white font-extrabold text-[0.65rem] uppercase tracking-[0.15em] mb-1 drop-shadow-sm">
                      {cat.titulo}
                    </h3>
                    <p className="text-white font-semibold text-xs leading-tight drop-shadow-sm">
                      {cat.palavras.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* FREE: só mensagem, PRO: só botão */}
            {tier === "FREE" ? (
              <div className="flex flex-col items-center gap-1 my-3">
                <div
                  className={`px-4 py-2 rounded-lg shadow-sm border border-blue-100 bg-gradient-to-r ${resultado.vitoria ? "from-blue-50 to-blue-100" : "from-red-50 to-red-100"} flex flex-col items-center w-full`}
                >
                  <span className="text-[0.98rem] font-bold text-blue-700 tracking-wide drop-shadow-sm mb-0.5">
                    {resultado.vitoria
                      ? "Volte amanhã para um novo desafio!"
                      : "Volte amanhã para tentar novamente!"}
                  </span>
                  <span className="text-xs text-blue-500 font-semibold flex items-center gap-1">
                    Próximo desafio em:
                    <span className="font-mono ml-1 text-blue-700 text-sm">
                      {tempoRestante}
                    </span>
                  </span>
                </div>
              </div>
            ) : null}
            {/* Rodapé com Ação */}
            {tier === "Simula PRO" && (
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={() => {
                    localStorage.removeItem("nexo_save_v1");
                    setResultado(null);
                    setGameId((prev) => prev + 1);
                  }}
                  className="w-full py-3 rounded-xl font-bold text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-all bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer"
                >
                  Jogar Novamente
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- JANELA DO JOGO --- */}
      <div className="max-w-3xl overflow-hidden flex flex-col transition-all duration-300 z-10">
        <div className="p-6 md:p-8 flex flex-col items-center gap-6 w-full">
          <div className="w-full grid grid-cols-3 items-center">
            <div className="flex flex-col">
              <p className="text-lg text-gray-700 font-bold">
                {new Date().toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-2xl font-semibold text-gray-700 uppercase">
                Nexo
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                className="p-2 rounded-full hover:bg-black/10 transition-colors text-gray-700 cursor-pointer"
                aria-label="Ajuda"
                onClick={() => setMostrarAjuda(true)}
              >
                <HelpCircle size={20} />
              </button>
            </div>
          </div>
          <div className="w-full flex items-center justify-between rounded-xl p-2 pr-2 pl-4 min-h-[50px]">
            {/* Vidas centralizadas */}
            <div className="flex-1 flex justify-center">
              <div id="nexo-lifes" className="flex gap-1.5 items-center">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Heart
                    key={i}
                    className="nexo-heart full"
                    size={20}
                    fill="currentColor"
                    strokeWidth={2}
                  />
                ))}
              </div>
            </div>
            {/* Botão DICA à direita */}
            <button
              id="nexo-dica-btn"
              className="hidden ml-4 bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs font-bold py-2 px-5 rounded-lg shadow-lg shadow-slate-500/20 transition-all active:scale-95 cursor-pointer"
            >
              DICA
            </button>
          </div>

          <div className="w-full flex flex-col gap-6">
            {" "}
            {/* Adicionei este wrapper para organizar o espaçamento */}
            {/* Mova a div 'acertos' para o TOPO */}
            <div className="acertos w-full flex flex-col gap-3">
              {/* O JavaScript vai inserir as barras laranjas aqui, empurrando a grade para baixo */}
            </div>
            {/* A div 'game' fica EMBAIXO */}
            <div
              className="game grid grid-cols-4 gap-6 w-full mb-2"
              key={gameId}
              ref={gameRef}
            >
              {Array.from({ length: 16 }).map((_, i) => (
                <button
                  key={i}
                  className="nexo-card default group relative rounded-md shadow-md flex items-center justify-center p-6 cursor-pointer"
                ></button>
              ))}
            </div>
            {/* Botões de Ação inseridos aqui */}
            <div className="flex gap-4 justify-center w-full mt-2">
              <button
                onClick={handleDesmarcar}
                className="px-6 py-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 border border-gray-200 text-gray-100 font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all active:scale-95 cursor-pointer"
              >
                Desmarcar tudo
              </button>

              <button
                onClick={handleEmbaralhar}
                className="px-6 py-2 rounded-full bg-gradient-to-b from-blue-500 to-blue-600 border border-gray-200 text-gray-100 font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all active:scale-95 cursor-pointer"
              >
                Embaralhar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
