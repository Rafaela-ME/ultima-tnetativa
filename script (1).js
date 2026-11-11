/* =========================================================
   Aquecimento Solar da Piscina Escolar — script
   ========================================================= */

/* ---------------------------------------------------------
   1) IMAGENS
   Cada <img data-imagem="imagem1"> procura o arquivo na pasta
   "imagens/" tentando várias extensões: imagem1.jpg, .jpeg,
   .png, .webp (minúsculas ou maiúsculas). Se nenhuma existir,
   aparece um quadro tracejado avisando qual arquivo falta.
   --------------------------------------------------------- */
const PASTA_IMAGENS = "imagens/";
const EXTENSOES = ["jpg", "jpeg", "png", "webp", "JPG", "JPEG", "PNG", "WEBP"];

document.querySelectorAll("img[data-imagem]").forEach((img) => {
  const nome = img.dataset.imagem;
  const figura = img.closest("figure");

  // Cria o quadro de "vaga" para a imagem
  const vaga = document.createElement("div");
  vaga.className = "vaga-imagem";
  const numero = nome.replace(/\D/g, "");
  vaga.innerHTML =
    '<span class="vaga-icone" aria-hidden="true">📷</span>' +
    '<span class="vaga-nome">Imagem ' + numero + "</span>" +
    "<span>" + (img.alt || "") + "</span>" +
    "<span>Coloque o arquivo <code>" + PASTA_IMAGENS + nome + ".jpg</code> (ou .png)</span>";
  figura.insertBefore(vaga, img);

  // Procura primeiro na pasta "imagens/" e, se não achar, ao lado do index.html
  const caminhos = [];
  [PASTA_IMAGENS, ""].forEach((pasta) =>
    EXTENSOES.forEach((ext) => caminhos.push(pasta + nome + "." + ext))
  );
  let tentativa = 0;
  const tentarProxima = () => {
    if (tentativa >= caminhos.length) return; // nenhuma encontrada: fica a vaga
    img.src = caminhos[tentativa++];
  };
  img.addEventListener("error", tentarProxima);
  img.addEventListener("load", () => figura.classList.add("carregada"));
  tentarProxima();
});

/* ---------------------------------------------------------
   2) QUEM APRESENTA CADA PARTE
   Para trocar a pessoa de uma seção, mude no index.html o
   atributo data-apresentador="..." daquela <section>.
   --------------------------------------------------------- */
const CORES = {
  Amanda: "var(--amanda)",
  Beatriz: "var(--beatriz)",
  Daniel: "var(--daniel)",
  Rafaela: "var(--rafaela)",
  Todos: "var(--todos)",
};

const slides = Array.from(document.querySelectorAll(".slide"));

slides.forEach((secao) => {
  const quem = secao.dataset.apresentador;
  if (!quem) return;
  const cor = CORES[quem] || "var(--todos)";
  secao.style.setProperty("--cor", cor);

  const selo = document.createElement("span");
  selo.className = "selo-apresentador";
  selo.textContent = quem === "Todos" ? "Apresentam: todos" : "Apresenta: " + quem;

  let alvo = secao.querySelector(".conteudo") || secao;
  // Em seções de duas colunas, o selo vai dentro da coluna de texto
  if (alvo.classList.contains("duas-colunas")) alvo = alvo.firstElementChild;
  alvo.insertBefore(selo, alvo.firstChild);
});

/* ---------------------------------------------------------
   3) BARRA DE PROGRESSO DA LEITURA
   --------------------------------------------------------- */
const barraLeitura = document.getElementById("progressoLeitura");
window.addEventListener("scroll", () => {
  const total = document.documentElement.scrollHeight - window.innerHeight;
  barraLeitura.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + "%";
});

/* ---------------------------------------------------------
   4) BOTÃO "COPIAR CÓDIGO"
   --------------------------------------------------------- */
document.querySelectorAll(".botao-copiar").forEach((botao) => {
  botao.addEventListener("click", async () => {
    const texto = document.getElementById(botao.dataset.copiar).innerText;
    try {
      await navigator.clipboard.writeText(texto);
      botao.textContent = "Copiado ✓";
    } catch (e) {
      botao.textContent = "Selecione e copie";
    }
    setTimeout(() => (botao.textContent = "Copiar código"), 2000);
  });
});

/* ---------------------------------------------------------
   5) MINI SIMULADOR DA CALDEIRA (mesma lógica do Arduino)
   --------------------------------------------------------- */
const ALVO = 28.0;
const HISTERESE = 1.0;
let caldeiraLigada = true;

const sliderTemp = document.getElementById("tempSim");
const textoTemp = document.getElementById("tempValor");
const led = document.getElementById("ledSim");
const estado = document.getElementById("estadoSim");

function atualizarSimulador() {
  const temp = parseFloat(sliderTemp.value);
  if (temp < ALVO - HISTERESE) caldeiraLigada = true;       // água fria: liga
  else if (temp > ALVO + HISTERESE) caldeiraLigada = false; // água no alvo: desliga

  textoTemp.textContent = temp.toFixed(1).replace(".", ",") + " °C";
  led.classList.toggle("aceso", caldeiraLigada);
  estado.textContent = caldeiraLigada ? "Caldeira LIGADA" : "Caldeira DESLIGADA";
}
if (sliderTemp) {
  sliderTemp.addEventListener("input", atualizarSimulador);
  atualizarSimulador();
}

/* ---------------------------------------------------------
   6) MODO APRESENTAÇÃO
   Teclas: → ou Espaço = próximo · ← = anterior
           F = tela cheia · Esc = sair
   --------------------------------------------------------- */
const botaoApresentar = document.getElementById("botaoApresentar");
const controles = document.getElementById("controles");
const quemEl = document.getElementById("controlesQuem");
const contadorEl = document.getElementById("controlesContador");
const barraEl = document.getElementById("controlesBarra");
let atual = 0;
let apresentando = false;

function mostrarSlide(i) {
  atual = Math.max(0, Math.min(slides.length - 1, i));
  slides.forEach((s, n) => s.classList.toggle("ativo", n === atual));
  const s = slides[atual];
  s.scrollTop = 0;

  const quem = s.dataset.apresentador || "Todos";
  quemEl.textContent = quem === "Todos" ? "Todos" : quem;
  controles.style.setProperty("--cor", CORES[quem] || "var(--todos)");
  contadorEl.textContent = atual + 1 + " / " + slides.length;
  barraEl.style.width = ((atual + 1) / slides.length) * 100 + "%";
  history.replaceState(null, "", "#" + s.id);
}

function iniciarApresentacao() {
  // começa do slide que está na tela
  const hash = location.hash.replace("#", "");
  const indice = slides.findIndex((s) => s.id === hash);
  apresentando = true;
  document.body.classList.add("modo-apresentacao");
  controles.hidden = false;
  mostrarSlide(indice >= 0 ? indice : 0);
}

function sairApresentacao() {
  apresentando = false;
  document.body.classList.remove("modo-apresentacao");
  controles.hidden = true;
  slides.forEach((s) => s.classList.remove("ativo"));
  if (document.fullscreenElement) document.exitFullscreen();
  slides[atual].scrollIntoView();
}

function alternarTelaCheia() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen();
}

botaoApresentar.addEventListener("click", iniciarApresentacao);
document.getElementById("btnProximo").addEventListener("click", () => mostrarSlide(atual + 1));
document.getElementById("btnAnterior").addEventListener("click", () => mostrarSlide(atual - 1));
document.getElementById("btnSair").addEventListener("click", sairApresentacao);
document.getElementById("btnTelaCheia").addEventListener("click", alternarTelaCheia);

// Links do roteiro também funcionam dentro da apresentação
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    if (!apresentando) return;
    const i = slides.findIndex((s) => "#" + s.id === link.getAttribute("href"));
    if (i >= 0) { e.preventDefault(); mostrarSlide(i); }
  });
});

document.addEventListener("keydown", (e) => {
  if (!apresentando) return;
  if (e.target.matches("input, textarea")) return; // não atrapalhar o simulador
  if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); mostrarSlide(atual + 1); }
  else if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); mostrarSlide(atual - 1); }
  else if (e.key === "Home") mostrarSlide(0);
  else if (e.key === "End") mostrarSlide(slides.length - 1);
  else if (e.key.toLowerCase() === "f") alternarTelaCheia();
  else if (e.key === "Escape") sairApresentacao();
});
