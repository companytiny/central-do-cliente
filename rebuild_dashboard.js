const fs = require('fs');

const srcFile = '../central-do-cliente/postagens.html';
const file = '../teste-dashboard/dashboard.html';

let content = fs.readFileSync(srcFile, 'utf8');

// 1. Update Top Nav order
content = content.replace(
    /<nav class="top-nav" style="display: flex; gap: 15px; align-items: center;">[\s\S]*?<\/nav>/,
    `<nav class="top-nav" style="display: flex; gap: 15px; align-items: center;">
                <a href="postagens.html" class="nav-btn" style="text-decoration:none;">Aprovação de postagens</a>
                <a href="criativos.html" class="nav-btn" style="text-decoration:none;">Aprovação de criativos</a>
                <a href="dashboard.html" class="nav-btn active" style="text-decoration:none;">Dashboard de resultados</a>
                <button onclick="openSwitchUserModal()" class="nav-btn" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-muted); cursor: pointer; padding: 10px 20px; text-decoration: none;">Trocar de Usuário</button>
            </nav>`
);

// 2. Increase main container width
content = content.replace(
    /max-width: 1100px;/g,
    `max-width: 1600px;`
);

// 3. Replace main content
const mainStart = content.indexOf('<main>');
const mainEnd = content.indexOf('</main>') + 7;

if (mainStart !== -1 && mainEnd !== -1) {
    const newMain = `<main>
        <div class="page-title" style="margin-bottom: 20px;">
            <h1 style="font-size: 2.5rem; margin-bottom: 0;">Dashboard de Resultados</h1>
            <p style="color: var(--text-muted); margin-top: 10px;">Acompanhe o desempenho e as métricas da(s) sua(s) marca(s) no Dashboard da Tiny logo abaixo:</p>
        </div>
        
        <div style="background-color: var(--card-bg); border: 1px solid var(--border-color); padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); width: 100%; height: 85vh; min-height: 800px;">
            <iframe title="report" src="https://app.reportei.com/embed/HvDXwi3shOrT4DkwnfU717BAuYKIHt04" width="100%" height="100%" style="border: none; border-radius: 8px;"></iframe>
        </div>
    </main>`;
    
    content = content.substring(0, mainStart) + newMain + content.substring(mainEnd);
}

// 4. Remove redirect logic
const scriptStart = content.lastIndexOf('<script>');
const scriptEnd = content.lastIndexOf('</script>') + 9;

if (scriptStart !== -1 && scriptEnd !== -1) {
    const newScript = `<script>
        const currentUserStr = localStorage.getItem('tiny_current_user');
        if (!currentUserStr) {
            console.log('Auth bypassed for test');
        } else {
            const user = JSON.parse(currentUserStr);
            document.getElementById('client-name').innerText = user.cliente || 'Cliente';
            if (user.avatarUrl) {
                document.getElementById('client-avatar').src = user.avatarUrl;
            }
        }
        
        function openSwitchUserModal() {
            localStorage.removeItem('tiny_current_user');
            window.location.href = '../central-do-cliente/index.html';
        }
    </script>`;
    
    content = content.substring(0, scriptStart) + newScript + content.substring(scriptEnd);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Dashboard created completely from scratch correctly!');
