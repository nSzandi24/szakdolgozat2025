document.getElementById('regForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    try {
        const res = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        if (!res.ok) {
            console.error('HTTP error:', res.status, res.statusText);
            throw new Error('HTTP error: ' + res.status);
        }
        const data = await res.json();
        console.log('Szerver válasz:', data);
        if (data.success) {
            window.location.href = 'info.html';
        } else {
            alert(data.message || 'Sikertelen regisztráció!');
        }
    } catch (err) {
        console.error('Regisztrációs hiba:', err);
        alert('Hiba történt a regisztráció során!');
    }
});
