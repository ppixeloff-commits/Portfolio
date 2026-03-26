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

// --- Projects section ---
const projectsSection = document.getElementById('projects');
const firstImageWrapper = document.getElementById('first-image-wrapper');
const firstImage = document.getElementById('first-image');
const projectsTitle = document.getElementById('projects-title');

if (projectsSection && firstImageWrapper) {
  const onScroll = () => {
    const rect = projectsSection.getBoundingClientRect();
    const startOffset = window.innerHeight * 0.4; 
    
    let progress = (startOffset - rect.top) / startOffset;
    progress = Math.max(0, Math.min(1, progress));

    const scale = 0.6 + (0.4 * progress);
    const borderRadius = 40 * (1 - progress);

    firstImageWrapper.style.transform = `scale(${scale})`;
    
    if (firstImage) {
      firstImage.style.borderRadius = `${borderRadius}px`;
    }

    if (projectsTitle) {
      projectsTitle.style.opacity = 1 - (progress * 2);
      projectsTitle.style.transform = `translateY(${progress * -50}px)`;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}