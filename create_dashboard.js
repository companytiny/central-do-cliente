const fs = require('fs');

const file = '../teste-dashboard/dashboard.html';
let content = fs.readFileSync(file, 'utf8');

// Update Top Nav
content = content.replace(
    /<a href="postagens\.html" class="nav-btn active" style="text-decoration:none;">Aprovação de postagens<\/a>/g,
    `<a href="postagens.html" class="nav-btn" style="text-decoration:none;">Aprovação de postagens</a>
                  <a href="dashboard.html" class="nav-btn active" style="text-decoration:none;">Dashboard de resultados</a>`
);

// Replace main content
// Find <main> and </main>
const mainStart = content.indexOf('<main>');
const mainEnd = content.indexOf('</main>') + 7;

if (mainStart !== -1 && mainEnd !== -1) {
    const newMain = `<main>
        <div class="page-title" style="margin-bottom: 20px;">
            <h1 style="font-size: 2.5rem; margin-bottom: 0;">Dashboard de Resultados</h1>
            <p style="color: var(--text-muted); margin-top: 10px;">Acompanhe o desempenho e as métricas do seu projeto.</p>
        </div>
        
        <div style="background-color: var(--card-bg); border: 1px solid var(--border-color); padding: 25px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.2); width: 100%; height: calc(100vh - 200px); min-height: 500px;">
            <iframe title="report" src="https://app.reportei.com/embed/HvDXwi3shOrT4DkwnfU717BAuYKIHt04" width="100%" height="100%" style="border: none; border-radius: 8px;"></iframe>
        </div>
    </main>`;
    
    content = content.substring(0, mainStart) + newMain + content.substring(mainEnd);
}

// Remove all script logic that belongs to postagens to avoid errors, 
// just keep the auth check and logout logic if needed.
// Actually, it's safer to just replace everything between <script> and </script> at the end with basic auth logic.

const scriptStart = content.lastIndexOf('<script>');
const scriptEnd = content.lastIndexOf('</script>') + 9;

if (scriptStart !== -1 && scriptEnd !== -1) {
    const newScript = `<script>
        // Lógica básica de verificação de login (mesma do sistema)
        const currentUserStr = localStorage.getItem('tiny_current_user');
        if (!currentUserStr) {
            window.location.href = 'index.html';
        } else {
            const user = JSON.parse(currentUserStr);
            document.getElementById('client-name').innerText = user.cliente || 'Cliente';
            if (user.avatarUrl) {
                document.getElementById('client-avatar').src = user.avatarUrl;
            }
        }
        
        function openSwitchUserModal() {
            localStorage.removeItem('tiny_current_user');
            window.location.href = 'index.html';
        }
    </script>`;
    
    content = content.substring(0, scriptStart) + newScript + content.substring(scriptEnd);
}

fs.writeFileSync(file, content, 'utf8');
console.log('Dashboard created successfully!');
