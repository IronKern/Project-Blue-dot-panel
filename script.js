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
    // e.g., 'https://your-render-app-name.onrender.com'
    // Since your API is at '/api/stats', the base URL should just be your app's root.
    const BASE_URL = 'https://threadbaresurefootedtelevision-1.onrender.com';

    const botStatus = document.getElementById('bot-status');
    const serverCount = document.getElementById('server-count');
    const userCount = document.getElementById('user-count');
    const botPing = document.getElementById('bot-ping');
    const botUptime = document.getElementById('bot-uptime');
    const lastCommand = document.getElementById('last-command');
    const totalCommands = document.getElementById('total-commands');
    const developmentStatus = document.getElementById('development-status'); // New element for development status
    const lastUpdatedTime = document.getElementById('last-updated-time'); // This will show the time of the last successful fetch

    async function fetchBotStats() {
        try {
            const response = await fetch(`${BASE_URL}/api/stats`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            // Update elements with data from the single /api/stats endpoint
            botStatus.textContent = data.status;
            botStatus.className = `stat-value status-${data.status.toLowerCase()}`; // Set class for color (online/offline)

            serverCount.textContent = data.server_count.toLocaleString(); // Format with thousands separator
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
            // If you add a 'development_status' field to your /api/stats endpoint, you can
            // change this to: developmentStatus.textContent = data.development_status;
            developmentStatus.textContent = 'In Arbeit'; // Currently static
            developmentStatus.className = 'stat-value status-wip'; // Set appropriate class for styling

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
            developmentStatus.textContent = 'Fehler beim Laden'; // Set appropriate error message
            developmentStatus.className = 'stat-value status-offline'; // Or another error class
        }
    }

    // Fetch stats immediately on load and then every 10 seconds
    fetchBotStats();
    setInterval(fetchBotStats, 10000); // Fetches data every 10 seconds

    // --- Command Search and Filter Functionality ---
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

    // Call initial filter to display all commands
    filterCommands();

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
