/* 
 * BOLETO FORM - Design System macOS
 * Seguindo o padrão de design estabelecido em page.tsx
 * Cores: #0071e3 (Primary), #34c759 (Success), #f5f5f7 (BG)
 * Tipografia: -apple-system, BlinkMacSystemFont
 */

import { Copy, Check, Download, Lock, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { PENDING_PAYMENT_KEY } from '@/app/service/pendingPayment';

// Dados do pagador que o componente recebe de fora (via props).
// Sem e-mail de propósito: o titular da cobrança é o dono da sessão, resolvido no BFF Java.
// Mesmo shape das rotas de cartão e PIX — um contrato só para os três métodos de pagamento.
interface PayerData {
    first_name: string;
    last_name: string;
    identification: {
        type: string; // Ex: 'CPF'
        number: string;
    };
}

// Formato dos dados do boleto que esperamos da nossa API
interface BoletoData {
    payment_id: number | string;
    boleto_code: string;
    due_date: string;
    boleto_url: string;
}

// Estrutura para o estado do endereço
interface AddressData {
    cep: string;
    rua: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
}

// Props que o componente espera receber
interface BoletoFormProps {
    payerData: PayerData;
    transactionAmount: number;
    /** Plano comprado. Vai para a metadata do pagamento e é o que o webhook usa para ativar o tier. */
    planId: string;
}


export default function BoletoForm({ payerData, transactionAmount, planId }: BoletoFormProps) {
    // --- ESTADOS INTERNOS DO COMPONENTE ---
    const [address, setAddress] = useState<AddressData>({
        cep: '', rua: '', numero: '', bairro: '', cidade: '', estado: ''
    });
    const [boletoData, setBoletoData] = useState<BoletoData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isFetchingCep, setIsFetchingCep] = useState(false);
    const [copied, setCopied] = useState(false);

    // Efeito para buscar endereço quando o CEP muda
    useEffect(() => {
        const cleanedCep = address.cep.replace(/\D/g, '');
        if (cleanedCep.length === 8) {
            fetchAddressFromCep(cleanedCep);
        }
    }, [address.cep]);

    // Busca o endereço na API ViaCEP
    const fetchAddressFromCep = async (cep: string) => {
        setIsFetchingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (data.erro) {
                console.warn("CEP não encontrado.");
            } else {
                setAddress(prev => ({
                    ...prev,
                    rua: data.logradouro || '',
                    bairro: data.bairro || '',
                    cidade: data.localidade || '',
                    estado: data.uf || ''
                }));
            }
        } catch (error) {
            console.error("Falha ao buscar endereço:", error);
            setError("Não foi possível buscar o endereço pelo CEP.");
        } finally {
            setIsFetchingCep(false);
        }
    };

    // Atualiza o estado do formulário
    const handleInputChange = (field: keyof AddressData, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }));
    };

    // LÓGICA PRINCIPAL: Chama a API para gerar o boleto
    const handleGenerate = async () => {
        if (Object.values(address).some(field => field.trim() === '')) {
            setError('Por favor, preencha todos os campos de endereço.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiRequestBody = {
                // Valor e e-mail não vão daqui: o BFF Java resolve o preço na gateway e usa o
                // e-mail da sessão. `transactionAmount` serve apenas para exibição.
                // Sem o `planId` o webhook não sabe qual tier ativar quando o boleto for pago.
                planId,
                payer: {
                    ...payerData,
                    address: {
                        zip_code: address.cep.replace(/\D/g, ''),
                        street_name: address.rua,
                        street_number: address.numero,
                        neighborhood: address.bairro,
                        city: address.cidade,
                        federal_unit: address.estado
                    }
                }
            };

            const response = await fetch('/api/process-subscription/boleto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(apiRequestBody)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Não foi possível gerar o boleto.');
            }

            setBoletoData(result);

            // O boleto compensa em dias — o aluno fecha o navegador muito antes. Guardar o id
            // é o que permite `usePendingPaymentReconciliation` perguntar de novo no próximo
            // acesso e ativar o tier. Não é credencial: é o mesmo id que aparece na tela, e o
            // servidor reconsulta o Mercado Pago antes de liberar qualquer coisa.
            if (result?.payment_id) {
                localStorage.setItem(
                    PENDING_PAYMENT_KEY,
                    JSON.stringify({
                        gateway: 'mercadopago',
                        paymentId: String(result.payment_id),
                        criadoEm: Date.now(),
                    })
                );
            }

        } catch (err: unknown) {
            console.error('--- ERRO AO GERAR BOLETO (FRONTEND) ---', err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocorreu um erro desconhecido.');
            }
        } finally {
            setLoading(false);
        }
    };
    
    // Funções auxiliares para a tela de sucesso
    const handleCopy = () => {
        if (boletoData?.boleto_code) {
            navigator.clipboard.writeText(boletoData.boleto_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownload = () => {
        if (boletoData?.boleto_url) {
            window.open(boletoData.boleto_url, '_blank');
        }
    };

    // 1. ESTADO DE SUCESSO
    if (boletoData) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-gradient-to-br from-[#34c759] to-[#30d158] rounded-2xl p-8 text-white text-center shadow-lg relative overflow-hidden">
                    {/* Mascote comemorando no canto */}
                    <div className="absolute -bottom-2 -right-2 opacity-20">
                        <Image 
                            src="/Mascote/banners/Camaleão_1.png" 
                            alt="Mascote comemorando" 
                            width={120} 
                            height={120}
                            className="transform scale-x-[-1]"
                        />
                    </div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                            <Check className="w-9 h-9 text-white" />
                        </div>
                        <h3 className="text-2xl font-semibold mb-3" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            Boleto Gerado com Sucesso!
                        </h3>
                        <p className="text-base font-medium" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            Vencimento: {new Date(boletoData.due_date).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>
                
                <div className="bg-[#f5f5f7] rounded-xl p-5 ring-1 ring-[#d2d2d7]">
                    <label className="text-xs font-semibold text-[#86868b] mb-2 block uppercase tracking-wide" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        Linha Digitável (Copia e Cola)
                    </label>
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            readOnly
                            value={boletoData.boleto_code}
                            className="flex-1 bg-white text-gray-700 text-sm p-3 rounded-lg font-mono border border-[#d2d2d7] focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                            style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}
                        />
                        <button 
                            onClick={handleCopy} 
                            className="p-3 bg-white rounded-lg hover:bg-[#f5f5f7] transition-all duration-200 border border-[#d2d2d7] hover:border-[#86868b] hover:shadow-sm"
                        >
                            {copied ? <Check className="w-5 h-5 text-[#34c759]" /> : <Copy className="w-5 h-5 text-gray-700" />}
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleDownload}
                    className="w-full bg-[#1d1d1f] text-white py-4 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-3 hover:bg-[#2d2d2f] transition-all duration-300 hover:shadow-lg"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                    <Download className="w-5 h-5" />
                    Baixar Boleto (PDF)
                </button>
            </div>
        );
    }
    
    // 2. ESTADO INICIAL E DE ERRO (Formulário)
    return (
        <div className="space-y-6">
            {error && (
                 <div className="bg-[#fff5f5] border-l-4 border-[#ff3b30] text-[#ff3b30] p-4 rounded-xl flex items-center gap-3 relative overflow-hidden shadow-sm" role="alert">
                    <div className="w-10 h-10 bg-[#ff3b30]/10 rounded-lg flex items-center justify-center flex-shrink-0 relative z-10">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <div className="relative z-10">
                        <p className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Ocorreu um erro</p>
                        <p className="text-sm text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{error}</p>
                    </div>
                </div>
            )}
            
            <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-[#f5f5f7] rounded-xl flex items-center justify-center ring-1 ring-[#d2d2d7]">
                    <Image 
                        src="/Mascote/banners/Camaleão_5.png" 
                        alt="Mascote" 
                        width={50} 
                        height={50}
                        className="inline-block"
                    />
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        Endereço para o Boleto
                    </h3>
                    <p className="text-sm text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        O Mercado Pago exige o endereço completo para boletos registrados.
                    </p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { field: "cep", label: "CEP", placeholder: "00000-000", loading: isFetchingCep, colSpan: 'md:col-span-1' },
                    { field: "rua", label: "Rua", placeholder: "Av. Brasil", colSpan: 'md:col-span-3' },
                    { field: "numero", label: "Número", placeholder: "123", colSpan: 'md:col-span-1' },
                    { field: "bairro", label: "Bairro", placeholder: "Centro", colSpan: 'md:col-span-3' },
                    { field: "cidade", label: "Cidade", placeholder: "São Paulo", colSpan: 'md:col-span-2' },
                    { field: "estado", label: "Estado (UF)", placeholder: "SP", colSpan: 'md:col-span-2' }
                ].map((input) => (
                    <div key={input.field} className={`relative ${input.colSpan}`}>
                        <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            {input.label}
                        </label>
                        <input
                            type="text"
                            placeholder={input.placeholder}
                            value={address[input.field as keyof AddressData]}
                            onChange={(e) => handleInputChange(input.field as keyof AddressData, e.target.value)}
                            disabled={isFetchingCep && input.field !== 'cep' || loading}
                            className="w-full px-4 py-3 border border-[#d2d2d7] rounded-xl focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all duration-200 disabled:bg-[#f5f5f7] disabled:text-[#86868b] disabled:cursor-not-allowed"
                            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                        />
                        {input.loading && (
                            <div className="absolute right-3 top-11">
                                <Loader2 className="w-5 h-5 text-[#0071e3] animate-spin" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <button
                onClick={handleGenerate}
                disabled={loading || isFetchingCep}
                className="w-full bg-[#0071e3] text-white py-4 px-6 rounded-xl font-semibold text-base flex items-center justify-center gap-3 hover:bg-[#0077ed] transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
                {/* Mascote no botão (aparece no hover) */}
                <div className="relative z-10 flex items-center gap-3">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
                    {loading ? 'Processando...' : 'Gerar Boleto Seguro'}
                </div>
            </button>
        </div>
    );
}

