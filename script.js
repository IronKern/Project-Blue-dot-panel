document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const commandItems = document.querySelectorAll('.command-item');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.dataset.category;

            commandItems.forEach(item => {
                if (category === 'all' || item.dataset.category === category) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    const API_URL = 'https://threadbaresurefootedtelevision-1.onrender.com/api';

    async function fetchBotStats() {
        try {
            const botInfoResponse = await fetch(`${API_URL}/bot/info`);
            const botInfo = await botInfoResponse.json();

            const statsResponse = await fetch(`${API_URL}/stats`);
            const stats = await statsResponse.json();

            // Hilfsfunktion, um Werte sicher abzurufen oder Standardwert zu setzen
            const getSafeValue = (obj, key, defaultValue = 'N/A') => obj && obj[key] !== undefined ? obj[key] : defaultValue;

            document.getElementById('bot-status').textContent = getSafeValue(botInfo, 'status') ? 'Online' : 'Offline';
            document.getElementById('server-count').textContent = getSafeValue(botInfo, 'guilds');
            document.getElementById('user-count').textContent = getSafeValue(botInfo, 'users');
            document.getElementById('bot-ping').textContent = `${getSafeValue(botInfo, 'latency_ms')}ms`;
            
            // Für Uptime, CPU etc., die von der /stats API kommen
            document.getElementById('bot-uptime').textContent = getSafeValue(stats, 'uptime_formatted');
            document.getElementById('total-commands').textContent = getSafeValue(stats, 'command_count');
            document.getElementById('cpu-usage').textContent = `${getSafeValue(stats, 'cpu_usage')}%`;
            document.getElementById('memory-usage').textContent = `${getSafeValue(stats, 'memory_usage')}MB`;
            document.getElementById('disk-usage').textContent = `${getSafeValue(stats, 'disk_usage')}%`;
            document.getElementById('python-version').textContent = getSafeValue(stats, 'python_version');
            document.getElementById('nextcord-version').textContent = getSafeValue(stats, 'nextcord_version');

            const now = new Date();
            document.getElementById('last-updated-time').textContent = now.toLocaleTimeString('de-DE');

        } catch (error) {
            console.error('Fehler beim Abrufen der Bot-Statistiken:', error);
            // Setze auf N/A bei Fehlern, damit der Benutzer Feedback erhält
            document.getElementById('bot-status').textContent = 'Fehler';
            document.getElementById('server-count').textContent = 'N/A';
            document.getElementById('user-count').textContent = 'N/A';
            document.getElementById('bot-ping').textContent = 'N/A';
            document.getElementById('bot-uptime').textContent = 'N/A';
            document.getElementById('total-commands').textContent = 'N/A';
            document.getElementById('cpu-usage').textContent = 'N/A';
            document.getElementById('memory-usage').textContent = 'N/A';
            document.getElementById('disk-usage').textContent = 'N/A';
            document.getElementById('python-version').textContent = 'N/A';
            document.getElementById('nextcord-version').textContent = 'N/A';
            document.getElementById('last-updated-time').textContent = 'N/A';
        }
    }

    fetchBotStats();
    setInterval(fetchBotStats, 60000);

    const animTargets = document.querySelectorAll('.anim-target');

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Füge Verzögerung zu einzelnen Elementen hinzu, falls vorhanden
                entry.target.querySelectorAll('.anim-item').forEach((item, index) => {
                    item.style.transitionDelay = `${index * 0.1}s`;
                    item.classList.add('visible');
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animTargets.forEach(target => {
        observer.observe(target);
    });
});
