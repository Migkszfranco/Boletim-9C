/* =========================================================
   BOLETIM DIGITAL — SCRIPT PRINCIPAL
   ========================================================= */

/* ---------------------------------------------------------
   📚 DADOS BRUTOS DAS DISCIPLINAS
   Cada item do array é um objeto com as notas dos 3 trimestres
   e as faltas de cada trimestre.
   --------------------------------------------------------- */
const disciplinas = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

/* Média mínima de referência */
const MEDIA_MINIMA = 6.0;

/* ---------------------------------------------------------
   🔧 FUNÇÃO: normalizarNota(valor)
   Converte qualquer formato de nota para a escala 0–10.
   - vazio/null/undefined → null (nota ainda não lançada)
   - 0 a 10 → permanece igual
   - >10 e <=100 → divide por 10
   - aceita ponto ou vírgula como decimal ("8,5" → 8.5)
   - valores fora das regras → null (inválido)
   --------------------------------------------------------- */
function normalizarNota(valor) {
  // Nota ausente
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Se for string, troca vírgula por ponto antes de converter
  let numero;
  if (typeof valor === "string") {
    numero = Number(valor.replace(",", "."));
  } else {
    numero = Number(valor);
  }

  // Se não for um número válido, retorna null
  if (isNaN(numero)) return null;

  // Regra das escalas
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Fora das regras → inválido
  return null;
}

/* ---------------------------------------------------------
   🔧 FUNÇÃO: calcularMedia(notas)
   Recebe um array de notas já normalizadas (ou null).
   Calcula a média apenas das notas disponíveis.
   --------------------------------------------------------- */
function calcularMedia(notas) {
  // Filtra apenas as notas que não são null
  const validas = notas.filter((n) => n !== null);

  // Se não houver nenhuma nota válida, retorna null
  if (validas.length === 0) return null;

  // Soma tudo e divide pela quantidade
  const soma = validas.reduce((acc, n) => acc + n, 0);
  return soma / validas.length;
}

/* ---------------------------------------------------------
   🔧 FUNÇÃO: definirSituacao(media)
   Retorna a situação da disciplina conforme a média.
   - média null → "Nota ainda não disponível"
   - >= 6 → "Bom desempenho"
   - < 6 → "Atenção"
   --------------------------------------------------------- */
function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= MEDIA_MINIMA) return "Bom desempenho";
  return "Atenção";
}

/* ---------------------------------------------------------
   🔧 FUNÇÃO: somarFaltas(faltas)
   Soma as faltas dos trimestres de uma disciplina.
   --------------------------------------------------------- */
function somarFaltas(faltas) {
  return faltas.reduce((acc, f) => acc + f, 0);
}

/* ---------------------------------------------------------
   🔧 FUNÇÃO: formatarNota(valor)
   Mostra a nota com 1 casa decimal (ex.: 8.6 → "8.6")
   ou "Ainda não lançada" se for null.
   --------------------------------------------------------- */
function formatarNota(valor) {
  if (valor === null) return "Ainda não lançada";
  return valor.toFixed(1);
}

/* ---------------------------------------------------------
   🔧 FUNÇÃO: classeSituacao(situacao)
   Retorna a classe CSS conforme a situação, para colorir.
   --------------------------------------------------------- */
function classeSituacao(situacao) {
  if (situacao === "Bom desempenho") return "situacao-bom";
  if (situacao === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}

/* ---------------------------------------------------------
   🧠 PROCESSAMENTO: preparar os dados
   Percorre o array de disciplinas, normaliza as notas,
   calcula média, soma faltas e define situação.
   --------------------------------------------------------- */
const disciplinasProcessadas = disciplinas.map((d) => {
  const n1 = normalizarNota(d.tri1);
  const n2 = normalizarNota(d.tri2);
  const n3 = normalizarNota(d.tri3);

  const media = calcularMedia([n1, n2, n3]);
  const totalFaltas = somarFaltas(d.faltas);
  const situacao = definirSituacao(media);

  return {
    disciplina: d.disciplina,
    n1, n2, n3,
    media,
    totalFaltas,
    situacao
  };
});

/* ---------------------------------------------------------
   🖼️ DOM: preencher a tabela
   --------------------------------------------------------- */
function preencherTabela() {
  const corpo = document.getElementById("corpo-tabela");
  corpo.innerHTML = ""; // limpa antes de preencher

  disciplinasProcessadas.forEach((d) => {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${d.disciplina}</td>
      <td>${formatarNota(d.n1)}</td>
      <td>${formatarNota(d.n2)}</td>
      <td>${formatarNota(d.n3)}</td>
      <td>${formatarNota(d.media)}</td>
      <td>${d.totalFaltas}</td>
      <td class="${classeSituacao(d.situacao)}">${d.situacao}</td>
    `;

    corpo.appendChild(linha);
  });
}

/* ---------------------------------------------------------
   📊 DOM: preencher os cards de resumo
   --------------------------------------------------------- */
function preencherCards() {
  const container = document.getElementById("cards-resumo");

  // Calcula a média geral (média das médias disponíveis)
  const mediasDisponiveis = disciplinasProcessadas
    .map((d) => d.media)
    .filter((m) => m !== null);

  const mediaGeral = mediasDisponiveis.length > 0
    ? mediasDisponiveis.reduce((a, b) => a + b, 0) / mediasDisponiveis.length
    : null;

  // Soma total de faltas de todas as disciplinas
  const totalFaltas = disciplinasProcessadas
    .reduce((acc, d) => acc + d.totalFaltas, 0);

  // Conta disciplinas com bom desempenho
  const comBomDesempenho = disciplinasProcessadas
    .filter((d) => d.situacao === "Bom desempenho").length;

  // Conta disciplinas que precisam de atenção
  const comAtencao = disciplinasProcessadas
    .filter((d) => d.situacao === "Atenção").length;

  // ⚠️ Frequência FICTÍCIA apenas para demonstração nesta etapa.
  // No futuro, será calculada com dados reais de frequência escolar.
  const frequenciaDemonstrativa = "92%";

  // Lista de cards a exibir
  const cards = [
    { titulo: "Média Geral", valor: mediaGeral !== null ? mediaGeral.toFixed(1) : "—" },
    { titulo: "Total de Faltas", valor: totalFaltas },
    { titulo: "Bom Desempenho", valor: comBomDesempenho },
    { titulo: "Precisam de Atenção", valor: comAtencao },
    { titulo: "Frequência", valor: frequenciaDemonstrativa + " — adequada" }
  ];

  // Cria os cards no DOM
  cards.forEach((c) => {
    const div = document.createElement("div");
    div.classList.add("card");
    div.innerHTML = `
      <h3>${c.titulo}</h3>
      <p class="valor">${c.valor}</p>
    `;
    container.appendChild(div);
  });
}

/* ---------------------------------------------------------
   🚀 INICIALIZAÇÃO
   Quando a página carregar, preenche os cards e a tabela.
   --------------------------------------------------------- */
preencherCards();
preencherTabela();