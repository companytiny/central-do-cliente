const fs = require('fs');
const path = require('path');

const dashboardPath = 'D:/Trabalho/2026/LPs Clientes Tiny/Deploy GitHub/central-do-cliente/dashboard.html';
let content = fs.readFileSync(dashboardPath, 'utf8');

const regex = /<script>\s*document\.addEventListener\("DOMContentLoaded", async \(\) => \{\s*\/\/ Checar se o Supabase[\s\S]*?\/\/ Fim da l.*?gica do webhook\s*<\/script>/;

if (regex.test(content)) {
    content = content.replace(regex, '');
    console.log("Old script removed successfully via regex!");
} else {
    console.log("Could not find script block with regex.");
}

fs.writeFileSync(dashboardPath, content, 'utf8');
