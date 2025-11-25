$(document).ready(function () {
    let colors = ['red', 'green', 'blue', 'yellow'];
    let score = 0;
    let gameRunning = false;

    function generateRandomColor() {
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function generateRandomBrick() {
        return $('<div class="brick"></div>').css({
            backgroundColor: generateRandomColor()
        });
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
                let isSameColor = lastFourBricks.map(function () {
                    return $(this).css('background-color');
                }).get().every(function (val, i, arr) {
                    return val === arr[0];
                });
                if (isSameColor) {
                    lastFourBricks.remove();
                    score += 400;
                    $('#score').text('Pontszám: ' + score);
                    
                    // Check if player won
                    if (score >= 5000) {
                        gameRunning = false;
                        $('#startBtn').prop('disabled', false);
                        alert('Sikerült a játék!');
                        // Redirect back to the main game
                        window.location.href = 'start.html';
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
        $('#score').text('A végleges pontszámod: ' + score);
        $('#startBtn').prop('disabled', false);
        gameRunning = false;
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
