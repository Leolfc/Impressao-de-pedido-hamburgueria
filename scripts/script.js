function gerarCupom() {
  const msg = document.getElementById("mensagem").value.trim();
  if (!msg) return alert("Cole a mensagem do pedido primeiro!");

  // Limpa linhas vazias e espaços extras
  const linhas = msg.split("\n").map((l) => l.trim()).filter((l) => l);
  let html = "";

  // --- Cabeçalho ---
  html += '<div class="center receipt-header">SPACE BURGUER</div>';
  html +=
    '<div class="center receipt-subheader">' +
    new Date().toLocaleDateString() +
    " " +
    new Date().toLocaleTimeString().slice(0, 5) +
    "</div>";
  html += '<div class="linha-grossa"></div>';

  // Loop principal
  for (let i = 0; i < linhas.length; i++) {
    let linha = linhas[i];
    
    // Remove emojis comuns de início de linha para facilitar a análise
    const linhaSemEmoji = linha.replace(/^[\u{1F300}-\u{1F9FF}]/u, "").trim();

    // 1. SEÇÕES (Data, Cliente, Itens do Pedido...)
    // Geralmente começam com * (ex: *👤 Cliente:*)
    if (linha.startsWith("*") && !linha.match(/^\*\d/) && !linha.includes("Adicional de")) {
      const textoLimpo = linha.replace(/\*/g, "").trim();
      
      // Se for ITENS DO PEDIDO, adiciona cabeçalho da tabela
      if (textoLimpo.toUpperCase().includes("ITENS DO PEDIDO")) {
        html += '<div class="linha"></div>';
        html += '<div class="center bold" style="margin: 4px 0;">ITENS DO PEDIDO</div>';
        html += '<div class="cols"><span class="col-left">QTD ITEM</span><span class="col-right">VALOR</span></div>';
        continue;
      }
      
      // Outros títulos (ignora se for apenas linha decorativa)
      if (textoLimpo.length > 2) {
         // Se for Informação do Cliente
         if(linha.includes(":")) {
            const partes = textoLimpo.split(":");
            html += `<div class="cliente-info"><span class="bold">${partes[0]}:</span> ${partes.slice(1).join(":")}</div>`;
         } else {
            html += '<div class="linha"></div>';
            html += `<div class="center bold" style="margin: 4px 0;">${textoLimpo}</div>`;
         }
      }
      continue;
    }

    // 2. TOTAIS (Total, Taxa de Entrega, Subtotal)
    if (
      linha.toUpperCase().includes("TOTAL") ||
      linha.includes("Taxa de Entrega") ||
      linha.includes("Troco")
    ) {
      const linhaLimpa = linha.replace(/\*/g, "").replace(/[-_]{2,}/, "").trim();
      
      if (linhaLimpa.toUpperCase().startsWith("TOTAL")) {
        // Pega o valor (geralmente depois de R$)
        const valorMatch = linhaLimpa.match(/R\$\s?[\d.,]+/) || [""];
        html += `<div class="total-final"><div class="total-row"><span>TOTAL</span><span>${valorMatch[0]}</span></div></div>`;
      } else if (linhaLimpa.includes(":")) {
         const partes = linhaLimpa.split(":");
         html += `<div class="total-row bold"><span>${partes[0]}:</span><span>${partes[1]}</span></div>`;
      }
      continue;
    }

    // 3. DETECÇÃO DE ITENS
    // Regex ajustada: Aceita "1.", "*1.", "1x" ou linhas com "Adicional de..."
    // Ex: "1. Space Salad" ou "*Adicional de Maionese Verde:*"
    const ehItemNumerado = linhaSemEmoji.match(/^(\*)?\d+[\.x]/); 
    const ehAdicionalSolto = linhaSemEmoji.includes("Adicional de");

    if (ehItemNumerado || ehAdicionalSolto) {
        let nomeItem = linhaSemEmoji.replace(/\*/g, "").trim(); // Remove asteriscos
        let valorItem = "";

        // Tenta separar preço se houver (ex: Adicional ... (R$ 1.50))
        const matchPreco = nomeItem.match(/\(R\$\s?[\d.,]+\)/);
        if (matchPreco) {
            valorItem = matchPreco[0].replace(/[()]/g, ""); // Remove parenteses
            nomeItem = nomeItem.replace(matchPreco[0], "").trim();
        }

        // Se for item numerado (1. Space Salad), remove o número do início para ficar limpo
        if (ehItemNumerado) {
            nomeItem = nomeItem.replace(/^\d+[\.x]\s?/, "").trim(); // Remove "1. " ou "1x "
            // Adiciona a quantidade (assumindo 1 se não especificado, ou pegando do início)
            const qtdMatch = linhaSemEmoji.match(/^(\d+)/);
            const qtd = qtdMatch ? qtdMatch[1] + "x" : "1x";
            nomeItem = `${qtd} ${nomeItem}`;
        }

        // --- Monta o HTML do Item Principal ---
        html += '<div class="item-block">';
        html += '<div class="item-row">';
        html += `<span class="item-name">${nomeItem}</span>`;
        if (valorItem) {
            html += `<span class="item-value">${valorItem}</span>`;
        }
        html += "</div>";

        // --- Loop para pegar DETALHES (Obs e Adicionais) nas próximas linhas ---
        let j = i + 1;
        while (j < linhas.length) {
            const nextOriginal = linhas[j];
            const next = nextOriginal.replace(/^[\u{1F300}-\u{1F9FF}]/u, "").trim(); // Remove emoji

            // CRITÉRIOS DE PARADA (Se encontrar isso, é um novo item ou nova seção, para o loop)
            const stopConditions = 
                next.match(/^(\*)?\d+[\.x]/) || // Começa com número (novo item)
                (next.includes("Adicional de") && next.includes("R$")) || // Novo adicional solto
                next.startsWith("*") || // Nova seção
                next.toUpperCase().includes("TOTAL") ||
                next.includes("----------------");

            if (stopConditions && !next.includes("Adicionais:")) { // "Adicionais:" é cabeçalho, não para
                break;
            }

            // --- Processa Detalhes ---
            
            // 1. Observação (Obs:)
            if (next.includes("Obs:")) {
                const obsTexto = next.split("Obs:")[1].replace(/[_*]/g, "").trim();
                html += `<div class="small" style="font-weight:bold;">📝 OBS: ${obsTexto}</div>`;
            }
            // 2. Título "Adicionais:" (apenas visual)
            else if (next.includes("Adicionais:")) {
                 // html += `<div class="small bold" style="margin-top:2px;">Adicionais:</div>`; 
                 // (Opcional: descomente se quiser que apareça a palavra "Adicionais:")
            }
            // 3. Itens Adicionais (começam com - ou +)
            else if (next.startsWith("-") || next.startsWith("+")) {
                const addTexto = next.replace(/^[-+]\s?/, "").trim();
                html += `<div class="small" style="padding-left: 10px;">+ ${addTexto}</div>`;
            }

            j++; // Avança para a próxima linha
        }
        
        i = j - 1; // Atualiza o índice principal para não repetir linhas
        html += "</div>"; // Fecha item-block
    }
  }

  // Rodapé
  html += '<div class="linha"></div>';
  html += '<div class="footer bold">Obrigado pela preferência! ❤️</div>';
  html += '<div class="footer">www.spaceburguer.com</div>';

  const printArea = document.getElementById("printArea");
  printArea.innerHTML = html;
  window.print();
}