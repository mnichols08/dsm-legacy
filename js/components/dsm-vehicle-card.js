/**
 * DSM Vehicle Card Component
 * A styled card for displaying vehicle information with image, details, and specs
 */

class DsmVehicleCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Roboto:wght@300;400;500;700&display=swap');
        
        :host {
          display: block;
        }
        
        .vehicle-card {
          position: relative;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.5s ease;
          cursor: pointer;
          height: 500px;
          background-color: var(--dark, #121212);
        }
        
        .vehicle-card:hover,
        .vehicle-card:focus-within {
          transform: translateY(-10px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }
        
        .vehicle-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
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
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
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
          background-color: var(--primary, #c02a2a);
          transition: width 0.3s ease;
        }
        
        .vehicle-card:hover .vehicle-title::after,
        .vehicle-card:focus-within .vehicle-title::after {
          width: 100px;
        }
        
        .vehicle-years {
          font-size: 0.9rem;
          opacity: 0.7;
          margin-bottom: 1rem;
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
          color: var(--primary, #c02a2a);
        }
        
        .spec-label {
          font-size: 0.8rem;
          opacity: 0.7;
        }
        
        @media (max-width: 768px) {
          .vehicle-card {
            height: auto;
            min-height: 450px;
          }
          
          .vehicle-overlay {
            padding: 20px;
          }
          
          .vehicle-title {
            font-size: 1.6rem;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .vehicle-card, .vehicle-image img, .vehicle-overlay, .vehicle-desc, .vehicle-specs {
            transition: none !important;
          }
          
          .vehicle-card:hover .vehicle-image img,
          .vehicle-card:focus-within .vehicle-image img {
            transform: none;
          }
        }
      </style>
      
      <div class="vehicle-card">
        <div class="vehicle-image">
          <img src="" alt="Vehicle Image">
        </div>
        <div class="vehicle-overlay">
          <h3 class="vehicle-title"></h3>
          <p class="vehicle-years"></p>
          <p class="vehicle-desc"></p>
          <div class="vehicle-specs"></div>
        </div>
      </div>
    `;
  }
  
  static get observedAttributes() {
    return ['image', 'title', 'years', 'description', 'specs'];
  }
  
  connectedCallback() {
    this.updateContent();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
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
    const specsElement = this.shadowRoot.querySelector('.vehicle-specs');
    
    if (image) {
      imageElement.src = image;
      imageElement.alt = title || 'Vehicle Image';
    }
    
    if (title) titleElement.textContent = title;
    if (years) yearsElement.textContent = years;
    if (description) descElement.textContent = description;
    
    // Handle specs as JSON
    if (specs) {
      try {
        const specsData = JSON.parse(specs);
        specsElement.innerHTML = '';
        
        specsData.forEach(spec => {
          const specEl = document.createElement('div');
          specEl.className = 'spec';
          
          const valueEl = document.createElement('div');
          valueEl.className = 'spec-value';
          valueEl.textContent = spec.value;
          
          const labelEl = document.createElement('div');
          labelEl.className = 'spec-label';
          labelEl.textContent = spec.label;
          
          specEl.appendChild(valueEl);
          specEl.appendChild(labelEl);
          specsElement.appendChild(specEl);
        });
      } catch (e) {
        console.error('Error parsing specs JSON:', e);
      }
    }
  }
}

// Register the component if it's not already registered
if (!customElements.get('dsm-vehicle-card')) {
  customElements.define('dsm-vehicle-card', DsmVehicleCard);
}
