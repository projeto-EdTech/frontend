"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, Check, RefreshCw, X, AlertCircle } from "lucide-react";

interface DiscordTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOKEN_TTL_SECONDS = 5 * 60; // 5 minutos (validade do token OTP)

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function DiscordTokenModal({
  isOpen,
  onClose,
}: DiscordTokenModalProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TOKEN_TTL_SECONDS);

  const expired = token !== null && secondsLeft <= 0;

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setCopied(false);
    setToken(null);
    try {
      const jwt =
        typeof window !== "undefined"
          ? localStorage.getItem("user_data")
          : null;
      const res = await fetch("/api/users/generate-token", {
        method: "POST",
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : undefined,
      });
      if (!res.ok) {
        throw new Error("Falha ao gerar token.");
      }
      const data = await res.json();
      if (!data?.token) {
        throw new Error("Token inválido recebido.");
      }
      setToken(data.token);
      setSecondsLeft(TOKEN_TTL_SECONDS);
    } catch {
      setError("Não foi possível gerar o token. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Gera um token automaticamente ao abrir o modal.
  useEffect(() => {
    if (isOpen) {
      generate();
    }
  }, [isOpen, generate]);

  // Contador regressivo enquanto há token válido.
  useEffect(() => {
    if (!isOpen || !token || secondsLeft <= 0) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isOpen, token, secondsLeft]);

  const handleCopy = () => {
    if (!token || expired) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-discord"
                viewBox="0 0 16 16"
              >
                <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Token do Discord
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Cole este código no bot do Discord para vincular sua conta.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-gray-400 hover:text-red-600 hover:bg-red-100 hover:rounded-full p-1 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-6">
              <RefreshCw size={28} className="text-indigo-500 animate-spin" />
              <p className="text-sm text-gray-500">Gerando token...</p>
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <AlertCircle size={28} className="text-red-500" />
              <p className="text-sm text-gray-600">{error}</p>
              <button
                onClick={generate}
                className="mt-1 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg hover:from-indigo-600 hover:to-indigo-700 hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <RefreshCw size={16} />
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && token && (
            <div className="flex flex-col gap-4">
              {/* Token display */}
              <div
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border ${
                  expired
                    ? "border-gray-200 bg-gray-50 opacity-60"
                    : "border-indigo-200 bg-indigo-50"
                }`}
              >
                <span className="font-mono text-lg font-bold tracking-widest text-gray-900 select-all">
                  {token}
                </span>
                <button
                  onClick={handleCopy}
                  disabled={expired}
                  aria-label="Copiar token"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    expired
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-100 cursor-pointer"
                  }`}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>

              {/* Countdown / expired */}
              {expired ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <p className="text-sm text-red-500 font-medium">
                    Token expirado. Gere um novo para continuar.
                  </p>
                  <button
                    onClick={generate}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-b from-indigo-500 to-indigo-600 text-white text-sm font-medium rounded-lg shadow-lg hover:from-indigo-600 hover:to-indigo-700 hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    <RefreshCw size={16} />
                    Gerar novo token
                  </button>
                </div>
              ) : (
                <p className="text-xs text-center text-gray-500">
                  Expira em{" "}
                  <span className="font-semibold text-gray-700">
                    {formatTime(secondsLeft)}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
