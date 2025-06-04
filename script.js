let data = [];
let currentCategory = '';
let usedCards = [];
let score = 0;

// Cargar datos desde Google Sheets
async function fetchData() {
  const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZ2Gv13lNXpu9L9fPfnj1KK0l9cY6pIqHbzl9HJrXka0YmAbRQ7COtwtOuw2N_uz_ideE6XLaLZDGj/pub?output=csv';
  const response = await fetch(url);
  const text = await response.text();
  const rows = text.split('\n').map(r => r.split(','));
  const headers = rows[0];
  data = rows.slice(1).map(row => {
    let entry = {};
    headers.forEach((h, i) => entry[h.trim()] = row[i]?.trim());
    return entry;
  });
}

function showCategories() {
  const categories = [...new Set(data.map(d => d['Categoría']))];
  const container = document.getElementById('categories');
  container.innerHTML = '';
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.textContent = cat;
    btn.onclick = () => startGame(cat);
    container.appendChild(btn);
  });
}

function startGame(category) {
  currentCategory = category;
  const cards = data.filter(d => d['Categoría'] === category && !usedCards.includes(d['Respuesta']));
  if (cards.length === 0) {
    alert('Ya jugaste todas las cartas de esta categoría.');
    return;
  }

  const card = cards[Math.floor(Math.random() * cards.length)];
  usedCards.push(card['Respuesta']);

  playCard(card);
}

function playCard(card) {
  const game = document.getElementById('game');
  const categories = document.getElementById('categories');
  categories.style.display = 'none';
  game.style.display = 'block';

  const options = [
    card['Respuesta'],
    card['Incorrecto 1'],
    card['Incorrecto 2'],
    card['Incorrecto 3'],
  ].sort(() => Math.random() - 0.5);

  const clues = [
    card['Clave 1'],
    card['Clave 2'],
    card['Clave 3'],
    card['Clave 4'],
  ].sort(() => Math.random() - 0.5);

  let clueIndex = 0;
  let clueInterval;
  let answered = false;
  let timeLeft = 60;

  const clueBox = document.getElementById('clues');
  const optionsBox = document.getElementById('options');
  const message = document.getElementById('message');
  const scoreBox = document.getElementById('score');
  const timerBox = document.getElementById('timer');

  clueBox.innerHTML = '';
  optionsBox.innerHTML = '';
  message.innerHTML = '';
  scoreBox.textContent = `Puntaje: ${score}`;
  timerBox.textContent = `⏱️ Tiempo: ${timeLeft}s`;

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.onclick = () => {
      if (answered) return;
      answered = true;
      clearInterval(clueInterval);
      clearInterval(timerInterval);
      if (opt === card['Respuesta']) {
        score += 1;
        btn.style.fontSize = '1.5rem';
        message.innerHTML = '✅ ¡Correcto!';
      } else {
        score -= 1;
        message.innerHTML = '❌ No es la respuesta correcta.';
      }
      scoreBox.textContent = `Puntaje: ${score}`;
    };
    optionsBox.appendChild(btn);
  });

  // Mostrar pistas cada 10 segundos
  clueInterval = setInterval(() => {
    if (clueIndex < clues.length) {
      const p = document.createElement('p');
      p.textContent = clues[clueIndex];
      clueBox.appendChild(p);
      clueIndex++;
    }
  }, 10000);

  // Contador de tiempo
  const timerInterval = setInterval(() => {
    timeLeft--;
    timerBox.textContent = `⏱️ Tiempo: ${timeLeft}s`;
    if (timeLeft === 0 && !answered) {
      answered = true;
      clearInterval(clueInterval);
      clearInterval(timerInterval);
      message.innerHTML = '⏰ ¡Se acabó el tiempo!';
    }
  }, 1000);
}

// Iniciar todo
window.onload = async () => {
  await fetchData();
  showCategories();
};
Add game logic script
