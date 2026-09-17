const fs = require('fs');
const path = require('path');

const officialDir = 'D:/Trabalho/2026/LPs Clientes Tiny/Deploy GitHub/central-do-cliente';

// 1. Fix .nav-btn hover/active IDV in all files
const files = ['postagens.html', 'criativos.html', 'estrategias.html', 'dashboard.html'];
const correctNavBtnCss = `.nav-btn.active, .nav-btn:hover {
            border-color: var(--accent-base);
            color: var(--accent-light);
            background: rgba(117, 168, 35, 0.1);
        }`;

files.forEach(file => {
    const filePath = path.join(officialDir, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find and replace the .nav-btn.active CSS block
        const regex = /\.nav-btn\.active,\s*\.nav-btn:hover\s*\{[\s\S]*?\}/;
        if (regex.test(content)) {
            content = content.replace(regex, correctNavBtnCss);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated CSS in ${file}`);
        } else {
            console.log(`Regex not matched in ${file}`);
        }
    }
});

// 2. Fix dashboard.html auth logic
const dashboardPath = path.join(officialDir, 'dashboard.html');
let dashContent = fs.readFileSync(dashboardPath, 'utf8');

const scriptStart = dashContent.lastIndexOf('<script>');
const scriptEnd = dashContent.lastIndexOf('</script>') + 9;

if (scriptStart !== -1 && scriptEnd !== -1) {
    const newScript = `<script>
        document.addEventListener("DOMContentLoaded", async () => {
            if (window.supabaseClient) {
                const { data: { session } } = await window.supabaseClient.auth.getSession();
                if (!session) {
                    window.location.href = 'index.html';
                    return;
                }
                
                // Fetch the company name just to display it
                if (typeof window.fetchRealData === 'function') {
                    await window.fetchRealData();
                }
                if (window.currentClientName) {
                    document.getElementById('client-name').innerText = window.currentClientName;
                }
                
                // Fetch reportei_embed_url from profiles
                try {
                    const { data: profileData } = await window.supabaseClient
                        .from('profiles')
                        .select('reportei_embed_url')
                        .eq('id', session.user.id)
                        .single();
                        
                    let embedUrl = profileData?.reportei_embed_url;
                    
                    if (embedUrl && embedUrl.trim() !== '') {
                        document.getElementById('dashboard-container').style.display = 'block';
                        document.getElementById('reportei-iframe').src = embedUrl;
                    } else {
                        document.getElementById('no-dashboard-msg').style.display = 'block';
                    }
                } catch(e) {
                    console.error("Erro ao buscar dashboard:", e);
                    document.getElementById('no-dashboard-msg').style.display = 'block';
                }
            }
        });
        
        function openSwitchUserModal() {
            document.getElementById('switch-user-modal').style.display = 'flex';
        }
        function closeSwitchUserModal() {
            document.getElementById('switch-user-modal').style.display = 'none';
        }
    </script>`;
    
    dashContent = dashContent.substring(0, scriptStart) + newScript + dashContent.substring(scriptEnd);
    fs.writeFileSync(dashboardPath, dashContent, 'utf8');
    console.log('Fixed Auth and Supabase logic in dashboard.html');
}
