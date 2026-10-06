const fs = require('fs');

function applyChanges(filePath) {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Fix modal-desc-box horizontal scroll
    const oldBoxDiv = `<div id="modal-desc-box" class="modal-desc-box" style="background:var(--bg-main); padding:12px; border-radius:8px; border:1px solid var(--border-color); margin-bottom:20px; overflow-y:auto; white-space:pre-wrap;">`;
    const newBoxDiv = `<div id="modal-desc-box" class="modal-desc-box" style="background:var(--bg-main); padding:12px; border-radius:8px; border:1px solid var(--border-color); margin-bottom:20px; overflow-y:auto; overflow-x:hidden; white-space:pre-wrap; word-break:break-word; overflow-wrap:break-word;">`;
    content = content.replace(oldBoxDiv, newBoxDiv);

    // 2. Add A- and A+ buttons next to tabs
    const oldTabsContainer = `<div id="modal-tabs-container" style="display:flex; gap:10px; margin-bottom:10px;">
                    <button id="tab-legenda" style="padding:6px 12px; border:2px solid var(--accent-base); background:var(--primary); color:#fff; border-radius:4px; cursor:pointer; font-size:12px; font-weight:600; flex:1;">Legenda</button>
                    <button id="tab-briefing" style="padding:6px 12px; border:1px solid var(--border-color); background:transparent; color:var(--text-main); border-radius:4px; cursor:pointer; font-size:12px; font-weight:600; flex:1;">Briefing</button>
                </div>`;
                
    // Wait, the indent in the actual file might differ. Let's use regex.
    const tabsRegex = /<div id="modal-tabs-container" style="display:flex; gap:10px; margin-bottom:10px;">\s*<button id="tab-legenda".*?>Legenda<\/button>\s*<button id="tab-briefing".*?>Briefing<\/button>\s*<\/div>/;
    
    // Find the actual block
    const match = content.match(tabsRegex);
    if (match) {
        const replacement = `<div id="modal-tabs-container" style="display:flex; gap:10px; margin-bottom:10px; align-items:center;">
                    <button id="tab-legenda" style="padding:6px 12px; border:2px solid var(--accent-base); background:var(--accent-base); color:#fff; border-radius:4px; cursor:pointer; font-size:12px; font-weight:600; flex:1;">Legenda</button>
                    <button id="tab-briefing" style="padding:6px 12px; border:1px solid var(--border-color); background:transparent; color:var(--text-main); border-radius:4px; cursor:pointer; font-size:12px; font-weight:600; flex:1;">Briefing</button>
                    
                    <div style="display:flex; gap:5px; margin-left:auto;">
                        <button onclick="changeTextSize(-2)" title="Reduzir texto" style="background:transparent; border:1px solid var(--border-color); color:var(--text-main); border-radius:4px; width:30px; height:30px; cursor:pointer; font-weight:bold; display:flex; align-items:center; justify-content:center;">A-</button>
                        <button onclick="changeTextSize(2)" title="Ampliar texto" style="background:transparent; border:1px solid var(--border-color); color:var(--text-main); border-radius:4px; width:30px; height:30px; cursor:pointer; font-weight:bold; display:flex; align-items:center; justify-content:center;">A+</button>
                    </div>
                </div>`;
        content = content.replace(tabsRegex, replacement);
    } else {
        console.log("Tabs not found in " + filePath);
    }

    // 3. Add changeTextSize function to the end of the script
    if (!content.includes('function changeTextSize')) {
        const scriptEndIndex = content.lastIndexOf('</script>');
        if (scriptEndIndex !== -1) {
            const jsFunction = `
        let currentTextSize = 14;
        window.changeTextSize = function(delta) {
            currentTextSize += delta;
            if(currentTextSize < 10) currentTextSize = 10;
            if(currentTextSize > 28) currentTextSize = 28;
            const desc = document.getElementById('modal-desc');
            const briefing = document.getElementById('modal-desc-briefing');
            if(desc) desc.style.fontSize = currentTextSize + 'px';
            if(briefing) briefing.style.fontSize = currentTextSize + 'px';
        };
        `;
            content = content.substring(0, scriptEndIndex) + jsFunction + content.substring(scriptEndIndex);
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

applyChanges('D:/Trabalho/2026/LPs Clientes Tiny/Deploy GitHub/central-do-cliente/postagens.html');
applyChanges('D:/Trabalho/2026/LPs Clientes Tiny/Deploy GitHub/central-do-cliente/criativos.html');
