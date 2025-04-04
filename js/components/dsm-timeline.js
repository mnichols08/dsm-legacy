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
          background-color: #242b56;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        :host::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: url('https://picsum.photos/id/133/1920/1080') center/cover no-repeat fixed;
          opacity: 0.1;
        }
        
        .section-title {
          text-align: center;
          margin-bottom: 3rem;
          position: relative;
          z-index: 1;
        }
        
        .section-title h2 {
          font-family: 'Orbitron', sans-serif;
          font-size: 2.5rem;
          color: white;
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
          background: #d42f2f;
        }
        
        .section-title p {
          max-width: 700px;
          margin: 0 auto;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .timeline-container {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
          z-index: 1;
        }
        
        .timeline {
          position: relative;
          padding: 50px 0;
        }
        
        .timeline::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 100%;
          background-color: #d42f2f;
        }
        
        ::slotted(dsm-timeline-item) {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.4s ease, transform 0.4s ease;
          will-change: opacity, transform;
        }
        
        ::slotted(dsm-timeline-item.animate) {
          opacity: 1;
          transform: translateY(0);
        }
        
        @media (max-width: 992px) {
          .timeline::before {
            left: 60px;
          }
        }
        
        @media (max-width: 768px) {
          :host {
            padding: 70px 0;
          }
          
          .section-title h2 {
            font-size: 2rem;
          }
        }
      </style>
      
      <div class="section-title">
        <h2></h2>
        <p></p>
      </div>
      <div class="timeline-container">
        <div class="timeline">
          <slot></slot>
        </div>
      </div>
    `;
  }
  
  static get observedAttributes() {
    return ['title', 'subtitle'];
  }
  
  connectedCallback() {
    this.updateContent();
    this.setupAnimation();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    this.updateContent();
  }
  
  updateContent() {
    const title = this.getAttribute('title');
    const subtitle = this.getAttribute('subtitle');
    
    const titleElement = this.shadowRoot.querySelector('.section-title h2');
    const subtitleElement = this.shadowRoot.querySelector('.section-title p');
    
    if (title) titleElement.textContent = title;
    if (subtitle) subtitleElement.textContent = subtitle;
  }
  
  setupAnimation() {
    // Wait for slotted elements to be available
    setTimeout(() => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Get timeline items from the light DOM
            const timelineItems = this.querySelectorAll('dsm-timeline-item');
            
            if (timelineItems.length > 0) {
              timelineItems.forEach((item, index) => {
                setTimeout(() => {
                  item.classList.add('animate');
                }, index * 150);
              });
            }
            
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      
      observer.observe(this.shadowRoot.querySelector('.timeline'));
    }, 100);
  }
}

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
          margin-bottom: 5rem;
        }
        
        :host(:last-child) {
          margin-bottom: 0;
        }
        
        .timeline-content {
          position: relative;
          width: 45%;
          padding: 30px;
          border-radius: 10px;
          background-color: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .timeline-content:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        :host(:nth-child(odd)) .timeline-content {
          left: 0;
        }
        
        :host(:nth-child(even)) .timeline-content {
          left: 55%;
        }
        
        .timeline-year {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #d42f2f;
          color: white;
          border-radius: 50%;
          font-family: 'Orbitron', sans-serif;
          font-weight: 700;
          z-index: 1;
          box-shadow: 0 5px 15px rgba(212, 47, 47, 0.3);
        }
        
        :host(:nth-child(odd)) .timeline-year {
          right: -40px;
        }
        
        :host(:nth-child(even)) .timeline-year {
          left: -40px;
        }
        
        h3 {
          margin-bottom: 1rem;
          font-size: 1.5rem;
          color: #f0c808;
          font-family: 'Orbitron', sans-serif;
        }
        
        ::slotted(p) {
          line-height: 1.7;
          font-family: 'Roboto', sans-serif;
        }
        
        @media (max-width: 992px) {
          .timeline-content {
            width: calc(100% - 120px);
            left: 120px !important;
          }
          
          .timeline-year {
            left: 10px !important;
            right: auto !important;
          }
        }
        
        @media (max-width: 576px) {
          .timeline-year {
            width: 60px;
            height: 60px;
            font-size: 0.9rem;
          }
          
          .timeline-content {
            width: calc(100% - 90px);
            left: 90px !important;
            padding: 20px;
          }
        }
      </style>
      
      <div class="timeline-content">
        <h3></h3>
        <slot></slot>
      </div>
      <div class="timeline-year"></div>
    `;
  }
  
  static get observedAttributes() {
    return ['year', 'title'];
  }
  
  connectedCallback() {
    this.updateContent();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    this.updateContent();
  }
  
  updateContent() {
    const year = this.getAttribute('year');
    const title = this.getAttribute('title');
    
    const yearElement = this.shadowRoot.querySelector('.timeline-year');
    const titleElement = this.shadowRoot.querySelector('h3');
    
    if (year) yearElement.textContent = year;
    if (title) titleElement.textContent = title;
  }
}

// Define components
customElements.define('dsm-timeline-item', DsmTimelineItem);
customElements.define('dsm-timeline', DsmTimeline);
