const fs = require('fs');

const files = ['postagens.html', 'criativos.html'];

files.forEach(f => {
    let code = fs.readFileSync(f, 'utf8');
    const startMatch = code.indexOf('if (urls.length > 0) {');
    const endMatch = code.indexOf('} else {', startMatch);
    if(startMatch === -1 || endMatch === -1) {
        console.log('not found in', f);
        return;
    }
    
    let block = code.substring(startMatch, endMatch);
    
    // Create the updated block
    let newBlock = `if (urls.length > 0) {
                iframeBox.innerHTML = '';
                iframeBox.style.display = 'flex';
                iframeBox.style.flexDirection = 'column';
                iframeBox.style.alignItems = 'center';
                iframeBox.style.padding = '20px 0';

                const btnViewMedia = document.createElement('button');
                btnViewMedia.innerHTML = '&#9654; Visualizar Mídia';
                btnViewMedia.style.background = 'var(--primary)';
                btnViewMedia.style.color = '#fff';
                btnViewMedia.style.border = 'none';
                btnViewMedia.style.padding = '12px 24px';
                btnViewMedia.style.borderRadius = '8px';
                btnViewMedia.style.fontSize = '16px';
                btnViewMedia.style.fontWeight = 'bold';
                btnViewMedia.style.cursor = 'pointer';
                btnViewMedia.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';

                const renderMedia = (targetContainer) => {
                    targetContainer.style.padding = '0';
                    targetContainer.style.alignItems = 'stretch';`;
    
    // Extract the inner content of the original block
    let innerContent = block.substring(
        block.indexOf('if (urls.length > 1) {'),
        block.lastIndexOf('iframeBox.appendChild(carouselContainer);')
    );
    
    // Replace iframeBox references with targetContainer inside the inner content
    innerContent = innerContent.replace(/iframeBox\.appendChild\(/g, 'targetContainer.appendChild(');
    
    newBlock += '\n' + innerContent + `targetContainer.appendChild(carouselContainer);
                };

                btnViewMedia.onclick = () => {
                    if (window.innerWidth <= 768) {
                        const overlay = document.createElement('div');
                        overlay.id = 'fullscreen-media-modal';
                        overlay.style.position = 'fixed';
                        overlay.style.inset = '0';
                        overlay.style.backgroundColor = 'rgba(0,0,0,0.95)';
                        overlay.style.zIndex = '10000';
                        overlay.style.display = 'flex';
                        overlay.style.flexDirection = 'column';
                        
                        const closeBtn = document.createElement('button');
                        closeBtn.innerHTML = '&times; Fechar';
                        closeBtn.style.position = 'absolute';
                        closeBtn.style.top = '15px';
                        closeBtn.style.right = '15px';
                        closeBtn.style.background = 'rgba(255,255,255,0.2)';
                        closeBtn.style.color = '#fff';
                        closeBtn.style.border = 'none';
                        closeBtn.style.padding = '8px 16px';
                        closeBtn.style.borderRadius = '20px';
                        closeBtn.style.zIndex = '10001';
                        closeBtn.style.cursor = 'pointer';
                        closeBtn.onclick = () => document.body.removeChild(overlay);
                        
                        overlay.appendChild(closeBtn);
                        
                        const mediaContainer = document.createElement('div');
                        mediaContainer.style.flex = '1';
                        mediaContainer.style.display = 'flex';
                        mediaContainer.style.flexDirection = 'column';
                        mediaContainer.style.alignItems = 'center';
                        mediaContainer.style.justifyContent = 'center';
                        mediaContainer.style.width = '100%';
                        mediaContainer.style.padding = '10px';
                        
                        renderMedia(mediaContainer);
                        overlay.appendChild(mediaContainer);
                        document.body.appendChild(overlay);
                    } else {
                        iframeBox.innerHTML = '';
                        renderMedia(iframeBox);
                    }
                };
                
                iframeBox.appendChild(btnViewMedia);
            `;
            
    code = code.substring(0, startMatch) + newBlock + code.substring(endMatch);
    fs.writeFileSync(f, code);
    console.log(f, 'patched successfully');
});
