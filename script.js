document.addEventListener('DOMContentLoaded', () => {
    // --- Hamburger-Menü Funktionalität ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

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

    // --- Bot Live-Statistiken Funktionalität ---
    const BASE_API_URL = 'https://threadbaresurefootedtelevision-1.onrender.com/api'; // Basis-URL deiner Render-API

    const botStatus = document.getElementById('bot-status');
    const serverCount = document.getElementById('server-count');
    const userCount = document.getElementById('user-count');
    const botPing = document.getElementById('bot-ping');
    const botUptime = document.getElementById('bot-uptime');
    const lastCommand = document.getElementById('last-command');
    const totalCommands = document.getElementById('total-commands');
    const lastUpdatedTime = document.getElementById('last-updated-time');


    async function fetchBotStats() {
        try {
            // Gleichzeitiges Abrufen von Daten von allen relevanten Endpunkten
            const [statsResponse, commandsResponse, uptimeResponse] = await Promise.all([
                fetch(`${BASE_API_URL}/stats`),
                fetch(`${BASE_API_URL}/commands`),
                fetch(`${BASE_API_URL}/uptime`)
            ]);

            // Überprüfen, ob alle Anfragen erfolgreich waren
            if (!statsResponse.ok || !commandsResponse.ok || !uptimeResponse.ok) {
                let errorMessage = "Fehler beim Abrufen der Bot-Statistiken: ";
                if (!statsResponse.ok) errorMessage += `Stats-API (${statsResponse.status}) `;
                if (!commandsResponse.ok) errorMessage += `Commands-API (${commandsResponse.status}) `;
                if (!uptimeResponse.ok) errorMessage += `Uptime-API (${uptimeResponse.status}) `;
                throw new Error(errorMessage);
            }

            const statsData = await statsResponse.json();
            const commandsData = await commandsResponse.json();
            const uptimeData = await uptimeResponse.json();

            // Aktualisiere die Elemente mit den empfangenen Daten von /api/stats
            botStatus.textContent = statsData.status;
            botStatus.className = `stat-value status-${statsData.status.toLowerCase()}`;
            serverCount.textContent = statsData.servers.toLocaleString(); // Verwende toLocaleString für Tausendertrennung
            userCount.textContent = statsData.users.toLocaleString();
            botPing.textContent = `${statsData.ping}ms`;
            lastUpdatedTime.textContent = statsData.lastUpdated;

            // Aktualisiere Uptime-Daten von /api/uptime
            botUptime.textContent = uptimeData.uptime;

            // Aktualisiere Kommando-Daten von /api/commands
            lastCommand.textContent = commandsData.lastCommand;
            totalCommands.textContent = commandsData.totalCommands.toLocaleString(); // Verwende toLocaleString


        } catch (error) {
            console.error("Fehler beim Abrufen der Bot-Statistiken:", error);
            // Setze Fallback-Werte und Fehlerstatus bei Problemen
            botStatus.textContent = 'Offline';
            botStatus.className = 'stat-value status-offline';
            serverCount.textContent = 'N/A';
            userCount.textContent = 'N/A';
            botPing.textContent = 'N/A';
            botUptime.textContent = 'N/A';
            lastUpdatedTime.textContent = 'Fehler';
            lastCommand.textContent = 'N/A';
            totalCommands.textContent = 'N/A';
        }
    }

    // Statistiken sofort beim Laden und dann alle 10 Sekunden aktualisieren
    fetchBotStats();
    setInterval(fetchBotStats, 10000);

    // --- Command-Suche und Filter Funktionalität ---
    const commandSearchInput = document.getElementById('command-search');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const commandItems = document.querySelectorAll('.command-item');

    function filterCommands() {
        const searchTerm = commandSearchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;

        commandItems.forEach(item => {
            const commandName = item.querySelector('h4').textContent.toLowerCase();
            const commandDescription = item.querySelector('p').textContent.toLowerCase();
            const itemCategories = item.dataset.category.split(' ');

            const matchesSearch = commandName.includes(searchTerm) || commandDescription.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || itemCategories.includes(activeCategory);

            if (matchesSearch && matchesCategory) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    commandSearchInput.addEventListener('keyup', filterCommands);

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.category-btn.active').classList.remove('active');
            button.classList.add('active');
            filterCommands();
        });
    });

    filterCommands();

    // --- Intersection Observer für Animationen ---
    const animTargets = document.querySelectorAll('.anim-target');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.05
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
                entry.target.querySelectorAll('.anim-item').forEach(item => {
                    item.style.transitionDelay = '0s';
                });
            }
        });
    }, observerOptions);

    animTargets.forEach(target => {
        observer.observe(target);
    });

    observer.takeRecords().forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            const animItems = entry.target.querySelectorAll('.anim-item');
            animItems.forEach((item, index) => {
                item.style.transitionDelay = `calc(${index} * var(--animation-delay-step))`;
            });
        }
    });
});
