function gerarCupom() {
  const msg = document.getElementById("mensagem").value.trim();
  if (!msg) return alert("Cole a mensagem do pedido primeiro!");

  const linhas = msg
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  let html = "";
  html += '<div class="center bold">SPACE BURGUER</div>';
  html +=
    '<div class="center">' +
    new Date().toLocaleDateString() +
    " " +
    new Date().toLocaleTimeString().slice(0, 5) +
    "</div>";
  html += '<div class="linha"></div>';

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i];

    // cabeçalho: linhas iniciadas por '*' (ex: * NOVO PEDIDO ...) → em negrito
    if (linha.startsWith("*")) {
      html += '<div class="bold">' + linha + "</div>";
      continue;
    }

    // cliente / endereço / contato (deixar em negrito também)
    if (
      linha.includes("Cliente:") ||
      linha.includes("Endereço:") ||
      linha.includes("Bairro:") ||
      linha.includes("Telefone:")
    ) {
      html += '<div class="bold">' + linha + "</div>";
      continue;
    }

    // tipo de serviço / pagamento (em negrito)
    if (
      linha.includes("Tipo de Serviço:") ||
      linha.includes("Forma de Pagamento:")
    ) {
      html += '<div class="bold">' + linha + "</div>";
      continue;
    }

    // 'Adicionais:' e bullets/listas numeradas → também em negrito
    if (
      linha.toLowerCase().startsWith("adicion") ||
      linha.startsWith("-") ||
      linha.match(/^\d+\./)
    ) {
      html += '<div class="bold">' + linha + "</div>";
      continue;
    }

    // produto principal (começa com quantidade)
    if (linha.match(/^\d+x/)) {
      const partes = linha.split("-");
      const item = partes[0].trim();
      const valor = partes[1] ? partes[1].trim() : "";

      // começa o container do item (todo o bloco ficará em negrito)
      html += '<div class="item-block bold">';

      // mostra nome e valor (linha principal do item)
      html +=
        '<div class="item-row"><span class="item-name">' +
        item +
        '</span><span class="item-value">' +
        valor +
        "</span></div>";

      // processa possíveis linhas seguintes (observações / adicionais)
      let j = i + 1;
      for (; j < linhas.length; j++) {
        const next = linhas[j];
        if (
          next &&
          !next.match(/^\d+x/) &&
          !next.toUpperCase().includes("TOTAL") &&
          !next.includes("Cliente:") &&
          !next.includes("Endereço:") &&
          !next.includes("Bairro:") &&
          !next.includes("Telefone:") &&
          !next.includes("Tipo de Serviço:") &&
          !next.includes("Forma de Pagamento:")
        ) {
          // observações do item (mantemos a classe small, mas o container pai adiciona negrito)
          html += '<div class="small">  → ' + next + "</div>";
        } else {
          break;
        }
      }

      // avança o índice principal para pular as observações já processadas
      i = j - 1;

      // fecha container do item
      html += "</div>";

      // separador (risco) entre itens
      html += '<div class="linha"></div>';
      continue;
    }

    // total / resumo
    if (linha.toUpperCase().includes("TOTAL")) {
      html +=
        '<div class="linha"></div><div class="center bold">' + linha + "</div>";
      continue;
    }

    // outros textos
    html += "<div>" + linha + "</div>";
  }

  html +=
    '\n  <div class="linha"></div>\n  <div class="center">Obrigado pela preferência! ❤️</div>\n  <div class="center">www.spaceburguer.com</div>\n  ';

  const printArea = document.getElementById("printArea");
  printArea.innerHTML = html;
  printArea.style.display = "block";
  window.print();
}
