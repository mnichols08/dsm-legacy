class DsmBackToTop extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        
        :host {
          display: block;
        }
        
        .back-to-top {
          position: fixed;
          bottom: max(30px, env(safe-area-inset-bottom, 30px));
          right: max(30px, env(safe-area-inset-right, 30px));
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #d42f2f;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(212, 47, 47, 0.3);
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
          z-index: 999;
          -webkit-tap-highlight-color: transparent;
        }
        
        .back-to-top.show {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* For accessibility & better visibility */
        .back-to-top:hover, .back-to-top:focus {
          background-color: #c22020;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(212, 47, 47, 0.4);
        }
        
        .fa-arrow-up {
          font-family: 'Font Awesome 6 Free';
          font-weight: 900;
        }
        
        /* Mobile optimizations */
        @media (max-width: 576px) {
          .back-to-top {
            width: 44px;
            height: 44px;
            font-size: 1.2rem;
            bottom: max(20px, env(safe-area-inset-bottom, 20px));
            right: max(20px, env(safe-area-inset-right, 20px));
          }
        }
      </style>
      
      <div class="back-to-top" aria-label="Back to top" role="button" tabindex="0">
        <i class="fas fa-arrow-up"></i>
      </div>
    `;
  }
  
  connectedCallback() {
    window.ensureCustomFonts(this.shadowRoot);
    this.setupScrollListener();
    this.setupEventListeners();
    
    // Force check scroll position on load
    setTimeout(() => {
      this.checkScrollPosition();
    }, 100);
  }
  
  setupScrollListener() {
    const backToTop = this.shadowRoot.querySelector('.back-to-top');
    let scrollThrottleTimer;
    
    window.addEventListener('scroll', () => {
      if (!scrollThrottleTimer) {
        scrollThrottleTimer = setTimeout(() => {
          this.checkScrollPosition();
          scrollThrottleTimer = null;
        }, 50);
      }
    });
  }
  
  checkScrollPosition() {
    const backToTop = this.shadowRoot.querySelector('.back-to-top');
    if (window.scrollY > 500) {
      backToTop.classList.add('show');
    } else {
      backToTop.classList.remove('show');
    }
  }
  
  setupEventListeners() {
    const backToTop = this.shadowRoot.querySelector('.back-to-top');
    
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };
    
    backToTop.addEventListener('click', scrollToTop);
    
    // Add touch event with preventDefault to avoid issues
    backToTop.addEventListener('touchend', (e) => {
      e.preventDefault();
      scrollToTop();
    });
    
    backToTop.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTop();
      }
    });
  }
}

customElements.define('dsm-back-to-top', DsmBackToTop);
