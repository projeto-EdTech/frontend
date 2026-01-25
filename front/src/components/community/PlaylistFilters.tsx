"use client";

import { Search, User, BookOpen, Hash, Layers, Eraser, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";

interface PlaylistFiltersProps {
  titleFilter: string;
  setTitleFilter: (v: string) => void;
  creatorFilter: string;
  setCreatorFilter: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  tagFilter: string;
  setTagFilter: (v: string) => void;
  minQuestions: number[];
  setMinQuestions: (v: number[]) => void;
  clearFilters: () => void;
  activeFiltersCount: number;
  categories: string[];
  uniqueTitles: string[];
  uniqueCreators: string[];
  uniqueTags: string[];
}

// Componente Interno para Autocomplete customizado estilo macOS
function StyledAutocomplete({ 
  label, 
  icon: Icon, 
  placeholder, 
  value, 
  onChange, 
  options 
}: { 
  label: string, 
  icon: any, 
  placeholder: string, 
  value: string, 
  onChange: (v: string) => void, 
  options: string[] 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(value.toLowerCase())
  ).slice(0, 5);

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <Label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2 tracking-wider">
        <Icon className="w-3 h-3" /> {label}
      </Label>
      <div className="relative group">
        <Input 
          placeholder={placeholder} 
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="h-11 bg-gray-50/50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 transition-all rounded-xl pl-10"
        />
        <Icon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
      </div>

      <AnimatePresence mode="wait">
        {isOpen && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute left-0 right-0 z-[100] mt-2 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-2xl overflow-hidden p-1.5 ring-1 ring-black/5"
          >
            {filteredOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:bg-indigo-500 hover:text-white rounded-xl transition-all text-left cursor-pointer"
              >
                {opt}
                {value === opt && <Check className="w-4 h-4" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PlaylistFilters({
  titleFilter,
  setTitleFilter,
  creatorFilter,
  setCreatorFilter,
  selectedCategory,
  setSelectedCategory,
  tagFilter,
  setTagFilter,
  minQuestions,
  setMinQuestions,
  clearFilters,
  activeFiltersCount,
  categories,
  uniqueTitles,
  uniqueCreators,
  uniqueTags,
}: PlaylistFiltersProps) {
  return (
    <div className="bg-white/70 backdrop-blur-md border border-gray-200/50 rounded-[2rem] p-8 shadow-2xl mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {/* 1. Title Filter */}
      <StyledAutocomplete 
        label="Título da Playlist"
        icon={Search}
        placeholder="Ex: Matemática Básica..."
        value={titleFilter}
        onChange={setTitleFilter}
        options={uniqueTitles}
      />

      {/* 2. Creator Filter */}
      <StyledAutocomplete 
        label="Professor / Criador"
        icon={User}
        placeholder="Ex: Prof. Gustavo..."
        value={creatorFilter}
        onChange={setCreatorFilter}
        options={uniqueCreators}
      />

      {/* 3. Category Filter */}
       <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2 tracking-wider">
          <BookOpen className="w-3 h-3" /> Categoria
        </Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-11 bg-gray-50/50 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 transition-all">
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent className="bg-white/80 backdrop-blur-xl border-white rounded-2xl shadow-2xl p-1.5 ring-1 ring-black/5">
            <SelectItem value="all" className="rounded-xl focus:bg-indigo-500 focus:text-white transition-colors cursor-pointer py-2.5">
              Todas as Categorias
            </SelectItem>
            {categories.filter(c => c !== "all").map(c => (
              <SelectItem key={c} value={c} className="rounded-xl focus:bg-indigo-500 focus:text-white transition-colors cursor-pointer py-2.5">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 4. Tag Filter */}
      <StyledAutocomplete 
        label="Tags"
        icon={Hash}
        placeholder="Ex: enem, natureza..."
        value={tagFilter}
        onChange={setTagFilter}
        options={uniqueTags}
      />

       {/* 5. Questions Count Filter */}
       <div className="space-y-4">
        <div className="flex items-center justify-between">
           <Label className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2 tracking-wider">
              <Layers className="w-3 h-3" /> Mín. Questões
            </Label>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {minQuestions[0]} +
            </span>
        </div>
        
        <div className="relative pt-2">
           <div className="absolute top-1/2 left-0 right-0 h-2 -mt-1 rounded-full bg-gradient-to-r from-gray-200 via-indigo-200 to-indigo-500 opacity-50" />
           <Slider 
            defaultValue={[0]} 
            max={100} 
            step={5} 
            value={minQuestions}
            onValueChange={setMinQuestions}
            className="relative z-10 cursor-grab"
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-medium px-1">
            <span>0</span>
            <span>50</span>
            <span>100+</span>
        </div>
      </div>

       {/* Actions */}
       <div className="flex items-end">
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 gap-2 h-10"
            disabled={activeFiltersCount === 0}
          >
            <Eraser className="w-4 h-4" />
            Limpar Filtros
          </Button>
       </div>
    </div>
  );
}
