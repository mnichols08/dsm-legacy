class DsmHero extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Roboto:wght@300;400;500;700&display=swap');
        
        :host {
          display: block;
        }
        
        .hero {
          position: relative;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: var(--dark, #1a1a1a);
        }
        
        .hero-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
          filter: brightness(0.3);
          z-index: 0;
        }
        
        .hero-content {
          position: relative;
          z-index: 1;
          text-align: center;
          color: white;
          max-width: 1000px;
          padding: 0 2rem;
        }
        
        .hero-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 4rem;
          font-weight: 900;
          margin-bottom: 1rem;
          text-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
          background: linear-gradient(135deg, var(--primary, #d42f2f), var(--secondary, #242b56));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: fadeIn 1s ease-out;
        }
        
        .hero-subtitle {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
          animation: fadeIn 1s ease-out 0.3s both;
        }
        
        .btn {
          display: inline-block;
          padding: 12px 30px;
          background-color: var(--primary, #d42f2f);
          color: white;
          text-decoration: none;
          font-weight: 700;
          border-radius: 30px;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.3s ease;
          box-shadow: var(--primary-shadow, 0 5px 15px rgba(212, 47, 47, 0.3));
          animation: fadeIn 1s ease-out 0.6s both;
        }
        
        .btn:hover, .btn:active {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(212, 47, 47, 0.4);
          background-color: #c22020;
        }
        
        .scroll-indicator {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-size: 2rem;
          animation: bounce 2s infinite;
          cursor: pointer;
          z-index: 1;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) translateX(-50%);
          }
          40% {
            transform: translateY(-20px) translateX(-50%);
          }
          60% {
            transform: translateY(-10px) translateX(-50%);
          }
        }
        
        @media (max-width: 1200px) {
          .hero-title {
            font-size: 3.5rem;
          }
          
          .hero-subtitle {
            font-size: 1.3rem;
          }
        }
        
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .hero-subtitle {
            font-size: 1.1rem;
            padding: 0 10px;
          }
          
          .btn {
            padding: 10px 25px;
            font-size: 0.9rem;
            min-height: 44px;
            min-width: 120px;
          }
          
          .hero-content {
            width: 100%;
            padding: 0 20px;
          }
        }
        
        @media (max-width: 576px) {
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-subtitle {
            font-size: 1rem;
            margin-bottom: 1.5rem;
          }
          
          .hero {
            height: 95vh;
          }
          
          .btn {
            width: 80%;
            max-width: 250px;
            padding: 12px 15px;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
          
          .scroll-indicator {
            animation: none;
          }
        }
      </style>
      
      <section class="hero" role="banner">
        <div class="hero-bg"></div>
        <div class="hero-content">
          <h1 class="hero-title"></h1>
          <p class="hero-subtitle"></p>
          <a href="#" class="btn"></a>
        </div>
        <div class="scroll-indicator" tabindex="0" role="button" aria-label="Scroll to content">
          <i class="fas fa-chevron-down"></i>
        </div>
      </section>
    `;
  }
  
  static get observedAttributes() {
    return ['title', 'subtitle', 'cta-text', 'cta-link', 'image'];
  }
  
  connectedCallback() {
    this.updateContent();
    this.setupEventListeners();
    this.preloadHeroImage();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    this.updateContent();
  }
  
  updateContent() {
    const title = this.getAttribute('title');
    const subtitle = this.getAttribute('subtitle');
    const ctaText = this.getAttribute('cta-text');
    const ctaLink = this.getAttribute('cta-link');
    const image = this.getAttribute('image');
    
    const titleElement = this.shadowRoot.querySelector('.hero-title');
    const subtitleElement = this.shadowRoot.querySelector('.hero-subtitle');
    const btnElement = this.shadowRoot.querySelector('.btn');
    const bgElement = this.shadowRoot.querySelector('.hero-bg');
    
    if (title) titleElement.textContent = title;
    if (subtitle) subtitleElement.textContent = subtitle;
    if (ctaText) btnElement.textContent = ctaText;
    if (ctaLink) btnElement.setAttribute('href', ctaLink);
    if (image) bgElement.style.backgroundImage = `url('${image}')`;
  }
  
  setupEventListeners() {
    const scrollIndicator = this.shadowRoot.querySelector('.scroll-indicator');
    const ctaLink = this.shadowRoot.querySelector('.btn').getAttribute('href');
    
    const scrollToTarget = () => {
      if (ctaLink && ctaLink !== '#' && ctaLink.startsWith('#')) {
        const targetElement = document.querySelector(ctaLink);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        const firstSection = document.querySelector('section:not(.hero)');
        if (firstSection) {
          firstSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
          });
        }
      }
    };
    
    scrollIndicator.addEventListener('click', scrollToTarget);
    scrollIndicator.addEventListener('touchend', (e) => {
      e.preventDefault();
      scrollToTarget();
    });
    scrollIndicator.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        scrollToTarget();
      }
    });
  }
  
  preloadHeroImage() {
    const image = this.getAttribute('image');
    if (image) {
      const preloadLink = document.createElement('link');
      preloadLink.href = image;
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      document.head.appendChild(preloadLink);
    }
  }
}

customElements.define('dsm-hero', DsmHero);
