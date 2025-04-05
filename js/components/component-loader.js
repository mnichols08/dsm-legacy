/**
 * DSM Component Loader (Components Directory Version)
 * This is a direct import version of the main component loader
 */

// Create a global method to check if components are ready
window.componentsReady = function() {
  return new Promise((resolve) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      // Give a short delay to ensure components have registered
      setTimeout(resolve, 500);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(resolve, 500);
      });
    }
  });
};

// Add components to load
document.addEventListener('DOMContentLoaded', () => {
  // Load core components
  const componentsToLoad = [
    { name: 'dsm-navbar', path: 'js/components/dsm-navbar.js' },
    { name: 'dsm-hero', path: 'js/components/dsm-hero.js' },
    { name: 'dsm-footer', path: 'js/components/dsm-footer.js' },
    { name: 'dsm-back-to-top', path: 'js/components/dsm-back-to-top.js' },
    { name: 'dsm-timeline', path: 'js/components/dsm-timeline.js' },
    { name: 'dsm-vehicle-card', path: 'js/components/dsm-vehicle-card.js' }
  ];
  
  // Load components sequentially to avoid race conditions
  const loadSequentially = async () => {
    for (const component of componentsToLoad) {
      if (!customElements.get(component.name)) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = component.path;
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }
    }
  };
  
  loadSequentially();
});
