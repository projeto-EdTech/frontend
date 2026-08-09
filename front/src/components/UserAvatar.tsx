import React from 'react';
import Image from 'next/image';

// Props que o componente aceitará
interface UserAvatarProps {
  name: string;
  className?: string; // Para permitir customização de tamanho, etc.
  customIcon?: string; // Caminho para o ícone customizado do mascote
}

// Array de cores para variar os avatares
const avatarColors = [
  'from-blue-500 to-sky-500',
  'from-green-500 to-emerald-500',
  'from-purple-500 to-pink-500',
  'from-orange-500 to-red-500',
  'from-yellow-500 to-amber-500',
  'from-indigo-500 to-violet-500',
];

/**
 * Gera uma cor consistente baseada no nome do usuário.
 */
const getColorForName = (name: string): string => {
  if (!name) return avatarColors[0];
  // Simples cálculo de hash para pegar um índice do array de cores
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % avatarColors.length);
  return avatarColors[index];
};

const UserAvatar: React.FC<UserAvatarProps> = ({ name, className = '', customIcon }) => {
  // Se houver um ícone customizado, renderiza ele
  if (customIcon) {
    return (
      <div className={`relative group rounded-full overflow-hidden shadow-lg ${className}`}>
        <Image
          src={`/Mascote/Logos/${customIcon}`}
          alt={`Ícone de ${name}`}
          width={80}
          height={80}
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  // Caso contrário, usa o avatar padrão com iniciais
  // Pega a primeira letra do nome, ou '?' se não houver nome.
  const firstLetter = name ? name.charAt(0).toUpperCase() : '?';
  const bgColor = getColorForName(name);

  return (
    <div
      className={`relative group rounded-full bg-gradient-to-br ${bgColor} flex items-center justify-center text-white font-bold text-sm shadow-lg ${className}`}
    >
      <span className="relative z-10">{firstLetter}</span>
    </div>
  );
};

export default UserAvatar;