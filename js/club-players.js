let allTeams = [];
let allPlayers = [];
let selectedClub = null;
let correctPlayers = [];
let options = [];
let selectedIndexes = [];

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function pickRandomClub(teams) {
    return teams[Math.floor(Math.random() * teams.length)];
}

function getPlayersForClub(team) {
    let players = [];
    if (team.squad) {
        team.squad.forEach(section => {
            section.members.forEach(player => {
                if (player.id && player.name) players.push(player);
            });
        });
    }
    return players;
}

function getRandomOptions(correctPlayers, allPlayers) {
    // Limita la cantidad máxima de correctos a la cantidad de correctos o 10
    const maxCorrect = Math.min(correctPlayers.length, 10);
    const numCorrect = Math.max(1, Math.floor(Math.random() * maxCorrect) + 1);
    shuffle(correctPlayers);
    const correct = correctPlayers.slice(0, numCorrect);

    // Ahora, jugadores incorrectos (que no estén en los correctos)
    const incorrects = allPlayers.filter(p => !correct.some(cp => cp.id === p.id));
    shuffle(incorrects);
    const numIncorrect = Math.max(0, 10 - correct.length);
    const options = [...correct, ...incorrects.slice(0, numIncorrect)];
    shuffle(options);
    return { options, correct };
}

function renderRound() {
    document.getElementById('result').textContent = '';
    document.getElementById('restart-btn').style.display = 'none';
    document.getElementById('submit-btn').disabled = false;
    selectedIndexes = [];

    // Elige club y jugadores
    selectedClub = pickRandomClub(allTeams);
    correctPlayers = getPlayersForClub(selectedClub);

    // Si el club tiene menos de 1 jugador, vuelve a intentar
    if (correctPlayers.length < 1) {
        renderRound();
        return;
    }

    // Opciones para mostrar
    const { options: opts, correct } = getRandomOptions(correctPlayers, allPlayers);
    options = opts;
    const correctIds = correct.map(p => p.id);

    // Club info
    document.getElementById('club-logo').src = selectedClub.logo;
    document.getElementById('club-name').textContent = selectedClub.name;

    // Renderiza opciones
    const playersList = document.getElementById('players-list');
    playersList.innerHTML = '';
    options.forEach((player, idx) => {
        const div = document.createElement('div');
        div.className = 'player-option';
        div.textContent = player.name;
        div.onclick = () => toggleSelect(idx, div);
        playersList.appendChild(div);
    });

    // Botón enviar
    document.getElementById('submit-btn').onclick = () => checkAnswers(correctIds);
}

function toggleSelect(idx, div) {
    if (selectedIndexes.includes(idx)) {
        selectedIndexes = selectedIndexes.filter(i => i !== idx);
        div.classList.remove('selected');
    } else {
        selectedIndexes.push(idx);
        div.classList.add('selected');
    }
}

function checkAnswers(correctIds) {
    document.getElementById('submit-btn').disabled = true;
    const playersList = document.getElementById('players-list').children;
    let aciertos = 0, errores = 0, faltaron = 0;

    // Marca cada opción
    options.forEach((player, idx) => {
        const div = playersList[idx];
        const isSelected = selectedIndexes.includes(idx);
        const isCorrect = correctIds.includes(player.id);

        if (isCorrect && isSelected) {
            div.classList.add('correct'); // Acertó
            aciertos++;
        } else if (isCorrect && !isSelected) {
            div.classList.add('missed'); // Faltó
            faltaron++;
        } else if (!isCorrect && isSelected) {
            div.classList.add('incorrect'); // Error
            errores++;
        }
        div.classList.remove('selected');
    });

    // Mensaje de resultado
    let msg = '';
    if (aciertos > 0 && errores === 0 && faltaron === 0) {
        msg = '¡Correcto! Seleccionaste todos los jugadores del club.';
    } else {
        msg = 'Incorrecto. ';
        if (errores > 0) msg += `Marcaste ${errores} que no pertenecen. `;
        if (faltaron > 0) msg += `Te faltaron ${faltaron} jugadores.`;
    }
    document.getElementById('result').textContent = msg;
    document.getElementById('restart-btn').style.display = 'block';
}

document.getElementById('restart-btn').onclick = renderRound;

// Carga datos y arranca el juego
fetch('../../teams.json')
    .then(res => res.json())
    .then(teams => {
        allTeams = teams;
        // Junta todos los jugadores de todos los equipos
        teams.forEach(team => {
            if (team.squad) {
                team.squad.forEach(section => {
                    section.members.forEach(player => {
                        if (player.id && player.name) allPlayers.push(player);
                    });
                });
            }
        });
        renderRound();
    });