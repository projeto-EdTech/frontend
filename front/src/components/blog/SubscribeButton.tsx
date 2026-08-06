"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { fetchUserClaims } from '@/lib/userClaims';

export default function SubscribeButton() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    // O estado inicial vem do servidor, que lê o cookie HttpOnly e decodifica o JWT.
    // O cliente não tem (nem deve ter) o token para decodificar por conta própria.
    useEffect(() => {
        if (status !== 'authenticated') return;

        const controller = new AbortController();

        fetchUserClaims(controller.signal).then((claims) => {
            if (claims) setIsSubscribed(claims.newsletter);
        });

        return () => controller.abort();
    }, [status]);

    // O estado do newsletter só volta a refletir o backend na próxima sincronização
    // (SyncUserEffect) ou ao recarregar a página: o claim mora no JWT, que é imutável.


    const handleSubscribe = async () => {
        if (!session?.user?.email) {
            setMessage("Você precisa estar logado para se inscrever.");
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            // Sem token no corpo: o JWT sai do cookie `user_data`, lido no servidor. Um token
            // que o cliente escolhe qual mandar é um token que ele pode trocar pelo de outro.
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: session.user.email }),
            });

            const data = await response.json();

            if (response.ok) {
                // Verifica a mensagem retornada pelo backend para definir o estado
                const responseMessage = data.message || '';
                
                if (responseMessage.toLowerCase().includes('inscrito')) {
                    setIsSubscribed((prev) => !prev);
                    setMessage(responseMessage);
                }
            } else {
                setMessage(`Falha: ${data.error || 'Ocorreu um erro.'}`);
            }
        } catch (error) {
           console.error(error);
           setMessage('Falha ao conectar. Tente novamente mais tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    if (status !== 'authenticated') {
        return null; 
    }

    if (isSubscribed) {
        return (
            <div className="space-y-3">
                <button 
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                    {isLoading ? 'Processando...' : (
                        <>
                            Inscrito <span>✓</span>
                        </>
                    )}
                </button>
                {message && <p className="text-xs text-center text-gray-600 dark:text-gray-400 pt-1">{message}</p>}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <button 
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer text-white font-bold py-2 px-4 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Processando...' : 'Inscrever-se'}
            </button>
            {message && <p className="text-xs text-center text-gray-600 dark:text-gray-400 pt-1">{message}</p>}
        </div>
    );
}

export { SubscribeButton };