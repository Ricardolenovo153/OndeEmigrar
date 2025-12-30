// ==========================================
// 1. CONFIGURAÇÃO INICIAL E NAVEGAÇÃO
// ==========================================

// Variável global para guardar os perfis que vêm da BD
let profiles = [];

// Ao abrir o site, vai buscar os perfis à Base de Dados
window.onload = async () => {
    await fetchProfiles();
    renderProfiles();
};

// Alternar entre páginas (Home, Perfis, Resultados)
function togglePages(pageId) {
    // Esconde todas as páginas
    document.querySelectorAll('main').forEach(m => m.classList.add('hidden'));
    
    // Mostra a página pedida
    document.getElementById(pageId).classList.remove('hidden');

    // Se voltarmos à Home, recarrega os sliders do perfil ativo
    if(pageId === 'home-page') loadActiveProfileValues();
}

// Atualiza o texto da percentagem enquanto mexes no slider
function updateSliderUI(index, val) {
    document.getElementById(`val-${index}`).innerText = val + '%';
}

// ==========================================
// 2. FUNÇÕES DE COMUNICAÇÃO COM A BD (API)
// ==========================================

// BUSCAR PERFIS (GET)
async function fetchProfiles() {
    try {
        const res = await fetch('http://localhost:3000/api/profiles');
        const data = await res.json();
        
        if (data.length > 0) {
            profiles = data;
            // Define o primeiro (mais recente) como ativo por defeito
            profiles.forEach(p => p.active = false);
            profiles[0].active = true;
        } else {
            profiles = [];
        }
    } catch (e) {
        console.error("Erro ao buscar perfis:", e);
        showToast("Erro: Backend desligado?");
    }
}

// SALVAR PERFIL (POST)
async function saveCurrentProfile() {
    const name = prompt("Nome para esta configuração de pesquisa:");
    if (!name) return;

    // Captura os valores dos 6 sliders
    const values = getSliderValues();

    try {
        const res = await fetch('http://localhost:3000/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, values })
        });

        if (res.ok) {
            showToast("✅ Perfil guardado na BD!");
            await fetchProfiles(); // Atualiza a lista com o novo perfil
            renderProfiles();
        } else {
            showToast("Erro ao gravar.");
        }
    } catch (e) {
        showToast("Erro de conexão.");
    }
}

// CALCULAR RANKING (POST para a BD)
async function calculateRanking() {
    const rankingContainer = document.getElementById('ranking-list');
    rankingContainer.innerHTML = '<p class="loading">A consultar o MySQL...</p>';
    togglePages('results-page');

    // Prepara os dados para enviar (mapeia slider-0 a slider-5 para nomes)
    const values = getSliderValues();
    const payload = {
        eco: values[0],
        sau: values[1],
        edu: values[2],
        pol: values[3],
        dir: values[4],
        emi: values[5]
    };

    try {
        // Pede ao servidor para fazer a query SQL matemática
        const res = await fetch('http://localhost:3000/api/ranking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        renderRanking(data);

    } catch (e) {
        rankingContainer.innerHTML = '<p class="error">Erro ao calcular. O servidor está ligado?</p>';
    }
}

// ==========================================
// 3. FUNÇÕES VISUAIS (RENDER)
// ==========================================

// Desenha a lista de cartões de perfil
function renderProfiles() {
    const container = document.getElementById('profiles-container');
    const btnCount = document.getElementById('btn-count-perfil');
    
    // Atualiza contador se o botão existir
    if(btnCount) btnCount.innerText = `Meus Perfis (${profiles.length})`;
    
    container.innerHTML = ''; // Limpa antes de desenhar

    // Botão "Criar Novo" (atalho visual)
    const addNewDiv = document.createElement('div');
    addNewDiv.className = 'profile-card add-new';
    addNewDiv.onclick = () => { togglePages('home-page'); setTimeout(() => saveCurrentProfile(), 200); };
    addNewDiv.innerHTML = `<div class="add-circle">+</div><p>Novo Perfil</p>`;
    container.appendChild(addNewDiv);

    // Lista os perfis vindos da BD
    profiles.forEach(p => {
        const div = document.createElement('div');
        div.className = `profile-card ${p.active ? 'active' : ''}`;
        div.onclick = () => setActive(p.id);
        
        // Mini-gráfico de barras (CSS)
        const bars = p.values.map(v => `<div class="mini-bar" style="height:${v}%"></div>`).join('');

        div.innerHTML = `
            <div class="profile-info">
                <h3>${p.name}</h3>
                <div class="bars-container">${bars}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

// Desenha a lista de resultados (Países)
function renderRanking(data) {
    const container = document.getElementById('ranking-list');
    if(!data || data.length === 0) {
        container.innerHTML = '<p>Sem resultados.</p>';
        return;
    }

    container.innerHTML = data.map((country, index) => `
        <div class="ranking-item">
            <div class="rank-pos">#${index + 1}</div>
            <div class="rank-info">
                <h3>${country.country_name}</h3>
                <p>PIB: $${country.gdp_per_capita} | Exp. Vida: ${country.life_expectancy}</p>
            </div>
            <div class="rank-score">
                ${Math.round(country.score_final || 0)} pts
            </div>
        </div>
    `).join('');
}

// ==========================================
// 4. UTILITÁRIOS
// ==========================================

function getSliderValues() {
    return [
        parseInt(document.getElementById('slider-0').value) || 0,
        parseInt(document.getElementById('slider-1').value) || 0,
        parseInt(document.getElementById('slider-2').value) || 0,
        parseInt(document.getElementById('slider-3').value) || 0,
        parseInt(document.getElementById('slider-4').value) || 0,
        parseInt(document.getElementById('slider-5').value) || 0
    ];
}

function loadActiveProfileValues() {
    const active = profiles.find(p => p.active);
    if (active) {
        active.values.forEach((val, i) => {
            const slider = document.getElementById(`slider-${i}`);
            if(slider) {
                slider.value = val;
                updateSliderUI(i, val);
            }
        });
    }
}

function setActive(id) {
    profiles.forEach(p => p.active = (p.id === id));
    loadActiveProfileValues();
    renderProfiles();
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Inicializa listeners dos sliders para atualizar o texto %
document.querySelectorAll('.range-slider').forEach((slider, index) => {
    slider.addEventListener('input', function() {
        updateSliderUI(index, this.value);
    });
});