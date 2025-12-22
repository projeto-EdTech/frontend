import { Word } from '@andsfonseca/palavras-pt-br';

// Configurações do Jogo
export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;
export const MAX_GUESSES_DUETO = 7;

// ========================================
// NOVA INTERFACE DE DADOS
// ========================================
export interface GameWord {
  word: string;
  definition: string;
}

// ========================================
// BANCO DE PALAVRAS DO JOGO (ESTÁTICO)
// ========================================
const STATIC_GAME_WORDS: GameWord[] = [
  // --- LETRA A ---
  { word: 'ABADE', definition: 'Superior de um mosteiro ou abadia; religioso que dirige uma comunidade monástica.' },
  { word: 'ACIDO', definition: 'Substância com pH inferior a 7, de sabor azedo, capaz de reagir com bases.' },
  { word: 'AEREO', definition: 'Relativo ao ar, à atmosfera ou à aviação; que acontece no espaço aéreo.' },
  { word: 'AMBAR', definition: 'Resina fóssil, dura e amarelada, usada na produção de objetos ornamentais.' },
  { word: 'AMPLO', definition: 'Que é extenso, vasto, largo ou espaçoso; que não é restrito.' },
  { word: 'APICE', definition: 'O ponto mais alto de algo; o cume, o auge ou o clímax.' },
  { word: 'ARIDO', definition: 'Que é seco, estéril, sem umidade ou pouco produtivo.' },
  { word: 'ASTRO', definition: 'Qualquer corpo celeste (estrela, planeta) ou uma pessoa muito famosa.' },
  { word: 'ATRIO', definition: 'O pátio interno principal de entrada; uma das cavidades superiores do coração.' },
  { word: 'ATOMO', definition: 'A menor partícula que compõe um elemento químico, mantendo suas propriedades.' },
  { word: 'ATUAR', definition: 'Agir, exercer uma função, intervir ou representar um papel artístico.' },
  { word: 'AUREA', definition: 'Relativa a ouro; que é dourada, brilhante, magnífica ou gloriosa.' },
  { word: 'AUTOR', definition: 'Aquele que cria, causa, escreve ou é responsável pela origem de uma obra.' },
  { word: 'ATUAL', definition: 'Que acontece, existe ou vigora no momento presente; contemporâneo.' },

  // --- LETRA B ---
  { word: 'BACIA', definition: 'Depressão geográfica; conjunto de terras drenadas por um rio; ou recipiente largo e raso.' },
  { word: 'BIOMA', definition: 'Grande comunidade biológica adaptada a condições climáticas específicas (ex: Amazônia, Cerrado).' },
  { word: 'BLOCO', definition: 'Massa sólida de matéria; grupo de pessoas ou nações unidas por interesses comuns.' },
  { word: 'BREVE', definition: 'Que tem curta duração; que é sucinto, conciso ou passageiro.' },
  { word: 'BRISA', definition: 'Vento suave, fresco e agradável; aragem.' },
  { word: 'BULBO', definition: 'Parte subterrânea de certas plantas (ex: cebola); ou estrutura na base do cérebro.' },

  // --- LETRA C ---
  { word: 'CAMPO', definition: 'Terreno plano e extenso, geralmente rural; ou uma área específica de conhecimento/estudo.' },
  { word: 'CARGA', definition: 'Aquilo que é transportado; peso físico ou responsabilidade moral; quantidade de eletricidade.' },
  { word: 'CASCO', definition: 'Revestimento duro de certos animais (tartaruga, cavalo) ou a estrutura externa de um navio.' },
  { word: 'CAULE', definition: 'Parte da planta que sustenta folhas, flores e frutos, e conduz a seiva.' },
  { word: 'CEDER', definition: 'Desistir de algo; abrir mão, transferir posse ou submeter-se à vontade de outrem.' },
  { word: 'CENSO', definition: 'Contagem oficial e estatística da população de um país e suas características socioeconômicas.' },
  { word: 'CERNE', definition: 'A parte central e mais dura da madeira; o ponto essencial ou núcleo de uma questão.' },
  { word: 'CILIO', definition: 'Pelo curto na borda das pálpebras; estrutura microscópica celular para locomoção.' },
  { word: 'CINZA', definition: 'Resíduo pórento do que foi queimado; cor resultante da mistura de preto e branco.' },
  { word: 'CISAO', definition: 'Ato de scindir ou cortar; divisão profunda, ruptura ou discordância em um grupo.' },
  { word: 'CITAR', definition: 'Mencionar ou referir alguém/algo; notificar judicialmente uma pessoa.' },
  { word: 'CIVIL', definition: 'Relativo ao cidadão comum (não militar ou religioso); que é cortês e educado.' },
  { word: 'CLERO', definition: 'O conjunto de sacerdotes e religiosos de uma igreja; classe eclesiástica.' },
  { word: 'CLIMA', definition: 'Padrão meteorológico de longo prazo de uma região; ou a "atmosfera" psicológica de um ambiente.' },
  { word: 'CLONE', definition: 'Organismo geneticamente idêntico a outro; cópia exata ou réplica.' },
  { word: 'COESO', definition: 'Que está unido, ligado ou conectado; que tem coerência, lógica e harmonia.' },
  { word: 'CRISE', definition: 'Momento de perigo, dificuldade ou decisão; desequilíbrio repentino na ordem das coisas.' },
  { word: 'CULTO', definition: 'Homenagem ou ritual religioso; adoração; ou alguém que possui muita cultura e instrução.' },

  // --- LETRA D ---
  { word: 'DADOS', definition: 'Informações ou fatos coletados para análise; também se refere a cubos numerados usados em jogos.' },
  { word: 'DEBIL', definition: 'Que é fraco, incapaz ou sem força; que apresenta fragilidade física ou mental.' },
  { word: 'DELTA', definition: 'A quarta letra do alfabeto grego (Δ); ou foz de rio ramificada em forma de triângulo.' },
  { word: 'DENSO', definition: 'Que tem grande concentração de massa ou elementos; espesso, compacto e pouco penetrável.' },
  { word: 'DIETA', definition: 'Padrão habitual de alimentação de um indivíduo; ou regime alimentar prescrito por saúde.' },
  { word: 'DOGMA', definition: 'Ponto fundamental de uma doutrina religiosa ou filosófica, apresentado como verdade indiscutível.' },
  { word: 'DRAMA', definition: 'Gênero literário ou teatral de conflitos humanos; ou uma situação real comovente e tensa.' },
  { word: 'DUPLO', definition: 'Que contém duas vezes a mesma quantidade; composto por dois elementos ou partes.' },

  // --- LETRA E ---
  { word: 'ELITE', definition: 'Grupo minoritário que detém prestígio, poder ou domínio em uma sociedade ou grupo.' },
  { word: 'ETAPA', definition: 'Cada uma das fases de um processo, caminho ou desenvolvimento; parada ou estágio.' },
  { word: 'ETICO', definition: 'Relativo à ética; que age de acordo com os princípios da moral e da boa conduta.' },
  { word: 'ETNIA', definition: 'Coletividade de indivíduos que se diferencia por especificidades socioculturais (língua, religião, etc).' },
  { word: 'EXODO', definition: 'Saída ou emigração em massa de um povo ou multidão de uma região para outra.' },
  
  // --- LETRA F ---
  { word: 'FAIXA', definition: 'Tira estreita de tecido ou material; zona delimitada (ex: faixa de pedestres) ou intervalo de valores.' },
  { word: 'FATOR', definition: 'Elemento que contribui para um resultado; número que opera na multiplicação.' },
  { word: 'FAUNA', definition: 'Conjunto de espécies animais próprias de uma região, período geológico ou ecossistema.' },
  { word: 'FERIR', definition: 'Causar dano físico, machucar; ou causar ofensa moral e magoar alguém.' },
  { word: 'FEUDO', definition: 'Terra concedida por um senhor feudal na Idade Média; figurativamente, um domínio exclusivo.' },
  { word: 'FIBRA', definition: 'Filamento de tecido orgânico ou têxtil; força moral, coragem e resistência de caráter.' },
  { word: 'FIXAR', definition: 'Tornar firme, estável ou imóvel; pregar, estabelecer limites ou memorizar algo.' },
  { word: 'FLORA', definition: 'Conjunto de plantas de uma região ou época; diversidade vegetal de um ecossistema.' },
  { word: 'FLUIR', definition: 'Correr como líquido; transcorrer de forma contínua, natural e sem obstáculos.' },
  { word: 'FLUOR', definition: 'Elemento químico (gás) usado no tratamento da água e em cremes dentais para prevenir cáries.' },
  { word: 'FOCAL', definition: 'Relativo ao foco; ponto central de convergência, interesse ou atenção.' },
  { word: 'FONTE', definition: 'Nascente de água; origem ou causa de algo; tipo de letra (tipografia) em design.' },
  { word: 'FOSCO', definition: 'Que não tem brilho; superfície opaca, embaçada ou sem polimento.' },
  { word: 'FRADE', definition: 'Membro de ordem religiosa mendicante ou monástica; irmão religioso.' },
  { word: 'FRUTO', definition: 'Órgão vegetal que protege as sementes; resultado, produto ou consequência de uma ação.' },
  { word: 'FUNGO', definition: 'Organismo do reino Fungi (como cogumelos e bolores) que absorve nutrientes de matéria orgânica.' },
  { word: 'FUSAO', definition: 'Passagem do estado sólido para o líquido; união, mistura ou integração de empresas/coisas.' },

  // --- LETRA G ---
  { word: 'GASES', definition: 'Estado da matéria em que as moléculas se movem livremente; plural de gás.' },
  { word: 'GEMEO', definition: 'Irmão nascido do mesmo parto (gestação); algo que é idêntico ou par de outro.' },
  { word: 'GENES', definition: 'Segmentos de DNA responsáveis por transmitir características hereditárias dos pais aos filhos.' },
  { word: 'GENIO', definition: 'Pessoa com capacidade intelectual ou criativa extraordinária; índole ou temperamento.' },
  { word: 'GERAR', definition: 'Dar origem a; procriar, produzir energia ou causar um efeito/sentimento.' },
  { word: 'GLOBO', definition: 'Corpo esférico; o planeta Terra; modelo tridimensional que representa a Terra ou o céu.' },
  { word: 'GOLPE', definition: 'Impacto físico rápido; manobra para tomar o poder (política); ou uma ação astuciosa (fraude).' },
  { word: 'GRADE', definition: 'Estrutura de barras cruzadas para proteção; quadro de horários ou programação (TV/escola).' },
  { word: 'GRUPO', definition: 'Conjunto de pessoas ou objetos reunidos por afinidade, natureza ou propósito comum.' },

  // --- LETRA H ---
  { word: 'HABIL', definition: 'Que tem habilidade, aptidão ou destreza; capaz, inteligente ou perspicaz em suas ações.' },
  { word: 'HASTE', definition: 'Caule fino de plantas; vara ou mastro que sustenta algo (como uma bandeira ou lança).' },
  { word: 'HIATO', definition: 'Interrupção ou lacuna em uma continuidade; encontro de duas vogais pronunciadas em sílabas diferentes.' },
  { word: 'HINDU', definition: 'Relativo ao hinduísmo (religião e cultura predominante na Índia) ou aos seus seguidores.' },

  // --- LETRA I ---
  { word: 'ICONE', definition: 'Símbolo gráfico em computação; imagem religiosa sagrada; ou pessoa que é referência e símbolo de uma área.' },
  { word: 'IDADE', definition: 'Tempo decorrido desde o nascimento de um ser ou origem de algo; fase da vida ou período histórico.' },
  { word: 'IDEAL', definition: 'Modelo de perfeição que existe na mente; meta suprema ou objetivo que se deseja alcançar.' },
  { word: 'IMPAR', definition: 'Número inteiro que não é divisível por dois; algo que é único, extraordinário ou sem igual.' },
  { word: 'IMUNE', definition: 'Que possui proteção contra doenças (imunidade); que está isento ou livre de certas obrigações ou punições.' },
  { word: 'INDIO', definition: 'Elemento químico metálico (In); ou termo usado para designar os povos originários das Américas (indígenas).' },

  // --- LETRA J ---
  { word: 'JUROS', definition: 'Remuneração cobrada pelo empréstimo de dinheiro; rendimento obtido ao investir capital por um tempo.' },
  { word: 'JUSTO', definition: 'Que age com retidão e imparcialidade; que é exato, apertado (roupa) ou merecido.' },

  // --- LETRA L ---
  { word: 'LAICO', definition: 'Que não pertence ao clero nem a uma ordem religiosa; diz-se do Estado que não tem religião oficial (secular).' },
  { word: 'LARVA', definition: 'Estágio imaturo do desenvolvimento de certos animais (como insetos) antes da metamorfose.' },
  { word: 'LEITO', definition: 'Lugar onde se deita (cama); ou o fundo do terreno por onde correm as águas de um rio.' },
  { word: 'LENTO', definition: 'Que se move ou age com pouca velocidade; que demora a acontecer; vagaroso.' },
  { word: 'LIDER', definition: 'Pessoa que exerce influência, comando ou autoridade sobre um grupo; guia ou chefe.' },
  { word: 'LIDAR', definition: 'Tratar ou ocupar-se com algo/alguém; enfrentar uma situação difícil ou trabalhar (labutar).' },
  { word: 'LINHA', definition: 'Fio usado para costura; traço contínuo; fileira de pessoas/coisas; ou conexão de transporte.' },
  { word: 'LUGAR', definition: 'Espaço ocupado por um corpo; localidade, sítio, povoado ou posição em uma hierarquia.' },
  { word: 'LUMEN', definition: 'Unidade de medida de fluxo luminoso (Física); ou o espaço interno de uma estrutura tubular (Biologia).' },
  { word: 'LUTAR', definition: 'Travar combate ou briga; esforçar-se intensamente para superar obstáculos ou vencer.' },

  // --- LETRA M ---
  { word: 'MAIOR', definition: 'Que supera outro em tamanho, quantidade, intensidade, duração ou importância.' },
  { word: 'MANGA', definition: 'Fruto da mangueira, de polpa amarela e doce; ou parte do vestuário que cobre o braço.' },
  { word: 'MASSA', definition: 'Quantidade de matéria de um corpo (Física); mistura de farinha/água (culinária); ou multidão de pessoas.' },
  { word: 'MEDIA', definition: 'Valor que representa o ponto central de um conjunto de dados (média aritmética); feminino de médio.' },
  { word: 'MEDIR', definition: 'Determinar a extensão, quantidade ou grandeza de algo comparando com uma unidade padrão.' },
  { word: 'MENOR', definition: 'Inferior em tamanho, quantidade, idade ou importância em relação a outro.' },
  { word: 'METAL', definition: 'Elemento químico sólido, brilhante e bom condutor de calor/eletricidade (ex: ferro); ou gênero musical.' },
  { word: 'MITOS', definition: 'Narrativas fantásticas sobre deuses/heróis para explicar o mundo; ou crenças populares sem base real.' },
  { word: 'MIDIA', definition: 'Os meios de comunicação de massa (TV, internet, rádio); ou suporte físico para dados (CD, DVD).' },
  { word: 'MISTO', definition: 'Que é composto por elementos diferentes misturados; ou sanduíche de queijo e presunto.' },
  { word: 'MOEDA', definition: 'Peça de metal ou papel emitida por autoridade para servir como dinheiro; unidade monetária.' },
  { word: 'MORAL', definition: 'Conjunto de regras, valores e costumes que orientam o comportamento certo e errado em uma sociedade.' },
  { word: 'MOVER', definition: 'Tirar de um lugar para outro; deslocar, agitar ou impulsionar algo; causar emoção.' },
  { word: 'MUTAR', definition: 'Mudar, transformar-se; sofrer alteração genética (biologia) ou mudança de natureza.' },
  
  // --- LETRA N ---
  { word: 'NACAO', definition: 'Comunidade humana com laços históricos, culturais e linguísticos, geralmente fixada em um território.' },
  { word: 'NASAL', definition: 'Relativo ao nariz; som produzido com a passagem de ar pelas narinas (ex: fonemas como "ão", "m").' },
  { word: 'NATAL', definition: 'Relativo ao nascimento; cidade onde se nasceu; ou a festa cristã que celebra o nascimento de Jesus.' },
  { word: 'NERVO', definition: 'Filamento que transmite impulsos elétricos entre o cérebro/medula e as outras partes do corpo.' },
  { word: 'NICHO', definition: 'Cavidade na parede para estátuas; papel ecológico de uma espécie; ou segmento específico de mercado.' },
  { word: 'NIVEL', definition: 'Instrumento para verificar a horizontalidade; altura vertical; ou grau de qualidade/status de algo.' },
  { word: 'NOBRE', definition: 'Que pertence à aristocracia; ou alguém que possui caráter elevado, generosidade e excelência.' },
  { word: 'NORMA', definition: 'Regra, princípio ou padrão estabelecido que regula procedimentos ou comportamentos sociais.' },
  { word: 'NUVEM', definition: 'Aglomerado visível de água/gelo no céu; ou metáfora para armazenamento de dados na internet.' },

  // --- LETRA O ---
  { word: 'OBVIO', definition: 'Que salta à vista; que é claro, evidente, manifesto e impossível de ignorar ou negar.' },
  { word: 'OMEGA', definition: 'A última letra do alfabeto grego (Ω); símbolo de fim, término ou o último de uma série.' },
  { word: 'ONDAS', definition: 'Perturbações que se propagam em um meio (como água, ar ou vácuo) transportando energia.' },
  { word: 'ORDEM', definition: 'Disposição organizada; mandado de uma autoridade; ou categoria de classificação biológica.' },
  { word: 'ORGAO', definition: 'Parte do corpo com função específica (ex: coração); instrumento musical de teclas; ou instituição.' },
  { word: 'OSSOS', definition: 'Estruturas rígidas e calcificadas que compõem o esqueleto, sustentam o corpo e protegem órgãos.' },
  { word: 'OVULO', definition: 'Célula reprodutora feminina (gameta) que, ao ser fecundada, dá origem a um novo ser.' },
  { word: 'OXIDO', definition: 'Composto químico binário formado pela combinação do oxigênio com outro elemento (ex: ferrugem).' },

  // --- LETRA P ---
  { word: 'PAGAO', definition: 'Aquele que não foi batizado; ou seguidor de religiões politeístas/antigas (não cristãs/judaicas).' },
  { word: 'PEDRA', definition: 'Fragmento sólido de rocha ou mineral; material duro usado em construção.' },
  { word: 'PLACA', definition: 'Chapa plana de metal/plástico com inscrições (sinalização); ou acúmulo bacteriano nos dentes.' },
  { word: 'PLENO', definition: 'Que está completo, cheio, inteiro ou absoluto; que atingiu o grau máximo.' },
  { word: 'POEMA', definition: 'Obra literária em verso, geralmente com rima e ritmo, expressando emoção e subjetividade.' },
  { word: 'POLEN', definition: 'Pó fino (grãos) produzido pelas flores masculinas, essencial para a reprodução das plantas.' },
  { word: 'PRADO', definition: 'Terreno plano ou suavemente ondulado coberto de relva, usado como pastagem; campina.' },
  { word: 'PRAXE', definition: 'Aquilo que é habitual ou costumeiro; rotina, prática estabelecida ou convenção social.' },
  { word: 'PROLE', definition: 'O conjunto dos filhos ou descendentes de um casal ou indivíduo; descendência.' },
  { word: 'PROSA', definition: 'Forma de texto natural, sem métrica ou rima (oposto à poesia); ou conversa informal.' },
  { word: 'PUDOR', definition: 'Sentimento de vergonha, timidez ou recato diante do que pode ferir a modéstia ou a moral.' },
  
  // --- LETRA R ---
  { word: 'RADIO', definition: 'Elemento químico radioativo (Ra); osso do antebraço; ou sistema de transmissão de som por ondas eletromagnéticas.' },
  { word: 'RAZAO', definition: 'Faculdade intelectual de julgar e raciocinar; motivo ou causa de algo; proporção matemática entre grandezas.' },
  { word: 'REGER', definition: 'Governar ou administrar; conduzir uma orquestra ou coro; ter relação de dependência gramatical.' },
  { word: 'RENTE', definition: 'Que está muito próximo ou junto a algo; que foi cortado curto (cabelo/grama).' },
  { word: 'RETRO', definition: 'Que se refere ao passado ou ao que fica atrás; estilo que imita modas antigas.' },
  { word: 'RITMO', definition: 'Sucessão regular de tempos fortes e fracos (música); movimento cadenciado ou velocidade de uma atividade.' },
  { word: 'RIVAL', definition: 'Aquele que disputa algo com outrem; competidor, concorrente ou adversário.' },
  { word: 'ROCHA', definition: 'Massa sólida natural composta por um ou mais minerais; sentido figurado para algo muito duro ou insensível.' },
  { word: 'RUBRO', definition: 'Que tem cor vermelha muito viva ou intensa; cor de sangue ou de fogo.' },
  { word: 'RURAL', definition: 'Relativo ao campo, à vida agrícola ou ao interior; oposto de urbano.' },

  // --- LETRA S ---
  { word: 'SABOR', definition: 'Sensação produzida no paladar pelo contato com alimentos; gosto ou paladar característico.' },
  { word: 'SACRO', definition: 'Que é sagrado, divino ou digno de veneração; ou osso triangular na base da coluna vertebral.' },
  { word: 'SAGAZ', definition: 'Que tem perspicácia e inteligência rápida; esperto, astuto ou que percebe as coisas facilmente.' },
  { word: 'SEARA', definition: 'Campo extenso de cereais (trigo/milho); terra cultivada; ou sentido figurado para área de atuação/trabalho.' },
  { word: 'SEITA', definition: 'Grupo que se separa de uma doutrina principal (religiosa ou política) para seguir seus próprios princípios.' },
  { word: 'SENSO', definition: 'Faculdade de apreciar, julgar ou sentir (ex: senso crítico); juízo claro ou prudência (bom senso).' },
  { word: 'SERIE', definition: 'Sequência de coisas ou eventos da mesma natureza; conjunto ordenado; produção televisiva em episódios.' },
  { word: 'SETOR', definition: 'Parte distinta de um todo; subdivisão administrativa, econômica ou territorial.' },
  { word: 'SINAL', definition: 'Indício, vestígio ou marca; gesto para comunicar algo; aviso luminoso de trânsito (semáforo).' },
  { word: 'SODIO', definition: 'Elemento químico metálico (Na), macio e reativo, componente essencial do sal de cozinha.' },
  { word: 'SOLOS', definition: 'Camadas superficiais da crosta terrestre onde crescem as plantas; plural de solo (terra/chão).' },
  { word: 'SONAR', definition: 'Equipamento que usa propagação de som sob a água para detectar objetos (usado em submarinos/navios).' },
  { word: 'SUAVE', definition: 'Que é agradável aos sentidos; brando, macio, delicado; sem aspereza ou intensidade excessiva.' },
  { word: 'SUTIL', definition: 'Que é tênue, delicado ou quase imperceptível; que demonstra grande perspicácia ou fineza.' },
  
  // --- LETRA T ---
  { word: 'TEIAS', definition: 'Estruturas de fios de seda produzidas por aranhas; trama, rede ou conjunto de coisas entrelaçadas.' },
  { word: 'TEMPO', definition: 'Duração relativa das coisas; estado atmosférico (clima); ou época determinada na história.' },
  { word: 'TENSO', definition: 'Que está esticado ou sob pressão; que causa ansiedade, nervosismo ou preocupação.' },
  { word: 'TENUE', definition: 'Que é muito fino, delgado ou frágil; que tem pouca consistência ou intensidade; sutil.' },
  { word: 'TERMO', definition: 'Palavra ou expressão; limite, fim ou prazo de algo; condição estipulada em contrato.' },
  { word: 'TERRA', definition: 'O planeta onde habitamos; solo cultivável; chão firme (oposto a mar).' },
  { word: 'TIBIA', definition: 'O osso mais volumoso e interno da perna (canela), situado entre o joelho e o tornozelo.' },
  { word: 'TORAX', definition: 'Parte do corpo entre o pescoço e o abdômen (peito), onde ficam coração e pulmões.' },
  { word: 'TORPE', definition: 'Que é vergonhoso, ignóbil ou desprezível; que ofende a moral ou a decência; infame.' },
  { word: 'TOTAL', definition: 'Que abrange tudo; completo, inteiro ou integral; soma de todas as partes.' },
  { word: 'TRAMA', definition: 'Enredo de uma obra literária/filme; entrelaçamento de fios em tecido; ou conspiração/intriga.' },
  { word: 'TRENA', definition: 'Fita métrica flexível e retrátil usada para medir distâncias e extensões lineares.' },
  { word: 'TRIBO', definition: 'Grupo social unido por origem, língua e costumes comuns; ou grupo de pessoas com interesses afins.' },
  { word: 'TRONO', definition: 'Assento elevado usado por monarcas (reis/rainhas); símbolo do poder real ou soberania.' },

  // --- LETRA U ---
  { word: 'UMIDO', definition: 'Que está levemente molhado ou impregnado de água/vapor; que contém umidade.' },
  { word: 'UNIAO', definition: 'Ato ou efeito de unir-se; associação, casamento ou aliança; ente federativo (Governo Federal).' },
  { word: 'UTERO', definition: 'Órgão muscular oco do sistema reprodutor feminino onde o feto se desenvolve durante a gestação.' },

  // --- LETRA V ---
  { word: 'VACUO', definition: 'Espaço vazio, desprovido de matéria; ausência de ar ou pressão atmosférica.' },
  { word: 'VALOR', definition: 'Qualidade que confere importância a algo; preço monetário; ou coragem/bravura.' },
  { word: 'VAPOR', definition: 'Estado gasoso de uma substância que é líquida ou sólida em temperatura ambiente (ex: vapor d\'água).' },
  { word: 'VASTO', definition: 'Que é muito extenso, amplo ou grandioso; que ocupa muito espaço.' },
  { word: 'VAZIO', definition: 'Que não contém nada; desocupado, oco; ou sentimento de falta de propósito/significado.' },
  { word: 'VEIAS', definition: 'Vasos sanguíneos que transportam o sangue do corpo de volta para o coração.' },
  { word: 'VELOZ', definition: 'Que se move com grande rapidez; ligeiro, célere ou rápido.' },
  { word: 'VETOR', definition: 'Ente matemático com direção, sentido e intensidade; ou agente que transmite doenças (ex: mosquito).' },
  { word: 'VIDEO', definition: 'Tecnologia de gravação, processamento e exibição de imagens em movimento; filme curto.' },
  { word: 'VIGOR', definition: 'Força física, energia ou vitalidade; robustez ou plena eficácia (de uma lei).' },
  { word: 'VILAO', definition: 'Personagem antagonista que se opõe ao herói; indivíduo que pratica ações maldosas ou desleais.' },
  { word: 'VIRUS', definition: 'Agente infeccioso microscópico que se reproduz dentro de células vivas; ou programa malicioso de computador.' },
  { word: 'VITAL', definition: 'Essencial para a vida; fundamental, indispensável ou de importância crítica.' },
  { word: 'VIVER', definition: 'Ter vida; existir; aproveitar a existência; habitar ou morar em algum lugar.' },
  { word: 'VIVOS', definition: 'Que têm vida; plural de vivo; ou pessoas espertas/ágeis (sentido figurado).' },
  { word: 'VOTAR', definition: 'Expressar vontade ou opinião em uma eleição ou assembleia; participar de um sufrágio.' },
  { word: 'VULGO', definition: 'Apelido ou nome popular pelo qual alguém é conhecido; ou a classe popular (o povo).' },

  // --- LETRA Z ---
  { word: 'ZINCO', definition: 'Elemento químico metálico (Zn), branco-azulado, usado em ligas e para proteger o aço contra corrosão.' }
];

// Exporta palavras do jogo (agora objetos)
export const GAME_WORDS = STATIC_GAME_WORDS;

console.log(`🎮 LEXOO: ${GAME_WORDS.length} palavras estáticas carregadas para o jogo`);

// Tipos
export type LetterStatus = 'correct' | 'present' | 'absent' | 'initial';

export interface FormattedLetter {
  key: string;
  status: LetterStatus;
}

export interface GameStats {
  gamesPlayed: number;
  winPercentage: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
}

// ------------------------------------------------------------
// ATUALIZAÇÃO NAS FUNÇÕES DE SELEÇÃO E VALIDAÇÃO
// ------------------------------------------------------------

// Agora retorna um objeto GameWord completo
export const getRandomWord = (): GameWord => {
  return GAME_WORDS[Math.floor(Math.random() * GAME_WORDS.length)];
};

// Agora retorna um objeto GameWord completo
export const getDailyWord = (): GameWord => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  
  const seed = dayOfYear + today.getFullYear() * 365;
  const index = seed % GAME_WORDS.length;
  
  const selected = GAME_WORDS[index];
  console.log(`📅 Palavra do dia (${today.toLocaleDateString('pt-BR')}): ${selected.word} (índice ${index}/${GAME_WORDS.length})`);
  
  return selected;
};

export const isValidWord = (word: string): boolean => {
  try {
    return Word.checkValid(
      word.toLowerCase(),
      WORD_LENGTH,
      true,
      false,
      false,
      false
    );
  } catch (error) {
    console.error('❌ Erro ao validar palavra:', error);
    // Fallback: Atualizado para buscar dentro dos objetos
    return GAME_WORDS.some(w => w.word === word.toUpperCase());
  }
};

// Funções de localStorage permanecem iguais, pois salvam strings
export const hasSavedGame = (): boolean => {
  try {
    const saved = localStorage.getItem('lexoo_game_state');
    return saved !== null;
  } catch {
    return false;
  }
};

export const clearSavedGame = (): void => {
  try {
    localStorage.removeItem('lexoo_game_state');
    console.log('🗑️ Jogo salvo removido');
  } catch (error) {
    console.error('❌ Erro ao limpar jogo salvo:', error);
  }
};