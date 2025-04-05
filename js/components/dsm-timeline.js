/**
 * DSM Timeline Components
 * Vertical timeline showing historical events with year markers
 */

// Timeline Container Component
class DsmTimeline extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Roboto:wght@300;400;500;700&display=swap');
        
        :host {
          display: block;
          padding: 100px 0;
          background-color: #f8f8f8;
          position: relative;
        }
        
        .timeline-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('https://picsum.photos/id/133/1920/1080') center/cover no-repeat fixed;
          opacity: 0.05;
          z-index: 0;
        }
        
        .timeline-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 5%;
          position: relative;
          z-index: 1;
        }
        
        .section-title {
          text-align: center;
          margin-bottom: 5rem;
        }
        
        .section-title h2 {
          font-family: var(--heading-font, 'Orbitron'), sans-serif;
          font-size: 2.5rem;
          color: var(--secondary, #1a2249);
          margin-bottom: 1rem;
          position: relative;
          display: inline-block;
        }
        
        .section-title h2::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: var(--primary, #c02a2a);
        }
        
        .section-title p {
          max-width: 700px;
          margin: 0 auto;
          color: var(--gray, #666666);
        }
        
        .timeline {
          position: relative;
          padding: 2rem 0;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 4px;
          margin-left: -2px;
          background-color: var(--primary, #c02a2a);
        }
        
        @media (max-width: 992px) {
          .section-title h2 {
            font-size: 2.2rem;
          }
          
          .timeline::before {
            left: 40px;
          }
        }
        
        @media (max-width: 768px) {
          :host {
            padding: 80px 0;
          }
          
          .section-title h2 {
            font-size: 1.8rem;
          }
        }
      </style>
      
      <div class="timeline-bg"></div>
      <div class="timeline-container">
        <div class="section-title">
          <h2>${this.getAttribute('title') || 'Timeline'}</h2>
          <p>${this.getAttribute('subtitle') || 'Historical events'}</p>
        </div>
        <div class="timeline">
          <slot></slot>
        </div>
      </div>
    `;
  }
  
  static get observedAttributes() {
    return ['title', 'subtitle'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'title') {
      const titleEl = this.shadowRoot.querySelector('.section-title h2');
      if (titleEl) titleEl.textContent = newValue;
    }
    
    if (name === 'subtitle') {
      const subtitleEl = this.shadowRoot.querySelector('.section-title p');
      if (subtitleEl) subtitleEl.textContent = newValue;
    }
  }
  
  connectedCallback() {
    this.setupAnimation();
  }
  
  setupAnimation() {
    // Use Intersection Observer to animate timeline items as they scroll into view
    setTimeout(() => {
      const timelineItems = this.querySelectorAll('dsm-timeline-item');
      
      if (timelineItems.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('show');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.2 });
        
        timelineItems.forEach(item => {
          item.classList.add('timeline-animation');
          observer.observe(item);
        });
      }
    }, 100);
  }
}

// Timeline Item Component
class DsmTimelineItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Roboto:wght@300;400;500;700&display=swap');
        
        :host {
          display: block;
          position: relative;
          margin-bottom: 6rem;
        }
        
        :host(.timeline-animation) {
          opacity: 0;
          transform: translateY(50px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        
        :host(.timeline-animation.show) {
          opacity: 1;
          transform: translateY(0);
        }
        
        :host(:last-child) {
          margin-bottom: 0;
        }
        
        .item-content {
          position: relative;
          width: 45%;
          margin-left: auto;
          margin-right: 0;
          padding: 30px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        :host(:nth-child(even)) .item-content {
          margin-left: 0;
          margin-right: auto;
        }
        
        .item-content:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        
        .year-marker {
          position: absolute;
          top: 0;
          width: 70px;
          height: 70px;
          background-color: var(--primary, #c02a2a);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--heading-font, 'Orbitron'), sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          left: -35px;
          box-shadow: 0 5px 15px rgba(192, 42, 42, 0.3);
          z-index: 5;
        }
        
        :host(:nth-child(even)) .year-marker {
          right: -35px;
          left: auto;
        }
        
        .dot {
          position: absolute;
          top: 30px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: var(--primary, #c02a2a);
          box-shadow: 0 0 0 4px var(--light, #f8f8f8);
          left: -10px;
          z-index: 1;
        }
        
        :host(:nth-child(even)) .dot {
          right: -10px;
          left: auto;
        }
        
        .item-title {
          font-family: var(--heading-font, 'Orbitron'), sans-serif;
          font-size: 1.5rem;
          margin-bottom: 15px;
          color: var(--secondary, #1a2249);
        }
        
        .item-content-text {
          color: var(--dark, #121212);
          line-height: 1.7;
        }
        
        /* Direction arrow */
        .item-content::after {
          content: '';
          position: absolute;
          top: 20px;
          width: 0;
          height: 0;
          border-style: solid;
          left: -10px;
          border-width: 10px 10px 10px 0;
          border-color: transparent white transparent transparent;
        }
        
        :host(:nth-child(even)) .item-content::after {
          left: auto;
          right: -10px;
          border-width: 10px 0 10px 10px;
          border-color: transparent transparent transparent white;
        }
        
        @media (max-width: 992px) {
          .item-content {
            width: calc(100% - 90px);
            margin-left: 90px;
            margin-right: 0;
          }
          
          :host(:nth-child(even)) .item-content {
            margin-left: 90px;
            margin-right: 0;
          }
          
          .year-marker {
            left: 5px;
          }
          
          :host(:nth-child(even)) .year-marker {
            left: 5px;
            right: auto;
          }
          
          .dot {
            left: 30px;
          }
          
          :host(:nth-child(even)) .dot {
            left: 30px;
            right: auto;
          }
          
          .item-content::after {
            left: -10px;
            border-width: 10px 10px 10px 0;
            border-color: transparent white transparent transparent;
          }
          
          :host(:nth-child(even)) .item-content::after {
            left: -10px;
            right: auto;
            border-width: 10px 10px 10px 0;
            border-color: transparent white transparent transparent;
          }
        }
        
        @media (max-width: 576px) {
          .item-content {
            padding: 20px;
          }
          
          .year-marker {
            width: 60px;
            height: 60px;
            font-size: 1rem;
          }
          
          .item-title {
            font-size: 1.3rem;
          }
        }
      </style>
      
      <div class="year-marker">${this.getAttribute('year')}</div>
      <div class="dot"></div>
      <div class="item-content">
        <h3 class="item-title">${this.getAttribute('title')}</h3>
        <div class="item-content-text">
          <slot></slot>
        </div>
      </div>
    `;
  }
  
  static get observedAttributes() {
    return ['year', 'title'];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    if (name === 'year') {
      const yearMarker = this.shadowRoot.querySelector('.year-marker');
      if (yearMarker) yearMarker.textContent = newValue;
    }
    
    if (name === 'title') {
      const titleEl = this.shadowRoot.querySelector('.item-title');
      if (titleEl) titleEl.textContent = newValue;
    }
  }
}

// Register components if not already registered
if (!customElements.get('dsm-timeline-item')) {
  customElements.define('dsm-timeline-item', DsmTimelineItem);
}

if (!customElements.get('dsm-timeline')) {
  customElements.define('dsm-timeline', DsmTimeline);
}
