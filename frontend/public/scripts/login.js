document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            throw new Error('HTTP error: ' + res.status);
        }

        const data = await res.json();
        console.log('Bejelentkezés válasz:', data);

        if (data.success) {
            // Sikeres bejelentkezés
            window.location.href = 'info.html';
        } else {
            alert(data.message || 'Sikertelen bejelentkezés!');
        }
    } catch (err) {
        console.error('Bejelentkezési hiba:', err);
        alert('Hiba történt a bejelentkezés során!');
    }
});
