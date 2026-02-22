// --- TIPAGENS COMPARTILHADAS ---
// Estas tipos serão usados tanto no backend (route.ts) quanto no frontend (NotaCorteConsulta.tsx)
export type CourseStatus = 'approved' | 'borderline' | 'reproved';

export interface CourseResult {
  id: string;
  courseName: string;
  institution: string;
  cutoffScore: number;
  userScore: number;
  difference: number;
  status: CourseStatus;
  area: string;
}

export interface ApiResponse {
  targetCourseResults: CourseResult[]; // Agora é um array com TODOS os resultados do curso alvo
  allResults: CourseResult[];
  // Também enviamos as listas de filtros para o frontend
  availableAreas: string[];
}

// Interface para os dados brutos (apenas a nota de corte)
interface RawCourseData {
  id: string;
  courseName: string;
  institution: string;
  cutoffScore: number;
  area: string;
}

// --- DADOS MOCKADOS BRUTOS ---
// Agora este array contém apenas a informação "do banco de dados"
export const mockApiData: RawCourseData[] = [
  { id: '2', courseName: 'Engenharia de Software', institution: 'UNICAMP', cutoffScore: 75, area: 'Exatas' },
  { id: '3', courseName: 'Direito', institution: 'PUC-Rio', cutoffScore: 77, area: 'Humanas' },
  { id: '4', courseName: 'Física', institution: 'UFRGS', cutoffScore: 68, area: 'Exatas' },
  { id: '5', courseName: 'Letras', institution: 'UFBA', cutoffScore: 62, area: 'Humanas' },
  { id: '6', courseName: 'Enfermagem', institution: 'UNIFESP', cutoffScore: 70, area: 'Biológicas' },
  { id: '7', courseName: 'Engenharia da Computação', institution: 'UFMG', cutoffScore: 76, area: 'Exatas' },
  { id: '8', courseName: 'História', institution: 'UFPR', cutoffScore: 65, area: 'Humanas' },
  { id: '9', courseName: 'Engenharia Civil', institution: 'UFRJ', cutoffScore: 71, area: 'Exatas' },
  { id: '10', courseName: 'Psicologia', institution: 'UFSC', cutoffScore: 73, area: 'Humanas' },
  { id: '11', courseName: 'Biomedicina', institution: 'UFPE', cutoffScore: 74, area: 'Biológicas' },
  { id: '12', courseName: 'Arquitetura e Urbanismo', institution: 'UFG', cutoffScore: 69, area: 'Exatas' },
  { id: '13', courseName: 'Farmácia', institution: 'UFC', cutoffScore: 71, area: 'Biológicas' },
  { id: '14', courseName: 'Administração', institution: 'UFES', cutoffScore: 67, area: 'Humanas' },
  { id: '15', courseName: 'Engenharia Elétrica', institution: 'ITA', cutoffScore: 83, area: 'Exatas' },
  { id: '16', courseName: 'Odontologia', institution: 'UNESP', cutoffScore: 72, area: 'Biológicas' },
  { id: '17', courseName: 'Publicidade e Propaganda', institution: 'PUC-SP', cutoffScore: 64, area: 'Humanas' },
  { id: '18', courseName: 'Design', institution: 'UFPR', cutoffScore: 66, area: 'Humanas' },
  { id: '19', courseName: 'Engenharia Mecânica', institution: 'UFRN', cutoffScore: 70, area: 'Exatas' },
  { id: '20', courseName: 'Ciências Contábeis', institution: 'UFMS', cutoffScore: 65, area: 'Humanas' },
  { id: '21', courseName: 'Fisioterapia', institution: 'UFTM', cutoffScore: 69, area: 'Biológicas' },
  { id: '22', courseName: 'Engenharia Química', institution: 'UFU', cutoffScore: 73, area: 'Exatas' },
  { id: '23', courseName: 'Pedagogia', institution: 'UFPB', cutoffScore: 60, area: 'Humanas' },
  { id: '24', courseName: 'Ciências Biológicas', institution: 'UFV', cutoffScore: 68, area: 'Biológicas' },
  { id: '25', courseName: 'Relações Internacionais', institution: 'UNB', cutoffScore: 75, area: 'Humanas' },
  { id: '26', courseName: 'Engenharia de Produção', institution: 'UFJF', cutoffScore: 72, area: 'Exatas' },
  { id: '27', courseName: 'Nutrição', institution: 'UFMA', cutoffScore: 67, area: 'Biológicas' },
  { id: '28', courseName: 'Geografia', institution: 'UFAL', cutoffScore: 63, area: 'Humanas' },
  { id: '29', courseName: 'Sistemas de Informação', institution: 'UTFPR', cutoffScore: 70, area: 'Exatas' },
  { id: '30', courseName: 'Medicina Veterinária', institution: 'UFPel', cutoffScore: 74, area: 'Biológicas' },
  { id: '31', courseName: 'Engenharia Ambiental', institution: 'UFSCar', cutoffScore: 71, area: 'Exatas' },
  { id: '32', courseName: 'Jornalismo', institution: 'UFOP', cutoffScore: 66, area: 'Humanas' },
  { id: '33', courseName: 'Zootecnia', institution: 'UFMT', cutoffScore: 64, area: 'Biológicas' },
  { id: '34', courseName: 'Economia', institution: 'UFPA', cutoffScore: 69, area: 'Humanas' },
  { id: '35', courseName: 'Engenharia de Computação', institution: 'UNIFEI', cutoffScore: 74, area: 'Exatas' },
  { id: '36', courseName: 'Educação Física', institution: 'UNIPAMPA', cutoffScore: 61, area: 'Biológicas' },
  { id: '37', courseName: 'Turismo', institution: 'UERN', cutoffScore: 59, area: 'Humanas' },
  { id: '38', courseName: 'Matemática', institution: 'UFABC', cutoffScore: 68, area: 'Exatas' },
  { id: '39', courseName: 'Fonoaudiologia', institution: 'UFS', cutoffScore: 65, area: 'Biológicas' },
  { id: '40', courseName: 'Ciências Sociais', institution: 'UFSM', cutoffScore: 63, area: 'Humanas' },
  { id: '41', courseName: 'Química', institution: 'UFPEL', cutoffScore: 67, area: 'Exatas' },
  { id: '42', courseName: 'Serviço Social', institution: 'UEMA', cutoffScore: 61, area: 'Humanas' },
  { id: '43', courseName: 'Astronomia', institution: 'UFRJ', cutoffScore: 76, area: 'Exatas' },
  { id: '44', courseName: 'Engenharia Aeroespacial', institution: 'UFABC', cutoffScore: 80, area: 'Exatas' },
  { id: '45', courseName: 'Biotecnologia', institution: 'UFRGS', cutoffScore: 73, area: 'Biológicas' },
  { id: '46', courseName: 'Antropologia', institution: 'UFAM', cutoffScore: 62, area: 'Humanas' },
  { id: '47', courseName: 'Oceanografia', institution: 'FURG', cutoffScore: 70, area: 'Biológicas' },
  { id: '48', courseName: 'Engenharia de Materiais', institution: 'UFSCar', cutoffScore: 74, area: 'Exatas' },
  { id: '49', courseName: 'Gestão Pública', institution: 'UNB', cutoffScore: 65, area: 'Humanas' },
  { id: '50', courseName: 'Ciências Atuariais', institution: 'UFMG', cutoffScore: 71, area: 'Exatas' },
  { id: '51', courseName: 'Engenharia de Minas', institution: 'UFOP', cutoffScore: 72, area: 'Exatas' },
  { id: '52', courseName: 'Produção Cultural', institution: 'UFF', cutoffScore: 64, area: 'Humanas' },
  { id: '53', courseName: 'Engenharia de Controle e Automação', institution: 'CEFET-MG', cutoffScore: 73, area: 'Exatas' },
  { id: '54', courseName: 'Ecologia', institution: 'UFVJM', cutoffScore: 66, area: 'Biológicas' },
  { id: '55', courseName: 'Cinema e Audiovisual', institution: 'UFSB', cutoffScore: 68, area: 'Humanas' },
  { id: '56', courseName: 'Geologia', institution: 'UFPA', cutoffScore: 69, area: 'Exatas' },
  { id: '57', courseName: 'Engenharia Naval', institution: 'FUVEST', cutoffScore: 79, area: 'Exatas' },
  { id: '58', courseName: 'Moda', institution: 'UEM', cutoffScore: 63, area: 'Humanas' },
  { id: '59', courseName: 'Estatística', institution: 'UFSCAR', cutoffScore: 70, area: 'Exatas' },
  { id: '60', courseName: 'Ciências do Esporte', institution: 'UNICAMP', cutoffScore: 65, area: 'Biológicas' },
  { id: '61', courseName: 'Engenharia Florestal', institution: 'UFPR', cutoffScore: 71, area: 'Exatas' },
  { id: '62', courseName: 'Arqueologia', institution: 'UFS', cutoffScore: 60, area: 'Humanas' },
  { id: '63', courseName: 'Bioquímica', institution: 'UFMG', cutoffScore: 72, area: 'Biológicas' },
  { id: '64', courseName: 'Gestão Ambiental', institution: 'UFERSA', cutoffScore: 64, area: 'Exatas' },
  { id: '65', courseName: 'Música', institution: 'UFBA', cutoffScore: 61, area: 'Humanas' },
  { id: '66', courseName: 'Ciência de Dados', institution: 'FUVEST', cutoffScore: 78, area: 'Exatas' },
  { id: '67', courseName: 'Engenharia Biomédica', institution: 'UFABC', cutoffScore: 77, area: 'Exatas' },
  { id: '68', courseName: 'Fisiologia', institution: 'UNIFESP', cutoffScore: 70, area: 'Biológicas' },
  { id: '69', courseName: 'Direito Internacional', institution: 'PUC-Minas', cutoffScore: 75, area: 'Humanas' },
  { id: '70', courseName: 'Ciência Política', institution: 'UFRGS', cutoffScore: 71, area: 'Humanas' },
  { id: '71', courseName: 'Meteorologia', institution: 'UFAL', cutoffScore: 69, area: 'Exatas' },
  { id: '72', courseName: 'Medicina', institution: 'UFRJ', cutoffScore: 83, area: 'Biológicas' },
  { id: '73', courseName: 'Engenharia Mecatrônica', institution: 'UNB', cutoffScore: 78, area: 'Exatas' },
  { id: '74', courseName: 'Relações Públicas', institution: 'UFSM', cutoffScore: 64, area: 'Humanas' },
  { id: '75', courseName: 'Engenharia Agrícola', institution: 'UFGD', cutoffScore: 70, area: 'Exatas' },
  { id: '76', courseName: 'Ciências Naturais', institution: 'UFT', cutoffScore: 65, area: 'Biológicas' },
  { id: '77', courseName: 'Engenharia de Petróleo', institution: 'UFRN', cutoffScore: 75, area: 'Exatas' },
  { id: '78', courseName: 'Teologia', institution: 'PUC-Campinas', cutoffScore: 60, area: 'Humanas' },
  { id: '79', courseName: 'Bioinformática', institution: 'UFMG', cutoffScore: 73, area: 'Exatas' },
  { id: '80', courseName: 'Gestão de Recursos Humanos', institution: 'UFRRJ', cutoffScore: 64, area: 'Humanas' },
  { id: '81', courseName: 'Engenharia Sanitária', institution: 'UFAM', cutoffScore: 68, area: 'Exatas' },
  { id: '82', courseName: 'Zootecnia', institution: 'UFG', cutoffScore: 66, area: 'Biológicas' },
  { id: '83', courseName: 'Engenharia de Alimentos', institution: 'UFV', cutoffScore: 72, area: 'Exatas' },
  { id: '84', courseName: 'Jornalismo', institution: 'UFC', cutoffScore: 67, area: 'Humanas' },
  { id: '85', courseName: 'Educação Especial', institution: 'UFSM', cutoffScore: 63, area: 'Humanas' },
  { id: '86', courseName: 'Engenharia Têxtil', institution: 'UFRN', cutoffScore: 69, area: 'Exatas' },
  { id: '87', courseName: 'Odontologia', institution: 'UFPB', cutoffScore: 73, area: 'Biológicas' },
  { id: '88', courseName: 'Psicologia', institution: 'PUC-SP', cutoffScore: 72, area: 'Humanas' },
  { id: '89', courseName: 'Ciência da Computação', institution: 'UFSC', cutoffScore: 76, area: 'Exatas' },
  { id: '90', courseName: 'Medicina Veterinária', institution: 'UFMS', cutoffScore: 75, area: 'Biológicas' },
  { id: '91', courseName: 'Artes Visuais', institution: 'UFRGS', cutoffScore: 65, area: 'Humanas' },
  { id: '92', courseName: 'Engenharia de Energia', institution: 'UFPEL', cutoffScore: 71, area: 'Exatas' },
  { id: '93', courseName: 'Farmácia', institution: 'UFPR', cutoffScore: 72, area: 'Biológicas' },
  { id: '94', courseName: 'Gestão Financeira', institution: 'UFJF', cutoffScore: 66, area: 'Humanas' },
  { id: '95', courseName: 'Engenharia de Transportes', institution: 'UFCG', cutoffScore: 70, area: 'Exatas' },
  { id: '96', courseName: 'Ciências Econômicas', institution: 'UNESP', cutoffScore: 69, area: 'Humanas' },
  { id: '97', courseName: 'Engenharia de Computação', institution: 'PUC-PR', cutoffScore: 74, area: 'Exatas' },
  { id: '98', courseName: 'Filosofia', institution: 'UFMA', cutoffScore: 61, area: 'Humanas' },
  { id: '99', courseName: 'Engenharia de Produção', institution: 'UTFPR', cutoffScore: 73, area: 'Exatas' },
  { id: '100', courseName: 'Ciências Médicas', institution: 'UNIFESP', cutoffScore: 80, area: 'Biológicas' },
  // Adicionando mais universidades com Medicina para demonstrar múltiplos resultados
  { id: '101', courseName: 'Medicina', institution: 'FUVEST', cutoffScore: 85, area: 'Biológicas' },
  { id: '102', courseName: 'Medicina', institution: 'UNICAMP', cutoffScore: 84, area: 'Biológicas' },
  { id: '103', courseName: 'Medicina', institution: 'UNIFESP', cutoffScore: 83, area: 'Biológicas' },
  { id: '104', courseName: 'Medicina', institution: 'UFMG', cutoffScore: 81, area: 'Biológicas' },
  { id: '105', courseName: 'Medicina', institution: 'UFSC', cutoffScore: 80, area: 'Biológicas' },
  { id: '106', courseName: 'Medicina', institution: 'UFPR', cutoffScore: 79, area: 'Biológicas' },
  { id: '107', courseName: 'Medicina', institution: 'UNB', cutoffScore: 82, area: 'Biológicas' },
  { id: '108', courseName: 'Medicina', institution: 'UFPE', cutoffScore: 78, area: 'Biológicas' },
  { id: '109', courseName: 'Medicina', institution: 'UFC', cutoffScore: 77, area: 'Biológicas' },
  { id: '110', courseName: 'Medicina', institution: 'UFBA', cutoffScore: 80, area: 'Biológicas' },
  // Adicionando mais universidades com Engenharia de Software
  { id: '111', courseName: 'Engenharia de Software', institution: 'FUVEST', cutoffScore: 78, area: 'Exatas' },
  { id: '112', courseName: 'Engenharia de Software', institution: 'UFMG', cutoffScore: 74, area: 'Exatas' },
  { id: '113', courseName: 'Engenharia de Software', institution: 'PUC-Rio', cutoffScore: 76, area: 'Exatas' },
  { id: '114', courseName: 'Engenharia de Software', institution: 'UFSC', cutoffScore: 73, area: 'Exatas' },
  // Adicionando mais universidades com Direito
  { id: '115', courseName: 'Direito', institution: 'FUVEST', cutoffScore: 80, area: 'Humanas' },
  { id: '116', courseName: 'Direito', institution: 'UFMG', cutoffScore: 76, area: 'Humanas' },
  { id: '117', courseName: 'Direito', institution: 'UFRJ', cutoffScore: 78, area: 'Humanas' },
  { id: '118', courseName: 'Direito', institution: 'UnB', cutoffScore: 75, area: 'Humanas' },
  { id: '119', courseName: 'Direito', institution: 'UFPR', cutoffScore: 74, area: 'Humanas' },
];

/**
 * Esta função simula a lógica do backend.
 * Ela recebe a nota do usuário e processa os dados brutos.
 */
export const processCutoffResults = (userScore: number, targetCourse: string, targetInstitution?: string): ApiResponse => {
  const BORDERLINE_MARGIN = 5; // Margem de 5 pontos para ser 'limítrofe'
  const targetCourseResults: CourseResult[] = []; // Array para armazenar TODOS os resultados do curso alvo

  const allResults = mockApiData.map(course => {
    const difference = userScore - course.cutoffScore;
    let status: CourseStatus;

    if (difference >= 0) {
      status = 'approved';
    } else if (difference >= -BORDERLINE_MARGIN) {
      status = 'borderline';
    } else {
      status = 'reproved';
    }

    // Cria o objeto completo do resultado
    const result: CourseResult = { 
      ...course, 
      userScore, 
      difference, 
      status 
    };
    
    // Verifica se este é o curso alvo e adiciona ao array
    // MODIFICAÇÃO: Se targetInstitution for fornecido, filtra por ambos. Caso contrário, apenas pelo curso.
    const courseMatches = course.courseName.toLowerCase() === targetCourse.toLowerCase();
    const institutionMatches = !targetInstitution || course.institution.toLowerCase() === targetInstitution.toLowerCase();

    if (courseMatches && institutionMatches) {
      targetCourseResults.push(result);
    }
    
    return result;
  });

  // Extrai as listas de filtros para enviar ao frontend
  const availableAreas = ['todas', ...Array.from(new Set(mockApiData.map(c => c.area)))];

  return {
    targetCourseResults,
    allResults,
    availableAreas,
  };
};