/**
 * Main JavaScript file for Diamond Star Motors Legacy site
 * Handles custom functionality and user interactions
 */

// Wait for DOM to be fully loaded - single event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - initializing features');
    
    // Initialize tabs with a slight delay to ensure DOM is ready
    setTimeout(() => {
        initLegacyTabs();
        initEngineHeritageTabs();
    }, 300);
});

// Run initialization when window is fully loaded - single event listener
window.addEventListener('load', function() {
    console.log('Window fully loaded - reinitializing tabs');
    
    // Reinitialize tabs to ensure they work
    initLegacyTabs();
    initEngineHeritageTabs();
    
    // Set up animations
    animateOnScroll();
    
    // Set up testimonials navigation
    setupTestimonialsNavigation();
});

/**
 * Initializes the tabbed content functionality for the legacy section
 */
function initLegacyTabs() {
    console.log('Initializing legacy tabs');
    const tabs = document.querySelectorAll('.legacy-tabs-container > .legacy-tabs > .legacy-tab');
    const tabContents = document.querySelectorAll('.legacy-tab-content');

    if (tabs.length === 0) {
        console.warn('No legacy tabs found');
        return;
    }

    const container = tabs[0].parentElement;
    if (container && container.dataset.initialized === 'true') {
        return;
    }

    setupTabGroup(Array.from(tabs), Array.from(tabContents), {
        tabIdPrefix: 'legacy-tab',
        orientation: 'horizontal'
    });

    if (container) {
        container.dataset.initialized = 'true';
    }
}

/**
 * Initializes the tabbed content functionality for the engine heritage section
 */
function initEngineHeritageTabs() {
    console.log('Initializing engine heritage tabs');
    const heritageContainer = document.querySelector('.engine-heritage .legacy-tabs');
    if (!heritageContainer) {
        console.warn('No engine heritage tab container found');
        return;
    }

    if (heritageContainer.dataset.initialized === 'true') {
        return;
    }

    const heritageTabs = heritageContainer.querySelectorAll('.legacy-tab');
    const heritageContents = document.querySelectorAll('.engine-heritage .legacy-subtab-content');

    if (heritageTabs.length === 0 || heritageContents.length === 0) {
        console.warn('Engine heritage tabs not ready');
        return;
    }

    setupTabGroup(Array.from(heritageTabs), Array.from(heritageContents), {
        tabIdPrefix: 'engine-tab',
        orientation: heritageContainer.dataset.orientation || 'horizontal'
    });

    heritageContainer.dataset.initialized = 'true';
}

document.addEventListener('dsm-engine-tabs-updated', () => {
    setTimeout(initEngineHeritageTabs, 50);
});

function setupTabGroup(tabs, panels, { tabIdPrefix = 'tab', orientation = 'horizontal' } = {}) {
    if (!tabs.length) return;

    const axes = orientation === 'vertical'
        ? { backward: 'ArrowUp', forward: 'ArrowDown' }
        : { backward: 'ArrowLeft', forward: 'ArrowRight' };

    const activateTab = (targetTab, { setFocus = true } = {}) => {
        tabs.forEach(tab => {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('tabindex', '-1');
        });

        panels.forEach(panel => {
            panel.classList.remove('active');
            panel.style.display = 'none';
            panel.setAttribute('hidden', '');
        });

        targetTab.classList.add('active');
        targetTab.setAttribute('aria-selected', 'true');
        targetTab.setAttribute('tabindex', '0');

        const panelId = targetTab.getAttribute('aria-controls');
        const associatedPanel = panels.find(panel => panel.id === panelId);

        if (associatedPanel) {
            associatedPanel.classList.add('active');
            associatedPanel.style.display = 'block';
            associatedPanel.removeAttribute('hidden');
        }

        if (setFocus) {
            targetTab.focus();
        }
    };

    tabs.forEach((tab, index) => {
        const tabDataId = tab.dataset.tab || `${tabIdPrefix}-${index}`;
        const generatedId = tab.id || `${tabIdPrefix}-${tabDataId}`;
        tab.id = generatedId;
        tab.setAttribute('role', 'tab');

        const panelId = tab.getAttribute('aria-controls') || `${tabDataId}-content`;
        tab.setAttribute('aria-controls', panelId);

        const associatedPanel = panels.find(panel => panel.id === panelId);
        if (associatedPanel) {
            associatedPanel.setAttribute('role', 'tabpanel');
            associatedPanel.setAttribute('aria-labelledby', generatedId);
            associatedPanel.setAttribute('tabindex', '0');
        }

        if (index === 0) {
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            tab.setAttribute('tabindex', '0');
            if (associatedPanel) {
                associatedPanel.classList.add('active');
                associatedPanel.style.display = 'block';
                associatedPanel.removeAttribute('hidden');
            }
        } else {
            tab.classList.remove('active');
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('tabindex', '-1');
            if (associatedPanel) {
                associatedPanel.classList.remove('active');
                associatedPanel.style.display = 'none';
                associatedPanel.setAttribute('hidden', '');
            }
        }

        tab.addEventListener('click', (event) => {
            event.preventDefault();
            activateTab(tab, { setFocus: true });
        });

        tab.addEventListener('keydown', (event) => {
            switch (event.key) {
                case axes.forward:
                case axes.backward: {
                    event.preventDefault();
                    const direction = event.key === axes.forward ? 1 : -1;
                    const currentIndex = tabs.indexOf(tab);
                    const nextIndex = (currentIndex + direction + tabs.length) % tabs.length;
                    activateTab(tabs[nextIndex]);
                    break;
                }
                case 'Home':
                    event.preventDefault();
                    activateTab(tabs[0]);
                    break;
                case 'End':
                    event.preventDefault();
                    activateTab(tabs[tabs.length - 1]);
                    break;
                default:
                    break;
            }
        });
    });

    const initiallyActive = tabs.find(tab => tab.classList.contains('active')) || tabs[0];
    if (initiallyActive) {
        activateTab(initiallyActive, { setFocus: false });
    }
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