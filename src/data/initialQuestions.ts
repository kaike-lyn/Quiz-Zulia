import { QuizQuestion } from '../types/quiz';

export const INITIAL_QUESTIONS: QuizQuestion[] = [
  // --- VERDADES ---
  {
    id: 'v1',
    statement: 'A alimentação é um fator modificável relacionado ao risco de câncer.',
    isTrue: true,
    category: 'Alimentação & Prevenção',
    explanation: 'Verdadeiro! De acordo com a Organização Mundial da Saúde (OMS) e o Instituto Nacional de Câncer (INCA), cerca de 30% a 50% dos casos de câncer são evitáveis com hábitos de vida saudáveis, onde a alimentação equilibrada e rica em compostos bioativos tem papel primordial.',
    scientificReference: 'World Cancer Research Fund (WCRF) / INCA Diretrizes de Prevenção'
  },
  {
    id: 'v2',
    statement: 'As bactérias do intestino podem influenciar o funcionamento do sistema imunológico.',
    isTrue: true,
    category: 'Microbiota & Imunidade',
    explanation: 'Verdadeiro! Aproximadamente 70% das células do nosso sistema imune concentram-se no tecido linfoide associado ao intestino (GALT). As bactérias benéficas fermentam fibras gerando ácidos graxos de cadeia curta (como butirato) que regulam a inflamação e a imunovigilância.',
    scientificReference: 'Nature Reviews Immunology: Microbiota-immune axis'
  },
  {
    id: 'v3',
    statement: 'A atividade física contribui para prevenção do câncer independentemente da perda de peso.',
    isTrue: true,
    category: 'Estilo de Vida',
    explanation: 'Verdadeiro! A prática regular de exercícios reduz níveis séricos de insulina em jejum, fator de crescimento IGF-1, melhora o estresse oxidativo e otimiza a atividade das células Natural Killer (NK), conferindo proteção metabólica mesmo sem alteração expressiva no peso na balança.',
    scientificReference: 'American Cancer Society: Physical activity and cancer risk'
  },
  {
    id: 'v4',
    statement: 'Brássicas (grupo do brócolis, couve, repolho, couve-flor) têm compostos que, no corpo, podem virar substâncias que ajudam na modulação do metabolismo do estrogênio e têm propriedades associadas a proteção celular.',
    isTrue: true,
    category: 'Hormônios & Metabolismo',
    explanation: 'Verdadeiro! As brássicas contêm glucosinolatos que se convertem enzimaticamente em sulforafano e indol-3-carbinol (I3C/DIM). Esses compostos modulam as vias de hidroxilação hepática do estrogênio, favorecendo a via protetora (2-hidroxiestrona) e ativando a via de desintoxicação celular Nrf2.',
    scientificReference: 'Journal of Nutritional Biochemistry & Phytochemical Reviews'
  },
  {
    id: 'v5',
    statement: 'Xenobióticos são substâncias químicas que não são produzidas naturalmente pelo nosso organismo e podem estar presentes em cosméticos. Algumas dessas substâncias podem danificar o DNA ou interferir em processos celulares, contribuindo para o desenvolvimento do câncer.',
    isTrue: true,
    category: 'Toxinas & Ambiente',
    explanation: 'Verdadeiro! Xenobióticos como parabenos, ftalatos, triclosan e certos filtros químicos atuam como xenoestrogênios ou desreguladores endócrinos, podendo induzir dano oxidativo ao DNA e interferir na sinalização celular hormonal.',
    scientificReference: 'Toxicology & Applied Pharmacology: Endocrine disruptors'
  },
  {
    id: 'v6',
    statement: 'O estrogênio é um hormônio importante para a saúde da mulher, mas também pode estimular o crescimento de alguns tipos de câncer de mama. O tecido de gordura também participa da produção de estrogênios, especialmente após a menopausa.',
    isTrue: true,
    category: 'Hormônios & Metabolismo',
    explanation: 'Verdadeiro! O tecido adiposo possui a enzima aromatase, que converte andrógenos circulantes em estrogênios. Após a menopausa, com o declínio da função ovariana, a gordura corporal torna-se a fonte primária de estrogênio no organismo feminino.',
    scientificReference: 'Endocrine Reviews: Adipose tissue and aromatase expression'
  },

  // --- MITOS ---
  {
    id: 'm1',
    statement: 'O nível de gordura corporal não influencia no risco de câncer.',
    isTrue: false,
    category: 'Alimentação & Prevenção',
    explanation: 'Mito! O excesso de gordura corporal está cientificamente associado a pelo menos 13 tipos de tumores. O tecido adiposo hipertrofiado secreta citocinas pró-inflamatórias (IL-6, TNF-alfa), promove resistência à insulina e altera o perfil hormonal proliferativo.',
    scientificReference: 'IARC / New England Journal of Medicine: Body Fatness and Cancer'
  },
  {
    id: 'm2',
    statement: 'Micro-ondas pode ser um fator de risco para câncer.',
    isTrue: false,
    category: 'Toxinas & Ambiente',
    explanation: 'Mito! O forno micro-ondas emite radiação não-ionizante de baixa frequência, capaz apenas de vibrar moléculas de água para aquecer os alimentos. Ela não tem energia para quebrar elétrons, alterar a estrutura do DNA ou tornar o alimento radioativo.',
    scientificReference: 'World Health Organization (WHO) Radiation & Food Safety'
  },
  {
    id: 'm3',
    statement: 'O estrogênio não é afetado pelo intestino.',
    isTrue: false,
    category: 'Microbiota & Imunidade',
    explanation: 'Mito! O intestino abriga o "estroboloma" — um ecossistema bacteriano que produz a enzima beta-glicuronidase. Em caso de disbiose intestinal, essa enzima desconjuga os estrogênios que seriam excretados nas fezes, fazendo com que reentrem na circulação sanguínea.',
    scientificReference: 'Maturitas: The gut microbiome and estrogen metabolism'
  },
  {
    id: 'm4',
    statement: 'Suplementos naturais são sempre seguros.',
    isTrue: false,
    category: 'Alimentação & Prevenção',
    explanation: 'Mito! A origem natural não garante ausência de efeitos adversos. Doses excessivas de antioxidantes isolados, fitoterápicos ou suplementos contaminados podem causar sobrecarga hepática, toxicidade celular ou interagir negativamente com quimioterápicos.',
    scientificReference: 'Oncology Nutrition Practice Group (ON DPG) / ASCO Guidelines'
  },
  {
    id: 'm5',
    statement: 'Apenas legumes, verduras e frutas têm agrotóxicos.',
    isTrue: false,
    category: 'Alimentação & Prevenção',
    explanation: 'Mito! Devido ao fenômeno de bioacumulação e biomagnificação na cadeia alimentar animal (através de rações e pastagens tratadas com defensivos), carnes, laticínios convencionais e grãos também concentram resíduos lipossolúveis de pesticidas.',
    scientificReference: 'Environmental Health Perspectives & Relatórios Anvisa/PARA'
  },
  {
    id: 'm6',
    statement: 'Álcool não é considerado fator de risco de câncer.',
    isTrue: false,
    category: 'Estilo de Vida',
    explanation: 'Mito! Todas as bebidas alcoólicas contêm etanol, que é classificado como carcinógeno Grupo 1 pelo IARC. Seu metabólito direto, o acetaldeído, provoca quebras no DNA e interfere na absorção de folato e antioxidantes.',
    scientificReference: 'IARC Monographs: Alcohol consumption and ethyl carbamate'
  },
  {
    id: 'm7',
    statement: 'O plástico não interfere no funcionamento dos nossos hormônios.',
    isTrue: false,
    category: 'Toxinas & Ambiente',
    explanation: 'Mito! Muitos plásticos liberam desreguladores endócrinos como bisfenol A (BPA) e ésteres de ftalato, sobretudo quando aquecidos ou em contato com gorduras. Eles mimetizam o estrogênio nos receptores celulares, desregulando o eixo hormonal.',
    scientificReference: 'The Endocrine Society Scientific Statement on EDCs'
  }
];

export const DEFAULT_SETTINGS = {
  title: 'Quiz de Mitos & Verdades | Julia Bucchianico',
  nutritionistName: 'Julia Bucchianico',
  subtitle: 'Nutrição Clínica & Funcional',
  allowInstantFeedback: true,
  randomizeQuestions: true,
  adminPin: 'julia2026'
};
