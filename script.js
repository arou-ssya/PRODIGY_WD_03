const cells = document.querySelectorAll('[data-cell]');
const board = document.getElementById('gameBoard');
const restartButton = document.getElementById('restartButton');
const newGameButton = document.getElementById('newGameButton');
const difficultySelect = document.getElementById('difficulty');
const message = document.getElementById('message');
const xWinsDisplay = document.getElementById('xWins');
const oWinsDisplay = document.getElementById('oWins');
const drawsDisplay = document.getElementById('draws');

let currentPlayer = 'X';
let difficulty = 'easy';
let xWins = 0;
let oWins = 0;
let draws = 0;

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function evaluateBoard() {
    for (const [a, b, c] of winningCombinations) {
        if (cells[a].textContent && cells[a].textContent === cells[b].textContent && cells[a].textContent === cells[c].textContent) {
            return cells[a].textContent === 'X' ? 10 : -10;
        }
    }
    return [...cells].every(cell => cell.textContent) ? 0 : null; 
}

function minimax(isMaximizing) {
    const score = evaluateBoard();
    if (score !== null) return score;

    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (const cell of cells) {
        if (cell.textContent === '') {
            cell.textContent = isMaximizing ? 'O' : 'X';
            const moveScore = minimax(!isMaximizing);
            cell.textContent = '';

            if (isMaximizing) {
                bestScore = Math.max(moveScore, bestScore);
            } else {
                bestScore = Math.min(moveScore, bestScore);
            }
        }
    }
    return bestScore;
}

function bestMove() {
    let move;
    let bestScore = -Infinity;

    for (const cell of cells) {
        if (cell.textContent === '') {
            cell.textContent = 'O';
            const score = minimax(false);
            cell.textContent = '';

            if (score > bestScore) {
                bestScore = score;
                move = cell;
            }
        }
    }
    return move;
}

function mediumMove() {
    const winningMove = findWinningMove('O') || findBlockingMove('X');
    if (winningMove) return winningMove;
    
    return randomMove();
}

function findWinningMove(player) {
    for (const [a, b, c] of winningCombinations) {
        if (cells[a].textContent === player && cells[b].textContent === player && cells[c].textContent === '') {
            return cells[c];
        }
        if (cells[b].textContent === player && cells[c].textContent === player && cells[a].textContent === '') {
            return cells[a];
        }
        if (cells[a].textContent === player && cells[c].textContent === player && cells[b].textContent === '') {
            return cells[b];
        }
    }
    return null;
}

function findBlockingMove(opponent) {
    return findWinningMove(opponent);
}

function randomMove() {
    const emptyCells = [...cells].filter(cell => cell.textContent === '');
    if (emptyCells.length === 0) return null;
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function aiMove() {
    let move;
    switch (difficulty) {
        case 'easy':
            move = bestMove();
            break;
        case 'medium':
            move = mediumMove();
            break;
        case 'hard':
            move = randomMove();
            break;
    }
    
    if (move) {
        move.textContent = 'O';
        if (checkWin('O')) {
            message.textContent = 'O wins!';
            oWins++;
            updateScore();
            cells.forEach(cell => cell.removeEventListener('click', handleClick));
        } else if ([...cells].every(cell => cell.textContent)) {
            message.textContent = 'Draw!';
            draws++;
            updateScore();
        } else {
            currentPlayer = 'X';
        }
    }
}

function handleClick(e) {
    const cell = e.target;
    if (cell.textContent !== '' || currentPlayer === 'O') return;

    cell.textContent = currentPlayer;
    if (checkWin(currentPlayer)) {
        message.textContent = `${currentPlayer} wins!`;
        currentPlayer === 'X' ? xWins++ : oWins++;
        updateScore();
        cells.forEach(cell => cell.removeEventListener('click', handleClick));
    } else if ([...cells].every(cell => cell.textContent)) {
        message.textContent = 'Draw!';
        draws++;
        updateScore();
    } else {
        currentPlayer = 'O';
        setTimeout(aiMove, 500);
    }
}

function checkWin(player) {
    return winningCombinations.some(combination => {
        const [a, b, c] = combination;
        return cells[a].textContent === player && cells[b].textContent === player && cells[c].textContent === player;
    });
}

function restartGame() {
    cells.forEach(cell => cell.textContent = '');
    currentPlayer = 'X';
    message.textContent = '';
    cells.forEach(cell => cell.addEventListener('click', handleClick));
}

function newGame() {
    xWins = 0;
    oWins = 0;
    draws = 0;
    updateScore();
    restartGame();
}

function updateScore() {
    xWinsDisplay.textContent = xWins;
    oWinsDisplay.textContent = oWins;
    drawsDisplay.textContent = draws;
}

difficultySelect.addEventListener('change', (e) => {
    difficulty = e.target.value;
});

cells.forEach(cell => cell.addEventListener('click', handleClick));
restartButton.addEventListener('click', restartGame);
newGameButton.addEventListener('click', newGame);
