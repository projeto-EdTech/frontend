import type { Metadata } from "next";
import localFont from 'next/font/local';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NextAuthProvider } from "./providers";
import { ProfileIconProvider } from "@/contexts/ProfileIconContext";
import SyncUserEffect from "@/components/SyncUserEffect";
import NavigationSound from "@/components/NavigationSound";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import SkipLink from "@/components/SkipLink";
import 'katex/dist/katex.min.css'

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
  title: "SimulaVest",
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
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${openDyslexic.variable} antialiased`}
      >
        <ThemeProvider>
          <NextAuthProvider>
            <ProfileIconProvider>
              <NavigationSound />
              <AccessibilityProvider>
                <SkipLink />
                <SyncUserEffect />
                {children}
              </AccessibilityProvider>
            </ProfileIconProvider>
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}