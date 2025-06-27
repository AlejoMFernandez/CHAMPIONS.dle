function addToFavorites(player) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  if (!favorites.some(fav => fav.id === player.id)) {
    favorites.push(player);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
  console.log("Agregado a FAVORITOS")
}

function removeFromFavorites(playerId) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  favorites = favorites.filter(fav => fav.id !== playerId);
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function isFavorite(playerId) {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  return favorites.some(fav => fav.id === playerId);
}

function initFavorites() {
  document.querySelectorAll('.player-card').forEach(card => {
    const playerId = card.getAttribute('data-player-id');
    const playerName = card.getAttribute('data-player-name');
    const favBtn = card.querySelector('.fav-btn');

    // Estado inicial del botón
    if (isFavorite(playerId)) {
      favBtn.textContent = '💔';
      favBtn.classList.add('active');
    }

    favBtn.addEventListener('click', () => {
      if (isFavorite(playerId)) {
        removeFromFavorites(playerId);
        favBtn.textContent = '❤️';
        favBtn.classList.remove('active');
      } else {
        addToFavorites({ id: playerId, name: playerName });
        favBtn.textContent = '💔';
        favBtn.classList.add('active');
      }
    });
  });
}