let profiles = JSON.parse(localStorage.getItem('emigrar_v4')) || [
    { id: 1, name: 'Perfil Padrão', active: true, values: [20, 20, 20, 15, 15, 10] }
];

const labels = ["ECO", "SAÚ", "EDU", "POL", "DIR", "RET"];

// Dados de exemplo (podes substituir por fetch real mais tarde)
const countriesData = [
    { name: "Suíça", scores: [98, 92, 85, 99, 97, 95] },
    { name: "Dinamarca", scores: [85, 96, 90, 98, 99, 90] },
    { name: "Noruega", scores: [92, 98, 88, 97, 95, 92] },
    { name: "Países Baixos", scores: [90, 88, 94, 92, 93, 85] },
    { name: "Suécia", scores: [88, 95, 89, 96, 94, 88] },
    { name: "Alemanha", scores: [87, 89, 91, 90, 92, 82] }
];

function togglePages(pageId) {
    document.querySelectorAll('main').forEach(m => m.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    if (pageId === 'home-page') {
        loadActiveProfileValues();
        renderProfiles();
    }
}

function updateSliderUI(index, val) {
    document.getElementById(`val-${index}`).innerText = val + '%';
}

function saveCurrentProfile() {
    const activeIdx = profiles.findIndex(p => p.active);
    if (activeIdx !== -1) {
        const newValues = [];
        for (let i = 0; i < 6; i++) {
            newValues.push(parseInt(document.getElementById(`slider-${i}`).value));
        }
        profiles[activeIdx].values = newValues;
        localStorage.setItem('emigrar_v4', JSON.stringify(profiles));
        showToast(`Sucesso! "${profiles[activeIdx].name}" atualizado.`);
        renderProfiles();
    }
}

function loadActiveProfileValues() {
    const active = profiles.find(p => p.active);
    if (active) {
        active.values.forEach((val, i) => {
            const slider = document.getElementById(`slider-${i}`);
            if (slider) {
                slider.value = val;
                document.getElementById(`val-${i}`).innerText = val + '%';
            }
        });
    }
}

function renderProfiles() {
    const container = document.getElementById('profiles-container');
    const btnCount = document.getElementById('btn-count-perfil');
    if (btnCount) btnCount.innerText = `Meus Perfis (${profiles.length})`;

    if (!container) return;

    container.innerHTML = `<div class="profile-card add-new" onclick="createProfile()"><div class="add-circle">+</div><p>Novo Perfil</p></div>`;

    profiles.forEach(p => {
        const div = document.createElement('div');
        div.className = `profile-card ${p.active ? 'active' : ''}`;
        div.onclick = () => { setActive(p.id); togglePages('home-page'); };

        const previewHtml = p.values.map((v, i) => `
            <div class="bar-wrapper">
                <div class="preview-bar" style="height: ${v}%"></div>
                <span class="bar-label">${labels[i]}</span>
            </div>
        `).join('');

        div.innerHTML = `
            <div class="profile-header">
                <span class="p-name">${p.name}</span>
                <button class="btn-del" onclick="confirmDelete(${p.id}, event)">×</button>
            </div>
            <div class="bars-container">${previewHtml}</div>
        `;
        container.prepend(div);
    });
}

function confirmDelete(id, e) {
    e.stopPropagation();
    if (confirm('Eliminar este perfil?')) deleteProfile(id);
}

function deleteProfile(id) {
    if (profiles.length > 1) {
        profiles = profiles.filter(p => p.id !== id);
        if (!profiles.find(p => p.active)) profiles[0].active = true;
        saveAndRender();
        showToast("Perfil removido.");
    } else {
        showToast("Erro: Mantém pelo menos um perfil.");
    }
}

function calculateRanking() {
    const weights = Array.from({length: 6}, (_, i) => parseInt(document.getElementById(`slider-${i}`).value));
    const ranked = countriesData.map(c => {
        let finalScore = c.scores.reduce((acc, s, i) => acc + (s * (weights[i] / 100)), 0);
        return { name: c.name, score: finalScore.toFixed(1) };
    }).sort((a, b) => b.score - a.score);

    const rankingList = document.getElementById('ranking-list');
    if (rankingList) {
        rankingList.innerHTML = ranked.map((c, i) => `
            <div class="ranking-item">
                <span class="rank-pos">#${i+1}</span>
                <span class="rank-name">${c.name}</span>
                <span class="rank-score">${c.score} pts</span>
            </div>
        `).join('');
    }
    togglePages('results-page');
}

function createProfile() {
    const name = prompt("Nome do novo perfil:");
    if (name) {
        profiles.forEach(p => p.active = false);
        profiles.push({ id: Date.now(), name, active: true, values: [20, 20, 20, 15, 15, 10] });
        saveAndRender();
        togglePages('home-page');
    }
}

function setActive(id) {
    profiles.forEach(p => p.active = (p.id === id));
    saveAndRender();
}

function saveAndRender() {
    localStorage.setItem('emigrar_v4', JSON.stringify(profiles));
    renderProfiles();
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerText = message;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
}

// Inicialização
window.addEventListener('load', () => {
    loadActiveProfileValues();
    renderProfiles();
});