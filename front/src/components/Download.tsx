"use client";

import { motion } from "framer-motion";
import { Download, Monitor } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";

// Componente customizado para o ícone do Tux (Linux)
const TuxIcon = ({ className, color }: { className?: string; color?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    fill={color}
    viewBox="0 0 16 16"
    className={className}
  >
    <path d="M8.996 4.497c.104-.076.1-.168.186-.158s.022.102-.098.207c-.12.104-.308.243-.46.323-.291.152-.631.336-.993.336s-.647-.167-.853-.33c-.102-.082-.186-.162-.248-.221-.11-.086-.096-.207-.052-.204.075.01.087.109.134.153.064.06.144.137.241.214.195.154.454.304.778.304s.702-.19.932-.32c.13-.073.297-.204.433-.304M7.34 3.781c.055-.02.123-.031.174-.003.011.006.024.021.02.034-.012.038-.074.032-.11.05-.032.017-.057.052-.093.054-.034 0-.086-.012-.09-.046-.007-.044.058-.072.1-.089m.581-.003c.05-.028.119-.018.173.003.041.017.106.045.1.09-.004.033-.057.046-.09.045-.036-.002-.062-.037-.093-.053-.036-.019-.098-.013-.11-.051-.004-.013.008-.028.02-.034"/>
    <path fillRule="evenodd" d="M8.446.019c2.521.003 2.38 2.66 2.364 4.093-.01.939.509 1.574 1.04 2.244.474.56 1.095 1.38 1.45 2.32.29.765.402 1.613.115 2.465a.8.8 0 0 1 .254.152l.001.002c.207.175.271.447.329.698.058.252.112.488.224.615.344.382.494.667.48.922-.015.254-.203.43-.435.57-.465.28-1.164.491-1.586 1.002-.443.527-.99.83-1.505.871a1.25 1.25 0 0 1-1.256-.716v-.001a1 1 0 0 1-.078-.21c-.67.038-1.252-.165-1.718-.128-.687.038-1.116.204-1.506.206-.151.331-.445.547-.808.63-.5.114-1.126 0-1.743-.324-.577-.306-1.31-.278-1.85-.39-.27-.057-.51-.157-.626-.384-.116-.226-.095-.538.07-.988.051-.16.012-.398-.026-.648a2.5 2.5 0 0 1-.037-.369c0-.133.022-.265.087-.386v-.002c.14-.266.368-.377.577-.451s.397-.125.53-.258c.143-.15.27-.374.443-.56q.036-.037.073-.07c-.081-.538.007-1.105.192-1.662.393-1.18 1.223-2.314 1.811-3.014.502-.713.65-1.287.701-2.016.042-.997-.705-3.974 2.112-4.2q.168-.015.321-.013m2.596 10.866-.03.016c-.223.121-.348.337-.427.656-.08.32-.107.733-.13 1.206v.001c-.023.37-.192.824-.31 1.267s-.176.862-.036 1.128v.002c.226.452.608.636 1.051.601s.947-.304 1.36-.795c.474-.576 1.218-.796 1.638-1.05.21-.126.324-.242.333-.4.009-.157-.097-.403-.425-.767-.17-.192-.217-.462-.274-.71-.056-.247-.122-.468-.26-.585l-.001-.001c-.18-.157-.356-.17-.565-.164q-.069.001-.14.005c-.239.275-.805.612-1.197.508-.359-.09-.562-.508-.587-.918m-7.204.03H3.83c-.189.002-.314.09-.44.225-.149.158-.276.382-.445.56v.002h-.002c-.183.184-.414.239-.61.31-.195.069-.353.143-.46.35v.002c-.085.155-.066.378-.029.624.038.245.096.507.018.746v.002l-.001.002c-.157.427-.155.678-.082.822.074.143.235.22.48.272.493.103 1.26.069 1.906.41.583.305 1.168.404 1.598.305.431-.098.712-.369.75-.867v-.002c.029-.292-.195-.673-.485-1.052-.29-.38-.633-.752-.795-1.09v-.002l-.61-1.11c-.21-.286-.43-.462-.68-.5a1 1 0 0 0-.106-.008M9.584 4.85c-.14.2-.386.37-.695.467-.147.048-.302.17-.495.28a1.3 1.3 0 0 1-.74.19.97.97 0 0 1-.582-.227c-.14-.113-.25-.237-.394-.322a3 3 0 0 1-.192-.126c-.063 1.179-.85 2.658-1.226 3.511a5.4 5.4 0 0 0-.43 1.917c-.68-.906-.184-2.066.081-2.568.297-.55.343-.701.27-.649-.266.436-.685 1.13-.848 1.844-.085.372-.1.749.01 1.097.11.349.345.67.766.931.573.351.963.703 1.193 1.015s.302.584.23.777a.4.4 0 0 1-.212.22.7.7 0 0 1-.307.056l.184.235c.094.124.186.249.266.375 1.179.805 2.567.496 3.568-.218.1-.342.197-.664.212-.903.024-.474.05-.896.136-1.245s.244-.634.53-.791a1 1 0 0 1 .138-.061q.005-.045.013-.087c.082-.546.569-.572 1.18-.303.588.266.81.499.71.814h.13c.122-.398-.133-.69-.822-1.025l-.137-.06a2.35 2.35 0 0 0-.012-1.113c-.188-.79-.704-1.49-1.098-1.838-.072-.003-.065.06.081.203.363.333 1.156 1.532.727 2.644a1.2 1.2 0 0 0-.342-.043c-.164-.907-.543-1.66-.735-2.014-.359-.668-.918-2.036-1.158-2.983M7.72 3.503a1 1 0 0 0-.312.053c-.268.093-.447.286-.559.391-.022.021-.05.04-.119.091s-.172.126-.321.238q-.198.151-.13.38c.046.15.192.325.459.476.166.098.28.23.41.334a1 1 0 0 0 .215.133.9.9 0 0 0 .298.066c.282.017.49-.068.673-.173s.34-.233.518-.29c.365-.115.627-.345.709-.564a.37.37 0 0 0-.01-.309c-.048-.096-.148-.187-.318-.257h-.001c-.354-.151-.507-.162-.705-.29-.321-.207-.587-.28-.807-.279m-.89-1.122h-.025a.4.4 0 0 0-.278.135.76.76 0 0 0-.191.334 1.2 1.2 0 0 0-.051.445v.001c.01.162.041.299.102.436.05.116.109.204.183.274l.089-.065.117-.09-.023-.018a.4.4 0 0 1-.11-.161.7.7 0 0 1-.054-.22v-.01a.7.7 0 0 1 .014-.234.4.4 0 0 1 .08-.179q.056-.069.126-.073h.013a.18.18 0 0 1 .123.05c.045.04.08.09.11.162a.7.7 0 0 1 .054.22v.01a.7.7 0 0 1-.002.17 1.1 1.1 0 0 1 .317-.143 1.3 1.3 0 0 0 .002-.194V3.23a1.2 1.2 0 0 0-.102-.437.8.8 0 0 0-.227-.31.4.4 0 0 0-.268-.102m1.95-.155a.63.63 0 0 0-.394.14.9.9 0 0 0-.287.376 1.2 1.2 0 0 0-.1.51v.015q0 .079.01.152c.114.027.278.074.406.138a1 1 0 0 1-.011-.172.8.8 0 0 1 .058-.278.5.5 0 0 1 .139-.2.26.26 0 0 1 .182-.069.26.26 0 0 1 .178.081c.055.054.094.12.124.21.029.086.042.17.04.27l-.002.012a.8.8 0 0 1-.057.277c-.024.059-.089.106-.122.145.046.016.09.03.146.052a5 5 0 0 1 .248.102 1.2 1.2 0 0 0 .244-.763 1.2 1.2 0 0 0-.11-.495.9.9 0 0 0-.294-.37.64.64 0 0 0-.39-.133z"/>
  </svg>
);

// Componente customizado para o ícone da Apple
const AppleIcon = ({ className, color }: { className?: string; color?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    fill={color}
    viewBox="0 0 16 16"
    className={className}
  >
    <path d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516s1.52.087 2.475-1.258.762-2.391.728-2.43m3.314 11.733c-.048-.096-2.325-1.234-2.113-3.422s1.675-2.789 1.698-2.854-.597-.79-1.254-1.157a3.7 3.7 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56s.625 1.924 1.273 2.796c.576.984 1.34 1.667 1.659 1.899s1.219.386 1.843.067c.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758q.52-1.185.473-1.282"/>
  </svg>
);

// Componente customizado para o ícone do Windows
const WindowsIcon = ({ className, color }: { className?: string; color?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    fill={color}
    viewBox="0 0 16 16"
    className={className}
  >
    <path d="M6.555 1.375 0 2.237v5.45h6.555zM0 13.795l6.555.933V8.313H0zm7.278-5.4.026 6.378L16 16V8.395zM16 0 7.33 1.244v6.414H16z"/>
  </svg>
);

// Componente customizado para o ícone do Android
const AndroidIcon = ({ className, color }: { className?: string; color?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    fill={color}
    viewBox="0 0 16 16"
    className={className}
  >
    <path d="m10.213 1.471.691-1.26q.069-.124-.048-.192-.128-.057-.195.058l-.7 1.27A4.8 4.8 0 0 0 8.005.941q-1.032 0-1.956.404l-.7-1.27Q5.281-.037 5.154.02q-.117.069-.049.193l.691 1.259a4.25 4.25 0 0 0-1.673 1.476A3.7 3.7 0 0 0 3.5 5.02h9q0-1.125-.623-2.072a4.27 4.27 0 0 0-1.664-1.476ZM6.22 3.303a.37.37 0 0 1-.267.11.35.35 0 0 1-.263-.11.37.37 0 0 1-.107-.264.37.37 0 0 1 .107-.265.35.35 0 0 1 .263-.11q.155 0 .267.11a.36.36 0 0 1 .112.265.36.36 0 0 1-.112.264m4.101 0a.35.35 0 0 1-.262.11.37.37 0 0 1-.268-.11.36.36 0 0 1-.112-.264q0-.154.112-.265a.37.37 0 0 1 .268-.11q.155 0 .262.11a.37.37 0 0 1 .107.265q0 .153-.107.264M3.5 11.77q0 .441.311.75.311.306.76.307h.758l.01 2.182q0 .414.292.703a.96.96 0 0 0 .7.288.97.97 0 0 0 .71-.288.95.95 0 0 0 .292-.703v-2.182h1.343v2.182q0 .414.292.703a.97.97 0 0 0 .71.288.97.97 0 0 0 .71-.288.95.95 0 0 0 .292-.703v-2.182h.76q.436 0 .749-.308.31-.307.311-.75V5.365h-9zm10.495-6.587a.98.98 0 0 0-.702.278.9.9 0 0 0-.293.685v4.063q0 .406.293.69a.97.97 0 0 0 .702.284q.42 0 .712-.284a.92.92 0 0 0 .293-.69V6.146a.9.9 0 0 0-.293-.685 1 1 0 0 0-.712-.278m-12.702.283a1 1 0 0 1 .712-.283q.41 0 .702.283a.9.9 0 0 1 .293.68v4.063a.93.93 0 0 1-.288.69.97.97 0 0 1-.707.284 1 1 0 0 1-.712-.284.92.92 0 0 1-.293-.69V6.146q0-.396.293-.68"/>
  </svg>
);

// Componente customizado para o ícone do Smartphone/Mobile
const SmartphoneIcon = ({ className, color }: { className?: string; color?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="20" 
    height="20" 
    fill={color}
    viewBox="0 0 24 24"
    className={className}
  >
    <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H7V4h10v16zm-2.5-1h-5v1h5v-1z"/>
  </svg>
);

export default function DownloadSection() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // URLs de download carregadas do .env
  const DOWNLOAD_URLS = {
    appStore: process.env.DOWNLOAD_APP_STORE || "",
    googlePlay: process.env.DOWNLOAD_GOOGLE_PLAY || "",
    windows: process.env.DOWNLOAD_WINDOWS || "",
    macos: process.env.DOWNLOAD_MACOS || "",
    linux: process.env.DOWNLOAD_LINUX || "",
  };

  // Função para lidar com downloads
  const handleDownload = (e: React.MouseEvent<HTMLAnchorElement>, platform: string) => {
    e.preventDefault();
    
    let url = "";
    let filename = "";

    switch (platform) {
      case "App Store":
        url = DOWNLOAD_URLS.appStore;
        window.open(url, "_blank");
        break;
      case "Google Play":
        url = DOWNLOAD_URLS.googlePlay;
        window.open(url, "_blank");
        break;
      case "Windows":
        url = DOWNLOAD_URLS.windows;
        filename = "vestibuline-installer.exe";
        downloadFile(url, filename);
        break;
      case "macOS":
        url = DOWNLOAD_URLS.macos;
        filename = "vestibuline-installer.dmg";
        downloadFile(url, filename);
        break;
      case "Linux":
        url = DOWNLOAD_URLS.linux;
        filename = "vestibuline-installer.AppImage";
        downloadFile(url, filename);
        break;
      default:
        console.warn(`Download não configurado para: ${platform}`);
    }
  };

  // Função auxiliar para download de arquivos
  const downloadFile = (url: string, filename: string) => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      // Fallback: abre o link em nova aba
      window.open(url, "_blank");
    }
  };

  const downloadItems = [
    {
      id: 1,
      title: "Aplicativo Mobile",
      subtitle: "iOS e Android",
      platforms: [
        {
          name: "App Store",
          badge: "iOS",
          link: "#", // Substitua com o link real
          platformIcon: AppleIcon,
        },
        {
          name: "Google Play",
          badge: "Android",
          link: "#", // Substitua com o link real
          platformIcon: AndroidIcon,
        },
      ],
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: 2,
      title: "Software Desktop",
      subtitle: "Windows, Mac e Linux",
      platforms: [
        {
          name: "Windows",
          badge: "PC",
          link: "#", // Substitua com o link real
          platformIcon: WindowsIcon,
        },
        {
          name: "macOS",
          badge: "Mac",
          link: "#", // Substitua com o link real
          platformIcon: AppleIcon,
        },
        {
          name: "Linux",
          badge: "Linux",
          link: "#", // Substitua com o link real
          platformIcon: TuxIcon,
        },
      ],
      gradient: "from-purple-500 to-indigo-500",
    },
  ];

  return (
    <section className={`py-20 lg:py-28 relative overflow-hidden transition-colors duration-500 ${
      isDark 
        ? "bg-gray-950" 
        : "bg-gray-50"
    }`} id="downloads">
      {/* Background com gradiente sutil estilo Apple */}
      <div className={`absolute inset-0 ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900/50 to-gray-950"
          : "bg-gradient-to-br from-gray-50 via-white to-gray-100"
      } pointer-events-none`} />

      {/* Elementos decorativos com blur sutil (estilo macOS) */}
      <div className={`absolute top-32 right-20 w-96 h-96 ${
        isDark
          ? "bg-blue-900/10"
          : "bg-blue-100/20"
      } rounded-full blur-3xl animate-pulse pointer-events-none`} style={{ animationDuration: '6s' }} />
      <div className={`absolute -bottom-32 left-1/4 w-96 h-96 ${
        isDark
          ? "bg-purple-900/10"
          : "bg-purple-100/20"
      } rounded-full blur-3xl animate-pulse pointer-events-none`} style={{ animationDuration: '8s', animationDelay: '1s' }} />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-full backdrop-blur-xl transition-all duration-500 ${
              isDark
                ? "bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/20 hover:border-blue-500/40"
                : "bg-gradient-to-br from-blue-100/40 to-purple-100/40 border border-blue-200/40 hover:border-blue-300/60"
            }`}>
              <Download className={`w-8 h-8 transition-all duration-500 ${
                isDark ? "text-blue-300" : "text-blue-600"
              }`} />
            </div>
          </div>

          <h2 className={`text-5xl md:text-6xl font-light mb-6 leading-tight transition-colors duration-500 tracking-tight ${
            isDark ? "text-white" : "text-gray-900"
          }`}>
            Baixe o Vestibuline
          </h2>

          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed transition-colors duration-500 font-light ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}>
            Acesse a plataforma em qualquer dispositivo. Mobile, Desktop ou Web — sempre sincronizados e prontos para você estudar.
          </p>
        </motion.div>

        {/* Download Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          {downloadItems.map((item, index) => {
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                className="group relative"
              >
                {/* Main Card com Glass Morphism */}
                <div className={`relative rounded-2xl p-8 md:p-10 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 h-full flex flex-col border overflow-hidden group-hover:scale-[1.02] ${
                  isDark
                    ? "bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-700/40 hover:border-blue-500/30 hover:bg-gradient-to-br hover:from-gray-800/60 hover:to-gray-900/60"
                    : "bg-gradient-to-br from-white/50 to-gray-100/50 border-gray-200/40 hover:border-blue-300/40 hover:bg-gradient-to-br hover:from-white/80 hover:to-gray-100/80"
                }`}>

                  {/* Gradient overlay animado (macOS style) */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                    isDark
                      ? "bg-gradient-to-br from-blue-900/5 to-purple-900/5"
                      : "bg-gradient-to-br from-blue-100/10 to-purple-100/10"
                  }`} />

                  {/* Content */}
                  <div className="relative z-10">
                    <h3 className={`text-3xl md:text-4xl font-light mb-2 transition-colors duration-500 tracking-tight ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}>
                      {item.title}
                    </h3>

                    <p className={`text-sm font-light transition-colors duration-500 mb-4 ${
                      isDark ? "text-blue-300/70" : "text-blue-600/70"
                    }`}>
                      {item.subtitle}
                    </p>

                    {/* Download Buttons */}
                    <div className="space-y-3">
                      {item.platforms.map((platform) => {
                        const PlatformIcon = platform.platformIcon;
                        
                        // Definir cores específicas para cada plataforma
                        let iconColor = "#000000";
                        let bgColor = "bg-gray-100/50";
                        let hoverBgColor = "group-hover/btn:bg-gray-200/70";
                        let hoverBgColorFull = "group-hover/btn:bg-gray-500";
                        let accentColor = "text-gray-600";
                        let darkBgColor = "bg-gray-700/30";
                        let darkHoverBgColor = "group-hover/btn:bg-gray-600/50";
                        let darkAccentColor = "text-gray-400";
                        
                        if (platform.badge === "iOS" || platform.badge === "Mac") {
                          iconColor = "#555555"; // Cinza Apple
                          bgColor = "bg-gray-100/50 backdrop-blur-sm";
                          hoverBgColor = "group-hover/btn:bg-gray-200/70";
                          hoverBgColorFull = "group-hover/btn:bg-gray-500";
                          accentColor = "text-gray-700";
                          darkBgColor = "bg-gray-700/30 backdrop-blur-sm";
                          darkHoverBgColor = "group-hover/btn:bg-gray-600/50";
                          darkAccentColor = "text-gray-300";
                        } else if (platform.badge === "PC") {
                          iconColor = "#0078D4"; // Azul Windows
                          bgColor = "bg-blue-100/40 backdrop-blur-sm";
                          hoverBgColor = "group-hover/btn:bg-blue-200/50";
                          hoverBgColorFull = "group-hover/btn:bg-blue-600";
                          accentColor = "text-blue-700";
                          darkBgColor = "bg-blue-950/20 backdrop-blur-sm";
                          darkHoverBgColor = "group-hover/btn:bg-blue-900/30";
                          darkAccentColor = "text-blue-400";
                        } else if (platform.badge === "Android") {
                          iconColor = "#3DDC84"; // Verde Android
                          bgColor = "bg-green-100/40 backdrop-blur-sm";
                          hoverBgColor = "group-hover/btn:bg-green-200/50";
                          hoverBgColorFull = "group-hover/btn:bg-green-600";
                          accentColor = "text-green-700";
                          darkBgColor = "bg-green-950/20 backdrop-blur-sm";
                          darkHoverBgColor = "group-hover/btn:bg-green-900/30";
                          darkAccentColor = "text-green-400";
                        } else if (platform.badge === "Linux") {
                          iconColor = "#FCC624"; // Amarelo/Ouro Linux
                          bgColor = "bg-amber-100/40 backdrop-blur-sm";
                          hoverBgColor = "group-hover/btn:bg-amber-200/50";
                          hoverBgColorFull = "group-hover/btn:bg-amber-500";
                          accentColor = "text-amber-700";
                          darkBgColor = "bg-amber-950/20 backdrop-blur-sm";
                          darkHoverBgColor = "group-hover/btn:bg-amber-900/30";
                          darkAccentColor = "text-amber-400";
                        }
                        
                        return (
                          <a
                            key={platform.name}
                            href="#"
                            onClick={(e) => handleDownload(e, platform.name)}
                            className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 group/btn cursor-pointer hover:scale-[1.02] active:scale-95 ${
                              isDark
                                ? `${darkBgColor} border-gray-600/30 hover:border-gray-500/50 group-hover/btn:bg-gray-500 group-hover/btn:border-gray-500`
                                : `${bgColor} border-gray-200/30 hover:border-gray-300/50 ${hoverBgColorFull}`
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg transition-all duration-300 ${
                                isDark
                                  ? `${darkBgColor} group-hover/btn:bg-white/20`
                                  : `${bgColor} group-hover/btn:bg-white/30`
                              }`}>
                                <PlatformIcon color={iconColor} className={`w-5 h-5 transition-all duration-300 group-hover/btn:brightness-0 group-hover/btn:invert`} />
                              </div>
                              <div>
                                <p className={`font-medium transition-colors duration-300 ${
                                  isDark ? "text-white group-hover/btn:text-white" : "text-gray-900 group-hover/btn:text-white"
                                }`}>{platform.name}</p>
                                <p className={`text-xs font-light transition-colors duration-300 ${
                                  isDark ? "text-gray-500 group-hover/btn:text-gray-200" : "text-gray-500 group-hover/btn:text-gray-100"
                                }`}>{platform.badge}</p>
                              </div>
                            </div>
                            <div className={`transition-all duration-300 group-hover/btn:translate-x-1 ${
                              isDark
                                ? "text-gray-600 group-hover/btn:text-white"
                                : "text-gray-400 group-hover/btn:text-white"
                            }`}>
                              →
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className={`rounded-2xl backdrop-blur-xl p-8 md:p-12 transition-all duration-500 border ${
            isDark
              ? "bg-gradient-to-br from-gray-800/30 to-gray-900/30 border-gray-700/30 hover:border-blue-500/20 hover:bg-gradient-to-br hover:from-gray-800/50 hover:to-gray-900/50"
              : "bg-gradient-to-br from-white/40 to-gray-100/40 border-gray-200/30 hover:border-blue-300/30 hover:bg-gradient-to-br hover:from-white/60 hover:to-gray-100/60"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "📱",
                title: "Sincronização Instantânea",
                description: "Todos os seus dados sincronizados entre dispositivos em tempo real.",
              },
              {
                icon: "🔒",
                title: "Segurança Avançada",
                description: "Criptografia de ponta a ponta e os mais altos padrões de proteção.",
              },
              {
                icon: "⚡",
                title: "Funciona Offline",
                description: "Estude sem internet. Sincroniza automaticamente quando retorna.",
              },
            ].map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="text-center group hover:scale-105 transition-transform duration-300"
              >
                <div className={`text-5xl mb-4 transition-transform duration-300 group-hover:scale-110`}>{info.icon}</div>
                <h4 className={`font-light text-lg mb-2 transition-colors duration-500 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}>{info.title}</h4>
                <p className={`text-sm font-light transition-colors duration-500 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}>{info.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
