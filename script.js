document.addEventListener('DOMContentLoaded', () => {
    // === Hamburger Menü Funktionalität ===
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('active');
    });

    // === Live-Informationspanel (Platzhalter) ===
    const botStatus = document.getElementById('bot-status');
    const serverCount = document.getElementById('server-count');
    const userCount = document.getElementById('user-count');
    const botPing = document.getElementById('bot-ping');
    const botUptime = document.getElementById('bot-uptime');
    const lastUpdatedTime = document.getElementById('last-updated-time');

    function updateLiveStats() {
        // Hier würden Sie normalerweise einen API-Aufruf an Ihren Bot senden.
        // Beispiel (Pseudocode):
        /*
        fetch('/api/bot-stats') // Ersetzen Sie dies durch Ihre tatsächliche Bot-API-Endpunkt
            .then(response => response.json())
            .then(data => {
                botStatus.textContent = data.status;
                botStatus.className = data.status.toLowerCase() === 'online' ? 'status-online' : 'status-offline';
                serverCount.textContent = data.servers.toLocaleString();
                userCount.textContent = data.users.toLocaleString();
                botPing.textContent = `${data.ping}ms`;
                botUptime.textContent = data.uptime; // z.B. "2 Tage, 5 Stunden"
                lastUpdatedTime.textContent = new Date().toLocaleTimeString();
            })
            .catch(error => {
                console.error('Fehler beim Abrufen der Bot-Statistiken:', error);
                botStatus.textContent = 'Fehler';
                botStatus.className = 'status-offline';
                serverCount.textContent = 'N/A';
                userCount.textContent = 'N/A';
                botPing.textContent = 'N/A';
                botUptime.textContent = 'N/A';
                lastUpdatedTime.textContent = new Date().toLocaleTimeString();
            });
        */

        // Statische Platzhalterdaten für Demonstrationszwecke:
        const now = new Date();
        botStatus.textContent = 'Online';
        botStatus.className = 'status-online';
        serverCount.textContent = Math.floor(Math.random() * 500) + 100; // Zufällige Serverzahl
        userCount.textContent = Math.floor(Math.random() * 50000) + 10000; // Zufällige Benutzerzahl
        botPing.textContent = `${Math.floor(Math.random() * 100) + 20}ms`; // Zufälliger Ping
        botUptime.textContent = '3 Tage, 12 Stunden'; // Statische Uptime
        lastUpdatedTime.textContent = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // Aktualisiere die Statistiken beim Laden und dann alle 10 Sekunden
    updateLiveStats();
    setInterval(updateLiveStats, 10000); // Alle 10 Sekunden aktualisieren

    // === Command Such- und Filterfunktionalität ===
    const commandSearchInput = document.getElementById('command-search');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const commandCards = document.querySelectorAll('.command-card');

    function filterCommands() {
        const searchTerm = commandSearchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;

        commandCards.forEach(card => {
            const commandName = card.querySelector('h4').textContent.toLowerCase();
            const commandDescription = card.querySelector('p').textContent.toLowerCase();
            const cardCategories = card.dataset.category.split(' '); // Holt alle Kategorien des Commands

            const matchesSearch = commandName.includes(searchTerm) || commandDescription.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || cardCategories.includes(activeCategory);

            if (matchesSearch && matchesCategory) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    }

    commandSearchInput.addEventListener('keyup', filterCommands);

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Aktiven Button entfernen
            document.querySelector('.category-btn.active').classList.remove('active');
            // Neuen Button als aktiv markieren
            button.classList.add('active');
            filterCommands(); // Commands neu filtern
        });
    });

    // Initialfilter beim Laden der Seite
    filterCommands();
});
