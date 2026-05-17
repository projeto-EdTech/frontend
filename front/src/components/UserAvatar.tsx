import React from 'react';
import Image from 'next/image';
import RankAvatarFrame from '@/components/ui/RankAvatarFrame';
import type { RankType } from '@/lib/rankUtils';

// Props que o componente aceitará
interface UserAvatarProps {
  name: string;
  className?: string; // Para permitir customização de tamanho, etc.
  customIcon?: string; // Caminho para o ícone customizado do mascote
  rank?: RankType | null; // Rank para exibir frame animado
  rankSize?: 'sm' | 'md' | 'lg'; // Tamanho do frame (default sm para header)
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

const UserAvatar: React.FC<UserAvatarProps> = ({ name, className = '', customIcon, rank, rankSize = 'sm' }) => {
  const avatarContent = customIcon ? (
    <div className={`relative group rounded-full overflow-hidden shadow-lg ${className}`}>
      <Image
        src={`/Mascote/Logos/${customIcon}`}
        alt={`Ícone de ${name}`}
        width={80}
        height={80}
        className="object-cover w-full h-full"
      />
    </div>
  ) : (
    <div
      className={`relative group rounded-full bg-gradient-to-br ${getColorForName(name)} flex items-center justify-center text-white font-bold text-sm shadow-lg ${className}`}
    >
      <span className="relative z-10">{name ? name.charAt(0).toUpperCase() : '?'}</span>
    </div>
  );

  if (!rank) return avatarContent;

  return (
    <RankAvatarFrame rank={rank} size={rankSize} showBadge={true}>
      {avatarContent}
    </RankAvatarFrame>
  );
};

export default UserAvatar;