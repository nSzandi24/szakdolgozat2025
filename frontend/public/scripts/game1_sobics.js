/**
 * Fruit stacking mini-game logic.
 * Handles game board generation, scoring, win/loss, and user interactions.
 * @file game1_sobics.js
 */

$(document).ready(function () {
    let fruits = [
        {name: 'alma', image: 'pictures/sobics/alma.png'},
        {name: 'szolo', image: 'pictures/sobics/szolo.png'},
        {name: 'lila_szolo', image: 'pictures/sobics/lila_szolo.png'},
        {name: 'korte', image: 'pictures/sobics/korte.png'}
    ];
    let score = 0;
    let gameRunning = false;

    /**
     * Generate a random fruit object from the fruits array.
     * @returns {Object} Random fruit object.
     */
    function generateRandomFruit() {
        return fruits[Math.floor(Math.random() * fruits.length)];
    }

    /**
     * Generate a random fruit brick DOM element.
     * @returns {jQuery} Brick element with random fruit.
     */
    function generateRandomBrick() {
        const fruit = generateRandomFruit();
        return $('<div class="brick"></div>')
            .css({
                backgroundImage: `url(${fruit.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            })
            .attr('data-fruit', fruit.name);
    }

    /**
     * Generate a column of 3 random bricks.
     * @returns {jQuery} Column element.
     */
    function generateColumn() {
        const column = $('<div class="column"></div>');
        for (let i = 0; i < 3; i++) {
            column.append(generateRandomBrick());
        }
        return column;
    }

    /**
     * Generate the full game board with 10 columns.
     */
    function generateGameBoard() {
        for (let i = 0; i < 10; i++) {
            $('#game').append(generateColumn());
        }
    }

    /**
     * Check for 4 matching bricks in a column and remove them, update score, and handle win condition.
     */
    function checkAndRemoveMatches() {
        $('.column').each(function () {
            let bricks = $(this).children('.brick');
            if (bricks.length >= 4) {
                let lastFourBricks = bricks.slice(-4);
                let isSameFruit = lastFourBricks.map(function () {
                    return $(this).attr('data-fruit');
                }).get().every(function (val, i, arr) {
                    return val === arr[0];
                });
                if (isSameFruit) {
                    lastFourBricks.remove();
                    score += 400;
                    $('#score').text('Pontszám: ' + score);
                    
                    if (score >= 5000) {
                        gameRunning = false;
                        $('#startBtn').prop('disabled', false);
                        
                        alert('Sikerült a játék!');

                        if (window.apiClient && window.apiClient.completeGame) {
                            window.apiClient.completeGame('game1')
                                .then(() => {
                                    return fetch('/api/game/progress', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        credentials: 'same-origin',
                                        body: JSON.stringify({ locationKey: 'piac', sceneId: 'game_success' })
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
                                body: JSON.stringify({ locationKey: 'piac', sceneId: 'game_success' })
                            }).then(() => {
                                window.location.href = 'start.html';
                            }).catch(error => {
                                console.error('Error saving game progress:', error);
                                window.location.href = 'start.html';
                            });
                        }

                        return;
                    }
                }
            }
        });
        $('#score').text('Pontszám: ' + score);
    }

    $('#startBtn').on('click', function () {
        $('#game').empty();
        score = 0;
        $('#score').text('Pontszám: 0');
        generateGameBoard();
        $('#startBtn').prop('disabled', true);
        gameRunning = true;
    });

    $('#endBtn').on('click', function () {
        gameRunning = false;
        $('#startBtn').prop('disabled', false);
        if (window.apiClient && window.apiClient.completeGame) {
            window.apiClient.completeGame('game1')
                .then(() => {
                    return fetch('/api/game/progress', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'same-origin',
                        body: JSON.stringify({ locationKey: 'piac', sceneId: 'merchant_rejects_joke' })
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
                body: JSON.stringify({ locationKey: 'piac', sceneId: 'merchant_rejects_joke' })
            }).then(() => {
                window.location.href = 'start.html';
            }).catch(error => {
                console.error('Error saving game progress:', error);
                window.location.href = 'start.html';
            });
        }
    });

    let selectedBrick = null;

    $('#game').on('click', '.brick', function () {
        if (!gameRunning) return;

        let isBottomRow = $(this).is(':last-child');
        if (!isBottomRow) return;

        if (selectedBrick === null) {
            selectedBrick = this;
            $(this).css('opacity', '0.5');
        } else {
            if (this === selectedBrick) return;
            let targetBrick = $(this);
            let targetColumn = targetBrick.parent();
            let newBrick = $(selectedBrick).clone();
            targetColumn.append(newBrick);
            $(selectedBrick).remove();
            checkAndRemoveMatches();
            selectedBrick = null;
            $('.brick').css('opacity', '1');

            let randomColumnIndex;
            do {
                randomColumnIndex = Math.floor(Math.random() * 10);
            } while (randomColumnIndex === targetColumn.index());

            let randomColumn = $('#game .column').eq(randomColumnIndex);
            randomColumn.append(generateRandomBrick());
            checkIfLost();
        }
    });

    /**
     * Check if any column exceeds the game area height (loss condition).
     * Ends the game and handles loss UI/logic.
     */
    function checkIfLost() {
        let gameHeight = $('#game').height();
        $('.column').each(function () {
            let columnHeight = 0;
            $(this).children('.brick').each(function () {
                columnHeight += $(this).outerHeight(true);
            });
            if (columnHeight >= gameHeight) {
                gameRunning = false;
                $('#score').text('A végleges pontszámod: ' + score);
                $('#startBtn').prop('disabled', false);
                if (window.apiClient && window.apiClient.completeGame) {
                    window.apiClient.completeGame('game1')
                        .then(() => {
                            alert('Elvesztetted a játékot!');
                            window.location.href = 'start.html';
                        })
                        .catch(error => {
                            console.error('Error saving game progress:', error);
                            window.location.href = 'start.html';
                        });
                } else {
                    alert('Elvesztetted a játékot!');
                    window.location.href = 'start.html';
                }
                return false;
            }
        });
    }
});
