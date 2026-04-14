function initSiteBackgroundFx() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  const root = document.createElement("div");
  root.className = "site-fx";
  root.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas");
  canvas.className = "site-fx__rain";
  const ripples = document.createElement("div");
  ripples.className = "site-fx__ripples";
  root.append(canvas, ripples);
  document.body.prepend(root);

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let drops = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.min(130, Math.max(40, Math.floor((w * h) / 11000)));
    drops = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: 8 + Math.random() * 22,
      speed: 5 + Math.random() * 12,
      drift: -0.9 + Math.random() * 1.8,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = "round";
    for (const d of drops) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(236, 232, 248, 0.16)";
      ctx.lineWidth = 1;
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.drift * 5, d.y + d.len);
      ctx.stroke();
      d.y += d.speed * 0.32;
      d.x += d.drift * 0.28;
      if (d.y > h + d.len) {
        d.y = -d.len;
        d.x = Math.random() * w;
      }
      if (d.x < -40) d.x = w + 20;
      else if (d.x > w + 40) d.x = -20;
    }
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(tick);

  document.addEventListener("click", (e) => {
    const r = document.createElement("span");
    r.className = "site-fx__ripple";
    r.style.left = `${e.clientX}px`;
    r.style.top = `${e.clientY}px`;
    ripples.appendChild(r);
    r.addEventListener("animationend", () => r.remove());
  });
}

function initWorkRevealCards() {
  const cards = document.querySelectorAll(".work-reveal");
  cards.forEach((card, index) => {
    const trigger = card.querySelector(".work-reveal__media");
    const description = card.querySelector(".work-reveal__description");
    const toggleButton = card.querySelector("[data-work-reveal-toggle]");
    if (!trigger || !description) return;

    if (!description.id) {
      description.id = `work-reveal-description-${index + 1}`;
    }

    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", description.id);
    trigger.setAttribute("aria-label", "Show or hide description");

    const setOpenState = (isOpen) => {
      card.classList.toggle("is-open", isOpen);
      trigger.setAttribute("aria-expanded", String(isOpen));
      if (toggleButton) {
        toggleButton.setAttribute("aria-expanded", String(isOpen));
        toggleButton.textContent = isOpen ? "Hide text" : "Pop out text";
      }
    };

    const toggleCard = () => {
      const isOpen = !card.classList.contains("is-open");
      setOpenState(isOpen);
    };

    if (toggleButton) {
      toggleButton.setAttribute("aria-controls", description.id);
      toggleButton.setAttribute("aria-expanded", "false");
      toggleButton.addEventListener("click", toggleCard);
    }

    trigger.addEventListener("click", (event) => {
      const clickedControl = event.target.closest(
        "a, button, input, textarea, select, label, iframe"
      );
      if (clickedControl) return;
      const isOpen = card.classList.toggle("is-open");
      setOpenState(isOpen);
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleCard();
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initSiteBackgroundFx();
  initWorkRevealCards();

  const randomWorkTrigger = document.querySelector("[data-random-work]");
  if (randomWorkTrigger) {
    const workTargets = [
      "artwork.html#artwork-glitch-art",
      "artwork.html#artwork-album-cover",
      "artwork.html#artwork-vector-art",
      "artwork.html#artwork-digital-animation",
      "artwork.html#artwork-drawn-from-sketchbook",
      "videos.html#video-single-channel-1",
      "videos.html#video-single-channel-2",
      "videos.html#video-single-channel-3",
      "videos.html#video-abstract-video",
      "videos.html#video-double-channel",
      "coding.html#coding-creative-coding",
      "coding.html#coding-art-74-portfolio",
    ];

    const goToRandomWork = () => {
      const randomIndex = Math.floor(Math.random() * workTargets.length);
      window.location.href = workTargets[randomIndex];
    };

    randomWorkTrigger.addEventListener("click", goToRandomWork);
    randomWorkTrigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToRandomWork();
      }
    });
  }

  const carousel = document.querySelector(".featured-carousel");
  if (carousel) {
    const slides = carousel.querySelectorAll(".featured-carousel__slide");
    if (slides.length >= 2) {
      let index = 0;
      const intervalMs = 4500;
      window.setInterval(() => {
        slides[index].classList.remove("is-active");
        index = (index + 1) % slides.length;
        slides[index].classList.add("is-active");
      }, intervalMs);
    }
  }

  document.querySelectorAll(".artwork-carousel").forEach((root) => {
    const slides = root.querySelectorAll(".artwork-carousel__slide");
    const prevBtn = root.querySelector(".artwork-carousel__btn--prev");
    const nextBtn = root.querySelector(".artwork-carousel__btn--next");
    const statusEl = root.querySelector(".artwork-carousel__status");
    if (!slides.length || !prevBtn || !nextBtn) return;

    let index = 0;
    const total = slides.length;

    function showSlide(nextIndex) {
      slides[index].classList.remove("is-active");
      slides[index].setAttribute("aria-hidden", "true");
      index = (nextIndex + total) % total;
      slides[index].classList.add("is-active");
      slides[index].setAttribute("aria-hidden", "false");
      if (statusEl) statusEl.textContent = `${index + 1} / ${total}`;
    }

    prevBtn.addEventListener("click", () => showSlide(index - 1));
    nextBtn.addEventListener("click", () => showSlide(index + 1));

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        showSlide(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        showSlide(index + 1);
      }
    });
    root.tabIndex = 0;
  });
});
