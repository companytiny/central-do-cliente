const fs = require('fs');
const file = 'D:/Trabalho/2026/LPs Clientes Tiny/Deploy GitHub/central-do-cliente/criativos.html';

let content = fs.readFileSync(file, 'utf8');
content = content.replace(/btnDownItem\.target = '_blank';/g, "btnDownItem.target = '_self';");
fs.writeFileSync(file, content, 'utf8');
console.log('Replaced target=_blank with _self in criativos.html');
