document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const commandItems = document.querySelectorAll('.command-item');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.querySelectorAll('nav-links a').forEach(link => {
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

            document.getElementById('bot-status').textContent = botInfo.status ? 'Online' : 'Offline';
            document.getElementById('server-count').textContent = botInfo.guilds;
            document.getElementById('user-count').textContent = botInfo.users;
            document.getElementById('bot-ping').textContent = `${botInfo.latency_ms}ms`;
            document.getElementById('bot-uptime').textContent = stats.uptime_formatted;
            document.getElementById('total-commands').textContent = stats.command_count;
            document.getElementById('cpu-usage').textContent = `${stats.cpu_usage}%`;
            document.getElementById('memory-usage').textContent = `${stats.memory_usage}MB`;
            document.getElementById('disk-usage').textContent = `${stats.disk_usage}%`;
            document.getElementById('python-version').textContent = stats.python_version;
            document.getElementById('nextcord-version').textContent = stats.nextcord_version;

            const now = new Date();
            document.getElementById('last-updated-time').textContent = now.toLocaleTimeString('de-DE');

        } catch (error) {
            console.error('Fehler beim Abrufen der Bot-Statistiken:', error);
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
