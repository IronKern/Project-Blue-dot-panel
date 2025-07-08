document.addEventListener('DOMContentLoaded', () => {
    // === Hamburger Menu Functionality ===
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('active');
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            // Close the mobile menu if it's open
            if (navLinks.classList.contains('nav-active')) {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('active');
            }
        });
    });

    // === Live Information Panel (Placeholder Data) ===
    const botStatus = document.getElementById('bot-status');
    const serverCount = document.getElementById('server-count');
    const userCount = document.getElementById('user-count');
    const botPing = document.getElementById('bot-ping');
    const botUptime = document.getElementById('bot-uptime');
    const lastUpdatedTime = document.getElementById('last-updated-time');

    function updateLiveStats() {
        // These are static placeholder values for demonstration.
        // In a real application, you would fetch this data from an API.
        const now = new Date();
        botStatus.textContent = 'Online';
        botStatus.className = 'stat-value status-online'; // Ensures correct styling
        serverCount.textContent = (Math.floor(Math.random() * 500) + 100).toLocaleString(); // Random server count between 100-599
        userCount.textContent = (Math.floor(Math.random() * 50000) + 10000).toLocaleString(); // Random user count between 10k-59999
        botPing.textContent = `${Math.floor(Math.random() * 80) + 20}ms`; // Random ping between 20-99ms
        botUptime.textContent = '3 days, 12 hours'; // Example uptime
        lastUpdatedTime.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // Update stats immediately on load and then every 10 seconds
    updateLiveStats();
    setInterval(updateLiveStats, 10000);

    // === Command Search and Filter Functionality ===
    const commandSearchInput = document.getElementById('command-search');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const commandItems = document.querySelectorAll('.command-item');

    function filterCommands() {
        const searchTerm = commandSearchInput.value.toLowerCase();
        // Get the active category from the button with the 'active' class
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;

        commandItems.forEach(item => {
            const commandName = item.querySelector('h4').textContent.toLowerCase();
            const commandDescription = item.querySelector('p').textContent.toLowerCase();
            const itemCategories = item.dataset.category.split(' '); // Get all categories for the item

            // Check if command name or description includes the search term
            const matchesSearch = commandName.includes(searchTerm) || commandDescription.includes(searchTerm);
            // Check if the item's categories include the active category (or if 'all' is active)
            const matchesCategory = activeCategory === 'all' || itemCategories.includes(activeCategory);

            if (matchesSearch && matchesCategory) {
                item.style.display = 'block'; // Show the item
            } else {
                item.style.display = 'none'; // Hide the item
            }
        });
    }

    // Event listeners for search input and category buttons
    commandSearchInput.addEventListener('keyup', filterCommands);

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' from currently active button
            document.querySelector('.category-btn.active').classList.remove('active');
            // Add 'active' to the clicked button
            button.classList.add('active');
            filterCommands(); // Re-filter commands
        });
    });

    // Initial filter on page load to ensure correct display
    filterCommands();


    // === Scroll Animations with IntersectionObserver ===
    const animTargets = document.querySelectorAll('.anim-target'); // Sections to observe

    const observerOptions = {
        root: null, // The viewport is the root
        rootMargin: '0px',
        threshold: 0.1 // When 10% of the target is visible, trigger
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // When target enters viewport, add 'in-view' class
                entry.target.classList.add('in-view');

                // Apply staggered animation to children with '.anim-item'
                const animItems = entry.target.querySelectorAll('.anim-item');
                animItems.forEach((item, index) => {
                    // Use the CSS variable for consistent delay steps
                    item.style.transitionDelay = `calc(${index} * var(--animation-delay-step))`;
                });

                // Optional: Stop observing the target after it has animated once
                // observer.unobserve(entry.target);
            } else {
                // Optional: If elements should re-animate when scrolling back up/down,
                // remove 'in-view' class and reset transition delays.
                // entry.target.classList.remove('in-view');
                entry.target.querySelectorAll('.anim-item').forEach(item => {
                    item.style.transitionDelay = '0s'; // Reset delay for elements out of view
                });
            }
        });
    }, observerOptions);

    // Start observing all defined animation targets
    animTargets.forEach(target => {
        observer.observe(target);
    });

    // Handle elements that might already be in view on page load (e.g., the hero section)
    // This immediately applies animations without requiring a scroll event.
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
