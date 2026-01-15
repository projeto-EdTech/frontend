"use client";

import Image from "next/image";

export interface UniversityData {
  name: string;
  type: "federal" | "estadual" | "particular";
  location: string;
  color: string;
  logo?: string;
}

interface UniversityCardProps {
  university: UniversityData;
  isDark?: boolean;
}

export function UniversityCard({ university, isDark = false }: UniversityCardProps) {
  const typeLabels = {
    federal: "Federal",
    estadual: "Estadual",
    particular: "Particular",
  };

  const typeColors = {
    federal: "bg-blue-500",
    estadual: "bg-yellow-500",
    particular: "bg-purple-500",
  };

  return (
    <div
      className={`w-full max-w-md mx-auto rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.02] ${
        isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
      }`}
    >
      {/* Header com cor da universidade */}
      <div
        className="h-3 w-full"
        style={{ backgroundColor: university.color }}
      />

      <div className="p-5 flex items-center gap-4">
        {/* Logo da universidade */}
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 ${
            isDark ? "bg-gray-700" : "bg-gray-100"
          }`}
        >
          {university.logo ? (
            <Image
              src={university.logo}
              alt={`Logo ${university.name}`}
              width={56}
              height={56}
              className="object-contain"
            />
          ) : (
            <span className="text-2xl font-bold text-gray-400">
              {university.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <h3
            className={`font-bold text-lg truncate ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {university.name}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            {/* Badge do tipo */}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${
                typeColors[university.type]
              }`}
            >
              {typeLabels[university.type]}
            </span>

            {/* Localização */}
            <span
              className={`text-sm ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              📍 {university.location}
            </span>
          </div>

          {/* Barra de progresso decorativa */}
          <div className="mt-3">
            <div
              className={`h-1.5 rounded-full overflow-hidden ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              }`}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.random() * 40 + 60}%`,
                  backgroundColor: university.color,
                }}
              />
            </div>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Provas disponíveis
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
