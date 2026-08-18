const fs = require('fs');

const blockToInject = `if (urls.length > 0) {
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
                    targetContainer.style.alignItems = 'stretch';
                    
                    if (urls.length > 1) {
                        const titleEl = document.createElement('h3');
                        titleEl.innerText = "Telas do carrossel ou variações do material:";
                        titleEl.style.fontSize = '14px';
                        titleEl.style.color = 'var(--text-muted)';
                        titleEl.style.marginBottom = '10px';
                        titleEl.style.fontWeight = '500';
                        targetContainer.appendChild(titleEl);
                    }
                    
                    const carouselContainer = document.createElement('div');
                    carouselContainer.style.position = 'relative';
                    carouselContainer.style.width = '100%';
                    carouselContainer.style.display = 'flex';
                    carouselContainer.style.alignItems = 'center';

                    const wrapper = document.createElement('div');
                    wrapper.style.display = 'flex';
                    wrapper.style.gap = '15px';
                    wrapper.style.overflowX = 'auto';
                    wrapper.style.width = '100%';
                    wrapper.style.paddingBottom = '5px';
                    wrapper.style.paddingLeft = '0';
                    wrapper.style.paddingRight = '0';
                    wrapper.style.scrollBehavior = 'smooth';
                    wrapper.style.scrollSnapType = 'x mandatory';
                    wrapper.style.scrollbarWidth = 'none';
                    wrapper.style.msOverflowStyle = 'none';
                    
                    if (!document.getElementById('carousel-hide-scroll')) {
                        const style = document.createElement('style');
                        style.id = 'carousel-hide-scroll';
                        style.innerHTML = '#modal-iframe-box > div > div::-webkit-scrollbar { display: none; } #fullscreen-media-modal > div > div > div::-webkit-scrollbar { display: none; }';
                        document.head.appendChild(style);
                    }
                    
                    if (urls.length > 1) {
                        const btnPrev = document.createElement('button');
                        btnPrev.innerHTML = '&#10094;';
                        btnPrev.style.position = 'absolute';
                        btnPrev.style.left = '10px';
                        btnPrev.style.zIndex = '10';
                        btnPrev.style.background = 'var(--primary)';
                        btnPrev.style.color = '#fff';
                        btnPrev.style.border = '2px solid var(--border-color)';
                        btnPrev.style.borderRadius = '50%';
                        btnPrev.style.width = '36px';
                        btnPrev.style.height = '36px';
                        btnPrev.style.cursor = 'pointer';
                        btnPrev.style.display = 'flex';
                        btnPrev.style.alignItems = 'center';
                        btnPrev.style.justifyContent = 'center';
                        btnPrev.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
                        const getScrollAmount = () => {
                            const child = wrapper.firstElementChild;
                            return child ? (child.offsetWidth + 15) : (wrapper.clientWidth * 0.85 + 15);
                        };
                        btnPrev.onclick = () => wrapper.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });

                        const btnNext = document.createElement('button');
                        btnNext.innerHTML = '&#10095;';
                        btnNext.style.position = 'absolute';
                        btnNext.style.right = '10px';
                        btnNext.style.zIndex = '10';
                        btnNext.style.background = 'var(--primary)';
                        btnNext.style.color = '#fff';
                        btnNext.style.border = '2px solid var(--border-color)';
                        btnNext.style.borderRadius = '50%';
                        btnNext.style.width = '36px';
                        btnNext.style.height = '36px';
                        btnNext.style.cursor = 'pointer';
                        btnNext.style.display = 'flex';
                        btnNext.style.alignItems = 'center';
                        btnNext.style.justifyContent = 'center';
                        btnNext.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)';
                        btnNext.onclick = () => wrapper.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
                        carouselContainer.appendChild(btnPrev);
                        carouselContainer.appendChild(btnNext);
                    }
                    
                    urls.forEach(url => {
                        let finalUrl = url;
                        if (url.includes('drive.google.com/file/d/')) {
                            const fileId = url.split('/d/')[1].split('/')[0];
                            finalUrl = \`https://drive.google.com/file/d/\${fileId}/preview\`;
                        }
                        const ifr = document.createElement('iframe');
                        ifr.src = finalUrl;
                        ifr.style.border = 'none';
                        ifr.style.width = '100%';
                        if (window.innerWidth <= 768) {
                            ifr.style.aspectRatio = dynamicAspectRatio;
                            ifr.style.height = 'auto';
                        } else {
                            ifr.style.height = '400px';
                        }
                        ifr.style.borderRadius = '8px';
                        ifr.style.scrollSnapAlign = window.innerWidth <= 768 ? 'center' : 'start';
                        ifr.allow = 'autoplay; fullscreen';
                        ifr.setAttribute('allowfullscreen', 'true');
                        
                        if (urls.length > 1) {
                            ifr.style.minWidth = window.innerWidth <= 768 ? '100%' : '85%';
                            ifr.style.flexShrink = '0';
                        }
                        
                        wrapper.appendChild(ifr);
                    });
                    
                    carouselContainer.appendChild(wrapper);
                    targetContainer.appendChild(carouselContainer);
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
            } else {
                iframeBox.style.display = 'none';
                iframeBox.innerHTML = '';
            }

            document.getElementById('modal-comment').value = '';`;

const files = ['postagens.html', 'criativos.html'];

files.forEach(f => {
    let code = fs.readFileSync(f, 'utf8');
    const startMatch = code.indexOf('if (urls.length > 0) {');
    const endMatchStr = "document.getElementById('modal-comment').value = '';";
    const endMatch = code.indexOf(endMatchStr, startMatch);
    
    if (startMatch !== -1 && endMatch !== -1) {
        code = code.substring(0, startMatch) + blockToInject + code.substring(endMatch + endMatchStr.length);
        fs.writeFileSync(f, code);
        console.log(f, 'Fixed via hard replace');
    } else {
        console.log(f, 'Could not find boundaries');
    }
});
