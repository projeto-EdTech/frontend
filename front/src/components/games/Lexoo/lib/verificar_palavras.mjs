import { Word } from "@andsfonseca/palavras-pt-br";

// --- LISTA COMPLETA DE 255 PALAVRAS (HARD MODE) ---
// Cole a sua lista de palavras aqui dentro
const WORDS = [];

/**
 * Normaliza uma string para comparação (remove acentos e põe em caixa alta).
 */
const normalizar = (str) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
};

async function verificarPalavras() {
  console.log(
    `\n🔍 Iniciando verificação de integridade para o vestibuline...`,
  );
  console.log(`📚 Buscando palavras na biblioteca...`);

  const listaDaLib = Word.getAllWords();

  // Criamos um Set para busca rápida
  const dicionarioSet = new Set(listaDaLib.map((w) => normalizar(w)));

  const ausentes = [];
  const presentes = [];
  const tamanhoIncorreto = []; // Array para armazenar erros de tamanho

  WORDS.forEach((palavra) => {
    // 1. Verificação de Tamanho
    if (palavra.length !== 5) {
      tamanhoIncorreto.push(palavra);
    }

    // 2. Verificação de Existência (Dicionário)
    // Nota: Mesmo se o tamanho estiver errado, verificamos se ela existe,
    // mas o foco aqui é a validação completa.
    if (dicionarioSet.has(palavra)) {
      presentes.push(palavra);
    } else {
      ausentes.push(palavra);
    }
  });

  console.log(`\n📊 Relatório Final:`);
  console.log(`----------------------------------------`);
  console.log(`✅ Palavras Válidas (Reconhecidas): ${presentes.length}`);
  console.log(`❌ Palavras Ausentes na Lib:       ${ausentes.length}`);
  console.log(`⚠️  Palavras com tamanho errado:    ${tamanhoIncorreto.length}`);
  console.log(`----------------------------------------`);

  // Bloco de erro de tamanho (NOVO)
  if (tamanhoIncorreto.length > 0) {
    console.log(`\n🚫 ERRO DE TAMANHO (Diferente de 5 letras):`);
    tamanhoIncorreto.forEach((p) => {
      console.log(`   - "${p}" (tamanho: ${p.length})`);
    });
  }

  // Bloco de palavras ausentes
  if (ausentes.length > 0) {
    console.log(
      `\n⚠️  ATENÇÃO: As seguintes palavras não constam na biblioteca:`,
    );
    console.log(JSON.stringify(ausentes, null, 2));
  }

  if (tamanhoIncorreto.length === 0 && ausentes.length === 0) {
    console.log(
      `\n✨ Perfeito! Todas as palavras têm 5 letras e estão na biblioteca.`,
    );
  }
}

verificarPalavras();
