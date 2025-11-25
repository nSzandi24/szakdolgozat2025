// Ellenőrzi, hogy be van-e jelentkezve a felhasználó; ha nincs, átirányít a login oldalra
(function() {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) {
            window.location.href = 'login.html';
            return;
        }
        const user = JSON.parse(raw);
        if (!user || !user.username) {
            window.location.href = 'login.html';
            return;
        }
        const usernameEl = document.getElementById('username');
        if (usernameEl) usernameEl.textContent = user.username;
    } catch (err) {
        console.warn('Hiba a user betöltésekor:', err);
        window.location.href = 'login.html';
    }
})();

// Start button redirects to start.html
const startBtn = document.getElementById('start');
if (startBtn) {
    startBtn.addEventListener('click', () => {
        window.location.href = 'start.html';
    });
}

// Logout button clears stored user and redirects to login
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        try {
            localStorage.removeItem('user');
        } catch (e) {
            console.warn('Failed clearing user:', e);
        }
        window.location.href = 'index.html';
    });
}
