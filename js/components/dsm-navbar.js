/**
 * DSM Navbar Component
 * A responsive navigation bar with support for logo and links
 */

class DsmNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Roboto:wght@300;400;500;700&display=swap');
        
        :host {
          display: block;
          width: 100%;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          color-scheme: light dark;
        }
        
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 5%;
          height: 80px;
          background-color: var(--nav-background, rgba(18, 18, 18, 0.95));
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          color: var(--nav-text, #ffffff);
        }
        
        .navbar.scrolled {
          height: 70px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
          background-color: var(--nav-background, rgba(18, 18, 18, 0.98));
        }
        
        .logo-container {
          display: flex;
          align-items: center;
        }
        
        .nav-links-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: inherit;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 10px;
          z-index: 1001;
          transition: transform 0.2s ease;
        }
        
        .mobile-menu-btn:focus-visible {
          outline: 2px solid var(--primary, #c02a2a);
          outline-offset: 4px;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .desktop-only {
          display: flex;
        }

        .nav-actions ::slotted(button),
        .nav-actions ::slotted(a) {
          font: inherit;
        }

        @media (max-width: 992px) {
          .mobile-menu-btn {
            display: block;
          }
          
          .nav-links-container {
            position: fixed;
            top: 0;
            right: -100%;
            width: 80%;
            max-width: 400px;
            height: 100vh;
            background-color: var(--nav-drawer-background, rgba(18, 18, 18, 0.98));
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition: right 0.3s ease;
            box-shadow: -5px 0 20px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            gap: 1.5rem;
          }
          
          .desktop-only {
            display: none;
          }

          .nav-links-container.active {
            right: 0;
          }
          
          .nav-links-container ::slotted(nav) {
            display: flex !important;
            flex-direction: column !important;
            width: 100%;
            text-align: center;
          }
          
          .nav-links-container ::slotted(nav a) {
            margin: 10px 0 !important;
            padding: 15px 0 !important;
            font-size: 1.2rem !important;
          }

          .nav-links-container ::slotted([slot="actions"]) {
            width: 100%;
            display: flex !important;
            justify-content: center;
          }
          
          /* Overlay when menu is active */
          .menu-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
          }
          
          .menu-overlay.active {
            opacity: 1;
            visibility: visible;
          }
        }
        
        /* Ensure consistent link styling in slotted navigation */
        ::slotted(nav a), ::slotted(nav a:visited) {
          color: var(--nav-link, #ffffff) !important;
          text-decoration: none;
        }
        
        ::slotted(nav a:hover), ::slotted(nav a:focus) {
          color: var(--nav-link-hover, #ffffff) !important;
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
          .navbar {
            background-color: #000;
            box-shadow: 0 2px 0 #fff;
          }
          
          .mobile-menu-btn {
            border: 1px solid white;
          }
        }
        
        /* Motion reduction */
        @media (prefers-reduced-motion: reduce) {
          * {
            transition-duration: 0.01ms !important;
          }
        }
      </style>
      
      <nav class="navbar" role="navigation" aria-label="Primary navigation">
        <div class="logo-container">
          <slot name="logo"></slot>
        </div>
        <div class="nav-actions desktop-only">
          <slot name="actions"></slot>
        </div>
        <button aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="nav-links" class="mobile-menu-btn">
          <i class="fas fa-bars" aria-hidden="true"></i>
        </button>
        <div class="nav-links-container" id="nav-links" aria-hidden="true">
          <slot name="links"></slot>
          <slot name="actions"></slot>
        </div>
      </nav>
      <div class="menu-overlay" aria-hidden="true"></div>
    `;
  }
  
  connectedCallback() {
    this.setupMobileMenu();
    this.setupScrollEffect();
  }
  
  setupMobileMenu() {
    const menuBtn = this.shadowRoot.querySelector('.mobile-menu-btn');
    const navContainer = this.shadowRoot.querySelector('.nav-links-container');
    const overlay = this.shadowRoot.querySelector('.menu-overlay');
    
    if (!menuBtn.hasAttribute('aria-expanded')) {
      menuBtn.setAttribute('aria-expanded', 'false');
    }

    menuBtn.addEventListener('click', () => {
      navContainer.classList.toggle('active');
      overlay.classList.toggle('active');
      
      // Change icon based on menu state
      const icon = menuBtn.querySelector('i');
      if (navContainer.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
        menuBtn.setAttribute('aria-expanded', 'true');
        navContainer.setAttribute('aria-hidden', 'false');
        document.body && document.body.setAttribute('data-scroll-lock', 'true');
      } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        menuBtn.setAttribute('aria-expanded', 'false');
        navContainer.setAttribute('aria-hidden', 'true');
        document.body && document.body.removeAttribute('data-scroll-lock');
      }
    });
    
    // Close menu when clicking on overlay
    overlay.addEventListener('click', () => {
      navContainer.classList.remove('active');
      overlay.classList.remove('active');
      const icon = menuBtn.querySelector('i');
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
      menuBtn.setAttribute('aria-expanded', 'false');
      navContainer.setAttribute('aria-hidden', 'true');
      document.body && document.body.removeAttribute('data-scroll-lock');
    });
    
    // Close menu when ESC key is pressed
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navContainer.classList.contains('active')) {
        navContainer.classList.remove('active');
        overlay.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        menuBtn.setAttribute('aria-expanded', 'false');
        navContainer.setAttribute('aria-hidden', 'true');
        document.body && document.body.removeAttribute('data-scroll-lock');
        menuBtn.focus();
      }
    });
    
    // Close menu when a nav link is clicked
    navContainer.addEventListener('click', (e) => {
      // Check if the clicked element or its parent is a link
      const isLink = e.target.tagName === 'A' || e.target.closest('a');
      if (isLink) {
        navContainer.classList.remove('active');
        overlay.classList.remove('active');
        const icon = menuBtn.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
        menuBtn.setAttribute('aria-expanded', 'false');
        navContainer.setAttribute('aria-hidden', 'true');
        document.body && document.body.removeAttribute('data-scroll-lock');
      }
    });
  }
  
  setupScrollEffect() {
    const navbar = this.shadowRoot.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }
}

// Register the component if it's not already registered
if (!customElements.get('dsm-navbar')) {
  customElements.define('dsm-navbar', DsmNavbar);
}
