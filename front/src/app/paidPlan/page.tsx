"use client"

/* 
 * ESTILO MACOS - Design System
 * Cores principais:
 * - Azul: #0071e3 (Primary)
 * - Verde: #34c759 (Success)
 * - Laranja: #ff9500 (Warning)
 * - Cinza Claro: #f5f5f7 (Background)
 * - Cinza Médio: #86868b (Secondary Text)
 * - Cinza Escuro: #1d1d1f (Primary Text)
 * - Borda: #d2d2d7
 * 
 * Tipografia: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto
 * Bordas: rounded-xl (12px), rounded-2xl (16px)
 * Sombras: shadow-md, shadow-lg
 * Transições: duration-300, duration-500
 */

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CreditCardForm from "@/components/payment/CreditCardForm";
import PixForm from "@/components/payment/PixForm";
import BoletoForm from "@/components/payment/BoletoForm";
import { Check, CreditCard, Smartphone, FileText, Shield, Sparkles, ArrowRight, Lock, Users, Clock, ArrowLeft, NotebookPen, Library, ChartNoAxesCombined, Bot, CalendarDays, ChartSpline } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { initMercadoPago } from '@mercadopago/sdk-react';
import Image from 'next/image';

interface PaidPlanFormData {
    plano: string;
    nomeCompleto: string;
    email: string;
    "CPF/CNPJ": string;
    address: string;
    paymentType: string;
    aceite: boolean;
}

interface PixData {
    payment_id: number;
    pixCode: string;
    qrCodeUrl: string;
}

export default function ModernPaidPlan() {
    // 2. INICIALIZE O MERCADO PAGO COM SUA PUBLIC KEY
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_KEY!,{
        locale: 'pt-BR',
    });
    const { data: session } = useSession();
    const planos = [
        {
            id: "anual",
            nome: "Simula Pro Anual",
            descricao: "O melhor custo-benefício",
            precoMensal: 41.5,
            precoTotal: 497,
            desconto: "Estude o ano todo e ganhe 2 meses grátis!",
            popular: true,
            beneficios: [
                { texto: "Acesso ilimitado a simulados", icone: <NotebookPen className="w-5 h-5 text-emerald-500" /> },
                { texto: "Biblioteca de provas", icone: <Library className="w-5 h-5 text-emerald-500" /> },
                { texto: "Estatísticas de desempenho em tempo real", icone: <ChartNoAxesCombined className="w-5 h-5 text-emerald-500" /> },
                { texto: "Questões de provas resolvidas com IA", icone: <Bot className="w-5 h-5 text-emerald-500" /> },
                { texto: "Plano de estudos otimizado", icone: <CalendarDays className="w-5 h-5 text-emerald-500" /> },
                { texto: "Estatísticas avançadas", icone: <ChartSpline className="w-5 h-5 text-emerald-500" /> },
                { texto: "Suporte prioritário 24/7", icone: <Users className="w-5 h-5 text-emerald-500" /> }
            ]
        },
        {
            id: "mensal",
            nome: "Simula Pro Mensal",
            descricao: "Flexibilidade total",
            precoMensal: 50,
            precoTotal: 50,
            popular: false,
            beneficios: [
                { texto: "Acesso ilimitado a simulados", icone: <NotebookPen className="w-5 h-5 text-emerald-500" /> },
                { texto: "Biblioteca de provas", icone: <Library className="w-5 h-5 text-emerald-500" /> },
                { texto: "Estatísticas de desempenho em tempo real", icone: <ChartNoAxesCombined className="w-5 h-5 text-emerald-500" /> },
                { texto: "Questões de provas resolvidas com IA", icone: <Bot className="w-5 h-5 text-emerald-500" /> },
                { texto: "Plano de estudos otimizado", icone: <CalendarDays className="w-5 h-5 text-emerald-500" /> },
                { texto: "Estatísticas avançadas", icone: <ChartSpline className="w-5 h-5 text-emerald-500" /> },
                { texto: "Suporte prioritário 24/7", icone: <Users className="w-5 h-5 text-emerald-500" /> }
            ]
        }
    ];

    const [currentPage, setCurrentPage] = useState("plan-selection"); // plan-selection, payment-details, payment-success
    const [planoSelecionado, setPlanoSelecionado] = useState("anual");
    const [formData, setFormData] = useState<PaidPlanFormData>({
        plano: "anual",
        nomeCompleto: "",
        email: "",
        "CPF/CNPJ": "",
        address: "",
        paymentType: "",
        aceite: false
    });
    
    const [, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    // Dados simulados para PIX
    const [pixData, setPixData] = useState<PixData | null>(null);
    const [loadingPix, setLoadingPix] = useState(false);

    const availablePaymentMethods = useMemo(() => {
        const allMethods = [
            {
                id: "cartao",
                name: "Cartão de Crédito",
                description: "Visa, Mastercard, Elo e mais",
                icon: <CreditCard className="w-6 h-6" />,
                badge: "Mais usado",
                color: "blue"
            },
            {
                id: "Pix",
                name: "PIX",
                description: "Pagamento instantâneo",
                icon: <Smartphone className="w-6 h-6" />,
                color: "emerald"
            },
            {
                id: "boleto",
                name: "Boleto Bancário",
                description: "Vencimento em 3 dias úteis",
                icon: <FileText className="w-6 h-6" />,
                color: "orange"
            }
        ];

        if (planoSelecionado === 'mensal') {
            // Se o plano for mensal, retorna APENAS a opção de cartão.
            return allMethods.filter(method => method.id === 'cartao');
        }

        // Para qualquer outro plano (ex: anual), retorna todas as opções.
        return allMethods;
    }, [planoSelecionado]);


    useEffect(() => {
        if (session) {
            setFormData(prev => ({
                ...prev,
                nomeCompleto: session.user?.name || "",
                email: session.user?.email || ""
            }));
        }
    }, [session]);

    const handleInputChange = (field: keyof PaidPlanFormData, value: string | boolean) => {
        // Verifica se o campo é o de CPF/CNPJ
        if (field === "CPF/CNPJ" && typeof value === 'string') {
            // 1. Remove tudo que não for dígito.
            const digitsOnly = value.replace(/\D/g, '');

            // 2. Limita a entrada a 14 caracteres (tamanho máximo de um CNPJ)
            const limitedValue = digitsOnly.slice(0, 14);

            // 3. Atualiza o estado APENAS com os dígitos limpos e limitados.
            setFormData(prev => ({ ...prev, [field]: limitedValue }));

        } else {
            // Para todos os outros campos, o comportamento continua o mesmo.
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const validateForm = () => {
        return formData.nomeCompleto && 
               formData.email && 
               formData["CPF/CNPJ"] && 
               formData.address && 
               formData.paymentType && 
               formData.aceite;
    };

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        if (!validateForm()) {
            alert("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        setCurrentPage("payment-details");
        setStep(2);
    }

    async function processPayment(cardFormData: {
        token: string;
        issuer_id: string;
        payment_method_id: string;
        installments: number;
    }) {
        setLoading(true);
        console.log("Dados do Brick recebidos, enviando para o backend...", cardFormData);

        const nomeCompleto = formData.nomeCompleto.split(' ');
        const firstName = nomeCompleto[0];
        const lastName = nomeCompleto.slice(1).join(' ');


        try {
            const response = await fetch('/api/process-subscription/credit-card', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: cardFormData.token,
                    issuer_id: cardFormData.issuer_id,
                    payment_method_id: cardFormData.payment_method_id,
                    transaction_amount: selectedPlan?.precoTotal,
                    installments: cardFormData.installments,
                    payer: {
                        email: formData.email,
                        first_name: firstName,
                        last_name: lastName,
                        identification: {
                            type: 'CPF',
                            number: formData['CPF/CNPJ'].replace(/\D/g, ''),
                        }
                    },
                    planId: planoSelecionado,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                // Se o backend retornar um erro, ele será capturado aqui
                throw new Error(result.message || 'Erro ao processar a assinatura.');
            }

            console.log("Assinatura criada:", result);
            setStep(3); // Avança para a etapa de confirmação
            setCurrentPage("payment-success"); 

        } catch (error: unknown) {
            console.error("Erro ao processar pagamento:", error);
            alert(`Falha no pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    }

    function handlePaymentError(error: unknown) {
        // Função para lidar com erros gerados pelo Brick (ex: cartão inválido)
        console.error("Erro no formulário de pagamento:", error);
        alert(`Ocorreu um erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }

    const processPixPayment = async () => {
        if (pixData) return; // Não gera um novo PIX se já existir um
        
        setLoadingPix(true);
      
        const nameParts = formData.nomeCompleto.trim().split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;
        const selectedPlan = planos.find(p => p.id === planoSelecionado);

        try {
            const response = await fetch('/api/process-subscription/pix', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    transaction_amount: selectedPlan?.precoTotal,
                    payer: {
                        email: formData.email,
                        first_name: firstName,
                        last_name: lastName,
                        identification: {
                            type: 'CPF',
                            number: formData['CPF/CNPJ'].replace(/\D/g, ''),
                        },
                    },
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erro ao criar pagamento PIX');
            }
            
            if (!result.qr_code || !result.qr_code_base64 || !result.payment_id) {
                 throw new Error('A resposta da API não continha os dados do PIX esperados.');
            }

            setPixData({
                payment_id: result.payment_id,
                pixCode: result.qr_code,
                qrCodeUrl: `data:image/jpeg;base64,${result.qr_code_base64}`,
            });

        } catch (error) {
            console.error("Erro ao processar pagamento PIX:", error);
            alert(`Falha ao gerar PIX: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setLoadingPix(false);
        }
    };

    // Nota: a geração de boleto é tratada pelo componente `BoletoForm` quando o usuário escolhe essa forma de pagamento.

    const selectedPlan = planos.find(p => p.id === planoSelecionado);

    if (currentPage === "payment-details") {
        // 👇 ADICIONE ESTE BLOCO DE CÓDIGO AQUI
        // Prepara os dados do pagador a partir do formulário
        const nomeCompleto = formData.nomeCompleto.trim().split(/\s+/);
        const firstName = nomeCompleto[0] || '';
        const lastName = nomeCompleto.slice(1).join(' ') || '';
        const cleanedCpf = formData["CPF/CNPJ"].replace(/\D/g, '');

        const payerData = {
            firstName: firstName,
            lastName: lastName,
            email: formData.email,
            identification: {
                type: 'CPF',
                number: cleanedCpf,
            }
        };

        return (
            <div className="min-h-screen bg-[#f5f5f7]">
                <Header />
                
                <main className="max-w-6xl mx-auto py-12 px-6">
                    {/* Back Button */}
                    <button
                        onClick={() => {
                            setCurrentPage("plan-selection");
                            setStep(1);
                        }}
                        className="flex items-center gap-2 text-[#0071e3] hover:opacity-80 mb-8 font-medium transition-all"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Voltar para seleção do plano
                    </button>

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center mb-12">
                        <div className="flex items-center space-x-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
                                        step >= i ? 'bg-[#0071e3] text-white shadow-lg' : 'bg-[#e8e8ed] text-[#86868b]'
                                    }`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                        {i}
                                    </div>
                                    {i < 3 && (
                                        <div className={`w-20 h-0.5 mx-3 rounded-full transition-all duration-500 ${
                                            step > i ? 'bg-[#0071e3]' : 'bg-[#e8e8ed]'
                                        }`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Payment Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-[#d2d2d7]">
                                <h2 className="text-2xl font-semibold text-gray-700 mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                    {formData.paymentType === "cartao" && "Dados do Cartão"}
                                    {formData.paymentType === "Pix" && "Pagamento via PIX"}
                                    {formData.paymentType === "boleto" && "Boleto Bancário"}
                                </h2>

                                {formData.paymentType === "cartao" && (
                                    <CreditCardForm
                                        key={payerData.identification.number}
                                        selectedPlan={selectedPlan}
                                        onSubmit={processPayment}
                                        onError={handlePaymentError}
                                        payerData={payerData}
                                    />
                                )}
                                {formData.paymentType === "Pix" && <PixForm pixData={pixData} loading={loadingPix} />}
                                {formData.paymentType === "boleto" && (
                                    <BoletoForm
                                        payerData={{
                                            email: formData.email,
                                            firstName: formData.nomeCompleto.split(' ')[0],
                                            lastName: formData.nomeCompleto.split(' ').slice(1).join(' ') || formData.nomeCompleto.split(' ')[0],
                                            docType: 'CPF', // Assumindo CPF, ajuste se necessário
                                            docNumber: formData['CPF/CNPJ'].replace(/\D/g, '')
                                        }}
                                        transactionAmount={selectedPlan?.precoTotal || 0}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-md ring-1 ring-[#d2d2d7] sticky top-6">
                                <h3 className="text-xl font-semibold text-gray-700 mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Resumo do Pedido</h3>
                                
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Plano:</span>
                                        <span className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{selectedPlan?.nome}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Período:</span>
                                        <span className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                            {selectedPlan?.id === "anual" ? "12 meses" : "1 mês"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Cliente:</span>
                                        <span className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{formData.nomeCompleto}</span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between text-lg">
                                        <span className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Total:</span>
                                        <span className="font-semibold text-[#0071e3]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                            R$ {selectedPlan?.precoTotal.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Mostrar botão apenas para PIX (removido botão "Gerar Boleto" da seção direita) */}
                                {formData.paymentType === 'Pix' && (
                                    <button
                                        onClick={processPixPayment}
                                        disabled={loadingPix || !!pixData}
                                        className="w-full bg-[#0071e3] text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-[#0077ed] transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                                    >
                                        {loadingPix ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Gerando PIX...
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center gap-3">
                                                <Lock className="w-5 h-5" />
                                                {pixData ? "Aguardando Pagamento" : "Gerar PIX"}
                                            </div>
                                        )}
                                    </button>
                                )}

                                <p className="text-xs text-[#86868b] mt-4 text-center" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                    🔒 Transação 100% segura e criptografada
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    if (currentPage === "payment-success") {
        return (
            <div className="min-h-screen bg-[#f5f5f7]">
                <Header />
                
                <main className="max-w-5xl mx-auto py-12 px-6">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center mb-12">
                        <div className="flex items-center space-x-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
                                        step >= i ? 'bg-[#34c759] text-white shadow-lg' : 'bg-[#e8e8ed] text-[#86868b]'
                                    }`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                        {step >= i ? <Check className="w-6 h-6" /> : i}
                                    </div>
                                    {i < 3 && (
                                        <div className={`w-20 h-0.5 mx-3 rounded-full transition-all duration-500 ${
                                            step > i ? 'bg-[#34c759]' : 'bg-[#e8e8ed]'
                                        }`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Success Content */}
                    <div className="text-center space-y-8">
                        <div className="relative flex items-center justify-center">
                            {/* Mascote comemorando à esquerda */}
                            <div className="absolute -left-20 md:-left-32 top-1/2 -translate-y-1/2 hidden md:block transition-transform duration-700 hover:scale-110">
                                <Image 
                                    src="/Mascote/banners/Camaleão_17.png" 
                                    alt="Mascote comemorando" 
                                    width={120} 
                                    height={120}
                                    className="drop-shadow-2xl"
                                />
                            </div>
                            
                            <div className="w-32 h-32 bg-[#34c759] rounded-full flex items-center justify-center mx-auto shadow-xl">
                                <Check className="w-16 h-16 text-white" />
                            </div>
                            
                            {/* Mascote comemorando à direita */}
                            <div className="absolute -right-20 md:-right-32 top-1/2 -translate-y-1/2 hidden md:block transition-transform duration-700 hover:scale-110">
                                <Image 
                                    src="/Mascote/banners/Camaleão_22.png" 
                                    alt="Mascote feliz" 
                                    width={120} 
                                    height={120}
                                    className="drop-shadow-2xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-5xl md:text-6xl font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                Pagamento Confirmado!
                            </h1>
                            <p className="text-xl text-[#86868b] max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                Parabéns! Sua assinatura do <strong>{selectedPlan?.nome}</strong> foi ativada com sucesso.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-[#d2d2d7] max-w-2xl mx-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Detalhes da Compra</h3>
                                <div className="px-4 py-2 bg-[#d1f4e0] text-[#007a3d] rounded-full text-sm font-semibold" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                    ✅ Confirmado
                                </div>
                            </div>

                            <div className="space-y-4 text-left">
                                <div className="flex justify-between py-3 border-b border-gray-200">
                                    <span className="text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Plano:</span>
                                    <span className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{selectedPlan?.nome}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-200">
                                    <span className="text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Cliente:</span>
                                    <span className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{formData.nomeCompleto}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-200">
                                    <span className="text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>E-mail:</span>
                                    <span className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{formData.email}</span>
                                </div>
                                <div className="flex justify-between py-3 border-b border-gray-200">
                                    <span className="text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Formas de Pagamento:</span>
                                    <span className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                        {formData.paymentType === "cartao" && "Cartão de Crédito"}
                                        {formData.paymentType === "Pix" && "PIX"}
                                        {formData.paymentType === "boleto" && "Boleto Bancário"}
                                    </span>
                                </div>
                                <div className="flex justify-between py-3 text-lg">
                                    <span className="font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Total Pago:</span>
                                    <span className="font-semibold text-[#34c759]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                        R$ {selectedPlan?.precoTotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                            <button
                                onClick={() => window.location.href = "/library"}
                                className="flex-1 bg-[#0071e3] text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-[#0077ed] transition-all duration-300 hover:shadow-lg group"
                                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    Começar a Estudar
                                </div>
                            </button>

                            <button
                                onClick={() => window.location.href = "/profile"}
                                className="flex-1 bg-white ring-1 ring-[#d2d2d7] text-gray-700 py-4 px-6 rounded-xl font-semibold text-base hover:shadow-md hover:ring-[#86868b] transition-all duration-300"
                                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                            >
                                Ver Meu Perfil
                            </button>
                        </div>
                    </div>
                </main>

                <Footer />
            </div>
        );
    }

    // Página original de seleção do plano
    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            <Header />
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#0071e3] to-[#005bb5]">
                <div className="absolute inset-0 bg-black opacity-5"></div>
                <div className="absolute inset-0 backdrop-blur-3xl"></div>
                
                {/* Mascote no canto esquerdo - Centralizado verticalmente */}
                <div className="absolute left-4 md:left-12 top-1/2 -translate-y-1/2 hidden md:block transition-transform duration-700 hover:scale-110">
                    <Image 
                        src="/Mascote/banners/Camaleão_13.png" 
                        alt="Mascote Vestibuline" 
                        width={180} 
                        height={180}
                        className="drop-shadow-2xl"
                    />
                </div>

                {/* Mascote no canto direito - Centralizado verticalmente */}
                <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 hidden md:block transition-transform duration-700 hover:scale-110">
                    <Image 
                        src="/Mascote/banners/Camaleão_19.png" 
                        alt="Mascote Vestibuline" 
                        width={220} 
                        height={220}
                        className="drop-shadow-2xl"
                    />
                </div>
                
                {/* Floating elements */}
                <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute top-40 right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
                
                <div className="relative max-w-5xl mx-auto px-6 py-20 text-center text-white">
                    <div className="inline-flex items-center px-5 py-2.5 bg-white/15 backdrop-blur-xl rounded-full text-sm font-semibold mb-8 border border-white/20 shadow-lg">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Oferta Limitada no plano anual - 17% OFF
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        Evolua Sua Preparação para o Vestibular
                    </h1>
                    
                    <p className="text-xl md:text-2xl font-light mb-10 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        Transforme sua preparação com inteligência artificial e alcance seus objetivos mais rápido
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            <span>Mais de 50,000 questões</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            <span>Acesso imediato</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            <span>Garantia de 7 dias</span>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto py-16 px-6">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center mb-16">
                    <div className="flex items-center space-x-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-500 ${
                                    step >= i ? 'bg-[#0071e3] text-white shadow-lg' : 'bg-[#e8e8ed] text-[#86868b]'
                                }`} style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                    {i}
                                </div>
                                {i < 3 && (
                                    <div className={`w-20 h-0.5 mx-3 rounded-full transition-all duration-500 ${
                                        step > i ? 'bg-[#0071e3]' : 'bg-[#e8e8ed]'
                                    }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plan Selection */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <h2 className="text-4xl font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Escolha Seu Plano</h2>
                        </div>
                        <p className="text-[#86868b] text-lg font-normal" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Selecione o plano que melhor se adapta aos seus estudos</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {planos.map((plano) => (
                            <div
                                key={plano.id}
                                className={`relative group cursor-pointer transition-all duration-500 ${
                                    planoSelecionado === plano.id ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                                }`}
                                onClick={() => {
                                    setPlanoSelecionado(plano.id);
                                    handleInputChange("plano", plano.id);
                                }}
                            >
                                {plano.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                                        <div className="bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white px-6 py-2 rounded-full text-xs font-semibold shadow-lg uppercase tracking-wide" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                            ⭐ MAIS POPULAR
                                        </div>
                                    </div>
                                )}

                                <div className={`relative rounded-3xl p-8 h-full flex flex-col bg-white transition-all duration-500 ${
                                    planoSelecionado === plano.id 
                                        ? 'shadow-2xl ring-2 ring-[#0071e3]' 
                                        : 'shadow-md hover:shadow-xl ring-1 ring-[#d2d2d7]'
                                }`}>
                                    
                                    {/* Mascote no card */}
                                    <div className="absolute -top-0 -right-0 z-20 hidden md:block">
                                        <Image 
                                            src={plano.id === "anual" ? "/Mascote/banners/Camaleão_15.png" : "/Mascote/banners/Camaleão_11.png"}
                                            alt="Mascote plano" 
                                            width={90} 
                                            height={90}
                                            className="drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>
                                    
                                    {/* Gradient overlay for selected plan */}
                                    {planoSelecionado === plano.id && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#0071e3]/5 to-[#0077ed]/5 rounded-3xl"></div>
                                    )}

                                    <div className="relative z-10">
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-semibold text-gray-700 mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{plano.nome}</h3>
                                            <p className="text-[#86868b] mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>{plano.descricao}</p>
                                            
                                            {plano.id === "anual" && (
                                                <div className="inline-flex items-center bg-[#d1f4e0] text-[#007a3d] px-4 py-1.5 rounded-full text-sm font-semibold mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                                    💰 {plano.desconto}
                                                </div>
                                            )}

                                            <div className="mb-4">
                                                <div className="flex items-baseline justify-center gap-1">
                                                    <span className="text-5xl font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                                        R$ {plano.precoMensal.toFixed(2)}
                                                    </span>
                                                    <span className="text-lg text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>/mês</span>
                                                </div>
                                                <p className="text-sm text-[#86868b] mt-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                                    {plano.id === "anual" 
                                                        ? `R$ ${plano.precoTotal.toFixed(2)} cobrado em parcela única` 
                                                        : "Cobrança mensal, cancele quando quiser"
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <ul className="space-y-3 mb-8 flex-grow">
                                            {plano.beneficios.map((beneficio, idx) => (
                                                <li key={idx} className="flex items-center text-gray-700 transition-all" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                                    {beneficio.icone}
                                                    <span className="ml-3 text-[15px]">{beneficio.texto}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            type="button"
                                            className={`w-full py-3.5 px-6 rounded-xl font-semibold text-base transition-all duration-300 ${
                                                planoSelecionado === plano.id
                                                    ? 'bg-[#0071e3] text-white shadow-md hover:bg-[#0077ed]'
                                                    : 'bg-[#f5f5f7] text-gray-700 hover:bg-[#e8e8ed]'
                                            }`}
                                            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                                        >
                                            {planoSelecionado === plano.id ? (
                                                <span className="flex items-center justify-center">
                                                    <Check className="w-5 h-5 mr-2" />
                                                    Selecionado
                                                </span>
                                            ) : (
                                                <span className="flex items-center justify-center">
                                                    Selecionar Plano
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="space-y-8">
                    {/* Personal Information */}
                    <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-[#d2d2d7]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#0071e3] to-[#0077ed] rounded-xl flex items-center justify-center shadow-sm">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Informações Pessoais</h2>
                                <p className="text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Preencha seus dados para continuar</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { field: "nomeCompleto", label: "Nome Completo", type: "text", placeholder: "Digite seu nome completo" },
                                { field: "email", label: "E-mail", type: "email", placeholder: "exemplo@gmail.com" },
                                { field: "CPF/CNPJ", label: "CPF/CNPJ", type: "text", placeholder: "Digite seu CPF ou CNPJ" },
                                { field: "address", label: "Endereço", type: "text", placeholder: "Seu endereço completo" }
                            ].map((input) => (
                                <div key={input.field} className="group">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                        {input.label}
                                    </label>
                                    <input
                                        type={input.type}
                                        placeholder={input.placeholder}
                                        value={formData[input.field as keyof PaidPlanFormData] as string}
                                        onChange={(e) => handleInputChange(input.field as keyof PaidPlanFormData, e.target.value)}
                                        disabled={input.field === "nomeCompleto" || input.field === "email"}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10 transition-all duration-200 disabled:bg-[#f5f5f7] disabled:cursor-not-allowed disabled:text-[#86868b]"
                                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white rounded-2xl p-8 shadow-md ring-1 ring-[#d2d2d7]">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#34c759] to-[#30d158] rounded-xl flex items-center justify-center shadow-sm">
                                <CreditCard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Forma de Pagamento</h2>
                                <p className="text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Escolha como deseja pagar</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {availablePaymentMethods.map((payment) => (
                                <label key={payment.id} className="block cursor-pointer group">
                                    <div className={`relative p-5 rounded-xl border transition-all duration-300 ${
                                        formData.paymentType === payment.id
                                            ? 'border-[#0071e3] shadow-md bg-[#0071e3]/5'
                                            : 'border-gray-200 hover:border-[#86868b] bg-white'
                                    }`}>
                                        {payment.badge && (
                                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#ff9500] to-[#ff6b00] text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md uppercase tracking-wide" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                                {payment.badge}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4">
                                            <input
                                                type="radio"
                                                name="paymentType"
                                                value={payment.id}
                                                checked={formData.paymentType === payment.id}
                                                onChange={(e) => handleInputChange("paymentType", e.target.value)}
                                                className="w-5 h-5 text-[#0071e3] focus:ring-[#0071e3]"
                                            />
                                            
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                                payment.id === "cartao" ? "bg-[#0071e3]/10 text-[#0071e3]" :
                                                payment.id === "Pix" ? "bg-[#34c759]/10 text-[#34c759]" :
                                                "bg-[#ff9500]/10 text-[#ff9500]"
                                            }`}>
                                                {payment.icon}
                                            </div>

                                            <div className="flex-1">
                                                <div className="text-base font-semibold text-gray-700" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                                    {payment.name}
                                                </div>
                                                <div className="text-sm text-[#86868b]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                                    {payment.description}
                                                </div>
                                            </div>

                                            {formData.paymentType === payment.id && (
                                                <div className="w-8 h-8 bg-[#0071e3] rounded-full flex items-center justify-center">
                                                    <Check className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-gradient-to-br from-[#34c759] to-[#30d158] rounded-2xl p-8 relative overflow-hidden shadow-md">
                        {/* Mascote no canto */}
                        <div className="absolute right-6 -top-2 bottom-0 hidden md:block">
                            <Image 
                                src="/Mascote/banners/Camaleão_26.png" 
                                alt="Mascote seguro" 
                                width={120} 
                                height={120}
                                className="drop-shadow-xl"
                            />
                        </div>
                        
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center shadow-sm">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Segurança e Privacidade</h2>
                                <p className="text-white/90" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>Seus dados estão protegidos</p>
                            </div>
                        </div>

                        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-6 shadow-sm">
                            <label className="flex items-start gap-4 cursor-pointer group">
                                <div className="relative mt-1">
                                    <input
                                        type="checkbox"
                                        checked={formData.aceite}
                                        onChange={(e) => handleInputChange("aceite", e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                                        formData.aceite 
                                            ? 'bg-[#34c759] border-[#34c759]' 
                                            : 'border-gray-200 group-hover:border-[#34c759]'
                                    }`}>
                                        {formData.aceite && <Check className="w-4 h-4 text-white" />}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-700 leading-relaxed" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                                    Concordo com os{" "}
                                    <a href="/terms" className="text-[#0071e3] hover:underline font-semibold">
                                        Termos de Uso
                                    </a>{" "}
                                    e{" "}
                                    <a href="/privacy" className="text-[#0071e3] hover:underline font-semibold">
                                        Política de Privacidade
                                    </a>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={!validateForm()}
                            className="group relative inline-flex items-center justify-center px-12 py-4 text-lg font-semibold text-white transition-all duration-300 bg-[#0071e3] rounded-xl hover:bg-[#0077ed] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transform hover:-translate-y-0.5"
                            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                        >
                            <div className="relative flex items-center gap-3">
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                Continuar para Pagamento
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </button>

                        <p className="text-sm text-[#86868b] mt-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            Você será redirecionado para finalizar o pagamento
                        </p>
                    </div>
                </div>

                {/* Support Links */}
                <div className="text-center mt-10 space-y-2">
                    <a href="/contato" className="inline-block text-[#0071e3] hover:underline font-medium transition-colors" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        Dúvidas sobre os planos?
                    </a>
                    <br />
                    <a href="/contato" className="inline-block text-[#86868b] hover:text-gray-700 hover:underline transition-colors" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                        Como cancelar minha assinatura?
                    </a>
                </div>

                {/* Guarantee */}
                <div className="mt-12 bg-gradient-to-r from-[#34c759] to-[#30d158] rounded-2xl p-10 text-white text-center relative overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-white/5"></div>
                    <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                    
                    {/* Mascote com escudo */}
                    <div className="absolute left-0 top-0 bottom-0 hidden md:block">
                        <Image 
                            src="/Mascote/banners/Camaleão_24.png" 
                            alt="Mascote garantia" 
                            width={150} 
                            height={150}
                            className="drop-shadow-2xl"
                        />
                    </div>
                    
                    <div className="relative">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-3xl font-semibold mb-4" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            Garantia de 7 Dias ou Seu Dinheiro de Volta
                        </h3>
                        
                        <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            Teste nossa plataforma sem riscos. Se não ficar completamente satisfeito,
                            <strong> devolvemos 100% do seu investimento</strong>.
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                Reembolso rápido
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                Sem perguntas
                            </div>
                            <div className="flex items-center gap-2">
                                <Check className="w-5 h-5" />
                                100% seguro
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        <Footer />
        </div>
    );
}