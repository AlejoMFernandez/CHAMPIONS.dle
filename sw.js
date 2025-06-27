const cacheName = 'champions-league-files-v1';
const assets = [
    '/',
    '/index.html',
    '/sw.js',
    '/teams.json',
    '/manifest.json',
    '/css/style.css',
    '/css/partials/footer.css',
    '/css/partials/header.css',
    '/css/views/favorites.css',
    '/css/views/games.css',
    '/css/views/index.css',
    '/css/views/teamList.css',
    '/css/views/teamplayerList.css',
    '/css/views/games/club.css',
    '/css/views/games/guess.css',
    '/css/views/games/who.css',
    '/html/games.html',
    '/html/games/club.html',
    '/html/games/guess.html',
    '/html/games/who.html',
    '/html/list/favorites.html',
    '/html/list/team-List.html',
    '/html/list/team-playerList.html',
    '/js/club-players.js',
    '/js/favorites.js',
    '/js/guess.js',
    '/js/playerList.js',
    '/js/teamList.js',
    '/js/who.js',
];

self.addEventListener('install', (event) => {
    console.log("sw instalado");
    event.waitUntil(
        caches.open(cacheName)
        .then((cache) => {
            return cache.addAll(assets);
        })
    );
});

self.addEventListener('activate', () => {
    console.log("sw activado");
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
        .then((res) => {
            if (res) {
                return res;
            }
            let requestToCache = event.request.clone();
            return fetch(requestToCache)
                .then((res) => {
                    if (!res || res.status !== 200 || res.type !== 'basic') {
                        return res;
                    }
                    let responseToCache = res.clone();
                    caches.open(cacheName)
                        .then((cache) => {
                            cache.put(requestToCache, responseToCache);
                        });
                    return res;
                });
        })
    );
});