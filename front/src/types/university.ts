export interface University {
  id: number;
  name: string;
  slug: string;
  logo: string;
  fullName: string;
  type: string;
  state: string;
  year: number[];
  totalQuestions: number;
  dia?: Record<number, number[]>;
}

export interface ComplexEnunciado {
  principal: string;
  subItens?: { titulo: string; conteudo: string }[];
  contextoAdicional?: string;
}

export interface QuestionInput {
  id: number;
  university: string;
  year: number;
  text: string | ComplexEnunciado;
  options: string[];
  correctAnswer: number;
  materia: string[];
  conteudo: string[];
  dia?: number;
  imageNames?: string[];
}

export interface Question {
  id: number;
  university: string;
  year: number;
  text: string | ComplexEnunciado;
  options: string[];
  correctAnswer: number;
  materia: string[];
  conteudo: string[];
  dia?: number;
  images?: string[];
}
