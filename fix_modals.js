const fs = require('fs');
const path = require('path');

function fixFile(filePath, isPostDefault) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Rename Button Text
    content = content.replace(
        'Pular aprovação desse post</button>',
        'Pular aprovação desse material</button>'
    );

    // 2. Rewrite openModal logic
    // I will use regex to replace the inside of openModal up to let urls = [];
    // It is easier to match between unction openModal(event) { and if (urls.length > 0) {
    const openModalMatch = content.match(/function openModal\\(event\\) \\{[\\s\\S]*?let urls = \\[\\];[\\s\\S]*?if \\(urls\\.length > 0\\) \\{/);
    if (!openModalMatch) {
        console.error('Could not find openModal block in ', filePath);
        return;
    }

    const replacement = unction openModal(event) {
            currentEventId = event.id;
            const props = event.extendedProps;
            currentPostType = props.status;
            
            const modalComment = document.getElementById('modal-comment');
            const mainActions = modalComment.nextElementSibling;
            const modalHistorico = document.getElementById('modal-historico');
            
            const isPendente = (props.status || '').toLowerCase().includes('pendente') || (props.status || '').toLowerCase().includes('aprovação');
            
            if (props.historico_alteracao && props.historico_alteracao.trim() !== '') {
                modalHistorico.style.display = 'block';
                modalHistorico.innerHTML = '<strong>Texto do último pedido de ajuste enviado:</strong><br><br>' + props.historico_alteracao;
            } else {
                modalHistorico.style.display = 'none';
            }

            if (isPendente) {
                document.getElementById('modal-actions-guided').style.display = 'flex';
                toggleGuidedAdjust(false);
            } else {
                // Aprovado ou Em Alteração
                document.getElementById('modal-actions-guided').style.display = 'none';
                modalComment.style.display = 'none';
            }

            document.getElementById('modal-title').style.display = 'block';
            document.getElementById('modal-desc').style.display = 'block';
            document.getElementById('modal-iframe-box').style.display = 'block';
            const loadingEl = document.getElementById('guided-loading-spinner');
            if (loadingEl) loadingEl.style.display = 'none';
            document.getElementById('modal-title').innerText = event.title;
            const descEl = document.getElementById('modal-desc');
            const iframeBox = document.getElementById('modal-iframe-box');

            let isPostContext = ; // Default para esta página
            if (typeof isGuidedMode !== 'undefined' && isGuidedMode) {
                if (guidedCategory === 'CRIATIVO' || guidedCategory === 'BRIEFING_CRIATIVO') {
                    isPostContext = false;
                } else if (guidedCategory === 'POST' || guidedCategory === 'BRIEFING') {
                    isPostContext = true;
                }
            }

            let urls = [];
            if (isPostContext) {
                descEl.innerText = props.texto_briefing || 'Sem texto de briefing disponível.';
                if (Array.isArray(props.url_postagem)) urls = props.url_postagem;
                else if (typeof props.url_postagem === 'string' && props.url_postagem.trim() !== '') {
                    urls = props.url_postagem.split(',').map(u => u.trim());
                }
            } else {
                descEl.innerText = props.texto_criativo || 'Sem texto de criativo disponível.';
                if (Array.isArray(props.url_criativo)) urls = props.url_criativo;
                else if (typeof props.url_criativo === 'string' && props.url_criativo.trim() !== '') {
                    urls = props.url_criativo.split(',').map(u => u.trim());
                }
            }

            if (urls.length > 0) {;

    content = content.replace(openModalMatch[0], replacement);

    // Also fix the HTML entity encoded text if present, to be safe.
    content = content.replace('Pular aprovaǜo desse post', 'Pular aprovação desse material');
    content = content.replace('Pular aprova&ccedil;&atilde;o desse post', 'Pular aprovação desse material');

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log('Successfully updated ', filePath);
}

fixFile(path.join(__dirname, 'postagens.html'), true);
fixFile(path.join(__dirname, 'criativos.html'), false);
