/**
 * Diamond Star Motors Website
 * Main application script
 */

// Define a helper function to wait for custom elements to be defined
function waitForCustomElements(elementNames, callback) {
  const promises = elementNames.map(name => 
    customElements.whenDefined(name)
  );
  
  Promise.all(promises).then(callback);
}

// Wait until components are confirmed to be loaded
document.addEventListener('components-loaded', initApp);

function initApp() {
  console.log('Initializing application...');
  
  // Initialize app-wide features
  initLazyLoading();
  initSmoothScrolling();
  initPrecursorsVehicleCards();
  initCommunitySection();
  initLegacySection();
  initFactorySection();
  initMobileOptimizations();
  
  // Fix timeline animation issues
  initTimeline();

  // Add extra fonts for shadow DOM if needed
  ensureFontsInShadowDOM();
  
  console.log('Application initialized successfully');
}

/**
 * Ensure fonts are loaded in shadow DOM contexts
 */
function ensureFontsInShadowDOM() {
  // Get all shadow roots
  const shadowRoots = [];
  document.querySelectorAll('*').forEach(el => {
    if (el.shadowRoot) shadowRoots.push(el.shadowRoot);
  });
  
  // Create a style for icons if needed
  shadowRoots.forEach(root => {
    const hasIcons = root.querySelector('.fa, .fas, .fab, .far, .fal');
    if (hasIcons) {
      const style = document.createElement('style');
      style.textContent = `
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
      `;
      root.appendChild(style);
    }
  });
}

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          
          // If there's a srcset attribute, load that too
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          img.onload = function() {
            img.removeAttribute('data-src');
            img.removeAttribute('data-srcset');
            img.classList.add('loaded');
          };
          
          imageObserver.unobserve(img);
        }
      });
    }, { threshold: 0.1, rootMargin: '200px' });
    
    lazyImages.forEach(img => {
      imageObserver.observe(img);
    });
  } else {
    // Fallback for browsers without Intersection Observer
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      if (img.dataset.srcset) {
        img.srcset = img.dataset.srcset;
      }
      img.classList.add('loaded');
    });
  }
}

/**
 * Initialize smooth scrolling for links
 */
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        const headerOffset = 70;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // Set focus to target for better accessibility
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus({preventScroll: true});
      }
    });
  });
}

/**
 * Handle the precursors section cards (non-web-component versions)
 */
function initPrecursorsVehicleCards() {
  const precursorCards = document.querySelectorAll('#precursors .vehicle-card');
  
  if (precursorCards.length > 0 && window.matchMedia('(hover: hover)').matches) {
    precursorCards.forEach(card => {
      let requestId;
      
      card.addEventListener('mousemove', function(e) {
        if (requestId) {
          cancelAnimationFrame(requestId);
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
      
      card.addEventListener('mouseleave', function() {
        if (requestId) {
          cancelAnimationFrame(requestId);
          requestId = null;
        }
        card.style.transform = 'translateY(-10px)';
        setTimeout(() => {
          card.style.transform = '';
        }, 300);
      });
    });
  }
}

/**
 * Initialize the community section (testimonials)
 */
function initCommunitySection() {
  const testimonials = document.querySelector('.testimonials');
  if (testimonials) {
    testimonials.setAttribute('tabindex', '0');
    testimonials.setAttribute('role', 'region');
    testimonials.setAttribute('aria-label', 'Testimonials');
    
    testimonials.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowRight') {
        this.scrollBy({left: 350, behavior: 'smooth'});
      } else if (e.key === 'ArrowLeft') {
        this.scrollBy({left: -350, behavior: 'smooth'});
      }
    });
  }
}

/**
 * Initialize the legacy section
 */
function initLegacySection() {
  const legacySection = document.querySelector('.legacy-section');
  if (legacySection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.legacy-image').forEach((image, index) => {
            setTimeout(() => {
              image.classList.add('reveal');
            }, index * 200);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(legacySection);
  }
}

/**
 * Initialize the factory section
 */
function initFactorySection() {
  const factorySection = document.querySelector('.factory-section');
  if (factorySection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.querySelectorAll('.factory-card').forEach((card, index) => {
            setTimeout(() => {
              card.classList.add('reveal');
            }, index * 150);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(factorySection);
  }
}

/**
 * Initialize timeline component specifically
 */
function initTimeline() {
  const timeline = document.querySelector('dsm-timeline');
  if (timeline) {
    const timelineItems = timeline.querySelectorAll('dsm-timeline-item');
    console.log(`Found ${timelineItems.length} timeline items`);
    
    // Ensure timeline items are animated
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          timelineItems.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('animate');
            }, index * 150);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    
    observer.observe(timeline);
  }
}

/**
 * Initialize mobile-specific optimizations
 */
function initMobileOptimizations() {
  // Check if we're on a mobile device
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  if (isMobile) {
    // Optimize images for mobile by loading smaller versions
    document.querySelectorAll('img[data-src]').forEach(img => {
      if (img.dataset.mobileSrc) {
        img.dataset.src = img.dataset.mobileSrc;
      }
    });
    
    // Add touch feedback to interactive elements - mobile only
    document.querySelectorAll('a, button, [role="button"]').forEach(el => {
      el.addEventListener('touchstart', function() {
        this.classList.add('touch-active');
      }, {passive: true});
      
      el.addEventListener('touchend', function() {
        this.classList.remove('touch-active');
      }, {passive: true});
    });
    
    // Add mobile class for targeting
    document.documentElement.classList.add('mobile');
    
    // Improve scrolling performance
    optimizeScrolling();
  } else {
    // Desktop specific enhancements
    document.documentElement.classList.add('desktop');
    
    // Add desktop-specific class for wider layouts
    document.body.classList.add('desktop-wide');
    
    // Ensure desktop layout elements have proper width
    document.querySelectorAll('.vehicle-cards, .gallery-grid, .factory-grid').forEach(grid => {
      if (window.innerWidth >= 1200) {
        grid.classList.add('desktop-grid');
      }
    });
  }
  
  // Listen for orientation changes - only relevant for mobile
  if (isMobile) {
    window.addEventListener('orientationchange', handleOrientationChange);
  }
  
  // Handle window resize to maintain proper desktop widths
  window.addEventListener('resize', handleResize);
}

/**
 * Handle device orientation changes
 */
function handleOrientationChange() {
  // Wait for the orientation change to complete
  setTimeout(() => {
    // Adjust the viewport for the new orientation
    document.querySelectorAll('.hero, .gallery-grid').forEach(element => {
      element.style.height = ''; // Reset heights
    });
    
    // Force recalculation of any position: fixed elements
    document.querySelectorAll('.back-to-top, dsm-navbar').forEach(el => {
      el.style.transform = 'translateZ(0)'; // Force repaint
    });
  }, 300);
}

/**
 * Handle window resize events
 */
function handleResize() {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  if (!isMobile) {
    // Reset any vehicle card heights on desktop
    document.querySelectorAll('.vehicle-card').forEach(card => {
      card.style.height = '500px';
    });
    
    // Ensure proper grid layouts on desktop
    if (window.innerWidth >= 1200) {
      document.querySelectorAll('.vehicle-cards, .gallery-grid, .factory-grid').forEach(grid => {
        grid.classList.add('desktop-grid');
      });
    }
  }
}

/**
 * Optimize scrolling performance on mobile
 */
function optimizeScrolling() {
  // Use passive event listeners for better scroll performance
  let supportsPassive = false;
  try {
    window.addEventListener("test", null, 
      Object.defineProperty({}, "passive", {
        get: function() { supportsPassive = true; return true; }
      })
    );
  } catch(e) {}
  
  const wheelOpt = supportsPassive ? { passive: true } : false;
  
  // Apply passive scrolling to common events
  ['touchstart', 'touchmove', 'wheel'].forEach(eventName => {
    document.addEventListener(eventName, function() {}, wheelOpt);
  });
  
  // Throttle scroll events to improve performance
  let lastScrollTime = 0;
  window.addEventListener('scroll', function() {
    const now = Date.now();
    if (now - lastScrollTime > 100) { // 100ms throttle
      lastScrollTime = now;
      // Pause heavy animations during scrolling
      document.body.classList.add('is-scrolling');
      
      clearTimeout(window.scrollTimeout);
      window.scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 200);
    }
  }, wheelOpt);
}

/**
 * Create stylesheet for CSS animations and transitions
 */
(function createAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .reveal {
      animation: fadeIn 0.6s ease-out forwards;
    }
    
    .factory-card, .legacy-image {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.4s ease, transform 0.4s ease;
      will-change: opacity, transform;
    }
    
    .factory-card.reveal, .legacy-image.reveal {
      opacity: 1;
      transform: translateY(0);
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
    
    img.loaded {
      transition: opacity 0.3s ease;
    }
    
    /* Add reduced motion support for accessibility */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }
    
    /* Ensure desktop grid styles */
    .desktop-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
    }
    
    /* Make sure desktop is wide */
    body.desktop-wide .section {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    /* Fix vehicle cards on desktop */
    @media (min-width: 992px) {
      .vehicle-cards {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)) !important;
      }
      
      .factory-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

/**
 * Update images to be responsive for different screen sizes
 */
(function updateImagesForResponsiveness() {
  document.addEventListener('DOMContentLoaded', () => {
    const standardImages = document.querySelectorAll('img:not([srcset]):not([data-src])');
    standardImages.forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.includes('picsum.photos')) {
        // Extract the ID and original dimensions to build responsive variants
        const match = src.match(/\/id\/(\d+)\/(\d+)\/(\d+)/);
        if (match) {
          const [, id, width, height] = match;
          const aspectRatio = height / width;
          
          // Build srcset for responsive images
          const smallWidth = Math.min(width, 600);
          const mediumWidth = Math.min(width, 1200);
          const smallHeight = Math.round(smallWidth * aspectRatio);
          const mediumHeight = Math.round(mediumWidth * aspectRatio);
          
          // Add mobile-specific source for potential optimization
          const mobileWidth = Math.min(width, 480);
          const mobileHeight = Math.round(mobileWidth * aspectRatio);
          
          // Convert to data-srcset for lazy loading
          img.setAttribute('data-src', src);
          img.setAttribute('data-mobile-src', `https://picsum.photos/id/${id}/${mobileWidth}/${mobileHeight}`);
          img.setAttribute('data-srcset', `
            https://picsum.photos/id/${id}/${smallWidth}/${smallHeight} ${smallWidth}w,
            https://picsum.photos/id/${id}/${mediumWidth}/${mediumHeight} ${mediumWidth}w,
            ${src} ${width}w
          `);
          
          // Desktop-first approach for sizes
          img.setAttribute('sizes', '(max-width: 480px) 95vw, (max-width: 768px) 85vw, (max-width: 1200px) 50vw, 33vw');
          
          // Set a low-res placeholder but only apply blur on mobile devices
          const placeholderWidth = 20;
          const placeholderHeight = Math.round(placeholderWidth * aspectRatio);
          img.src = `https://picsum.photos/id/${id}/${placeholderWidth}/${placeholderHeight}`;
          
          // Only apply blur effect on mobile for better performance
          if (window.matchMedia('(max-width: 768px)').matches) {
            img.style.filter = 'blur(10px)';
            img.style.transition = 'filter 0.3s ease';
          }
          
          img.classList.add('lazy');
          
          // Remove blur filter when the image loads
          img.onload = function() {
            if (this.src !== this.getAttribute('data-src')) {
              // This is just the placeholder
              return;
            }
            this.style.filter = 'none';
          };
        }
      }
    });
  });
})();
