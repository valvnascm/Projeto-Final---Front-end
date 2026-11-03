/* =========================================================
   script.js: usado em TODAS as páginas.
   Como nem toda página tem todos os elementos, cada bloco
   só faz algo se encontrar seus elementos (ou lista vazia).
   ========================================================= */


/* ---------- 1. TAMANHO DA FONTE (A+ e A-) ---------- */
// Tamanho em porcentagem. 100 = tamanho normal do navegador.
let tamanhoFonte = 100;

// Aplica o tamanho no <html>. Como o CSS usa "rem", tudo acompanha.
function aplicarFonte() {
    document.documentElement.style.fontSize = tamanhoFonte + "%";
    // localStorage guarda um valor no navegador, para lembrar nas outras páginas
    localStorage.setItem("fonte", tamanhoFonte);
}

// passo = quanto aumentar (+10) ou diminuir (-10)
function mudarFonte(passo) {
    tamanhoFonte = tamanhoFonte + passo;
    if (tamanhoFonte < 80) { tamanhoFonte = 80; }    // limite mínimo
    if (tamanhoFonte > 140) { tamanhoFonte = 140; }  // limite máximo
    aplicarFonte();
}

document.querySelector("#aumentar-fonte").addEventListener("click", function () {
    mudarFonte(10);
});
document.querySelector("#diminuir-fonte").addEventListener("click", function () {
    mudarFonte(-10);
});


/* ---------- 2. ALTO CONTRASTE ---------- */
const botaoContraste = document.querySelector("#alto-contraste");

// ligado = true ou false
function aplicarContraste(ligado) {
    // toggle(classe, true) adiciona a classe; toggle(classe, false) remove
    document.body.classList.toggle("alto-contraste", ligado);
    botaoContraste.setAttribute("aria-pressed", ligado); // avisa leitores de tela
    localStorage.setItem("contraste", ligado);
}

botaoContraste.addEventListener("click", function () {
    const estaLigado = document.body.classList.contains("alto-contraste");
    aplicarContraste(!estaLigado); // inverte: ligado vira desligado e vice-versa
});

// Ao abrir qualquer página, recupera as preferências salvas
if (localStorage.getItem("fonte")) {
    tamanhoFonte = Number(localStorage.getItem("fonte"));
    aplicarFonte();
}
if (localStorage.getItem("contraste") === "true") {
    aplicarContraste(true);
}


/* ---------- 3. ACORDEÃO DE PROPOSTAS (candidatos.html) ---------- */
document.querySelectorAll(".acordeao-botao").forEach(function (botao) {
    botao.addEventListener("click", function () {
        // aria-controls guarda o id do painel que este botão controla
        const painel = document.getElementById(botao.getAttribute("aria-controls"));
        const estavaAberto = botao.getAttribute("aria-expanded") === "true";

        painel.hidden = estavaAberto;                      // aberto -> esconde
        botao.setAttribute("aria-expanded", !estavaAberto); // atualiza o estado
    });
});


/* ---------- 4. FILTRO DE CANDIDATOS (candidatos.html) ---------- */
const filtroCargo = document.querySelector("#filtro-cargo");
const filtroPartido = document.querySelector("#filtro-partido");

function filtrarCandidatos() {
    const cargo = filtroCargo.value;
    const partido = filtroPartido.value;
    let visiveis = 0;

    document.querySelectorAll(".card-candidato").forEach(function (card) {
        // data-cargo e data-partido no HTML viram card.dataset.cargo e card.dataset.partido
        const cargoOk = (cargo === "todos") || (card.dataset.cargo === cargo);
        const partidoOk = (partido === "todos") || (card.dataset.partido === partido);

        card.hidden = !(cargoOk && partidoOk); // esconde se algum filtro não bate
        if (cargoOk && partidoOk) { visiveis = visiveis + 1; }
    });

    document.querySelector("#contagem").textContent = visiveis + " candidato(s) encontrado(s).";
}

if (filtroCargo) {
    filtroCargo.addEventListener("change", filtrarCandidatos);
    filtroPartido.addEventListener("change", filtrarCandidatos);
}


/* ---------- 5. ABAS "TEXTO OFICIAL" x "NA PRÁTICA" (projetos-de-lei.html) ---------- */
document.querySelectorAll(".aba-btn").forEach(function (aba) {
    aba.addEventListener("click", function () {
        const card = aba.closest(".card-pl"); // sobe até o card deste projeto

        // 1) desmarca todas as abas e esconde todos os painéis deste card
        card.querySelectorAll(".aba-btn").forEach(function (b) {
            b.setAttribute("aria-selected", "false");
        });
        card.querySelectorAll(".aba-painel").forEach(function (p) {
            p.hidden = true;
        });

        // 2) marca a aba clicada e mostra o painel dela (data-alvo = id do painel)
        aba.setAttribute("aria-selected", "true");
        document.getElementById(aba.dataset.alvo).hidden = false;
    });
});


/* ---------- 6. BOTÕES "APOIO" / "NÃO APOIO" (projetos-de-lei.html) ---------- */
document.querySelectorAll(".btn-voto-pl").forEach(function (botao) {
    botao.addEventListener("click", function () {
        const card = botao.closest(".card-pl");

        // Desmarca os dois botões e marca só o clicado
        card.querySelectorAll(".btn-voto-pl").forEach(function (b) {
            b.setAttribute("aria-pressed", "false");
        });
        botao.setAttribute("aria-pressed", "true");

        card.querySelector(".msg-voto").textContent =
            "Sua opinião registrada: " + botao.textContent + ". (Exemplo: não é enviada a nenhum lugar.)";
    });
});


/* ---------- 7. BUSCA NO GLOSSÁRIO (glossario.html) ---------- */
const campoBusca = document.querySelector("#busca-termo");

if (campoBusca) {
    // "input" dispara a cada letra digitada
    campoBusca.addEventListener("input", function () {
        const texto = campoBusca.value.toLowerCase();
        let achados = 0;

        document.querySelectorAll(".termo").forEach(function (item) {
            // Compara o texto digitado com todo o texto do termo
            const combina = item.textContent.toLowerCase().includes(texto);
            item.hidden = !combina;
            if (combina) { achados = achados + 1; }
        });

        document.querySelector("#resultado-busca").textContent =
            achados === 0 ? "Nenhum termo encontrado." : achados + " termo(s) encontrado(s).";
    });
}


/* ---------- 8. ENQUETES (pesquisas.html) ---------- */
// Desenha as barras a partir de um objeto de votos, ex.: { saude: 42, educacao: 35 }
function mostrarResultado(area, votos) {
    let total = 0;
    for (const opcao in votos) { total = total + votos[opcao]; }

    area.querySelectorAll(".linha-voto").forEach(function (linha) {
        const porcentagem = Math.round((votos[linha.dataset.opcao] / total) * 100);
        linha.querySelector(".barra-cheia").style.width = porcentagem + "%";
        linha.querySelector(".pct").textContent = porcentagem + "%";
    });
    area.querySelector(".total").textContent = "Total de votos: " + total;
}

// Mostra as barras iniciais (votos de exemplo guardados em data-votos, formato JSON)
document.querySelectorAll(".resultado").forEach(function (area) {
    mostrarResultado(area, JSON.parse(area.dataset.votos));
});

document.querySelectorAll(".form-enquete").forEach(function (form) {
    form.addEventListener("submit", function (evento) {
        evento.preventDefault(); // impede o formulário de recarregar a página

        const escolhida = form.querySelector("input[type=radio]:checked");
        const mensagem = form.querySelector(".msg-erro");

        if (!escolhida) {
            mensagem.textContent = "Escolha uma opção antes de votar.";
            return; // para aqui
        }
        mensagem.textContent = "";

        const area = document.getElementById(form.dataset.resultado);
        const votos = JSON.parse(area.dataset.votos);
        votos[escolhida.value] = votos[escolhida.value] + 1; // soma 1 voto
        area.dataset.votos = JSON.stringify(votos);

        mostrarResultado(area, votos);
        form.querySelector("button[type=submit]").disabled = true; // evita votar de novo
        area.focus(); // leva o foco para o resultado (bom para leitores de tela)
    });
});