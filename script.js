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
    // IMPORTANT: Make sure this URL is correct for your Render deployment
    // It should be your app's root URL on Render.
    const BASE_URL = 'https://threadbaresurefootedtelevision-1.onrender.com'; // Corrected BASE_URL as per your instruction

    const botStatus = document.getElementById('bot-status');
    const serverCount = document.getElementById('server-count');
    const userCount = document.getElementById('user-count');
    const botPing = document.getElementById('bot-ping');
    const botUptime = document.getElementById('bot-uptime');
    const lastCommand = document.getElementById('last-command');
    const totalCommands = document.getElementById('total-commands');
    const developmentStatus = document.getElementById('development-status');
    const lastUpdatedTime = document.getElementById('last-updated-time');

    async function fetchBotStats() {
        try {
            const response = await fetch(`${BASE_URL}/api/stats`); // Use the corrected BASE_URL

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            // Update elements with data from the single /api/stats endpoint
            botStatus.textContent = data.status;
            botStatus.className = `stat-value status-${data.status.toLowerCase()}`; // Set class for color (online/offline)

            serverCount.textContent = data.server_count.toLocaleString();
            userCount.textContent = data.member_count.toLocaleString();
            botPing.textContent = `${data.latency}ms`;
            botUptime.textContent = data.uptime_formatted;
            totalCommands.textContent = data.command_count.toLocaleString();

            // Handle last_commands array: get the most recent one
            if (data.last_commands && data.last_commands.length > 0) {
                lastCommand.textContent = data.last_commands[data.last_commands.length - 1]; // Get the last (most recent) command
            } else {
                lastCommand.textContent = 'N/A';
            }

            // Set the "Development Status" - currently static as it's not in the API response
            developmentStatus.textContent = 'Work in progress';
            developmentStatus.className = 'stat-value status-wip';

            // Update the last updated time to current browser time
            lastUpdatedTime.textContent = new Date().toLocaleTimeString();

        } catch (error) {
            console.error("Error fetching bot statistics:", error);
            // Set fallback values and error status on failure
            botStatus.textContent = 'Offline';
            botStatus.className = 'stat-value status-offline';
            serverCount.textContent = 'N/A';
            userCount.textContent = 'N/A';
            botPing.textContent = 'N/A';
            botUptime.textContent = 'N/A';
            lastUpdatedTime.textContent = 'Failed to load';
            lastCommand.textContent = 'N/A';
            totalCommands.textContent = 'N/A';
            developmentStatus.textContent = 'Error loading';
            developmentStatus.className = 'stat-value status-offline';
        }
    }

    // Fetch stats immediately on load and then every 10 seconds
    fetchBotStats();
    setInterval(fetchBotStats, 10000); // Fetches data every 10 seconds

    // --- Command Filter Functionality ---
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

    // --- Intersection Observer for Animations ---
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
