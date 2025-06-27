fetch('../../teams.json')
	.then(response => response.json())
	.then(teams => {

	// Obtener el contenedor donde se mostrarán los equipos
	const contenedor = document.getElementById("team-list");
	contenedor.innerHTML = "";

	// Recorrer los equipos y crear los elementos HTML
	teams.forEach(team => {
		let teamLink = document.createElement("a");
		teamLink.className = "team-link";
		teamLink.href = 'team-playerList.html?id=' + team.shortName; // Usar el enlace real

		let teamDiv = document.createElement("div");
		teamDiv.className = "team";

		let teamLogo = document.createElement("img");
		teamLogo.src = team.logo; // Usar el logo real

		let teamName = document.createElement("h2");
		teamName.textContent = team.name;

		teamDiv.appendChild(teamLogo);
		teamDiv.appendChild(teamName);
		teamLink.appendChild(teamDiv);
		contenedor.appendChild(teamLink);
	});
})

