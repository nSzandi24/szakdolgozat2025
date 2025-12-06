document.addEventListener('DOMContentLoaded', async function() {
  const tableBody = document.querySelector('#userTable tbody');
  try {
    const res = await window.apiClient.get('/api/game/all-points');
    if (!res.success) throw new Error(res.message || 'Hiba');
    const users = res.users || [];
    const myUsername = localStorage.getItem('username') || '';
    users.sort((a, b) => b.points - a.points);
    users.forEach((u, idx) => {
      const tr = document.createElement('tr');
      if (u.username === myUsername) tr.classList.add('highlight');
      tr.innerHTML = `<td>${idx + 1}.</td><td>${u.username || ''}</td><td>${u.points}</td>`;
      tableBody.appendChild(tr);
    });
  } catch (e) {
    tableBody.innerHTML = '<tr><td colspan="3">Nem sikerült lekérni a pontokat.</td></tr>';
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = async function() {
      try { await window.apiClient.logout(); } catch(e){}
      window.location.href = 'login.html';
    };
  }
});
