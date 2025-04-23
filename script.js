// Wait for the HTML document to be fully loaded and parsed
document.addEventListener('DOMContentLoaded', () => {

    // --- Get DOM Elements ---
    const gameContainer = document.getElementById('game-container');
    const player = document.getElementById('player');
    const scoreDisplay = document.getElementById('score');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const finalScoreDisplay = document.getElementById('final-score');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');

    // --- Game Variables ---
    let gameWidth = gameContainer.offsetWidth;
    let gameHeight = gameContainer.offsetHeight;
    const playerWidth = player.offsetWidth;
    const playerStep = gameWidth / 6; // Movement step relative to screen width

    let score = 0;
    let gameSpeed = 5;
    let obstacleFrequency = 1500; // ms
    let gameInterval;
    let obstacleInterval;
    let obstacles = [];
    let isGameOver = true; // Start in non-playing state

    // --- Game Control Functions ---
    function startGame() {
        console.log("startGame function called"); // Debug log
        isGameOver = false;
        score = 0;
        gameSpeed = 5;
        obstacleFrequency = 1500;

        // Update dimensions in case of resize before starting
        gameWidth = gameContainer.offsetWidth;
        gameHeight = gameContainer.offsetHeight;

        // Clear old obstacles from DOM and array
        obstacles.forEach(obstacle => obstacle.remove());
        obstacles = [];

        player.style.left = (gameWidth / 2 - playerWidth / 2) + 'px'; // Center player
        scoreDisplay.textContent = `Score: 0`;
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        gameContainer.focus(); // For keyboard input

        // Clear any existing intervals before starting new ones
        clearInterval(gameInterval);
        clearInterval(obstacleInterval);

        // Start game loops
        gameInterval = setInterval(gameLoop, 20); // Main game update loop (approx 50 FPS)
        obstacleInterval = setInterval(createObstacle, obstacleFrequency);
        console.log("Game loops started"); // Debug log
    }

    function endGame() {
        console.log("endGame function called"); // Debug log
        isGameOver = true;
        clearInterval(gameInterval);
        clearInterval(obstacleInterval);
        finalScoreDisplay.textContent = score;
        gameOverScreen.style.display = 'flex';
    }

    // --- Main Game Loop ---
    function gameLoop() {
        if (isGameOver) return; // Stop loop if game over

        moveObstacles();
        checkCollisions();
        updateScore();
        increaseDifficulty();
    }

    // --- Player Movement ---
    function movePlayer(direction) {
        if (isGameOver) return;

        let currentLeft = parseFloat(player.style.left) || (gameWidth / 2 - playerWidth / 2); // Use current or default if NaN

        if (direction === 'left') {
            currentLeft -= playerStep;
        } else if (direction === 'right') {
            currentLeft += playerStep;
        }

        // Prevent moving out of bounds
        currentLeft = Math.max(0, Math.min(currentLeft, gameWidth - playerWidth));

        player.style.left = currentLeft + 'px';
    }

    // --- Obstacle Management ---
    function createObstacle() {
        if (isGameOver) return;

        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        const obstacleWidth = 50; // Match CSS width
        // Ensure obstacles don't spawn too close to edges if desired, or allow full width
        const randomLeft = Math.random() * (gameWidth - obstacleWidth);

        obstacle.style.left = randomLeft + 'px';
        obstacle.style.top = '-60px'; // Start above screen
        gameContainer.appendChild(obstacle);
        obstacles.push(obstacle); // Add to our tracking array
    }

    function moveObstacles() {
        // Iterate backwards when removing elements to avoid skipping
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            let currentTop = parseFloat(obstacle.style.top) || 0;
            currentTop += gameSpeed;
            obstacle.style.top = currentTop + 'px';

            // Remove obstacle if it goes off screen
            if (currentTop > gameHeight) {
                obstacle.remove(); // Remove from DOM
                obstacles.splice(i, 1); // Remove from array
            }
        }
    }

    // --- Collision Detection ---
    function checkCollisions() {
        const playerRect = player.getBoundingClientRect();

        obstacles.forEach(obstacle => {
            const obstacleRect = obstacle.getBoundingClientRect();

            // Check for overlap using bounding boxes
            if (
                playerRect.left < obstacleRect.right &&
                playerRect.right > obstacleRect.left &&
                playerRect.top < obstacleRect.bottom &&
                playerRect.bottom > obstacleRect.top
            ) {
                // Collision detected!
                endGame();
            }
        });
    }

    // --- Score & Difficulty ---
    function updateScore() {
        // Increase score based on time survived (called every game loop)
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function increaseDifficulty() {
        // Increase speed and obstacle frequency based on score
        if (score > 0 && score % 500 === 0) { // Every 500 score points (adjust as needed)
            gameSpeed += 0.5;
            if (obstacleFrequency > 500) { // Set a minimum frequency (maximum spawn rate)
                 obstacleFrequency -= 100;
                 // Reset interval with the new frequency
                 clearInterval(obstacleInterval);
                 obstacleInterval = setInterval(createObstacle, obstacleFrequency);
            }
            console.log(`Difficulty Increase: Speed=${gameSpeed.toFixed(1)}, Freq=${obstacleFrequency}ms`);
        }
    }

    // --- Event Listeners Setup ---

    // Keyboard Controls
    document.addEventListener('keydown', (e) => {
        if (!isGameOver) {
            if (e.key === 'ArrowLeft' || e.key === 'a') { // Added 'a' key
                movePlayer('left');
            } else if (e.key === 'ArrowRight' || e.key === 'd') { // Added 'd' key
                movePlayer('right');
            }
        } else if (isGameOver && gameOverScreen.style.display !== 'none' && (e.key === 'Enter' || e.key === ' ')) {
             // Allow restarting with Enter or Space key on game over screen
             startGame();
        }
    });

    // Touch Controls
    function handleTouch(event) {
        // Prevent default touch behavior like scrolling or zooming
        event.preventDefault();
        if (isGameOver) return; // Don't process movement if game isn't active

        // Get the horizontal position of the *first* touch point relative to the viewport
        const touchX = event.touches[0].clientX;

        // Get the position and width of the game container relative to the viewport
        const containerRect = gameContainer.getBoundingClientRect();
        const containerMidPoint = containerRect.left + containerRect.width / 2;

        // Determine if the touch was on the left or right half of the container
        if (touchX < containerMidPoint) {
            movePlayer('left');
        } else {
            movePlayer('right');
        }
    }

    // Add the touch listener to the game container
    gameContainer.addEventListener('touchstart', handleTouch, { passive: false }); // passive: false needed for preventDefault

    // Button Click Listeners
    startButton.addEventListener('click', (e) => {
        console.log("Start button clicked via event listener"); // Debug log
        e.stopPropagation(); // Prevent touch/click event from bubbling up
        startGame();
    });

    restartButton.addEventListener('click', (e) => {
         e.stopPropagation();
         startGame();
    });

    // Allow starting by clicking/tapping the container *only* when start screen is visible
    // This handles the case where the user taps outside the button on the start screen
    startScreen.addEventListener('click', (e) => {
        // Check if the click was directly on the startScreen itself, not the button within it
        if (e.target === startScreen) {
             console.log("Start screen area clicked"); // Debug log
             startGame();
        }
    });

     // --- Initial Setup ---
    // Position player centrally when script loads and DOM is ready
    player.style.left = (gameWidth / 2 - playerWidth / 2) + 'px';
    console.log("Initial player position set"); // Debug log

    // Adjust layout on resize/orientation change
    window.addEventListener('resize', () => {
        gameWidth = gameContainer.offsetWidth;
        gameHeight = gameContainer.offsetHeight;
        // Reposition player if game isn't running, adjust bounds/step if it is?
        // For simplicity, just reposition if game over. Active game resizing needs more complex handling.
        if (isGameOver) {
            player.style.left = (gameWidth / 2 - playerWidth / 2) + 'px';
        }
     });

     // --- End of DOMContentLoaded listener ---
});
