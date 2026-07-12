
        document.addEventListener("DOMContentLoaded", async () => {
            // Checar se o Supabase tá ativo e o usuário tá logado
            if (window.supabaseClient) {
                const { data: { session } } = await window.supabaseClient.auth.getSession();
                if (!session) {
                    window.location.href = 'index.html';
                    return;
                }
                
                // Exibir botão de logout no header
                const topBar = document.querySelector('.top-bar-right');
                if (topBar) {
                    const logoutBtn = document.createElement('button');
                    logoutBtn.innerText = 'Sair';
                    logoutBtn.className = 'btn-secondary';
                    logoutBtn.style.padding = '8px 15px';
                    logoutBtn.style.marginLeft = '15px';
                    logoutBtn.onclick = () => window.logOut();
                    topBar.appendChild(logoutBtn);
                }
            }

            // Buscar dados reais do Supabase
            if (typeof window.fetchRealData === 'function') {
                await window.fetchRealData();
            }

            const mockDatabase = window.mockDatabase || [];
            let postagens = mockDatabase;
            
            if (typeof window.renderGridCriativos === 'function') {
                window.renderGridCriativos();
                window.updateDashboardCustom();
            }
        });
            let isGuidedMode = false;
        let guidedQueue = [];
        let guidedCategory = '';
        window.currentGuidedIndex = 0;

        function checkGuidedApproval() {
            if (!window.mockDatabase) return;
            const contextData = window.mockDatabase.filter(e => (e.tag || '').toUpperCase().includes('TRÁFEGO PAGO'));
            let countBriefing = 0, countPost = 0, countBriefingCriativo = 0, countCriativo = 0;
            contextData.forEach(item => {
                const s = (item.status || '').toUpperCase();
                if (s.includes('APROVAÇÃO DE BRIEFING') && !s.includes('CRIATIVO')) countBriefing++;
                if (s.includes('APROVAÇÃO DE POST')) countPost++;
                if (s.includes('APROVAÇÃO DE BRIEFING DE CRIATIVO')) countBriefingCriativo++;
                if (s.includes('APROVAÇÃO DE CRIATIVO') && !s.includes('BRIEFING')) countCriativo++;
            });

            const total = countBriefing + countPost + countBriefingCriativo + countCriativo;
            const optionsDiv = document.getElementById('guided-options');
            if(!optionsDiv) return;
            
            if (total === 0) {
                optionsDiv.innerHTML = '<p style="color:var(--text-main); text-align:center; font-size:1.1rem; line-height:1.5;">Parabéns, todos os conteúdos estão aprovados ou em alteração!<br><br><span style="color:var(--text-muted); font-size:0.95rem;">Caso chegue algum novo conteúdo para você, enviaremos um e-mail.</span></p>';
                document.getElementById('guided-overlay').style.display = 'flex';
                return;
            }

            optionsDiv.innerHTML = '';
            
            if (countPost > 0) {
                optionsDiv.innerHTML += `<button onclick="startGuidedMode('POST')" class="guided-category-btn">Você tem ${countPost} Posts para aprovar</button>`;
            }
            if (countBriefing > 0) {
                optionsDiv.innerHTML += `<button onclick="startGuidedMode('BRIEFING')" class="guided-category-btn">Você tem ${countBriefing} Briefings Orgânicos</button>`;
            }
            if (countCriativo > 0) {
                optionsDiv.innerHTML += `<button onclick="startGuidedMode('CRIATIVO')" class="guided-category-btn">Você tem ${countCriativo} Criativos para aprovar</button>`;
            }
            if (countBriefingCriativo > 0) {
                optionsDiv.innerHTML += `<button onclick="startGuidedMode('BRIEFING_CRIATIVO')" class="guided-category-btn">Você tem ${countBriefingCriativo} Briefings de Criativos</button>`;
            }

            document.getElementById('guided-overlay').style.display = 'flex';
        }

        function closeGuidedWelcome() {
            sessionStorage.setItem('guidedWelcomeShown', 'true');
            document.getElementById('guided-overlay').style.display = 'none';
        }

        function startGuidedMode(category) {
            closeGuidedWelcome();
            isGuidedMode = true;
            guidedCategory = category;
            
            let targetString = '';
            if (category === 'POST') targetString = 'APROVAÇÃO DE POST';
            if (category === 'BRIEFING') targetString = 'APROVAÇÃO DE BRIEFING';
            if (category === 'CRIATIVO') targetString = 'APROVAÇÃO DE CRIATIVO';
            if (category === 'BRIEFING_CRIATIVO') targetString = 'APROVAÇÃO DE BRIEFING DE CRIATIVO';

            const contextData = window.mockDatabase.filter(e => (e.tag || '').toUpperCase().includes('TRÁFEGO PAGO'));
            guidedQueue = contextData.filter(i => {
                const s = (i.status || '').toUpperCase();
                if (category === 'POST' && s.includes('POST')) return true;
                if (category === 'BRIEFING' && s.includes('APROVAÇÃO DE BRIEFING') && !s.includes('CRIATIVO')) return true;
                if (category === 'CRIATIVO' && s.includes('APROVAÇÃO DE CRIATIVO') && !s.includes('BRIEFING')) return true;
                if (category === 'BRIEFING_CRIATIVO' && s.includes('BRIEFING DE CRIATIVO')) return true;
                return false;
            });
            
            guidedQueue.sort((a, b) => new Date(a.data) - new Date(b.data));
            
            if (guidedQueue.length > 0) {
                openGuidedItem(0);
            }
        }

        
        function skipGuidedItem() {
            if (typeof isGuidedMode !== 'undefined' && isGuidedMode) {
                setTimeout(() => openGuidedItem(window.currentGuidedIndex + 1), 200);
            } else {
                closeModal();
            }
        }
    
        
        function toggleGuidedAdjust(show) {
            document.getElementById('modal-comment').style.display = show ? 'block' : 'none';
            document.getElementById('guided-primary-buttons').style.display = show ? 'none' : 'flex';
            document.getElementById('guided-adjust-buttons').style.display = show ? 'flex' : 'none';
            if(show) {
                document.getElementById('modal-comment').focus();
            } else {
                document.getElementById('modal-comment').value = '';
            }
        }
        
        function openGuidedItem(index) {
            if (index >= guidedQueue.length) {
                // Tela de Loading Animada
                document.getElementById('guided-header').style.display = 'none';
                document.getElementById('modal-title').style.display = 'none';
                document.getElementById('modal-desc').style.display = 'none';
                document.getElementById('modal-iframe-box').style.display = 'none';
                document.getElementById('modal-comment').style.display = 'none';
                document.getElementById('modal-actions-guided').style.display = 'none';
                
                let loadingEl = document.getElementById('guided-loading-spinner');
                if(!loadingEl) {
                    loadingEl = document.createElement('div');
                    loadingEl.id = 'guided-loading-spinner';
                    loadingEl.innerHTML = '<div style="font-size:3rem; margin-bottom:20px; animation: spin 1.5s linear infinite;">🔄</div><h3 style="color:var(--text-main); font-family:var(--font-heading);">Carregando aprovações pendentes...</h3>';
                    loadingEl.style = "text-align:center; padding: 20px; overflow: hidden;"; document.querySelector('.custom-modal').style.overflow = 'hidden';
                    document.querySelector('.custom-modal').appendChild(loadingEl);
                    
                    const style = document.createElement('style');
                    style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
                    document.head.appendChild(style);
                }
                loadingEl.style.display = 'block';

                setTimeout(() => {
                    loadingEl.style.display = 'none';
                    isGuidedMode = false;
                    closeModal();
                    if (typeof window.renderGridCriativos === 'function') {
                        window.renderGridCriativos();
                        window.updateDashboardCustom();
                    }
                    setTimeout(checkGuidedApproval, 500); // Retorna à tela inicial sem reload
                }, 2000);
                return;
            }
            
            document.getElementById('guided-header').style.display = 'flex';
            let label = 'do item';
            if (guidedCategory === 'POST') label = 'do post';
            if (guidedCategory === 'BRIEFING') label = 'do briefing';
            if (guidedCategory === 'CRIATIVO') label = 'do criativo';
            if (guidedCategory === 'BRIEFING_CRIATIVO') label = 'do briefing de criativo';

            document.getElementById('guided-progress-text').innerText = `Aprovação ${label} ${index + 1} de ${guidedQueue.length}`;
            
            document.getElementById('guided-progress-fill').style.width = `${((index + 1) / guidedQueue.length) * 100}%`;
            
            
            const item = guidedQueue[index];
            const fakeEvent = {
                id: item.id,
                title: item.titulo,
                extendedProps: {
                    status: item.status,
                    tag: item.tag,
                    texto_briefing: item.texto_briefing,
                    texto_criativo: item.texto_criativo,
                    url_drive: item.url_drive
                }
            };
            
            window.currentGuidedIndex = index;
            openModal(fakeEvent);
        }

        let currentUser = null;
        let calendars = {};
        let currentEventId = null;
        let currentPostType = null;

        // ==========================================
        // INIT APP
        // ==========================================
        currentUser = { id: 'dev', email: 'dev@tiny.com' };
        
        window.onload = function() {
            const content = document.getElementById('content-wrapper');
            content.style.display = 'block';
            content.style.opacity = '1';
            initCalendars();
        };

        

        // ==========================================
        // CALENDAR INIT & DATA FETCHING
        // ==========================================
        async function initCalendars() {
            if (calendars.postagens) return;

            let postagens = window.mockDatabase || [];
            if (supabaseClient) {
                const { data, error } = await supabaseClient
                    .from('postagens')
                    .select('*');
                    
                if (error) {
                    console.error("Erro ao buscar postagens:", error);
                    return;
                }
                postagens = data || [];

            // 1. Filtrar apenas TRÁFEGO PAGO
            
            window.currentMonthCriativos = 'Todas';
            window.currentTabCriativos = 'Todas as campanhas';
            
            window.updateDashboardCustom = () => {
                const currentPostagens = window.mockDatabase || postagens;
                const evts = currentPostagens.filter(e => (e.tag || '').toUpperCase().includes('TRÁFEGO PAGO'));
                let approved = 0;
                let pending = 0;
                let revision = 0;
                
                evts.forEach(e => {
                    const st = (e.status || '').toLowerCase();
                    if (st.includes('aprovado') || st.includes('concluído')) approved++;
                    else if (st.includes('correção') || st.includes('ajuste') || st.includes('alteração')) revision++;
                    else if (st.includes('aprovação') || st.includes('aprovar')) pending++;
                });
                
                const appEl = document.getElementById('stat-approved');
                if(appEl) appEl.innerText = approved;
                const pendEl = document.getElementById('stat-pending');
                if(pendEl) pendEl.innerText = pending;
                const revEl = document.getElementById('stat-revision');
                if(revEl) revEl.innerText = revision;
            };

            window.renderTabsCriativos = () => {
                const nav = document.getElementById('campaign-tabs-nav');
                if(!nav) return;
                nav.innerHTML = '';
                
                const currentPostagens = window.mockDatabase || postagens;
                const evts = currentPostagens.filter(e => (e.tag || '').toUpperCase().includes('TRÁFEGO PAGO'));
                
                // Meses únicos
                const mesesUnicos = [...new Set(evts.map(e => {
                    if (!e.data) return 'Sem Data';
                    return e.data.substring(0, 7); // YYYY-MM
                }))].filter(m => m !== 'Sem Data').sort();
                
                if (window.currentMonthCriativos === 'Todas' && mesesUnicos.length > 0) {
                    window.currentMonthCriativos = mesesUnicos[0];
                }
                
                // --- MONTH ROW ---
                const monthRow = document.createElement('div');
                monthRow.style = 'display:flex; justify-content:center; align-items:center; gap:15px; margin-bottom: 20px; width:100%;';
                
                const btnPrev = document.createElement('button');
                btnPrev.innerHTML = '&#9664;';
                btnPrev.className = 'tab-btn';
                btnPrev.style.padding = '8px 15px';
                btnPrev.onclick = () => {
                    const idx = mesesUnicos.indexOf(window.currentMonthCriativos);
                    if (idx > 0) {
                        window.currentMonthCriativos = mesesUnicos[idx - 1];
                        window.currentTabCriativos = 'Todas as campanhas';
                        window.renderTabsCriativos();
                        window.renderGridCriativos();
                    }
                };
                
                const monthLabel = document.createElement('span');
                let mName = 'Geral';
                if (window.currentMonthCriativos !== 'Todas') {
                    const d = new Date(window.currentMonthCriativos + '-01T12:00:00');
                    mName = d.toLocaleDateString('pt-BR', {month:'long', year:'numeric'}).toUpperCase();
                }
                monthLabel.innerHTML = `<strong>${mName}</strong>`;
                monthLabel.style = 'color:var(--text-main); font-family:var(--font-heading); min-width: 180px; text-align:center; font-size:1.1rem;';
                
                const btnNext = document.createElement('button');
                btnNext.innerHTML = '&#9654;';
                btnNext.className = 'tab-btn';
                btnNext.style.padding = '8px 15px';
                btnNext.onclick = () => {
                    const idx = mesesUnicos.indexOf(window.currentMonthCriativos);
                    if (idx < mesesUnicos.length - 1) {
                        window.currentMonthCriativos = mesesUnicos[idx + 1];
                        window.currentTabCriativos = 'Todas as campanhas';
                        window.renderTabsCriativos();
                        window.renderGridCriativos();
                    }
                };
                
                monthRow.appendChild(btnPrev);
                monthRow.appendChild(monthLabel);
                monthRow.appendChild(btnNext);
                nav.appendChild(monthRow);
                
                // --- CAMPAIGN ROW ---
                const monthEvents = evts.filter(e => e.data && e.data.startsWith(window.currentMonthCriativos));
                const campanhasNoMes = [...new Set(monthEvents.map(e => e.campanha || 'Campanha Geral'))];
                campanhasNoMes.unshift('Todas as campanhas');
                
                const campRow = document.createElement('div');
                campRow.style = 'display:flex; justify-content:center; flex-wrap:wrap; gap:10px; width:100%;';
                
                campanhasNoMes.forEach(camp => {
                    const btn = document.createElement('button');
                    btn.className = `tab-btn ${camp === window.currentTabCriativos ? 'active' : ''}`;
                    btn.innerText = camp;
                    btn.onclick = () => {
                        window.currentTabCriativos = camp;
                        window.renderTabsCriativos();
                        window.renderGridCriativos();
                    };
                    campRow.appendChild(btn);
                });
                nav.appendChild(campRow);
            };
            
            window.renderGridCriativos = () => {
                const grid = document.getElementById('creatives-grid-container');
                if(!grid) return;
                grid.innerHTML = '';
                
                const currentPostagens = window.mockDatabase || postagens;
                const evts = currentPostagens.filter(e => (e.tag || '').toUpperCase().includes('TRÁFEGO PAGO'));
                
                let tabEvents = evts.filter(e => {
                    if (window.currentMonthCriativos !== 'Todas' && (!e.data || !e.data.startsWith(window.currentMonthCriativos))) return false;
                    if (window.currentTabCriativos !== 'Todas as campanhas' && (e.campanha || 'Campanha Geral') !== window.currentTabCriativos) return false;
                    return true;
                });
                
                tabEvents.sort((a, b) => {
                    const getRank = (st) => {
                        st = st.toLowerCase();
                        if (st.includes('aprovação') || st.includes('aprovar')) return 1;
                        if (st.includes('correção') || st.includes('ajuste') || st.includes('alteração')) return 2;
                        if (st.includes('aprovado') || st.includes('concluído')) return 3;
                        return 4;
                    };
                    return getRank(a.status || '') - getRank(b.status || '');
                });
                
                tabEvents.forEach(e => {
                    const st = (e.status || '').toLowerCase();
                    let badgeClass = 'status-blue';
                    let badgeText = e.status || 'Sem status';
                    let isApproved = false;
                    let isAlteracao = false;
                    
                    if (st.includes('aprovado') || st.includes('concluído')) {
                        badgeClass = 'status-green';
                        isApproved = true;
                    } else if (st.includes('aprovação') || st.includes('aprovar')) {
                        badgeClass = 'status-yellow';
                    } else if (st.includes('alteração') || st.includes('ajuste') || st.includes('correção')) {
                        isAlteracao = true;
                    }
                    
                    const card = document.createElement('div');
                    card.className = 'creative-card';
                    
                    const buttonHTML = isAlteracao ? '' : `<button class="btn-review ${isApproved ? 'view-only' : ''}">${isApproved ? 'Visualizar Arquivos' : 'Revisar Criativo'}</button>`;
                    
                    card.innerHTML = `
                        <div class="card-header">
                            <h3 class="card-title">${e.titulo}</h3>
                            <span class="status-badge ${badgeClass}">${badgeText}</span>
                        </div>
                        <div class="card-body">
                            <p class="card-desc">${e.texto_criativo || e.texto_briefing || 'Sem descrição.'}</p>
                        </div>
                        ${buttonHTML}
                    `;
                    
                    const btn = card.querySelector('.btn-review');
                    if (btn) {
                        btn.onclick = () => {
                            const mockEvent = {
                                id: e.id,
                                title: e.titulo,
                                extendedProps: {
                                    status: e.status,
                                    tag: e.tag,
                                    texto_criativo: e.texto_criativo,
                                    url_drive: e.url_drive
                                }
                            };
                            openModal(mockEvent);
                        };
                    }
                    
                    grid.appendChild(card);
                });
            };
            
            window.renderTabsCriativos();
            window.renderGridCriativos();
            window.updateDashboardCustom();
        }

        // ==========================================
        // MODAL & WEBHOOK LOGIC
        // ==========================================
        function openModal(event) {
            currentEventId = event.id;
            const props = event.extendedProps;
            currentPostType = props.status;
            
            // Hide comment and actions if approved
            const modalComment = document.getElementById('modal-comment');
            const mainActions = modalComment.nextElementSibling;
            const isApproved = (props.status || '').toLowerCase().includes('aprovado') || (props.status || '').toLowerCase().includes('concluído');
            
            if (isApproved) {
                document.getElementById('modal-actions-guided').style.display = 'none';
                modalComment.style.display = 'none';
            } else {
                document.getElementById('modal-actions-guided').style.display = 'flex';
                toggleGuidedAdjust(false);
            }

            document.getElementById('modal-title').style.display = 'block';
            document.getElementById('modal-desc').style.display = 'block';
            document.getElementById('modal-iframe-box').style.display = 'block';
            const loadingEl = document.getElementById('guided-loading-spinner');
            if (loadingEl) loadingEl.style.display = 'none';
            document.getElementById('modal-title').innerText = event.title;
            const descEl = document.getElementById('modal-desc');
            const iframeBox = document.getElementById('modal-iframe-box');

            if ((props.tag || '').toUpperCase().includes('MÍDIAS SOCIAIS')) {
                descEl.innerText = props.texto_briefing || 'Sem texto de briefing disponível.';
            } else if ((props.tag || '').toUpperCase().includes('TRÁFEGO PAGO')) {
                descEl.innerText = props.texto_criativo || 'Sem texto de criativo disponível.';
            } else {
                descEl.innerText = props.texto_briefing || props.texto_criativo || 'Sem descrição.';
            }

            let urls = [];
            if (Array.isArray(props.url_drive)) {
                urls = props.url_drive;
            } else if (typeof props.url_drive === 'string' && props.url_drive.trim() !== '') {
                urls = props.url_drive.split(',').map(u => u.trim());
            }

            if (urls.length > 0) {
                iframeBox.innerHTML = '';
                if (urls.length > 1) {
                    const titleEl = document.createElement('h3');
                    titleEl.innerText = "Telas do carrossel ou variações do material:";
                    titleEl.style.fontSize = '14px';
                    titleEl.style.color = 'var(--text-muted)';
                    titleEl.style.marginBottom = '10px';
                    titleEl.style.fontWeight = '500';
                    iframeBox.appendChild(titleEl);
                }
                urls.forEach(url => {
                    let finalUrl = url;
                    if (finalUrl.includes('drive.google.com/file/d/') && finalUrl.includes('/view')) {
                        finalUrl = finalUrl.replace(/\/view.*$/, '/preview?rm=minimal');
                    }
                    const ifr = document.createElement('iframe');
                    ifr.src = finalUrl;
                    ifr.allow = "autoplay";
                    ifr.style.width = urls.length > 1 ? '48%' : '100%';
                    ifr.style.height = '100%';
                    ifr.style.border = 'none';
                    ifr.style.flexShrink = '0';
                    ifr.style.borderRadius = '8px';
                    iframeBox.appendChild(ifr);
                });
                iframeBox.style.display = 'flex';
                iframeBox.style.gap = '10px';
                iframeBox.style.overflowX = 'auto';
            } else {
                iframeBox.style.display = 'none';
                iframeBox.innerHTML = '';
            }

            document.getElementById('modal-comment').value = '';
            document.getElementById('custom-modal-overlay').style.display = 'flex';
        }

        function closeModal() { document.querySelector('.custom-modal').style.overflow = 'auto';
            const gh = document.getElementById('guided-header');
            if(gh) gh.style.display = 'none';
            document.getElementById('custom-modal-overlay').style.display = 'none';
            const iframeBox = document.getElementById('modal-iframe-box');
            if(iframeBox) iframeBox.innerHTML = ''; // Limpa os iframes para parar vídeos
        }

        function showAlert(msg) {
            document.getElementById('custom-alert-message').innerText = msg;
            const btnOk = document.getElementById('alert-btn-ok');
            const btnCancel = document.getElementById('alert-btn-cancel');
            
            btnCancel.style.display = 'none';
            btnOk.innerText = 'OK';
            btnOk.className = 'btn-approve';
            btnOk.onclick = closeAlert;
            
            document.getElementById('custom-alert-overlay').style.display = 'flex';
        }
        
        function showConfirm(msg, onConfirm) {
            document.getElementById('custom-alert-message').innerText = msg;
            const btnOk = document.getElementById('alert-btn-ok');
            const btnCancel = document.getElementById('alert-btn-cancel');
            
            btnCancel.style.display = 'inline-block';
            
            btnOk.innerText = 'Descartar (Fechar)';
            btnOk.className = 'btn-reject';
            btnOk.onclick = function() {
                closeAlert();
                if (onConfirm) onConfirm();
            };
            
            btnCancel.innerText = 'Manter (Não fechar)';
            btnCancel.className = 'btn-approve';
            btnCancel.onclick = closeAlert;
            
            document.getElementById('custom-alert-overlay').style.display = 'flex';
        }

        function closeAlert() {
            document.getElementById('custom-alert-overlay').style.display = 'none';
        }
        
        // Clicar fora do modal fecha ele (com checagem dupla)
        window.addEventListener('click', function(event) {
            const overlay = document.getElementById('custom-modal-overlay');
            if (event.target === overlay) {
                const comment = document.getElementById('modal-comment').value;
                if (comment.trim() !== '') {
                    showConfirm("Você escreveu um comentário, mas não salvou. Deseja descartar e fechar o card?", function() {
                        closeModal();
                    });
                } else {
                    closeModal();
                }
            }
        });

        async function handleAction(acao) {
            const comment = document.getElementById('modal-comment').value;
            const loader = document.getElementById('loading-overlay');
            
            if (acao === 'Pedir Ajuste' && !comment.trim()) {
                showAlert("Por favor, adicione um comentário explicando o ajuste necessário.");
                return;
            }

            loader.style.display = 'flex';

            try {
                // const response = await fetch...
                await new Promise(r => setTimeout(r, 500));
                const response = { ok: true };

                if (response.ok) {
                    const dbItem = window.mockDatabase.find(i => i.id == currentEventId);
                    const newStatus = acao === 'Pedir Ajuste' ? '🔄 EM ALTERAÇÃO' : '✅ APROVADO';
                    
                    if (dbItem) {
                        dbItem.status = newStatus;
                        dbItem.historico_alteracao = comment;
                    }

                    if (window.supabaseClient) {
                        await window.supabaseClient
                            .from('conteudos')
                            .update({ 
                                status_cliente: newStatus,
                                historico_alteracao: comment
                            })
                            .eq('id_ummense', String(currentEventId));
                    }
                    try {
                        if (typeof window.renderGridCriativos === 'function') {
                            window.renderGridCriativos();
                            window.updateDashboardCustom();
                        }
                    } catch (renderErr) {
                        console.error("Erro no Optimistic UI (Criativos):", renderErr);
                        showAlert("Erro ao atualizar a tela. Por favor, recarregue a página.");
                    }
                    
                    showAlert(`Ação "${acao}" enviada com sucesso!`);
                    
                    if (typeof isGuidedMode !== 'undefined' && isGuidedMode) {
                        setTimeout(() => openGuidedItem(window.currentGuidedIndex + 1), 300);
                    } else {
                        closeModal();
                    }
                } else {
                    showAlert("Erro ao enviar dados. Tente novamente.");
                }
            } catch (err) {
                console.error("Erro webhook:", err);
                showAlert("Erro de conexão com o servidor.");
            } finally {
                loader.style.display = 'none';
            }
        }
        
        // Fim da lógica do webhook
    