import type { Metadata } from "next";
import Script from "next/script";
import localFont from 'next/font/local';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./providers";
import { ProfileIconProvider } from "@/contexts/ProfileIconContext";
import ThemeProviderWrapper from "@/components/ThemeProviderWrapper";
import SyncUserEffect from "@/components/SyncUserEffect";
import NavigationSound from "@/components/NavigationSound";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import { UniversityStorage } from "@/contexts/UniversityStorage";
import { Suspense } from "react";
import SkipLink from "@/components/SkipLink";
import 'katex/dist/katex.min.css'
import { PHProvider } from '@/providers/PostHogProvider'

// Fontes secundárias (mantidas para casos específicos)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fonte de acessibilidade
const openDyslexic = localFont({
  src: './fonts/OpenDyslexic-Regular.otf',
  variable: '--font-opendyslexic',
});

export const metadata: Metadata = {
  title: "Vestibuline",
  description: "Prepare-se para os principais vestibulares com simulados e automatize seus estudos.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/Mascote/banner/Camaleão_36.png",
  },
  keywords: 'vestibular, ENEM, simulado, preparação, educação',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Apenas carrega o GA4 em produção para não contaminar os dados
  // com eventos gerados durante o desenvolvimento local
  const isProd = process.env.NODE_ENV === 'production';
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html lang="en" suppressHydrationWarning={true}>
      {/*
       * ─────────────────────────────────────────────────────────────────────
       * Google Analytics 4 (GA4) — Medição de comportamento do usuário
       *
       * Por quê está aqui?
       *   O layout.tsx é o componente raiz da aplicação Next.js; qualquer
       *   script adicionado aqui é carregado automaticamente em TODAS as
       *   páginas, garantindo cobertura completa de rastreamento sem precisar
       *   repetir o código em cada rota.
       *
       * Por quê usamos next/script com strategy="afterInteractive"?
       *   • Evita bloquear o render crítico (não é render-blocking).
       *   • O script só é carregado após a hidratação do React, preservando
       *     o First Contentful Paint (FCP) e o LCP da página.
       *   • É a abordagem recomendada pelo Next.js para scripts de analytics.
       *
       * Por quê o condicional isProd?
       *   • Em desenvolvimento, eventos falsos contaminariam os dados reais
       *     do GA4, distorcendo métricas de usuários e sessões.
       *   • O script só é injetado quando NODE_ENV === 'production'.
       *
       * Por quê dentro do <body> e não de um <head> escrito à mão?
       *   • No App Router quem monta <html>/<head>/<body> é o Next; um <head>
       *     autoral desloca o preâmbulo do documento e o <div hidden> que o
       *     Next injeta como primeiro filho do body para a metadata em
       *     streaming — o que aparece como erro de hidratação nesse nó.
       *   • next/script posiciona o script sozinho, independente de onde a
       *     tag é declarada na árvore.
       *
       * ID de medição: definido em NEXT_PUBLIC_GA_ID (.env)
       * ─────────────────────────────────────────────────────────────────────
       */}
      {/*
       * suppressHydrationWarning no <body>: extensões de navegador injetam
       * atributos e nós no topo do body antes do React hidratar, e isso é
       * contabilizado como divergência servidor/cliente.
       */}
      <body
        suppressHydrationWarning={true}
        className={`${geistSans.variable} ${geistMono.variable} ${openDyslexic.variable} antialiased`}
      >
        {isProd && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}

        {/* Microsoft Clarity — Mapas de calor e gravações de sessão */}
        {isProd && clarityId && (
          <Script id="microsoft-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        )}

        <NextAuthProvider>
          <ThemeProviderWrapper>
            <ProfileIconProvider>
              <NavigationSound />
              <AccessibilityProvider>
                <UniversityStorage>
                  <SkipLink />
                  <Suspense fallback={null}>
                    <SyncUserEffect />
                  </Suspense>
                    <PHProvider>
                      {children}
                    </PHProvider>
                </UniversityStorage>
              </AccessibilityProvider>
            </ProfileIconProvider>
          </ThemeProviderWrapper>
        </NextAuthProvider>
      </body>
    </html>
  );
}