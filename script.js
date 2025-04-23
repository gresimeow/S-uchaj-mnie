const coin = document.getElementById('coin');
const flipButton = document.getElementById('flipButton');
const resultDisplay = document.getElementById('result');

function flipCoin() {
    // Generate random number: 0 for Heads, 1 for Tails
    const outcome = Math.floor(Math.random() * 2); // Gives 0 or 1

    // --- Animation ---
    // Remove any previous animation classes to allow re-triggering
    coin.classList.remove('flip-heads', 'flip-tails');

    // Disable the button while flipping
    flipButton.disabled = true;
    resultDisplay.textContent = 'Flipping...'; // Show flipping status

    // Add the appropriate class to trigger the CSS animation
    // A small timeout is needed to ensure the class removal takes effect before adding a new one
    setTimeout(() => {
        if (outcome === 0) {
            coin.classList.add('flip-heads');
        } else {
            coin.classList.add('flip-tails');
        }
    }, 10); // Tiny delay

    // --- Display Result ---
    // The result should be displayed *after* the animation finishes.
    // The animation duration is 1 second (defined in CSS transition).
    // Use a timeout slightly longer than the animation.
    setTimeout(() => {
        if (outcome === 0) {
            resultDisplay.textContent = 'Result: Heads!';
        } else {
            resultDisplay.textContent = 'Result: Tails!';
        }
        // Re-enable the button
        flipButton.disabled = false;
    }, 1100); // 1100ms = 1.1 seconds (slightly longer than CSS animation)
}

// Add event listener to the button
flipButton.addEventListener('click', flipCoin);

// Initial state: make sure the result area is clear
resultDisplay.textContent = '';
