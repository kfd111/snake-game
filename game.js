// Canvas and context setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [
    { x: 10, y: 10 }
];

let food = {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
};

let dx = 0;
let dy = 0;
let nextDx = 0;
let nextDy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameRunning = false;
let gamePaused = false;
let gameSpeed = 100; // milliseconds

// Update high score display
document.getElementById('highScore').textContent = highScore;

// Button event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Keyboard controls
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(e) {
    switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (dy === 0) {
                nextDx = 0;
                nextDy = -1;
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (dy === 0) {
                nextDx = 0;
                nextDy = 1;
            }
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (dx === 0) {
                nextDx = -1;
                nextDy = 0;
            }
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (dx === 0) {
                nextDx = 1;
                nextDy = 0;
            }
            e.preventDefault();
            break;
    }
}

function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        document.getElementById('startBtn').textContent = 'Resume';
        document.getElementById('pauseBtn').textContent = 'Pause';
        gameLoop();
    }
}

function togglePause() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        document.getElementById('pauseBtn').textContent = gamePaused ? 'Resume' : 'Pause';
        if (!gamePaused) {
            gameLoop();
        }
    }
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    dx = 0;
    dy = 0;
    nextDx = 0;
    nextDy = 0;
    score = 0;
    gameRunning = false;
    gamePaused = false;
    document.getElementById('score').textContent = score;
    document.getElementById('startBtn').textContent = 'Start Game';
    document.getElementById('pauseBtn').textContent = 'Pause';
    generateFood();
    draw();
}

function generateFood() {
    let newFood;
    let foodOnSnake = true;
    
    while (foodOnSnake) {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
        
        foodOnSnake = snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        );
    }
    
    food = newFood;
}

function update() {
    if (!gameRunning || gamePaused) return;

    // Update direction
    dx = nextDx;
    dy = nextDy;

    // Calculate new head position
    const head = snake[0];
    let newHead = {
        x: head.x + dx,
        y: head.y + dy
    };

    // Check wall collision
    if (newHead.x < 0 || newHead.x >= tileCount || 
        newHead.y < 0 || newHead.y >= tileCount) {
        endGame();
        return;
    }

    // Check self collision
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        endGame();
        return;
    }

    snake.unshift(newHead);

    // Check food collision
    if (newHead.x === food.x && newHead.y === food.y) {
        score += 10;
        document.getElementById('score').textContent = score;
        generateFood();
        
        // Increase speed slightly with score
        if (score % 50 === 0 && gameSpeed > 50) {
            gameSpeed -= 5;
        }
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (optional)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#4CAF50';
            ctx.shadowColor = '#4CAF50';
            ctx.shadowBlur = 10;
        } else {
            // Body
            ctx.fillStyle = '#45a049';
            ctx.shadowColor = 'transparent';
        }
        ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, 
                    gridSize - 2, gridSize - 2);
    });

    // Draw food
    ctx.fillStyle = '#ff6b6b';
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, 
            gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Draw pause text if paused
    if (gamePaused) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    }
}

function endGame() {
    gameRunning = false;
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
        alert(`Game Over! New High Score: ${score}! 🎉`);
    } else {
        alert(`Game Over! Score: ${score}`);
    }
    
    document.getElementById('startBtn').textContent = 'Start Game';
    document.getElementById('pauseBtn').textContent = 'Pause';
}

function gameLoop() {
    update();
    draw();

    if (gameRunning && !gamePaused) {
        setTimeout(gameLoop, gameSpeed);
    }
}

// Initial draw
draw();
