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


// const wrapper = document.getElementById("scrollWrapper");
// const track = document.getElementById("imageTrack");

// if (wrapper && track) {
//   const items = Array.from(track.querySelectorAll(".carousel-item"));

//   if (items.length > 0) {
//     wrapper.addEventListener("mousemove", (e) => {
//       const rect = wrapper.getBoundingClientRect();
//       const mouseX = e.clientX - rect.left;
//       const mousePercent = Math.max(0, Math.min(1, mouseX / rect.width));
//       const activeIndex = mousePercent * (items.length - 1);
//       const maxRotation = 55;

//       items.forEach((item, index) => {
//         const distance = index - activeIndex;
//         const absDistance = Math.abs(distance);
//         const translateZ = Math.max(-250, 100 - (absDistance * 50));
//         let rotateY = -distance * 15;

//         rotateY = Math.max(-maxRotation, Math.min(maxRotation, rotateY));

//         const sign = Math.sign(distance);
//         let translateX = distance * 15;

//         if (absDistance > 0) {
//             translateX += sign * (40 / (absDistance + 0.4));
//         }

//         item.style.zIndex = Math.round(100 - absDistance * 10);
//         item.style.transform = `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
//       });
//     });

//     wrapper.addEventListener("mouseleave", () => {
//       items.forEach((item) => {
//         item.style.transform = `translateX(0px) translateZ(0px) rotateY(0deg)`;
//         item.style.zIndex = 1;
//       });
//     });
//   }
// }