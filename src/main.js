import './style.css'

// Smooth scrolling

const lenis = new Lenis({
  duration: 1.5, 
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
  direction: 'vertical', 
  gestureDirection: 'vertical', 
  smooth: true,
  mouseMultiplier: 1,
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// --- Utility & Navbar ---
document.getElementById('year').textContent = new Date().getFullYear();

const btn = document.getElementById('mobile-menu-btn');
const menu = document.getElementById('mobile-menu');

if (btn && menu) {
  btn.addEventListener('click', () => {
    menu.classList.toggle('hidden');
  });

  const mobileLinks = menu.querySelectorAll('a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.add('hidden');
    });
  });
}

// --- Tech Stack Carousel Animation ---
const wrapper = document.getElementById("scrollWrapper");
const track = document.getElementById("imageTrack");
const highlight = document.getElementById("activeHighlight");

if (wrapper && track && highlight) {
  const items = Array.from(track.querySelectorAll(".carousel-item"));

  highlight.style.left = "0px";

  if (items.length > 0) {
    let currentX = 0;
    let targetX = 0;
    let isHovering = false;

    function animateHighlight() {
      currentX += (targetX - currentX) * 0.08;

      if (isHovering) {
        highlight.style.transform = `translateX(${currentX}px) translateZ(-10px)`;
      }

      requestAnimationFrame(animateHighlight);
    }

    animateHighlight();

    wrapper.addEventListener("mousemove", (e) => {
      isHovering = true;

      const trackRect = track.getBoundingClientRect();
      const mouseTrackX = e.clientX - trackRect.left;

      const itemWidth = items[0].offsetWidth;
      const firstCenter = items[0].offsetLeft + itemWidth / 2;
      const lastCenter = items[items.length - 1].offsetLeft + itemWidth / 2;

      let mousePercent = (mouseTrackX - firstCenter) / (lastCenter - firstCenter);
      mousePercent = Math.max(0, Math.min(1, mousePercent));

      const activeIndex = mousePercent * (items.length - 1);

      const baseIndex = Math.floor(activeIndex);
      const nextIndex = Math.min(items.length - 1, baseIndex + 1);
      const fraction = activeIndex - baseIndex;

      const left1 = items[baseIndex].offsetLeft;
      const left2 = items[nextIndex].offsetLeft;

      targetX = left1 + (left2 - left1) * fraction;

      highlight.style.opacity = "1";

      items.forEach((item, index) => {
        const distance = index - activeIndex;
        const absDistance = Math.abs(distance);

        const spreadFactor = 20;
        let translateX = distance * spreadFactor;
        const scale = 1 + Math.max(0, (1 - absDistance) * 0.2);

        item.style.transform = `translateX(${translateX}px) scale(${scale})`;
        item.style.zIndex = Math.round(100 - absDistance * 10);
      });
    });

    wrapper.addEventListener("mouseleave", () => {
      isHovering = false;
      highlight.style.opacity = "0";

      items.forEach((item) => {
        item.style.transform = `translateX(0px) translateZ(0px) scale(1)`;
        item.style.zIndex = 1;
      });
    });
  }
}

// --- Initial Page Load Animations ---
setTimeout(() => {
  const homeElements = document.querySelectorAll('.js-anim-home');
  homeElements.forEach((el) => {
    el.classList.add('transition-all', 'duration-1000', 'ease-out');
    
    void el.offsetWidth;

    el.classList.remove('opacity-0', 'translate-x-24');
    el.classList.add('opacity-100', 'translate-x-0');
  });
}, 300);

// --- Intersection Observer pro scroll efekty ---
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.remove('opacity-0', '-translate-x-24');
      entry.target.classList.add('opacity-100', 'translate-x-0');
      observer.unobserve(entry.target);
    }
  });
}, { 
  threshold: 0.2
});
const scrollElements = document.querySelectorAll('.js-scroll-anim');
scrollElements.forEach((el) => observer.observe(el));

// --- Projects Section: Phase 1 (Scaling) & Phase 2 (Carousel) ---

// Grab DOM elements used by the projects section animation flow
const projectsSection = document.getElementById('projects');
const firstImageWrapper = document.getElementById('first-image-wrapper');
const firstImage = document.getElementById('first-image');
const projectsTitle = document.getElementById('projects-title');

// Phase 1 object: handles initial scaling plus title fade logic
const phase1 = {
  isComplete: false,
  
  init() {
    // Register scroll listener once and run initial state update
    if (projectsSection && firstImageWrapper) {
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
      this.onScroll();
    }
  },
  onScroll() {
    // Track how far the user is through phase 1 (scaling + title fade)
    const rect = projectsSection.getBoundingClientRect();
    const startOffset = window.innerHeight * 0.4;
    
    let progress = (startOffset - rect.top) / startOffset;
    progress = Math.max(0, Math.min(1, progress));

    // Scale from 0.6 to 1
    const scale = 0.6 + (0.4 * progress);
    const borderRadius = 40 * (1 - progress);

    firstImageWrapper.style.transform = `scale(${scale})`;

    // Gradually remove image rounding
    if (firstImage) {
      firstImage.style.borderRadius = `${borderRadius}px`;
    }

    // Fade out and move up title with progress
    if (projectsTitle) {
      projectsTitle.style.opacity = Math.max(0, 1 - (progress * 2));
      projectsTitle.style.transform = `translateY(${progress * -50}px)`;
    }

    // Activate phase 2 when phase 1 is essentially complete
    if (progress >= 0.95 && !this.isComplete) {
      this.isComplete = true;
      phase2.activate();
    } else if (progress < 0.95 && this.isComplete) {
      this.isComplete = false;
      phase2.deactivate();
    }
  }
};

// Phase 2: Carousel with wheel control
const phase2 = {
  container: document.getElementById('projects-carousel'),
  track: document.getElementById('projects-track'),
  indicators: document.querySelectorAll('#slide-indicators .indicator'),
  currentSlide: 0,
  totalSlides: document.querySelectorAll('.slide').length,
  isActive: false,
  isTransitioning: false,
  lastWheelTime: 0,
  wheelDebounceDelay: 100, // ms debounce for wheel events
  boundHandleWheel: null, // Store bound handler to ensure proper removal

  // init binds wheel handler and attaches click to indicators
  init() {
    if (!this.track) return;
    this.boundHandleWheel = this.handleWheel.bind(this);
    this.attachIndicatorListeners();
  },

  activate() {
    // Skip if already active
    if (this.isActive) return;
    this.isActive = true;

    // Ensure track is at slide 0 before opening with proper transition
    if (this.track) {
      this.track.style.transition = 'none';
      this.track.style.transform = 'translateX(0%)';
      void this.track.offsetWidth;
      this.track.style.transition = 'transform 700ms cubic-bezier(0.4, 0, 0.2, 1)';
    }

    // Fade in carousel container with smooth opacity transition
    if (this.container) {
      this.container.style.transition = 'opacity 200ms ease-out';
      this.container.style.opacity = '1';
      this.container.style.pointerEvents = 'auto';
    }

    // Stop Lenis while user interacts with carousel
    if (typeof lenis !== 'undefined') {
      lenis.stop();
    }

    // Wheel is captured by the carousel while active
    window.addEventListener('wheel', this.boundHandleWheel, { passive: false });
  },

  // Reusable cleanup applied by both normal deactivate and boundary deactivate
  cleanupAfterDeactivate() {
    // Remove wheel listener immediately
    window.removeEventListener('wheel', this.boundHandleWheel);

    // Fade out carousel smoothly
    if (this.container) {
      this.container.style.transition = 'opacity 500ms ease-out';
      this.container.style.opacity = '0';
      this.container.style.pointerEvents = 'none';
    }

    // Reset carousel track to slide 0 WITHOUT animation while fading out
    if (this.track) {
      this.track.style.transition = 'none';
      this.track.style.transform = 'translateX(0%)';
      void this.track.offsetWidth;
    }

    this.currentSlide = 0;
    this.updateIndicators();
  },

  resumeLenis(delay = 500) {
    if (typeof lenis === 'undefined') return;
    if (delay <= 0) {
      lenis.start();
      return;
    }

    setTimeout(() => {
      if (typeof lenis !== 'undefined') {
        lenis.start();
      }
    }, delay);
  },

  deactivate() {
    if (!this.isActive) return;
    this.isActive = false;

    this.cleanupAfterDeactivate();
    this.resumeLenis(500);
  },

  handleWheel(e) {
    if (!this.isActive || this.isTransitioning) return;

    e.preventDefault();

    // Debounce wheel events based on timestamp
    const now = Date.now();
    if (now - this.lastWheelTime < this.wheelDebounceDelay) {
      return;
    }
    this.lastWheelTime = now;

    const direction = e.deltaY > 0 ? 1 : -1;
    const nextSlide = this.currentSlide + direction;

    // If at boundaries, unlock lenis and resume scrolling
    if ((this.currentSlide === 0 && direction === -1) || 
        (this.currentSlide === this.totalSlides - 1 && direction === 1)) {
      this.deactivateAtBoundary(direction);
      return;
    }

    // Navigate to next slide within bounds
    if (nextSlide >= 0 && nextSlide < this.totalSlides) {
      this.navigateToSlide(nextSlide);
    }
  },

  deactivateAtBoundary(direction) {
    if (!this.isActive) return;
    this.isActive = false;

    this.cleanupAfterDeactivate();

    if (direction === -1) {
      this.resumeLenis(0);
    } else {
      this.resumeLenis(500);
    }
  },

  navigateToSlide(slideIndex) {
    if (this.isTransitioning || slideIndex === this.currentSlide) return;
    if (slideIndex < 0 || slideIndex >= this.totalSlides) return;

    this.isTransitioning = true;
    this.currentSlide = slideIndex;

    this.updateTrack();
    this.updateIndicators();

    // Unlock transition flag after animation completes
    setTimeout(() => {
      this.isTransitioning = false;
    }, 700); // Match CSS transition duration
  },

  updateTrack() {
    if (!this.track) return;
    const offset = -this.currentSlide * 100;
    this.track.style.transform = `translateX(${offset}%)`;
  },

  updateIndicators() {
    this.indicators.forEach((indicator, index) => {
      if (index === this.currentSlide) {
        indicator.classList.add('bg-indigo-500');
        indicator.classList.remove('bg-slate-600', 'hover:bg-slate-500');
      } else {
        indicator.classList.remove('bg-indigo-500');
        indicator.classList.add('bg-slate-600', 'hover:bg-slate-500');
      }
    });
  },

  attachIndicatorListeners() {
    this.indicators.forEach((indicator) => {
      indicator.addEventListener('click', (e) => {
        if (!this.isActive) return;
        const slideIndex = parseInt(e.target.dataset.slide, 10);
        this.navigateToSlide(slideIndex);
      });
    });
  }
};

// Initialize both phases
phase1.init();
phase2.init();