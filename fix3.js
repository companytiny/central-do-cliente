const fs = require('fs');

function applyFix(file) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Move close button to top center
    content = content.replace(
        /closeBtn\.style\.right = '15px';/g,
        `closeBtn.style.left = '50%';
                          closeBtn.style.transform = 'translateX(-50%)';`
    );

    // 2. Build the new button logic replacing the old btnViewMedia block
    const oldBlockStart = `const btnViewMedia = document.createElement('button');`;
    const oldBlockEndStr = `btnViewMedia.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';`;
    
    const newBlock = `// Main buttons container
                const mainBtnContainer = document.createElement('div');
                mainBtnContainer.style.display = 'flex';
                mainBtnContainer.style.gap = '15px';
                mainBtnContainer.style.flexWrap = 'wrap';
                mainBtnContainer.style.justifyContent = 'center';
                mainBtnContainer.style.width = '100%';

                const btnViewMedia = document.createElement('button');
                btnViewMedia.innerHTML = '&#9654; Visualizar Mídia';
                btnViewMedia.style.background = 'var(--accent-base)';
                btnViewMedia.style.color = '#fff';
                btnViewMedia.style.border = 'none';
                btnViewMedia.style.padding = '12px 24px';
                btnViewMedia.style.borderRadius = '8px';
                btnViewMedia.style.fontSize = '16px';
                btnViewMedia.style.fontWeight = 'bold';
                btnViewMedia.style.cursor = 'pointer';
                btnViewMedia.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';

                const btnDownloadMenu = document.createElement('button');
                btnDownloadMenu.innerHTML = '&#11015; Baixar Mídia';
                btnDownloadMenu.style.background = 'transparent';
                btnDownloadMenu.style.color = 'var(--accent-base)';
                btnDownloadMenu.style.border = '2px solid var(--accent-base)';
                btnDownloadMenu.style.padding = '12px 24px';
                btnDownloadMenu.style.borderRadius = '8px';
                btnDownloadMenu.style.fontSize = '16px';
                btnDownloadMenu.style.fontWeight = 'bold';
                btnDownloadMenu.style.cursor = 'pointer';

                mainBtnContainer.appendChild(btnViewMedia);
                mainBtnContainer.appendChild(btnDownloadMenu);

                // Download list container
                const downloadListContainer = document.createElement('div');
                downloadListContainer.style.display = 'none';
                downloadListContainer.style.flexDirection = 'column';
                downloadListContainer.style.gap = '20px';
                downloadListContainer.style.alignItems = 'center';
                downloadListContainer.style.width = '100%';
                downloadListContainer.style.padding = '10px 0';

                const btnBack = document.createElement('button');
                btnBack.innerHTML = '&#8592; Voltar para as opções';
                btnBack.style.background = 'transparent';
                btnBack.style.color = 'var(--text-main)';
                btnBack.style.border = 'none';
                btnBack.style.padding = '8px 15px';
                btnBack.style.cursor = 'pointer';
                btnBack.style.marginBottom = '10px';
                btnBack.style.fontSize = '14px';
                downloadListContainer.appendChild(btnBack);

                urls.forEach((url, idx) => {
                    if (url.includes('drive.google.com/file/d/')) {
                        const fileId = url.split('/d/')[1].split('/')[0];
                        const downloadUrl = 'https://drive.google.com/uc?export=download&id=' + fileId;
                        
                        const btnDownItem = document.createElement('a');
                        btnDownItem.href = downloadUrl;
                        btnDownItem.target = '_blank';
                        btnDownItem.innerHTML = urls.length > 1 ? '&#11015; Baixar Arquivo ' + String(idx + 1).padStart(2, '0') : '&#11015; Baixar Arquivo';
                        btnDownItem.style.background = 'rgba(255,255,255,0.05)';
                        btnDownItem.style.color = '#fff';
                        btnDownItem.style.border = '1px solid rgba(255,255,255,0.2)';
                        btnDownItem.style.padding = '14px 25px';
                        btnDownItem.style.borderRadius = '8px';
                        btnDownItem.style.textDecoration = 'none';
                        btnDownItem.style.fontWeight = '500';
                        btnDownItem.style.textAlign = 'center';
                        btnDownItem.style.width = '100%';
                        btnDownItem.style.maxWidth = '300px';
                        btnDownItem.style.display = 'block';
                        btnDownItem.style.transition = 'all 0.2s ease';
                        
                        btnDownItem.onclick = () => {
                            btnDownItem.style.background = 'var(--accent-base)';
                            btnDownItem.style.borderColor = 'var(--accent-base)';
                            btnDownItem.style.color = '#fff';
                            btnDownItem.innerHTML = '&#10004; Download Iniciado';
                        };
                        
                        downloadListContainer.appendChild(btnDownItem);
                    }
                });

                btnDownloadMenu.onclick = () => {
                    mainBtnContainer.style.display = 'none';
                    downloadListContainer.style.display = 'flex';
                };

                btnBack.onclick = () => {
                    downloadListContainer.style.display = 'none';
                    mainBtnContainer.style.display = 'flex';
                };
`;

    // Perform replacement for the block
    const startIndex = content.indexOf(oldBlockStart);
    const endIndex = content.indexOf(oldBlockEndStr, startIndex) + oldBlockEndStr.length;
    
    if (startIndex !== -1 && endIndex !== -1) {
        content = content.substring(0, startIndex) + newBlock + content.substring(endIndex);
    } else {
        console.log("Could not find the block to replace in " + file);
        return;
    }

    // Replace the append logic
    content = content.replace(
        /iframeBox\.appendChild\(btnViewMedia\);/g,
        `iframeBox.appendChild(mainBtnContainer);
                iframeBox.appendChild(downloadListContainer);`
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log(file + ' updated successfully!');
}

applyFix('postagens.html');
applyFix('criativos.html');
