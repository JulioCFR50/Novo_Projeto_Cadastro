// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDy-tQkx1vxriO56R4uDG0CP_-qnAf27Xg",
  authDomain: "ocorrencia-nf.firebaseapp.com",
  projectId: "ocorrencia-nf",
  storageBucket: "ocorrencia-nf.firebasestorage.app",
  messagingSenderId: "1042870457912",
  appId: "1:1042870457912:web:067f9d68f01b67356ef8cd",
  measurementId: "G-7Q813QZKSM"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Campos de pesquisa separados
const pesquisaNF = document.getElementById('pesquisaNF');
const pesquisaCliente = document.getElementById('pesquisaCliente');
const pesquisaUF = document.getElementById('pesquisaUF');

// Filtro em tempo real para todos os campos
function aplicarFiltros() {
  const termoNF = pesquisaNF.value.trim().toLowerCase();
  const termoCliente = pesquisaCliente.value.trim().toLowerCase();
  const termoUF = pesquisaUF.value.trim().toLowerCase();

  const linhas = document.querySelectorAll('#tabelaNF tbody tr');

  linhas.forEach(linha => {
    const numeroNF = linha.children[1].textContent.toLowerCase();    // coluna NF
    const nomeCliente = linha.children[4].textContent.toLowerCase(); // coluna Cliente
    const uf = linha.children[5].textContent.toLowerCase();          // coluna UF

    const condicao =
      (termoNF === "" || numeroNF.includes(termoNF)) &&
      (termoCliente === "" || nomeCliente.includes(termoCliente)) &&
      (termoUF === "" || uf.includes(termoUF));

    linha.style.display = condicao ? "" : "none";
  });

  // Botão limpar filtros
const btnLimpar = document.getElementById('limparFiltros');

btnLimpar.addEventListener('click', () => {
  // Limpa todos os campos
  pesquisaNF.value = "";
  pesquisaCliente.value = "";
  pesquisaUF.value = "";

  // Reaplica filtro (mostra todas as linhas)
  aplicarFiltros();
});

}

// Adicionar evento a cada input de pesquisa
[pesquisaNF, pesquisaCliente, pesquisaUF].forEach(input => {
  input.addEventListener('input', aplicarFiltros);
});

// Formatar data DD/MM/YYYY
function formatDataBR(dataStr) {
  if (!dataStr) return "";
  const partes = dataStr.split('-');
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

// Converter data DD/MM/YYYY -> YYYY-MM-DD (para input)
function formatDataInput(dataBR) {
  if (!dataBR.includes('/')) return dataBR;
  const partes = dataBR.split('/');
  return `${partes[2]}-${partes[1]}-${partes[0]}`;
}

// Renderizar tabela com dados do Firestore
function renderTabela() {
  db.collection('notasFiscais').orderBy('data', 'desc').onSnapshot(snapshot => {
    const tbody = document.querySelector('#tabelaNF tbody');
    tbody.innerHTML = '';

    snapshot.forEach(doc => {
      const d = doc.data();
      const id = doc.id;
      const valorFormatado = d.valor
        ? d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
        : "0,00";

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.transportadora || ''}</td>
        <td>${d.numero || ''}</td>
        <td>${valorFormatado}</td>
        <td>${formatDataBR(d.data)}</td>
        <td>${d.cliente || ''}</td>
        <td>${d.uf || ''}</td>
        <td>${d.motivo || ''}</td>
        <td>${d.acao || ''}</td>
        <td>${d.nfEntrada || ''}</td>
        <td>${d.arm || ''}</td>
        <td>${d.status || ''}</td>
        <td>
          <button class="edit-btn" data-id="${id}">Editar</button>
          <button class="cancel-btn" data-id="${id}">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    addEventListeners();
    aplicarFiltros(); // reaplica filtros quando tabela atualiza
  });
}

// Adicionar eventos aos botões Editar e Excluir
function addEventListeners() {
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editarNF(btn.dataset.id));
  });

  document.querySelectorAll('.cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => excluirNF(btn.dataset.id));
  });
}

// Editar NF
function editarNF(id) {
  const tr = document.querySelector(`button[data-id="${id}"]`).closest('tr');
  const tds = tr.querySelectorAll('td');
  const valores = Array.from(tds).map(td => td.textContent);

  tr.innerHTML = `
    <td><input value="${valores[0]}"></td>
    <td><input value="${valores[1]}"></td>
    <td><input value="${valores[2].replace('.', '').replace(',', '.')}"></td>
    <td><input type="date" value="${formatDataInput(valores[3])}"></td>
    <td><input value="${valores[4]}"></td>
    <td><input value="${valores[5]}"></td>
    <td><input value="${valores[6]}"></td>
    <td><input value="${valores[7]}"></td>
    <td><input value="${valores[8]}"></td>
    <td><input value="${valores[9]}"></td>
    <td>
      <select>
        <option ${valores[10]==="pendente"?"selected":""}>pendente</option>
        <option ${valores[10]==="em_andamento"?"selected":""}>em_andamento</option>
        <option ${valores[10]==="finalizado"?"selected":""}>finalizado</option>
      </select>
    </td>
    <td>
      <button class="save-btn">Salvar</button>
      <button class="cancel-btn">Cancelar</button>
    </td>
  `;

  tr.querySelector('.save-btn').addEventListener('click', () => {
    const inputs = tr.querySelectorAll('input, select');
    const nfData = {
      transportadora: inputs[0].value,
      numero: inputs[1].value,
      valor: parseFloat(inputs[2].value),
      data: inputs[3].value,
      cliente: inputs[4].value,
      uf: inputs[5].value,
      motivo: inputs[6].value,
      acao: inputs[7].value,
      nfEntrada: inputs[8].value,
      arm: inputs[9].value,
      status: inputs[10].value
    };

    db.collection('notasFiscais').doc(id).update(nfData);
  });

  tr.querySelector('.cancel-btn').addEventListener('click', renderTabela);
}

// Excluir NF
function excluirNF(id) {
  if (confirm("Deseja excluir esta NF?")) {
    db.collection('notasFiscais').doc(id).delete();
  }
}

// Inicializar tabela
renderTabela();
