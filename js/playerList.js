// 1. Obtener el parámetro "id" de la URL
function getTeamIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

fetch('../../teams.json')
    .then(response => response.json())
    .then(teams => {
        const contenedor = document.getElementById("player-list");
        contenedor.innerHTML = "";

        // 2. Buscar el equipo por shortName (o name)
        const teamId = getTeamIdFromUrl();
        const team = teams.find(t => t.shortName === teamId || t.name === teamId);

        if (team) {
            document.title = team.shortName + ' - Lista de jugadores'; // Cambia el título de la pestaña
            // Mostrar nombre y logo
            const teamHeader = document.createElement("div");
            teamHeader.className = "team-header";
            teamHeader.innerHTML = `
                <h2>${team.name}</h2>
                <img src="${team.logo}" alt="${team.name}" style="max-width:150px;">
            `;
            contenedor.appendChild(teamHeader);

            // Mostrar jugadores por sección
            if (team.squad && Array.isArray(team.squad)) {
                team.squad.forEach(section => {
                    const sectionDiv = document.createElement("div");
                    sectionDiv.className = "player-section";

                    const sectionTitle = document.createElement("h3");
                    sectionTitle.textContent = section.title.charAt(0).toUpperCase() + section.title.slice(1);
                    sectionDiv.appendChild(sectionTitle);

                    const playerList = document.createElement("ul");
                    playerList.className = "player-list";
                    section.members.forEach(player => {
                        // Crear el elemento de jugador
                        const playerItem = document.createElement("li");
                        playerItem.className = "player-card";
                        playerItem.setAttribute("data-player-id", player.id || player.name); // Usa id si existe, sino name
                        playerItem.setAttribute("data-player-name", player.name);

                        // Nombre y número
                        const playerInfo = document.createElement("span");
                        playerInfo.textContent = player.name + (player.shirtNumber ? ` (#${player.shirtNumber})` : "");

                        // Botón de favorito
                        const favBtn = document.createElement("button");
                        favBtn.className = "fav-btn";
                        favBtn.textContent = "❤️";

                        playerItem.appendChild(playerInfo);
                        playerItem.appendChild(favBtn);
                        playerList.appendChild(playerItem);
                    });
                    sectionDiv.appendChild(playerList);
                    contenedor.appendChild(sectionDiv);
                });

                // Inicializa la lógica de favoritos (asegúrate de tener favorites.js incluido)
                if (typeof initFavorites === "function") {
                    initFavorites();
                }
            } else {
                contenedor.innerHTML += "<p>No hay jugadores cargados.</p>";
            }
        } else {
            contenedor.innerHTML = "<p>Equipo no encontrado.</p>";
        }
    });

// Asegúrate de que favorites.js esté incluido en tu HTML para que funcione el sistema de favoritos.