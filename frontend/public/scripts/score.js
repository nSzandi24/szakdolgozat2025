document.addEventListener('DOMContentLoaded', async function() {
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    if (leaderboardBtn) {
      leaderboardBtn.addEventListener('click', function() {
        window.location.href = 'static.html';
      });
    }
  const container = document.getElementById('scoreContainer');
  try {
    const [solutionRes, pointsRes] = await Promise.all([
      window.apiClient.get('/api/game/solution'),
      window.apiClient.get('/api/game/points'),
    ]);
    const solution = solutionRes.solution;
    const points = pointsRes.points;
    const gameStateRes = await window.apiClient.get('/api/game/state');
    const gameState = gameStateRes.gameState || {};

    const correct = {
      weapon: 'Kalapács',
      killer: 'Névtelen alak',
      motive: 'Bogyók',
      kidnapper: 'A 3 kisfiú',
      kidnapMotive: 'Foltok',
      ghostskin: 'Névtelen alak',
    };
    const questions = [
      { key: 'weapon', text: 'Mi volt a gyilkos fegyver?' },
      { key: 'killer', text: 'Ki ölte meg a cselédet?' },
      { key: 'motive', text: 'Miért ölték meg a cselédet?' },
      { key: 'kidnapper', text: 'Ki rabolta el Sebastian-t?' },
      { key: 'kidnapMotive', text: 'Miért rabolták el Sebastian-t?' },
      { key: 'ghostskin', text: 'Ki a Ghostskin?' },
    ];
    let total = 0;
    questions.forEach(q => {
      const isCorrect = (solution[q.key] || '').trim() === correct[q.key];
      total += isCorrect ? 15 : 0;
      const div = document.createElement('div');
      div.className = 'score-row ' + (isCorrect ? 'score-correct' : 'score-wrong');
      div.innerHTML = `<span class="score-question">${q.text}</span> <span class="score-answer">${solution[q.key] || ''}</span> <span class="score-points">${isCorrect ? '+15' : '+0'}</span>`;
      container.appendChild(div);
    });

    const game1Div = document.createElement('div');
    const game1Success = !!gameState.game1_completed;
    total += game1Success ? 20 : 0;
    game1Div.className = 'score-row ' + (game1Success ? 'score-correct' : 'score-wrong');
    game1Div.innerHTML = `<span class="score-question">Segítettél az árusnak</span> <span class="score-answer">${game1Success ? 'Igen' : 'Nem'}</span> <span class="score-points">${game1Success ? '+20' : '+0'}</span>`;
    container.appendChild(game1Div);

    const game2Div = document.createElement('div');
    const game2Success = !!gameState.game2_completed;
    total += game2Success ? 20 : 0;
    game2Div.className = 'score-row ' + (game2Success ? 'score-correct' : 'score-wrong');
    game2Div.innerHTML = `<span class="score-question">Sikerült feltörnöd a naplót</span> <span class="score-answer">${game2Success ? 'Igen' : 'Nem'}</span> <span class="score-points">${game2Success ? '+20' : '+0'}</span>`;
    container.appendChild(game2Div);

    const totalDiv = document.createElement('div');
    totalDiv.className = 'score-total';
    totalDiv.innerHTML = `<b>Összesen: ${total} pont</b>`;
    container.appendChild(totalDiv);
  } catch (e) {
    container.textContent = 'Nem sikerült lekérni a pontokat.';
  }
});
