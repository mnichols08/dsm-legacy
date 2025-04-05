/**
 * DSM Component Loader
 * Handles registration and loading of web components throughout the site
 */

class ComponentLoader {
  constructor() {
    // Map of component names to their respective file paths
    this.components = {
      'dsm-footer': 'js/components/dsm-footer.js',
      'dsm-hero': 'js/components/dsm-hero.js',
      'dsm-navbar': 'js/components/dsm-navbar.js',
      'dsm-back-to-top': 'js/components/dsm-back-to-top.js',
      'dsm-timeline': 'js/components/dsm-timeline.js',
      'dsm-timeline-item': 'js/components/dsm-timeline.js', // Note: Both components are in the same file
      'dsm-vehicle-card': 'js/components/dsm-vehicle-card.js',
      // Add other components here as you create them
      // 'dsm-gallery': 'js/components/dsm-gallery.js',
      // 'dsm-gallery-item': 'js/components/dsm-gallery-item.js',
    };
    
    // ...existing code...
  }
  
  // ...existing code...
}

// Create and initialize the component loader
const componentLoader = new ComponentLoader();
componentLoader.loadComponents();

// Export for use in other modules
export default componentLoader;
