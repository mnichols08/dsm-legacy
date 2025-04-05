/**
 * DSM Back to Top Component
 * A button that appears when scrolling down and returns the user to the top of the page
 */

class DsmBackToTop extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        
        :host {
          display: block;
          position: fixed;
          bottom: 30px;
          right: 30px;
          z-index: 99;
        }
        
        .back-to-top {
          background-color: var(--primary, #c02a2a);
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          cursor: pointer;
        }
        
        .back-to-top.visible {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        
        .back-to-top:hover,
        .back-to-top:focus {
          background-color: var(--primary-dark, #941e1e);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          transform: translateY(-5px);
        }
        
        .back-to-top i {
          font-size: 1.5rem;
        }
        
        /* Handle safe areas on mobile devices */
        @supports (padding: max(0px)) {
          :host {
            bottom: max(30px, env(safe-area-inset-bottom, 30px));
            right: max(30px, env(safe-area-inset-right, 30px));
          }
        }
        
        /* Motion reduction */
        @media (prefers-reduced-motion: reduce) {
          .back-to-top {
            transition: opacity 0.1s linear;
          }
          
          .back-to-top:hover,
          .back-to-top:focus {
            transform: none;
          }
        }
        
        /* High contrast mode */
        @media (prefers-contrast: high) {
          .back-to-top {
            background-color: black;
            outline: 2px solid white;
            box-shadow: none;
          }
        }
      </style>
      
      <button class="back-to-top" aria-label="Back to top">
        <i class="fas fa-arrow-up" aria-hidden="true"></i>
      </button>
    `;
  }
  
  connectedCallback() {
    this.button = this.shadowRoot.querySelector('.back-to-top');
    
    // Show/hide the button based on scroll position
    window.addEventListener('scroll', this.handleScroll.bind(this));
    
    // Attach click event
    this.button.addEventListener('click', this.scrollToTop.bind(this));
    
    // Initial check in case the page is already scrolled
    this.handleScroll();
  }
  
  disconnectedCallback() {
    window.removeEventListener('scroll', this.handleScroll.bind(this));
    this.button.removeEventListener('click', this.scrollToTop.bind(this));
  }
  
  handleScroll() {
    // Show the button when user scrolls down 300px from the top
    if (window.scrollY > 300) {
      this.button.classList.add('visible');
    } else {
      this.button.classList.remove('visible');
    }
  }
  
  scrollToTop(e) {
    e.preventDefault();
    
    // Check if smooth scrolling is supported and not reduced
    if ('scrollBehavior' in document.documentElement.style && 
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      // Fallback for browsers that don't support smooth scrolling
      window.scrollTo(0, 0);
    }
  }
}

// Register the component if it's not already registered
if (!customElements.get('dsm-back-to-top')) {
  customElements.define('dsm-back-to-top', DsmBackToTop);
}
