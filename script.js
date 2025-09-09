<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detalhes do Cliente</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="icon-192.jpg">
    <meta name="theme-color" content="#14b8a6">
    <!-- Biblioteca para gerar PDF -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        :root { --font-primary: 'Poppins', sans-serif; --primary-bg: #f0fdfa; --secondary-bg: #ffffff; --primary-text: #0f766e; --secondary-text: #115e59; --border-color: #ccfbf1; --primary: #14b8a6; --primary-light: #ccfbf1; --primary-dark: #0f766e; --gradient-1: #a7f3d0; --gradient-2: #bae6fd; --gradient-3: #ddd6fe; --gradient-4: #fbcfe8; }
        html.dark { --primary-bg: #0c1a1e; --secondary-bg: #062e2b; --primary-text: #99f6e4; --secondary-text: #5eead4; --border-color: #134e4a; }
        body { font-family: var(--font-primary); background-color: var(--primary-bg); background-image: radial-gradient(at top left, var(--gradient-1), transparent 50%), radial-gradient(at top right, var(--gradient-2), transparent 50%), radial-gradient(at bottom left, var(--gradient-3), transparent 50%), radial-gradient(at bottom right, var(--gradient-4), transparent 50%); transition: background-color 0.3s, background-image 0.3s; }
        .dynamic-card { background-color: rgba(255, 255, 255, 0.6); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(204, 251, 241, 0.5); }
        html.dark .dynamic-card { background-color: rgba(6, 46, 43, 0.6); border: 1px solid rgba(19, 78, 74, 0.8); }
        @keyframes page-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes item-fade-in-up { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-page-fade-in { animation: page-fade-in 0.5s ease-out forwards; }
        .animate-item-fade-in-up { animation: item-fade-in-up 0.5s ease-out forwards; }
        .session-card:hover .delete-session-btn { opacity: 1; }
        .btn-press { transition: transform 0.1s ease; }
        .btn-press:active { transform: scale(0.97); }
    </style>
</head>
<body class="min-h-screen p-4 sm:p-6 md:p-8 animate-page-fade-in pb-48">
    <div id="toast-container" class="fixed bottom-48 right-4 z-[100] space-y-3"></div>
    <main id="patient-details-page" class="max-w-4xl mx-auto">
        <header class="mb-6">
            <a href="index.html" class="inline-flex items-center gap-2 text-[var(--primary)] hover:opacity-80 font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
                Voltar
            </a>
        </header>

        <div class="space-y-8">
            <!-- Área para Exportação PDF/TXT -->
            <div id="pdf-export-area">
                <section id="patient-info-card" class="dynamic-card p-6 rounded-2xl shadow-lg">
                    <div class="relative flex justify-between items-start">
                        <div class="flex items-center gap-4">
                            <label for="profile-picture-input" class="cursor-pointer">
                                <div id="profile-picture-display" class="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-bold text-white bg-cover bg-center" style="background-color: var(--primary);">
                                    <!-- Iniciais ou Imagem aparecerão aqui -->
                                </div>
                            </label>
                             <input type="file" id="profile-picture-input" class="hidden" accept="image/*">
                            <h1 id="patient-name" class="text-3xl font-bold text-[var(--primary-dark)]">Carregando...</h1>
                        </div>
                        <div id="patient-options-container" class="flex items-center gap-2">
                            <button id="patient-options-btn" class="btn-press text-gray-500 hover:text-[var(--primary-dark)] transition-colors p-2 rounded-full hover:bg-black/10">
                                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
                            </button>
                            <div id="patient-options-menu" class="hidden absolute top-12 right-0 z-20 mt-2 w-56 dynamic-card rounded-xl shadow-lg border border-[var(--border-color)]">
                                <div class="py-1">
                                    <a href="#" id="edit-patient-btn" class="block px-4 py-2 text-sm text-[var(--primary-text)] hover:bg-black/5">Editar Dados</a>
                                    <a href="#" id="export-pdf-btn" class="block px-4 py-2 text-sm text-[var(--primary-text)] hover:bg-black/5">Exportar para PDF</a>
                                    <a href="#" id="export-txt-btn" class="block px-4 py-2 text-sm text-[var(--primary-text)] hover:bg-black/5">Exportar para .TXT</a>
                                    <a href="#" id="delete-patient-btn" class="block px-4 py-2 text-sm text-red-500 hover:bg-red-500 hover:text-white">Excluir Cliente</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="patient-details-container" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-[var(--secondary-text)]"></div>
                </section>
                
                <section class="dynamic-card p-6 rounded-2xl shadow-lg mt-8">
                    <h2 class="text-xl font-semibold text-[var(--primary-dark)]">Informações Clínicas</h2>
                    <div id="clinical-info-container" class="mt-4 space-y-4"></div>
                </section>
            </div>

             <section class="dynamic-card p-6 rounded-2xl shadow-lg">
                 <h2 class="text-xl font-semibold text-[var(--primary-dark)] mb-4">Link Externo</h2>
                 <form id="link-form" class="flex flex-col sm:flex-row items-stretch gap-2">
                    <input type="url" id="external-link-input" placeholder="Cole o link do Drive, Dropbox, etc." class="flex-grow block w-full px-3 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--primary-dark)]">
                    <div class="flex gap-2 flex-shrink-0 mt-2 sm:mt-0">
                        <button type="submit" class="btn-press bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto">Salvar</button>
                        <button type="button" id="open-link-btn" disabled class="btn-press bg-[var(--primary)] text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed w-full sm:w-auto">Abrir</button>
                    </div>
                </form>
            </section>
            
            <section class="dynamic-card p-6 rounded-2xl shadow-lg">
                <h2 class="text-xl font-semibold text-[var(--primary-dark)]">Evolução e Sessões</h2>
                <form id="session-form" class="mt-6 p-4 bg-[var(--primary-bg)] border border-[var(--border-color)] rounded-lg">
                    <h3 class="font-semibold text-[var(--primary-text)] mb-2">Registrar Nova Sessão</h3>
                    <textarea id="anotacao" rows="4" placeholder="Descreva as atividades, progressos e observações..." required class="block w-full px-3 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-[var(--primary-dark)]"></textarea>
                    <button type="submit" class="btn-press mt-3 bg-[var(--primary)] text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:opacity-95">Salvar Anotação</button>
                </form>
                <div class="mt-8 relative">
                    <h3 class="font-semibold text-[var(--primary-text)] mb-4">Histórico de Sessões</h3>
                    <div id="session-list"></div>
                </div>
            </section>
        </div>
    </main>

    <!-- Modal de Edição -->
    <div id="edit-patient-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="dynamic-card rounded-2xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 class="text-2xl font-bold text-[var(--primary-dark)] mb-6">Editar Dados do Cliente</h2>
            <form id="edit-patient-form" class="space-y-4">
                <div>
                    <label for="edit-name" class="block text-sm font-medium">Nome Completo</label>
                    <input type="text" id="edit-name" required class="mt-1 block w-full px-3 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg">
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label for="edit-dob" class="block text-sm font-medium">Data de Nascimento</label>
                        <input type="date" id="edit-dob" class="mt-1 block w-full px-3 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg">
                    </div>
                    <div>
                        <label for="edit-age" class="block text-sm font-medium">Idade</label>
                        <input type="number" id="edit-age" readonly class="mt-1 block w-full px-3 py-2 bg-gray-200 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg">
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label for="edit-phone" class="block text-sm font-medium">Telefone (WhatsApp)</label>
                        <input type="tel" id="edit-phone" class="mt-1 block w-full px-3 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg">
                    </div>
                    <div>
                        <label for="edit-family-phone" class="block text-sm font-medium">Contato Familiar</label>
                        <input type="tel" id="edit-family-phone" class="mt-1 block w-full px-3 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg">
                    </div>
                </div>
                <div>
                    <label for="edit-address" class="block text-sm font-medium">Endereço</label>
                    <input type="text" id="edit-address" class="mt-1 block w-full px-3 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg">
                </div>
                <div>
                    <label for="edit-diagnostico" class="block text-sm font-medium">Diagnóstico</label>
                    <textarea id="edit-diagnostico" rows="3" class="mt-1 block w-full px-3 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg"></textarea>
                </div>
                <div>
                    <label for="edit-objetivos" class="block text-sm font-medium">Objetivos</label>
                    <textarea id="edit-objetivos" rows="3" class="mt-1 block w-full px-3 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg"></textarea>
                </div>
                <div>
                    <label for="edit-intervencao" class="block text-sm font-medium">Intervenção/Abordagem</label>
                    <textarea id="edit-intervencao" rows="3" class="mt-1 block w-full px-3 py-2 bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg"></textarea>
                </div>
                <div class="pt-4 flex justify-end gap-3">
                    <button type="button" id="cancel-edit-btn" class="btn-press bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg">Cancelar</button>
                    <button type="submit" class="btn-press bg-[var(--primary)] text-white font-semibold py-2 px-6 rounded-lg">Salvar Alterações</button>
                </div>
            </form>
        </div>
    </div>
    
    <!-- Barra de Navegação Inferior -->
    <nav class="fixed bottom-14 left-0 right-0 h-20 dynamic-card flex justify-around items-center shadow-lg z-50">
        <a href="index.html" class="nav-link flex flex-col items-center justify-center text-[var(--secondary-text)] transition-colors w-full h-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M15 14s1 0 1-1-1-4-6-4-6 3-6 4 1 1 1 1h10zm-9.995-.944v-.002.002zM3.022 13h9.956a.274.274 0 0 0 .014-.002l.008-.002c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664a1.05 1.05 0 0 0 .022.004zM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>
            <span class="text-xs mt-1">Clientes</span>
        </a>
        <a href="schedule.html" class="nav-link flex flex-col items-center justify-center text-[var(--secondary-text)] transition-colors w-full h-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/></svg>
            <span class="text-xs mt-1">Agenda</span>
        </a>
        <a href="notes.html" class="nav-link flex flex-col items-center justify-center text-[var(--secondary-text)] transition-colors w-full h-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M3.5 2a.5.5 0 0 0-.5.5v12a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V5.207L9.793 2H3.5zm6.293 3.5H12v9.793H4V3h5.293l1 1zM5 9h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1zm0 2h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1 0-1z"/></svg>
            <span class="text-xs mt-1">Anotações</span>
        </a>
    </nav>
    
    <!-- Rodapé Fixo -->
    <footer class="fixed bottom-0 left-0 right-0 h-14 dynamic-card flex justify-center items-center shadow-lg text-[var(--secondary-text)] font-semibold text-sm z-40 border-t border-[var(--border-color)]">
        <div class="flex items-center justify-center gap-6">
            <a href="https://www.flavioitech.com" target="_blank" class="flex items-center gap-2 hover:text-[var(--primary)] transition-colors">
                <img src="logo2.png" alt="Logo FlavioItech" class="h-6 w-6 rounded-full object-contain" onerror="this.style.display='none'">
                <span>Site FlavioItech</span>
            </a>
            <a href="https://wa.me/5519998821845" target="_blank" class="flex items-center gap-2 hover:text-[var(--primary)] transition-colors">
                <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 221.9-99.6 221.9-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-67.6-9.5-97.8-27.2l-6.9-4.1-72.7 19.1L48.4 358s-4.4-7.2-12.1-99.6c0-11.4 2.9-22.5 8.4-32.9l16.4-30.3c34.9-64.4 106.4-104.1 180.1-104.1 32.5 0 63.8 12.8 86.8 35.7 23 22.9 35.9 54.1 35.9 86.6 0 92.8-74.9 167.8-167.7 167.8zm118.9-194.3c-4.1-2-24.5-12.1-28.4-13.5-3.9-1.4-6.7-2-9.5 2-2.8 4-10.8 13.5-13.2 16.2-2.4 2.8-4.8 3.1-8.9 1.1-4.1-2-17.4-6.4-33.1-20.4-12.2-10.8-20.4-24.1-22.8-28.2-2.4-4.1-.2-6.3 1.8-8.3 1.8-1.8 4.1-4.8 6.1-7.1 2-2.3 2.7-4.1 4.1-6.9 1.4-2.8.7-5.1-1.4-7.1s-9.5-22.8-13-31.1c-3.5-8.3-7.1-7.1-9.5-7.1-2.4 0-5.1 0-7.8 0-2.8 0-7.1 1.1-10.8 5.1-3.7 4-14.2 13.9-14.2 33.9 0 20 14.5 39.3 16.5 41.7 2 2.4 28.4 43.4 69.1 60.9 9.8 4.2 17.5 6.7 23.4 8.6 5.9 1.9 11.2 1.6 15.5 1 4.8-.6 15.1-6.2 17.2-12.1 2.1-5.9 2.1-11 1.4-12.1-0.7-1.1-2.8-1.8-5.9-3.8z"/>
                </svg>
                <span>19 99882-1845</span>
            </a>
        </div>
    </footer>

    <script src="script.js" defer></script>
</body>
</html>

