"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

interface NavigationLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function NavigationLink({ href, children, className, style }: NavigationLinkProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsNavigating(true);
    router.push(href);
  };

  if (isNavigating) {
    return <LoadingScreen message="Carregando..." />
  }

  return (
    <Link 
      href={href} 
      onClick={handleNavigation}
      className={className}
      style={style}
    >
      {children}
    </Link>
  );
}
