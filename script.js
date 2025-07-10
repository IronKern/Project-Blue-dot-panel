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
    const errorCount = document.getElementById('error-count');
    const botVersion = document.getElementById('bot-version');
    const pythonVersion = document.getElementById('python-version');
    const botName = document.getElementById('bot-name');
    const createdBy = document.getElementById('created-by').querySelector('.stat-value');
    const botFeatures = document.getElementById('bot-features').querySelector('.features-list');
    const lastUpdatedTime = document.getElementById('last-updated-time');
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

    function displayBotStats(infoData, statsData, isCached = false) {
        if (botStatus && statsData?.status) {
            botStatus.textContent = statsData.status;
            botStatus.className = `stat-value status-${statsData.status.toLowerCase()}`;
        } else if (botStatus) {
            botStatus.textContent = 'Offline';
            botStatus.className = 'stat-value status-offline';
        }
        if (serverCount && statsData?.server_count) {
            serverCount.textContent = statsData.server_count.toLocaleString();
        }
        if (userCount && infoData?.users) {
            userCount.textContent = infoData.users.toLocaleString();
        } else if (userCount && statsData?.member_count) {
             userCount.textContent = statsData.member_count.toLocaleString();
        }
        if (botPing && statsData?.latency !== undefined) {
            botPing.textContent = `${statsData.latency}ms`;
        }
        if (botUptime && infoData?.uptime_seconds !== undefined) {
            botUptime.textContent = formatUptime(infoData.uptime_seconds);
        } else if (botUptime && statsData?.uptime !== undefined) {
            botUptime.textContent = formatUptime(statsData.uptime);
        }
        if (totalCommands && statsData?.command_count !== undefined) {
            totalCommands.textContent = statsData.command_count.toLocaleString();
        }
        if (errorCount && statsData?.error_count !== undefined) {
            errorCount.textContent = statsData.error_count.toLocaleString();
        }
        if (botVersion && infoData?.version) {
            botVersion.textContent = infoData.version;
        } else if (botVersion && statsData?.version) {
            botVersion.textContent = statsData.version;
        }
        if (pythonVersion && infoData?.python_version) {
            pythonVersion.textContent = infoData.python_version;
        }
        if (botName && infoData?.bot_name) {
            botName.textContent = infoData.bot_name;
        }
        if (createdBy && infoData?.created_by) {
            createdBy.textContent = infoData.created_by;
        }
        if (botFeatures && infoData?.features) {
            botFeatures.innerHTML = infoData.features.map(feature => `<li>${feature}</li>`).join('');
        }
        if (lastUpdatedTime) {
            const time = isCached ? new Date(localStorage.getItem('lastUpdatedTime') || Date.now()) : new Date();
            lastUpdatedTime.textContent = isCached ? `Cached: ${time.toLocaleTimeString()}` : time.toLocaleTimeString();
        }
    }

    async function pingEndpoint(url, name) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`${name} ping failed with status: ${response.status}`);
            }
        } catch (error) {
            console.error(`Error pinging ${name}:`, error);
        }
    }

    async function fetchBotStatsAndInfo() {
        let infoData = null;
        let statsData = null;
        try {
            const [infoResponse, statsResponse] = await Promise.allSettled([
                fetch(`${BASE_URL}/api/bot/info`),
                fetch(`${BASE_URL}/api/stats`)
            ]);
            infoData = infoResponse.status === 'fulfilled' ? await infoResponse.value.json() : null;
            statsData = statsResponse.status === 'fulfilled' ? await statsResponse.value.json() : null;
            if (infoData || statsData) {
                displayBotStats(infoData, statsData);
                saveBotStatsToLocalStorage({ info: infoData, stats: statsData });
            } else {
                throw new Error("Both API endpoints failed to return valid data.");
            }
        } catch (error) {
            console.error("Error fetching bot statistics or info:", error);
            const cached = loadBotStatsFromLocalStorage();
            if (cached && (cached.info || cached.stats)) {
                console.log('Displaying cached data due to fetch error.');
                displayBotStats(cached.info, cached.stats, true);
            } else {
                console.log('No live data and no cached data available. Displaying N/A.');
                displayBotStats(null, null);
            }
        }
    }

    async function performKeepAlivePings() {
        await Promise.all([
            pingEndpoint(`${BASE_URL}/health`, 'Health Check'),
            pingEndpoint(`${BASE_URL}/ping`, 'Simple Ping'),
            pingEndpoint(`${BASE_URL}/`, 'Dashboard Root')
        ]);
    }

    const initialCachedData = loadBotStatsFromLocalStorage();
    if (initialCachedData && (initialCachedData.info || initialCachedData.stats)) {
        displayBotStats(initialCachedData.info, initialCachedData.stats, true);
    } else {
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
            } else {}
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
