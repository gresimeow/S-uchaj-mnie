// Wait for the HTML document to be fully loaded and parsed
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed"); // Debug log

    // --- Get DOM Elements ---
    const gameContainer = document.getElementById('game-container');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreDisplay = document.getElementById('final-score');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    // --- Verify Elements ---
    console.log("Game Container:", gameContainer);
    console.log("Start Button:", startButton); // <<< CHECK THIS LOG
    console.log("Restart Button:", restartButton);

    // --- Error Check: Exit if essential elements missing ---
    if (!gameContainer || !player || !scoreDisplay || !startScreen || !gameOverScreen || !finalScoreDisplay || !startButton || !restartButton) {
        console.error("CRITICAL ERROR: One or more essential game elements are missing from the DOM!");
        alert("Error loading game elements. Please check the console.");
        return; // Stop script execution
    }

    // --- Game Variables ---
    let gameWidth = gameContainer.offsetWidth;
    let gameHeight = gameContainer.offsetHeight;
    const playerWidth = player.offsetWidth;
    let playerStep = gameWidth / 6; // Recalculate on resize/start

    let score = 0;
    let gameSpeed = 5;
    let obstacleFrequency = 1500; // ms
    let gameInterval;
    let obstacleInterval;
    let obstacles = [];
    let isGameOver = true;

    // --- Game Control Functions ---
    function startGame() {
        console.log("Attempting to start game..."); // Debug log
        if (!startButton || !restartButton) { // Double check buttons are available here
             console.error("Start/Restart button not found within startGame!");
             return;
        }

        isGameOver = false;
        score = 0;
        gameSpeed = 5;
        obstacleFrequency = 1500;

        gameWidth = gameContainer.offsetWidth;
        gameHeight = gameContainer.offsetHeight;
        playerStep = gameWidth / 6; // Update step based on current width

        obstacles.forEach(obstacle => obstacle.remove());
        obstacles = [];

        player.style.left = (gameWidth / 2 - playerWidth / 2) + 'px';
        scoreDisplay.textContent = `Score: 0`;
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        gameContainer.focus();

        clearInterval(gameInterval);
        clearInterval(obstacleInterval);

        gameInterval = setInterval(gameLoop, 20);
        obstacleInterval = setInterval(createObstacle, obstacleFrequency);
        console.log("Game started successfully. Intervals set."); // Debug log
    }

    function endGame() {
        console.log("Ending game. Score:", score); // Debug log
        isGameOver = true;
        clearInterval(gameInterval);
        clearInterval(obstacleInterval);
        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = 'flex';
    }

    // --- Main Game Loop ---
    function gameLoop() {
        if (isGameOver) return;
        moveObstacles();
        checkCollisions();
        updateScore();
        increaseDifficulty();
    }

    // --- Player Movement ---
    function movePlayer(direction) {
        if (isGameOver) return;
        let currentLeft = parseFloat(player.style.left) || (gameWidth / 2 - playerWidth / 2);
        currentLeft += (direction === 'left' ? -playerStep : playerStep);
        currentLeft = Math.max(0, Math.min(currentLeft, gameWidth - playerWidth));
        player.style.left = currentLeft + 'px';
    }

    // --- Obstacle Management ---
    function createObstacle() {
        if (isGameOver) return;
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        const obstacleWidth = 50;
        obstacle.style.left = (Math.random() * (gameWidth - obstacleWidth)) + 'px';
        obstacle.style.top = '-60px';
        gameContainer.appendChild(obstacle);
        obstacles.push(obstacle);
    }

    function moveObstacles() {
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            let currentTop = parseFloat(obstacle.style.top) || 0;
            currentTop += gameSpeed;
            obstacle.style.top = currentTop + 'px';
            if (currentTop > gameHeight) {
                obstacle.remove();
                obstacles.splice(i, 1);
            }
        }
    }

    // --- Collision Detection ---
    function checkCollisions() {
        const playerRect = player.getBoundingClientRect();
        obstacles.forEach(obstacle => {
            const obstacleRect = obstacle.getBoundingClientRect();
            if (
                playerRect.left < obstacleRect.right &&
                playerRect.right > obstacleRect.left &&
                playerRect.top < obstacleRect.bottom &&
                playerRect.bottom > obstacleRect.top
            ) {
                endGame();
            }
        });
    }

    // --- Score & Difficulty ---
    function updateScore() {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function increaseDifficulty() {
        if (score > 0 && score % 500 === 0) {
            gameSpeed += 0.5;
            if (obstacleFrequency > 500) {
                obstacleFrequency -= 100;
                clearInterval(obstacleInterval);
                obstacleInterval = setInterval(createObstacle, obstacleFrequency);
            }
            // console.log(`Difficulty Increase: Speed=${gameSpeed.toFixed(1)}, Freq=${obstacleFrequency}ms`); // Less verbose log
        }
    }

    // --- Event Listeners Setup ---
    console.log("Setting up event listeners...");

    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (!isGameOver) {
            if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') movePlayer('left');
            else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') movePlayer('right');
        } else if (gameOverScreen.style.display !== 'none' && (e.key === 'Enter' || e.key === ' ')) {
             startGame();
        }
    });

    // Touch
    function handleTouch(event) {
        event.preventDefault();
        if (isGameOver) return;
        const touchX = event.touches[0].clientX;
        const containerRect = gameContainer.getBoundingClientRect();
        const containerMidPoint = containerRect.left + containerRect.width / 2;
        movePlayer(touchX < containerMidPoint ? 'left' : 'right');
    }
    gameContainer.addEventListener('touchstart', handleTouch, { passive: false });

    // Buttons
    if (startButton) {
        startButton.addEventListener('click', (e) => {
            console.log("Start Button CLICKED!"); // <<< KEY DEBUG LOG
            e.stopPropagation();
            startGame();
        });
        console.log("Start button listener attached.");
    } else {
        console.error("FAILED to attach listener: Start button not found when setting up listeners.");
    }

    if (restartButton) {
        restartButton.addEventListener('click', (e) => {
            console.log("Restart Button CLICKED!");
            e.stopPropagation();
            startGame();
        });
         console.log("Restart button listener attached.");
    } else {
         console.error("FAILED to attach listener: Restart button not found when setting up listeners.");
    }


    // Start screen area click (optional - allows clicking anywhere on overlay)
    // startScreen.addEventListener('click', (e) => {
    //     if (e.target === startScreen) { // Only if click is directly on the overlay
    //          console.log("Start screen area clicked");
    //          startGame();
    //     }
    // });

     // --- Initial Setup ---
    player.style.left = (gameWidth / 2 - playerWidth / 2) + 'px';
    console.log("Initial player position set. Ready.");

    // Resize Handling
    window.addEventListener('resize', () => {
        gameWidth = gameContainer.offsetWidth;
        gameHeight = gameContainer.offsetHeight;
        playerStep = gameWidth / 6; // Update step on resize
        if (isGameOver) {
            player.style.left = (gameWidth / 2 - playerWidth / 2) + 'px';
        }
     });

     // --- End of DOMContentLoaded listener ---
});

console.log("script.js file loaded"); // Debug log: Make sure the file itself is loading
