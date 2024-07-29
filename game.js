const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    velocityY: 0,
    speed: 5
};

let platforms = [];
let score = 0;
let gameStarted = false;
let keys = {};

function generatePlatform(y) {
    return {
        x: Math.random() * (canvas.width - 60),
        y: y,
        width: 60,
        height: 10
    };
}

function generateInitialPlatforms() {
    for (let i = 0; i < 7; i++) {
        platforms.push(generatePlatform(i * 100));
    }
}

function drawPlayer() {
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawPlatforms() {
    ctx.fillStyle = 'brown';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function updateGame() {
    if (!gameStarted) return;

    player.velocityY += 0.5; // Gravity
    player.y += player.velocityY;

    // Move player left and right
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }

    // Check collision with platforms
    platforms.forEach(platform => {
        if (player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height &&
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.velocityY > 0) {
            player.velocityY = -13; // Jump
        }
    });

    // Move platforms down and generate new ones
    if (player.y < canvas.height / 2) {
        player.y = canvas.height / 2;
        platforms.forEach(platform => {
            platform.y += 5;
            score++;
        });

        if (platforms[platforms.length - 1].y > 100) {
            platforms.push(generatePlatform(0));
        }
    }

    // Remove platforms that are off-screen
    platforms = platforms.filter(platform => platform.y < canvas.height);

    // Game over condition
    if (player.y > canvas.height) {
        gameStarted = false;
        alert(`Game Over! Your score: ${score}`);
        resetGame();
    }
}

function resetGame() {
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
    player.velocityY = 0;
    platforms = [];
    generateInitialPlatforms();
    score = 0;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatforms();
    drawPlayer();
    drawScore();
    updateGame();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && !gameStarted) {
        gameStarted = true;
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

generateInitialPlatforms();
gameLoop();
