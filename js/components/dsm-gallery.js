class DsmGallery extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        
        :host {
          display: block;
          margin-bottom: 60px; /* Provide bottom margin for the gallery */
        }
        
        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          grid-auto-rows: 300px;
          gap: 1rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        ::slotted(dsm-gallery-item:nth-child(3n+1)) {
          grid-row: span 2;
        }
        
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          flex-direction: column;
        }
        
        .modal.show {
          opacity: 1;
          visibility: visible;
        }
        
        .modal-content {
          position: relative;
          max-width: 90%;
          max-height: 90%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .modal-content img {
          max-width: 100%;
          max-height: 80vh;
          display: block;
          border-radius: 5px;
          object-fit: contain;
        }
        
        .modal-controls {
          display: flex;
          justify-content: space-between;
          width: 100%;
          margin-top: 15px;
        }
        
        .modal-nav {
          color: white;
          font-size: 2rem;
          cursor: pointer;
          padding: 10px;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .modal-close {
          position: absolute;
          top: -40px;
          right: 0;
          font-size: 2rem;
          color: white;
          cursor: pointer;
          min-width: 44px;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          -webkit-tap-highlight-color: transparent;
        }
        
        .modal-caption {
          color: white;
          text-align: center;
          margin-top: 1rem;
          width: 100%;
        }
        
        /* Mobile specific styles only - use max-width to avoid affecting desktop */
        @media (max-width: 768px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            grid-auto-rows: 250px;
          }
          
          .modal-content img {
            max-height: 70vh;
          }
        }
        
        @media (max-width: 576px) {
          .gallery-grid {
            grid-template-columns: 1fr;
            grid-auto-rows: 250px;
            gap: 0.7rem;
          }
          
          ::slotted(dsm-gallery-item) {
            grid-row: span 1 !important; /* Override the span on small mobile only */
          }
          
          .modal-content {
            max-width: 95%;
          }
          
          .modal-nav {
            font-size: 1.5rem;
          }
        }
        
        /* Ensure proper grid on desktop */
        @media (min-width: 769px) {
          .gallery-grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            grid-auto-rows: 300px;
          }
          
          ::slotted(dsm-gallery-item:nth-child(3n+1)) {
            grid-row: span 2;
          }
        }
      </style>
      
      <div class="gallery-grid">
        <slot></slot>
      </div>
      
      <div class="modal" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
        <div class="modal-content">
          <span class="modal-close" aria-label="Close" tabindex="0"><i class="fas fa-times"></i></span>
          <img src="" alt="">
          <div class="modal-caption" id="modalTitle"></div>
          <div class="modal-controls">
            <div class="modal-nav prev" aria-label="Previous image" tabindex="0"><i class="fas fa-chevron-left"></i></div>
            <div class="modal-nav next" aria-label="Next image" tabindex="0"><i class="fas fa-chevron-right"></i></div>
          </div>
        </div>
      </div>
    `;
    
    this.modal = this.shadowRoot.querySelector('.modal');
    this.modalImg = this.shadowRoot.querySelector('.modal-content img');
    this.modalCaption = this.shadowRoot.querySelector('.modal-caption');
    this.modalClose = this.shadowRoot.querySelector('.modal-close');
    this.modalPrev = this.shadowRoot.querySelector('.modal-nav.prev');
    this.modalNext = this.shadowRoot.querySelector('.modal-nav.next');
    
    this.currentIndex = 0;
    this.galleryItems = [];
    
    // Bind the trapFocus method to this instance
    this.trapFocus = this.trapFocus.bind(this);
    this.touchStartX = 0;
    this.touchEndX = 0;
  }
  
  connectedCallback() {
    this.setupModal();
    this.setupTouchEvents();
    window.ensureCustomFonts(this.shadowRoot);
    
    // Get all gallery items
    setTimeout(() => {
      this.galleryItems = this.querySelectorAll('dsm-gallery-item');
    }, 100);
  }
  
  setupModal() {
    let focusedElementBeforeModal;
    
    const openModal = (image, caption, index) => {
      focusedElementBeforeModal = document.activeElement;
      
      this.modalImg.setAttribute('src', image);
      this.modalCaption.textContent = caption;
      this.modal.classList.add('show');
      this.modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      this.currentIndex = index;
      
      // Set focus to close button
      setTimeout(() => {
        this.modalClose.focus();
      }, 100);
      
      // Trap focus inside modal
      this.modal.addEventListener('keydown', this.trapFocus);
    };
    
    const closeModal = () => {
      this.modal.classList.remove('show');
      this.modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';
      
      // Return focus to element that opened the modal
      if (focusedElementBeforeModal) {
        focusedElementBeforeModal.focus();
      }
      
      // Remove focus trap
      this.modal.removeEventListener('keydown', this.trapFocus);
    };
    
    const showPrevImage = () => {
      if (this.galleryItems.length <= 1) return;
      
      this.currentIndex = (this.currentIndex - 1 + this.galleryItems.length) % this.galleryItems.length;
      const item = this.galleryItems[this.currentIndex];
      this.modalImg.setAttribute('src', item.getAttribute('image'));
      this.modalCaption.textContent = item.getAttribute('caption');
    };
    
    const showNextImage = () => {
      if (this.galleryItems.length <= 1) return;
      
      this.currentIndex = (this.currentIndex + 1) % this.galleryItems.length;
      const item = this.galleryItems[this.currentIndex];
      this.modalImg.setAttribute('src', item.getAttribute('image'));
      this.modalCaption.textContent = item.getAttribute('caption');
    };
    
    // Listen for events from gallery items
    this.addEventListener('dsm-gallery-item-click', (e) => {
      const allItems = Array.from(this.galleryItems);
      const clickedItem = e.target;
      const index = allItems.indexOf(clickedItem);
      openModal(e.detail.image, e.detail.caption, index);
    });
    
    this.modalClose.addEventListener('click', closeModal);
    this.modalClose.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeModal();
      }
    });
    
    // Setup navigation
    this.modalPrev.addEventListener('click', showPrevImage);
    this.modalNext.addEventListener('click', showNextImage);
    
    // Keyboard navigation
    this.modalPrev.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showPrevImage();
      }
    });
    
    this.modalNext.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showNextImage();
      }
    });
    
    // Close modal on escape key
    this.modal.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft') {
        showPrevImage();
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      }
    });
    
    // Close modal on outside click
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        closeModal();
      }
    });
  }
  
  setupTouchEvents() {
    this.modalImg.addEventListener('touchstart', (e) => {
      this.touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    this.modalImg.addEventListener('touchend', (e) => {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });
  }
  
  handleSwipe() {
    const minSwipeDistance = 50;
    const swipeDistance = this.touchEndX - this.touchStartX;
    
    if (swipeDistance > minSwipeDistance) {
      // Right swipe - show previous
      this.shadowRoot.querySelector('.modal-nav.prev').click();
    } else if (swipeDistance < -minSwipeDistance) {
      // Left swipe - show next
      this.shadowRoot.querySelector('.modal-nav.next').click();
    }
  }
  
  trapFocus(e) {
    // List of all focusable elements in modal
    const focusableElements = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    // If shift+tab pressed and focus on first element, move to last focusable element
    if (e.key === 'Tab' && e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    }
    // If tab pressed and focus on last element, move to first focusable element
    else if (e.key === 'Tab' && !e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
}

class DsmGalleryItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          cursor: pointer;
          height: 100%;
        }
        
        .gallery-item {
          height: 100%;
          -webkit-tap-highlight-color: transparent;
        }
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: all 0.5s ease;
        }
        
        :host(:hover) img {
          transform: scale(1.1);
        }
        
        .gallery-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(36, 43, 86, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.3s ease;
        }
        
        :host(:hover) .gallery-overlay,
        .gallery-item:focus .gallery-overlay {
          opacity: 1;
        }
        
        .gallery-icon {
          font-size: 3rem;
          color: white;
          transform: scale(0);
          transition: all 0.3s ease 0.1s;
        }
        
        :host(:hover) .gallery-icon,
        .gallery-item:focus .gallery-icon {
          transform: scale(1);
        }
        
        /* Touch device enhancements */
        @media (hover: none) {
          .gallery-overlay {
            opacity: 0.5;
            background-color: rgba(36, 43, 86, 0.6);
          }
          
          .gallery-icon {
            transform: scale(1);
            opacity: 1;
          }
        }
      </style>
      
      <div class="gallery-item" tabindex="0">
        <img src="" alt="">
        <div class="gallery-overlay">
          <div class="gallery-icon">
            <i class="fas fa-expand"></i>
          </div>
        </div>
      </div>
    `;
  }
  
  static get observedAttributes() {
    return ['image', 'caption'];
  }
  
  connectedCallback() {
    this.updateContent();
    this.setupEventListeners();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    this.updateContent();
  }
  
  updateContent() {
    const image = this.getAttribute('image');
    const caption = this.getAttribute('caption');
    
    const imgElement = this.shadowRoot.querySelector('img');
    
    if (image) {
      imgElement.src = image;
      if (caption) imgElement.alt = caption;
    }
  }
  
  setupEventListeners() {
    const galleryItem = this.shadowRoot.querySelector('.gallery-item');
    
    const emitClickEvent = () => {
      const event = new CustomEvent('dsm-gallery-item-click', {
        bubbles: true,
        composed: true,
        detail: {
          image: this.getAttribute('image'),
          caption: this.getAttribute('caption')
        }
      });
      this.dispatchEvent(event);
    };
    
    galleryItem.addEventListener('click', emitClickEvent);
    galleryItem.addEventListener('touchend', (e) => {
      // Prevent quick double-tap zoom on mobile
      e.preventDefault();
      emitClickEvent();
    });
    galleryItem.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        emitClickEvent();
      }
    });
  }
}

customElements.define('dsm-gallery', DsmGallery);
customElements.define('dsm-gallery-item', DsmGalleryItem);
