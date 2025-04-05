/**
 * Main JavaScript file for Diamond Star Motors Legacy site
 * Handles custom functionality and user interactions
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - initializing features');
    // Initialize the tabs with a longer delay to ensure everything is loaded
    setTimeout(() => {
        initLegacyTabs();
    }, 300);
});

/**
 * Initializes the tabbed content functionality for the legacy section
 */
function initLegacyTabs() {
    console.log('Initializing legacy tabs');
    const tabs = document.querySelectorAll('.legacy-tab');
    const tabContents = document.querySelectorAll('.legacy-tab-content');
    
    if (tabs.length === 0) {
        console.warn('No legacy tabs found');
        return;
    }
    
    console.log(`Found ${tabs.length} tabs and ${tabContents.length} content sections`);
    
    // First force hide all tab contents
    tabContents.forEach(content => {
        content.style.display = 'none';
        content.classList.remove('active');
    });
    
    // Set the first tab as active and display its content
    if (tabs[0]) {
        tabs[0].classList.add('active');
        const firstTabId = tabs[0].getAttribute('data-tab');
        if (firstTabId) {
            const firstContent = document.getElementById(firstTabId + '-content');
            if (firstContent) {
                firstContent.style.display = 'block';
                firstContent.classList.add('active');
                console.log(`Activated tab content: ${firstTabId}-content`);
            } else {
                console.warn(`Could not find content for tab: ${firstTabId}-content`);
            }
        }
    }
    
    // Add click event to all tabs with direct function assignment for better reliability
    tabs.forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const tabId = this.getAttribute('data-tab');
            console.log(`Tab clicked: ${tabId}`);
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Force hide all tab content first
            tabContents.forEach(content => {
                content.style.display = 'none';
                content.classList.remove('active');
            });
            
            // Show selected tab content
            const selectedContent = document.getElementById(tabId + '-content');
            if (selectedContent) {
                selectedContent.style.display = 'block';
                selectedContent.classList.add('active');
                console.log(`Activated tab content: ${tabId}-content`);
            } else {
                console.warn(`Could not find content for tab: ${tabId}-content`);
            }
        });
    });
}

/**
 * Animates elements when they scroll into view
 */
function animateOnScroll() {
    // Use Intersection Observer to detect when elements come into view
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        // Target elements to animate
        const animatedElements = document.querySelectorAll('.engine-timeline-item, .legacy-card, .impact-card');
        
        animatedElements.forEach(element => {
            observer.observe(element);
            element.classList.add('will-animate');
        });
    }
}

// Run the tabs initialization again when window is fully loaded
window.addEventListener('load', function() {
    console.log('Window fully loaded - reinitializing tabs');
    
    // Reinitialize tabs to ensure they work
    initLegacyTabs();
    
    // Set up animations
    animateOnScroll();
    
    // Set up testimonials navigation
    setupTestimonialsNavigation();
});

/**
 * Sets up keyboard navigation for the testimonials section
 */
function setupTestimonialsNavigation() {
    const testimonialContainer = document.querySelector('.testimonials');
    if (testimonialContainer) {
        testimonialContainer.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                testimonialContainer.scrollBy({ left: 350, behavior: 'smooth' });
            } else if (e.key === 'ArrowLeft') {
                testimonialContainer.scrollBy({ left: -350, behavior: 'smooth' });
            }
        });
    }
}
