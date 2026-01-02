let profiles = [];

const isGuest = new URLSearchParams(window.location.search).get('guest') === 'true';

window.onload = async () => {
    if (isGuest) {
        setupGuestMode();
    } else {
        await fetchProfiles();
        renderProfiles();
    }
};

function setupGuestMode() {
    const btnSave = document.querySelector('.btn-save');
    const btnProfiles = document.getElementById('btn-count-perfil');
    
    if (btnSave) {
        btnSave.disabled = true;
        btnSave.style.opacity = '0.5';
        btnSave.title = "Regista-te para salvar perfis";
        btnSave.onclick = () => showToast("⚠️ Precisas de uma conta para salvar perfis!");
    }
    
    if (btnProfiles) {
        btnProfiles.style.display = 'none';
    }
}

async function fetchProfiles() {
    if (isGuest) return;
    try {
        const res = await fetch('http://localhost:3000/api/profiles');
        if (res.status === 401) {
            // Se não for convidado e der 401, manda para login
            window.location.href = '/login';
            return;
        }
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            profiles = data;
            if (!profiles.some(p => p.active)) {
                profiles.forEach(p => p.active = false);
                profiles[0].active = true;
            }
        } else {
            profiles = [];
        }
    } catch (e) {
        console.error(e);
        showToast("Erro ao carregar perfis.");
    }
}

// SALVAR INTELIGENTE
async function saveCurrentProfile() {
    const active = profiles.find(p => p.active);
    const values = getSliderValues();

    if (active) {
        // Pergunta se quer atualizar
        const wantToUpdate = confirm(
            `O perfil "${active.name}" está selecionado.\n\n` +
            `[OK] = ATUALIZAR este perfil\n` +
            `[CANCELAR] = Criar NOVO`
        );

        if (wantToUpdate) {
            try {
                const res = await fetch(`http://localhost:3000/api/profiles/${active.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: active.name, values })
                });
                if (res.ok) {
                    showToast(`Perfil "${active.name}" atualizado!`);
                    await fetchProfiles();
                    profiles.forEach(p => p.active = (p.id === active.id));
                    renderProfiles();
                    return;
                }
            } catch(e) { console.error(e); }
        }
    }

    // Criar Novo
    createNewProfile(values);
}

async function createNewProfile(values) {
    const name = prompt("Nome para o novo perfil:");
    if (!name) return;

    try {
        const res = await fetch('http://localhost:3000/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, values })
        });
        if (res.ok) {
            showToast("✅ Novo perfil criado!");
            await fetchProfiles();
            if(profiles.length > 0) {
                profiles.forEach(p => p.active = false);
                profiles[0].active = true;
            }
            renderProfiles();
        }
    } catch (e) { showToast("Erro conexão."); }
}

async function deleteProfile(id, event) {
    event.stopPropagation();
    if(!confirm("Tens a certeza que queres apagar?")) return;

    try {
        const res = await fetch(`http://localhost:3000/api/profiles/${id}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            showToast("🗑️ Apagado!");
            await fetchProfiles();
            renderProfiles();
        } else {
            showToast("Erro ao apagar.");
        }
    } catch (e) { showToast("Erro conexão."); }
}

function renderProfiles() {
    const container = document.getElementById('profiles-container');
    const btnCount = document.getElementById('btn-count-perfil');
    const labels = ["ECO", "SAÚ", "EDU", "POL", "DIR", "EMI"]; 

    if(btnCount) btnCount.innerText = `Meus Perfis (${profiles.length})`;
    container.innerHTML = ''; 

    const addNewDiv = document.createElement('div');
    addNewDiv.className = 'profile-card add-new';
    addNewDiv.onclick = () => { 
        profiles.forEach(p => p.active = false); 
        renderProfiles(); 
        togglePages('home-page'); 
        setTimeout(() => createNewProfile(getSliderValues()), 200); 
    };
    addNewDiv.innerHTML = `<div class="add-circle">+</div><p>Novo Perfil</p>`;
    container.appendChild(addNewDiv);

    profiles.forEach(p => {
        const div = document.createElement('div');
        div.className = `profile-card ${p.active ? 'active' : ''}`;
        div.onclick = () => setActive(p.id);
        
        const bars = p.values.map((v, i) => `
            <div class="bar-wrapper">
                <div class="preview-bar" style="height:${v}%"></div>
                <span class="bar-label">${labels[i]}</span>
            </div>
        `).join('');

        div.innerHTML = `
            <button class="btn-del" onclick="deleteProfile(${p.id}, event)">×</button>
            <div class="profile-info">
                <h3 class="p-name">${p.name}</h3>
                <div class="bars-container">${bars}</div>
            </div>
        `;
        container.appendChild(div);
    });
}

async function calculateRanking() {
    const values = getSliderValues();
    const payload = { eco: values[0], sau: values[1], edu: values[2], pol: values[3], dir: values[4], emi: values[5] };
    
    togglePages('results-page');
    document.getElementById('ranking-list').innerHTML = '<p class="loading">A calcular...</p>';

    try {
        const res = await fetch('http://localhost:3000/api/ranking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        renderRanking(data);
    } catch (e) { document.getElementById('ranking-list').innerHTML = '<p class="error">Erro.</p>'; }
}

function renderRanking(data) {
    const container = document.getElementById('ranking-list');
    if(!data || data.length === 0) { container.innerHTML = '<p>Sem resultados.</p>'; return; }
    container.innerHTML = data.map((c, i) => `
        <div class="ranking-item">
            <div class="rank-pos">#${i + 1}</div>
            <div class="rank-info"><h3>${c.country_name}</h3></div>
            <div class="rank-score">${Math.round(c.score_final)} pts</div>
        </div>
    `).join('');
}

function getSliderValues() {
    return [0,1,2,3,4,5].map(i => parseInt(document.getElementById(`slider-${i}`).value) || 0);
}

function setActive(id) {
    profiles.forEach(p => p.active = (p.id === id));
    const active = profiles.find(p => p.active);
    if (active) active.values.forEach((v, i) => {
        const el = document.getElementById(`slider-${i}`);
        if(el) { el.value = v; document.getElementById(`val-${i}`).innerText = v + '%'; }
    });
    renderProfiles();
}

function togglePages(pageId) {
    document.querySelectorAll('main').forEach(m => m.classList.add('hidden'));
    document.getElementById(pageId).classList.remove('hidden');
    if(pageId === 'home-page') loadActiveProfileValues();
}

function showToast(msg) {
    let container = document.getElementById('toast-container');
    if(!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerText = msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function updateSliderUI(index, value) {
    const sliders = [0, 1, 2, 3, 4, 5].map(i => document.getElementById(`slider-${i}`));
    const values = sliders.map(s => parseInt(s.value) || 0);
    const total = values.reduce((a, b) => a + b, 0);

    if (total > 100) {
        const excess = total - 100;
        const newValue = Math.max(0, value - excess);
        document.getElementById(`slider-${index}`).value = newValue;
        document.getElementById(`val-${index}`).innerText = newValue + '%';
    } else {
        document.getElementById(`val-${index}`).innerText = value + '%';
    }
}

document.querySelectorAll('.range-slider').forEach((slider, index) => {
    slider.addEventListener('input', function() { 
        updateSliderUI(index, parseInt(this.value));
    });
});