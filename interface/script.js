
class Produto {
    constructor(nome, preco, quantidade) {
        this.id = Date.now() + Math.random();
        this.nome = nome;
        this.preco = Number(preco);
        this.quantidade = Number(quantidade);
    }
}
// Banco de dados local do navegador
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

// Elementos da interface
const form = document.getElementById("produtoForm");
const nomeInput = document.getElementById("nome");
const precoInput = document.getElementById("preco");
const quantidadeInput = document.getElementById("quantidade");
const produtoIdInput = document.getElementById("produtoId");

const tabela = document.getElementById("tabelaProdutos");
const pesquisa = document.getElementById("pesquisa");

const totalProdutos = document.getElementById("totalProdutos");
const totalItens = document.getElementById("totalItens");
const valorEstoque = document.getElementById("valorEstoque");

const tituloFormulario = document.getElementById("tituloFormulario");
const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");
const mensagemVazia = document.getElementById("mensagemVazia");

// Salvar produtos no navegador
function salvarDados() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
}

// Formatação de moeda
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Atualizar indicadores
function atualizarIndicadores() {
    const quantidadeProdutos = produtos.length;

    const quantidadeTotal = produtos.reduce(
        (total, produto) => total + produto.quantidade,
        0
    );

    const valorTotal = produtos.reduce(
        (total, produto) =>
            total + (produto.preco * produto.quantidade),
        0
    );

    totalProdutos.textContent = quantidadeProdutos;
    totalItens.textContent = quantidadeTotal;
    valorEstoque.textContent = formatarMoeda(valorTotal);
}

// Verificar situação do estoque
function verificarStatus(quantidade) {
    if (quantidade === 0) {
        return {
            texto: "Sem estoque",
            classe: "status-zero"
        };
    }

    if (quantidade <= 5) {
        return {
            texto: "Estoque baixo",
            classe: "status-baixo"
        };
    }

    return {
        texto: "Normal",
        classe: "status-normal"
    };
}

// Evitar injeção de HTML nos nomes
function escaparHTML(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

// Mostrar produtos na tabela
function renderizarProdutos(filtro = "") {
    tabela.innerHTML = "";

    const produtosFiltrados = produtos.filter(produto =>
        produto.nome.toLowerCase().includes(filtro.toLowerCase())
    );

    mensagemVazia.style.display =
        produtosFiltrados.length === 0 ? "block" : "none";

    produtosFiltrados.forEach(produto => {

        const status = verificarStatus(produto.quantidade);

        const valorTotal = produto.preco * produto.quantidade;

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td>${escaparHTML(produto.nome)}</td>

            <td>${formatarMoeda(produto.preco)}</td>

            <td>${produto.quantidade}</td>

            <td>${formatarMoeda(valorTotal)}</td>

            <td>
                <span class="status ${status.classe}">
                    ${status.texto}
                </span>
            </td>

            <td>
                <button
                    class="acao editar"
                    onclick="editarProduto('${produto.id}')"
                >
                    Editar
                </button>

                <button
                    class="acao excluir"
                    onclick="excluirProduto('${produto.id}')"
                >
                    Excluir
                </button>
            </td>
        `;

        tabela.appendChild(linha);
    });

    atualizarIndicadores();
}

// Cadastrar ou atualizar produto
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const nome = nomeInput.value.trim();
    const preco = Number(precoInput.value);
    const quantidade = Number(quantidadeInput.value);
    const id = produtoIdInput.value;

    if (!nome || preco < 0 || quantidade < 0) {
        alert("Preencha os campos corretamente.");
        return;
    }

    if (id) {

        const produto = produtos.find(p => String(p.id) === id);

        if (produto) {
            produto.nome = nome;
            produto.preco = preco;
            produto.quantidade = quantidade;
        }

        alert("Produto atualizado com sucesso!");

    } else {

        const novoProduto = new Produto(nome, preco, quantidade);

        produtos.push(novoProduto);

        alert("Produto cadastrado com sucesso!");
    }

    salvarDados();
    renderizarProdutos();
    limparFormulario();
});

// Editar produto
function editarProduto(id) {
    const produto = produtos.find(p => String(p.id) === id);

    if (!produto) return;

    nomeInput.value = produto.nome;
    precoInput.value = produto.preco;
    quantidadeInput.value = produto.quantidade;

    produtoIdInput.value = produto.id;

    tituloFormulario.textContent = "Editar Produto";
    btnSalvar.textContent = "Salvar Alterações";
    btnCancelar.hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Excluir produto
function excluirProduto(id) {
    const produto = produtos.find(p => String(p.id) === id);

    if (!produto) return;

    const confirmar = confirm(
        `Deseja realmente excluir o produto "${produto.nome}"?`
    );

    if (confirmar) {
        produtos = produtos.filter(p => String(p.id) !== id);

        salvarDados();
        renderizarProdutos();

        alert("Produto excluído com sucesso!");
    }
}

// Limpar formulário
function limparFormulario() {
    form.reset();

    produtoIdInput.value = "";

    tituloFormulario.textContent = "Cadastrar Produto";
    btnSalvar.textContent = "Cadastrar Produto";
    btnCancelar.hidden = true;
}

// Botão cancelar edição
btnCancelar.addEventListener("click", limparFormulario);

// Pesquisa de produtos
pesquisa.addEventListener("input", function() {
    renderizarProdutos(pesquisa.value);
});

// Inicialização
renderizarProdutos();
