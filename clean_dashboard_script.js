const fs = require('fs');
const path = require('path');

const dashboardPath = 'D:/Trabalho/2026/LPs Clientes Tiny/Deploy GitHub/central-do-cliente/dashboard.html';
let content = fs.readFileSync(dashboardPath, 'utf8');

// 1. Remove the huge postagens script block
const scriptStartPattern = '<script>\n        document.addEventListener("DOMContentLoaded", async () => {\n            // Checar se o Supabase';
const scriptStart = content.indexOf('<script>\n        document.addEventListener("DOMContentLoaded", async () => {\n            // Checar');

if (scriptStart !== -1) {
    // Find the end of this script block
    const scriptEndStr = '// Fim da lógica do webhook\n    </script>';
    const scriptEnd = content.indexOf(scriptEndStr, scriptStart);
    
    if (scriptEnd !== -1) {
        content = content.substring(0, scriptStart) + content.substring(scriptEnd + scriptEndStr.length);
        console.log("Removed old postagens script block.");
    } else {
        console.log("Could not find the end of the postagens script block.");
    }
} else {
    console.log("Could not find the start of the postagens script block.");
}

// 2. Remove the client-name assignment that was causing the error
content = content.replace(
    /if \(window\.currentClientName\) {\s*document\.getElementById\('client-name'\)\.innerText = window\.currentClientName;\s*}/g,
    ''
);

fs.writeFileSync(dashboardPath, content, 'utf8');
console.log('Dashboard cleaned up!');
