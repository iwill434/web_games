const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    speed: 5,
    dy: 0,
    jumpForce: -10,
    gravity: 0.5,
    isJumping: false
};

let platforms = [];
let score = 0;
let gameOver = false;

function generatePlatform(x, y) {
    return {
        x: x !== undefined ? x : Math.random() * (canvas.width - 70),
        y: y !== undefined ? y : 0,
        width: 70,
        height: 20
    };
}

function init() {
    platforms = [];
    // Add initial platform below the player
    platforms.push(generatePlatform(canvas.width / 2 - 35, canvas.height - 20));
    
    // Generate other platforms
    for (let i = 0; i < 6; i++) {
        platforms.push(generatePlatform(undefined, i * 100));
    }
    
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - 50;
    player.dy = 0;
    score = 0;
    gameOver = false;
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

function movePlayer() {
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= player.speed;
    }
    if (keys.ArrowRight && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }

    player.y += player.dy;
    player.dy += player.gravity;

    if (player.y + player.height > canvas.height) {
        gameOver = true;
    }
}

function checkCollision() {
    platforms.forEach(platform => {
        if (player.y + player.height <= platform.y && 
            player.y + player.height + player.dy > platform.y &&
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x) {
            player.dy = player.jumpForce;
        }
    });
}

function updatePlatforms() {
    if (player.y < canvas.height / 2) {
        player.y = canvas.height / 2;
        platforms.forEach(platform => {
            platform.y += -player.dy;
            if (platform.y > canvas.height) {
                score++;
                platform.y = 0;
                platform.x = Math.random() * (canvas.width - platform.width);
            }
        });
    }
}

function drawScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameOver) {
        movePlayer();
        checkCollision();
        updatePlatforms();
        drawPlatforms();
        drawPlayer();
        drawScore();
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = 'black';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 70, canvas.height / 2);
        ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 40);
        ctx.fillText('Press Space to Restart', canvas.width / 2 - 120, canvas.height / 2 + 80);
    }
}

let keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space' && gameOver) {
        init();
        gameLoop();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

init();
gameLoop();
