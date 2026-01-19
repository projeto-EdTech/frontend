"use client";

import { useState, useEffect } from "react";
import AccessibilityMenu from "./AccessibilityMenu";
import Image from "next/image";
import Link from "next/link";
import UserAvatar from "./UserAvatar";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  LogOut,
  PersonStanding,
  Home,
  BarChart3,
  Menu,
  X,
  Library,
  Newspaper,
  ChevronRight,
  BrainCircuit,
  Gamepad2,
} from "lucide-react";
import LoginModal from "./Login-modal";
import { useRouter } from "next/navigation";
import LoadingScreen from "./LoadingScreen";
import { useTheme } from "@/contexts/ThemeContext";

export default function Header() {
  const { data: session, status } = useSession();
  const { theme } = useTheme();
  const router = useRouter();
  const isAuthenticated = status === "authenticated";
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMenuItem, setActiveMenuItem] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAccessibilityMenuOpen, setIsAccessibilityMenuOpen] = useState(false);

  // Verificar se o usuário tem plano pago
  const hasPaidPlan = session?.user?.tier && session.user.tier !== "FREE";

  // Estado para armazenar configurações de perfil do sessionStorage
  const [profileSettings, setProfileSettings] = useState({
    profileIcon: "Avatar/Camaleão_1.png",
    useInitialAvatar: true,
  });

  // Fechar menu mobile quando a tela for redimensionada
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect para carregar configurações do sessionStorage
  useEffect(() => {
    const loadProfileSettings = () => {
      try {
        const savedSettings = sessionStorage.getItem("userProfileSettings");

        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setProfileSettings({
            profileIcon: settings.profileIcon || "Avatar/Camaleão_1.png",
            useInitialAvatar: settings.useInitialAvatar ?? true,
          });

          console.log("Header: Configurações de perfil carregadas:", settings);
        }
      } catch (error) {
        console.error(
          "Header: Erro ao carregar configurações do sessionStorage:",
          error
        );
      }
    };

    // Carrega as configurações ao montar o componente
    loadProfileSettings();

    // Listener customizado para detectar mudanças no sessionStorage na MESMA aba
    const handleProfileUpdate = (e: CustomEvent) => {
      try {
        const settings = e.detail;
        setProfileSettings({
          profileIcon: settings.profileIcon || "Avatar/Camaleão_1.png",
          useInitialAvatar: settings.useInitialAvatar ?? true,
        });
        console.log(
          "Header: Perfil atualizado via evento customizado:",
          settings
        );
      } catch (error) {
        console.error(
          "Header: Erro ao processar atualização de perfil:",
          error
        );
      }
    };

    // Adiciona listener para detectar mudanças no sessionStorage entre abas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userProfileSettings" && e.newValue) {
        try {
          const settings = JSON.parse(e.newValue);
          setProfileSettings({
            profileIcon: settings.profileIcon || "Avatar/Camaleão_1.png",
            useInitialAvatar: settings.useInitialAvatar ?? true,
          });
        } catch (error) {
          console.error("Header: Erro ao processar mudança de storage:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "profileSettingsUpdated",
      handleProfileUpdate as EventListener
    );

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "profileSettingsUpdated",
        handleProfileUpdate as EventListener
      );
    };
  }, []);

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleMenuItemClick = (href: string, name: string) => {
    setActiveMenuItem(name);
    setIsMobileMenuOpen(false);

    // Pequeno delay para mostrar a animação antes de navegar
    setTimeout(() => {
      router.push(href);
      setActiveMenuItem(null);
    }, 150);
  };

  const handleNavigation = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault(); // Previne a navegação imediata do <Link>
    setIsNavigating(true); // Ativa a tela de carregamento
    router.push(href); // Inicia a navegação programaticamente
  };

  const navigationItems = [
    // Itens públicos
    {
      name: "Início",
      href: "/",
      icon: Home,
      description: "Página principal",
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "News",
      href: "/blog",
      icon: Newspaper,
      description: "Últimas notícias",
      color: "from-purple-500 to-pink-500",
    },

    // Itens visíveis apenas para usuários autenticados
    ...(isAuthenticated
      ? [
          {
            name: "Biblioteca",
            href: "/library",
            icon: Library,
            description: "Acervo completo",
            color: "from-orange-500 to-red-500",
          }
        ]
      : []),
  ];

  if (isNavigating) {
    return <LoadingScreen message="Carregando..." />;
  }

  return (
    <>
      <header className="themed-header sticky top-0 z-50 backdrop-blur-md shadow-sm transition-all duration-300">
        <div className="absolute inset-0 bg-gradient from-background/90 to-white-50 dark:from-background/90 dark:via-blue-950/30 dark:to-sky-950/30"></div>
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between h-16 lg:h-18">
            <div className="flex items-center h-16 lg:h-18 overflow-hidden">
              <Link
                href="/"
                onClick={(e) => handleNavigation(e, "/")}
                className="group flex items-center h-16 lg:h-18 overflow-hidden"
                aria-label="Ir para a página inicial"
              >
                <div className="relative w-[135px] h-16 lg:h-18 overflow-hidden">
                  <Image
                    src="/Mascote/banners/Camaleão_35.png"
                    alt="Vestibuline Logo"
                    width={135}
                    height={135}
                    className="absolute -top-9 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 z-10"
                  />
                </div>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleNavigation(e, item.href)}
                  className="group relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-white transition-all duration-200 overflow-hidden hover:shadow-xl hover:shadow-blue-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-600 shadow-xl hover:shadow-blue-500/30 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg"></div>

                  <item.icon
                    className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:scale-105"
                    strokeWidth={2}
                  />
                  <span className="relative z-10">{item.name}</span>

                  <div className="absolute inset-0 rounded-lg shadow-md shadow-blue-500/0 group-hover:shadow-blue-500/25 transition-all duration-200"></div>
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMobileMenu}
                className={`relative md:hidden p-2.5 rounded-lg transition-all duration-200 ${
                  theme === "dark"
                    ? "bg-gray-800/80 hover:bg-gray-700 border border-gray-700/50"
                    : "bg-white hover:bg-gray-50 border border-gray-200/50"
                }`}
              >
                {isMobileMenuOpen ? (
                  <X
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    strokeWidth={2}
                  />
                ) : (
                  <Menu
                    className="w-5 h-5 text-gray-700 dark:text-gray-300"
                    strokeWidth={2}
                  />
                )}
              </button>

              {status === "loading" ? (
                <div
                  className={`w-24 h-10 rounded-lg animate-pulse hidden md:block ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <div className="h-full rounded-lg animate-pulse"></div>
                </div>
              ) : !isAuthenticated ? (
                <button
                  onClick={openLoginModal}
                  className="relative group px-6 py-2.5 text-sm font-semibold text-white rounded-lg transition-all duration-200 overflow-hidden shadow-md hover:shadow-lg hover:shadow-blue-500/30 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-500 transition-all duration-200"></div>

                  <span className="relative z-10 transition-transform duration-200 group-hover:scale-105">
                    Entrar
                  </span>

                  <div className="absolute inset-0 rounded-lg bg-blue-400/20 opacity-0 group-hover:opacity-100 blur-md transition-all duration-200"></div>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="relative group transition-all duration-300 hover:scale-110 cursor-pointer"
                  >
                    {/* Avatar com configurações do sessionStorage */}
                    <UserAvatar
                      name={session.user?.name || ""}
                      className="w-10 h-10 text-lg"
                      customIcon={
                        profileSettings.useInitialAvatar
                          ? undefined
                          : profileSettings.profileIcon
                      }
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className={`absolute right-0 mt-3 w-56 backdrop-blur-xl rounded-2xl shadow-2xl border py-2 z-50 overflow-hidden bg-white border-gray-200`}
                      style={{
                        boxShadow:
                          theme === "dark"
                            ? "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                            : "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <div
                        className={`relative px-4 py-3 border-b ${
                          theme === "dark"
                            ? "border-gray-700/50"
                            : "border-gray-200/50"
                        }`}
                      >
                        <p
                          className={`text-sm font-semibold truncate ${
                            theme === "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {session.user?.name}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            theme === "dark" ? "text-blue-400" : "text-blue-600"
                          }`}
                        >
                          {session.user?.email}
                        </p>
                      </div>

                      <Link
                        href="/profile"
                        className={`relative flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 group ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                        onClick={(e) => {
                          handleNavigation(e, "/profile");
                          setIsUserMenuOpen(false);
                        }}
                      >
                        <User
                          className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                          strokeWidth={2}
                        />
                        <span className="font-medium">Meu Perfil</span>
                      </Link>

                      <button
                        onClick={() => {
                          setIsAccessibilityMenuOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left relative flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 group cursor-pointer ${
                          theme === "dark"
                            ? "text-gray-300 hover:bg-gray-800/60 hover:text-white"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        <PersonStanding
                          className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                          strokeWidth={2}
                        />
                        <span className="font-medium">Acessibilidade</span>
                      </button>

                      <div
                        className={`border-t mt-2 pt-2 ${
                          theme === "dark"
                            ? "border-gray-700/50"
                            : "border-gray-200/50"
                        }`}
                      >
                        <button
                          onClick={() => signOut()}
                          className={`relative flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 w-full text-left group cursor-pointer ${
                            theme === "dark"
                              ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                              : "text-red-500 hover:bg-red-50 hover:text-red-600"
                          }`}
                        >
                          <LogOut
                            className="w-4 h-4 transition-transform duration-200 group-hover:scale-110"
                            strokeWidth={2}
                          />
                          <span className="font-medium">Sair</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Menu Mobile - estilo macOS */}
          {isMobileMenuOpen && (
            <div className="md:hidden fixed inset-x-0 top-16 mx-4 z-40">
              <div
                className={`relative backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden bg-white border-gray-200`}
                style={{
                  boxShadow:
                    theme === "dark"
                      ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
                      : "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                }}
              >
                {/* Header do menu */}
                <div
                  className={`relative px-6 py-4 border-b ${
                    theme === "dark"
                      ? "border-gray-700/50"
                      : "border-gray-200/50"
                  }`}
                >
                  <h3
                    className={`text-lg font-semibold tracking-tight ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Navegação
                  </h3>
                  <p
                    className={`text-sm mt-0.5 ${
                      theme === "dark" ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Escolha uma opção para continuar
                  </p>
                </div>

                {/* Lista de navegação */}
                <nav className="relative py-2">
                  {navigationItems.map((item, index) => (
                    <button
                      key={item.name}
                      onClick={() => handleMenuItemClick(item.href, item.name)}
                      className={`
                        group w-full flex items-center justify-between px-6 py-3.5 text-left
                        transition-all duration-200 relative overflow-hidden cursor-pointer
                        ${
                          activeMenuItem === item.name
                            ? theme === "dark"
                              ? "bg-gray-800/60"
                              : "bg-gray-50"
                            : theme === "dark"
                              ? "hover:bg-gray-800/40"
                              : "hover:bg-gray-50/70"
                        }
                      `}
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {/* Indicador lateral */}
                      <div
                        className={`
                        absolute left-0 top-0 h-full w-1 transition-all duration-200
                        bg-gradient-to-b ${item.color}
                        ${
                          activeMenuItem === item.name
                            ? "opacity-100 scale-y-100"
                            : "opacity-0 scale-y-0 group-hover:opacity-100 group-hover:scale-y-100"
                        }
                      `}
                      ></div>

                      <div className="flex items-center gap-4 flex-1">
                        {/* Ícone */}
                        <div
                          className={`
                          w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200
                          bg-gradient-to-br ${item.color}
                          ${
                            activeMenuItem === item.name
                              ? "scale-105 shadow-lg"
                              : "group-hover:scale-105 group-hover:shadow-md"
                          }
                        `}
                        >
                          <item.icon
                            className="w-5 h-5 text-white"
                            strokeWidth={2}
                          />
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={`
                            font-semibold transition-all duration-200 text-sm
                            ${
                              activeMenuItem === item.name
                                ? theme === "dark"
                                  ? "text-white"
                                  : "text-gray-900"
                                : theme === "dark"
                                  ? "text-gray-200 group-hover:text-white"
                                  : "text-gray-800 group-hover:text-gray-900"
                            }
                          `}
                          >
                            {item.name}
                          </h4>
                          <p
                            className={`text-xs truncate ${
                              theme === "dark"
                                ? "text-gray-500"
                                : "text-gray-500"
                            }`}
                          >
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Seta indicativa */}
                      <ChevronRight
                        className={`
                        w-5 h-5 transition-all duration-200
                        ${
                          activeMenuItem === item.name
                            ? theme === "dark"
                              ? "text-gray-400 translate-x-1"
                              : "text-gray-600 translate-x-1"
                            : theme === "dark"
                              ? "text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5"
                              : "text-gray-400 group-hover:text-gray-600 group-hover:translate-x-0.5"
                        }
                      `}
                        strokeWidth={2}
                      />

                      {/* Efeito de loading */}
                      {activeMenuItem === item.name && (
                        <div
                          className={`absolute inset-0 animate-pulse ${
                            theme === "dark"
                              ? "bg-gray-800/40"
                              : "bg-gray-100/60"
                          }`}
                        ></div>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Overlay para fechar o menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden transition-opacity duration-200"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Menu de acessibilidade */}
      <AccessibilityMenu
        isOpen={isAccessibilityMenuOpen}
        onClose={() => setIsAccessibilityMenuOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
}
