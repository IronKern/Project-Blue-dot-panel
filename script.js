document.addEventListener('DOMContentLoaded', () => {
    // --- Hamburger Menu Functionality ---
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

    // --- Bot Live Statistics Functionality ---
    const BASE_URL = 'https://threadbaresurefootedtelevision-1.onrender.com';

    const botStatus = document.getElementById('bot-status');
    const serverCount = document.getElementById('server-count');
    const userCount = document.getElementById('user-count');
    const botPing = document.getElementById('bot-ping');
    const botUptime = document.getElementById('bot-uptime');
    const lastCommand = document.getElementById('last-command');
    const totalCommands = document.getElementById('total-commands');
    const developmentStatus = document.getElementById('development-status');
    const lastUpdatedTime = document.getElementById('last-updated-time');

    // Function to format uptime from seconds to a human-readable string
    function formatUptime(seconds) {
        if (seconds === undefined || seconds === null) {
            return 'N/A';
        }
        const days = Math.floor(seconds / (3600 * 24));
        seconds %= (3600 * 24);
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        let uptimeString = [];
        if (days > 0) uptimeString.push(`${days}d`);
        if (hours > 0) uptimeString.push(`${hours}h`);
        if (minutes > 0) uptimeString.push(`${minutes}m`);
        // Only show seconds if less than 1 minute to keep it concise
        if (uptimeString.length === 0 || secs > 0) {
             uptimeString.push(`${secs}s`);
        }

        return uptimeString.join(' ');
    }


    // Function to save data to localStorage
    function saveBotStatsToLocalStorage(data) {
        try {
            localStorage.setItem('botStatsCache', JSON.stringify(data));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }

    // Function to load data from localStorage
    function loadBotStatsFromLocalStorage() {
        try {
            const cachedData = localStorage.getItem('botStatsCache');
            return cachedData ? JSON.parse(cachedData) : null;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return null;
        }
    }

    // Function to display data on the page
    function displayBotStats(statsData, infoData, isCached = false) {
        if (statsData) {
            botStatus.textContent = statsData.status;
            botStatus.className = `stat-value status-${statsData.status.toLowerCase()}`;
            serverCount.textContent = statsData.server_count ? statsData.server_count.toLocaleString() : 'N/A';
            totalCommands.textContent = statsData.command_count ? statsData.command_count.toLocaleString() : 'N/A';
            if (statsData.last_commands && statsData.last_commands.length > 0) {
                lastCommand.textContent = statsData.last_commands[statsData.last_commands.length - 1];
            } else {
                lastCommand.textContent = 'N/A';
            }
        } else {
            // Fallback for statsData if not available
            botStatus.textContent = 'Offline';
            botStatus.className = 'stat-value status-offline';
            serverCount.textContent = 'N/A';
            totalCommands.textContent = 'N/A';
            lastCommand.textContent = 'N/A';
        }

        if (infoData) {
            userCount.textContent = infoData.users ? infoData.users.toLocaleString() : 'N/A';
            botPing.textContent = infoData.latency_ms !== undefined && infoData.latency_ms !== null ? `${infoData.latency_ms}ms` : 'N/A';
            // FIX: Use uptime_seconds and format it
            botUptime.textContent = formatUptime(infoData.uptime_seconds);
        } else {
            // Fallback for infoData if not available
            userCount.textContent = 'N/A';
            botPing.textContent = 'N/A';
            botUptime.textContent = 'N/A';
        }

        developmentStatus.textContent = 'Work in progress';
        developmentStatus.className = 'stat-value status-wip';
        lastUpdatedTime.textContent = isCached ? `Cached: ${new Date(localStorage.getItem('lastUpdatedTime') || Date.now()).toLocaleTimeString()}` : new Date().toLocaleTimeString();
    }

    async function fetchBotStatsAndInfo() {
        let statsData = null;
        let infoData = null;
        let success = false;

        try {
            // Fetch from /api/stats
            const statsResponse = await fetch(`${BASE_URL}/api/stats`);
            if (!statsResponse.ok) {
                throw new Error(`HTTP error from /api/stats! Status: ${statsResponse.status}`);
            }
            statsData = await statsResponse.json();

            // Fetch from /api/bot/info
            const infoResponse = await fetch(`${BASE_URL}/api/bot/info`);
            if (!infoResponse.ok) {
                throw new Error(`HTTP error from /api/bot/info! Status: ${infoResponse.status}`);
            }
            infoData = await infoResponse.json();

            // If both successful, display and save
            displayBotStats(statsData, infoData);
            saveBotStatsToLocalStorage({ stats: statsData, info: infoData, timestamp: Date.now() });
            localStorage.setItem('lastUpdatedTime', Date.now()); // Store update time
            success = true;

        } catch (error) {
            console.error("Error fetching bot statistics or info:", error);
            // On error, try to load from cache
            const cached = loadBotStatsFromLocalStorage();
            if (cached && cached.stats && cached.info) {
                console.log('Displaying cached data.');
                displayBotStats(cached.stats, cached.info, true);
            } else {
                // If no cache or cache is empty/corrupt, display default N/A values
                console.log('No cached data available. Displaying N/A.');
                displayBotStats(null, null); // Displaying N/A for all fields
            }
        }
    }

    // Initial load: Try to display cached data first, then fetch live data
    const initialCachedData = loadBotStatsFromLocalStorage();
    if (initialCachedData && initialCachedData.stats && initialCachedData.info) {
        console.log('Initial load: Displaying cached data.');
        displayBotStats(initialCachedData.stats, initialCachedData.info, true);
    } else {
        console.log('Initial load: No cached data. Fetching live data.');
        displayBotStats(null, null); // Display N/A until live data is fetched
    }
    fetchBotStatsAndInfo(); // Always attempt to fetch live data

    // Fetch stats periodically
    setInterval(fetchBotStatsAndInfo, 10000); // Fetches data every 10 seconds

    // --- Command Filter Functionality (remains the same) ---
    const categoryButtons = document.querySelectorAll('.category-btn');
    const commandItems = document.querySelectorAll('.command-item');

    function filterCommandsByCategory() {
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;

        commandItems.forEach(item => {
            const itemCategories = item.dataset.category.split(' ');

            const matchesCategory = activeCategory === 'all' || itemCategories.includes(activeCategory);

            if (matchesCategory) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.category-btn.active').classList.remove('active');
            button.classList.add('active');
            filterCommandsByCategory();
        });
    });

    // Call initial filter to display all commands
    filterCommandsByCategory();

    // --- Intersection Observer for Animations (remains the same) ---
    const animTargets = document.querySelectorAll('.anim-target');

    const observerOptions = {
        root: null, // The viewport is the root
        rootMargin: '0px',
        threshold: 0.05 // Trigger when 5% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');

                const animItems = entry.target.querySelectorAll('.anim-item');
                animItems.forEach((item, index) => {
                    item.style.transitionDelay = `calc(${index} * var(--animation-delay-step))`;
                });
                // Optional: Stop observing after the element has been seen to animate only once
                // observer.unobserve(entry.target);
            } else {
                // Optional: Reset animation if element leaves viewport
                // entry.target.classList.remove('in-view');
                entry.target.querySelectorAll('.anim-item').forEach(item => {
                    item.style.transitionDelay = '0s'; // Reset delay when out of view
                });
            }
        });
    }, observerOptions);

    // Observe all targets
    animTargets.forEach(target => {
        observer.observe(target);
    });

    // Immediate check on load for elements already in view
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
