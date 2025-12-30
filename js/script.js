
function showPage(pageId) {
    document.getElementById('home-page').classList.add('hidden');
    document.getElementById('preferences-page').classList.add('hidden');
    
    document.getElementById(pageId).classList.remove('hidden');
}


document.querySelectorAll('.range-slider').forEach(slider => {
    slider.addEventListener('input', function() {
        const display = this.parentElement.querySelector('.percentage');
        display.innerText = this.value + '%';
    });
});


        let profiles = JSON.parse(localStorage.getItem('emigrar_v4')) || [
            { id: 1, name: 'Perfil Padrão', active: true, values: [20, 20, 20, 15, 15, 10] }
        ];

        const labels = ["ECO", "SAÚ", "EDU", "POL", "DIR", "RET"];

        function togglePages(pageId) {
            document.querySelectorAll('main').forEach(m => m.classList.add('hidden'));
            document.getElementById(pageId).classList.remove('hidden');
            if(pageId === 'home-page') loadActiveProfileValues();
            renderProfiles();
        }

        function updateSliderUI(index, val) {
            document.getElementById(`val-${index}`).innerText = val + '%';
        }

        function saveCurrentProfile() {
            let activeIdx = profiles.findIndex(p => p.active);
            if (activeIdx !== -1) {
                const newValues = [];
                for(let i=0; i<6; i++) {
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
                    if(slider) {
                        slider.value = val;
                        document.getElementById(`val-${i}`).innerText = val + '%';
                    }
                });
            }
        }

        function renderProfiles() {
            const container = document.getElementById('profiles-container');
            document.getElementById('btn-count-perfil').innerText = `Meus Perfis (${profiles.length})`;
            
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
                    <div class="profile-header"><span class="p-name">${p.name}</span><button class="btn-del" onclick="confirmDelete(${p.id}, event)">×</button></div>
                    <div class="bars-container">${previewHtml}</div>
                `;
                container.prepend(div);
            });
        }

        function confirmDelete(id, e) {
            e.stopPropagation();
            if (confirm(`Eliminar este perfil?`)) deleteProfile(id);
        }

        function deleteProfile(id) {
            if(profiles.length > 1) {
                profiles = profiles.filter(p => p.id !== id);
                if(!profiles.find(p => p.active)) profiles[0].active = true;
                saveAndRender();
                showToast("Perfil removido.");
            } else {
                showToast("Erro: Mantém pelo menos um perfil.");
            }
        }

    async function calculateRanking() {
    // 1. Capturar valores dos sliders
    const weights = {
        eco: parseInt(document.getElementById('slider-0').value),
        sau: parseInt(document.getElementById('slider-1').value),
        edu: parseInt(document.getElementById('slider-2').value),
        pol: parseInt(document.getElementById('slider-3').value),
        dir: parseInt(document.getElementById('slider-4').value),
        emi: parseInt(document.getElementById('slider-5').value)
    };

    const rankingContainer = document.getElementById('ranking-list');
    rankingContainer.innerHTML = '<p style="text-align:center">A consultar a Base de Dados...</p>';
    togglePages('results-page');

    try {
        // 2. Pedir ao Servidor (Node.js -> MySQL)
        const response = await fetch('/api/ranking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(weights)
        });

        const data = await response.json();

        // 3. Mostrar os resultados REAIS vindos do SQL
        rankingContainer.innerHTML = data.map((c, i) => `
            <div class="ranking-item">
                <span class="rank-pos">#${i+1}</span>
                <span class="rank-name">${c.country_name}</span>
                <div class="rank-details">
                    <small>PIB: $${c.gdp_per_capita}</small>
                    <small>Vida: ${c.life_expectancy} anos</small>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Erro:', error);
        rankingContainer.innerHTML = '<p style="color:red">Erro ao ligar ao servidor.</p>';
    }
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

        function setActive(id) { profiles.forEach(p => p.active = (p.id === id)); saveAndRender(); }
        function saveAndRender() { localStorage.setItem('emigrar_v4', JSON.stringify(profiles)); renderProfiles(); }
        function showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast-notification';
            toast.innerText = message;
            document.getElementById('toast-container').appendChild(toast);
            setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
        }

        window.onload = () => { loadActiveProfileValues(); renderProfiles(); };