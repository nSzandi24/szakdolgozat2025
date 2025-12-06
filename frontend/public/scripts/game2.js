/**
 * Lock-picking mini-game logic.
 * Handles grid puzzle, win/loss, and user interactions.
 * @file game2.js
 */

(function() {
    const gridEl = document.getElementById('grid');
    const messageEl = document.getElementById('message');
    const nextButton = document.getElementById('nextButton');
    const finishButton = document.getElementById('finishButton');
    const restartButton = document.getElementById('restartButton');
    const currentLevelEl = document.getElementById('currentLevel');
    const completedLevelsEl = document.getElementById('completedLevels');
    const movesEl = document.getElementById('moves');

    let currentLevel = 1;
    let completedLevels = 0;
    let moves = 0;
    let grid = [];
    
    const levels = [
        { size: 3, pattern: [[1,0,1],[0,1,0],[1,0,1]] }, 
        { size: 4, pattern: [[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,0,0,1]] } 
    ];

    /**
     * Initialize the current level, set up grid and UI.
     */
    function initLevel() {
        const level = levels[currentLevel - 1];
        const size = level.size;
        
        gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        gridEl.innerHTML = '';
        grid = [];
        moves = 0;
        movesEl.textContent = moves;
        currentLevelEl.textContent = currentLevel;
        
        for (let i = 0; i < size; i++) {
            grid[i] = [];
            for (let j = 0; j < size; j++) {
                grid[i][j] = level.pattern[i][j];
                
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (grid[i][j] === 1) {
                    cell.classList.add('active');
                }
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', () => handleCellClick(i, j));
                gridEl.appendChild(cell);
            }
        }
        
        hideMessage();
        nextButton.classList.add('hidden');
        finishButton.classList.add('hidden');
        restartButton.classList.remove('hidden');
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.style.pointerEvents = 'auto';
        });
    }

    /**
     * Handle a cell click, toggling the cell and its neighbors, and check for win.
     * @param {number} row - Row index of the clicked cell.
     * @param {number} col - Column index of the clicked cell.
     */
    function handleCellClick(row, col) {
        const size = levels[currentLevel - 1].size;
        moves++;
        movesEl.textContent = moves;
        
        toggleCell(row, col);
        
        if (row > 0) toggleCell(row - 1, col);
        if (row < size - 1) toggleCell(row + 1, col);
        if (col > 0) toggleCell(row, col - 1);
        if (col < size - 1) toggleCell(row, col + 1);
        
        checkWin();
    }

    /**
     * Toggle the state of a cell and update its visual state.
     * @param {number} row - Row index.
     * @param {number} col - Column index.
     */
    function toggleCell(row, col) {
        grid[row][col] = grid[row][col] === 1 ? 0 : 1;
        const cellEl = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        cellEl.classList.toggle('active');
    }

    /**
     * Check if all cells are off (win condition), update UI and handle next/finish.
     */
    function checkWin() {
        const allOff = grid.every(row => row.every(cell => cell === 0));
        
        if (allOff) {
            completedLevels++;
            completedLevelsEl.textContent = completedLevels;
            
            document.querySelectorAll('.cell').forEach(cell => {
                cell.style.pointerEvents = 'none';
            });
            
            if (currentLevel < 2) {
                showMessage('Siker! A réteg feltörve!', 'success');
                nextButton.classList.remove('hidden');
            } else {
                showMessage('Minden réteg feltörve! A lakat kinyílt!', 'success');
                finishButton.classList.remove('hidden');
                finishButton.textContent = 'Napló megnyitása';
            }
        }
    }

    /**
     * Show a message to the user.
     * @param {string} text - Message text.
     * @param {string} type - Message type (e.g., 'success').
     */
    function showMessage(text, type) {
        messageEl.textContent = text;
        messageEl.className = 'message ' + type;
        messageEl.style.display = 'block';
    }

    /**
     * Hide the message element.
     */
    function hideMessage() {
        messageEl.style.display = 'none';
    }

    nextButton.addEventListener('click', () => {
        currentLevel++;
        initLevel();
    });

    restartButton.addEventListener('click', () => {
        initLevel();
    });

    finishButton.addEventListener('click', () => {
        console.log('Finish button clicked. completedLevels:', completedLevels);
        if (completedLevels === 2) {
            if (window.apiClient && window.apiClient.completeGame) {
                window.apiClient.completeGame('game2')
                    .then(() => {
                        return fetch('/api/game/progress', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'same-origin',
                            body: JSON.stringify({ locationKey: 'otthon', sceneId: 'diary_lockpick_success' })
                        });
                    })
                    .then(() => {
                        window.location.href = 'start.html';
                    })
                    .catch(error => {
                        console.error('Error saving game progress:', error);
                        window.location.href = 'start.html';
                    });
            } else {
                fetch('/api/game/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'same-origin',
                    body: JSON.stringify({ locationKey: 'otthon', sceneId: 'diary_lockpick_success' })
                }).then(() => {
                    window.location.href = 'start.html';
                }).catch(error => {
                    console.error('Error saving game progress:', error);
                    window.location.href = 'start.html';
                });
            }
        } else {
            alert('A játék megszakítva! Nem sikerült feltörni a naplót.');
            if (window.apiClient && window.apiClient.completeGame) {
                window.apiClient.completeGame('game2')
                    .then(() => {
                        window.location.href = 'start.html';
                    })
                    .catch(error => {
                        console.error('Error saving game progress:', error);
                        window.location.href = 'start.html';
                    });
            } else {
                window.location.href = 'start.html';
            }
        }
    });

    const giveUpButton = document.createElement('button');
    giveUpButton.className = 'button';
    giveUpButton.textContent = 'Feladom';
    giveUpButton.style.marginTop = '10px';
    giveUpButton.style.background = '#8b4513';
    giveUpButton.addEventListener('click', () => {
        if (confirm('Biztosan feladod? A naplót nem fogod tudni kinyitni.')) {
            console.log('Give up button clicked. completedLevels:', completedLevels);
            console.log('Setting game2 failure via API');
            fetch('/api/game/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify({ locationKey: 'otthon', sceneId : "diary_lockpick_failure" })
            }).then(() => {
                window.location.href = 'start.html';
            }).catch(error => {
                console.error('Error saving game progress:', error);
                window.location.href = 'start.html';
            });
        }
    });
    document.querySelector('.game-container').appendChild(giveUpButton);

    initLevel();
})();