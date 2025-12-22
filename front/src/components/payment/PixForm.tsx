/* 
 * PIX FORM - Design System macOS
 * Seguindo o padrão de design estabelecido em page.tsx e BoletoForm.tsx
 * Cores: #0071e3 (Primary), #34c759 (Success), #f5f5f7 (BG)
 * Tipografia: -apple-system, BlinkMacSystemFont
 */

import { Copy, Check, QrCode, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface PixData {
  payment_id: number;
  pixCode: string;
  qrCodeUrl: string;
}

interface PixFormProps {
  pixData: PixData | null;
  loading?: boolean;
}

export default function PixForm({ pixData, loading }: PixFormProps) {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleCopy = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[#34c759] to-[#30d158] rounded-2xl p-8 text-white text-center shadow-md">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <Image 
              src="/Mascote/banners/Camaleão_15.png" 
              alt="Mascote aguardando"
              width={128}
              height={128}
              className="transition-transform duration-700 hover:scale-110"
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white/80 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            Gerando seu PIX...
          </h3>
          <p className="text-base font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            Aguarde um momento enquanto preparamos tudo!
          </p>
        </div>
      </div>
    );
  }

  if (!pixData) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-[#34c759] to-[#30d158] rounded-2xl p-8 text-white text-center relative overflow-hidden shadow-md">
          <div className="relative z-10">
            <div className="w-40 h-40 mx-auto mb-4 relative">
              <Image 
                src="/Mascote/banners/Camaleão_8.png" 
                alt="Mascote convidando"
                width={150}
                height={150}
              />
            </div>
            <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Pronto para Gerar seu PIX?
            </h3>
            <p className="text-base font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Clique em Gerar PIX para obter o código de pagamento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Header com informações principais */}
        <div className="bg-gradient-to-br from-[#34c759] to-[#30d158] rounded-2xl p-5 text-white text-center relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 opacity-20 w-24 h-24">
            <Image 
              src="/Mascote/banners/Camaleão_25.png" 
              alt="Decoração"
              width={96}
              height={96}
              className="object-contain"
            />
          </div>
          <div className="relative z-10">
            <div className="w-20 h-20 mx-auto mb-3 relative">
              <Image 
                src="/Mascote/banners/Camaleão_12.png" 
                alt="Mascote feliz"
                width={80}
                height={80}
              />
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Pagamento via PIX
            </h3>
            <p className="text-sm font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Copie o código ou use o QR Code
            </p>
          </div>
        </div>

        {/* Seção principal - Código Copia e Cola em destaque */}
        <div className="bg-white rounded-2xl p-5 ring-1 ring-[#34c759] shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-700 text-lg" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Código PIX
            </h4>
            <div className="flex items-center text-xs text-[#34c759] font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              <div className="w-2 h-2 bg-[#34c759] rounded-full mr-2 animate-pulse"></div>
              Expira em 30min
            </div>
          </div>
          
          {/* Código PIX com melhor destaque visual */}
          <div className="bg-[#f5f5f7] border-2 border-dashed border-[#34c759] rounded-xl p-4 mb-4">
            <code className="text-sm text-gray-700 break-all block leading-relaxed" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
              {pixData.pixCode}
            </code>
          </div>

          {/* Botão de copiar mais proeminente */}
          <button
            onClick={handleCopy}
            className={`w-full text-white py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 font-semibold text-base shadow-md ${
              copied 
                ? 'bg-[#34c759]' 
                : 'bg-[#34c759] hover:bg-[#30d158] active:scale-[0.98]'
            }`}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            disabled={copied}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Código Copiado!' : 'Copiar Código PIX'}
          </button>
        </div>

        {/* QR Code colapsível (secundário) */}
        <div className="bg-white rounded-2xl overflow-hidden ring-1 ring-[#d2d2d7] shadow-sm">
          <button
            onClick={() => setShowQrCode(!showQrCode)}
            className="w-full p-4 flex items-center justify-between text-left hover:bg-[#f5f5f7] transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#34c759]/10 rounded-lg flex items-center justify-center">
                <QrCode className="w-5 h-5 text-[#34c759]" />
              </div>
              <span className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                Usar QR Code
              </span>
            </div>
            {showQrCode ? 
              <ChevronUp className="w-5 h-5 text-[#86868b]" /> : 
              <ChevronDown className="w-5 h-5 text-[#86868b]" />
            }
          </button>
          
          {showQrCode && (
            <div className="px-4 pb-4">
              <div className="bg-[#f5f5f7] rounded-xl p-5 text-center ring-1 ring-[#d2d2d7]">
                <div className="w-40 h-40 mx-auto relative bg-white rounded-lg p-2 shadow-sm">
                  <Image
                    src={pixData.qrCodeUrl}
                    alt="QR Code PIX"
                    width={160}
                    height={160}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <p className="text-xs text-[#86868b] mt-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  Aponte a câmera do seu banco para o QR Code
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Instruções compactas */}
        <div className="bg-[#e5f3ff] border border-[#b3d9ff] rounded-xl p-4 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 opacity-20 w-20 h-20">
            <Image 
              src="/Mascote/banners/Camaleão_18.png" 
              alt="Mascote ajudando"
              width={80}
              height={80}
              className="object-contain"
            />
          </div>
          <div className="relative z-10">
            <h5 className="font-semibold text-[#0071e3] mb-3 text-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              Como pagar:
            </h5>
            <div className="text-xs text-gray-700 space-y-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#0071e3] rounded-full flex-shrink-0"></div>
                <span>Abra o app do seu banco e escolha PIX</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#0071e3] rounded-full flex-shrink-0"></div>
                <span>Cole o código copiado ou escaneie o QR Code</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#0071e3] rounded-full flex-shrink-0"></div>
                <span>Confirme o pagamento</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#34c759] to-[#30d158] rounded-2xl p-8 text-white text-center relative overflow-hidden shadow-md">
        <div className="absolute top-0 left-0 opacity-20 w-32 h-32">
          <Image 
            src="/Mascote/banners/Camaleão_29.png" 
            alt="Decoração esquerda"
            width={128}
            height={128}
            className="object-contain"
          />
        </div>
        <div className="absolute bottom-0 right-0 opacity-20 w-32 h-32">
          <Image 
            src="/Mascote/banners/Camaleão_31.png" 
            alt="Decoração direita"
            width={128}
            height={128}
            className="object-contain"
          />
        </div>
        <div className="relative z-10">
          <div className="w-24 h-24 mx-auto mb-4 relative">
            <Image 
              src="/Mascote/banners/Camaleão_12.png" 
              alt="Mascote apresentando PIX"
              width={96}
              height={96}
            />
          </div>
          <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            Pagamento via PIX
          </h3>
          <p className="text-base font-normal mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            Escaneie o QR Code ou copie o código abaixo
          </p>
          <div className="bg-white/95 backdrop-blur-xl rounded-xl p-5 mt-4 shadow-lg ring-1 ring-white/20">
            <div className="w-48 h-48 bg-white rounded-lg mx-auto flex items-center justify-center relative p-2 shadow-sm">
              <Image
                src={pixData.qrCodeUrl}
                alt="QR Code PIX"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 relative overflow-hidden ring-1 ring-[#d2d2d7] shadow-sm">
        {copied && (
          <div className="absolute top-2 right-2 z-20 w-16 h-16 transition-transform duration-300 animate-bounce">
            <Image 
              src="/Mascote/banners/Camaleão_21.png" 
              alt="Mascote aprovando"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
        )}
        <h4 className="font-semibold text-gray-700 mb-4 text-lg" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          Código PIX Copia e Cola
        </h4>
        <div className="bg-[#f5f5f7] border-2 border-dashed border-[#d2d2d7] rounded-xl p-4">
          <div className="flex items-center justify-between gap-4">
            <code className="text-sm text-gray-700 break-all flex-1 pr-4" style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
              {pixData.pixCode}
            </code>
            <button
              onClick={handleCopy}
              className={`flex-shrink-0 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 font-semibold ${
                copied ? 'bg-[#34c759]' : 'bg-[#34c759] hover:bg-[#30d158] hover:shadow-md'
              }`}
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
              disabled={copied}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
        <p className="text-sm text-[#86868b] mt-4 flex items-center gap-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
          ⏰ O código PIX expira em 30 minutos.
        </p>
      </div>

      <div className="bg-[#e5f3ff] border border-[#b3d9ff] rounded-xl p-5 relative overflow-hidden">
        <div className="absolute bottom-0 right-0 opacity-30 w-24 h-24">
          <Image 
            src="/Mascote/banners/Camaleão_18.png" 
            alt="Mascote explicando"
            width={96}
            height={96}
            className="object-contain"
          />
        </div>
        <div className="relative z-10">
          <h5 className="font-semibold text-[#0071e3] mb-3 text-base" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            Como pagar:
          </h5>
          <ol className="text-sm text-gray-700 space-y-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            <li className="flex items-center gap-2">
              <span className="font-semibold">1.</span> Abra o app do seu banco
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">2.</span> Escolha a opção PIX
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">3.</span> Escaneie o QR Code ou cole o código
            </li>
            <li className="flex items-center gap-2">
              <span className="font-semibold">4.</span> Confirme o pagamento e pronto!
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}