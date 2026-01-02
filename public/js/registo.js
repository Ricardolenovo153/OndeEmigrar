function showToast(message) {
    const container = document.getElementById('toast-container');
    if (container) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerText = message;
        container.appendChild(toast);
        setTimeout(() => { 
            toast.style.opacity = '0'; 
            setTimeout(() => toast.remove(), 500); 
        }, 3000);
    } else {
        alert(message);
    }
}

document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const btnSubmit = this.querySelector('button');

    if (!name || !email || password.length < 6) {
        showToast('Preenche todos os campos corretamente (palavra-passe ≥ 6 caracteres).');
        return;
    }

    const originalText = btnSubmit.innerText;
    btnSubmit.innerText = "A CRIAR CONTA...";
    btnSubmit.disabled = true;

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            showToast(`✅ Conta criada com sucesso, ${name.split(' ')[0]}!`);
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            showToast("❌ " + (data.error || "Erro ao criar conta"));
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        }
    } catch (e) {
        console.error(e);
        showToast("Erro de conexão com o servidor.");
        btnSubmit.innerText = originalText;
        btnSubmit.disabled = false;
    }
});
