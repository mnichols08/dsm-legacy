/**
 * DSM Gallery Components
 * A responsive gallery system with lightbox functionality
 */

// Gallery Container Component
class DsmGallery extends HTMLElement {
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
        }
        
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          grid-auto-rows: 300px;
          gap: 1.5rem;
          padding: 0;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        ::slotted(dsm-gallery-item:nth-child(3n+1)) {
          grid-row: span 2;
        }
        
        .lightbox {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
        }
        
        .lightbox.active {
          opacity: 1;
          visibility: visible;
        }
        
        .lightbox-content {
          max-width: 90%;
          max-height: 90%;
          position: relative;
        }
        
        .lightbox-image {
          max-width: 100%;
          max-height: 80vh;
          display: block;
          margin: 0 auto;
          box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
        }
        
        .lightbox-caption {
          position: absolute;
          bottom: -40px;
          left: 0;
          right: 0;
          text-align: center;
          color: white;
          padding: 10px;
          font-size: 1.2rem;
        }
        
        .lightbox-close {
          position: absolute;
          top: 20px;
          right: 20px;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .lightbox-close:hover {
          background-color: rgba(192, 42, 42, 0.7);
        }
        
        .lightbox-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          color: white;
          font-size: 2rem;
          cursor: pointer;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .lightbox-nav:hover {
          background-color: rgba(192, 42, 42, 0.7);
        }
        
        .lightbox-prev {
          left: 20px;
        }
        
        .lightbox-next {
          right: 20px;
        }
        
        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            grid-auto-rows: 250px;
          }
          
          ::slotted(dsm-gallery-item:nth-child(3n+1)) {
            grid-row: span 1;
          }
          
          .lightbox-nav {
            width: 40px;
            height: 40px;
            font-size: 1.5rem;
          }
          
          .lightbox-prev {
            left: 10px;
          }
          
          .lightbox-next {
            right: 10px;
          }
        }
        
        @media (max-width: 576px) {
          .gallery-grid {
            grid-template-columns: 1fr;
            grid-auto-rows: 250px;
          }
        }
      </style>
      
      <div class="gallery-grid">
        <slot></slot>
      </div>
      
      <div class="lightbox">
        <div class="lightbox-content">
          <img src="" alt="" class="lightbox-image">
          <div class="lightbox-caption"></div>
        </div>
        <div class="lightbox-close" role="button" aria-label="Close lightbox">
          <i class="fas fa-times"></i>
        </div>
        <div class="lightbox-nav lightbox-prev" role="button" aria-label="Previous image">
          <i class="fas fa-chevron-left"></i>
        </div>
        <div class="lightbox-nav lightbox-next" role="button" aria-label="Next image">
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    `;
  }
  
  connectedCallback() {
    // Ensure the lightbox is initialized after the component has rendered
    console.log('Gallery component connected to DOM');
    setTimeout(() => {
      this.setupLightbox();
      console.log('Gallery lightbox initialized');
    }, 500);
  }
  
  setupLightbox() {
    const lightbox = this.shadowRoot.querySelector('.lightbox');
    const lightboxImage = this.shadowRoot.querySelector('.lightbox-image');
    const lightboxCaption = this.shadowRoot.querySelector('.lightbox-caption');
    const closeBtn = this.shadowRoot.querySelector('.lightbox-close');
    const prevBtn = this.shadowRoot.querySelector('.lightbox-prev');
    const nextBtn = this.shadowRoot.querySelector('.lightbox-next');
    
    let currentIndex = 0;
    const galleryItems = this.querySelectorAll('dsm-gallery-item');
    
    console.log(`Found ${galleryItems.length} gallery items`);
    
    // Add a direct click event to each gallery item to ensure it works in all browsers
    galleryItems.forEach((item, index) => {
      item.addEventListener('click', () => {
        currentIndex = index;
        const image = item.getAttribute('image');
        const caption = item.getAttribute('caption');
        
        if (image) {
          console.log(`Opening lightbox with image: ${image} (direct click handler)`);
          lightboxImage.src = image;
          lightboxImage.alt = caption || 'Gallery image';
          lightboxCaption.textContent = caption || '';
          lightbox.classList.add('active');
          
          // Prevent scrolling when lightbox is open
          document.body.style.overflow = 'hidden';
        }
      });
    });
    
    // Fallback event delegation method
    this.addEventListener('click', (e) => {
      // Find if we clicked on or inside a gallery item
      const path = e.composedPath && e.composedPath();
      if (!path) return; // Skip if composedPath is not supported
      
      const target = path.find(element => 
        element.tagName && element.tagName.toLowerCase() === 'dsm-gallery-item'
      );
      
      if (target) {
        const image = target.getAttribute('image');
        const caption = target.getAttribute('caption');
        
        // Find index of clicked item
        galleryItems.forEach((item, index) => {
          if (item === target) {
            currentIndex = index;
          }
        });
        
        if (image) {
          console.log(`Opening lightbox with image: ${image} (delegation)`);
          lightboxImage.src = image;
          lightboxImage.alt = caption || 'Gallery image';
          lightboxCaption.textContent = caption || '';
          lightbox.classList.add('active');
          
          // Prevent scrolling when lightbox is open
          document.body.style.overflow = 'hidden';
        }
      }
    });
    
    // Close lightbox
    closeBtn.addEventListener('click', () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
      
      // Navigate with arrow keys
      if (lightbox.classList.contains('active')) {
        if (e.key === 'ArrowLeft') {
          navigatePrev();
        } else if (e.key === 'ArrowRight') {
          navigateNext();
        }
      }
    });
    
    // Click outside to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    // Navigation functions
    function navigateNext() {
      currentIndex = (currentIndex + 1) % galleryItems.length;
      const nextItem = galleryItems[currentIndex];
      const image = nextItem.getAttribute('image');
      const caption = nextItem.getAttribute('caption');
      
      lightboxImage.src = image;
      lightboxImage.alt = caption || 'Gallery image';
      lightboxCaption.textContent = caption || '';
    }
    
    function navigatePrev() {
      currentIndex = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
      const prevItem = galleryItems[currentIndex];
      const image = prevItem.getAttribute('image');
      const caption = prevItem.getAttribute('caption');
      
      lightboxImage.src = image;
      lightboxImage.alt = caption || 'Gallery image';
      lightboxCaption.textContent = caption || '';
    }
    
    // Navigation buttons
    nextBtn.addEventListener('click', navigateNext);
    prevBtn.addEventListener('click', navigatePrev);
  }
}

// Gallery Item Component
class DsmGalleryItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }
        
        .gallery-item {
          height: 100%;
          width: 100%;
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .gallery-item:hover,
        .gallery-item:focus {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        
        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.5s ease;
        }
        
        .gallery-item:hover .gallery-image,
        .gallery-item:focus .gallery-image {
          transform: scale(1.1);
        }
        
        .gallery-caption {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          color: white;
          padding: 20px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.3s ease;
        }
        
        .gallery-item:hover .gallery-caption,
        .gallery-item:focus .gallery-caption {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Reduce motion if preferred */
        @media (prefers-reduced-motion: reduce) {
          .gallery-item, .gallery-image, .gallery-caption {
            transition: opacity 0.1s linear;
          }
          
          .gallery-item:hover .gallery-image,
          .gallery-item:focus .gallery-image {
            transform: none;
          }
        }
      </style>
      
      <div class="gallery-item" tabindex="0">
        <img class="gallery-image" src="" alt="">
        <div class="gallery-caption"></div>
      </div>
    `;
  }
  
  static get observedAttributes() {
    return ['image', 'caption'];
  }
  
  connectedCallback() {
    this.updateContent();
    
    // Make the whole item more accessible and clickable
    const galleryItem = this.shadowRoot.querySelector('.gallery-item');
    galleryItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        // Simulate a click when pressing Enter or Space
        this.click();
      }
    });
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    this.updateContent();
  }
  
  updateContent() {
    const image = this.getAttribute('image');
    const caption = this.getAttribute('caption');
    
    const imageElement = this.shadowRoot.querySelector('.gallery-image');
    const captionElement = this.shadowRoot.querySelector('.gallery-caption');
    
    if (image) {
      imageElement.src = image;
      imageElement.alt = caption || 'Gallery image';
    }
    
    if (caption) {
      captionElement.textContent = caption;
    }
  }
}

// Register the components - make sure this is executed directly
try {
  customElements.define('dsm-gallery-item', DsmGalleryItem);
  customElements.define('dsm-gallery', DsmGallery);
  console.log('Successfully registered dsm-gallery and dsm-gallery-item components');
} catch (e) {
  console.error('Error registering gallery components:', e);
}

// Export the components for use in other modules
window.DsmGallery = DsmGallery;
window.DsmGalleryItem = DsmGalleryItem;
