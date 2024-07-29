const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startMessage = document.getElementById('start-message');
const gameContainer = document.getElementById('game-container');

// Add legend to the existing score container
const legendElement = document.createElement('div');
legendElement.id = 'legend';
document.getElementById('score-container').appendChild(legendElement);

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

const doodle = {
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 100,
    width: 40,
    height: 40,
    dx: 0,
    dy: 0,
    isInvincible: false
};

const platforms = [];
const obstacles = [];
const powerUps = [];

let score = 0;
let highScore = 0;
let gameStarted = false;
let gameOver = false;

function createPlatform(x, y, width, type = 'normal') {
    return { x, y, width, height: 10, type };
}

function createObstacle(x, y) {
    return { x, y, width: 40, height: 20, dx: 2 };
}

function createPowerUp(x, y, type) {
    return { x, y, width: 20, height: 20, type };
}

function initGame() {
    platforms.length = 0;
    obstacles.length = 0;
    powerUps.length = 0;
    score = 0;
    doodle.isInvincible = false;

    // Create the initial platform for the doodle to spawn on
    const initialPlatform = createPlatform(
        GAME_WIDTH / 2 - 40,
        GAME_HEIGHT - 60,
        80,
        'normal'
    );
    platforms.push(initialPlatform);

    // Set the doodle's position to be on top of the initial platform
    doodle.x = initialPlatform.x + initialPlatform.width / 2 - doodle.width / 2;
    doodle.y = initialPlatform.y - doodle.height;
    doodle.dy = 0;

    // Generate the rest of the platforms
    const platformCount = Math.floor(GAME_HEIGHT / 60);
    for (let i = 1; i < platformCount; i++) {
        platforms.push(createPlatform(
            Math.random() * (GAME_WIDTH - 80),
            GAME_HEIGHT - 60 - i * 60,
            80,
            Math.random() < 0.3 ? 'disappearing' : 'normal'
        ));
    }

    // Update legend
    updateLegend();
}

function updateLegend() {
    legendElement.innerHTML = `
        <div style="color: yellow;">⭐ Super Jump</div>
        <div style="color: purple;">🛡️ Invincibility (${doodle.isInvincible ? 'Active' : 'Inactive'})</div>
    `;
}

function update() {
    if (!gameStarted || gameOver) return;

    doodle.x += doodle.dx;
    doodle.y += doodle.dy;
    doodle.dy += 0.5; // Increased gravity for more noticeable falling

    if (doodle.x < 0) doodle.x = GAME_WIDTH;
    if (doodle.x > GAME_WIDTH) doodle.x = 0;

    if (doodle.y > GAME_HEIGHT) {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = `High Score: ${highScore}`;
        }
        startMessage.textContent = 'Game Over! Press Spacebar to Restart';
        startMessage.style.display = 'block';
    }

    let onPlatform = false;
    platforms.forEach((platform, index) => {
        if (doodle.dy > 0 && 
            doodle.y + doodle.height > platform.y &&
            doodle.y + doodle.height < platform.y + platform.height + doodle.dy &&
            doodle.x + doodle.width > platform.x &&
            doodle.x < platform.x + platform.width) {
            doodle.dy = -10;
            onPlatform = true;
            if (platform.type === 'disappearing') {
                platforms.splice(index, 1);
            }
        }
    });

    obstacles.forEach((obstacle) => {
        obstacle.x += obstacle.dx;
        if (obstacle.x < 0 || obstacle.x + obstacle.width > GAME_WIDTH) {
            obstacle.dx *= -1;
        }

        if (doodle.x < obstacle.x + obstacle.width &&
            doodle.x + doodle.width > obstacle.x &&
            doodle.y < obstacle.y + obstacle.height &&
            doodle.y + doodle.height > obstacle.y) {
            if (!doodle.isInvincible) {
                gameOver = true;
                if (score > highScore) {
                    highScore = score;
                    highScoreElement.textContent = `High Score: ${highScore}`;
                }
                startMessage.textContent = 'Game Over! Press Spacebar to Restart';
                startMessage.style.display = 'block';
            }
        }
    });

    powerUps.forEach((powerUp, index) => {
        if (doodle.x < powerUp.x + powerUp.width &&
            doodle.x + doodle.width > powerUp.x &&
            doodle.y < powerUp.y + powerUp.height &&
            doodle.y + doodle.height > powerUp.y) {
            if (powerUp.type === 'superJump') {
                doodle.dy = -15;
            } else if (powerUp.type === 'invincibility') {
                doodle.isInvincible = true;
                setTimeout(() => {
                    doodle.isInvincible = false;
                    updateLegend();
                }, 5000); // Invincibility lasts for 5 seconds
            }
            powerUps.splice(index, 1);
            updateLegend();
        }
    });

    if (doodle.y < GAME_HEIGHT / 2 && doodle.dy < 0) {
        const offset = GAME_HEIGHT / 2 - doodle.y;
        doodle.y = GAME_HEIGHT / 2;
        platforms.forEach(platform => platform.y += offset);
        obstacles.forEach(obstacle => obstacle.y += offset);
        powerUps.forEach(powerUp => powerUp.y += offset);
        score += Math.floor(offset);
        scoreElement.textContent = `Score: ${score}`;

        // Remove platforms, obstacles, and power-ups that are below the screen
        platforms = platforms.filter(platform => platform.y <= GAME_HEIGHT);
        obstacles = obstacles.filter(obstacle => obstacle.y <= GAME_HEIGHT);
        powerUps = powerUps.filter(powerUp => powerUp.y <= GAME_HEIGHT);

        // Generate new platforms
        while (platforms.length < 10) {
            const lastPlatform = platforms[platforms.length - 1];
            platforms.push(createPlatform(
                Math.random() * (GAME_WIDTH - 80),
                lastPlatform ? lastPlatform.y - 60 : 0,
                80,
                Math.random() < 0.3 ? 'disappearing' : 'normal'
            ));

            if (Math.random() < 0.1) {
                obstacles.push(createObstacle(Math.random() * (GAME_WIDTH - 40), platforms[platforms.length - 1].y - 30));
            }

            if (Math.random() < 0.05) {
                powerUps.push(createPowerUp(
                    Math.random() * (GAME_WIDTH - 20),
                    platforms[platforms.length - 1].y - 30,
                    Math.random() < 0.5 ? 'superJump' : 'invincibility'
                ));
            }
        }
    }

    // Ensure the doodle stays within the game bounds
    doodle.y = Math.min(Math.max(doodle.y, 0), GAME_HEIGHT - doodle.height);
}

function draw() {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = doodle.isInvincible ? 'gold' : 'green';
    ctx.fillRect(doodle.x, doodle.y, doodle.width, doodle.height);

    platforms.forEach(platform => {
        ctx.fillStyle = platform.type === 'disappearing' ? 'orange' : 'blue';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    obstacles.forEach(obstacle => {
        ctx.fillStyle = 'red';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.type === 'superJump' ? 'yellow' : 'purple';
        ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') doodle.dx = -5;
    if (e.code === 'ArrowRight') doodle.dx = 5;
    if (e.code === 'Space') {
        if (!gameStarted || gameOver) {
            gameStarted = true;
            gameOver = false;
            initGame();
            startMessage.style.display = 'none';
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') doodle.dx = 0;
});

initGame();
gameLoop();
