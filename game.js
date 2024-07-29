const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const startMessage = document.getElementById('start-message');

canvas.width = 400;
canvas.height = 600;

const doodle = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 40,
    height: 40,
    dx: 0,
    dy: 0
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
    doodle.x = canvas.width / 2;
    doodle.y = canvas.height - 100;
    doodle.dy = 0;

    for (let i = 0; i < 10; i++) {
        platforms.push(createPlatform(
            Math.random() * (canvas.width - 80),
            i * 60,
            80,
            Math.random() < 0.3 ? 'disappearing' : 'normal'
        ));
    }
}

function update() {
    if (!gameStarted || gameOver) return;

    doodle.x += doodle.dx;
    doodle.y += doodle.dy;
    doodle.dy += 0.2;

    if (doodle.x < 0) doodle.x = canvas.width;
    if (doodle.x > canvas.width) doodle.x = 0;

    if (doodle.y > canvas.height) {
        gameOver = true;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = `High Score: ${highScore}`;
        }
        startMessage.textContent = 'Game Over! Press Spacebar to Restart';
        startMessage.style.display = 'block';
    }

    platforms.forEach((platform, index) => {
        if (doodle.dy > 0 && 
            doodle.y + doodle.height > platform.y &&
            doodle.y + doodle.height < platform.y + platform.height &&
            doodle.x + doodle.width > platform.x &&
            doodle.x < platform.x + platform.width) {
            doodle.dy = -10;
            if (platform.type === 'disappearing') {
                platforms.splice(index, 1);
            }
        }
    });

    obstacles.forEach((obstacle, index) => {
        obstacle.x += obstacle.dx;
        if (obstacle.x < 0 || obstacle.x + obstacle.width > canvas.width) {
            obstacle.dx *= -1;
        }

        if (doodle.x < obstacle.x + obstacle.width &&
            doodle.x + doodle.width > obstacle.x &&
            doodle.y < obstacle.y + obstacle.height &&
            doodle.y + doodle.height > obstacle.y) {
            gameOver = true;
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = `High Score: ${highScore}`;
            }
            startMessage.textContent = 'Game Over! Press Spacebar to Restart';
            startMessage.style.display = 'block';
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
                // Implement invincibility logic here
            }
            powerUps.splice(index, 1);
        }
    });

    if (doodle.y < canvas.height / 2) {
        const offset = canvas.height / 2 - doodle.y;
        doodle.y = canvas.height / 2;
        platforms.forEach(platform => platform.y += offset);
        obstacles.forEach(obstacle => obstacle.y += offset);
        powerUps.forEach(powerUp => powerUp.y += offset);
        score += Math.floor(offset);
        scoreElement.textContent = `Score: ${score}`;

        // Remove platforms, obstacles, and power-ups that are below the screen
        platforms.forEach((platform, index) => {
            if (platform.y > canvas.height) {
                platforms.splice(index, 1);
            }
        });

        obstacles.forEach((obstacle, index) => {
            if (obstacle.y > canvas.height) {
                obstacles.splice(index, 1);
            }
        });

        powerUps.forEach((powerUp, index) => {
            if (powerUp.y > canvas.height) {
                powerUps.splice(index, 1);
            }
        });

        // Generate new platforms
        while (platforms.length < 10) {
            const lastPlatform = platforms[platforms.length - 1];
            platforms.push(createPlatform(
                Math.random() * (canvas.width - 80),
                lastPlatform ? lastPlatform.y - 60 : 0,
                80,
                Math.random() < 0.3 ? 'disappearing' : 'normal'
            ));

            if (Math.random() < 0.1) {
                obstacles.push(createObstacle(Math.random() * (canvas.width - 40), platforms[platforms.length - 1].y - 30));
            }

            if (Math.random() < 0.05) {
                powerUps.push(createPowerUp(
                    Math.random() * (canvas.width - 20),
                    platforms[platforms.length - 1].y - 30,
                    Math.random() < 0.5 ? 'superJump' : 'invincibility'
                ));
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'green';
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
        if (!gameStarted) {
            gameStarted = true;
            gameOver = false;
            initGame();
            startMessage.style.display = 'none';
        } else if (gameOver) {
            gameOver = false;
            initGame();
            startMessage.style.display = 'none';
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') doodle.dx = 0;
});

gameLoop();
