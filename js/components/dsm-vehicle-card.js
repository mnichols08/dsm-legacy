class DsmVehicleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        
        .vehicle-card {
          position: relative;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.5s ease;
          cursor: pointer;
          height: 500px; /* Fixed height for desktop */
        }
        
        .vehicle-card:hover,
        .vehicle-card:focus-within {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        
        .vehicle-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #1a1a1a;
        }
        
        .vehicle-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.5s ease;
        }
        
        .vehicle-card:hover .vehicle-image img,
        .vehicle-card:focus-within .vehicle-image img {
          transform: scale(1.1);
          opacity: 0.7;
        }
        
        .vehicle-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 30px;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.7) 50%, transparent);
          color: white;
          transform: translateY(calc(100% - 100px));
          transition: all 0.5s ease;
        }
        
        .vehicle-card:hover .vehicle-overlay,
        .vehicle-card:focus-within .vehicle-overlay {
          transform: translateY(0);
        }
        
        .vehicle-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          position: relative;
          padding-bottom: 0.5rem;
        }
        
        .vehicle-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: #f0b000;
          transition: width 0.3s ease;
        }
        
        .vehicle-card:hover .vehicle-title::after,
        .vehicle-card:focus-within .vehicle-title::after {
          width: 100px;
        }
        
        .vehicle-years {
          font-size: 0.9rem;
          opacity: 0.9;
          margin-bottom: 1rem;
          color: #f0b000;
        }
        
        .vehicle-desc {
          margin-bottom: 1.5rem;
          line-height: 1.6;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease 0.1s;
        }
        
        .vehicle-card:hover .vehicle-desc,
        .vehicle-card:focus-within .vehicle-desc {
          opacity: 1;
          transform: translateY(0);
        }
        
        .vehicle-specs {
          display: flex;
          gap: 1.5rem;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease 0.2s;
        }
        
        .vehicle-card:hover .vehicle-specs,
        .vehicle-card:focus-within .vehicle-specs {
          opacity: 1;
          transform: translateY(0);
        }
        
        .spec {
          text-align: center;
        }
        
        .spec-value {
          font-size: 1.3rem;
          font-weight: 700;
          color: #f0b000;
        }
        
        .spec-label {
          font-size: 0.8rem;
          opacity: 0.9;
          color: white;
        }
        
        /* Accessibility improvements */
        .vehicle-card:focus {
          outline: none;
        }
        
        .vehicle-card.keyboard-focus {
          outline: 3px solid #f0b000;
          outline-offset: 3px;
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        
        /* Mobile adjustments - use max-width to avoid affecting desktop */
        @media (max-width: 768px) {
          .vehicle-card {
            height: auto;
            min-height: 450px;
          }
        }
        
        /* Explicitly set desktop heights */
        @media (min-width: 769px) {
          .vehicle-card {
            height: 500px !important;
          }
        }
      </style>
      
      <div class="vehicle-card" tabindex="0" role="article" aria-labelledby="vehicle-title">
        <div class="vehicle-image">
          <img src="" alt="">
        </div>
        <div class="vehicle-overlay">
          <h3 class="vehicle-title" id="vehicle-title"></h3>
          <p class="vehicle-years"></p>
          <p class="vehicle-desc"></p>
          <div class="vehicle-specs">
            <!-- Specs will be dynamically inserted here -->
          </div>
        </div>
      </div>
    `;
  }
  
  static get observedAttributes() {
    return ['image', 'title', 'years', 'description', 'specs'];
  }
  
  connectedCallback() {
    this.updateContent();
    this.setupEventListeners();
    this.setupKeyboardAccessibility();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    this.updateContent();
  }
  
  updateContent() {
    const image = this.getAttribute('image');
    const title = this.getAttribute('title');
    const years = this.getAttribute('years');
    const description = this.getAttribute('description');
    const specs = this.getAttribute('specs');
    
    const imageElement = this.shadowRoot.querySelector('.vehicle-image img');
    const titleElement = this.shadowRoot.querySelector('.vehicle-title');
    const yearsElement = this.shadowRoot.querySelector('.vehicle-years');
    const descElement = this.shadowRoot.querySelector('.vehicle-desc');
    const specsContainer = this.shadowRoot.querySelector('.vehicle-specs');
    const cardElement = this.shadowRoot.querySelector('.vehicle-card');
    
    if (image) {
      imageElement.src = image;
      imageElement.alt = title || 'Vehicle Image';
    }
    
    if (title) {
      titleElement.textContent = title;
      cardElement.setAttribute('aria-label', `${title} - ${years || ''}`);
    }
    
    if (years) yearsElement.textContent = years;
    if (description) descElement.textContent = description;
    
    if (specs) {
      try {
        const specsArray = JSON.parse(specs);
        specsContainer.innerHTML = '';
        
        specsArray.forEach(spec => {
          const specElement = document.createElement('div');
          specElement.className = 'spec';
          specElement.innerHTML = `
            <div class="spec-value">${spec.value}</div>
            <div class="spec-label">${spec.label}</div>
          `;
          specsContainer.appendChild(specElement);
        });
      } catch (e) {
        console.error('Invalid specs JSON', e);
      }
    }
  }
  
  setupEventListeners() {
    if (window.matchMedia('(hover: hover)').matches) {
      const card = this.shadowRoot.querySelector('.vehicle-card');
      let requestId;
      
      card.addEventListener('mousemove', (e) => {
        if (requestId) {
          cancelAnimationFrame(requestId);
        }
        
        // Skip 3D effect if user prefers reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          return;
        }
        
        requestId = requestAnimationFrame(() => {
          const cardRect = card.getBoundingClientRect();
          const mouseX = e.clientX - cardRect.left;
          const mouseY = e.clientY - cardRect.top;
          
          const cardCenterX = cardRect.width / 2;
          const cardCenterY = cardRect.height / 2;
          
          const angleY = (mouseX - cardCenterX) / 30;
          const angleX = (cardCenterY - mouseY) / 30;
          
          card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-5px)`;
          
          requestId = null;
        });
      });
      
      card.addEventListener('mouseleave', () => {
        if (requestId) {
          cancelAnimationFrame(requestId);
          requestId = null;
        }
        card.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          card.style.transform = '';
        }, 300);
      });
    }
  }
  
  setupKeyboardAccessibility() {
    const card = this.shadowRoot.querySelector('.vehicle-card');
    
    card.addEventListener('keydown', (e) => {
      // Handle Enter and Space keys for keyboard activation
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        
        // Toggle display state (show/hide details)
        const overlay = this.shadowRoot.querySelector('.vehicle-overlay');
        if (overlay.style.transform === 'translateY(0px)') {
          overlay.style.transform = 'translateY(calc(100% - 100px))';
        } else {
          overlay.style.transform = 'translateY(0px)';
        }
      }
    });
    
    // Differentiate between mouse and keyboard focus
    card.addEventListener('focus', (e) => {
      // Check if the focus was triggered by keyboard
      if (this.lastInteractionWasKeyboard) {
        card.classList.add('keyboard-focus');
      }
    });
    
    card.addEventListener('blur', () => {
      card.classList.remove('keyboard-focus');
    });
    
    // Track keyboard usage
    document.addEventListener('keydown', () => {
      this.lastInteractionWasKeyboard = true;
    }, { capture: true });
    
    document.addEventListener('mousedown', () => {
      this.lastInteractionWasKeyboard = false;
    }, { capture: true });
  }
}

customElements.define('dsm-vehicle-card', DsmVehicleCard);
