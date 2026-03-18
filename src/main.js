import './style.css'

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

const wrapper = document.getElementById("scrollWrapper");
const track = document.getElementById("imageTrack");

if (wrapper && track) {
  const items = Array.from(track.querySelectorAll(".carousel-item"));

  if (items.length > 0) {
    wrapper.addEventListener("mousemove", (e) => {
      const rect = wrapper.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mousePercent = Math.max(0, Math.min(1, mouseX / rect.width));
      const activeIndex = mousePercent * (items.length - 1);
      const maxRotation = 55;

      items.forEach((item, index) => {
        const distance = index - activeIndex;
        const absDistance = Math.abs(distance);
        const translateZ = Math.max(-250, 100 - (absDistance * 50));
        let rotateY = -distance * 15; 
        
        rotateY = Math.max(-maxRotation, Math.min(maxRotation, rotateY));

        const sign = Math.sign(distance);
        let translateX = distance * 15;
        
        if (absDistance > 0) {
            translateX += sign * (40 / (absDistance + 0.4)); 
        }

        item.style.zIndex = Math.round(100 - absDistance * 10);
        item.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
      });
    });

    wrapper.addEventListener("mouseleave", () => {
      items.forEach((item) => {
        item.style.transform = `translateX(0px) translateZ(0px) rotateY(0deg)`;
        item.style.zIndex = 1;
      });
    });
  }
}