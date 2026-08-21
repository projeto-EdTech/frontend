import { NORTE, NORDESTE, CENTRO_OESTE, SUDESTE, SUL } from './Library.constants';
import { type University } from '@/types/university';

export const getRegionColorClass = (stateName?: string) => {
  if (!stateName) return "bg-gray-400";
  if (NORTE.has(stateName)) return "bg-green-500";
  if (NORDESTE.has(stateName)) return "bg-red-500";
  if (CENTRO_OESTE.has(stateName)) return "bg-amber-700";
  if (SUDESTE.has(stateName)) return "bg-yellow-400";
  if (SUL.has(stateName)) return "bg-blue-500";
  return "bg-gray-400";
};

export const getUniversityLink = (university: University, selectedYear: number | null) => {
  if (!university.slug) return '#';
  
  let targetYear;
  if (selectedYear === null) {
    targetYear = Array.isArray(university.year) && university.year.length > 0 
      ? Math.max(...university.year) 
      : 2025; // Default fallback
  } else {
    targetYear = selectedYear;
  }

  return `/library/${university.slug}?year=${targetYear}`;
};
