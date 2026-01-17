"use client"

import type React from "react"
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Edit, Settings } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";

interface UserConfigProps {
  formData: {
    fullName: string;
    email: string;
    institution: string;
    targetExam: string;
    targetCourse: string;
    profileIcon: string;
    useInitialAvatar: boolean;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    fullName: string;
    email: string;
    institution: string;
    targetExam: string;
    targetCourse: string;
    profileIcon: string;
    useInitialAvatar: boolean;
  }>>;
  onSave: () => void;
  onCancel: () => void;
}

export default function UserConfig({ formData, setFormData, onSave, onCancel }: UserConfigProps) {
  const { data: session } = useSession();
  const [isIconModalOpen, setIsIconModalOpen] = useState(false);
  const [universitiesList, setUniversitiesList] = useState<{ name: string; slug: string }[]>([]);
  const [coursesList, setCoursesList] = useState<string[]>([]);
  const [filteredExams, setFilteredExams] = useState<string[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [showExamAutocomplete, setShowExamAutocomplete] = useState(false);
  const [showCourseAutocomplete, setShowCourseAutocomplete] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ targetExam?: string; targetCourse?: string }>({});

  // Carregar dados das universidades para o autocomplete
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch('/api/universities');
        if (response.ok) {
          const data = await response.json();
          setUniversitiesList(data);
        }
      } catch (error) {
        console.error("Erro ao buscar universidades:", error);
      }
    };
    fetchUniversities();
  }, []);

  // Carregar dados dos cursos para o autocomplete
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Como a rota Nota-corte é POST, podemos ter que adaptar ou usar os dados diretamente se houver um GET.
        // Se não houver GET, buscamos de dataNotaCorte.ts (simulando a API)
        const response = await fetch('/api/Nota-corte', {
          method: 'POST',
          body: JSON.stringify({ userScore: 0, targetCourse: '' })
        });
        if (response.ok) {
          const data = await response.json();
          const uniqueCourses = Array.from(new Set(data.allResults.map((r: any) => r.courseName))) as string[];
          setCoursesList(uniqueCourses);
        }
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
      }
    };
    fetchCourses();
  }, []);

  // Carregar dados do sessionStorage ao carregar a página
  useEffect(() => {
    const savedData = sessionStorage.getItem("user_profile_data");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData((prev) => ({
          ...prev,
          ...parsedData,
        }));
      } catch (error) {
        console.error("Erro ao carregar dados do SessionStorage:", error);
      }
    }
  }, [setFormData]);

  // Função para salvar no SessionStorage e avisar o componente pai
  const handleSaveInternal = () => {
    // Validação antes de salvar
    const errors: { targetExam?: string; targetCourse?: string } = {};
    
    const isValidExam = universitiesList.some(uni => uni.name.toLowerCase() === formData.targetExam.toLowerCase());
    const isValidCourse = coursesList.some(course => course.toLowerCase() === formData.targetCourse.toLowerCase());

    if (formData.targetExam && !isValidExam) {
      errors.targetExam = "Por favor, selecione uma universidade válida.";
    }

    if (formData.targetCourse && !isValidCourse) {
      errors.targetCourse = "Por favor, selecione um curso válido.";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return; // Interrompe o salvamento
    }

    setValidationErrors({}); // Limpa erros se tudo estiver ok

    const dataToSave = {
      institution: formData.institution,
      targetExam: formData.targetExam,
      targetCourse: formData.targetCourse,
      profileIcon: formData.profileIcon,
      useInitialAvatar: formData.useInitialAvatar,
    };
    
    sessionStorage.setItem("user_profile_data", JSON.stringify(dataToSave));
    onSave();
  };

  // Lista de ícones disponíveis organizados por categoria
  const availableIcons = {
    Avatar: Array.from({ length: 21 }, (_, i) => ({
      path: `Avatar/Camaleão_${i + 1}.png`,
      name: `Avatar ${i + 1}`
    }))
  };

  // Total de ícones disponíveis
  const totalIcons = Object.values(availableIcons).reduce((acc, arr) => acc + arr.length, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpar o erro do campo quando o usuário digita
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Lógica específica para o autocomplete da Prova Alvo
    if (name === 'targetExam') {
      if (value.length > 0) {
        const filtered = universitiesList
          .filter(uni => uni.name.toLowerCase().includes(value.toLowerCase()))
          .map(uni => uni.name);
        setFilteredExams(filtered);
        setShowExamAutocomplete(true);
      } else {
        setFilteredExams([]);
        setShowExamAutocomplete(false);
      }
    }

    // Lógica específica para o autocomplete do Curso Alvo
    if (name === 'targetCourse') {
      if (value.length > 0) {
        const filtered = coursesList
          .filter(course => course.toLowerCase().includes(value.toLowerCase()));
        setFilteredCourses(filtered);
        setShowCourseAutocomplete(true);
      } else {
        setFilteredCourses([]);
        setShowCourseAutocomplete(false);
      }
    }
  };

  const selectExam = (examName: string) => {
    setFormData(prev => ({ ...prev, targetExam: examName }));
    setShowExamAutocomplete(false);
    setValidationErrors(prev => ({ ...prev, targetExam: undefined }));
  };

  const selectCourse = (courseName: string) => {
    setFormData(prev => ({ ...prev, targetCourse: courseName }));
    setShowCourseAutocomplete(false);
    setValidationErrors(prev => ({ ...prev, targetCourse: undefined }));
  };

  const handleIconSelect = (iconPath: string) => {
    setFormData(prev => ({
      ...prev,
      profileIcon: iconPath,
      useInitialAvatar: false
    }));
    setIsIconModalOpen(false);
  };

  const handleUseInitialAvatar = () => {
    setFormData(prev => ({
      ...prev,
      useInitialAvatar: true
    }));
    setIsIconModalOpen(false);
  };

  const hasErrors = !!validationErrors.targetExam || !!validationErrors.targetCourse;

  return (
    <>
      <div className="bg-white backdrop-blur-xl border border-gray-200 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Mascote assistente no canto */}
        <div className="absolute top-25 right-8 opacity-90 hidden xl:block animate-in fade-in slide-in-from-right-4 duration-700">
          <Image 
            src="/Mascote/banners/Camaleão_18.png" 
            alt="Assistente" 
            width={120}
            height={120}
            className="object-contain drop-shadow-xl transform hover:scale-110 transition-transform duration-300"
          />
          <div className="bg-gray-50 rounded-lg px-3 py-2 shadow-sm border border-gray-200 text-xs font-medium text-gray-700 mt-2 max-w-[120px] text-center">
            Configure seu perfil! 📝
          </div>
        </div>
        
        <div className="flex items-center gap-3 mb-8 relative z-10 pb-4 border-b border-gray-200/80">
          <Settings size={22} className="text-gray-500" />
          <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">Configurações da Conta</h3>
        </div>

        <div className="flex flex-col xl:flex-row gap-12 items-start">
          {/* Campos do formulário à esquerda */}
          <div className="flex-1 space-y-5 max-w-md animate-in fade-in slide-in-from-left-4 duration-700">
            {/* Full name */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-500 delay-100">
              <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                Nome Completo *
              </label>
              <input
                type="text"
                name="fullName"
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
                disabled
              />
            </div>

            {/* Email */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-500 delay-200">
              <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                Email *
              </label>
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-gray-50 transition-all duration-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:text-gray-500"
                disabled
              />
            </div>

            {/* School/Institution */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-500 delay-300">
              <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                Escola/Instituição
              </label>
              <input
                type="text"
                name="institution"
                placeholder="Sua escola ou instituição"
                value={formData.institution}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white transition-all duration-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 hover:border-gray-400"
              />
            </div>

            {/* Target Exam */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-500 delay-400 relative">
              <label className={`block text-xs font-medium mb-2 uppercase tracking-wide transition-colors duration-200 ${
                validationErrors.targetExam ? 'text-red-500 font-bold' : 'text-gray-600'
              }`}>
                Prova Alvo
              </label>
              <input
                type="text"
                name="targetExam"
                placeholder="Ex: FUVEST, ENEM, UNICAMP"
                value={formData.targetExam}
                onChange={handleInputChange}
                onBlur={() => setTimeout(() => setShowExamAutocomplete(false), 200)}
                onFocus={() => {
                  if (formData.targetExam.length > 0) setShowExamAutocomplete(true);
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white transition-all duration-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 hover:border-gray-400 ${
                  validationErrors.targetExam ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-300'
                }`}
                autoComplete="off"
              />
              
              {validationErrors.targetExam && (
                <p className="text-red-500 text-[10px] mt-1 font-semibold animate-in fade-in slide-in-from-top-1">
                  {validationErrors.targetExam}
                </p>
              )}
              
              {/* Autocomplete Suggestions */}
              {showExamAutocomplete && filteredExams.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {filteredExams.map((exam, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectExam(exam)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-0 transition-colors duration-150 cursor-pointer"
                    >
                      {exam}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Target Course */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-500 delay-400 relative">
              <label className={`block text-xs font-medium mb-2 uppercase tracking-wide transition-colors duration-200 ${
                validationErrors.targetCourse ? 'text-red-500 font-bold' : 'text-gray-600'
              }`}>
                Curso Alvo
              </label>
              <input
                type="text"
                name="targetCourse"
                placeholder="Ex: Medicina, Engenharia, Direito"
                value={formData.targetCourse}
                onChange={handleInputChange}
                onBlur={() => setTimeout(() => setShowCourseAutocomplete(false), 200)}
                onFocus={() => {
                  if (formData.targetCourse.length > 0) setShowCourseAutocomplete(true);
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white transition-all duration-200 text-sm font-medium text-gray-900 placeholder:text-gray-400 hover:border-gray-400 ${
                  validationErrors.targetCourse ? 'border-red-500 ring-1 ring-red-500/20' : 'border-gray-300'
                }`}
                autoComplete="off"
              />

              {validationErrors.targetCourse && (
                <p className="text-red-500 text-[10px] mt-1 font-semibold animate-in fade-in slide-in-from-top-1">
                  {validationErrors.targetCourse}
                </p>
              )}

              {/* Autocomplete Suggestions */}
              {showCourseAutocomplete && filteredCourses.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {filteredCourses.map((course, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => selectCourse(course)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 border-b border-gray-50 last:border-0 transition-colors duration-150 cursor-pointer"
                    >
                      {course}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Icon Selector */}
            <div className="animate-in fade-in slide-in-from-left-2 duration-500 delay-500">
              <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                Ícone de Perfil
              </label>
              
              {/* Preview do ícone atual */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative group">
                  {formData.useInitialAvatar ? (
                    <UserAvatar 
                      name={formData.fullName || session?.user?.name || 'U'}
                      className="w-20 h-20 text-2xl"
                    />
                  ) : (
                    <Image
                      src={`/Mascote/Logos/${formData.profileIcon}`}
                      alt="Ícone de perfil selecionado"
                      width={80}
                      height={80}
                      className="object-contain rounded-lg border border-gray-300 bg-white p-2 transition-all duration-200"
                    />
                  )}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Edit size={14} className="text-white" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsIconModalOpen(true)}
                  className="px-5 py-2.5 bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <Edit size={16} />
                  Alterar Ícone
                </button>
              </div>

              {/* Toggle entre mascote e inicial */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {formData.useInitialAvatar ? 'Usando avatar com inicial' : 'Usando mascote'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, useInitialAvatar: !prev.useInitialAvatar }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                      formData.useInitialAvatar ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                        formData.useInitialAvatar ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {formData.useInitialAvatar 
                    ? 'Avatar colorido com a inicial do seu nome (Padrão)' 
                    : 'Escolha entre 50 mascotes diferentes'}
                </p>
              </div>
            </div>

            {/* Save button */}
            <div className="pt-6 flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <button 
                onClick={handleSaveInternal}
                disabled={hasErrors}
                className={`px-6 py-2.5 shadow-lg text-white text-sm font-medium rounded-lg transition-all duration-200 active:scale-95 ${
                  hasErrors 
                    ? 'bg-gray-400 cursor-not-allowed opacity-70 shadow-none' 
                    : 'bg-gradient-to-b from-blue-500 to-blue-600 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 cursor-pointer'
                }`}
              >
                Salvar Alterações
              </button>
              <button 
                onClick={onCancel}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de seleção de ícones */}
      {isIconModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header do Modal */}
            <div className="bg-white p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    Escolha seu Ícone de Perfil
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">Use sua inicial ou escolha um dos nossos mascotes!</p>
                </div>
              </div>
            </div>

            {/* Grid de Ícones */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] bg-white">
              {/* Opção de usar avatar com inicial */}
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2 uppercase tracking-wide">
                  Avatar com Inicial
                </h3>
                <button
                  onClick={handleUseInitialAvatar}
                  className={`w-full p-4 rounded-lg border transition-all duration-200 flex items-center gap-4 ${
                    formData.useInitialAvatar
                      ? 'border-blue-500 bg-white shadow-sm'
                      : 'border-gray-300 bg-white hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <UserAvatar 
                    name={formData.fullName || session?.user?.name || 'U'}
                    className="w-16 h-16 text-xl flex-shrink-0"
                  />
                  <div className="text-left">
                    <p className="font-semibold text-gray-700 text-sm">Avatar Padrão</p>
                    <p className="text-xs text-gray-700">Usa a primeira letra do seu nome</p>
                  </div>
                </button>
              </div>

              {/* Mascotes */}
              {Object.entries(availableIcons).map(([category, icons]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    {category} ({icons.length} {icons.length === 1 ? 'ícone' : 'ícones'})
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {icons.map((icon) => (
                      <button
                        key={icon.path}
                        onClick={() => handleIconSelect(icon.path)}
                        className={`aspect-square rounded-lg border p-2 transition-all duration-200 ${
                          !formData.useInitialAvatar && formData.profileIcon === icon.path
                            ? 'border-blue-500 bg-blue-50 shadow-sm scale-105'
                            : 'border-gray-300 bg-white hover:border-blue-300 hover:shadow-sm'
                        }`}
                        title={icon.name}
                      >
                        <Image
                          src={`/Mascote/Logos/${icon.path}`}
                          alt={icon.name}
                          width={64}
                          height={64}
                          className="object-contain w-full h-full"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer do Modal */}
            <div className="bg-white p-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span className="font-medium">Total de {totalIcons} mascotes disponíveis</span>
                <button
                  onClick={() => setIsIconModalOpen(false)}
                  className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-md text-md font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
