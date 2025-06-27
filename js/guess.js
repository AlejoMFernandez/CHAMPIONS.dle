let allPlayers = [];
let selectedPlayer = null;
let suggestionIndex = -1;
let lives = 3;
let clearResultTimeout = null;
let flagsData = [];

function renderLives() {
    const livesContainer = document.getElementById('lives-container');
    livesContainer.innerHTML = '';
    for (let i = 0; i < 3; i++) {
        livesContainer.innerHTML += `
            <span class="heart${i >= lives ? ' lost' : ''}">
                <svg viewBox="0 0 24 24">
                    <path d="M12 21s-6.7-5.2-9.3-8.2C-1.2 9.2 1.7 4.5 6.1 5.1c2.1.3 3.9 2.1 5.9 4.9 2-2.8 3.8-4.6 5.9-4.9 4.4-.6 7.3 4.1 3.4 7.7C18.7 15.8 12 21 12 21z" fill="#ff5252"/>
                </svg>
            </span>
        `;
    }
}

function resetGame() {
    lives = 3;
    renderLives();
    document.getElementById('result').textContent = '';
    document.getElementById('result').className = '';
    document.getElementById('player-img').classList.add('blurred');
    document.getElementById('guess-input').value = '';
    document.getElementById('suggestions').innerHTML = '';
    document.getElementById('restart-btn').style.display = 'none';
    selectedPlayer = pickRandomPlayer(allPlayers);
    showPlayerInfo(selectedPlayer);
    document.getElementById('guess-input').disabled = false;
    document.getElementById('guess-btn').disabled = false;
    document.getElementById('guess-input').focus();
    suggestionIndex = -1;
    if (clearResultTimeout) clearTimeout(clearResultTimeout);
}

function normalize(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function getAllPlayers(teams) {
    const players = [];
    teams.forEach(team => {
        if (team.squad) {
            team.squad.forEach(section => {
                section.members.forEach(player => {
                    players.push({
                        ...player,
                        clubLogo: team.logo,
                        position: section.title,
                        country: player.cname || player.nationality || "",
                        id: player.id
                    });
                });
            });
        }
    });
    return players;
}

function pickRandomPlayer(players) {
    return players[Math.floor(Math.random() * players.length)];
}

function showPlayerInfo(player) {
    document.getElementById('player-img').src = `https://images.fotmob.com/image_resources/playerimages/${player.id}.png`;

    // Club con logo
    document.getElementById('player-club').innerHTML = `
        <img src="${player.clubLogo}" alt="${player.club}" style="width:55px;vertical-align:middle;">
    `;

    // Posición
    document.getElementById('player-position').textContent = player.positionIdsDesc || player.position;

    // Solo nacionalidad como texto
    document.getElementById('player-country').textContent = player.country || player.cname || player.nationality || '';
}

function showSuggestions(input) {
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = "";
    suggestionIndex = -1; // Reiniciar el foco
    if (input.length < 3) return;

    const matches = allPlayers.filter(player => {
        const fullName = normalize(player.name);
        return fullName.includes(normalize(input));
    });

    // Evitar duplicados por nombre
    const unique = [];
    matches.forEach(player => {
        if (!unique.some(u => normalize(u.name) === normalize(player.name))) {
            unique.push(player);
        }
    });

    unique.slice(0, 5).forEach((player, idx) => {
        const li = document.createElement('li');
        li.textContent = player.name;
        li.tabIndex = 0;
        li.onclick = () => {
            document.getElementById('guess-input').value = player.name;
            suggestions.innerHTML = "";
        };
        li.onmouseenter = () => {
            setActiveSuggestion(idx);
        };
        suggestions.appendChild(li);
    });
}

function setActiveSuggestion(index) {
    const suggestions = document.getElementById('suggestions');
    Array.from(suggestions.children).forEach((li, idx) => {
        if (idx === index) {
            li.classList.add('active-suggestion');
        } else {
            li.classList.remove('active-suggestion');
        }
    });
    suggestionIndex = index;
}

function selectSuggestion() {
    const suggestions = document.getElementById('suggestions');
    if (suggestionIndex >= 0 && suggestions.children[suggestionIndex]) {
        document.getElementById('guess-input').value = suggestions.children[suggestionIndex].textContent;
        suggestions.innerHTML = "";
    }
}

function checkGuess() {
    const guessInput = document.getElementById('guess-input');
    const guess = normalize(guessInput.value.trim());
    const correct = normalize(selectedPlayer.name);
    const result = document.getElementById('result');
    if (guess === correct) {
        document.getElementById('player-img').classList.remove('blurred');
        result.textContent = "¡Correcto! Era " + selectedPlayer.name;
        result.className = "correct";
        document.getElementById('restart-btn').style.display = 'block';
        guessInput.disabled = true;
        document.getElementById('guess-btn').disabled = true;
    } else {
        lives--;
        renderLives();
        if (lives > 0) {
            result.textContent = "Incorrecto. Te quedan " + lives + " vidas.";
            result.className = "incorrect";
            guessInput.value = '';
            document.getElementById('suggestions').innerHTML = '';
            guessInput.disabled = true;
            document.getElementById('guess-btn').disabled = true;
            if (clearResultTimeout) clearTimeout(clearResultTimeout);
            clearResultTimeout = setTimeout(() => {
                result.textContent = '';
                result.className = '';
                guessInput.disabled = false;
                document.getElementById('guess-btn').disabled = false;
                guessInput.focus();
            }, 1200);
        } else {
            document.getElementById('player-img').classList.remove('blurred');
            result.innerHTML = `¡Perdiste! El jugador era <b>${selectedPlayer.name}</b>.`;
            result.className = "incorrect";
            document.getElementById('restart-btn').style.display = 'block';
            guessInput.disabled = true;
            document.getElementById('guess-btn').disabled = true;
        }
    }
}

// Carga ambos JSON antes de iniciar el juego
Promise.all([
    fetch('../../teams.json').then(res => res.json()),
]).then(([teams, flags]) => {
    flagsData = flags;
    allPlayers = getAllPlayers(teams);
    selectedPlayer = pickRandomPlayer(allPlayers);
    showPlayerInfo(selectedPlayer);
    renderLives();

    document.getElementById('guess-input').addEventListener('input', (e) => {
        showSuggestions(e.target.value);
    });

    document.getElementById('guess-input').addEventListener('keydown', (e) => {
        const suggestions = document.getElementById('suggestions');
        const total = suggestions.children.length;
        if (total > 0) {
            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (suggestionIndex < total - 1) {
                    setActiveSuggestion(suggestionIndex + 1);
                } else {
                    setActiveSuggestion(0);
                }
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                if (suggestionIndex > 0) {
                    setActiveSuggestion(suggestionIndex - 1);
                } else {
                    setActiveSuggestion(total - 1);
                }
            } else if (e.key === "Enter") {
                if (suggestionIndex >= 0) {
                    e.preventDefault();
                    selectSuggestion();
                } else {
                    checkGuess();
                }
            }
        } else if (e.key === "Enter") {
            checkGuess();
        }
    });

    document.getElementById('guess-btn').onclick = checkGuess;
    document.getElementById('restart-btn').onclick = resetGame;
});