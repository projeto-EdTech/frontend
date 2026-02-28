"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { decodeJWT } from '@/app/service/jwtDecoder';

export default function SubscribeButton() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Carrega o estado inicial do LocalStorage
    useEffect(() => {
        if (status === 'authenticated') {
            const storedToken = localStorage.getItem('user_data');
            if (storedToken) {
                const decoded = decodeJWT(storedToken);
                if (decoded) {
                    setIsSubscribed(!!decoded.newsLetter);
                }
            }
        }
    }, [status]);

    // Nota: updateLocalStorage foi removido pois o JWT no localStorage é imutável
    // O estado do newsletter será atualizado na próxima sincronização (SyncUserEffect)
    // ou ao recarregar a página/sessão.


    const handleSubscribe = async () => {
        if (!session?.user?.email) {
            setMessage("Você precisa estar logado para se inscrever.");
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            // Pegamos o token do nosso backend que está no localStorage
            const backendToken = localStorage.getItem('user_data');

            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email: session.user.email,
                    token: backendToken // Enviamos o token para a nossa API route
                }), 
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