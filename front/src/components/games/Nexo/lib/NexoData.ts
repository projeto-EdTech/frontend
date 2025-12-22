// NexoData.ts

// Interface para o desafio individual (o grupo de 4 palavras)
export interface Desafio {
    titulo: string;
    palavras: string[];
    // Opcional: nível de dificuldade (0 a 3) se quiser fixar cores específicas
    dificuldade?: 0 | 1 | 2 | 3; 
}

// Interface para definir os gradientes do Tema (Claro e Escuro)
export interface TemaGradiente {
    claro: string;  // CSS linear-gradient string
    escuro: string; // CSS linear-gradient string
}

// Interface para o Agrupamento por Matéria
export interface MateriaGrupo {
    materia: string;
    corTema: TemaGradiente; // Atualizado para suportar o objeto de temas
    cards: Desafio[];
}

// O Banco de Dados Organizado com todas as matérias e as novas cores
export const dbNexo: MateriaGrupo[] = [
    {
        materia: "Matemática",
        corTema: {
            // Azul (Froster Blue / Blue Depth)
            claro: "linear-gradient(135deg, #4C8DFF, #1E5BFF)",
            escuro: "linear-gradient(135deg, #2B3A67, #1A2748)"
        },
        cards: [
            {
                titulo: "Polígonos (Matemática)",
                palavras: ["Pentágono", "Hexágono", "Heptágono", "Decágono"]
            },
            {
                titulo: "Elementos da Geometria (Matemática)",
                palavras: ["Vértice", "Aresta", "Face", "Ângulo"]
            },
            {
                titulo: "Funções Trigonométricas (Matemática)",
                palavras: ["Seno", "Cosseno", "Tangente", "Cossecante"]
            }
        ]
    },
    {
        materia: "Literatura e Gramática",
        corTema: {
            // Laranja / Coral (Warm Sunset / Deep Ember)
            claro: "linear-gradient(135deg, #FF9A5A, #FF6B3D)",
            escuro: "linear-gradient(135deg, #A5421D, #7F2E14)"
        },
        cards: [
            {
                titulo: "Figuras de Linguagem (Gramática e Literatura)",
                palavras: ["Metáfora", "Metonímia", "Hipérbole", "Eufemismo"]
            },
            {
                titulo: "Autores do Realismo (Literatura)",
                palavras: ["Machado de Assis", "Aluísio Azevedo", "Raul Pompeia", "Eça de Queirós"]
            },
            {
                titulo: "Classes Gramaticais (Gramática)",
                palavras: ["Substantivo", "Adjetivo", "Verbo", "Advérbio"]
            }
        ]
    },
    {
        materia: "Biologia",
        corTema: {
            // Verde Natureza (Leaf Mist / Forest Night)
            claro: "linear-gradient(135deg, #8ED873, #4FAF3A)",
            escuro: "linear-gradient(135deg, #2E5E3A, #1F4128)"
        },
        cards: [
            {
                titulo: "Bases Nitrogenadas (DNA - Biologia)",
                palavras: ["Adenina", "Timina", "Citosina", "Guanina"]
            },
            {
                titulo: "Reinos Biológicos (Biologia)",
                palavras: ["Monera", "Protista", "Fungi", "Plantae"]
            },
            {
                titulo: "Fases da Mitose (Biologia)",
                palavras: ["Prófase", "Metáfase", "Anáfase", "Telófase"]
            }
        ]
    },
    {
        materia: "História",
        corTema: {
            // Vermelho Terracota (Clay Red / Wine Red)
            claro: "linear-gradient(135deg, #FF6E5A, #D94A32)",
            escuro: "linear-gradient(135deg, #6E1F26, #50151A)"
        },
        cards: [
            {
                titulo: "Era Vargas (História)",
                palavras: ["Estado Novo", "CLT", "Trabalhismo", "DIP"]
            },
            {
                titulo: "Guerra Fria (História)",
                palavras: ["Muro de Berlim", "Corrida Espacial", "Cortina de Ferro", "Crise dos Mísseis"]
            },
            {
                titulo: "Revolução Francesa (História)",
                palavras: ["Guilhotina", "Bastilha", "Jacobinos", "Girondinos"]
            }
        ]
    },
    {
        materia: "Geografia",
        corTema: {
            // Verde-Musgo / Terra (Olive Earth / Soil Deep)
            claro: "linear-gradient(135deg, #A6B56B, #738A38)",
            escuro: "linear-gradient(135deg, #4B4E2C, #2A2B18)"
        },
        cards: [
            {
                titulo: "Biomas Brasileiros (Geografia)",
                palavras: ["Cerrado", "Caatinga", "Pampa", "Amazônia"]
            },
            {
                titulo: "Camadas da Terra (Geografia)",
                palavras: ["Crusta", "Manto", "Núcleo Externo", "Núcleo Interno"]
            },
            {
                titulo: "Continentes (Geografia)",
                palavras: ["Ásia", "África", "Europa", "Oceania"]
            }
        ]
    },
    {
        materia: "Física",
        corTema: {
            // Roxo / Azul Profundo (Indigo Wave / Cosmic Purple)
            claro: "linear-gradient(135deg, #8A8DFF, #5A5EEA)",
            escuro: "linear-gradient(135deg, #2F2A54, #1C1838)"
        },
        cards: [
            {
                titulo: "Mudanças de Estado Físico (Física)",
                palavras: ["Fusão", "Vaporização", "Solidificação", "Sublimação"]
            },
            {
                titulo: "Leis de Newton (Física)",
                palavras: ["Inércia", "Dinâmica", "Ação e Reação", "Gravitação"]
            },
            {
                titulo: "Grandezas Elétricas (Física)",
                palavras: ["Tensão", "Corrente", "Resistência", "Potência"]
            }
        ]
    },
    {
        materia: "Química",
        corTema: {
            // Amarelo Energia (Soft Amber / Golden Alloy)
            claro: "linear-gradient(135deg, #FFE27A, #FFC94A)",
            escuro: "linear-gradient(135deg, #8A6B1C, #5C470F)"
        },
        cards: [
            {
                titulo: "Modelos Atômicos (Química)",
                palavras: ["Dalton", "Thomson", "Rutherford", "Bohr"]
            },
            {
                titulo: "Gases Nobres (Química)",
                palavras: ["Hélio", "Neônio", "Argônio", "Xenônio"]
            },
            {
                titulo: "Funções Orgânicas (Química)",
                palavras: ["Álcool", "Cetona", "Aldeído", "Éter"]
            }
        ]
    },
    {
        materia: "Inglês",
        corTema: {
            // Azul Claro / Ciano (Sky Frost / Teal Night)
            claro: "linear-gradient(135deg, #8EDBFF, #4AB0E8)",
            escuro: "linear-gradient(135deg, #1F4F59, #14363E)"
        },
        cards: [
            {
                titulo: "Question Words (Inglês)",
                palavras: ["What", "Where", "When", "Who"]
            },
            {
                titulo: "Pronomes Pessoais (Inglês)",
                palavras: ["I", "You", "He", "They"]
            },
            {
                titulo: "False Cognates (Falsos Amigos - Inglês)",
                palavras: ["Push", "Pull", "Pretend", "Intend"]
            }
        ]
    },
    {
        materia: "Filosofia",
        corTema: {
            // Cinza Minimalista (Platinum Fog / Space Gray)
            claro: "linear-gradient(135deg, #E5E5EA, #C7C7CC)",
            escuro: "linear-gradient(135deg, #4A4A4C, #2C2C2E)"
        },
        cards: [
            {
                titulo: "Filósofos Pré-Socráticos (Filosofia)",
                palavras: ["Tales", "Anaximandro", "Heráclito", "Parmênides"]
            },
            {
                titulo: "Conceitos Aristotélicos (Filosofia)",
                palavras: ["Eudaimonia", "Metafísica", "Lógica", "Retórica"]
            },
            {
                titulo: "Contratualistas (Filosofia)",
                palavras: ["Hobbes", "Locke", "Rousseau", "Rawls"]
            }
        ]
    },
    {
        materia: "Sociologia",
        corTema: {
            // Verde-Água (Aqua Mint / Deep Teal Smoke)
            claro: "linear-gradient(135deg, #B2F2E8, #6ED8CC)",
            escuro: "linear-gradient(135deg, #2B4C4A, #1B3332)"
        },
        cards: [
            {
                titulo: "Clássicos da Sociologia",
                palavras: ["Durkheim", "Weber", "Marx", "Comte"]
            },
            {
                titulo: "Conceitos Marxistas (Sociologia)",
                palavras: ["Mais-valia", "Alienação", "Luta de classes", "Ideologia"]
            },
            {
                titulo: "Tipos de Ação Social (Weber - Sociologia)",
                palavras: ["Tradicional", "Afetiva", "Racional (Valores)", "Racional (Fins)"]
            }
        ]
    },
    {
        materia: "Artes",
        corTema: {
            // Roxo Vibrante (Lavender Bloom / Royal Violet)
            claro: "linear-gradient(135deg, #C9A6FF, #A475FF)",
            escuro: "linear-gradient(135deg, #4B2F6F, #2E1E47)"
        },
        cards: [
            {
                titulo: "Vanguardas Europeias (Artes)",
                palavras: ["Cubismo", "Futurismo", "Dadaísmo", "Surrealismo"]
            },
            {
                titulo: "Renascimento (Artes)",
                palavras: ["Da Vinci", "Michelangelo", "Rafael", "Donatello"]
            }
        ]
    }
];