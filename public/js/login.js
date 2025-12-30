function showLogin() {
    document.getElementById('login-page').classList.remove('hidden');
    document.getElementById('register-page').classList.add('hidden');
}

function showRegister() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('register-page').classList.remove('hidden');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerText = message;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
}

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const pass = document.getElementById('login-password').value;
    if (email && pass.length >= 6) {
        localStorage.setItem('qe_loggedIn', 'true');
        localStorage.setItem('qe_userEmail', email);
        showToast('Sessão iniciada com sucesso!');
        setTimeout(() => window.location.href = 'dashboard.html', 1200);
    } else {
        showToast('Credenciais inválidas.');
    }
});

document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;
    if (name && email && pass.length >= 6) {
        localStorage.setItem('qe_loggedIn', 'true');
        localStorage.setItem('qe_userEmail', email);
        showToast(`Bem-vindo, ${name.split(' ')[0]}! Conta criada.`);
        setTimeout(() => window.location.href = 'dashboard.html', 1200);
    } else {
        showToast('Preenche todos os campos corretamente.');
    }
});

// Mostra o login por defeito ao carregar a página
window.onload = function() {
    showLogin();
};