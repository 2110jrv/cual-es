let allData = [];
let usedCards = [];
let score = 0;
let currentCard = null;
let currentClues = [];
let clueInterval = null;
let clueIndex = 0;

// Google Sheets CSV URL
const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZ2Gv13lNXpu9L9fPfnj1KK0l9cY6pIqHbzl9HJrXka0YmAbRQ7COtwtOuw2N_uz_ideE6XLaLZDGj/pub?output=csv";

// Load data on page load
window.onload = () => {
  fetch(sheetUrl)
    .then(res => res.text())
    .then(text => parseCSV(text));
};

function parseCSV(text) {
  const rows = text.trim().split('\n').map(row => row.split(','));
  const headers = rows.shift();
  allData = rows.map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h.trim()] = row[i]?.trim();
    });
    return obj;
  });
}

function startGame(category) {
  document.getElementById("category-selection").style.display = "none";
  document.getElementById("game-area").style.display = "block";
  usedCards = [];
  score = 0;
  updateScore();
  loadNextCard(category);
}

function loadNextCard(category) {
  const available = allData.filter(card =>
    card["Categoría"] === category &&
    !usedCards.includes(card["Respuesta"])
  );

  if (available.length === 0) {
    alert("No hay más cartas en esta categoría.");
    backToMenu();
    return;
  }

  currentCard = available[Math.floor(Math.random() * available.length)];
  usedCards.push(currentCard["Respuesta"]);
  showCard(currentCard);
}

function showCard(card) {
  clueIndex = 0;
  currentClues = shuffle([
    card["Clave 1"],
    card["Clave 2"],
    card["Clave 3"],
    card["Clave 4"]
  ]);
  document.getElementById("clues").innerHTML = "";
  document.getElementById("result").textContent = "";
  document.getElementById("options").innerHTML = "";

  const options = shuffle([
    card["Respuesta"],
    card["Incorrecto 1"],
    card["Incorrecto 2"],
    card["Incorrecto 3"]
  ]);

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.className = "option";
    btn.onclick = () => chooseAnswer(opt);
    document.getElementById("options").appendChild(btn);
  });

  clueInterval = setInterval(() => {
    if (clueIndex < currentClues.length) {
      const clueDiv = document.createElement("div");
      clueDiv.textContent = currentClues[clueIndex];
      document.getElementById("clues").appendChild(clueDiv);
      clueIndex++;
    } else {
      clearInterval(clueInterval);
      setTimeout(() => {
        document.getElementById("result").textContent = "⏰ Se acabó el tiempo.";
        document.getElementById("result").style.color = "black";
      }, 1000);
    }
  }, 10000); // 10 seconds per clue
}

function chooseAnswer(answer) {
  clearInterval(clueInterval);
  const buttons = document.querySelectorAll(".option");
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === currentCard["Respuesta"]) {
      btn.classList.add("highlight");
    }
  });

  if (answer === currentCard["Respuesta"]) {
    document.getElementById("result").textContent = "✅ ¡Correcto!";
    document.getElementById("result").style.color = "green";
    score++;
  } else {
    document.getElementById("result").textContent = "❌ Incorrecto.";
    document.getElementById("result").style.color = "red";
    score--;
  }
  updateScore();
}

function nextCard() {
  if (currentCard) {
    loadNextCard(currentCard["Categoría"]);
  }
}

function backToMenu() {
  document.getElementById("category-selection").style.display = "block";
  document.getElementById("game-area").style.display = "none";
}

function updateScore() {
  document.getElementById("score").textContent = `Puntuación: ${score}`;
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}
