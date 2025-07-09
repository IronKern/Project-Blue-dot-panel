// script.js - Überarbeitete Version für Project Blue Dot Panel

document.addEventListener('DOMContentLoaded', () => {

    // --- Konfiguration ---
    const BASE_URL = 'https://threadbaresurefootedtelevision-1.onrender.com'; // Ihre Bot-API-Basis-URL
    const FETCH_INTERVAL = 10000; // Daten alle 10 Sekunden abrufen (10000 ms)

    // --- DOM-Elemente abrufen ---
    // Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    // Bot Statistiken
    const botStatus = document.getElementById('bot-status');
    const serverCount = document.getElementById('server-count');
    const userCount = document.getElementById('user-count');
    const botPing = document.getElementById('bot-ping');
    const botUptime = document.getElementById('bot-uptime');
    const totalCommands = document.getElementById('total-commands');
    const cpuUsage = document.getElementById('cpu-usage'); // Neu
    const ramUsage = document.getElementById('ram-usage');   // Neu
    const storageUsage = document.getElementById('storage-usage'); // Neu
    const lastUpdatedTime = document.getElementById('last-updated-time');
    const pythonVersion = document.getElementById('python-version');
    const nextcordVersion = document.getElementById('nextcord-version');

    // Befehlsfilter
    const categoryButtons = document.querySelectorAll('.category-btn');
    const commandItems = document.querySelectorAll('.command-item');

    // Animations-Elemente
    const animTargets = document.querySelectorAll('.anim-target');

    // --- Hilfsfunktionen ---

    /**
     * Formatiert die Uptime von Sekunden in ein menschenlesbares Format (Tage, Stunden, Minuten, Sekunden).
     * @param {number} totalSeconds - Die Gesamtzahl der Sekunden.
     * @returns {string} Formatierte Uptime-Zeichenkette.
     */
    function formatUptime(totalSeconds) {
        if (totalSeconds === undefined || totalSeconds === null || isNaN(totalSeconds)) {
            return 'N/A';
        }

        const days = Math.floor(totalSeconds / (3600 * 24));
        totalSeconds %= (3600 * 24);
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        // Zeigt Sekunden immer an, es sei denn, es ist eine sehr lange Uptime und Sekunden sind 0
        if (parts.length === 0 || seconds > 0 || (days === 0 && hours === 0 && minutes === 0 && seconds === 0)) {
            parts.push(`${seconds}s`);
        }

        return parts.join(' ') || '0s'; // Stellt sicher, dass bei 0 Sekunden '0s' angezeigt wird
    }

    /**
     * Speichert Bot-Statistikdaten im Local Storage.
     * @param {object} data - Das zu speichernde Datenobjekt.
     */
    function saveBotStatsToLocalStorage(data) {
        try {
            localStorage.setItem('botStatsCache', JSON.stringify(data));
            localStorage.setItem('lastUpdatedTime', Date.now().toString());
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }

    /**
     * Lädt Bot-Statistikdaten aus dem Local Storage.
     * @returns {object|null} Das geladene Datenobjekt oder null, wenn nichts gefunden wurde.
     */
    function loadBotStatsFromLocalStorage() {
        try {
            const cachedData = localStorage.getItem('botStatsCache');
            const lastUpdateTime = localStorage.getItem('lastUpdatedTime');
            return cachedData ? { ...JSON.parse(cachedData), timestamp: lastUpdateTime ? parseInt(lastUpdateTime) : Date.now() } : null;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return null;
        }
    }

    /**
     * Zeigt die Bot-Statistiken auf der Webseite an.
     * @param {object|null} statsData - Daten vom /api/stats Endpunkt.
     * @param {object|null} infoData - Daten vom /api/bot/info Endpunkt.
     * @param {boolean} isCached - Gibt an, ob die angezeigten Daten aus dem Cache stammen.
     */
    function displayBotStats(statsData, infoData, isCached = false) {
        // Status und allgemeine Statistiken
        if (botStatus) { // Prüfen, ob Element existiert
            botStatus.textContent = statsData?.status || 'Offline';
            botStatus.className = `stat-value status-${(statsData?.status || 'offline').toLowerCase()}`;
        }
        if (serverCount) {
            serverCount.textContent = statsData?.server_count?.toLocaleString() || 'N/A';
        }
        if (totalCommands) {
            totalCommands.textContent = statsData?.command_count?.toLocaleString() || 'N/A';
        }
        // Neue Felder für CPU, RAM, Storage (aus infoData und statsData)
        if (cpuUsage) {
            cpuUsage.textContent = (statsData?.cpu_usage !== undefined && statsData?.cpu_usage !== null) ? `${statsData.cpu_usage}%` : 'N/A';
        }
        if (ramUsage) {
            ramUsage.textContent = (statsData?.memory_usage !== undefined && statsData?.memory_usage !== null) ? `${statsData.memory_usage}MB` : 'N/A';
        }
        if (storageUsage) {
            storageUsage.textContent = (statsData?.disk_usage !== undefined && statsData?.disk_usage !== null) ? `${statsData.disk_usage}GB` : 'N/A';
        }


        // Detaillierte Bot-Informationen
        if (userCount) {
            userCount.textContent = infoData?.users?.toLocaleString() || 'N/A';
        }
        if (botPing) { //
            // Ping-Fix: Nutzt 'latency_ms' wie im Screenshot der Netzwerkanfrage gezeigt
            botPing.textContent = (infoData?.latency_ms !== undefined && infoData?.latency_ms !== null) ? `${infoData.latency_ms}ms` : 'N/A';
        }
        if (botUptime) { //
            // Uptime-Fix: Nutzt 'uptime_seconds' und formatiert es
            botUptime.textContent = formatUptime(infoData?.uptime_seconds);
        }
        if (pythonVersion) { //
            pythonVersion.textContent = infoData?.python_version || 'N/A';
        }
        if (nextcordVersion) { //
            nextcordVersion.textContent = infoData?.nextcord_version || 'N/A';
        }

        // Letzte Aktualisierungszeit
        if (lastUpdatedTime) {
            const time = isCached ? new Date(localStorage.getItem('lastUpdatedTime') || Date.now()) : new Date();
            lastUpdatedTime.textContent = isCached ? `Cached: ${time.toLocaleTimeString()}` : time.toLocaleTimeString();
        }
    }

    /**
     * Holt Bot-Statistiken und -Informationen von den API-Endpunkten.
     * Bei Erfolg werden die Daten angezeigt und im Local Storage gespeichert.
     * Bei Fehler werden Daten aus dem Local Storage geladen und angezeigt.
     */
    async function fetchBotStatsAndInfo() {
        let statsData = null;
        let infoData = null;

        try {
            // Gleichzeitiger Abruf beider Endpunkte für bessere Performance
            const [statsResponse, infoResponse] = await Promise.all([
                fetch(`${BASE_URL}/api/stats`),
                fetch(`${BASE_URL}/api/bot/info`)
            ]);

            if (!statsResponse.ok) {
                console.warn(`HTTP error from /api/stats! Status: ${statsResponse.status}`);
                // Trotzdem versuchen, die Info-Daten zu parsen, falls statsResponse der einzige Fehler war
                statsData = null; // Setze explizit auf null bei Fehler
            } else {
                statsData = await statsResponse.json();
            }

            if (!infoResponse.ok) {
                console.warn(`HTTP error from /api/bot/info! Status: ${infoResponse.status}`);
                // Trotzdem versuchen, die Stats-Daten zu parsen, falls infoResponse der einzige Fehler war
                infoData = null; // Setze explizit auf null bei Fehler
            } else {
                infoData = await infoResponse.json();
            }

            // Wenn mindestens ein Datensatz erfolgreich war, oder beide, anzeigen und speichern
            if (statsData || infoData) {
                displayBotStats(statsData, infoData);
                saveBotStatsToLocalStorage({ stats: statsData, info: infoData });
            } else {
                // Wenn beide fehlschlagen, versuchen, aus dem Cache zu laden
                throw new Error("Both API endpoints failed to return valid data.");
            }

        } catch (error) {
            console.error("Error fetching bot statistics or info:", error);
            // Bei jedem Fehler: versuchen, aus dem Cache zu laden
            const cached = loadBotStatsFromLocalStorage();
            if (cached && (cached.stats || cached.info)) { // Prüfen, ob überhaupt Daten im Cache sind
                console.log('Displaying cached data due to fetch error.');
                displayBotStats(cached.stats, cached.info, true);
            } else {
                console.log('No live data and no cached data available. Displaying N/A.');
                displayBotStats(null, null); // Alle Felder auf N/A setzen
            }
        }
    }

    // --- Initialisierung & Event Listener ---

    // Initiales Laden: Zuerst Cache prüfen, dann Live-Daten abrufen
    const initialCachedData = loadBotStatsFromLocalStorage();
    if (initialCachedData && (initialCachedData.stats || initialCachedData.info)) {
        console.log('Initial load: Displaying cached data.');
        displayBotStats(initialCachedData.stats, initialCachedData.info, true);
    } else {
        console.log('Initial load: No cached data. Displaying "Lade..." or N/A.');
        // Optional: Hier könnten Sie initial 'Lade...' in alle Felder setzen,
        // was aber bereits durch die HTML-Platzhalter abgedeckt sein sollte.
        displayBotStats(null, null); // Setzt alles auf N/A bis Daten kommen
    }
    fetchBotStatsAndInfo(); // Immer versuchen, Live-Daten abzurufen

    // Periodischer Abruf der Statistiken
    setInterval(fetchBotStatsAndInfo, FETCH_INTERVAL);

    // Hamburger Menü Funktionalität
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('nav-active');
            hamburger.classList.toggle('active');
        });

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('nav-active')) {
                    navLinks.classList.remove('nav-active');
                    hamburger.classList.remove('active');
                }
            });
        });
    }


    // Befehlsfilter Funktionalität
    function filterCommandsByCategory() {
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category; // Optional Chaining

        if (!activeCategory) return; // Frühzeitiger Exit, wenn kein aktiver Button gefunden

        commandItems.forEach(item => {
            const itemCategories = item.dataset.category?.split(' ') || []; // Optional Chaining und Fallback zu leerem Array

            const matchesCategory = activeCategory === 'all' || itemCategories.includes(activeCategory);

            if (matchesCategory) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Entferne 'active' von allen Buttons und füge es dem geklickten hinzu
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterCommandsByCategory();
            });
        });
        // Initialer Filter, um alle Befehle anzuzeigen (oder die Standardkategorie)
        filterCommandsByCategory();
    }


    // Intersection Observer für Animationen
    const observerOptions = {
        root: null, // Der Viewport ist die Wurzel
        rootMargin: '0px',
        threshold: 0.05 // Auslösen, wenn 5% des Elements sichtbar sind
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                const animItems = entry.target.querySelectorAll('.anim-item');
                animItems.forEach((item, index) => {
                    item.style.transitionDelay = `calc(${index} * var(--animation-delay-step))`;
                });
            } else {
                // Optional: Animation zurücksetzen, wenn Element den Viewport verlässt
                // entry.target.classList.remove('in-view');
                entry.target.querySelectorAll('.anim-item').forEach(item => {
                    item.style.transitionDelay = '0s'; // Delay zurücksetzen
                });
            }
        });
    }, observerOptions);

    if (animTargets.length > 0) {
        animTargets.forEach(target => {
            observer.observe(target);
        });

        // Sofortige Prüfung beim Laden für Elemente, die bereits im Viewport sind
        observer.takeRecords().forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                const animItems = entry.target.querySelectorAll('.anim-item');
                animItems.forEach((item, index) => {
                    item.style.transitionDelay = `calc(${index} * var(--animation-delay-step))`;
                });
            }
        });
    }
});
