const fs = require('fs');
const path = require('path');

const officialDir = 'D:/Trabalho/2026/LPs Clientes Tiny/Deploy GitHub/central-do-cliente';
const testDir = 'D:/Trabalho/2026/LPs Clientes Tiny/Deploy GitHub/teste-dashboard';

// 1. Create official dashboard.html based on postagens.html
let dashboardContent = fs.readFileSync(path.join(officialDir, 'postagens.html'), 'utf8');

// Update Nav
const navRegex = /<nav class="top-nav"[\s\S]*?<\/nav>/;
const newNav = `<nav class="top-nav" style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <a href="postagens.html" class="nav-btn" style="text-decoration:none;">Aprovação de postagens</a>
                <a href="criativos.html" class="nav-btn" style="text-decoration:none;">Aprovação de criativos</a>
                <a href="dashboard.html" class="nav-btn active" style="text-decoration:none;">Dashboard de resultados</a>
                <button onclick="openSwitchUserModal()" class="nav-btn" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-muted); cursor: pointer; padding: 10px 20px; text-decoration: none;">Trocar de Usuário</button>
            </nav>`;
dashboardContent = dashboardContent.replace(navRegex, newNav);

// Increase width
dashboardContent = dashboardContent.replace(/max-width: 1100px;/g, 'max-width: 1600px;');

// Replace Main
const mainStart = dashboardContent.indexOf('<main>');
const mainEnd = dashboardContent.indexOf('</main>') + 7;

const newMain = `<main>
        <div class="page-title" style="margin-bottom: 20px;">
            <h1 style="font-size: 2.5rem; margin-bottom: 0;">Dashboard de Resultados</h1>
            <p style="color: var(--text-muted); margin-top: 10px;">Acompanhe o desempenho e as métricas da(s) sua(s) marca(s) no Dashboard da Tiny logo abaixo:</p>
        </div>
        
        <div id="dashboard-container" style="background-color: var(--card-bg); border: 1px solid var(--border-color); padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); width: 100%; height: 85vh; min-height: 800px; display: none;">
            <iframe id="reportei-iframe" title="report" src="" width="100%" height="100%" style="border: none; border-radius: 8px;"></iframe>
        </div>

        <div id="no-dashboard-msg" style="text-align: center; padding: 60px 20px; background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; margin-top: 40px; display: none;">
            <h2 style="color: var(--text-main); font-family: var(--font-heading); margin-bottom: 15px;">Dashboard em configuração</h2>
            <p style="color: var(--text-muted); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">O seu painel de métricas está sendo gerado ou atualizado pela nossa equipe. Em breve os resultados estarão disponíveis aqui!</p>
        </div>
    </main>`;
dashboardContent = dashboardContent.substring(0, mainStart) + newMain + dashboardContent.substring(mainEnd);

// Replace Script logic
const scriptStart = dashboardContent.lastIndexOf('<script>');
const scriptEnd = dashboardContent.lastIndexOf('</script>') + 9;

const newScript = `<script>
        const currentUserStr = localStorage.getItem('tiny_current_user');
        if (!currentUserStr) {
            window.location.href = 'index.html';
        } else {
            const user = JSON.parse(currentUserStr);
            document.getElementById('client-name').innerText = user.cliente || 'Cliente';
            if (user.avatarUrl) {
                document.getElementById('client-avatar').src = user.avatarUrl;
            }
            
            // Lógica do Reportei dinâmico
            if (user.reportei_embed_url && user.reportei_embed_url.trim() !== '') {
                document.getElementById('dashboard-container').style.display = 'block';
                document.getElementById('reportei-iframe').src = user.reportei_embed_url;
            } else {
                document.getElementById('no-dashboard-msg').style.display = 'block';
            }
        }
        
        function openSwitchUserModal() {
            document.getElementById('switch-user-modal').style.display = 'flex';
        }
        function closeSwitchUserModal() {
            document.getElementById('switch-user-modal').style.display = 'none';
        }
        function confirmSwitchUser() {
            localStorage.removeItem('tiny_current_user');
            window.location.href = 'index.html';
        }
    </script>`;
dashboardContent = dashboardContent.substring(0, scriptStart) + newScript + dashboardContent.substring(scriptEnd);

fs.writeFileSync(path.join(officialDir, 'dashboard.html'), dashboardContent, 'utf8');

// 2. Update Navbar in other files
const filesToUpdate = ['postagens.html', 'criativos.html', 'estrategias.html'];

filesToUpdate.forEach(file => {
    const filePath = path.join(officialDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        const navRegexToReplace = /<nav class="top-nav"[\s\S]*?<\/nav>/;
        let navHtml = `<nav class="top-nav" style="display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                <a href="postagens.html" class="nav-btn ${file === 'postagens.html' ? 'active' : ''}" style="text-decoration:none;">Aprovação de postagens</a>
                <a href="criativos.html" class="nav-btn ${file === 'criativos.html' ? 'active' : ''}" style="text-decoration:none;">Aprovação de criativos</a>
                <a href="dashboard.html" class="nav-btn" style="text-decoration:none;">Dashboard de resultados</a>
                <button onclick="openSwitchUserModal()" class="nav-btn" style="background: transparent; border: 1px solid var(--border-color); color: var(--text-muted); cursor: pointer; padding: 10px 20px; text-decoration: none;">Trocar de Usuário</button>
            </nav>`;
            
        content = content.replace(navRegexToReplace, navHtml);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(file + ' updated.');
    }
});

// 3. Remove test folder recursively
fs.rmSync(testDir, { recursive: true, force: true });
console.log('Test folder deleted.');

console.log('Official implementation complete!');
