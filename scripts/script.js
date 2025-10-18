

function gerarCupom() {
  const msg = document.getElementById('mensagem').value.trim();
  if (!msg) return alert('Cole a mensagem do pedido primeiro!');

  const linhas = msg.split('\n').map(l => l.trim()).filter(l => l);

  let html = `
  <div class="center bold">SPACE BURGUER</div>
  <div class="center">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString().slice(0,5)}</div>
  <div class="linha"></div>
  `;

  let inItem = false; // indica se estamos dentro de um item (para negrito)

  linhas.forEach(linha => {
    // Cliente e endereço
    if (linha.includes('Cliente:') || linha.includes('Endereço:') || linha.includes('Bairro:') || linha.includes('Telefone:')) {
      html += `<div>${linha}</div>`;
      inItem = false;
    }
    // Tipo de serviço e pagamento
    else if (linha.includes('Tipo de Serviço:') || linha.includes('Forma de Pagamento:')) {
      html += `<div>${linha}</div>`;
      inItem = false;
    }
    // Produto principal (começa com quantidade)
    else if (linha.match(/^\d+x/)) {
      const partes = linha.split('-');
      const item = partes[0].trim();
      const valor = partes[1] ? partes[1].trim() : '';
      html += `<div class="item-row"><span class="bold">${item}</span><span class="bold">${valor}</span></div>`;
      inItem = true;
    }
    // Observações ou adicionais do item (herdam negrito)
    else if (inItem && linha) {
      html += `<div class="bold">  → ${linha}</div>`; // adiciona seta para indicar adicional
    }
    // Total
    else if (linha.toUpperCase().includes('TOTAL')) {
      html += `<div class="linha"></div><div class="center bold">${linha}</div>`;
      inItem = false;
    }
    // Outros textos
    else {
      html += `<div>${linha}</div>`;
      inItem = false;
    }
  });

  html += `
  <div class="linha"></div>
  <div class="center">Obrigado pela preferência! ❤️</div>
  <div class="center">www.spaceburguer.com</div>
  `;

  const printArea = document.getElementById('printArea');
  printArea.innerHTML = html;
  printArea.style.display = 'block';
  window.print();
}

