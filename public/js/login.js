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
        showToast('Bem-vindo de volta!');
        setTimeout(() => window.location.href = 'dashboard.html', 1200);
    } else {
        showToast('E-mail ou palavra-passe inválidos.');
    }
});