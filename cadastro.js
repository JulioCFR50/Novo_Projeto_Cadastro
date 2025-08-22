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

const nfForm = document.getElementById('formCadastro');

// Converte valor brasileiro para número
function parseValor(valorStr) {
  return parseFloat(valorStr.replace(/\./g, '').replace(',', '.'));
}

// Campos que devem ser maiúsculos automaticamente
const transportadoraInput = document.getElementById('transportadora');
const clienteInput = document.getElementById('cliente');
const ufInput = document.getElementById('uf');
const motivoInput = document.getElementById('motivo');
const acaoInput = document.getElementById('acao');

[transportadoraInput, clienteInput, ufInput, motivoInput, acaoInput].forEach(input => {
  input.addEventListener('input', () => {
    input.value = input.value.toUpperCase();
  });
});

// Campo de valor com formatação automática
const valorInput = document.getElementById('valorNF');
valorInput.addEventListener('input', () => {
    let valor = valorInput.value;
    valor = valor.replace(/\D/g, '');
    let numero = (parseInt(valor || "0", 10) / 100).toFixed(2);
    numero = numero.replace(".", ",");
    numero = numero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    valorInput.value = numero;
});

// Salvar NF no Firestore com verificação de duplicidade
nfForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const numeroNF = document.getElementById('numeroNF').value.trim();

  if (!numeroNF) {
    alert("Preencha o número da NF.");
    return;
  }

  // Verifica se a NF já existe
  const querySnapshot = await db.collection('notasFiscais')
    .where('numero', '==', numeroNF)
    .get();

  if (!querySnapshot.empty) {
    alert("Esta NF já foi cadastrada!");
    return;
  }

  const nfData = {
    transportadora: transportadoraInput.value.trim(),
    numero: numeroNF,
    valor: parseValor(valorInput.value.trim()),
    data: document.getElementById('dataNF').value,
    cliente: clienteInput.value.trim(),
    uf: ufInput.value.trim().toUpperCase(),
    motivo: motivoInput.value.trim(),
    acao: acaoInput.value.trim(),
    nfEntrada: document.getElementById('nfEntrada').value.trim(),
    arm: document.getElementById('arm').value.trim(),
    status: document.getElementById('status').value
  };

  if (!nfData.valor || !nfData.data || !nfData.transportadora) {
    alert("Preencha todos os campos obrigatórios.");
    return;
  }

  db.collection('notasFiscais').add(nfData)
    .then(() => {
      alert("Nota Fiscal cadastrada com sucesso!");
      nfForm.reset();
    })
    .catch(err => console.error("Erro ao salvar NF:", err));
});
