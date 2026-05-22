// Game Variables
let phase = 1; // 1: You are the Assassin, 2: You are Caesar
let isWarning = false; // NEW: Tracks the tell/warning state
let isLooking = false;
let isCharging = false;
let attackProgress = 0;
let gameActive = false;
let lookTimeout;

// DOM Elements
const instructionsText = document.getElementById('instructions');
const charFront = document.getElementById('character-front');
const charBack = document.getElementById('character-back');
const progressBar = document.getElementById('progress-bar');
const actionBtn = document.getElementById('action-btn');
const scene = document.getElementById('scene');

// Initializes the game or switches phases
function initGame(startingPhase) {
  phase = startingPhase;
  isWarning = false;
  isLooking = false;
  isCharging = false;
  attackProgress = 0;
  gameActive = true;
  progressBar.style.width = '0%';
  scene.classList.remove('looking', 'warning');
  clearTimeout(lookTimeout);

  if (phase === 1) {
    instructionsText.innerText = "PHASE 1: Hold the button to attack. Release IMMEDIATELY when Caesar looks suspicious (Yellow)!";
    charFront.innerText = "Caesar";
    charBack.innerText = "You (Assassin)";
    scheduleCaesarLook(); 
    requestAnimationFrame(assassinLoop);
  } else {
    instructionsText.innerText = "PHASE 2: You are Caesar! Tap the button to look over your shoulder and catch your advisor.";
    charFront.innerText = "You (Caesar)";
    charBack.innerText = "Royal Advisor";
    requestAnimationFrame(caesarLoop); 
  }
}

// -----------------------------------------
// PHASE 1 LOGIC: Player is the Assassin
// -----------------------------------------
function scheduleCaesarLook() {
  if (!gameActive || phase !== 1) return;
  
  // Caesar waits randomly between 1.5 and 3.5 seconds
  const timeUntilLook = Math.random() * 2000 + 1500; 
  
  lookTimeout = setTimeout(() => {
    if (!gameActive) return;
    
    // STEP 1: Trigger the Warning Visual Cue
    isWarning = true;
    charFront.innerText = "Caesar (Turning... 👀)";
    scene.classList.add('warning');

    // STEP 2: Give the player 700ms to react before he actually turns around
    lookTimeout = setTimeout(() => {
      if (!gameActive) return;
      
      isWarning = false;
      isLooking = true;
      charFront.innerText = "Caesar (LOOKING! 😡)";
      scene.classList.remove('warning');
      scene.classList.add('looking');
      checkPhase1Caught(); // Instantly check if player failed to let go

      // STEP 3: Caesar looks for 1.5 seconds before turning back
      lookTimeout = setTimeout(() => {
        if (!gameActive) return;
        isLooking = false;
        charFront.innerText = "Caesar";
        scene.classList.remove('looking');
        scheduleCaesarLook(); // Cycle resets
      }, 1500);
      
    }, 700); // 700ms reaction window. Lower this number to make the game harder!
    
  }, timeUntilLook);
}

function assassinLoop() {
  if (!gameActive || phase !== 1) return;

  if (isCharging) {
    attackProgress += 0.6; 
    checkPhase1Caught();
    
    // Win Condition for Phase 1
    if (attackProgress >= 100) {
      gameActive = false;
      alert("Success! You assassinated Caesar and took the throne for yourself.");
      initGame(2); 
      return;
    }
  } else if (attackProgress > 0) {
    attackProgress -= 0.3; // Progress decays slowly if you back away
  }

  progressBar.style.width = attackProgress + '%';
  requestAnimationFrame(assassinLoop);
}

function checkPhase1Caught() {
  // Player is only penalized if they keep holding *while* Caesar is fully looking (Red)
  if (isLooking && isCharging && phase === 1) {
    gameActive = false;
    alert("Caught! Caesar saw your dagger. Off to the dungeon you go.");
    initGame(1); 
  }
}

// -----------------------------------------
// PHASE 2 LOGIC: Player is Caesar
// -----------------------------------------
function caesarLoop() {
  if (!gameActive || phase !== 2) return;

  if (!isLooking) {
    if (!isCharging && Math.random() < 0.02) {
      isCharging = true;
      charBack.innerText = "Advisor (SCHEMING!)";
    }
    if (isCharging) {
      attackProgress += 0.5;
    }
  } else {
    if (isCharging) {
      gameActive = false;
      alert("You caught your advisor trying to assassinate you! You win the game!");
      initGame(1); 
      return;
    }
    if (attackProgress > 0) {
      attackProgress -= 1; 
    }
  }

  // Loss Condition for Phase 2
  if (attackProgress >= 100) {
    gameActive = false;
    alert("Too late! Your advisor assassinated you. The cycle continues...");
    initGame(1);
    return;
  }

  progressBar.style.width = attackProgress + '%';
  requestAnimationFrame(caesarLoop);
}

// -----------------------------------------
// CONTROLS (Mouse, Touch, and Keyboard)
// -----------------------------------------
function startAction(e) {
  if (e && e.type !== 'keydown') e.preventDefault();
  if (!gameActive) return;
  
  if (phase === 1) {
    isCharging = true;
  } else if (phase === 2) {
    isLooking = true;
    charFront.innerText = "You (LOOKING BACK!)";
    scene.classList.add('looking');
  }
}

function endAction(e) {
  if (e && e.type !== 'keyup') e.preventDefault();
  if (!gameActive) return;
  
  if (phase === 1) {
    isCharging = false;
  } else if (phase === 2) {
    isLooking = false;
    charFront.innerText = "You (Caesar)";
    scene.classList.remove('looking');
    isCharging = false;
    charBack.innerText = "Royal Advisor";
  }
}

actionBtn.addEventListener('mousedown', startAction);
actionBtn.addEventListener('mouseup', endAction);
actionBtn.addEventListener('mouseleave', endAction);
actionBtn.addEventListener('touchstart', startAction, {passive: false});
actionBtn.addEventListener('touchend', endAction, {passive: false});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !e.repeat) startAction(e);
});
document.addEventListener('keyup', (e) => {
  if (e.code === 'Space') endAction(e);
});

// Start the game
initGame(1);
