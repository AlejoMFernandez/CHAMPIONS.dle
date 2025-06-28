let allPlayers = [];
let selectedPlayer = null;
let options = [];
let streak = 0;
let bestStreak = parseInt(localStorage.getItem('whoBestStreak')) || 0;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function pickRandomPlayer(players) {
    return players[Math.floor(Math.random() * players.length)];
}

function getOptions(players, correctPlayer) {
    // Filtra para no repetir el correcto
    let incorrects = players.filter(p => p.id !== correctPlayer.id);
    shuffle(incorrects);
    let options = [correctPlayer, ...incorrects.slice(0, 3)];
    shuffle(options);
    return options;
}

function showRound() {
    document.getElementById('result').textContent = '';
    document.getElementById('restart-btn').style.display = 'none';

    selectedPlayer = pickRandomPlayer(allPlayers);
    options = getOptions(allPlayers, selectedPlayer);

    // Imagen del jugador
    document.getElementById('player-img').src = `https://images.fotmob.com/image_resources/playerimages/${selectedPlayer.id}.png`;

    // Opciones
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    options.forEach((player, idx) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = player.name;
        btn.onclick = () => checkAnswer(player, btn);
        optionsContainer.appendChild(btn);
    });
}

function updateStreakDisplay(bounceCurrent = false, bounceBest = false) {
    let streakDiv = document.getElementById('streak-info');
    if (!streakDiv) {
        streakDiv = document.createElement('div');
        streakDiv.id = 'streak-info';
        streakDiv.className = 'streak-info';
        document.querySelector('main').insertBefore(streakDiv, document.querySelector('.guess-container'));
    }
    streakDiv.innerHTML = `
      <span class="streak-current${bounceCurrent ? ' streak-bounce' : ''}">🔥 ${streak}</span>
      <span class="streak-best${bounceBest ? ' streak-bounce' : ''}">🏆 ${bestStreak}</span>
    `;
    // Remueve la animación después de que termina
    if (bounceCurrent) {
      setTimeout(() => {
        streakDiv.querySelector('.streak-current').classList.remove('streak-bounce');
      }, 500);
    }
    if (bounceBest) {
      setTimeout(() => {
        streakDiv.querySelector('.streak-best').classList.remove('streak-bounce');
      }, 500);
    }
}

function checkAnswer(player, btnClicked) {
    const optionsBtns = document.querySelectorAll('.option-btn');
    optionsBtns.forEach(btn => btn.disabled = true);
    let bounceCurrent = false;
    let bounceBest = false;
    if (player.id === selectedPlayer.id) {
        btnClicked.classList.add('correct');
        document.getElementById('result').textContent = '¡Correcto!';
        streak++;
        bounceCurrent = true;
        if (streak > bestStreak) {
            bestStreak = streak;
            localStorage.setItem('whoBestStreak', bestStreak);
            bounceBest = true;
        }
    } else {
        btnClicked.classList.add('incorrect');
        document.getElementById('result').textContent = 'Incorrecto. Era ' + selectedPlayer.name;
        optionsBtns.forEach(btn => {
            if (btn.textContent === selectedPlayer.name) {
                btn.classList.add('correct');
            } else if (btn !== btnClicked) {
                btn.classList.add('incorrect');
            }
        });
        streak = 0;
        bounceCurrent = true;
    }
    updateStreakDisplay(bounceCurrent, bounceBest);
    document.getElementById('restart-btn').style.display = 'block';
}

document.getElementById('restart-btn').onclick = showRound;

fetch('../../teams.json')
    .then(res => res.json())
    .then(teams => {
        // Junta todos los jugadores en un solo array
        teams.forEach(team => {
            if (team.squad) {
                team.squad.forEach(section => {
                    section.members.forEach(player => {
                        if (player.id && player.name) {
                            allPlayers.push(player);
                        }
                    });
                });
            }
        });
        showRound();
        updateStreakDisplay();
    });