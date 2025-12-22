"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react'; // Hook para pegar a sessão do usuário

export default function SubscribeButton() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = async () => {
        // Agora verifica se tanto o e-mail quanto o nome estão na sessão
        if (!session?.user?.email || !session?.user?.name) {
            setMessage("Informações do usuário incompletas. Faça login novamente.");
            return;
        }

        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Envia tanto o e-mail quanto o nome da sessão
                body: JSON.stringify({ 
                    email: session.user.email,
                    name: session.user.name,
                    newsletter: true
                }), 
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Inscrição realizada com sucesso! 🎉');
                setIsSubscribed(true); // Muda o estado para "Inscrito"
            } else {
                setMessage(`Falha: ${data.error || 'Ocorreu um erro.'}`);
            }
        } catch (error: unknown) {
            if (error instanceof SyntaxError) {
                setMessage('Corpo da requisição mal formatado.');
            } else {
                setMessage('Falha ao conectar. Tente novamente mais tarde.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Se o usuário não estiver autenticado, o botão não aparece
    if (status !== 'authenticated') {
        return null; 
    }

    // Se o usuário já estiver inscrito, mostra o botão desabilitado
    if (isSubscribed) {
        return (
            <button 
              disabled 
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold py-2 px-4 rounded-full cursor-not-allowed"
            >
                Inscrito ✓
            </button>
        );
    }

    return (
        <div className="space-y-3">
            <button 
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 cursor-pointer text-white font-bold py-2 px-4 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Inscrevendo...' : 'Inscrever-se'}
            </button>
            {message && <p className="text-xs text-center text-gray-600 dark:text-gray-400 pt-1">{message}</p>}
        </div>
    );
}

export { SubscribeButton };