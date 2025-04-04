class DsmNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        
        :host {
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          background-color: rgba(26, 26, 26, 0.9);
          backdrop-filter: blur(10px);
          transition: all 0.4s ease;
        }
        
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 5%;
        }
        
        :host(.scrolled) .navbar {
          padding: 0.6rem 5%;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
        }
        
        .mobile-menu {
          display: none;
          cursor: pointer;
          font-size: 1.5rem;
          color: white;
          border: none;
          background: transparent;
          padding: 8px;
          border-radius: 4px;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }
        
        @media (max-width: 992px) {
          ::slotted(nav) {
            display: none !important;
          }
          
          .mobile-menu {
            display: flex;
          }
          
          ::slotted(nav.show) {
            display: flex !important;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background-color: rgba(26, 26, 26, 0.95);
            padding: 20px;
            z-index: 999;
            animation: slideDown 0.3s ease-out forwards;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
          }
          
          ::slotted(nav.show a) {
            color: white;
            text-decoration: none;
            padding: 15px 0;
            font-size: 1.1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            width: 100%;
            display: block;
            margin: 0 !important;
          }
          
          ::slotted(nav.show a:last-child) {
            border-bottom: none;
          }
          
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        }
        
        @media (max-width: 576px) {
          .navbar {
            padding: 0.8rem 4%;
          }
          
          :host(.scrolled) .navbar {
            padding: 0.5rem 4%;
          }
        }
      </style>
      
      <div class="navbar">
        <slot name="logo"></slot>
        <slot name="links"></slot>
        <button class="mobile-menu" aria-expanded="false" aria-label="Open Menu">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    `;
    
    this.mobileMenu = this.shadowRoot.querySelector('.mobile-menu');
  }
  
  connectedCallback() {
    this.setupEventListeners();
    this.setupScrollEffect();
    window.ensureCustomFonts(this.shadowRoot);
  }
  
  setupEventListeners() {
    this.mobileMenu.addEventListener('click', this.toggleMobileMenu.bind(this));
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
      const navLinks = this.querySelector('[slot="links"]');
      if (navLinks.classList.contains('show') && 
          !this.contains(e.target) && 
          e.target !== this.mobileMenu) {
        this.toggleMobileMenu();
      }
    });
    
    // Close mobile menu when clicking on a link
    const navLinks = this.querySelector('[slot="links"]');
    if (navLinks) {
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if (navLinks.classList.contains('show')) {
            this.toggleMobileMenu();
          }
        });
      });
    }
    
    // Handle keyboard events
    this.mobileMenu.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleMobileMenu();
      }
    });
  }
  
  setupScrollEffect() {
    let scrollThrottleTimer;
    window.addEventListener('scroll', () => {
      if (!scrollThrottleTimer) {
        scrollThrottleTimer = setTimeout(() => {
          if (window.scrollY > 50) {
            this.classList.add('scrolled');
          } else {
            this.classList.remove('scrolled');
          }
          scrollThrottleTimer = null;
        }, 50);
      }
    });
  }
  
  toggleMobileMenu() {
    const navLinks = this.querySelector('[slot="links"]');
    const isExpanded = navLinks.classList.contains('show');
    navLinks.classList.toggle('show');
    
    if (!isExpanded) {
      this.mobileMenu.innerHTML = '<i class="fas fa-times"></i>';
      this.mobileMenu.setAttribute('aria-expanded', 'true');
      this.mobileMenu.setAttribute('aria-label', 'Close Menu');
    } else {
      this.mobileMenu.innerHTML = '<i class="fas fa-bars"></i>';
      this.mobileMenu.setAttribute('aria-expanded', 'false');
      this.mobileMenu.setAttribute('aria-label', 'Open Menu');
    }
  }
}

customElements.define('dsm-navbar', DsmNavbar);
