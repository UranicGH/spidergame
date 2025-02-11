// Get the canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const LINES_X_POSITIONS = [100, 200, 300, 400, 500]; // X positions for the 5 vertical lines
const SPIDER_WIDTH = 40;
const SPIDER_HEIGHT = 40;
const DROPLET_WIDTH = 30;
const FLY_WIDTH = 30;
const SPIDER_IMG = new Image();
SPIDER_IMG.src = 'assets/spider.png'; // The spider image
const WATER_IMG = new Image();
WATER_IMG.src = 'assets/water.png'; // The water droplet image
const FLY_IMG = new Image();
FLY_IMG.src = 'assets/fly.png'; // The fly image
const LINE_IMG = new Image();
LINE_IMG.src = 'assets/line.png'; // Vertical line image

// Game state variables
let spiderIndex = 2; // Start in the middle of the 5 lines
let score = 0;
let lastMoveTime = 0; // To control movement delay
let moveCooldown = 200; // 200ms cooldown for movement

let lastBonusTime = 0; // To control bonus cooldown
let bonusCooldown = 500; // 500ms cooldown for bonus

let spawnrate = 0.005;

// Droplets and flies arrays
let droplets = [];
let flies = [];

// Event listeners for movement
let leftKeyPressed = false;
let rightKeyPressed = false;
let bonusKeyPressed = false;

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') leftKeyPressed = true;
  if (e.key === 'ArrowRight' || e.key === 'd') rightKeyPressed = true;
  if (e.key === ' ' || e.key === 'w' || e.key === 'ArrowUp') bonusKeyPressed = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') leftKeyPressed = false;
  if (e.key === 'ArrowRight' || e.key === 'd') rightKeyPressed = false;
  if (e.key === ' ' || e.key === 'w' || e.key === 'ArrowUp') bonusKeyPressed = false;
});

// Function to generate a random line for droplets and flies
function randomLinePosition() {
  const line = Math.floor(Math.random() * LINES_X_POSITIONS.length);
  return LINES_X_POSITIONS[line];
}

// Function to update the game state
function updateGame() {
  const currentTime = Date.now();

  // Check if enough time has passed for movement cooldown
  if (currentTime - lastMoveTime >= moveCooldown) {
    // Move spider left or right between the lines
    if (leftKeyPressed && spiderIndex > 0) {
      spiderIndex--;
      lastMoveTime = currentTime; // Set the time of the last movement
    }
    if (rightKeyPressed && spiderIndex < LINES_X_POSITIONS.length - 1) {
      spiderIndex++;
      lastMoveTime = currentTime; // Set the time of the last movement
    }
  }
  // Spawn droplets and flies periodically
  if (Math.random() < spawnrate) { // 2% chance per frame
    droplets.push({ x: randomLinePosition(), y: 0, type: 'water' });
  }
  if (Math.random() < spawnrate) { // 2% chance per frame
    flies.push({ x: randomLinePosition(), y: 0 });
  }
  // Update spawnrate
  spawnrate += 0.000001

  // Update droplet and fly positions
  for (let i = droplets.length - 1; i >= 0; i--) {
    droplets[i].y += 3; // Droplets fall at 5px per frame
    if (droplets[i].y > canvas.height) {
      droplets.splice(i, 1); // Remove droplets that fall off the screen
    }
  }

  for (let i = flies.length - 1; i >= 0; i--) {
    flies[i].y += 3; // Flies fall at 5px per frame
    if (flies[i].y > canvas.height) {
      flies.splice(i, 1); // Remove flies that fall off the screen
    }
  }

  // Check for collisions with droplets
  for (let i = droplets.length - 1; i >= 0; i--) {
    if (
      droplets[i].x < LINES_X_POSITIONS[spiderIndex] + SPIDER_WIDTH / 2 &&
      droplets[i].x + DROPLET_WIDTH > LINES_X_POSITIONS[spiderIndex] - SPIDER_WIDTH / 2 &&
      droplets[i].y < canvas.height - 50 && // Check if the droplet is near the spider
      droplets[i].y + DROPLET_WIDTH > canvas.height - 100
    ) {
      // Game over if spider hits a droplet
      alert('Game Over! Final Score: ' + score);
      resetGame();
      return;
    }
  }

  // Check for fly collection and bonus
  for (let i = flies.length - 1; i >= 0; i--) {
    if (
      flies[i].x < LINES_X_POSITIONS[spiderIndex] + SPIDER_WIDTH / 2 &&
      flies[i].x + FLY_WIDTH > LINES_X_POSITIONS[spiderIndex] - SPIDER_WIDTH / 2 &&
      flies[i].y < canvas.height - 50 && // Check if the fly is near the spider
      flies[i].y + FLY_WIDTH > canvas.height - 100
    ) {
      // If space is pressed when spider is on top of a fly
      if (bonusKeyPressed && Date.now() - lastBonusTime > bonusCooldown) {
        score += 2; // Bonus for catching the fly
        lastBonusTime = Date.now();
      } else {
        score += 1; // Normal score for catching the fly
      }
      flies.splice(i, 1); // Remove the fly after collection
    }
  }

  // Redraw the game
  drawGame();
}

// Function to draw the game elements
function drawGame() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the lines
  for (const xPos of LINES_X_POSITIONS) {
    ctx.drawImage(LINE_IMG, xPos - 10, 0, 20, canvas.height); // Draw vertical lines
  }

  // Draw the spider
  ctx.drawImage(SPIDER_IMG, LINES_X_POSITIONS[spiderIndex] - SPIDER_WIDTH / 2, canvas.height - 100, SPIDER_WIDTH, SPIDER_HEIGHT);

  // Draw the droplets
  for (const droplet of droplets) {
    ctx.drawImage(WATER_IMG, droplet.x - DROPLET_WIDTH / 2, droplet.y, DROPLET_WIDTH, DROPLET_WIDTH);
  }

  // Draw the flies
  for (const fly of flies) {
    ctx.drawImage(FLY_IMG, fly.x - FLY_WIDTH / 2, fly.y, FLY_WIDTH, FLY_WIDTH);
  }

  // Draw the score
  ctx.font = '20px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Score: ' + score, 10, 30);
}

// Reset the game
function resetGame() {
  score = 0;
  spiderIndex = 2; // Start in the middle of the 5 lines
  spawnrate = 0.005
  droplets = [];
  flies = [];
}

// Main game loop
function gameLoop() {
  updateGame();
  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();