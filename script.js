// Bloco de código para aplicar o tema e fonte imediatamente ao carregar a página.
(function() {
    const savedMode = localStorage.getItem('appMode') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : '');
    const savedFontSize = localStorage.getItem('appFontSize') || 'font-base';
    document.documentElement.className = `${savedMode} ${savedFontSize}`;
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
        const bgColor = type === 'success' ? 'bg-teal-500' : 'bg-red-500';
        toast.className = `toast-notification ${bgColor} text-white font-semibold py-3 px-5 rounded-lg shadow-xl in`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.replace('in', 'out');
            toast.addEventListener('animationend', () => toast.remove());
        }, 3000);
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

    // === ROTEADOR DE PÁGINA ===
    const pageId = document.querySelector('main')?.id;

    // --- PÁGINA INICIAL ---
    if (pageId === 'index-page') {
        const settingsModal = document.getElementById('settings-modal');
        const modalContent = settingsModal.querySelector('.modal-content');

        const openModal = () => { settingsModal.classList.remove('hidden'); modalContent.classList.add('in'); };
        const closeModal = () => { modalContent.classList.remove('in'); modalContent.classList.add('out'); setTimeout(() => { settingsModal.classList.add('hidden'); modalContent.classList.remove('out'); }, 400); };

        document.getElementById('main-settings-btn')?.addEventListener('click', openModal);
        document.getElementById('close-settings-btn')?.addEventListener('click', closeModal);
        settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(); });

        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const applyMode = (isDark) => { document.documentElement.classList.toggle('dark', isDark); localStorage.setItem('appMode', isDark ? 'dark' : ''); };
        darkModeToggle.checked = document.documentElement.classList.contains('dark');
        darkModeToggle.addEventListener('change', () => applyMode(darkModeToggle.checked));
        
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

        document.getElementById('export-json-btn')?.addEventListener('click', () => {
            const data = { patients: getFromDB('patientsDB_marcella'), notes: getFromDB('notesDB_marcella'), schedule: getFromDB('scheduleDB_marcella') };
            downloadFile(JSON.stringify(data, null, 2), `backup_completo_app_to_${new Date().toISOString().slice(0,10)}.json`, 'application/json');
            showToast('Backup completo exportado!');
        });

        const importFileInput = document.getElementById('import-file-input');
        document.getElementById('import-json-btn')?.addEventListener('click', () => importFileInput.click());
        importFileInput.addEventListener('change', (event) => {
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

        let deferredPrompt;
        const installButton = document.getElementById('install-app-btn');
        window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; if (installButton) installButton.style.display = 'flex'; });
        installButton?.addEventListener('click', async () => { if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; installButton.style.display = 'none'; } });
        
        const patientListEl = document.getElementById('patient-list');
        const searchInput = document.getElementById('search-patient');
        const renderPatients = () => {
            const allPatients = getFromDB('patientsDB_marcella').sort((a, b) => a.name.localeCompare(b.name));
            const searchTerm = searchInput.value.toLowerCase();
            const patientsToRender = allPatients.filter(p => p.name.toLowerCase().includes(searchTerm));
            patientListEl.innerHTML = '';
            if (patientsToRender.length === 0) { patientListEl.innerHTML = '<div class="dynamic-card p-6 rounded-xl shadow-md text-center">Nenhum cliente encontrado.</div>'; return; }
            patientsToRender.forEach((patient, index) => {
                const card = document.createElement('a');
                card.href = `patient-details.html?id=${patient.id}`;
                card.className = 'dynamic-card block p-4 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-1 animate-item-fade-in-up';
                card.style.animationDelay = `${index * 50}ms`;
                const profilePicStyle = patient.profilePicture ? `background-image: url(${patient.profilePicture})` : `background-color: ${stringToHslColor(patient.name, 50, 60)}`;
                const profilePicContent = patient.profilePicture ? '' : getInitials(patient.name);
                card.innerHTML = `<div class="flex items-center gap-4"><div class="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-cover bg-center" style="${profilePicStyle}">${profilePicContent}</div><div><h3 class="text-xl font-bold text-[var(--primary-dark)]">${patient.name}</h3><p class="text-[var(--secondary-text)] truncate">${patient.diagnostico || 'Sem diagnóstico'}</p></div></div>`;
                patientListEl.appendChild(card);
            });
        };
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
                profilePicture: ""
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
        
        const updatePatientData = (p) => { let ps = getFromDB('patientsDB_marcella'); const i = ps.findIndex(x => x.id === p.id); if (i > -1) { ps[i] = p; saveToDB('patientsDB_marcella', ps); patient = p; } };
        
        document.getElementById('patient-name').textContent = patient.name; document.title = patient.name;
        
        document.getElementById('patient-details-container').innerHTML = `<p><strong>Idade:</strong> ${patient.age || 'N/A'} anos</p><p><strong>Telefone:</strong> ${patient.phone || 'Não informado'}</p>`;
        document.getElementById('diagnostico-container').innerHTML = `<h3 class="font-semibold text-[var(--primary-text)]">Diagnóstico</h3><p class="mt-2 whitespace-pre-wrap">${patient.diagnostico || 'Não informado'}</p>`;
        document.getElementById('objetivos-container').innerHTML = `<h3 class="font-semibold text-[var(--primary-text)]">Objetivos</h3><p class="mt-2 whitespace-pre-wrap">${patient.objetivos || 'Não informado'}</p>`;
        document.getElementById('intervencao-container').innerHTML = `<h3 class="font-semibold text-[var(--primary-text)]">Intervenção/Abordagem</h3><p class="mt-2 whitespace-pre-wrap">${patient.intervencao || 'Não informado'}</p>`;

        const familyPhoneContainer = document.getElementById('family-phone-container');
        const renderFamilyPhone = () => {
            familyPhoneContainer.innerHTML = `
                <div class="flex justify-between items-center">
                    <p><strong>Contato Familiar:</strong> <span id="family-phone-text">${patient.familyPhone || 'Não informado'}</span></p>
                    <button id="edit-family-phone-btn" class="text-[var(--primary)] text-sm font-semibold">Editar</button>
                </div>`;
            document.getElementById('edit-family-phone-btn').addEventListener('click', showFamilyPhoneInput);
        };
        const showFamilyPhoneInput = () => {
            familyPhoneContainer.innerHTML = `
                <div class="flex items-center gap-2">
                    <input type="tel" id="family-phone-input" class="flex-grow px-2 py-1 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-md" value="${patient.familyPhone || ''}" placeholder="Telefone do familiar">
                    <button id="save-family-phone-btn" class="bg-[var(--primary)] text-white px-3 py-1 rounded-md text-sm">Salvar</button>
                </div>`;
            document.getElementById('save-family-phone-btn').addEventListener('click', () => {
                patient.familyPhone = document.getElementById('family-phone-input').value;
                updatePatientData(patient);
                renderFamilyPhone();
                showToast('Contato familiar atualizado!');
            });
        };
        renderFamilyPhone();
        
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
        renderProfilePicture();

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
                showToast('Sessão registrada com sucesso!');
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
        renderSessions();

        const optionsBtn = document.getElementById('patient-options-btn');
        const optionsMenu = document.getElementById('patient-options-menu');
        optionsBtn?.addEventListener('click', (e) => { e.stopPropagation(); optionsMenu.classList.toggle('hidden'); });
        document.addEventListener('click', () => optionsMenu.classList.add('hidden'));

        document.getElementById('export-pdf-btn')?.addEventListener('click', () => {
            const element = document.createElement('div');
            element.innerHTML = `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h1>Relatório do Cliente</h1>
                    <p><strong>Nome:</strong> ${patient.name}</p>
                    <p><strong>Data de Nascimento:</strong> ${formatDate(patient.dob)} (${patient.age} anos)</p>
                    <p><strong>Telefone:</strong> ${patient.phone}</p>
                    <p><strong>Contato Familiar:</strong> ${patient.familyPhone}</p>
                    <p><strong>Endereço:</strong> ${patient.address}</p>
                    <hr style="margin: 20px 0;">
                    <h3>Diagnóstico</h3>
                    <p>${patient.diagnostico.replace(/\n/g, '<br>')}</p>
                    <h3>Objetivos</h3>
                    <p>${patient.objetivos.replace(/\n/g, '<br>')}</p>
                    <h3>Intervenção/Abordagem</h3>
                    <p>${patient.intervencao.replace(/\n/g, '<br>')}</p>
                    <hr style="margin: 20px 0;">
                    <h3>Histórico de Sessões</h3>
                    ${patient.sessions.map(s => `
                        <div>
                            <p><strong>Data:</strong> ${new Date(s.id).toLocaleString('pt-BR')}</p>
                            <p>${s.note.replace(/\n/g, '<br>')}</p>
                            <br>
                        </div>
                    `).join('')}
                </div>
            `;
            const opt = {
                margin:       1,
                filename:     `relatorio_${patient.name.replace(/\s/g,'_')}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            html2pdf().from(element).set(opt).save();
            showToast('Relatório .pdf gerado!');
        });

        document.getElementById('export-txt-btn')?.addEventListener('click', () => {
            let content = `RELATÓRIO DO CLIENTE\n\n`;
            content += `Nome: ${patient.name}\nData de Nascimento: ${formatDate(patient.dob)} (${patient.age} anos)\nTelefone: ${patient.phone}\nContato Familiar: ${patient.familyPhone}\nEndereço: ${patient.address}\n\n`;
            content += `--- DIAGNÓSTICO ---\n${patient.diagnostico}\n\n`;
            content += `--- OBJETIVOS ---\n${patient.objetivos}\n\n`;
            content += `--- INTERVENÇÃO/ABORDAGEM ---\n${patient.intervencao}\n\n`;
            content += `--- HISTÓRICO DE SESSÕES ---\n\n`;
            patient.sessions.forEach(s => { content += `Data: ${new Date(s.id).toLocaleString('pt-BR')}\nAnotação: ${s.note}\n\n`; });
            downloadFile(content, `relatorio_${patient.name.replace(/\s/g,'_')}.txt`, 'text/plain');
            showToast('Relatório .txt gerado!');
        });
        
        document.getElementById('export-single-json-btn')?.addEventListener('click', () => {
            downloadFile(JSON.stringify(patient, null, 2), `backup_${patient.name.replace(/\s/g,'_')}.json`, 'application/json');
            showToast('Backup do cliente exportado!');
        });

        document.getElementById('delete-patient-btn')?.addEventListener('click', () => {
            if (confirm(`ATENÇÃO! Deseja excluir o cliente "${patient.name}"?`)) {
                let patients = getFromDB('patientsDB_marcella');
                saveToDB('patientsDB_marcella', patients.filter(p => p.id !== patientId));
                sessionStorage.setItem('toastMessage', 'Cliente excluído com sucesso.');
                window.location.href = 'index.html';
            }
        });
    }

    // --- PÁGINA DE ANOTAÇÕES ---
    if (pageId === 'notes-page') {
        const noteForm = document.getElementById('note-form');
        const notesList = document.getElementById('notes-list');
        const colorDots = document.querySelectorAll('#note-colors .color-dot');
        let selectedColor = { light: 'bg-amber-100', dark: 'bg-amber-900/50' };
        colorDots.forEach(dot => dot.addEventListener('click', () => { colorDots.forEach(d => d.classList.remove('selected')); dot.classList.add('selected'); selectedColor = { light: dot.dataset.colorLight, dark: dot.dataset.colorDark }; }));
        
        const renderNotes = () => {
            const notes = getFromDB('notesDB_marcella');
            notesList.innerHTML = '';
            if(notes.length === 0) { notesList.innerHTML = `<p class="sm:col-span-2 lg:col-span-3 text-center text-[var(--secondary-text)]">Nenhuma anotação encontrada.</p>`; return; }
            notes.slice().reverse().forEach((note, index) => {
                const noteCard = document.createElement('div');
                const darkClass = note.color.dark.replace('bg-','dark:');
                noteCard.className = `note-card relative p-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 animate-item-fade-in-up ${note.color.light} ${darkClass}`;
                noteCard.style.animationDelay = `${index * 50}ms`;
                noteCard.innerHTML = `<div class="flex justify-between items-start"><div class="flex-1"><h3 class="font-semibold text-gray-800 dark:text-gray-200">${note.title || ''}</h3><span class="text-xs font-medium px-2 py-0.5 rounded-full bg-white/70 dark:bg-black/30 text-[var(--primary-dark)] dark:text-[var(--primary-text)]">${note.category || 'Geral'}</span></div><button data-note-id="${note.id}" class="delete-btn text-gray-500 hover:text-red-500 opacity-0 transition-opacity"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></button></div><p class="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${note.content}</p><small class="block text-right text-gray-500 dark:text-gray-400 mt-2">${new Date(note.id).toLocaleDateString('pt-BR')}</small>`;
                notesList.appendChild(noteCard);
            });
        };
        noteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newNote = { id: Date.now(), title: document.getElementById('note-title').value.trim(), content: document.getElementById('note-content').value.trim(), category: document.getElementById('note-category').value.trim(), color: selectedColor };
            if (!newNote.content) { showToast("O conteúdo não pode estar vazio.", "error"); return; }
            let notes = getFromDB('notesDB_marcella');
            notes.push(newNote); saveToDB('notesDB_marcella', notes);
            renderNotes(); noteForm.reset();
            document.querySelector('#note-colors .color-dot').click();
            showToast("Anotação salva!");
        });
        notesList.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-btn');
            if(deleteBtn && confirm('Deseja excluir esta anotação?')) {
                let notes = getFromDB('notesDB_marcella');
                saveToDB('notesDB_marcella', notes.filter(n => n.id !== parseInt(deleteBtn.dataset.noteId)));
                renderNotes();
                showToast("Anotação excluída.");
            }
        });
        renderNotes();
    }

    // --- PÁGINA DE HORÁRIOS ---
    if (pageId === 'schedule-page') {
        const scheduleBody = document.getElementById('schedule-body');
        const modal = document.getElementById('patient-modal');
        const modalContentEl = modal.querySelector('.modal-content');
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        let selectedCellId = null;

        const openPatientModal = (cellId) => {
            selectedCellId = cellId;
            const appointment = getFromDB('scheduleDB_marcella')[cellId];
            const patients = getFromDB('patientsDB_marcella').sort((a, b) => a.name.localeCompare(b.name));
            modalTitle.textContent = appointment ? 'Alterar Agendamento' : 'Novo Agendamento';
            let optionsHtml = '<option value="">Selecione um cliente...</option>';
            patients.forEach(p => optionsHtml += `<option value="${p.id}" ${appointment && appointment.patientId === p.id ? 'selected' : ''}>${p.name}</option>`);
            const customTextValue = (appointment && !appointment.patientId) ? appointment.patientName : '';
            const removeButtonHtml = appointment ? '<button id="remove-schedule" class="btn-press bg-rose-100 text-rose-800 font-semibold py-2 px-4 rounded-lg hover:bg-rose-200">Remover</button>' : '';
            modalContent.innerHTML = `<div class="space-y-4"><label class="block text-sm font-medium">Cliente</label><select id="patient-select" class="w-full p-2 border border-[var(--border-color)] rounded-lg bg-[var(--secondary-bg)]">${optionsHtml}</select><div class="text-center text-sm text-gray-500">ou</div><label class="block text-sm font-medium">Outro Evento</label><input type="text" id="custom-text-input" class="w-full p-2 border border-[var(--border-color)] rounded-lg bg-[var(--secondary-bg)]" value="${customTextValue}" placeholder="Ex: Reunião, Almoço..."><div class="flex justify-between items-center mt-6"><div>${removeButtonHtml}</div><div class="flex gap-2"><button id="cancel-schedule" class="btn-press bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancelar</button><button id="save-schedule" class="btn-press bg-[var(--primary)] text-white font-semibold py-2 px-4 rounded-lg hover:opacity-95">Salvar</button></div></div></div>`;
            modal.classList.remove('hidden');
            modalContentEl.classList.add('in');
        };
        const closeModal = () => { modalContentEl.classList.remove('in'); modalContentEl.classList.add('out'); setTimeout(() => { modal.classList.add('hidden'); modalContentEl.classList.remove('out'); }, 400); selectedCellId = null; };
        
        scheduleBody.addEventListener('click', (e) => { 
            const gcalLink = e.target.closest('a');
            if (gcalLink) {
                // Link do Google Agenda, não faz nada para não abrir o modal
                return;
            }
            const cell = e.target.closest('td[data-id]'); 
            if (cell) openPatientModal(cell.dataset.id); 
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { closeModal(); return; }
            if (e.target.id === 'cancel-schedule') { closeModal(); }
            if (e.target.id === 'remove-schedule' && confirm("Deseja remover este agendamento?")) {
                const scheduleData = getFromDB('scheduleDB_marcella');
                delete scheduleData[selectedCellId];
                saveToDB('scheduleDB_marcella', scheduleData);
                renderSchedule(); closeModal();
                showToast("Agendamento removido.");
            }
            if (e.target.id === 'save-schedule') {
                const patientId = parseInt(document.getElementById('patient-select').value);
                const customText = document.getElementById('custom-text-input').value.trim();
                const scheduleData = getFromDB('scheduleDB_marcella');
                if (patientId) {
                    const patient = getPatientById(patientId);
                    scheduleData[selectedCellId] = { patientId: patient.id, patientName: patient.name, color: stringToHslColor(patient.name, 50, 60) };
                } else if (customText) {
                    scheduleData[selectedCellId] = { patientName: customText, color: '#64748b' };
                } else {
                    delete scheduleData[selectedCellId];
                }
                saveToDB('scheduleDB_marcella', scheduleData);
                renderSchedule(); closeModal();
                showToast("Agenda atualizada!");
            }
        });
        
        document.getElementById('clear-schedule-btn')?.addEventListener('click', () => { if (confirm('Deseja limpar TODA a agenda?')) { saveToDB('scheduleDB_marcella', {}); renderSchedule(); showToast("Agenda limpa."); } });
        document.getElementById('print-schedule-btn')?.addEventListener('click', () => window.print());
        document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);
        
        const renderSchedule = (searchTerm = '') => {
            const scheduleData = getFromDB('scheduleDB_marcella');
            const times = [];
            for (let h = 7; h <= 20; h++) { times.push(`${h.toString().padStart(2, '0')}:00`); if (h < 20) times.push(`${h.toString().padStart(2, '0')}:30`); }
            scheduleBody.innerHTML = '';
            times.forEach(time => {
                const row = document.createElement('tr');
                row.innerHTML = `<td class="p-2 border border-[var(--border-color)] w-28 font-semibold bg-[var(--primary-light)] text-[var(--primary-dark)] sticky left-0 z-10">${time}</td>`;
                ['seg', 'ter', 'qua', 'qui', 'sex'].forEach(day => {
                    const cellId = `${day}-${time}`;
                    const appointment = scheduleData[cellId];
                    const cell = document.createElement('td');
                    cell.dataset.id = cellId;
                    let cellClasses = 'relative p-2 border border-[var(--border-color)] cursor-pointer min-w-[120px] hover:bg-teal-50 dark:hover:bg-teal-900/50 transition-all duration-300';
                    if (appointment) {
                        cell.style.backgroundColor = appointment.color;
                        cellClasses += ' font-semibold text-white';
                        
                        if (searchTerm && !appointment.patientName.toLowerCase().includes(searchTerm)) {
                            cellClasses += ' opacity-20';
                        }
                        const gCalIcon = `<a href="${generateGoogleCalendarUrl(appointment.patientName, cellId)}" target="_blank" class="absolute bottom-1 right-1 p-1 rounded-full hover:bg-white/30"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M10.875 12.5H15V10h-4.125v2.5zM10.875 5H15V2.5h-4.125V5zM5.875 7.5H10V5H5.875v2.5zM5.875 12.5H10V10H5.875v2.5zM0 15h4.125V2.5H0V15z"/></svg></a>`;
                        cell.innerHTML = appointment.patientName + gCalIcon;
                    } else if (searchTerm) {
                        cellClasses += ' opacity-20';
                    }
                    cell.className = cellClasses;
                    row.appendChild(cell);
                });
                scheduleBody.appendChild(row);
            });
        };

        const generateGoogleCalendarUrl = (title, cellId) => {
            const [day, time] = cellId.split('-');
            const dayMap = { 'seg': 1, 'ter': 2, 'qua': 3, 'qui': 4, 'sex': 5 };
            const today = new Date();
            const targetDay = today.getDate() - today.getDay() + dayMap[day];
            const eventDate = new Date(today.setDate(targetDay));
            
            const [hour, minute] = time.split(':');
            eventDate.setHours(hour, minute, 0, 0);

            const startTime = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
            eventDate.setMinutes(eventDate.getMinutes() + 30); // Duração de 30 min
            const endTime = eventDate.toISOString().replace(/-|:|\.\d\d\d/g, '');

            const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}`;
            return url;
        };

        document.getElementById('schedule-search').addEventListener('input', (e) => renderSchedule(e.target.value.toLowerCase()));
        renderSchedule();
    }
});

