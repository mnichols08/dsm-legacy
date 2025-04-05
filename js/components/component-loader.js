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
    { name: 'dsm-vehicle-card', path: 'js/components/dsm-vehicle-card.js' },
    // Load gallery last as it depends on other components
    { name: 'dsm-gallery', path: 'js/components/dsm-gallery.js', priority: 'low' }
  ];
  
  // Sort components by priority
  componentsToLoad.sort((a, b) => {
    if (a.priority === 'low' && b.priority !== 'low') return 1;
    if (a.priority !== 'low' && b.priority === 'low') return -1;
    return 0;
  });
  
  // Load components sequentially to avoid race conditions
  const loadSequentially = async () => {
    console.log('Starting to load components sequentially');
    for (const component of componentsToLoad) {
      if (!customElements.get(component.name)) {
        console.log(`Loading component: ${component.name} from ${component.path}`);
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = component.path;
          script.onload = () => {
            console.log(`Successfully loaded: ${component.name}`);
            // Add a small delay for low priority components to ensure they register properly
            if (component.priority === 'low') {
              setTimeout(resolve, 200);
            } else {
              resolve();
            }
          };
          script.onerror = (error) => {
            console.error(`Failed to load component: ${component.name}`, error);
            resolve(); // Continue with other components even if one fails
          };
          document.head.appendChild(script);
        });
      } else {
        console.log(`Component ${component.name} already registered`);
      }
    }
    console.log('All components loaded sequentially');
    
    // Dispatch a custom event when all components are loaded
    document.dispatchEvent(new CustomEvent('dsm-components-loaded'));
  };
  
  loadSequentially();
});
