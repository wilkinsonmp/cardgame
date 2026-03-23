// ---  ELEMENTS ---
const board = document.getElementById("gameBoard");
const scoreDisplay = document.getElementById("score");
const timeDisplay = document.getElementById("time");
const triesDisplay = document.getElementById("tries");
const levelDisplay = document.getElementById("level");
const startScreen = document.getElementById("startScreen");
const startGameBtn = document.getElementById("startGameBtn");
const startInstructions = document.getElementById("startInstructions");
const popup = document.getElementById("levelPopup");
const popupLevelText = document.getElementById("popupLevelText");
const popupInstructions = document.getElementById("popupInstructions");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartGameBtn");

// --- AUDIO  ---
const flipSound = new Audio('sounds/flip.mp3');
const matchSound = new Audio('sounds/match.mp3');
const winSound = new Audio('sounds/win.mp3');
const loseSound = new Audio('sounds/lose.mp3');

// --- GAME ---
const emojis = ["💧", "💦", "🌊", "🫗", "🧊", "🫧", "🌧️", "⛲️"];
const difficultySettings = {
    easy:   { startTime: 40, startTries: 5 },
    medium: { startTime: 30, startTries: 4 },
    hard:   { startTime: 20, startTries: 3 }
};

// --- STATE  ---
let level = 1;
let score = 0;
let tries = 0;
let time = 0;
let timer = null; 
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchesFound = 0;
let pairsNeeded = 0;
let chosenDifficulty = "medium"; 

// ---DIFFICULTY  ---
const diffButtons = document.querySelectorAll(".diff-btn");
diffButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        diffButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        chosenDifficulty = btn.getAttribute("data-level");

        const timeVal = difficultySettings[chosenDifficulty].startTime;
        startInstructions.textContent = `Select your difficulty and match the cards in ${timeVal} seconds!`;
    });
});

// --- START GAME BUTTONS ---
startGameBtn.addEventListener("click", () => {

    flipSound.play().then(() => { flipSound.pause(); }).catch(() => {});
    
    startScreen.style.display = "none";
    level = 1;
    score = 0;
    scoreDisplay.textContent = score;
    startLevel();
});

startBtn.addEventListener("click", () => {
    popup.style.display = "none";
    startLevel();
});

restartBtn.addEventListener("click", () => {
    if (confirm("Restart game? Progress will be lost.")) {
        location.reload();
    }
});


function startLevel() {
    board.innerHTML = "";
    if (timer) clearInterval(timer);
    
    const settings = difficultySettings[chosenDifficulty];
    
    tries = settings.startTries;
    time = settings.startTime; 
    
    matchesFound = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    const cardCount = 4 + (level - 1) * 2;
    pairsNeeded = cardCount / 2;

    levelDisplay.textContent = level;
    timeDisplay.textContent = time;
    triesDisplay.textContent = tries;
    timeDisplay.style.color = ""; 

    let symbols = emojis.slice(0, pairsNeeded);
    symbols = [...symbols, ...symbols];
    symbols.sort(() => Math.random() - 0.5);

    symbols.forEach(symbol => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.symbol = symbol;
        card.innerHTML = `<img src="img/logo.png" class="card-back-img">`;
        card.addEventListener("click", flipCard);
        board.appendChild(card);
    });

    startTimer();
}

function flipCard() {
    if (lockBoard || this === firstCard || this.classList.contains("matched")) return;
    
    flipSound.currentTime = 0;
    flipSound.play().catch(() => {});

    this.classList.add("flipped");
    this.innerHTML = this.dataset.symbol;
    
    if (!firstCard) { 
        firstCard = this; 
        return; 
    }
    
    secondCard = this;
    lockBoard = true;
    checkMatch();
}

function checkMatch() {
    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
        setTimeout(() => matchSound.play().catch(() => {}), 200);
        score += 10;
        matchesFound++;
        scoreDisplay.textContent = score;
        
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        
        resetTurn();
        checkLevelComplete();
    } else {
        setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");
            firstCard.innerHTML = `<img src="img/logo.png" class="card-back-img">`;
            secondCard.innerHTML = `<img src="img/logo.png" class="card-back-img">`;
            
            tries--;
            triesDisplay.textContent = tries;
            
            if (tries <= 0) { 
                endGame("Out of tries!"); 
            } else {
                resetTurn();
            }
        }, 800);
    }
}

function resetTurn() { 
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function checkLevelComplete() {
    if (matchesFound === pairsNeeded) {
        clearInterval(timer); 
        if (level >= 6) {
            showVictory();
        } else {
            level++;
            setTimeout(showLevelPopup, 800);
        }
    }
}

function showLevelPopup() {
    popupLevelText.textContent = `Level ${level}`;
    popupInstructions.textContent = `Get ready for more cards!`;
    popup.style.display = "flex";
}

function showVictory() {
    winSound.play().catch(() => {});
    document.getElementById("victoryPopup").style.display = "flex";
    if (window.confetti) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
}

function endGame(msg) {
    clearInterval(timer);
    loseSound.play().catch(() => {});
    alert(msg);
    location.reload();
}

function startTimer() {
    if (timer) clearInterval(timer); 

    timer = setInterval(() => {
        time--;
        timeDisplay.textContent = time;

        if (time <= 5) {
            timeDisplay.style.color = "red";
        }

        if (time <= 0) {
            endGame("Time's up!");
        }
    }, 1000);
}