const fs = require("fs");
const { DOMParser, XMLSerializer } = require("@xmldom/xmldom");

// 1) Ler XML de entrada (vários <Classificado> soltos)
const xmlData = fs.readFileSync("res.xml", "utf-8");

// 2) Envolver em <root> para formar um XML válido com elemento raiz
const xmlDoc = new DOMParser().parseFromString(`<root>${xmlData}</root>`, "text/xml");
const root = xmlDoc.documentElement;

// 3) Pegar todos os <Classificado>
//    IMPORTANTE: não use spread [...nodes]; use for clássico
const nodes = root.getElementsByTagName("Classificado");

// 4) Iterar de trás pra frente (evita problemas ao substituir nós durante o loop)
for (let i = nodes.length - 1; i >= 0; i--) {
  const oldClassificado = nodes[i];

  // Extrair valores originais
  const numeroNode = oldClassificado.getElementsByTagName("Numero")[0];
  const nomeNode = oldClassificado.getElementsByTagName("nomeClassificado")[0];
  const ordemNode = oldClassificado.getElementsByTagName("ordemClassificacao")[0];

  const numero = numeroNode ? numeroNode.textContent : "";
  const nome   = nomeNode ? nomeNode.textContent : "";
  const ordem  = ordemNode ? ordemNode.textContent : "";

  // Construir nova estrutura
  const newClassificado = xmlDoc.createElement("lcl:Classificado");

  const newCpf = xmlDoc.createElement("lcl:cpfClassificado");
  newCpf.setAttribute("Tipo", "02");

  const genNumero = xmlDoc.createElement("gen:Numero");
  genNumero.textContent = numero;
  newCpf.appendChild(genNumero);

  const newNome = xmlDoc.createElement("lcl:nomeClassificado");
  newNome.textContent = nome;

  const newOrdem = xmlDoc.createElement("lcl:ordemClassificacao");
  newOrdem.textContent = ordem;

  newClassificado.appendChild(newCpf);
  newClassificado.appendChild(newNome);
  newClassificado.appendChild(newOrdem);

  // Substituir o nó antigo pelo novo
  oldClassificado.parentNode.replaceChild(newClassificado, oldClassificado);
}

// 5) Serializar removendo o wrapper <root> ... </root>
const serializer = new XMLSerializer();
let out = serializer.serializeToString(root);
const open = "<root>";
const close = "</root>";
if (out.startsWith(open) && out.endsWith(close)) {
  out = out.substring(open.length, out.length - close.length);
}

// 6) Salvar
fs.writeFileSync("saida.xml", out, "utf-8");
console.log("✅ Transformação concluída! Arquivo salvo como saida.xml");
