function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerText = message;
    document.getElementById('toast-container').appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 500); }, 3000);
}

document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const pass = document.getElementById('reg-password').value;

    if (name && email && pass.length >= 6) {
        // Simula criação da conta
        localStorage.setItem('qe_userEmail', email);
        localStorage.setItem('qe_userName', name);
        // Não faz login automático – vai para login
        showToast(`Conta criada com sucesso, ${name.split(' ')[0]}!`);

        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
    } else {
        showToast('Preenche todos os campos corretamente (palavra-passe ≥ 6 caracteres).');
    }
});