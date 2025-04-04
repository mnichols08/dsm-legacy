/**
 * Component Loader
 * Ensures all web components are properly loaded and initialized
 */

// Track loading status
const componentStatus = {
  total: 0,
  loaded: 0,
  components: {}
};

// First, load the font helper
const fontHelperScript = document.createElement('script');
fontHelperScript.src = 'js/components/font-helper.js';
fontHelperScript.async = false;
document.head.appendChild(fontHelperScript);

// List of all components to load
const components = [
  { name: 'dsm-navbar', path: 'js/components/dsm-navbar.js' },
  { name: 'dsm-hero', path: 'js/components/dsm-hero.js' },
  { name: 'dsm-timeline-item', path: 'js/components/dsm-timeline.js' },
  { name: 'dsm-timeline', path: 'js/components/dsm-timeline.js', dependsOn: ['dsm-timeline-item'] },
  { name: 'dsm-vehicle-card', path: 'js/components/dsm-vehicle-card.js' },
  { name: 'dsm-gallery-item', path: 'js/components/dsm-gallery.js' },
  { name: 'dsm-gallery', path: 'js/components/dsm-gallery.js', dependsOn: ['dsm-gallery-item'] },
  { name: 'dsm-footer', path: 'js/components/dsm-footer.js' },
  { name: 'dsm-back-to-top', path: 'js/components/dsm-back-to-top.js' }
];

// Initialize component status tracking
componentStatus.total = components.length;
components.forEach(comp => {
  componentStatus.components[comp.name] = false;
});

// Load all components
function loadComponents() {
  console.log('Starting component loading...');
  
  const loadedScripts = new Set();
  
  // Load each script sequentially for better reliability
  function loadScript(index) {
    if (index >= components.length) {
      console.log('All scripts loaded, checking components...');
      return checkComponentsLoaded();
    }
    
    const comp = components[index];
    
    // Skip scripts we've already loaded
    if (loadedScripts.has(comp.path)) {
      return loadScript(index + 1);
    }
    
    // Mark this script as loading
    loadedScripts.add(comp.path);
    
    // Create script element
    const script = document.createElement('script');
    script.src = comp.path;
    script.async = false; // Maintain order
    
    // Handle script loading
    script.onload = () => {
      console.log(`Loaded script: ${comp.path}`);
      loadScript(index + 1);
    };
    
    script.onerror = () => {
      console.error(`Failed to load script: ${comp.path}`);
      loadScript(index + 1);
    };
    
    // Add to document
    document.head.appendChild(script);
  }
  
  // Start the sequential loading
  loadScript(0);
}

// Check if components are defined
function checkComponentsLoaded() {
  // Allow time for the component to register
  setTimeout(() => {
    components.forEach(comp => {
      const isDefined = customElements.get(comp.name) !== undefined;
      
      if (isDefined && !componentStatus.components[comp.name]) {
        componentStatus.components[comp.name] = true;
        componentStatus.loaded++;
        console.log(`Component loaded: ${comp.name} (${componentStatus.loaded}/${componentStatus.total})`);
      }
    });
    
    if (componentStatus.loaded === componentStatus.total) {
      console.log('All components loaded successfully!');
      document.dispatchEvent(new CustomEvent('components-loaded'));
    } else {
      // Try again after a delay
      console.log(`Still waiting for ${componentStatus.total - componentStatus.loaded} components...`);
      setTimeout(checkComponentsLoaded, 500);
    }
  }, 100);
}

// Start loading components when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadComponents);
} else {
  // DOM already loaded, start immediately
  loadComponents();
}

// Export a function that returns a promise when all components are loaded
window.componentsReady = function() {
  return new Promise((resolve) => {
    if (componentStatus.loaded === componentStatus.total) {
      resolve();
    } else {
      document.addEventListener('components-loaded', () => resolve(), {once: true});
    }
  });
};
