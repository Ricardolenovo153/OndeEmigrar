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