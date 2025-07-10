// Game State
let gameState = {
    mode: null, // 'multiplayer' or 'computer'
    currentPlayer: 'X',
    userSymbol: 'X',
    board: Array(9).fill(''),
    isGameActive: true,
    scores: { X: 0, O: 0 },
    audioUnlocked: false
};

// Audio Context for sound effects
let audioContext;
let clickSound, winSound;

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    initializeAudio();
    showScreen('home-screen');
});

// Initialize audio context and sounds
function initializeAudio() {
    // Create audio context on first user interaction
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
}

function unlockAudio() {
    if (!gameState.audioUnlocked) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            createSounds();
            gameState.audioUnlocked = true;
            console.log('Audio unlocked successfully');
        } catch (e) {
            console.log('Audio context not supported');
        }
    }
}

// Create sound effects using Web Audio API
function createSounds() {
    // Create click sound
    clickSound = createClickSound();
    // Create win sound
    winSound = createWinSound();
}

function createClickSound() {
    const duration = 0.1;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        data[i] = Math.sin(2 * Math.PI * 800 * i / sampleRate) * 0.3 * Math.exp(-i / (sampleRate * 0.05));
    }
    
    return buffer;
}

function createWinSound() {
    const duration = 1.5;
    const sampleRate = audioContext.sampleRate;
    const buffer = audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
        const t = i / sampleRate;
        const freq = 440 + Math.sin(t * 8) * 100;
        data[i] = Math.sin(2 * Math.PI * freq * t) * 0.3 * Math.exp(-t * 2);
    }
    
    return buffer;
}

function playSound(buffer) {
    if (gameState.audioUnlocked && audioContext && buffer) {
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start();
    }
}

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Mode selection
function selectMode(mode) {
    gameState.mode = mode;
    showScreen('symbol-screen');
}

// Symbol selection
function selectSymbol(symbol) {
    gameState.userSymbol = symbol;
    gameState.currentPlayer = symbol; // User's symbol goes first
    showScreen('game-screen');
    initializeBoard();
    updateTurnIndicator();
}

// Initialize the game board
function initializeBoard() {
    const board = document.getElementById('game-board');
    board.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('board-cell');
        cell.dataset.index = i;
        cell.addEventListener('click', () => handleCellClick(i));
        board.appendChild(cell);
    }
    
    gameState.board = Array(9).fill('');
    gameState.isGameActive = true;
    
    // Remove any existing winning lines
    document.querySelectorAll('.winning-line').forEach(line => line.remove());
}

// Handle cell click
function handleCellClick(index) {
    if (!gameState.isGameActive || gameState.board[index] !== '') {
        return;
    }
    
    makeMove(index, gameState.currentPlayer);
    
    if (gameState.mode === 'computer' && gameState.isGameActive && gameState.currentPlayer !== gameState.userSymbol) {
        setTimeout(() => {
            makeComputerMove();
        }, 500);
    }
}

// Make a move
function makeMove(index, player) {
    gameState.board[index] = player;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = player;
    cell.classList.add('filled');
    
    playSound(clickSound);
    
    if (checkWinner()) {
        handleGameEnd(player);
    } else if (gameState.board.every(cell => cell !== '')) {
        handleGameEnd(null); // Tie
    } else {
        gameState.currentPlayer = gameState.currentPlayer === 'X' ? 'O' : 'X';
        updateTurnIndicator();
    }
}

// Computer AI move
function makeComputerMove() {
    const computerSymbol = gameState.userSymbol === 'X' ? 'O' : 'X';
    const bestMove = getBestMove();
    makeMove(bestMove, computerSymbol);
}

// Simple AI algorithm using minimax
function getBestMove() {
    const computerSymbol = gameState.userSymbol === 'X' ? 'O' : 'X';
    let bestScore = -Infinity;
    let bestMove = 0;
    
    for (let i = 0; i < 9; i++) {
        if (gameState.board[i] === '') {
            gameState.board[i] = computerSymbol;
            let score = minimax(false, computerSymbol);
            gameState.board[i] = '';
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = i;
            }
        }
    }
    
    return bestMove;
}

function minimax(isMaximizing, computerSymbol) {
    const humanSymbol = gameState.userSymbol;
    
    if (checkWinnerForBoard(computerSymbol)) return 10;
    if (checkWinnerForBoard(humanSymbol)) return -10;
    if (gameState.board.every(cell => cell !== '')) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (gameState.board[i] === '') {
                gameState.board[i] = computerSymbol;
                let score = minimax(false, computerSymbol);
                gameState.board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (gameState.board[i] === '') {
                gameState.board[i] = humanSymbol;
                let score = minimax(true, computerSymbol);
                gameState.board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Check winner for minimax
function checkWinnerForBoard(player) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    return winningCombinations.some(combination => 
        combination.every(index => gameState.board[index] === player)
    );
}

// Check for winner
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6] // Diagonals
    ];
    
    for (let combination of winningCombinations) {
        const [a, b, c] = combination;
        if (gameState.board[a] && 
            gameState.board[a] === gameState.board[b] && 
            gameState.board[a] === gameState.board[c]) {
            drawWinningLine(combination);
            return true;
        }
    }
    
    return false;
}

// Draw winning line
function drawWinningLine(combination) {
    const board = document.getElementById('game-board');
    const cells = document.querySelectorAll('.board-cell');
    
    const line = document.createElement('div');
    line.classList.add('winning-line');
    
    const [a, b, c] = combination;
    const cellA = cells[a];
    const cellC = cells[c];
    
    const boardRect = board.getBoundingClientRect();
    const cellARect = cellA.getBoundingClientRect();
    const cellCRect = cellC.getBoundingClientRect();
    
    const startX = cellARect.left + cellARect.width / 2 - boardRect.left;
    const startY = cellARect.top + cellARect.height / 2 - boardRect.top;
    const endX = cellCRect.left + cellCRect.width / 2 - boardRect.left;
    const endY = cellCRect.top + cellCRect.height / 2 - boardRect.top;
    
    const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
    
    line.style.position = 'absolute';
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.width = `${length}px`;
    line.style.height = '6px';
    line.style.transformOrigin = '0 50%';
    line.style.transform = `rotate(${angle}deg)`;
    
    board.appendChild(line);
}

// Handle game end
function handleGameEnd(winner) {
    gameState.isGameActive = false;
    
    if (winner) {
        gameState.scores[winner]++;
        updateScores();
        showWinPopup(winner);
        playSound(winSound);
        startConfetti();
    } else {
        showTiePopup();
    }
}

// Update turn indicator
function updateTurnIndicator() {
    const turnText = document.getElementById('turn-text');
    turnText.textContent = `${gameState.currentPlayer}'s Turn`;
}

// Update scores
function updateScores() {
    document.getElementById('score-x').textContent = gameState.scores.X;
    document.getElementById('score-o').textContent = gameState.scores.O;
}

// Show win popup
function showWinPopup(winner) {
    const popup = document.getElementById('game-popup');
    const title = document.getElementById('popup-title');
    const message = document.getElementById('popup-message');
    
    title.textContent = 'We Have a Winner!';
    message.textContent = `Player ${winner} wins this round!`;
    
    popup.classList.add('show');
}

// Show tie popup
function showTiePopup() {
    const popup = document.getElementById('game-popup');
    const title = document.getElementById('popup-title');
    const message = document.getElementById('popup-message');
    
    title.textContent = 'It\'s a Tie!';
    message.textContent = 'Great game! Nobody wins this round.';
    
    popup.classList.add('show');
}

// Replay game
function replayGame() {
    document.getElementById('game-popup').classList.remove('show');
    stopConfetti();
    initializeBoard();
    // Keep the same first player
    gameState.currentPlayer = gameState.userSymbol;
    updateTurnIndicator();
}

// Go to home screen
function goHome() {
    document.getElementById('game-popup').classList.remove('show');
    stopConfetti();
    showScreen('home-screen');
    // Reset game state
    gameState.mode = null;
    gameState.currentPlayer = 'X';
    gameState.userSymbol = 'X';
    gameState.board = Array(9).fill('');
    gameState.isGameActive = true;
    gameState.scores = { X: 0, O: 0 };
    updateScores();
}

// Confetti animation
let confettiParticles = [];
let confettiAnimationId;

function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Create confetti particles
    for (let i = 0; i < 100; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: -10,
            dx: (Math.random() - 0.5) * 4,
            dy: Math.random() * 3 + 2,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            size: Math.random() * 5 + 2,
            gravity: 0.1,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }
    
    animateConfetti(ctx, canvas);
}

function animateConfetti(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    confettiParticles.forEach((particle, index) => {
        particle.x += particle.dx;
        particle.y += particle.dy;
        particle.dy += particle.gravity;
        particle.rotation += particle.rotationSpeed;
        
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation * Math.PI / 180);
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        ctx.restore();
        
        // Remove particles that have fallen off screen
        if (particle.y > canvas.height) {
            confettiParticles.splice(index, 1);
        }
    });
    
    if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(() => animateConfetti(ctx, canvas));
    }
}

function stopConfetti() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
    }
    confettiParticles = [];
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Handle window resize for confetti canvas
window.addEventListener('resize', () => {
    const canvas = document.getElementById('confetti-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});