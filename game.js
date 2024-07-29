const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: canvas.width / 2,
    y: 0,
    width: 30,
    height: 30,
    velocityY: 0,
    isInvincible: false,
    invincibleTimer: 0,
    hasSuperJump: false,
    superJumpTimer: 0
};

let platforms = [];
let obstacles = [];
let powerUps = [];
let score = 0;
let highScore = 0;
let gameStarted = false;

function generatePlatform(y) {
    return {
        x: Math.random() * (canvas.width - 60),
        y: y,
        width: 60,
        height: 10
    };
}

function generateObstacle(y) {
    return {
        x: Math.random() * (canvas.width - 40),
        y: y,
        width: 40,
        height: 20,
        velocityX: (Math.random() > 0.5 ? 1 : -1) * 2
    };
}

function generatePowerUp(y) {
    return {
        x: Math.random() * (canvas.width - 20),
        y: y,
        width: 20,
        height: 20,
        type: Math.random() > 0.5 ? 'invincibility' : 'superJump'
    };
}

function generateInitialPlatforms() {
    platforms = [];
    obstacles = [];
    powerUps = [];
    let startPlatform = {
        x: canvas.width / 2 - 30,
        y: canvas.height - 50,
        width: 60,
        height: 10
    };
    platforms.push(startPlatform);

    player.x = startPlatform.x + startPlatform.width / 2 - player.width / 2;
    player.y = startPlatform.y - player.height;

    for (let i = 1; i < 7; i++) {
        platforms.push(generatePlatform(canvas.height - 50 - i * 100));
        if (i > 2 && Math.random() < 0.3) {
            obstacles.push(generateObstacle(canvas.height - 50 - i * 100 - 30));
        }
        if (i > 3 && Math.random() < 0.2) {
            powerUps.push(generatePowerUp(canvas.height - 50 - i * 100 - 30));
        }
    }
}

function drawPlayer() {
    ctx.fillStyle = player.isInvincible ? 'gold' : 'green';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    if (player.hasSuperJump) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x, player.y + player.height, player.width, 5);
    }
}

function drawPlatforms() {
    ctx.fillStyle = 'brown';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawObstacles() {
    ctx.fillStyle = 'red';
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}

function drawPowerUps() {
    powerUps.forEach(powerUp => {
        ctx.fillStyle = powerUp.type === 'invincibility' ? 'gold' : 'blue';
        ctx.beginPath();
        ctx.arc(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, powerUp.width / 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`High Score: ${highScore}`, canvas.width - 150, 30);
}

function updateGame() {
    if (!gameStarted) return;

    player.velocityY += 0.5; // Gravity
    player.y += player.velocityY;

    // Check collision with platforms
    platforms.forEach(platform => {
        if (player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.velocityY > 0) {
            player.velocityY = player.hasSuperJump ? -20 : -13; // Jump
        }
    });

    // Move and check collision with obstacles
    obstacles.forEach(obstacle => {
        obstacle.x += obstacle.velocityX;
        if (obstacle.x < 0 || obstacle.x + obstacle.width > canvas.width) {
            obstacle.velocityX *= -1;
        }
        if (!player.isInvincible && 
            player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            gameOver();
        }
    });

    // Check collision with power-ups
    powerUps = powerUps.filter(powerUp => {
        if (player.x < powerUp.x + powerUp.width &&
            player.x + player.width > powerUp.x &&
            player.y < powerUp.y + powerUp.height &&
            player.y + player.height > powerUp.y) {
            if (powerUp.type === 'invincibility') {
                player.isInvincible = true;
                player.invincibleTimer = 300; // 5 seconds (60 fps * 5)
            } else {
                player.hasSuperJump = true;
                player.superJumpTimer = 300; // 5 seconds
            }
            return false;
        }
        return true;
    });

    // Move platforms down and generate new ones
    if (player.y < canvas.height / 2) {
        let deltaY = canvas.height / 2 - player.y;
        player.y = canvas.height / 2;
        platforms.forEach(platform => {
            platform.y += deltaY;
        });
        obstacles.forEach(obstacle => {
            obstacle.y += deltaY;
        });
        powerUps.forEach(powerUp => {
            powerUp.y += deltaY;
        });
        score += Math.floor(deltaY);

        if (platforms[platforms.length - 1].y > 100) {
            platforms.push(generatePlatform(0));
            if (Math.random() < 0.3) {
                obstacles.push(generateObstacle(-30));
            }
            if (Math.random() < 0.2) {
                powerUps.push(generatePowerUp(-30));
            }
        }
    }

    // Remove off-screen elements
    platforms = platforms.filter(platform => platform.y < canvas.height);
    obstacles = obstacles.filter(obstacle => obstacle.y < canvas.height);
    powerUps = powerUps.filter(powerUp => powerUp.y < canvas.height);

    // Update power-up timers
    if (player.isInvincible) {
        player.invincibleTimer--;
        if (player.invincibleTimer <= 0) {
            player.isInvincible = false;
        }
    }
    if (player.hasSuperJump) {
        player.superJumpTimer--;
        if (player.superJumpTimer <= 0) {
            player.hasSuperJump = false;
        }
    }

    // Game over condition
    if (player.y > canvas.height) {
        gameOver();
    }
}

function gameOver() {
    gameStarted = false;
    if (score > highScore) {
        highScore = score;
    }
    alert(`Game Over! Your score: ${score}`);
    resetGame();
}

function resetGame() {
    score = 0;
    player.isInvincible = false;
    player.hasSuperJump = false;
    generateInitialPlatforms();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatforms();
    drawObstacles();
    drawPowerUps();
    drawPlayer();
    drawScore();
    updateGame();
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousemove', (e) => {
    if (gameStarted) {
        const rect = canvas.getBoundingClientRect();
        player.x = e.clientX - rect.left - player.width / 2;
    }
});

canvas.addEventListener('click', () => {
    if (!gameStarted) {
        gameStarted = true;
        resetGame();
    }
});

generateInitialPlatforms();
gameLoop();
