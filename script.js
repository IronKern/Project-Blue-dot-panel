document.addEventListener('DOMContentLoaded', () => {
    // === Hamburger Menu Functionality ===
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('nav ul li'); // Get all individual nav items

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('nav-active');
        hamburger.classList.toggle('active');
        // Apply staggered animation to nav items on mobile
        navItems.forEach((item, index) => {
            item.style.setProperty('--i', index); // Set custom property for delay
        });
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('nav-active')) {
                navLinks.classList.remove('nav-active');
                hamburger.classList.remove('active');
            }
        });
    });

    // === Live Information Panel (Placeholder) ===
    const botStatus = document.getElementById('bot-status');
    const serverCount = document.getElementById('server-count');
    const userCount = document.getElementById('user-count');
    const botPing = document.getElementById('bot-ping');
    const botUptime = document.getElementById('bot-uptime');
    const lastUpdatedTime = document.getElementById('last-updated-time');

    function updateLiveStats() {
        // Static placeholder data for demonstration purposes:
        const now = new Date();
        botStatus.textContent = 'Online';
        botStatus.className = 'stat-value status-online'; // Ensure classes are maintained
        serverCount.textContent = (Math.floor(Math.random() * 500) + 100).toLocaleString();
        userCount.textContent = (Math.floor(Math.random() * 50000) + 10000).toLocaleString();
        botPing.textContent = `${Math.floor(Math.random() * 100) + 20}ms`;
        botUptime.textContent = '3 days, 12 hours';
        lastUpdatedTime.textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }

    // Update stats on load and then every 10 seconds
    updateLiveStats();
    setInterval(updateLiveStats, 10000);

    // === Command Search and Filter Functionality ===
    const commandSearchInput = document.getElementById('command-search');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const commandItems = document.querySelectorAll('.command-item'); // Changed from command-card to command-item

    function filterCommands() {
        const searchTerm = commandSearchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;

        commandItems.forEach(item => {
            const commandName = item.querySelector('h4').textContent.toLowerCase();
            const commandDescription = item.querySelector('p').textContent.toLowerCase();
            const itemCategories = item.dataset.category.split(' '); // Get all categories of the command

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

    // Initial filter on page load
    filterCommands();


    // === Scroll Animations with IntersectionObserver ===
    const animTargets = document.querySelectorAll('.anim-target');

    const observerOptions = {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add 'in-view' class to trigger animations
                entry.target.classList.add('in-view');

                // Stagger animations for children if needed (e.g., command list items)
                if (entry.target.classList.contains('command-list')) {
                    entry.target.querySelectorAll('.command-item').forEach((item, index) => {
                        item.style.transitionDelay = `${index * 0.05}s`; // Staggered delay
                    });
                } else if (entry.target.classList.contains('dashboard-stats')) {
                     entry.target.querySelectorAll('.stat-item').forEach((item, index) => {
                        item.style.transitionDelay = `${index * 0.05}s`;
                    });
                } else if (entry.target.id === 'home' || entry.target.id === 'about' || entry.target.id === 'dashboard' || entry.target.id === 'commands') {
                    // For general sections, apply delay to anim-items within them
                    entry.target.querySelectorAll('.anim-item').forEach((item, index) => {
                         item.style.transitionDelay = `${index * 0.05}s`;
                    });
                }
                
                // Unobserve once animated if it's a one-time animation
                // observer.unobserve(entry.target); 
            } else {
                // Optional: Remove 'in-view' class if you want animations to reset when element leaves viewport
                // entry.target.classList.remove('in-view');
                 if (entry.target.classList.contains('command-list')) {
                    entry.target.querySelectorAll('.command-item').forEach((item, index) => {
                        item.style.transitionDelay = `0s`; // Reset delay
                    });
                } else if (entry.target.classList.contains('dashboard-stats')) {
                     entry.target.querySelectorAll('.stat-item').forEach((item, index) => {
                        item.style.transitionDelay = `0s`;
                    });
                } else if (entry.target.id === 'home' || entry.target.id === 'about' || entry.target.id === 'dashboard' || entry.target.id === 'commands') {
                    entry.target.querySelectorAll('.anim-item').forEach((item, index) => {
                         item.style.transitionDelay = `0s`;
                    });
                }
            }
        });
    }, observerOptions);

    animTargets.forEach(target => {
        observer.observe(target);
    });

    // Initialize header nav item delays
    document.querySelectorAll('nav ul li').forEach((item, index) => {
        item.style.setProperty('--i', index);
    });
    document.querySelector('.btn-invite').style.setProperty('--i', navItems.length); // For the invite button

});
