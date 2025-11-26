$(document).ready(function () {
    let fruits = [
        {name: 'alma', image: 'pictures/sobics/alma.png'},
        {name: 'szolo', image: 'pictures/sobics/szolo.png'},
        {name: 'lila_szolo', image: 'pictures/sobics/lila_szolo.png'},
        {name: 'korte', image: 'pictures/sobics/korte.png'}
    ];
    let score = 0;
    let gameRunning = false;

    function generateRandomFruit() {
        return fruits[Math.floor(Math.random() * fruits.length)];
    }

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

    function generateColumn() {
        const column = $('<div class="column"></div>');
        for (let i = 0; i < 3; i++) {
            column.append(generateRandomBrick());
        }
        return column;
    }

    function generateGameBoard() {
        for (let i = 0; i < 10; i++) {
            $('#game').append(generateColumn());
        }
    }

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
                    
                    // Check if player won
                    if (score >= 5000) {
                        gameRunning = false;
                        $('#startBtn').prop('disabled', false);
                        
                        // Save progress and redirect to success scene
                        const userStr = localStorage.getItem('user');
                        if (userStr) {
                            const user = JSON.parse(userStr);
                            const progressKey = `game_progress_${user.username}`;
                            const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
                            
                            // Set Piac location to scene 22 (successful help)
                            if (!progress.locationIndices) progress.locationIndices = {};
                            progress.locationIndices['Piac'] = 22;
                            
                            localStorage.setItem(progressKey, JSON.stringify(progress));
                        }
                        
                        alert('Sikerült a játék!');
                        
                        // Redirect back to the main game
                        setTimeout(function() {
                            window.location.href = 'start.html';
                        }, 100);
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
        
        // Save that we're returning from abandoned game and set scene index
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const progressKey = `game_progress_${user.username}`;
            const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
            
            // Set Piac location to scene 20 (angry merchant)
            if (!progress.locationIndices) progress.locationIndices = {};
            progress.locationIndices['Piac'] = 20;
            
            localStorage.setItem(progressKey, JSON.stringify(progress));
        }
        
        window.location.href = 'start.html';
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
                alert('Game Over');
                return false;
            }
        });
    }
});
