/* =========================================================
   BOLETIM DIGITAL — SCRIPT PRINCIPAL COM INTEGRAÇÃO API
   ========================================================= */

/* ---------------------------------------------------------
   ⚙️ CONFIGURAÇÃO FIXA DO ALUNO
   --------------------------------------------------------- */
const CONFIG_ALUNO = {
  turma: "9C",
  numeroChamada: 26,
  apiUrl: "https://boletim-api.profbt.com.br"
};

/* PIN armazenado apenas em memória durante a sessão */
let pinSessao = "";
let modoEdicao = false;

/* ---------------------------------------------------------
   📚 DADOS BRUTOS PADRÃO DAS DISCIPLINAS (LOCAL)
   --------------------------------------------------------- */
const disciplinasPadrao = [
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

/* Array dinâmico em uso no aplicativo */
let listaDisciplinas = [];

/* Média mínima de referência */
const MEDIA_MINIMA = 6.0;

/* ---------------------------------------------------------
   🔧 FUNÇÕES DE NORMALIZAÇÃO E CÁLCULO
   --------------------------------------------------------- */
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  let numero;
  if (typeof valor === "string") {
    numero = Number(valor.replace(",", "."));
  } else {
    numero = Number(valor);
  }

  if (isNaN(numero)) return null;

  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  return null;
}

function calcularMedia(notas) {
  const validas = notas.filter((n) => n !== null);
  if (validas.length === 0) return null;
  const soma = validas.reduce((acc, n) => acc + n, 0);
  return soma / validas.length;
}

function definirSituacao(media) {
  if (media === null) return "Nota ainda não disponível";
  if (media >= MEDIA_MINIMA) return "Bom desempenho";
  return "Atenção";
}

function somarFaltas(faltas) {
  if (!Array.isArray(faltas)) return 0;
  return faltas.reduce((acc, f) => acc + (Number(f) || 0), 0);
}

function formatarNota(valor) {
  if (valor === null) return "Ainda não lançada";
  return valor.toFixed(1);
}

function classeSituacao(situacao) {
  if (situacao === "Bom desempenho") return "situacao-bom";
  if (situacao === "Atenção") return "situacao-atencao";
  return "situacao-sem-nota";
}

/* ---------------------------------------------------------
   🧠 PROCESSAMENTO DOS DADOS PARA EXIBIÇÃO
   --------------------------------------------------------- */
function obterDisciplinasProcessadas() {
  return listaDisciplinas.map((d) => {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);

    const media = calcularMedia([n1, n2, n3]);
    const totalFaltas = somarFaltas(d.faltas);
    const situacao = definirSituacao(media);

    return {
      disciplina: d.disciplina,
      tri1: d.tri1,
      tri2: d.tri2,
      tri3: d.tri3,
      faltas: Array.isArray(d.faltas) ? d.faltas : [0, 0, 0],
      n1, n2, n3,
      media,
      totalFaltas,
      situacao
    };
  });
}

/* ---------------------------------------------------------
   🖼️ RENDERIZAÇÃO DA TABELA E CARDS
   --------------------------------------------------------- */
function preencherTabela() {
  const corpo = document.getElementById("corpo-tabela");
  corpo.innerHTML = "";

  const processadas = obterDisciplinasProcessadas();

  processadas.forEach((d, idx) => {
    const linha = document.createElement("tr");

    if (modoEdicao) {
      // Modo de Edição com Inputs
      const tdNome = document.createElement("td");
      tdNome.textContent = d.disciplina;

      const tdTri1 = document.createElement("td");
      const inTri1 = document.createElement("input");
      inTri1.type = "text";
      inTri1.className = "input-nota";
      inTri1.dataset.idx = idx;
      inTri1.dataset.campo = "tri1";
      inTri1.value = d.tri1 !== null && d.tri1 !== undefined ? d.tri1 : "";
      tdTri1.appendChild(inTri1);

      const tdTri2 = document.createElement("td");
      const inTri2 = document.createElement("input");
      inTri2.type = "text";
      inTri2.className = "input-nota";
      inTri2.dataset.idx = idx;
      inTri2.dataset.campo = "tri2";
      inTri2.value = d.tri2 !== null && d.tri2 !== undefined ? d.tri2 : "";
      tdTri2.appendChild(inTri2);

      const tdTri3 = document.createElement("td");
      const inTri3 = document.createElement("input");
      inTri3.type = "text";
      inTri3.className = "input-nota";
      inTri3.dataset.idx = idx;
      inTri3.dataset.campo = "tri3";
      inTri3.value = d.tri3 !== null && d.tri3 !== undefined ? d.tri3 : "";
      tdTri3.appendChild(inTri3);

      const tdMedia = document.createElement("td");
      tdMedia.textContent = formatarNota(d.media);

      const tdFaltas = document.createElement("td");
      const divFaltas = document.createElement("div");
      divFaltas.className = "grupo-faltas";

      for (let f = 0; f < 3; f++) {
        const inFalta = document.createElement("input");
        inFalta.type = "text";
        inFalta.className = "input-falta";
        inFalta.dataset.idx = idx;
        inFalta.dataset.faltaIdx = f;
        inFalta.value = d.faltas[f] !== undefined && d.faltas[f] !== null ? d.faltas[f] : 0;
        divFaltas.appendChild(inFalta);
      }
      tdFaltas.appendChild(divFaltas);

      const tdSituacao = document.createElement("td");
      tdSituacao.className = classeSituacao(d.situacao);
      tdSituacao.textContent = d.situacao;

      linha.appendChild(tdNome);
      linha.appendChild(tdTri1);
      linha.appendChild(tdTri2);
      linha.appendChild(tdTri3);
      linha.appendChild(tdMedia);
      linha.appendChild(tdFaltas);
      linha.appendChild(tdSituacao);

    } else {
      // Modo de Visualização Padrão
      const tdNome = document.createElement("td");
      tdNome.textContent = d.disciplina;

      const tdTri1 = document.createElement("td");
      tdTri1.textContent = formatarNota(d.n1);

      const tdTri2 = document.createElement("td");
      tdTri2.textContent = formatarNota(d.n2);

      const tdTri3 = document.createElement("td");
      tdTri3.textContent = formatarNota(d.n3);

      const tdMedia = document.createElement("td");
      tdMedia.textContent = formatarNota(d.media);

      const tdFaltas = document.createElement("td");
      tdFaltas.textContent = d.totalFaltas;

      const tdSituacao = document.createElement("td");
      tdSituacao.className = classeSituacao(d.situacao);
      tdSituacao.textContent = d.situacao;

      linha.appendChild(tdNome);
      linha.appendChild(tdTri1);
      linha.appendChild(tdTri2);
      linha.appendChild(tdTri3);
      linha.appendChild(tdMedia);
      linha.appendChild(tdFaltas);
      linha.appendChild(tdSituacao);
    }

    corpo.appendChild(linha);
  });
}

function preencherCards() {
  const container = document.getElementById("cards-resumo");
  container.innerHTML = "";

  const processadas = obterDisciplinasProcessadas();

  const mediasDisponiveis = processadas
    .map((d) => d.media)
    .filter((m) => m !== null);

  const mediaGeral = mediasDisponiveis.length > 0
    ? mediasDisponiveis.reduce((a, b) => a + b, 0) / mediasDisponiveis.length
    : null;

  const totalFaltas = processadas.reduce((acc, d) => acc + d.totalFaltas, 0);
  const comBomDesempenho = processadas.filter((d) => d.situacao === "Bom desempenho").length;
  const comAtencao = processadas.filter((d) => d.situacao === "Atenção").length;
  const frequenciaDemonstrativa = "92%";

  const cards = [
    { titulo: "Média Geral", valor: mediaGeral !== null ? mediaGeral.toFixed(1) : "—" },
    { titulo: "Total de Faltas", valor: totalFaltas },
    { titulo: "Bom Desempenho", valor: comBomDesempenho },
    { titulo: "Precisam de Atenção", valor: comAtencao },
    { titulo: "Frequência", valor: frequenciaDemonstrativa + " — adequada" }
  ];

  cards.forEach((c) => {
    const div = document.createElement("div");
    div.classList.add("card");

    const h3 = document.createElement("h3");
    h3.textContent = c.titulo;

    const p = document.createElement("p");
    p.classList.add("valor");
    p.textContent = c.valor;

    div.appendChild(h3);
    div.appendChild(p);
    container.appendChild(div);
  });
}

function atualizarTela() {
  preencherCards();
  preencherTabela();
}

/* ---------------------------------------------------------
   🔐 COMUNICAÇÃO COM A API DO PROFESSOR
   --------------------------------------------------------- */
async function abrirBoletim() {
  const pinInput = document.getElementById("input-pin");
  const msgLogin = document.getElementById("msg-login");
  const pinDigitado = pinInput.value.trim();

  if (!pinDigitado) {
    msgLogin.textContent = "Por favor, digite seu PIN.";
    return;
  }

  msgLogin.style.color = "var(--cinza)";
  msgLogin.textContent = "Conectando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.style.color = "var(--erro)";
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.style.color = "var(--erro)";
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      return;
    }

    if (!resposta.ok) {
      msgLogin.style.color = "var(--erro)";
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      return;
    }

    const json = await resposta.json();

    // PIN válido: armazena em memória de sessão e limpa o input
    pinSessao = pinDigitado;
    pinInput.value = "";
    msgLogin.textContent = "";

    // Verifica se vieram dados da API
    if (json && json.dados && Array.isArray(json.dados.disciplinas) && json.dados.disciplinas.length > 0) {
      listaDisciplinas = json.dados.disciplinas;
    } else {
      // Usa dados locais
      listaDisciplinas = JSON.parse(JSON.stringify(disciplinasPadrao));
    }

    // Exibe tela principal
    document.getElementById("area-login").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";
    atualizarTela();

  } catch (erro) {
    msgLogin.style.color = "var(--erro)";
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

/* ---------------------------------------------------------
   ✏️ VALIDAÇÃO E EDIÇÃO DE DADOS
   --------------------------------------------------------- */
function validarNotaDigitada(val) {
  if (val === null || val === undefined || val.trim() === "") {
    return { valido: true, valor: null };
  }
  const limpo = val.replace(",", ".");
  if (isNaN(limpo)) return { valido: false };

  const num = Number(limpo);
  if (num >= 0 && num <= 10) {
    return { valido: true, valor: num };
  }
  return { valido: false };
}

function validarFaltaDigitada(val) {
  if (val === null || val === undefined || val.trim() === "") {
    return { valido: false };
  }
  const num = Number(val);
  if (Number.isInteger(num) && num >= 0) {
    return { valido: true, valor: num };
  }
  return { valido: false };
}

async function salvarAlteracoes() {
  const msgStatus = document.getElementById("msg-status");
  msgStatus.className = "mensagem-status";
  msgStatus.textContent = "";

  // Limpa validações anteriores
  const inputs = document.querySelectorAll(".input-nota, .input-falta");
  inputs.forEach((i) => i.classList.remove("input-invalido"));

  let possuiErro = false;
  const copiaDisciplinas = JSON.parse(JSON.stringify(listaDisciplinas));

  // Valida notas
  document.querySelectorAll(".input-nota").forEach((input) => {
    const idx = input.dataset.idx;
    const campo = input.dataset.campo;
    const res = validarNotaDigitada(input.value);

    if (!res.valido) {
      input.classList.add("input-invalido");
      possuiErro = true;
    } else {
      copiaDisciplinas[idx][campo] = res.valor;
    }
  });

  // Valida faltas
  document.querySelectorAll(".input-falta").forEach((input) => {
    const idx = input.dataset.idx;
    const faltaIdx = Number(input.dataset.faltaIdx);
    const res = validarFaltaDigitada(input.value);

    if (!res.valido) {
      input.classList.add("input-invalido");
      possuiErro = true;
    } else