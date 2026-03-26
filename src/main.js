import './style.css'

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

// --- Projects Smooth Scroll & Exact Center Alignment ---
const scrollParent = document.querySelector('.js-scroll-parent');
const scrollTrack = document.querySelector('.js-scroll-track');

if (scrollParent && scrollTrack) {
  let currentProgress = 0;
  let targetProgress = 0;
  let isAnimating = false;
  let itemData = [];

  const items = Array.from(scrollTrack.children);

  items.forEach(item => {
    item.style.position = 'relative';
  });

  const updateTarget = () => {
    const rect = scrollParent.getBoundingClientRect();
    const scrollableHeight = rect.height - window.innerHeight;
    
    let progress = -rect.top / scrollableHeight;
    targetProgress = Math.max(0, Math.min(1, progress));

    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(renderScroll);
    }
  };

  const calculateLayout = () => {
    if (items.length === 0) return;
    
    // Zásadní oprava: resetování jakýchkoliv transformací před měřením,
    // aby nám scale a translate nerozbil reálné fyzické souřadnice elementů.
    scrollTrack.style.transform = 'none';
    items.forEach(item => {
      const img = item.querySelector('img');
      if (img) img.style.transform = 'none';
    });
    
    void scrollTrack.offsetWidth; // vynucení překreslení DOMu

    const trackRect = scrollTrack.getBoundingClientRect();

    itemData = items.map(item => {
      const itemRect = item.getBoundingClientRect();
      return {
        element: item,
        img: item.querySelector('img'),
        // Přesná fyzická vzdálenost středu elementu od začátku celého kontejneru
        centerOffset: (itemRect.left - trackRect.left) + (itemRect.width / 2)
      };
    });
    
    updateTarget();
  };

  const renderScroll = () => {
    currentProgress += (targetProgress - currentProgress) * 0.08;

    const firstCenter = itemData[0].centerOffset;
    const lastCenter = itemData[itemData.length - 1].centerOffset;
    const totalDistance = lastCenter - firstCenter;
    
    const currentCenterTarget = firstCenter + (currentProgress * totalDistance);
    const viewportCenter = window.innerWidth / 2;
    
    const translateX = viewportCenter - currentCenterTarget;
    
    scrollTrack.style.transform = `translate3d(${translateX}px, 0px, 0px)`;

    itemData.forEach((data) => {
      if (!data.img) return;

      const itemCenterOnScreen = data.centerOffset + translateX;
      const distance = Math.abs(itemCenterOnScreen - viewportCenter);

      let scale = 1;
      let zIndex = 1;

      if (distance < viewportCenter) {
        const intensity = Math.max(0, 1 - (distance / viewportCenter));
        // Lehčí scale efekt pro plynulejší pocit (8 % navíc)
        scale = 1 + (intensity * 0.08);
        zIndex = Math.round(10 + intensity * 10); 
      }

      data.img.style.transformOrigin = 'center center';
      data.img.style.transform = `scale(${scale})`;
      data.element.style.zIndex = zIndex;
    });

    if (Math.abs(targetProgress - currentProgress) > 0.0001) {
      requestAnimationFrame(renderScroll);
    } else {
      currentProgress = targetProgress;
      isAnimating = false;
    }
  };

  window.addEventListener('scroll', updateTarget, { passive: true });
  window.addEventListener('resize', calculateLayout);
  window.addEventListener('load', calculateLayout);

  calculateLayout();
}