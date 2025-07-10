document.addEventListener('DOMContentLoaded', () => {

    const BASE_URL = 'https://threadbaresurefootedtelevision-1.onrender.com';
    const FETCH_INTERVAL = 10000;
    const KEEP_ALIVE_INTERVAL = 3 * 60 * 1000;

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    const botStatus = document.getElementById('bot-status');
    const serverCount = document.getElementById('server-count');
    const userCount = document.getElementById('user-count');
    const botPing = document.getElementById('bot-ping');
    const botUptime = document.getElementById('bot-uptime');
    const totalCommands = document.getElementById('total-commands');
    const cpuUsage = document.getElementById('cpu-usage');
    const ramUsage = document.getElementById('ram-usage');
    const storageUsage = document.getElementById('storage-usage');
    const lastUpdatedTime = document.getElementById('last-updated-time');
    const pythonVersion = document.getElementById('python-version');
    const nextcordVersion = document.getElementById('nextcord-version');

    const categoryButtons = document.querySelectorAll('.category-btn');
    const commandItems = document.querySelectorAll('.command-item');

    const animTargets = document.querySelectorAll('.anim-target');

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
        if (parts.length === 0 || seconds > 0 || (days === 0 && hours === 0 && minutes === 0 && seconds === 0)) {
            parts.push(`${seconds}s`);
        }

        return parts.join(' ') || '0s';
    }

    function saveBotStatsToLocalStorage(data) {
        try {
            localStorage.setItem('botStatsCache', JSON.stringify(data));
            localStorage.setItem('lastUpdatedTime', Date.now().toString());
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }

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

    function displayBotStats(statsData, infoData, isCached = false) {
        if (botStatus) {
            botStatus.textContent = statsData?.status || 'Offline';
            botStatus.className = `stat-value status-${(statsData?.status || 'offline').toLowerCase()}`;
        }
        if (serverCount) {
            serverCount.textContent = statsData?.server_count?.toLocaleString() || 'N/A';
        }
        if (totalCommands) {
            totalCommands.textContent = statsData?.command_count?.toLocaleString() || 'N/A';
        }
        if (cpuUsage) {
            cpuUsage.textContent = (statsData?.cpu_usage !== undefined && statsData?.cpu_usage !== null) ? `${statsData.cpu_usage.toFixed(2)}%` : 'N/A';
        }
        if (ramUsage) {
            ramUsage.textContent = (statsData?.memory_usage !== undefined && statsData?.memory_usage !== null) ? `${statsData.memory_usage.toFixed(2)}MB` : 'N/A';
        }
        if (storageUsage) {
            storageUsage.textContent = (statsData?.disk_usage !== undefined && statsData?.disk_usage !== null) ? `${statsData.disk_usage.toFixed(2)}GB` : 'N/A';
        }

        if (userCount) {
            userCount.textContent = infoData?.users?.toLocaleString() || 'N/A';
        }
        if (botPing) {
            botPing.textContent = (infoData?.latency_ms !== undefined && infoData?.latency_ms !== null) ? `${infoData.latency_ms}ms` : 'N/A';
        }
        if (botUptime) {
            botUptime.textContent = formatUptime(infoData?.uptime_seconds);
        }
        if (pythonVersion) {
            pythonVersion.textContent = infoData?.python_version || 'N/A';
        }
        if (nextcordVersion) {
            nextcordVersion.textContent = infoData?.nextcord_version || 'N/A';
        }

        if (lastUpdatedTime) {
            const time = isCached ? new Date(localStorage.getItem('lastUpdatedTime') || Date.now()) : new Date();
            lastUpdatedTime.textContent = isCached ? `Cached: ${time.toLocaleTimeString()}` : time.toLocaleTimeString();
        }
    }

    async function pingEndpoint(url, name) {
        try {
            const response = await fetch(url);
            if (response.ok) {
                console.log(`${name} ping successful.`);
            } else {
                console.warn(`${name} ping failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error pinging ${name}:`, error);
        }
    }

    async function fetchBotStatsAndInfo() {
        let statsData = null;
        let infoData = null;

        try {
            const [statsResponse, infoResponse] = await Promise.all([
                fetch(`${BASE_URL}/api/stats`),
                fetch(`${BASE_URL}/api/bot/info`)
            ]);

            if (!statsResponse.ok) {
                console.warn(`HTTP error from /api/stats! Status: ${statsResponse.status}`);
                statsData = null;
            } else {
                statsData = await statsResponse.json();
            }

            if (!infoResponse.ok) {
                console.warn(`HTTP error from /api/bot/info! Status: ${infoResponse.status}`);
                infoData = null;
            } else {
                infoData = await infoResponse.json();
            }

            if (statsData || infoData) {
                displayBotStats(statsData, infoData);
                saveBotStatsToLocalStorage({ stats: statsData, info: infoData });
            } else {
                throw new Error("Both API endpoints failed to return valid data.");
            }

        } catch (error) {
            console.error("Error fetching bot statistics or info:", error);
            const cached = loadBotStatsFromLocalStorage();
            if (cached && (cached.stats || cached.info)) {
                console.log('Displaying cached data due to fetch error.');
                displayBotStats(cached.stats, cached.info, true);
            } else {
                console.log('No live data and no cached data available. Displaying N/A.');
                displayBotStats(null, null);
            }
        }
    }

    async function performKeepAlivePings() {
        console.log('Performing keep-alive pings...');
        await Promise.all([
            pingEndpoint(`${BASE_URL}/health`, 'Health Check'),
            pingEndpoint(`${BASE_URL}/ping`, 'Simple Ping'),
            pingEndpoint(`${BASE_URL}/`, 'Dashboard Root')
        ]);
    }

    const initialCachedData = loadBotStatsFromLocalStorage();
    if (initialCachedData && (initialCachedData.stats || initialCachedData.info)) {
        console.log('Initial load: Displaying cached data.');
        displayBotStats(initialCachedData.stats, initialCachedData.info, true);
    } else {
        console.log('Initial load: No cached data. Displaying "Lade..." or N/A.');
        displayBotStats(null, null);
    }
    fetchBotStatsAndInfo();
    performKeepAlivePings();

    setInterval(fetchBotStatsAndInfo, FETCH_INTERVAL);
    setInterval(performKeepAlivePings, KEEP_ALIVE_INTERVAL);

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

    function filterCommandsByCategory() {
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category;

        if (!activeCategory) return;

        commandItems.forEach(item => {
            const itemCategories = item.dataset.category?.split(' ') || [];

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
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                filterCommandsByCategory();
            });
        });
        filterCommandsByCategory();
    }

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
            }
        });
    }, observerOptions);

    if (animTargets.length > 0) {
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
    }
});
