"use client";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Escuta o retorno do OAuth (?sync=1) e chama /api/sync-user sempre que houver um novo login.
 * Remove o parâmetro da URL após sincronizar para evitar chamadas repetidas em navegações internas.
 */
export default function SyncUserEffect() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const syncingRef = useRef(false);
  const doneForEmailRef = useRef<string | null>(null);

  useEffect(() => {
    const shouldSync = searchParams.get("sync") === "1";
    if (status === "authenticated" && shouldSync && !syncingRef.current) {
      const email = session?.user?.email || "";
      // Evita sync duplicada para o mesmo email no mesmo ciclo de vida
      if (doneForEmailRef.current === email) return;
      syncingRef.current = true;
      (async () => {
        try {
          await fetch("/api/sync-user", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: session?.user?.name,
              email,
            }),
          });
        } catch (e) {
          console.error("Falha ao sincronizar usuário (effect)", e);
        } finally {
          doneForEmailRef.current = email;
          syncingRef.current = false;
          // Remove o parâmetro ?sync=1 da URL sem recarregar
          try {
            const url = new URL(window.location.href);
            url.searchParams.delete("sync");
            router.replace(url.pathname + (url.search ? url.search : "") + url.hash);
          } catch {
            /* ignore */
          }
        }
      })();
    }
  }, [status, searchParams, session, router]);

  return null;
}
