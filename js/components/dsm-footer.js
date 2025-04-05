class DsmFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Roboto:wght@300;400;500;700&display=swap');
        
        :host {
          display: block;
          background-color: #1a1a1a;
          color: white;
          padding: 80px 5% 30px;
          margin-top: 0;
          position: relative;
        }
        
        /* Remove the top margin and decorative separator since we're using the spacer */
        :host::before {
          display: none;
        }
        
        .footer-content {
          display: flex;
          flex-wrap: wrap;
          gap: 4rem;
          justify-content: space-between;
          max-width: 1400px;
          margin: 0 auto;
          padding: 2em;
        }
        
        .footer-info {
          flex: 1;
          min-width: 300px;
        }
        
        .footer-logo {
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .footer-logo-symbol {
          position: relative;
          width: 40px;
          height: 40px;
        }
        
        .footer-diamond {
          position: absolute;
          width: 30px;
          height: 30px;
          background-color: #d42f2f;
          transform: rotate(45deg);
          top: 5px;
          left: 5px;
        }
        
        .footer-star {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 16px;
        }
        
        .footer-logo-text {
          margin-left: 10px;
        }
        
        .footer-logo-text h3 {
          font-family: 'Orbitron', sans-serif;
          font-size: 1.2rem;
          letter-spacing: 1px;
          margin: 0;
        }
        
        .footer-logo-text span {
          font-size: 0.7rem;
          opacity: 0.7;
        }
        
        .footer-info p {
          margin-bottom: 1.5rem;
          line-height: 1.7;
        }
        
        .footer-social {
          display: flex;
          gap: 1rem;
        }
        
        .social-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        
        .social-icon:hover {
          background-color: #d42f2f;
          transform: translateY(-5px);
        }
        
        .social-icon i {
          font-size: 1.2rem;
        }
        
        .footer-links {
          flex: 1;
          min-width: 200px;
        }
        
        .footer-links h3 {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          position: relative;
          padding-bottom: 0.5rem;
        }
        
        .footer-links h3::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background-color: #d42f2f;
        }
        
        .footer-links ul {
          list-style: none;
        }
        
        .footer-links li {
          margin-bottom: 0.8rem;
        }
        
        .footer-links a {
          color: white;
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-block;
        }
        
        .footer-links a:hover {
          color: #d42f2f;
          transform: translateX(5px);
        }
        
        .footer-newsletter {
          flex: 1;
          min-width: 300px;
        }
        
        .footer-newsletter h3 {
          font-size: 1.2rem;
          margin-bottom: 1.5rem;
          position: relative;
          padding-bottom: 0.5rem;
        }
        
        .footer-newsletter h3::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background-color: #d42f2f;
        }
        
        .footer-newsletter p {
          margin-bottom: 1.5rem;
          line-height: 1.7;
        }
        
        .newsletter-form {
          display: flex;
        }
        
        .newsletter-input {
          flex: 1;
          padding: 12px 15px;
          border: none;
          border-radius: 5px 0 0 5px;
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
          outline: none;
        }
        
        .newsletter-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
        
        .newsletter-btn {
          padding: 12px 20px;
          background-color: #d42f2f;
          color: white;
          border: none;
          border-radius: 0 5px 5px 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .newsletter-btn:hover {
          background-color: #c22020;
        }
        
        .footer-bottom {
          margin-top: 5rem;
          text-align: center;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .copyright {
          font-size: 0.9rem;
          opacity: 0.7;
        }
      </style>
      
      <div class="footer-content">
        <div class="footer-info">
          <div class="footer-logo">
            <div class="footer-logo-symbol">
              <div class="footer-diamond"></div>
              <div class="footer-star">★</div>
            </div>
            <div class="footer-logo-text">
              <h3>DIAMOND STAR MOTORS</h3>
              <span>AUTOMOTIVE LEGEND</span>
            </div>
          </div>
          <p>This website is dedicated to preserving the history and legacy of Diamond Star Motors, a groundbreaking collaboration between Chrysler Corporation and Mitsubishi Motors that produced some of the most iconic performance cars of the 1990s.</p>
          <div class="footer-social">
            <a href="#" class="social-icon"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
            <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social-icon"><i class="fab fa-youtube"></i></a>
          </div>
        </div>
        <div class="footer-links">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#about">About DSM</a></li>
            <li><a href="#timeline">History Timeline</a></li>
            <li><a href="#vehicles">Iconic Vehicles</a></li>
            <li><a href="#factory">Factory Operations</a></li>
            <li><a href="#legacy">DSM Legacy</a></li>
            <li><a href="#gallery">Photo Gallery</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h3>Resources</h3>
          <ul>
            <li><a href="#">DSM Forums</a></li>
            <li><a href="#">Parts Suppliers</a></li>
            <li><a href="#">Restoration Guides</a></li>
            <li><a href="#">Performance Upgrades</a></li>
            <li><a href="#">Technical Specifications</a></li>
            <li><a href="#">Owner's Manuals</a></li>
          </ul>
        </div>
        <div class="footer-newsletter">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for the latest DSM community news, events, and restoration tips.</p>
          <form class="newsletter-form">
            <input type="email" class="newsletter-input" placeholder="Your email address">
            <button type="submit" class="newsletter-btn"><i class="fas fa-paper-plane"></i></button>
          </form>
        </div>
      </div>
      <div class="footer-bottom">
        <p class="copyright">© 2025 Diamond Star Motors Historical Archive. This is an informational website not affiliated with Chrysler or Mitsubishi.</p>
      </div>
    `;
  }
  
  connectedCallback() {
    setTimeout(() => {
      this.setupNewsletterForm();
      this.setupSmoothScrollLinks();
    }, 100);
  }
  
  setupNewsletterForm() {
    const form = this.shadowRoot.querySelector('.newsletter-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = this.shadowRoot.querySelector('.newsletter-input');
        if (input && input.value) {
          // Here you would typically send the email to a server
          // For demo purposes, just show a success message
          alert(`Thank you for subscribing with ${input.value}!`);
          input.value = '';
        }
      });
    }
  }
  
  setupSmoothScrollLinks() {
    const links = this.shadowRoot.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          const headerOffset = 70;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }
}

customElements.define('dsm-footer', DsmFooter);
