// Bloco de código para aplicar o tema e fonte imediatamente ao carregar a página.
(function() {
    const savedMode = localStorage.getItem('appMode') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : '');
    const savedFontSize = localStorage.getItem('appFontSize') || 'font-base';
    const savedTheme = localStorage.getItem('appTheme') || 'theme-teal';
    // Aplicar classes de tema e fonte ao carregar
    const docElement = document.documentElement;
    docElement.className = ''; // Limpa classes antigas para evitar conflitos
    docElement.classList.add(savedMode, savedFontSize, savedTheme);
})();


document.addEventListener('DOMContentLoaded', () => {
    // === FUNÇÕES GLOBAIS DE BANCO DE DADOS (localStorage) ===
    const getFromDB = (key) => {
        const data = localStorage.getItem(key);
        if (!data) return key.includes('schedule') ? {} : [];
        try { return JSON.parse(data); } catch (e) { return key.includes('schedule') ? {} : []; }
    };
    const saveToDB = (key, data) => localStorage.setItem(key, JSON.stringify(data));
    const getPatientById = (id) => getFromDB('patientsDB_marcella').find(p => p.id === parseInt(id));

    // === FUNÇÕES HELPER GLOBAIS ===
    const getInitials = (name) => (name || '').trim().split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const stringToHslColor = (str, s, l) => { let h = 0; for (let i = 0; i < (str || '').length; i++) h = str.charCodeAt(i) + ((h << 5) - h); return `hsl(${h % 360}, ${s}%, ${l}%)`; };
    const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Não informado';
    const downloadFile = (content, fileName, type) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = fileName;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    // === SISTEMA DE NOTIFICAÇÃO (TOAST) ===
    const showToast = (message, type = 'success') => {
        const container = document.getElementById('toast-container'); if (!container) return;
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-[var(--primary)]' : 'bg-red-500';
        toast.className = `toast-notification ${bgColor} text-white font-semibold py-3 px-5 rounded-lg shadow-xl`;
        toast.style.animation = 'toast-in 0.5s ease-out forwards';
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'toast-out 0.5s ease-in forwards';
            toast.addEventListener('animationend', () => toast.remove());
        }, 2000); // Tempo da notificação reduzido para 2 segundos
    };
    const toastMessage = sessionStorage.getItem('toastMessage');
    if (toastMessage) { showToast(toastMessage); sessionStorage.removeItem('toastMessage'); }

    // === LÓGICA DE NAVEGAÇÃO ATIVA ===
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('text-[var(--primary)]');
            link.classList.remove('text-[var(--secondary-text)]');
        }
    });

    // === LÓGICA DE TEMAS ===
    const themes = {
        'theme-teal': { name: 'Padrão (Verde)', colors: { '--primary-bg': '#f0fdfa', '--secondary-bg': '#ffffff', '--primary-text': '#0f766e', '--secondary-text': '#115e59', '--border-color': '#ccfbf1', '--primary': '#14b8a6', '--primary-light': '#ccfbf1', '--primary-dark': '#0f766e', '--gradient-1': '#a7f3d0', '--gradient-2': '#bae6fd', '--gradient-3': '#ddd6fe', '--gradient-4': '#fbcfe8' } },
        'theme-rose': { name: 'Rosa', colors: { '--primary-bg': '#fff1f2', '--secondary-bg': '#ffffff', '--primary-text': '#9f1239', '--secondary-text': '#881337', '--border-color': '#ffe4e6', '--primary': '#f43f5e', '--primary-light': '#ffe4e6', '--primary-dark': '#be123c', '--gradient-1': '#fecdd3', '--gradient-2': '#fbcfe8', '--gradient-3': '#f5d0fe', '--gradient-4': '#e9d5ff' } },
        'theme-sky': { name: 'Azul', colors: { '--primary-bg': '#f0f9ff', '--secondary-bg': '#ffffff', '--primary-text': '#0369a1', '--secondary-text': '#075985', '--border-color': '#e0f2fe', '--primary': '#0ea5e9', '--primary-light': '#e0f2fe', '--primary-dark': '#0369a1', '--gradient-1': '#bae6fd', '--gradient-2': '#c7d2fe', '--gradient-3': '#d1d5db', '--gradient-4': '#e0e7ff' } },
        'theme-amber': { name: 'Âmbar', colors: { '--primary-bg': '#fffbeb', '--secondary-bg': '#ffffff', '--primary-text': '#b45309', '--secondary-text': '#92400e', '--border-color': '#fef3c7', '--primary': '#f59e0b', '--primary-light': '#fef3c7', '--primary-dark': '#b45309', '--gradient-1': '#fde68a', '--gradient-2': '#fed7aa', '--gradient-3': '#fecaca', '--gradient-4': '#fce7f3' } },
        'theme-violet': { name: 'Violeta', colors: { '--primary-bg': '#f5f3ff', '--secondary-bg': '#ffffff', '--primary-text': '#6d28d9', '--secondary-text': '#5b21b6', '--border-color': '#ede9fe', '--primary': '#8b5cf6', '--primary-light': '#ede9fe', '--primary-dark': '#6d28d9', '--gradient-1': '#d8b4fe', '--gradient-2': '#c4b5fd', '--gradient-3': '#a5b4fc', '--gradient-4': '#93c5fd' } },
    };
    
    const applyTheme = (themeName) => {
        const theme = themes[themeName];
        if (!theme) return;
        
        const docElement = document.documentElement;
        // Remove temas antigos
        Object.keys(themes).forEach(t => docElement.classList.remove(t));
        // Adiciona tema novo
        docElement.classList.add(themeName);

        // Define as variáveis CSS
        Object.keys(theme.colors).forEach(key => {
            docElement.style.setProperty(key, theme.colors[key]);
        });
        
        localStorage.setItem('appTheme', themeName);

        // Atualiza a seleção visual
        document.querySelectorAll('.theme-dot').forEach(dot => {
            dot.classList.toggle('selected', dot.dataset.theme === themeName);
        });
    };
    
    // Roda no carregamento de qualquer página para aplicar o tema salvo
    applyTheme(localStorage.getItem('appTheme') || 'theme-teal');


    // === ROTEADOR DE PÁGINA ===
    const pageId = document.querySelector('main')?.id;

    // --- PÁGINA INICIAL ---
    if (pageId === 'index-page') {
        const settingsModal = document.getElementById('settings-modal');
        let clientsHidden = localStorage.getItem('clientsHidden') === 'true';

        const openModal = () => { settingsModal.classList.remove('hidden'); };
        const closeModal = () => { settingsModal.classList.add('hidden'); };

        document.getElementById('main-settings-btn')?.addEventListener('click', openModal);
        document.getElementById('close-settings-btn')?.addEventListener('click', closeModal);
        settingsModal?.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(); });

        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const applyMode = (isDark) => { document.documentElement.classList.toggle('dark', isDark); localStorage.setItem('appMode', isDark ? 'dark' : ''); };
        if(darkModeToggle) {
            darkModeToggle.checked = document.documentElement.classList.contains('dark');
            darkModeToggle.addEventListener('change', () => applyMode(darkModeToggle.checked));
        }
        
        const fontSizeBtns = document.querySelectorAll('.font-size-btn');
        const applyFontSize = (size) => {
            ['font-sm', 'font-base', 'font-lg'].forEach(s => document.documentElement.classList.remove(s));
            document.documentElement.classList.add(size);
            localStorage.setItem('appFontSize', size);
            fontSizeBtns.forEach(btn => btn.classList.toggle('bg-[var(--primary)]', btn.dataset.size === size));
            fontSizeBtns.forEach(btn => btn.classList.toggle('text-white', btn.dataset.size === size));
        };
        applyFontSize(localStorage.getItem('appFontSize') || 'font-base');
        fontSizeBtns.forEach(btn => btn.addEventListener('click', () => applyFontSize(btn.dataset.size)));

        const themeSelector = document.getElementById('theme-selector');
        if (themeSelector) {
            Object.keys(themes).forEach(themeKey => {
                const dot = document.createElement('div');
                dot.className = 'theme-dot';
                dot.dataset.theme = themeKey;
                dot.style.background = themes[themeKey].colors['--primary'];
                dot.title = themes[themeKey].name;
                dot.addEventListener('click', () => applyTheme(themeKey));
                themeSelector.appendChild(dot);
            });
            applyTheme(localStorage.getItem('appTheme') || 'theme-teal');
        }

        document.getElementById('export-json-btn')?.addEventListener('click', () => {
            const data = { patients: getFromDB('patientsDB_marcella'), notes: getFromDB('notesDB_marcella'), schedule: getFromDB('scheduleDB_marcella') };
            downloadFile(JSON.stringify(data, null, 2), `backup_completo_app_to_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
            showToast('Backup completo exportado!');
        });

        const importFileInput = document.getElementById('import-file-input');
        document.getElementById('import-json-btn')?.addEventListener('click', () => importFileInput.click());
        importFileInput?.addEventListener('change', (event) => {
            const file = event.target.files[0]; if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.patients && data.notes && data.schedule) {
                        if (confirm("Isto irá substituir TODOS os dados atuais. Deseja continuar?")) {
                            saveToDB('patientsDB_marcella', data.patients);
                            saveToDB('notesDB_marcella', data.notes);
                            saveToDB('scheduleDB_marcella', data.schedule);
                            sessionStorage.setItem('toastMessage', 'Backup restaurado! A página será recarregada.');
                            location.reload();
                        }
                    } else { showToast('Arquivo de backup inválido.', 'error'); }
                } catch { showToast('Erro ao ler o arquivo.', 'error'); }
            };
            reader.readAsText(file);
        });
        
        document.getElementById('clear-cache-btn')?.addEventListener('click', async () => {
            if (confirm('Isso limpará o cache do aplicativo e recarregará a página. É útil para forçar atualizações. Deseja continuar?')) {
                try {
                    if ('serviceWorker' in navigator) {
                        const registrations = await navigator.serviceWorker.getRegistrations();
                        for (let registration of registrations) { await registration.unregister(); }
                    }
                    if (window.caches) {
                        const keys = await window.caches.keys();
                        await Promise.all(keys.map(key => window.caches.delete(key)));
                    }
                    sessionStorage.setItem('toastMessage', 'Cache limpo! O aplicativo será recarregado.');
                    window.location.reload(true);
                } catch (error) { showToast('Erro ao limpar o cache.', 'error'); }
            }
        });

        let deferredPrompt;
        const installButton = document.getElementById('install-app-btn');
        window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (installButton) installButton.style.display = 'flex'; });
        installButton?.addEventListener('click', async () => { if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; installButton.style.display = 'none'; } });
        
        const patientListEl = document.getElementById('patient-list');
        const searchInput = document.getElementById('search-patient');
        const toggleBtn = document.getElementById('toggle-visibility-btn');

        const eyeOpenSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/></svg>`;
        const eyeClosedSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z"/><path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z"/></svg>`;

        const updateToggleButton = () => {
            toggleBtn.innerHTML = clientsHidden ? eyeClosedSVG : eyeOpenSVG;
            toggleBtn.title = clientsHidden ? 'Mostrar clientes' : 'Ocultar clientes';
        };

        const renderPatients = () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            updateToggleButton();

            if (clientsHidden && !searchTerm) {
                patientListEl.innerHTML = '<div class="dynamic-card p-6 rounded-xl shadow-md text-center text-[var(--secondary-text)]">A lista de clientes está oculta. Use a busca para encontrar um cliente.</div>';
                return;
            }

            const allPatients = getFromDB('patientsDB_marcella').sort((a, b) => b.id - a.id); // Ordena por mais recente
            const patientsToRender = searchTerm ? allPatients.filter(p => p.name.toLowerCase().includes(searchTerm)) : allPatients;
            
            patientListEl.innerHTML = '';
            if (patientsToRender.length === 0) {
                patientListEl.innerHTML = `<div class="dynamic-card p-6 rounded-xl shadow-md text-center">${searchTerm ? 'Nenhum cliente encontrado para "' + searchInput.value + '".' : 'Nenhum cliente cadastrado.'}</div>`;
                return;
            }

            patientsToRender.forEach((patient, index) => {
                const card = document.createElement('a');
                card.href = `patient-details.html?id=${patient.id}`;
                card.className = 'dynamic-card block p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 animate-item-fade-in-up';
                card.style.animationDelay = `${index * 50}ms`;
                const profilePicStyle = patient.profilePicture ? `background-image: url(${patient.profilePicture})` : `background-color: ${stringToHslColor(patient.name, 50, 60)}`;
                const profilePicContent = patient.profilePicture ? '' : getInitials(patient.name);
                
                let scheduleText = '';
                if (patient.fixedSchedule && patient.fixedSchedule.days.length > 0 && patient.fixedSchedule.time) {
                    const dayNames = { seg: 'Seg', ter: 'Ter', qua: 'Qua', qui: 'Qui', sex: 'Sex' };
                    scheduleText = patient.fixedSchedule.days.map(d => dayNames[d]).join(', ') + ` às ${patient.fixedSchedule.time}`;
                }

                card.innerHTML = `<div class="flex items-center gap-4"><div class="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-cover bg-center" style="${profilePicStyle}">${profilePicContent}</div><div><h3 class="text-xl font-bold text-[var(--primary-dark)]">${patient.name}</h3><p class="text-sm text-[var(--secondary-text)] truncate">${scheduleText || patient.diagnostico || 'Sem informações'}</p></div></div>`;
                patientListEl.appendChild(card);
            });
        };

        toggleBtn.addEventListener('click', () => {
            clientsHidden = !clientsHidden;
            localStorage.setItem('clientsHidden', clientsHidden);
            renderPatients();
        });

        searchInput?.addEventListener('input', renderPatients);
        renderPatients();
    }
    
    // --- PÁGINA DE ADICIONAR CLIENTE ---
    if (pageId === 'add-patient-page') {
        const dobInput = document.getElementById('dob');
        const ageInput = document.getElementById('age');
        dobInput?.addEventListener('input', () => {
            if (!dobInput.value) { ageInput.value = ''; return; }
            const birthDate = new Date(dobInput.value); const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            ageInput.value = age >= 0 ? age : '';
        });

        document.getElementById('add-patient-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('name');
            if (!nameInput.value.trim()) { showToast('O nome do cliente é obrigatório.', 'error'); return; }
            
            const fixedDays = Array.from(document.querySelectorAll('input[name="fixed-day"]:checked')).map(cb => cb.value);
            const fixedTime = document.getElementById('fixed-time').value;

            const newPatient = { 
                id: Date.now(), 
                name: nameInput.value.trim(), 
                dob: document.getElementById('dob').value, 
                age: document.getElementById('age').value, 
                phone: document.getElementById('phone').value,
                familyPhone: document.getElementById('family-phone').value,
                address: document.getElementById('address').value.trim(), 
                diagnostico: document.getElementById('diagnostico').value.trim(),
                objetivos: document.getElementById('objetivos').value.trim(),
                intervencao: document.getElementById('intervencao').value.trim(),
                sessions: [], 
                externalLink: "",
                profilePicture: "",
                fixedSchedule: {
                    days: fixedDays,
                    time: fixedTime
                }
            };
            let patients = getFromDB('patientsDB_marcella');
            patients.push(newPatient);
            saveToDB('patientsDB_marcella', patients);
            sessionStorage.setItem('toastMessage', 'Cliente salvo com sucesso!');
            window.location.href = 'index.html';
        });
    }

    // --- PÁGINA DE DETALHES DO CLIENTE ---
    if (pageId === 'patient-details-page') {
        const urlParams = new URLSearchParams(window.location.search);
        const patientId = parseInt(urlParams.get('id'));
        let patient = getPatientById(patientId);
        if (!patient) { document.body.innerHTML = 'Cliente não encontrado.'; return; }
        
        const updatePatientData = (p) => { 
            let ps = getFromDB('patientsDB_marcella'); 
            const i = ps.findIndex(x => x.id === p.id); 
            if (i > -1) { 
                ps[i] = p; 
                saveToDB('patientsDB_marcella', ps); 
                patient = p; 
            } 
        };
        
        const renderAllPatientData = () => {
            document.getElementById('patient-name').textContent = patient.name;
            document.title = patient.name;

            document.getElementById('patient-details-container').innerHTML = `
                <p><strong>Data de Nascimento:</strong> ${formatDate(patient.dob)}</p>
                <p><strong>Idade:</strong> ${patient.age ? patient.age + ' anos' : 'Não informado'}</p>
                <p><strong>Telefone:</strong> ${patient.phone || 'Não informado'}</p>
                <p><strong>Contato Familiar:</strong> ${patient.familyPhone || 'Não informado'}</p>
                <p class="sm:col-span-2"><strong>Endereço:</strong> ${patient.address || 'Não informado'}</p>
            `;

            document.getElementById('clinical-info-container').innerHTML = `
                <div class="border-t border-[var(--border-color)] pt-4">
                    <h3 class="font-semibold text-[var(--primary-text)]">Diagnóstico</h3>
                    <p class="mt-2 whitespace-pre-wrap text-[var(--secondary-text)]">${patient.diagnostico || 'Não informado'}</p>
                </div>
                <div class="border-t border-[var(--border-color)] pt-4 mt-4">
                    <h3 class="font-semibold text-[var(--primary-text)]">Objetivos</h3>
                    <p class="mt-2 whitespace-pre-wrap text-[var(--secondary-text)]">${patient.objetivos || 'Não informado'}</p>
                </div>
                <div class="border-t border-[var(--border-color)] pt-4 mt-4">
                    <h3 class="font-semibold text-[var(--primary-text)]">Intervenção/Abordagem</h3>
                    <p class="mt-2 whitespace-pre-wrap text-[var(--secondary-text)]">${patient.intervencao || 'Não informado'}</p>
                </div>
            `;
            renderProfilePicture();
        };

        const profilePicDisplay = document.getElementById('profile-picture-display');
        const profilePicInput = document.getElementById('profile-picture-input');
        const renderProfilePicture = () => {
            if (patient.profilePicture) {
                profilePicDisplay.style.backgroundImage = `url(${patient.profilePicture})`;
                profilePicDisplay.textContent = '';
            } else {
                profilePicDisplay.style.backgroundImage = '';
                profilePicDisplay.style.backgroundColor = stringToHslColor(patient.name, 50, 60);
                profilePicDisplay.textContent = getInitials(patient.name);
            }
        };
        profilePicInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    patient.profilePicture = event.target.result;
                    updatePatientData(patient);
                    renderProfilePicture();
                    showToast('Foto de perfil atualizada!');
                };
                reader.readAsDataURL(file);
            }
        });

        const linkForm = document.getElementById('link-form');
        const externalLinkInput = document.getElementById('external-link-input');
        const openLinkBtn = document.getElementById('open-link-btn');
        const renderLink = () => { externalLinkInput.value = patient.externalLink || ''; openLinkBtn.disabled = !patient.externalLink; };
        linkForm?.addEventListener('submit', (e) => { e.preventDefault(); patient.externalLink = externalLinkInput.value.trim(); updatePatientData(patient); renderLink(); showToast('Link salvo!'); });
        openLinkBtn?.addEventListener('click', () => { if (!openLinkBtn.disabled) { let url = patient.externalLink; if (!/^https?:\/\//i.test(url)) url = 'https://' + url; window.open(url, '_blank', 'noopener,noreferrer'); }});
        renderLink();

        document.getElementById('session-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const noteTextarea = document.getElementById('anotacao');
            if (noteTextarea.value.trim()) {
                if (!patient.sessions) patient.sessions = [];
                patient.sessions.push({ id: Date.now(), note: noteTextarea.value.trim() });
                updatePatientData(patient);
                renderSessions();
                noteTextarea.value = '';
                showToast('Sessão registrada!');
            }
        });
        
        const renderSessions = () => {
            const sessionList = document.getElementById('session-list');
            sessionList.innerHTML = '';
            if (!patient.sessions || patient.sessions.length === 0) { sessionList.innerHTML = '<p class="text-center text-[var(--secondary-text)]">Nenhuma sessão registrada.</p>'; return; }
            patient.sessions.slice().reverse().forEach((session, index) => {
                const card = document.createElement('div');
                card.className = 'session-card relative dynamic-card p-4 rounded-lg mt-4 animate-item-fade-in-up';
                card.style.animationDelay = `${index * 50}ms`;
                card.innerHTML = `<div class="flex justify-between items-start"><p class="text-sm font-semibold text-[var(--primary)]">${new Date(session.id).toLocaleString('pt-BR')}</p><button data-session-id="${session.id}" class="delete-session-btn text-gray-400 hover:text-red-500 opacity-0 transition-opacity"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button></div><p class="mt-2 whitespace-pre-wrap text-[var(--primary-dark)]">${session.note}</p>`;
                sessionList.appendChild(card);
            });
        };
        document.getElementById('session-list').addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-session-btn');
            if (deleteBtn && confirm('Deseja excluir esta anotação de sessão?')) {
                patient.sessions = patient.sessions.filter(s => s.id !== parseInt(deleteBtn.dataset.sessionId));
                updatePatientData(patient);
                renderSessions();
                showToast('Sessão excluída.');
            }
        });

        const optionsBtn = document.getElementById('patient-options-btn');
        const optionsMenu = document.getElementById('patient-options-menu');
        optionsBtn?.addEventListener('click', (e) => { e.stopPropagation(); optionsMenu.classList.toggle('hidden'); });
        document.addEventListener('click', () => optionsMenu.classList.add('hidden'));

        document.getElementById('export-pdf-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            const element = document.getElementById('pdf-export-area');
            const optionsContainer = document.getElementById('patient-options-container');
            
            optionsContainer.style.visibility = 'hidden';

            const opt = {
                margin:       0.5,
                filename:     `relatorio_${patient.name.replace(/\s/g,'_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            
            html2pdf().from(element).set(opt).save().then(() => {
                optionsContainer.style.visibility = 'visible';
            });
            showToast('Relatório PDF gerado!');
        });
        
        document.getElementById('export-txt-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            let content = `RELATÓRIO DO CLIENTE\n\n`;
            content += `Nome: ${patient.name || 'Não informado'}\n`;
            content += `Data de Nascimento: ${formatDate(patient.dob)}\n`;
            content += `Idade: ${patient.age ? patient.age + ' anos' : 'Não informado'}\n`;
            content += `Telefone: ${patient.phone || 'Não informado'}\n`;
            content += `Contato Familiar: ${patient.familyPhone || 'Não informado'}\n`;
            content += `Endereço: ${patient.address || 'Não informado'}\n\n`;
            content += `--- DIAGNÓSTICO ---\n${patient.diagnostico || 'Não informado'}\n\n`;
            content += `--- OBJETIVOS ---\n${patient.objetivos || 'Não informado'}\n\n`;
            content += `--- INTERVENÇÃO/ABORDAGEM ---\n${patient.intervencao || 'Não informado'}\n\n`;
            content += `--- HISTÓRICO DE SESSÕES ---\n\n`;
            if (patient.sessions && patient.sessions.length > 0) {
                patient.sessions.slice().reverse().forEach(s => { 
                    content += `Data: ${new Date(s.id).toLocaleString('pt-BR')}\nAnotação: ${s.note}\n\n`; 
                });
            } else {
                content += `Nenhuma sessão registrada.\n`;
            }
            downloadFile(content, `relatorio_${patient.name.replace(/\s/g,'_')}.txt`, 'text/plain');
            showToast('Relatório .txt gerado!');
        });


        document.getElementById('delete-patient-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm(`ATENÇÃO! Deseja excluir o cliente "${patient.name}"? Esta ação não pode ser desfeita.`)) {
                let patients = getFromDB('patientsDB_marcella');
                saveToDB('patientsDB_marcella', patients.filter(p => p.id !== patientId));
                sessionStorage.setItem('toastMessage', 'Cliente excluído com sucesso.');
                window.location.href = 'index.html';
            }
        });

        // Lógica de Edição
        const editModal = document.getElementById('edit-patient-modal');
        const openEditModalBtn = document.getElementById('edit-patient-btn');
        const closeEditModalBtn = document.getElementById('cancel-edit-btn');
        const editForm = document.getElementById('edit-patient-form');

        const openEditModal = () => {
            document.getElementById('edit-name').value = patient.name || '';
            document.getElementById('edit-dob').value = patient.dob || '';
            document.getElementById('edit-age').value = patient.age || '';
            document.getElementById('edit-phone').value = patient.phone || '';
            document.getElementById('edit-family-phone').value = patient.familyPhone || '';
            document.getElementById('edit-address').value = patient.address || '';
            document.getElementById('edit-diagnostico').value = patient.diagnostico || '';
            document.getElementById('edit-objetivos').value = patient.objetivos || '';
            document.getElementById('edit-intervencao').value = patient.intervencao || '';
            editModal.classList.remove('hidden');
        };

        const closeEditModal = () => {
            editModal.classList.add('hidden');
        };
        
        document.getElementById('edit-dob').addEventListener('input', (e) => {
            const ageInput = document.getElementById('edit-age');
            if (!e.target.value) { ageInput.value = ''; return; }
            const birthDate = new Date(e.target.value); const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
            ageInput.value = age >= 0 ? age : '';
        });

        openEditModalBtn.addEventListener('click', (e) => { e.preventDefault(); openEditModal(); });
        closeEditModalBtn.addEventListener('click', closeEditModal);

        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const updatedPatient = {
                ...patient,
                name: document.getElementById('edit-name').value.trim(),
                dob: document.getElementById('edit-dob').value,
                age: document.getElementById('edit-age').value,
                phone: document.getElementById('edit-phone').value,
                familyPhone: document.getElementById('edit-family-phone').value,
                address: document.getElementById('edit-address').value.trim(),
                diagnostico: document.getElementById('edit-diagnostico').value.trim(),
                objetivos: document.getElementById('edit-objetivos').value.trim(),
                intervencao: document.getElementById('edit-intervencao').value.trim(),
            };
            updatePatientData(updatedPatient);
            renderAllPatientData();
            closeEditModal();
            showToast('Dados atualizados!');
        });
        
        renderAllPatientData();
        renderSessions();
    }

    // --- PÁGINA DE ANOTAÇÕES ---
    if (pageId === 'notes-page') {
        // ... (código da página de anotações permanece o mesmo)
    }

    // --- PÁGINA DE HORÁRIOS ---
    if (pageId === 'schedule-page') {
       // ... (código da página de horários permanece o mesmo)
    }
});

