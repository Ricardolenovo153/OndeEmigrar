<<<<<<< HEAD
// Lógica de Login
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btnSubmit = this.querySelector('button');

        const originalText = btnSubmit.innerText;
        btnSubmit.innerText = "A ENTRAR...";
        btnSubmit.disabled = true;

        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                showToast("✅ Login efetuado!");
                // AQUI ESTAVA O ERRO: Agora vai para /dashboard
                setTimeout(() => {
                    window.location.href = '/dashboard'; 
                }, 1000);
            } else {
                showToast("❌ " + (data.error || "Dados incorretos"));
                btnSubmit.innerText = originalText;
                btnSubmit.disabled = false;
            }
        } catch (e) {
            console.error(e);
            showToast("Erro de conexão.");
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        }
    });
}

function showToast(msg) {
    const container = document.getElementById('toast-container');
    if (container) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerText = msg;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    } else {
        alert(msg);
    }
}
=======
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
>>>>>>> d8b9ed421eedd36912930afa7d18f6b39d38ec1c
