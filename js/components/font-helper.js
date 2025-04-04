/**
 * Font Helper
 * Ensures that Font Awesome and other fonts load properly in shadow DOM
 */

(function() {
  // Create a global function that can be called from any component
  window.ensureCustomFonts = function(shadowRoot) {
    // Check if shadowRoot already has Font Awesome
    const existingStylesheet = shadowRoot.querySelector('style[data-font-awesome="loaded"]');
    if (existingStylesheet) {
      return; // Already loaded
    }
    
    // Create and append Font Awesome import
    const faStyle = document.createElement('style');
    faStyle.setAttribute('data-font-awesome', 'loaded');
    faStyle.textContent = `
      @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
      
      /* Ensure font-family is properly set for Font Awesome */
      .fas, .far, .fab, .fa {
        font-family: 'Font Awesome 6 Free', 'Font Awesome 6 Brands' !important;
      }
      
      .fas, .fa-solid {
        font-weight: 900 !important;
      }
      
      .far, .fa-regular {
        font-weight: 400 !important;
      }
      
      /* Ensure we have the brand fonts too */
      .fab, .fa-brands {
        font-family: 'Font Awesome 6 Brands' !important;
        font-weight: 400 !important;
      }
    `;
    
    shadowRoot.appendChild(faStyle);
    
    // Also ensure we have the main fonts
    const mainFonts = document.createElement('style');
    mainFonts.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Roboto:wght@300;400;500;700&display=swap');
    `;
    shadowRoot.appendChild(mainFonts);
  };
  
  // Helper to ensure components are properly defined
  window.ensureComponentDefined = function(className, elementName) {
    // Check if the component is already defined
    if (!customElements.get(elementName)) {
      console.log(`Ensuring ${elementName} is defined...`);
      try {
        customElements.define(elementName, className);
      } catch (e) {
        console.error(`Error defining ${elementName}:`, e);
      }
    }
  };
})();
