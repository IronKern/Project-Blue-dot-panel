document.addEventListener('DOMContentLoaded', () => {
    // === Hamburger Menu Functionality ===
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('active');
    });

    // === Live Information Panel (Placeholder) ===
    const botStatus = document.getElementById('bot-status');
    const serverCount = document.getElementById('server-count');
    const userCount = document.getElementById('user-count');
    const botPing = document.getElementById('bot-ping');
    const botUptime = document.getElementById('bot-uptime');
    const lastUpdatedTime = document.getElementById('last-updated-time');

    function updateLiveStats() {
        // Here you would typically make an API call to your bot.
        // Example (pseudocode):
        /*
        fetch('/api/bot-stats') // Replace this with your actual bot API endpoint
            .then(response => response.json())
            .then(data => {
                botStatus.textContent = data.status;
                botStatus.className = data.status.toLowerCase() === 'online' ? 'status-online' : 'status-offline';
                serverCount.textContent = data.servers.toLocaleString();
                userCount.textContent = data.users.toLocaleString();
                botPing.textContent = `${data.ping}ms`;
                botUptime.textContent = data.uptime; // e.g., "2 days, 5 hours"
                lastUpdatedTime.textContent = new Date().toLocaleTimeString();
            })
            .catch(error => {
                console.error('Error fetching bot statistics:', error);
                botStatus.textContent = 'Error';
                botStatus.className = 'status-offline';
                serverCount.textContent = 'N/A';
                userCount.textContent = 'N/A';
                botPing.textContent = 'N/A';
                botUptime.textContent = 'N/A';
                lastUpdatedTime.textContent = new Date().toLocaleTimeString();
            });
        */

        // Static placeholder data for demonstration purposes:
        const now = new Date();
        botStatus.textContent = 'Online';
        botStatus.className = 'status-online';
        serverCount.textContent = (Math.floor(Math.random() * 500) + 100).toLocaleString(); // Random server count
        userCount.textContent = (Math.floor(Math.random() * 50000) + 10000).toLocaleString(); // Random user count
        botPing.textContent = `${Math.floor(Math.random() * 100) + 20}ms`; // Random ping
        botUptime.textContent = '3 days, 12 hours'; // Static uptime
        lastUpdatedTime.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // Update stats on load and then every 10 seconds
    updateLiveStats();
    setInterval(updateLiveStats, 10000); // Update every 10 seconds

    // === Command Search and Filter Functionality ===
    const commandSearchInput = document.getElementById('command-search');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const commandCards = document.querySelectorAll('.command-card');

    function filterCommands() {
        const searchTerm = commandSearchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;

        commandCards.forEach(card => {
            const commandName = card.querySelector('h4').textContent.toLowerCase();
            const commandDescription = card.querySelector('p').textContent.toLowerCase();
            const cardCategories = card.dataset.category.split(' '); // Get all categories of the command

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
            // Remove active from current button
            document.querySelector('.category-btn.active').classList.remove('active');
            // Add active to new button
            button.classList.add('active');
            filterCommands(); // Re-filter commands
        });
    });

    // Initial filter on page load
    filterCommands();
});
