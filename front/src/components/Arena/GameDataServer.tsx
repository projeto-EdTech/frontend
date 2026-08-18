import React from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/core/auth";
import { minigamesData } from "@/lib/games/games";
import ArenaGameClient from './ArenaGameClient';

interface GameDataServerProps {
  slug: string;
}

export default async function GameDataServer({ slug }: GameDataServerProps) {
  // Buscar o jogo
  const foundGame = minigamesData.find((g) => g.slug === slug);

  if (!foundGame) {
    redirect('/Arena');
  }

  // Verificar autenticação e permissões no servidor para jogos Premium
  if (foundGame.status === 'premium') {
    const session = await getServerSession(authOptions);
    const isAuthenticated = !!session;
    const hasPaidPlan = session?.user?.tier && session.user.tier !== "FREE";

    if (!hasPaidPlan) {
      if (!isAuthenticated) {
        // O Client side lida com abrir o modal de login caso não autenticado nativamente via useSession
        // Porém, como é fallback de servidor, podemos redirecionar para a Arena pura ou deixar passar pro Client renderizar o modal "FREE".
        // O ArenaClient captura `status === 'unauthenticated'` nativo e exibe LoginModal.
      } else {
        // Autenticado mas FREE, joga pra paidPlan (instantâneo via 307)
        redirect('/paidPlan');
      }
    }
  }

  return <ArenaGameClient game={foundGame} />;
}
