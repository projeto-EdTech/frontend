"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Building, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { type CourseResult } from '@/types/nota-corte';

export default function CourseCard({ result, theme }: { result: CourseResult; theme: string }) {
  const isDark = theme === 'dark';
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const response = await fetch(`/api/get-logo?name=${encodeURIComponent(result.institution)}`);
        if (response.ok) {
          const data = await response.json();
          setLogoPath(data.path);
        } else {
          setLogoError(true);
        }
      } catch (err) {
        setLogoError(true);
      }
    };
    fetchLogo();
  }, [result.institution]);

  const visuals = {
    approved: {
      icon: CheckCircle,
      iconColor: isDark ? 'text-green-400' : 'text-green-600',
      bgColor: isDark ? 'bg-green-900/20' : 'bg-green-50/70',
      borderColor: isDark ? 'border-green-700/40' : 'border-green-200/40',
      textColor: isDark ? 'text-green-300' : 'text-green-700',
      badgeBg: isDark ? 'bg-green-900/40' : 'bg-green-100',
      label: 'Aprovado',
      gradient: isDark ? 'from-green-900/15 to-transparent' : 'from-green-100/40 to-transparent',
    },
    borderline: {
      icon: AlertTriangle,
      iconColor: isDark ? 'text-yellow-400' : 'text-yellow-600',
      bgColor: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50/70',
      borderColor: isDark ? 'border-yellow-700/40' : 'border-yellow-200/40',
      textColor: isDark ? 'text-yellow-300' : 'text-yellow-700',
      badgeBg: isDark ? 'bg-yellow-900/40' : 'bg-yellow-100',
      label: 'Quase lá',
      gradient: isDark ? 'from-yellow-900/15 to-transparent' : 'from-yellow-100/40 to-transparent',
    },
    reproved: {
      icon: XCircle,
      iconColor: isDark ? 'text-red-400' : 'text-red-600',
      bgColor: isDark ? 'bg-red-900/20' : 'bg-red-50/70',
      borderColor: isDark ? 'border-red-700/40' : 'border-red-200/40',
      textColor: isDark ? 'text-red-300' : 'text-red-700',
      badgeBg: isDark ? 'bg-red-900/40' : 'bg-red-100',
      label: 'Reprovado',
      gradient: isDark ? 'from-red-900/15 to-transparent' : 'from-red-100/40 to-transparent',
    },
  };

  const v = visuals[result.status];
  const Icon = v.icon;

  return (
    <div className={`relative p-5 rounded-xl border ${v.bgColor} ${v.borderColor} shadow-[0_2px_12px_rgba(0,0,0,0.04)] backdrop-blur-md overflow-hidden transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:scale-[1.02] group`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${v.gradient} opacity-60 group-hover:opacity-80 transition-opacity`}></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center gap-4 flex-1 pr-3">
            {logoPath && !logoError && (
              <div className={`relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border ${isDark ? 'bg-white border-gray-700/50' : 'bg-white border-gray-100'} shadow-sm flex items-center justify-center p-1.5 group-hover:scale-105 transition-transform duration-300`}>
                <Image 
                  src={logoPath}
                  alt={`Logo ${result.institution}`}
                  width={56}
                  height={56}
                  className="object-contain"
                  onError={() => setLogoError(true)}
                />
              </div>
            )}
            <div className="flex-1">
              <h3 className={`text-lg font-semibold mb-1 tracking-tight leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {result.courseName}
              </h3>
              <div className="flex items-center gap-1.5">
                <Building size={13} className={isDark ? 'text-gray-400' : 'text-gray-500'} strokeWidth={2.5} />
                <p className={`text-[12px] font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'} uppercase tracking-wider`}>
                  {result.institution}
                </p>
              </div>
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-semibold ${v.badgeBg} ${v.textColor} border ${v.borderColor} shadow-sm`}>
            <Icon size={16} strokeWidth={2} />
            <span>{v.label}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <div className={`${isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-white/60 border-gray-200/40'} p-3 rounded-lg border text-center transition-all hover:scale-[1.03]`}>
            <p className={`text-[11px] font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
              Sua Nota
            </p>
            <p className={`text-xl font-semibold tracking-tight ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              {result.userScore.toFixed(0)}%
            </p>
          </div>

          <div className={`${isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-white/60 border-gray-200/40'} p-3 rounded-lg border text-center transition-all hover:scale-[1.03]`}>
            <p className={`text-[11px] font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
              Corte
            </p>
            <p className={`text-xl font-semibold tracking-tight ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {result.cutoffScore.toFixed(0)}%
            </p>
          </div>

          <div className={`${isDark ? 'bg-gray-800/40 border-gray-700/40' : 'bg-white/60 border-gray-200/40'} p-3 rounded-lg border text-center transition-all hover:scale-[1.03]`}>
            <p className={`text-[11px] font-semibold mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'} uppercase tracking-wide`}>
              Diferença
            </p>
            <p className={`text-xl font-semibold tracking-tight ${result.difference >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
              {result.difference >= 0 ? '+' : ''}{result.difference.toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
